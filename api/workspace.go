package api

type Workspace struct {
	ID int `json:"id"`

	// Standard fields
	CreatorID int       `json:"creatorId"`
	CreatedTs int64     `json:"createdTs"`
	UpdatedTs int64     `json:"updatedTs"`
	RowStatus RowStatus `json:"rowStatus"`

	// Domain specific fields
	Name        string `json:"name"`
	Title       string `json:"title"`
	Description string `json:"description"`

	// Related fields
	WorkspaceUserList []*WorkspaceUser `json:"workspaceUserList"`
}

type WorkspaceCreate struct {
	CreatorID int

	Name        string `json:"name"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type WorkspacePatch struct {
	ID int

	// Standard fields
	RowStatus *RowStatus `json:"rowStatus"`

	// Domain specific fields
	Name        *string `json:"name"`
	Title       *string `json:"title"`
	Description *string `json:"description"`
}

type WorkspaceFind struct {
	ID *int `json:"id"`

	// Standard fields
	RowStatus *RowStatus `json:"rowStatus"`

	// Domain specific fields
	Name *string `json:"name"`

	// Related fields
	MemberID *int
}

type WorkspaceDelete struct {
	ID int
}
