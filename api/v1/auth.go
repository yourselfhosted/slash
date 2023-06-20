package v1

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/boojack/shortify/server/auth"
	"github.com/boojack/shortify/store"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

var (
	userIDContextKey = "user-id"
)

func getUserIDContextKey() string {
	return userIDContextKey
}

type SignUpRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type SignInRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (s *APIV1Service) registerAuthRoutes(g *echo.Group, secret string) {
	g.POST("/auth/signin", func(c echo.Context) error {
		ctx := c.Request().Context()
		signin := &SignInRequest{}
		if err := json.NewDecoder(c.Request().Body).Decode(signin); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted signin request").SetInternal(err)
		}

		user, err := s.Store.GetUser(ctx, &store.FindUser{
			Username: &signin.Username,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Failed to find user by username %s", signin.Username)).SetInternal(err)
		}
		if user == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, fmt.Sprintf("User not found with username %s", signin.Username))
		} else if user.RowStatus == store.Archived {
			return echo.NewHTTPError(http.StatusForbidden, fmt.Sprintf("User has been archived with username %s", signin.Username))
		}

		// Compare the stored hashed password, with the hashed version of the password that was received.
		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(signin.Password)); err != nil {
			// If the two passwords don't match, return a 401 status.
			return echo.NewHTTPError(http.StatusUnauthorized, "Incorrect password").SetInternal(err)
		}

		if err := auth.GenerateTokensAndSetCookies(c, user, secret); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate tokens").SetInternal(err)
		}
		return c.JSON(http.StatusOK, user)
	})

	g.POST("/auth/signup", func(c echo.Context) error {
		ctx := c.Request().Context()
		signup := &SignUpRequest{}
		if err := json.NewDecoder(c.Request().Body).Decode(signup); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted signup request").SetInternal(err)
		}

		user := &store.User{
			Username: signup.Username,
			Nickname: signup.Username,
		}
		passwordHash, err := bcrypt.GenerateFromPassword([]byte(signup.Password), bcrypt.DefaultCost)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate password hash").SetInternal(err)
		}
		user.PasswordHash = string(passwordHash)

		existingUsers, err := s.Store.ListUsers(ctx, &store.FindUser{})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find existing users").SetInternal(err)
		}
		// The first user to sign up is an admin by default.
		if len(existingUsers) == 0 {
			user.Role = store.RoleAdmin
		} else {
			user.Role = store.RoleUser
		}

		user, err = s.Store.CreateUser(ctx, user)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create user").SetInternal(err)
		}

		if err := auth.GenerateTokensAndSetCookies(c, user, secret); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate tokens").SetInternal(err)
		}

		return c.JSON(http.StatusOK, user)
	})

	g.POST("/auth/logout", func(c echo.Context) error {
		auth.RemoveTokensAndCookies(c)
		c.Response().WriteHeader(http.StatusOK)
		return nil
	})
}
