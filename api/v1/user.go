package v1

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/mail"
	"strconv"

	"github.com/boojack/shortify/store"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

// Role is the type of a role.
type Role string

const (
	// RoleAdmin is the ADMIN role.
	RoleAdmin Role = "ADMIN"
	// RoleUser is the USER role.
	RoleUser Role = "USER"
)

func (r Role) String() string {
	switch r {
	case RoleAdmin:
		return "ADMIN"
	case RoleUser:
		return "USER"
	}
	return "USER"
}

type User struct {
	ID int `json:"id"`

	// Standard fields
	CreatedTs int64     `json:"createdTs"`
	UpdatedTs int64     `json:"updatedTs"`
	RowStatus RowStatus `json:"rowStatus"`

	// Domain specific fields
	Username string `json:"username"`
	Nickname string `json:"nickname"`
	Email    string `json:"email"`
	Role     Role   `json:"role"`
}

type CreateUserRequest struct {
	Username string `json:"username"`
	Nickname string `json:"nickname"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     Role   `json:"-"`
}

func (create CreateUserRequest) Validate() error {
	if len(create.Username) < 3 {
		return fmt.Errorf("username is too short, minimum length is 3")
	}
	if create.Nickname != "" && len(create.Nickname) < 3 {
		return fmt.Errorf("username is too short, minimum length is 3")
	}
	if create.Email != "" && !validateEmail(create.Email) {
		return fmt.Errorf("invalid email format")
	}
	if len(create.Password) < 3 {
		return fmt.Errorf("password is too short, minimum length is 3")
	}

	return nil
}

type PatchUserRequest struct {
	RowStatus   *RowStatus `json:"rowStatus"`
	Email       *string    `json:"email"`
	DisplayName *string    `json:"displayName"`
	Password    *string    `json:"password"`
}

type UserDelete struct {
	ID int
}

func (s *APIV1Service) registerUserRoutes(g *echo.Group) {
	g.GET("/user", func(c echo.Context) error {
		ctx := c.Request().Context()
		list, err := s.Store.ListUsers(ctx, &store.FindUser{})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find user list").SetInternal(err)
		}

		userList := []*User{}
		for _, user := range list {
			userList = append(userList, convertUserFromStore(user))
		}
		return c.JSON(http.StatusOK, userList)
	})

	// GET /api/user/me is used to check if the user is logged in.
	g.GET("/user/me", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing auth session")
		}

		user, err := s.Store.GetUser(ctx, &store.FindUser{
			ID: &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find user").SetInternal(err)
		}

		return c.JSON(http.StatusOK, convertUserFromStore(user))
	})

	g.GET("/user/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted user id").SetInternal(err)
		}

		user, err := s.Store.GetUser(ctx, &store.FindUser{
			ID: &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find user").SetInternal(err)
		}

		return c.JSON(http.StatusOK, convertUserFromStore(user))
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
		if currentUserID != userID {
			return echo.NewHTTPError(http.StatusForbidden, "Access forbidden for current session user").SetInternal(err)
		}

		userPatch := &PatchUserRequest{}
		if err := json.NewDecoder(c.Request().Body).Decode(userPatch); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted patch user request").SetInternal(err)
		}

		updateUser := &store.UpdateUser{
			ID: currentUserID,
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
			updateUser.PasswordHash = &passwordHashStr
		}

		user, err := s.Store.UpdateUser(ctx, updateUser)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update user").SetInternal(err)
		}

		return c.JSON(http.StatusOK, convertUserFromStore(user))
	})

	g.DELETE("/user/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		currentUserID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing user in session")
		}
		currentUser, err := s.Store.GetUser(ctx, &store.FindUser{
			ID: &currentUserID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find user").SetInternal(err)
		}
		if currentUser == nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Current session user not found with ID: %d", currentUserID)).SetInternal(err)
		}
		if currentUser.Role != store.RoleAdmin {
			return echo.NewHTTPError(http.StatusForbidden, "Access forbidden for current session user").SetInternal(err)
		}

		userID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("ID is not a number: %s", c.Param("id"))).SetInternal(err)
		}

		if err := s.Store.DeleteUser(ctx, &store.DeleteUser{
			ID: userID,
		}); err != nil {
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

// convertUserFromStore converts a store user to a user.
func convertUserFromStore(user *store.User) *User {
	return &User{
		ID:        user.ID,
		CreatedTs: user.CreatedTs,
		UpdatedTs: user.UpdatedTs,
		RowStatus: RowStatus(user.RowStatus),
		Username:  user.Username,
		Nickname:  user.Nickname,
		Email:     user.Email,
		Role:      Role(user.Role),
	}
}
