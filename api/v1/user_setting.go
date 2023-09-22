package v1

import (
	"encoding/json"

	"github.com/pkg/errors"
)

type UserSettingKey string

const (
	// UserSettingLocaleKey is the key type for user locale.
	UserSettingLocaleKey UserSettingKey = "locale"
)

// String returns the string format of UserSettingKey type.
func (k UserSettingKey) String() string {
	return string(k)
}

var (
	UserSettingLocaleValue = []string{"en", "zh"}
)

type UserSetting struct {
	UserID int
	Key    UserSettingKey `json:"key"`
	// Value is a JSON string with basic value.
	Value string `json:"value"`
}

type UserSettingUpsert struct {
	UserID int
	Key    UserSettingKey `json:"key"`
	Value  string         `json:"value"`
}

func (upsert UserSettingUpsert) Validate() error {
	if upsert.Key == UserSettingLocaleKey {
		localeValue := "en"
		err := json.Unmarshal([]byte(upsert.Value), &localeValue)
		if err != nil {
			return errors.New("failed to unmarshal user setting locale value")
		}

		invalid := true
		for _, value := range UserSettingLocaleValue {
			if localeValue == value {
				invalid = false
				break
			}
		}
		if invalid {
			return errors.New("invalid user setting locale value")
		}
	} else {
		return errors.New("invalid user setting key")
	}

	return nil
}

type UserSettingFind struct {
	UserID int

	Key *UserSettingKey `json:"key"`
}
