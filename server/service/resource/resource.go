package resource

import (
	"bytes"
	"fmt"
	"net/http"
	"os"

	"github.com/h2non/filetype"
	"github.com/labstack/echo/v4"

	"github.com/yourselfhosted/slash/server/profile"
	"github.com/yourselfhosted/slash/store"
)

const (
	resourceRelativePath = "resources"
)

type ResourceService struct {
	Profile *profile.Profile
	Store   *store.Store
}

func NewResourceService(profile *profile.Profile, store *store.Store) *ResourceService {
	return &ResourceService{
		Profile: profile,
		Store:   store,
	}
}

// Register registers the resource service to the echo server.
func (*ResourceService) Register(g *echo.Group) {
	g.GET("/resources/:id", func(c echo.Context) error {
		resourceID := c.Param("resourceId")
		resourcePath := fmt.Sprintf("%s/%s", resourceRelativePath, resourceID)
		buf, err := os.ReadFile(resourcePath)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to read the local resource: %s", resourcePath)).SetInternal(err)
		}

		kind, err := filetype.Match(buf)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to match the local resource: %s", resourcePath)).SetInternal(err)
		}
		resourceMimeType := kind.MIME.Value
		c.Response().Writer.Header().Set(echo.HeaderCacheControl, "max-age=31536000, immutable")
		c.Response().Writer.Header().Set(echo.HeaderContentSecurityPolicy, "default-src 'self'")
		c.Response().Writer.Header().Set("Content-Disposition", fmt.Sprintf(`filename="%s"`, resourceID))
		return c.Stream(http.StatusOK, resourceMimeType, bytes.NewReader(buf))
	})
}
