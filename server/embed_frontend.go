package server

import (
	"context"
	"fmt"
	"html/template"
	"net/http"
	"os"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/yourselfhosted/slash/internal/util"
	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/server/profile"
	"github.com/yourselfhosted/slash/store"
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

func (s *FrontendService) Serve(ctx context.Context, e *echo.Echo) {
	// Use echo static middleware to serve the built dist folder.
	// refer: https://github.com/labstack/echo/blob/master/middleware/static.go
	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		HTML5: true,
		Root:  "dist",
		Skipper: func(c echo.Context) bool {
			return util.HasPrefixes(c.Path(), "/api", "/slash.api.v2", "/robots.txt", "/sitemap.xml", "/s/:shortcutName")
		},
	}))

	s.registerRoutes(e)
	s.registerFileRoutes(ctx, e)
}

func (s *FrontendService) registerRoutes(e *echo.Echo) {
	rawIndexHTML := getRawIndexHTML()

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

	e.GET("/c/:collectionName", func(c echo.Context) error {
		ctx := c.Request().Context()
		collectionName := c.Param("collectionName")
		collection, err := s.Store.GetCollection(ctx, &store.FindCollection{
			Name: &collectionName,
		})
		if err != nil {
			return c.HTML(http.StatusOK, rawIndexHTML)
		}
		if collection == nil {
			return c.HTML(http.StatusOK, rawIndexHTML)
		}

		// Inject collection metadata into `index.html`.
		indexHTML := strings.ReplaceAll(rawIndexHTML, "<!-- slash.metadata -->", generateCollectionMetadata(collection))
		return c.HTML(http.StatusOK, indexHTML)
	})
}

func (s *FrontendService) registerFileRoutes(ctx context.Context, e *echo.Echo) {
	instanceURLSetting, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
		Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_INSTANCE_URL,
	})
	if err != nil || instanceURLSetting == nil {
		return
	}
	instanceURL := instanceURLSetting.GetInstanceUrl()
	if instanceURL == "" {
		return
	}

	e.GET("/robots.txt", func(c echo.Context) error {
		robotsTxt := fmt.Sprintf(`User-agent: *
Allow: /
Host: %s
Sitemap: %s/sitemap.xml`, instanceURL, instanceURL)
		return c.String(http.StatusOK, robotsTxt)
	})

	e.GET("/sitemap.xml", func(c echo.Context) error {
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
}

func generateShortcutMetadata(shortcut *storepb.Shortcut) string {
	title, description := shortcut.Title, shortcut.Description
	if shortcut.OgMetadata != nil {
		if shortcut.OgMetadata.Title != "" {
			title = shortcut.OgMetadata.Title
		}
		if shortcut.OgMetadata.Description != "" {
			description = shortcut.OgMetadata.Description
		}
	}

	metadataList := []string{
		fmt.Sprintf(`<meta name="description" content="%s" />`, template.HTMLEscapeString(description)),
		fmt.Sprintf(`<meta property="og:title" content="%s" />`, template.HTMLEscapeString(title)),
		fmt.Sprintf(`<meta property="og:description" content="%s" />`, template.HTMLEscapeString(description)),
		fmt.Sprintf(`<meta property="og:image" content="%s" />`, template.HTMLEscapeString(shortcut.OgMetadata.Image)),
		`<meta property="og:type" content="website" />`,
		// Twitter related metadata.
		fmt.Sprintf(`<meta name="twitter:title" content="%s" />`, template.HTMLEscapeString(title)),
		fmt.Sprintf(`<meta name="twitter:description" content="%s" />`, template.HTMLEscapeString(description)),
		fmt.Sprintf(`<meta name="twitter:image" content="%s" />`, template.HTMLEscapeString(shortcut.OgMetadata.Image)),
		`<meta name="twitter:card" content="summary_large_image" />`,
		fmt.Sprintf(`<meta property="og:url" content="%s" />`, template.HTMLEscapeString(shortcut.Link)),
	}
	return strings.Join(metadataList, "\n")
}

func generateCollectionMetadata(collection *storepb.Collection) string {
	metadataList := []string{
		fmt.Sprintf(`<meta name="description" content="%s" />`, template.HTMLEscapeString(collection.Description)),
		fmt.Sprintf(`<meta property="og:title" content="%s" />`, template.HTMLEscapeString(collection.Title)),
		fmt.Sprintf(`<meta property="og:description" content="%s" />`, template.HTMLEscapeString(collection.Description)),
		`<meta property="og:type" content="website" />`,
		// Twitter related metadata.
		fmt.Sprintf(`<meta name="twitter:title" content="%s" />`, template.HTMLEscapeString(collection.Title)),
		fmt.Sprintf(`<meta name="twitter:description" content="%s" />`, template.HTMLEscapeString(collection.Description)),
	}
	return strings.Join(metadataList, "\n")
}

func getRawIndexHTML() string {
	bytes, _ := os.ReadFile("dist/index.html")
	return string(bytes)
}
