package server

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/boojack/shortify/api"
	"github.com/google/uuid"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

func (s *Server) registerAuthRoutes(g *echo.Group) {
	g.POST("/auth/signin", func(c echo.Context) error {
		ctx := c.Request().Context()
		signin := &api.Signin{}
		if err := json.NewDecoder(c.Request().Body).Decode(signin); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted signin request").SetInternal(err)
		}

		userFind := &api.UserFind{
			Email: &signin.Email,
		}
		user, err := s.Store.FindUser(ctx, userFind)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Failed to find user by email %s", signin.Email)).SetInternal(err)
		}
		if user == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, fmt.Sprintf("User not found with email %s", signin.Email))
		} else if user.RowStatus == api.Archived {
			return echo.NewHTTPError(http.StatusForbidden, fmt.Sprintf("User has been archived with email %s", signin.Email))
		}

		// Compare the stored hashed password, with the hashed version of the password that was received.
		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(signin.Password)); err != nil {
			// If the two passwords don't match, return a 401 status.
			return echo.NewHTTPError(http.StatusUnauthorized, "Incorrect password").SetInternal(err)
		}

		if err = setUserSession(c, user); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to set signin session").SetInternal(err)
		}
		return c.JSON(http.StatusOK, composeResponse(user))
	})

	g.POST("/auth/signup", func(c echo.Context) error {
		ctx := c.Request().Context()
		signup := &api.Signup{}
		if err := json.NewDecoder(c.Request().Body).Decode(signup); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted signup request").SetInternal(err)
		}

		userCreate := &api.UserCreate{
			Email:       signup.Email,
			DisplayName: signup.DisplayName,
			Password:    signup.Password,
			OpenID:      genUUID(),
		}
		if err := userCreate.Validate(); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid user create format.").SetInternal(err)
		}

		passwordHash, err := bcrypt.GenerateFromPassword([]byte(signup.Password), bcrypt.DefaultCost)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate password hash").SetInternal(err)
		}
		userCreate.PasswordHash = string(passwordHash)

		existingUsers, err := s.Store.FindUserList(ctx, &api.UserFind{})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find existing users").SetInternal(err)
		}
		// The first user to sign up is an admin by default.
		if len(existingUsers) == 0 {
			userCreate.Role = api.RoleAdmin
		} else {
			userCreate.Role = api.RoleUser
		}

		user, err := s.Store.CreateUser(ctx, userCreate)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create user").SetInternal(err)
		}

		err = setUserSession(c, user)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to set signup session").SetInternal(err)
		}

		return c.JSON(http.StatusOK, composeResponse(user))
	})

	g.POST("/auth/logout", func(c echo.Context) error {
		err := removeUserSession(c)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to set logout session").SetInternal(err)
		}

		c.Response().WriteHeader(http.StatusOK)
		return nil
	})
}

func genUUID() string {
	return uuid.New().String()
}
