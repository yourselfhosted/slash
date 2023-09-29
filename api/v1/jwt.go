package v1

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"

	"github.com/boojack/slash/api/auth"
	"github.com/boojack/slash/internal/util"
	storepb "github.com/boojack/slash/proto/gen/store"
	"github.com/boojack/slash/store"
)

const (
	// The key name used to store user id in the context
	// user id is extracted from the jwt token subject field.
	userIDContextKey = "user-id"
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
	// Check the HTTP request header first.
	accessToken, _ := extractTokenFromHeader(c)
	if accessToken == "" {
		// Check the cookie.
		cookie, _ := c.Cookie(auth.AccessTokenCookieName)
		if cookie != nil {
			accessToken = cookie.Value
		}
	}
	return accessToken
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

		accessToken := findAccessToken(c)
		if accessToken == "" {
			// When the request is not authenticated, we allow the user to access the shortcut endpoints for those public shortcuts.
			if util.HasPrefixes(path, "/s/") && method == http.MethodGet {
				return next(c)
			}
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing access token")
		}

		userID, err := getUserIDFromAccessToken(accessToken, secret)
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "Invalid or expired access token")
		}

		accessTokens, err := s.Store.GetUserAccessTokens(ctx, userID)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get user access tokens.").WithInternal(err)
		}
		if !validateAccessToken(accessToken, accessTokens) {
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
		c.Set(userIDContextKey, userID)
		return next(c)
	}
}

func getUserIDFromAccessToken(accessToken, secret string) (int32, error) {
	claims := &auth.ClaimsMessage{}
	_, err := jwt.ParseWithClaims(accessToken, claims, func(t *jwt.Token) (any, error) {
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
		return 0, errors.Wrap(err, "Invalid or expired access token")
	}
	// We either have a valid access token or we will attempt to generate new access token.
	userID, err := util.ConvertStringToInt32(claims.Subject)
	if err != nil {
		return 0, errors.Wrap(err, "Malformed ID in the token")
	}
	return userID, nil
}

func validateAccessToken(accessTokenString string, userAccessTokens []*storepb.AccessTokensUserSetting_AccessToken) bool {
	for _, userAccessToken := range userAccessTokens {
		if accessTokenString == userAccessToken.AccessToken {
			return true
		}
	}
	return false
}
