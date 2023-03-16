package api

import "github.com/boojack/shortify/server/profile"

type SystemStatus struct {
	Profile *profile.Profile `json:"profile"`
}
