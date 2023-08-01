package v1

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/mail"
	"strconv"

	"github.com/boojack/slash/store"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

const (
	// BotID is the id of bot.
	BotID = 0
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
	Email    string `json:"email"`
	Nickname string `json:"nickname"`
	Role     Role   `json:"role"`
}

type CreateUserRequest struct {
	Email    string `json:"email"`
	Nickname string `json:"nickname"`
	Password string `json:"password"`
	Role     Role   `json:"role"`
}

func (create CreateUserRequest) Validate() error {
	if create.Email != "" && !validateEmail(create.Email) {
		return fmt.Errorf("invalid email format")
	}
	if create.Nickname != "" && len(create.Nickname) < 3 {
		return fmt.Errorf("nickname is too short, minimum length is 3")
	}
	if len(create.Password) < 3 {
		return fmt.Errorf("password is too short, minimum length is 3")
	}

	return nil
}

type PatchUserRequest struct {
	RowStatus *RowStatus `json:"rowStatus"`
	Email     *string    `json:"email"`
	Nickname  *string    `json:"nickname"`
	Password  *string    `json:"password"`
	Role      *Role      `json:"role"`
}

func (s *APIV1Service) registerUserRoutes(g *echo.Group) {
	g.POST("/user", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(UserIDContextKey).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing auth session")
		}
		currentUser, err := s.Store.GetUser(ctx, &store.FindUser{
			ID: &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find user by id").SetInternal(err)
		}
		if currentUser == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing auth session")
		}
		if currentUser.Role != store.RoleAdmin {
			return echo.NewHTTPError(http.StatusUnauthorized, "Unauthorized to create user")
		}

		userCreate := &CreateUserRequest{}
		if err := json.NewDecoder(c.Request().Body).Decode(userCreate); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Malformatted post user request").SetInternal(err)
		}
		if err := userCreate.Validate(); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid user create format").SetInternal(err)
		}

		passwordHash, err := bcrypt.GenerateFromPassword([]byte(userCreate.Password), bcrypt.DefaultCost)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate password hash").SetInternal(err)
		}

		user, err := s.Store.CreateUser(ctx, &store.User{
			Role:         store.Role(userCreate.Role),
			Email:        userCreate.Email,
			Nickname:     userCreate.Nickname,
			PasswordHash: string(passwordHash),
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create user").SetInternal(err)
		}

		userMessage := convertUserFromStore(user)
		return c.JSON(http.StatusOK, userMessage)
	})

	g.GET("/user", func(c echo.Context) error {
		ctx := c.Request().Context()
		list, err := s.Store.ListUsers(ctx, &store.FindUser{})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Failed to list users, err: %s", err)).SetInternal(err)
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
		userID, ok := c.Get(UserIDContextKey).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "missing auth session")
		}

		user, err := s.Store.GetUser(ctx, &store.FindUser{
			ID: &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Failed to find user, err: %s", err)).SetInternal(err)
		}

		return c.JSON(http.StatusOK, convertUserFromStore(user))
	})

	g.GET("/user/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("user id is not a number: %s", c.Param("id"))).SetInternal(err)
		}

		user, err := s.Store.GetUser(ctx, &store.FindUser{
			ID: &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Failed to find user, err: %s", err)).SetInternal(err)
		}

		return c.JSON(http.StatusOK, convertUserFromStore(user))
	})

	g.PATCH("/user/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("user id is not a number: %s", c.Param("id"))).SetInternal(err)
		}
		currentUserID, ok := c.Get(UserIDContextKey).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "missing user in session")
		}
		currentUser, err := s.Store.GetUser(ctx, &store.FindUser{
			ID: &currentUserID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "failed to find current user").SetInternal(err)
		}
		if currentUser == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "missing user in session")
		}
		if currentUser.ID != userID && currentUser.Role != store.RoleAdmin {
			return echo.NewHTTPError(http.StatusForbidden, "access forbidden for current session user").SetInternal(err)
		}

		userPatch := &PatchUserRequest{}
		if err := json.NewDecoder(c.Request().Body).Decode(userPatch); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("failed to decode request body, err: %s", err)).SetInternal(err)
		}

		updateUser := &store.UpdateUser{
			ID: userID,
		}
		if userPatch.Email != nil {
			if !validateEmail(*userPatch.Email) {
				return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("invalid email format: %s", *userPatch.Email))
			}
			updateUser.Email = userPatch.Email
		}
		if userPatch.Nickname != nil {
			updateUser.Nickname = userPatch.Nickname
		}
		if userPatch.Password != nil && *userPatch.Password != "" {
			passwordHash, err := bcrypt.GenerateFromPassword([]byte(*userPatch.Password), bcrypt.DefaultCost)
			if err != nil {
				return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to hash password, err: %s", err)).SetInternal(err)
			}

			passwordHashStr := string(passwordHash)
			updateUser.PasswordHash = &passwordHashStr
		}
		if userPatch.RowStatus != nil {
			rowStatus := store.RowStatus(*userPatch.RowStatus)
			updateUser.RowStatus = &rowStatus
		}
		if userPatch.Role != nil {
			adminRole := store.RoleAdmin
			adminUsers, err := s.Store.ListUsers(ctx, &store.FindUser{
				Role: &adminRole,
			})
			if err != nil {
				return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to list admin users, err: %s", err)).SetInternal(err)
			}
			if len(adminUsers) == 1 && adminUsers[0].ID == userID && *userPatch.Role != RoleAdmin {
				return echo.NewHTTPError(http.StatusBadRequest, "cannot remove admin role from the last admin user")
			}
			role := store.Role(*userPatch.Role)
			updateUser.Role = &role
		}

		user, err := s.Store.UpdateUser(ctx, updateUser)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Failed to update user, err: %s", err)).SetInternal(err)
		}

		return c.JSON(http.StatusOK, convertUserFromStore(user))
	})

	g.DELETE("/user/:id", func(c echo.Context) error {
		ctx := c.Request().Context()
		currentUserID, ok := c.Get(UserIDContextKey).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "missing user in session")
		}
		currentUser, err := s.Store.GetUser(ctx, &store.FindUser{
			ID: &currentUserID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to find current session user, err: %s", err)).SetInternal(err)
		}
		if currentUser == nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("current session user not found with ID: %d", currentUserID)).SetInternal(err)
		}
		if currentUser.Role != store.RoleAdmin {
			return echo.NewHTTPError(http.StatusForbidden, "access forbidden for current session user").SetInternal(err)
		}

		userID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("user id is not a number: %s", c.Param("id"))).SetInternal(err)
		}
		user, err := s.Store.GetUser(ctx, &store.FindUser{
			ID: &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Failed to find user, err: %s", err)).SetInternal(err)
		}
		if user == nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("user not found with ID: %d", userID)).SetInternal(err)
		}
		if user.Role == store.RoleAdmin {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("cannot delete admin user with ID: %d", userID)).SetInternal(err)
		}

		if err := s.Store.DeleteUser(ctx, &store.DeleteUser{
			ID: userID,
		}); err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Failed to delete user, err: %s", err)).SetInternal(err)
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
		Email:     user.Email,
		Nickname:  user.Nickname,
		Role:      Role(user.Role),
	}
}
