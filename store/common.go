package store

import (
	storepb "github.com/bshort/monotreme/proto/gen/store"
)

func ConvertRowStatusStringToStorepb(status string) storepb.RowStatus {
	if status == "NORMAL" {
		return storepb.RowStatus_NORMAL
	}
	// Otherwise, fallback to archived status.
	return storepb.RowStatus_ARCHIVED
}

func ConvertVisibilityStringToStorepb(visibility string) storepb.Visibility {
	if visibility == "PUBLIC" {
		return storepb.Visibility_PUBLIC
	}
	// Otherwise, fallback to workspace visibility.
	return storepb.Visibility_WORKSPACE
}
