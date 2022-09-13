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
	Name            string         `json:"name"`
	PasswordHash    string         `json:"-"`
	OpenID          string         `json:"openId"`
	UserSettingList []*UserSetting `json:"userSettingList"`
}

type UserCreate struct {
	Email        string `json:"email"`
	Name         string `json:"name"`
	Password     string `json:"password"`
	PasswordHash string
	OpenID       string
}

func (create UserCreate) Validate() error {
	if !common.ValidateEmail(create.Email) {
		return fmt.Errorf("invalid email format")
	}
	if len(create.Email) < 6 {
		return fmt.Errorf("email is too short, minimum length is 6")
	}
	if len(create.Password) < 6 {
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
	Name         *string `json:"name"`
	Password     *string `json:"password"`
	ResetOpenID  *bool   `json:"resetOpenId"`
	PasswordHash *string
	OpenID       *string
}

type UserFind struct {
	ID *int `json:"id"`

	// Standard fields
	RowStatus *RowStatus `json:"rowStatus"`

	// Domain specific fields
	Email  *string `json:"email"`
	Name   *string `json:"name"`
	OpenID *string `json:"openId"`
}

type UserDelete struct {
	ID int
}
