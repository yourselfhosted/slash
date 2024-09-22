package frontend

import (
	"context"
	"embed"
	"fmt"
	"io/fs"
	"log/slog"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/pkg/errors"
	"google.golang.org/protobuf/encoding/protojson"

	"github.com/yourselfhosted/slash/internal/util"
	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/server/common"
	"github.com/yourselfhosted/slash/server/profile"
	"github.com/yourselfhosted/slash/store"
)

//go:embed dist
var embeddedFiles embed.FS

const (
	headerMetadataPlaceholder = "<!-- slash.metadata -->"
)

type FrontendService struct {
	Profile *profile.Profile
	Store   *store.Store
}

func NewFrontendService(profile *profile.Profile, store *store.Store) *FrontendService {
	return &FrontendService{
		Profile: profile,
		Store:   store,
	}
}

func (s *FrontendService) Serve(_ context.Context, e *echo.Echo) {
	// Use echo static middleware to serve the built dist folder.
	// Reference: https://github.com/labstack/echo/blob/master/middleware/static.go
	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		HTML5:      true,
		Filesystem: getFileSystem("dist"),
		Skipper: func(c echo.Context) bool {
			return util.HasPrefixes(c.Path(), "/api", "/slash.api.v1", "/s/:shortcutName", "/c/:collectionName")
		},
	}))

	assetsGroup := e.Group("assets")
	// Use echo gzip middleware to compress the response.
	// Reference: https://echo.labstack.com/docs/middleware/gzip
	assetsGroup.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Skipper: func(c echo.Context) bool {
			return util.HasPrefixes(c.Path(), "/api", "/slash.api.v1", "/s/:shortcutName", "/c/:collectionName")
		},
		Level: 5,
	}))
	assetsGroup.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Response().Header().Set(echo.HeaderCacheControl, "max-age=31536000, immutable")
			return next(c)
		}
	})
	assetsGroup.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		HTML5:      true,
		Filesystem: getFileSystem("dist/assets"),
		Skipper: func(c echo.Context) bool {
			return util.HasPrefixes(c.Path(), "/api", "/slash.api.v1", "/s/:shortcutName", "/c/:collectionName")
		},
	}))

	s.registerRoutes(e)
}

func (s *FrontendService) registerRoutes(e *echo.Echo) {
	rawIndexHTML := getRawIndexHTML()

	e.GET("/s/:shortcutName", func(c echo.Context) error {
		ctx := c.Request().Context()
		shortcutName := c.Param("shortcutName")
		shortcut, err := s.Store.GetShortcut(ctx, &store.FindShortcut{
			Name: &shortcutName,
		})
		// If any error occurs or the shortcut is not found, return the raw `index.html`.
		if err != nil || shortcut == nil {
			return c.HTML(http.StatusOK, rawIndexHTML)
		}

		// Create shortcut view activity.
		if err := s.createShortcutViewActivity(ctx, c.Request(), shortcut); err != nil {
			slog.Warn("failed to create shortcut view activity", slog.String("error", err.Error()))
		}

		// Inject shortcut metadata into `index.html`.
		indexHTML := strings.ReplaceAll(rawIndexHTML, headerMetadataPlaceholder, generateShortcutMetadata(shortcut).String())
		return c.HTML(http.StatusOK, indexHTML)
	})

	e.GET("/c/:collectionName", func(c echo.Context) error {
		ctx := c.Request().Context()
		collectionName := c.Param("collectionName")
		collection, err := s.Store.GetCollection(ctx, &store.FindCollection{
			Name: &collectionName,
		})
		// If any error occurs or the collection is not found, return the raw `index.html`.
		if err != nil || collection == nil {
			return c.HTML(http.StatusOK, rawIndexHTML)
		}

		// Inject collection metadata into `index.html`.
		indexHTML := strings.ReplaceAll(rawIndexHTML, headerMetadataPlaceholder, generateCollectionMetadata(collection).String())
		return c.HTML(http.StatusOK, indexHTML)
	})
}

func (s *FrontendService) createShortcutViewActivity(ctx context.Context, request *http.Request, shortcut *storepb.Shortcut) error {
	ip := getReadUserIP(request)
	referer := request.Header.Get("Referer")
	userAgent := request.Header.Get("User-Agent")
	params := map[string]*storepb.ActivityShorcutViewPayload_ValueList{}
	for key, values := range request.URL.Query() {
		params[key] = &storepb.ActivityShorcutViewPayload_ValueList{Values: values}
	}
	payload := &storepb.ActivityShorcutViewPayload{
		ShortcutId: shortcut.Id,
		Ip:         ip,
		Referer:    referer,
		UserAgent:  userAgent,
		Params:     params,
	}
	payloadStr, err := protojson.Marshal(payload)
	if err != nil {
		return errors.Wrap(err, "Failed to marshal activity payload")
	}
	activity := &store.Activity{
		CreatorID: common.BotID,
		Type:      store.ActivityShortcutView,
		Level:     store.ActivityInfo,
		Payload:   string(payloadStr),
	}
	_, err = s.Store.CreateActivity(ctx, activity)
	if err != nil {
		return errors.Wrap(err, "Failed to create activity")
	}
	return nil
}

func getReadUserIP(r *http.Request) string {
	ip := r.Header.Get("X-Real-Ip")
	if ip == "" {
		ip = r.Header.Get("X-Forwarded-For")
	}
	if ip == "" {
		ip = r.RemoteAddr
	}
	return ip
}

func getFileSystem(path string) http.FileSystem {
	fs, err := fs.Sub(embeddedFiles, path)
	if err != nil {
		panic(err)
	}

	return http.FS(fs)
}

func generateShortcutMetadata(shortcut *storepb.Shortcut) *Metadata {
	metadata := getDefaultMetadata()
	title, description := shortcut.Title, shortcut.Description
	if shortcut.OgMetadata != nil {
		if shortcut.OgMetadata.Title != "" {
			title = shortcut.OgMetadata.Title
		}
		if shortcut.OgMetadata.Description != "" {
			description = shortcut.OgMetadata.Description
		}
		metadata.ImageURL = shortcut.OgMetadata.Image
	}
	metadata.Title = title
	metadata.Description = description
	return metadata
}

func generateCollectionMetadata(collection *storepb.Collection) *Metadata {
	metadata := getDefaultMetadata()
	metadata.Title = collection.Title
	metadata.Description = collection.Description
	return metadata
}

func getRawIndexHTML() string {
	bytes, _ := embeddedFiles.ReadFile("dist/index.html")
	return string(bytes)
}

type Metadata struct {
	Title       string
	Description string
	ImageURL    string
}

func getDefaultMetadata() *Metadata {
	return &Metadata{
		Title: "Slash",
	}
}

func (m *Metadata) String() string {
	metadataList := []string{
		fmt.Sprintf(`<title>%s</title>`, m.Title),
		fmt.Sprintf(`<meta name="description" content="%s" />`, m.Description),
		fmt.Sprintf(`<meta property="og:title" content="%s" />`, m.Title),
		fmt.Sprintf(`<meta property="og:description" content="%s" />`, m.Description),
		fmt.Sprintf(`<meta property="og:image" content="%s" />`, m.ImageURL),
		`<meta property="og:type" content="website" />`,
		// Twitter related fields.
		fmt.Sprintf(`<meta property="twitter:title" content="%s" />`, m.Title),
		fmt.Sprintf(`<meta property="twitter:description" content="%s" />`, m.Description),
		fmt.Sprintf(`<meta property="twitter:image" content="%s" />`, m.ImageURL),
	}
	return strings.Join(metadataList, "\n")
}
