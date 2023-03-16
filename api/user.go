package api

import (
	"fmt"

	"github.com/boojack/corgi/common"
)

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
	OpenID          string         `json:"openId"`
	Role            Role           `json:"role"`
	UserSettingList []*UserSetting `json:"userSettingList"`
}

type UserCreate struct {
	Email        string `json:"email"`
	DisplayName  string `json:"displayName"`
	Password     string `json:"password"`
	PasswordHash string `json:"-"`
	OpenID       string `json:"-"`
	Role         Role   `json:"-"`
}

func (create UserCreate) Validate() error {
	if len(create.Email) < 3 {
		return fmt.Errorf("email is too short, minimum length is 6")
	}
	if !common.ValidateEmail(create.Email) {
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
	ResetOpenID  *bool   `json:"resetOpenId"`
	PasswordHash *string `json:"-"`
	OpenID       *string `json:"-"`
}

type UserFind struct {
	ID *int `json:"id"`

	// Standard fields
	RowStatus *RowStatus `json:"rowStatus"`

	// Domain specific fields
	Email       *string `json:"email"`
	DisplayName *string `json:"displayName"`
	OpenID      *string `json:"openId"`
	Role        *Role   `json:"-"`
}

type UserDelete struct {
	ID int
}
