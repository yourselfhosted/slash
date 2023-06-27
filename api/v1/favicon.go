package v1

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"go.deanishe.net/favicon"
)

func (*APIV1Service) registerFaviconRoutes(g *echo.Group) {
	g.GET("/favicon", func(c echo.Context) error {
		url := c.QueryParam("url")
		icons, err := favicon.Find(url)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find favicon")
		}

		availableIcons := []*favicon.Icon{}
		for _, icon := range icons {
			if icon.Width == icon.Height {
				availableIcons = append(availableIcons, icon)
			}
		}
		if len(availableIcons) == 0 {
			return echo.NewHTTPError(http.StatusNotFound, "No favicon found")
		}
		return c.JSON(http.StatusOK, availableIcons[0].URL)
	})
}
