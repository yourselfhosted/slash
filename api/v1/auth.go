package v1

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/boojack/slash/api/v1/auth"
	"github.com/boojack/slash/store"

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
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("malformatted signin request, err: %s", err))
		}

		user, err := s.Store.GetUser(ctx, &store.FindUser{
			Email: &signin.Email,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to find user by email %s", signin.Email)).SetInternal(err)
		}
		if user == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, fmt.Sprintf("user not found with email %s", signin.Email))
		} else if user.RowStatus == store.Archived {
			return echo.NewHTTPError(http.StatusForbidden, fmt.Sprintf("user has been archived with email %s", signin.Email))
		}

		// Compare the stored hashed password, with the hashed version of the password that was received.
		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(signin.Password)); err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "unmatched email and password")
		}

		if err := auth.GenerateTokensAndSetCookies(c, user, secret); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to generate tokens, err: %s", err)).SetInternal(err)
		}
		return c.JSON(http.StatusOK, convertUserFromStore(user))
	})

	g.POST("/auth/signup", func(c echo.Context) error {
		ctx := c.Request().Context()
		disallowSignUpSetting, err := s.Store.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
			Key: store.WorkspaceDisallowSignUp,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to get workspace setting, err: %s", err)).SetInternal(err)
		}
		if disallowSignUpSetting != nil && disallowSignUpSetting.Value == "true" {
			return echo.NewHTTPError(http.StatusForbidden, "sign up has been disabled")
		}

		signup := &SignUpRequest{}
		if err := json.NewDecoder(c.Request().Body).Decode(signup); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("malformatted signup request, err: %s", err)).SetInternal(err)
		}

		passwordHash, err := bcrypt.GenerateFromPassword([]byte(signup.Password), bcrypt.DefaultCost)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate password hash").SetInternal(err)
		}

		create := &store.User{
			Email:        signup.Email,
			Nickname:     signup.Nickname,
			PasswordHash: string(passwordHash),
		}
		existingUsers, err := s.Store.ListUsers(ctx, &store.FindUser{})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to find existing users, err: %s", err)).SetInternal(err)
		}
		// The first user to sign up is an admin by default.
		if len(existingUsers) == 0 {
			create.Role = store.RoleAdmin
		} else {
			create.Role = store.RoleUser
		}

		user, err := s.Store.CreateUser(ctx, create)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to create user, err: %s", err)).SetInternal(err)
		}

		if err := auth.GenerateTokensAndSetCookies(c, user, secret); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to generate tokens, err: %s", err)).SetInternal(err)
		}

		return c.JSON(http.StatusOK, convertUserFromStore(user))
	})

	g.POST("/auth/logout", func(c echo.Context) error {
		auth.RemoveTokensAndCookies(c)
		c.Response().WriteHeader(http.StatusOK)
		return nil
	})
}
