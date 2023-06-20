package v1

import (
	"fmt"
	"net/http"
	"net/mail"

	"github.com/boojack/shortify/store"
	"github.com/labstack/echo/v4"
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
	Email           string         `json:"email"`
	DisplayName     string         `json:"displayName"`
	PasswordHash    string         `json:"-"`
	Role            Role           `json:"role"`
	UserSettingList []*UserSetting `json:"userSettingList"`
}

type UserCreate struct {
	Email        string `json:"email"`
	DisplayName  string `json:"displayName"`
	Password     string `json:"password"`
	PasswordHash string `json:"-"`
	Role         Role   `json:"-"`
}

func (create UserCreate) Validate() error {
	if len(create.Email) < 3 {
		return fmt.Errorf("email is too short, minimum length is 6")
	}
	if !validateEmail(create.Email) {
		return fmt.Errorf("invalid email format")
	}
	if len(create.Password) < 3 {
		return fmt.Errorf("password is too short, minimum length is 6")
	}

	return nil
}

type UserPatch struct {
	ID int

	// Standard fields
	RowStatus *RowStatus `json:"rowStatus"`

	// Domain specific fields
	Email        *string `json:"email"`
	DisplayName  *string `json:"displayName"`
	Password     *string `json:"password"`
	PasswordHash *string `json:"-"`
}

type UserDelete struct {
	ID int
}

func (s *APIV1Service) registerUserRoutes(g *echo.Group) {
	g.GET("/user", func(c echo.Context) error {
		return c.String(200, "GET /user")
	})

	// GET /api/user/me is used to check if the user is logged in.
	g.GET("/user/me", func(c echo.Context) error {
		ctx := c.Request().Context()
		userID, ok := c.Get(getUserIDContextKey()).(int)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing auth session")
		}

		user, err := s.Store.GetUserV1(ctx, &store.FindUser{
			ID: &userID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to find user").SetInternal(err)
		}

		return c.JSON(http.StatusOK, user)
	})
}

// validateEmail validates the email.
func validateEmail(email string) bool {
	if _, err := mail.ParseAddress(email); err != nil {
		return false
	}
	return true
}
