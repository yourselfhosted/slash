package api

// Role is the type of a role.
type Role string

const (
	// RoleAdmin is the ADMIN role.
	RoleAdmin Role = "ADMIN"
	// RoleUser is the USER role.
	RoleUser Role = "USER"
)

func (e Role) String() string {
	switch e {
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
	Email        string `json:"email"`
	DisplayName  string `json:"displayName"`
	PasswordHash string `json:"-"`
	OpenID       string `json:"openId"`
	Role         Role   `json:"role"`
}

type UserCreate struct {
	Email        string `json:"email"`
	DisplayName  string `json:"displayName"`
	Password     string `json:"password"`
	PasswordHash string `json:"-"`
	OpenID       string `json:"-"`
	Role         Role   `json:"-"`
}
