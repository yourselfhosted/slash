package server

import (
	"embed"
	"fmt"
	"io/fs"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/yourselfhosted/slash/internal/util"
	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/server/profile"
	"github.com/yourselfhosted/slash/store"
)

//go:embed dist
var embeddedFiles embed.FS

//go:embed dist/index.html
var rawIndexHTML string

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

func (s *FrontendService) Serve(e *echo.Echo) {
	// Use echo static middleware to serve the built dist folder.
	// refer: https://github.com/labstack/echo/blob/master/middleware/static.go
	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Skipper:    defaultRequestSkipper,
		HTML5:      true,
		Filesystem: getFileSystem("dist"),
	}))

	assetsGroup := e.Group("assets")
	assetsGroup.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Skipper: defaultRequestSkipper,
		Level:   5,
	}))
	assetsGroup.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Response().Header().Set(echo.HeaderCacheControl, "max-age=31536000, immutable")
			return next(c)
		}
	})
	assetsGroup.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Skipper:    defaultRequestSkipper,
		HTML5:      true,
		Filesystem: getFileSystem("dist/assets"),
	}))
	s.registerRoutes(e)
}

func (s *FrontendService) registerRoutes(e *echo.Echo) {
	e.GET("/robots.txt", func(c echo.Context) error {
		ctx := c.Request().Context()
		instanceURLSetting, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
			Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_INSTANCE_URL,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get instance URL system setting").SetInternal(err)
		}
		if instanceURLSetting == nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Instance URL system setting is not set")
		}
		instanceURL := instanceURLSetting.GetInstanceUrl()
		robotsTxt := fmt.Sprintf(`User-agent: *
Allow: /
Host: %s
Sitemap: %s/sitemap.xml`, instanceURL, instanceURL)
		return c.String(http.StatusOK, robotsTxt)
	})

	e.GET("/sitemap.xml", func(c echo.Context) error {
		ctx := c.Request().Context()
		instanceURLSetting, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
			Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_INSTANCE_URL,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get instance URL system setting").SetInternal(err)
		}
		if instanceURLSetting == nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Instance URL system setting is not set")
		}

		instanceURL := instanceURLSetting.GetInstanceUrl()
		urlsets := []string{}
		// Append shortcut list.
		shortcuts, err := s.Store.ListShortcuts(ctx, &store.FindShortcut{
			VisibilityList: []store.Visibility{store.VisibilityPublic},
		})
		if err != nil {
			return err
		}
		for _, shortcut := range shortcuts {
			urlsets = append(urlsets, fmt.Sprintf(`<url><loc>%s/s/%s</loc></url>`, instanceURL, shortcut.Name))
		}
		// Append collection list.
		collections, err := s.Store.ListCollections(ctx, &store.FindCollection{
			VisibilityList: []store.Visibility{store.VisibilityPublic},
		})
		if err != nil {
			return err
		}
		for _, collection := range collections {
			urlsets = append(urlsets, fmt.Sprintf(`<url><loc>%s/c/%s</loc></url>`, instanceURL, collection.Name))
		}

		sitemap := fmt.Sprintf(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">%s</urlset>`, strings.Join(urlsets, "\n"))
		return c.XMLBlob(http.StatusOK, []byte(sitemap))
	})

	e.GET("/s/:shortcutName", func(c echo.Context) error {
		ctx := c.Request().Context()
		shortcutName := c.Param("shortcutName")
		shortcut, err := s.Store.GetShortcut(ctx, &store.FindShortcut{
			Name: &shortcutName,
		})
		if err != nil {
			return c.HTML(http.StatusOK, rawIndexHTML)
		}
		if shortcut == nil {
			return c.HTML(http.StatusOK, rawIndexHTML)
		}

		// Inject shortcut metadata into `index.html`.
		indexHTML := strings.ReplaceAll(rawIndexHTML, "<!-- slash.metadata -->", generateShortcutMetadata(shortcut))
		return c.HTML(http.StatusOK, indexHTML)
	})
}

func generateShortcutMetadata(shortcut *storepb.Shortcut) string {
	metadataList := []string{
		fmt.Sprintf(`<title>%s</title>`, shortcut.OgMetadata.Title),
		fmt.Sprintf(`<meta name="description" content="%s" />`, shortcut.OgMetadata.Description),
		fmt.Sprintf(`<meta property="og:title" content="%s" />`, shortcut.OgMetadata.Title),
		fmt.Sprintf(`<meta property="og:description" content="%s" />`, shortcut.OgMetadata.Description),
		fmt.Sprintf(`<meta property="og:image" content="%s" />`, shortcut.OgMetadata.Image),
		`<meta property="og:type" content="website" />`,
		// Twitter related metadata.
		fmt.Sprintf(`<meta name="twitter:title" content="%s" />`, shortcut.OgMetadata.Title),
		fmt.Sprintf(`<meta name="twitter:description" content="%s" />`, shortcut.OgMetadata.Description),
		fmt.Sprintf(`<meta name="twitter:image" content="%s" />`, shortcut.OgMetadata.Image),
		`<meta name="twitter:card" content="summary_large_image" />`,
		fmt.Sprintf(`<meta property="og:url" content="%s" />`, shortcut.Link),
	}
	return strings.Join(metadataList, "\n")
}

func getFileSystem(path string) http.FileSystem {
	fs, err := fs.Sub(embeddedFiles, path)
	if err != nil {
		panic(err)
	}

	return http.FS(fs)
}

func defaultRequestSkipper(c echo.Context) bool {
	path := c.Path()
	return util.HasPrefixes(path, "/api/")
}
