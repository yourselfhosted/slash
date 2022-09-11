package api

// Visibility is the type of a visibility.
type Visibility string

const (
	// VisibilityWorkspace is the WORKSPACE visibility.
	VisibilityWorkspace Visibility = "WORKSPACE"
	// VisibilityPrivite is the PRIVATE visibility.
	VisibilityPrivite Visibility = "PRIVATE"
)

func (e Visibility) String() string {
	switch e {
	case VisibilityWorkspace:
		return "WORKSPACE"
	case VisibilityPrivite:
		return "PRIVATE"
	}
	return "PRIVATE"
}

type Shortcut struct {
	ID int `json:"id"`

	// Standard fields
	CreatorID   int       `json:"creatorId"`
	CreatedTs   int64     `json:"createdTs"`
	UpdatedTs   int64     `json:"updatedTs"`
	WorkspaceID int       `json:"workspaceId"`
	RowStatus   RowStatus `json:"rowStatus"`

	// Domain specific fields
	Name       string     `json:"name"`
	Link       string     `json:"link"`
	Visibility Visibility `json:"visibility"`
}

type ShortcutCreate struct {
	// Standard fields
	CreatorID   int
	WorkspaceID int `json:"workspaceId"`

	// Domain specific fields
	Name       string     `json:"name"`
	Link       string     `json:"link"`
	Visibility Visibility `json:"visibility"`
}

type ShortcutPatch struct {
	ID int

	// Standard fields
	RowStatus *RowStatus `json:"rowStatus"`

	// Domain specific fields
	Name       *string     `json:"name"`
	Link       *string     `json:"link"`
	Visibility *Visibility `json:"visibility"`
}

type ShortcutFind struct {
	ID *int

	// Standard fields
	CreatorID   *int `json:"creatorId"`
	WorkspaceID *int `json:"workspaceId"`

	// Domain specific fields
	Name       *string     `json:"name"`
	Link       *string     `json:"link"`
	Visibility *Visibility `json:"visibility"`
}

type ShortcutDelete struct {
	ID int
}
