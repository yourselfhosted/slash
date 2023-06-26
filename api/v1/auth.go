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

type SignInRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SignUpRequest struct {
	Nickname string `json:"nickname"`
	Email    string `json:"email"`
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
			Email: &signin.Email,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Failed to find user by email %s", signin.Email)).SetInternal(err)
		}
		if user == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, fmt.Sprintf("User not found with email %s", signin.Email))
		} else if user.RowStatus == store.Archived {
			return echo.NewHTTPError(http.StatusForbidden, fmt.Sprintf("User has been archived with email %s", signin.Email))
		}

		// Compare the stored hashed password, with the hashed version of the password that was received.
		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(signin.Password)); err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "Unmatched email and password").SetInternal(err)
		}

		if err := auth.GenerateTokensAndSetCookies(c, user, secret); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate tokens").SetInternal(err)
		}
		return c.JSON(http.StatusOK, convertUserFromStore(user))
	})

	g.POST("/auth/signup", func(c echo.Context) error {
		ctx := c.Request().Context()
		disallowSignUpSetting, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
			Key: WorkspaceDisallowSignUp.String(),
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get workspace setting").SetInternal(err)
		}
		if disallowSignUpSetting != nil && disallowSignUpSetting.Value == "true" {
			return echo.NewHTTPError(http.StatusForbidden, "Sign up is not allowed")
		}

		signup := &SignUpRequest{}
		if err := json.NewDecoder(c.Request().Body).Decode(signup); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted signup request").SetInternal(err)
		}

		passwordHash, err := bcrypt.GenerateFromPassword([]byte(signup.Password), bcrypt.DefaultCost)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate password hash").SetInternal(err)
		}

		create := &store.User{
			Email:        signup.Email,
			Nickname:     signup.Nickname,
			PasswordHash: string(passwordHash),
		}
		existingUsers, err := s.Store.ListUsers(ctx, &store.FindUser{})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find existing users").SetInternal(err)
		}
		// The first user to sign up is an admin by default.
		if len(existingUsers) == 0 {
			create.Role = store.RoleAdmin
		} else {
			create.Role = store.RoleUser
		}

		user, err := s.Store.CreateUser(ctx, create)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create user").SetInternal(err)
		}

		if err := auth.GenerateTokensAndSetCookies(c, user, secret); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate tokens").SetInternal(err)
		}

		return c.JSON(http.StatusOK, convertUserFromStore(user))
	})

	g.POST("/auth/logout", func(c echo.Context) error {
		auth.RemoveTokensAndCookies(c)
		c.Response().WriteHeader(http.StatusOK)
		return nil
	})
}
