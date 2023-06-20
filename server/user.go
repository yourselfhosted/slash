package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/mail"
	"strconv"

	"github.com/boojack/shortify/api"
	"github.com/google/uuid"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

func (s *Server) registerUserRoutes(g *echo.Group) {
	g.GET("/user", func(c echo.Context) error {
		ctx := c.Request().Context()
		userList, err := s.Store.FindUserList(ctx, &api.UserFind{})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch user list").SetInternal(err)
		}

		return c.JSON(http.StatusOK, composeResponse(userList))
	})

	// GET /api/user/me is used to check if the user is logged in.
	g.GET("/user/me", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing auth session")
		}

		userFind := &api.UserFind{
			ID: &userID,
		}
		user, err := s.Store.FindUser(ctx, userFind)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find user").SetInternal(err)
		}

		return c.JSON(http.StatusOK, composeResponse(user))
	})

	g.GET("/user/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted user id").SetInternal(err)
		}

		user, err := s.Store.FindUser(ctx, &api.UserFind{
			ID: &id,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch user").SetInternal(err)
		}

		return c.JSON(http.StatusOK, composeResponse(user))
	})

	g.PATCH("/user/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("ID is not a number: %s", c.Param("id"))).SetInternal(err)
		}
		currentUserID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing user in session")
		}
		currentUser, err := s.Store.FindUser(ctx, &api.UserFind{
			ID: &currentUserID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find user").SetInternal(err)
		}
		if currentUser == nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Current session user not found with ID: %d", currentUserID)).SetInternal(err)
		} else if currentUserID != userID {
			return echo.NewHTTPError(http.StatusForbidden, "Access forbidden for current session user").SetInternal(err)
		}

		userPatch := &api.UserPatch{
			ID: userID,
		}
		if err := json.NewDecoder(c.Request().Body).Decode(userPatch); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted patch user request").SetInternal(err)
		}

		if userPatch.Email != nil && !validateEmail(*userPatch.Email) {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid email format")
		}

		if userPatch.Password != nil && *userPatch.Password != "" {
			passwordHash, err := bcrypt.GenerateFromPassword([]byte(*userPatch.Password), bcrypt.DefaultCost)
			if err != nil {
				return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate password hash").SetInternal(err)
			}

			passwordHashStr := string(passwordHash)
			userPatch.PasswordHash = &passwordHashStr
		}

		if userPatch.ResetOpenID != nil && *userPatch.ResetOpenID {
			uuid := genUUID()
			userPatch.OpenID = &uuid
		}

		user, err := s.Store.PatchUser(ctx, userPatch)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to patch user").SetInternal(err)
		}

		return c.JSON(http.StatusOK, composeResponse(user))
	})

	g.DELETE("/user/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		currentUserID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing user in session")
		}
		currentUser, err := s.Store.FindUser(ctx, &api.UserFind{
			ID: &currentUserID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find user").SetInternal(err)
		}
		if currentUser == nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Current session user not found with ID: %d", currentUserID)).SetInternal(err)
		}

		userID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("ID is not a number: %s", c.Param("id"))).SetInternal(err)
		}

		userDelete := &api.UserDelete{
			ID: userID,
		}
		if err := s.Store.DeleteUser(ctx, userDelete); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to delete user").SetInternal(err)
		}

		return c.JSON(http.StatusOK, true)
	})
}

// validateEmail validates the email.
func validateEmail(email string) bool {
	if _, err := mail.ParseAddress(email); err != nil {
		return false
	}
	return true
}

func genUUID() string {
	return uuid.New().String()
}
