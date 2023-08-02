package store

import (
	storepb "github.com/boojack/slash/proto/gen/store"
)

// RowStatus is the status for a row.
type RowStatus string

const (
	// Normal is the status for a normal row.
	Normal RowStatus = "NORMAL"
	// Archived is the status for an archived row.
	Archived RowStatus = "ARCHIVED"
)

func (e RowStatus) String() string {
	switch e {
	case Normal:
		return "NORMAL"
	case Archived:
		return "ARCHIVED"
	}
	return ""
}

func convertRowStatusStringToStorepb(status string) storepb.RowStatus {
	switch status {
	case "NORMAL":
		return storepb.RowStatus_NORMAL
	case "ARCHIVED":
		return storepb.RowStatus_ARCHIVED
	}
	return storepb.RowStatus_ROW_STATUS_UNSPECIFIED
}
