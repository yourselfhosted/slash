package store

import (
	storepb "github.com/yourselfhosted/slash/proto/gen/store"
)

func ConvertRowStatusStringToStorepb(status string) storepb.RowStatus {
	switch status {
	case "NORMAL":
		return storepb.RowStatus_NORMAL
	case "ARCHIVED":
		return storepb.RowStatus_ARCHIVED
	}
	return storepb.RowStatus_ROW_STATUS_UNSPECIFIED
}

func ConvertVisibilityStringToStorepb(visibility string) storepb.Visibility {
	switch visibility {
	case "PRIVATE", "WORKSPACE":
		return storepb.Visibility_WORKSPACE
	case "PUBLIC":
		return storepb.Visibility_PUBLIC
	}
	return storepb.Visibility_VISIBILITY_UNSPECIFIED
}
