package v1

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/boojack/slash/api/auth"
	"github.com/boojack/slash/internal/util"
	storepb "github.com/boojack/slash/proto/gen/store"
	"github.com/boojack/slash/store"
	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"
)

const (
	// The key name used to store user id in the context
	// user id is extracted from the jwt token subject field.
	UserIDContextKey = "user-id"
)

func extractTokenFromHeader(c echo.Context) (string, error) {
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return "", nil
	}

	authHeaderParts := strings.Fields(authHeader)
	if len(authHeaderParts) != 2 || strings.ToLower(authHeaderParts[0]) != "bearer" {
		return "", errors.New("Authorization header format must be Bearer {token}")
	}

	return authHeaderParts[1], nil
}

func findAccessToken(c echo.Context) string {
	accessToken := ""
	cookie, _ := c.Cookie(auth.AccessTokenCookieName)
	if cookie != nil {
		accessToken = cookie.Value
	}
	if accessToken == "" {
		accessToken, _ = extractTokenFromHeader(c)
	}

	return accessToken
}

func audienceContains(audience jwt.ClaimStrings, token string) bool {
	for _, v := range audience {
		if v == token {
			return true
		}
	}
	return false
}

// JWTMiddleware validates the access token.
func JWTMiddleware(s *APIV1Service, next echo.HandlerFunc, secret string) echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		path := c.Request().URL.Path
		method := c.Request().Method

		// Pass auth and profile endpoints.
		if util.HasPrefixes(path, "/api/v1/auth", "/api/v1/workspace/profile") {
			return next(c)
		}

		token := findAccessToken(c)
		if token == "" {
			// When the request is not authenticated, we allow the user to access the shortcut endpoints for those public shortcuts.
			if util.HasPrefixes(path, "/s/") && method == http.MethodGet {
				return next(c)
			}
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing access token")
		}

		claims := &auth.ClaimsMessage{}
		_, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (any, error) {
			if t.Method.Alg() != jwt.SigningMethodHS256.Name {
				return nil, errors.Errorf("unexpected access token signing method=%v, expect %v", t.Header["alg"], jwt.SigningMethodHS256)
			}
			if kid, ok := t.Header["kid"].(string); ok {
				if kid == "v1" {
					return []byte(secret), nil
				}
			}
			return nil, errors.Errorf("unexpected access token kid=%v", t.Header["kid"])
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, errors.Wrap(err, "Invalid or expired access token"))
		}
		if !audienceContains(claims.Audience, auth.AccessTokenAudienceName) {
			return echo.NewHTTPError(http.StatusUnauthorized, fmt.Sprintf("Invalid access token, audience mismatch, got %q, expected %q.", claims.Audience, auth.AccessTokenAudienceName))
		}

		// We either have a valid access token or we will attempt to generate new access token.
		userID, err := util.ConvertStringToInt32(claims.Subject)
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "Malformed ID in the token.").WithInternal(err)
		}

		accessTokens, err := s.Store.GetUserAccessTokens(ctx, userID)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get user access tokens.").WithInternal(err)
		}
		if !validateAccessToken(token, accessTokens) {
			return echo.NewHTTPError(http.StatusUnauthorized, "Invalid access token.")
		}

		// Even if there is no error, we still need to make sure the user still exists.
		user, err := s.Store.GetUser(ctx, &store.FindUser{
			ID: &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Server error to find user ID: %d", userID)).SetInternal(err)
		}
		if user == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, fmt.Sprintf("Failed to find user ID: %d", userID))
		}

		// Stores userID into context.
		c.Set(UserIDContextKey, userID)
		return next(c)
	}
}

func validateAccessToken(accessTokenString string, userAccessTokens []*storepb.AccessTokensUserSetting_AccessToken) bool {
	for _, userAccessToken := range userAccessTokens {
		if accessTokenString == userAccessToken.AccessToken {
			return true
		}
	}
	return false
}
