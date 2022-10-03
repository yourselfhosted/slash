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

type WorkspaceUser struct {
	WorkspaceID int   `json:"workspaceId"`
	UserID      int   `json:"userId"`
	Role        Role  `json:"role"`
	CreatedTs   int64 `json:"createdTs"`
	UpdatedTs   int64 `json:"updatedTs"`

	// Related fields
	Email string `json:"email"`
	Name  string `json:"name"`
}

type WorkspaceUserUpsert struct {
	WorkspaceID int    `json:"workspaceId"`
	UserID      int    `json:"userId"`
	Role        Role   `json:"role"`
	UpdatedTs   *int64 `json:"updatedTs"`
}

type WorkspaceUserFind struct {
	WorkspaceID *int
	UserID      *int
}

type WorkspaceUserDelete struct {
	WorkspaceID int
	UserID      int
}
