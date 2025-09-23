package swagger

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type SwaggerService struct {
	swaggerSpec string
}

// NewSwaggerService creates a new SwaggerService.
func NewSwaggerService(swaggerSpec string) *SwaggerService {
	return &SwaggerService{
		swaggerSpec: swaggerSpec,
	}
}

// RegisterRoutes registers Swagger UI and spec endpoints
func (s *SwaggerService) RegisterRoutes(e *echo.Echo) {
	// Serve the swagger spec
	e.GET("/api/v1/swagger.yaml", s.serveSwaggerSpec)

	// Serve Swagger UI
	e.GET("/api-docs", s.serveSwaggerUI)

	// Redirect /api-docs/ to /api-docs for convenience
	e.GET("/api-docs/", s.redirectToSwaggerUI)
}

// serveSwaggerSpec serves the raw swagger specification
func (s *SwaggerService) serveSwaggerSpec(c echo.Context) error {
	return c.String(http.StatusOK, s.swaggerSpec)
}

// serveSwaggerUI serves the Swagger UI interface
func (s *SwaggerService) serveSwaggerUI(c echo.Context) error {
	html := `<!DOCTYPE html>
<html>
<head>
    <title>Monotreme API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/api/v1/swagger.yaml',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`
	return c.HTML(http.StatusOK, html)
}

// redirectToSwaggerUI redirects /api-docs/ to /api-docs
func (s *SwaggerService) redirectToSwaggerUI(c echo.Context) error {
	return c.Redirect(http.StatusMovedPermanently, "/api-docs")
}