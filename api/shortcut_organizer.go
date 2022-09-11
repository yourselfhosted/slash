package api

type ShortcutOrganizer struct {
	ShortcutID int
	UserID     int
	Pinned     bool
}

type ShortcutOrganizerFind struct {
	ShortcutID int
	UserID     int
}

type ShortcutOrganizerUpsert struct {
	ShortcutID int
	UserID     int
	Pinned     bool `json:"pinned"`
}
