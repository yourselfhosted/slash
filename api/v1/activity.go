package v1

type ActivityShorcutCreatePayload struct {
	ShortcutID int `json:"shortcutId"`
}

type ActivityShorcutViewPayload struct {
	ShortcutID int    `json:"shortcutId"`
	IP         string `json:"ip"`
	Referer    string `json:"referer"`
	UserAgent  string `json:"userAgent"`
}
