package api

import "github.com/boojack/corgi/server/profile"

type SystemStatus struct {
	Profile *profile.Profile `json:"profile"`
}
