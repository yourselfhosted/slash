package v2

import (
	apiv2pb "github.com/yourselfhosted/slash/proto/gen/api/v2"
	"github.com/yourselfhosted/slash/store"
)

func convertRowStatusFromStore(rowStatus store.RowStatus) apiv2pb.RowStatus {
	switch rowStatus {
	case store.Normal:
		return apiv2pb.RowStatus_NORMAL
	case store.Archived:
		return apiv2pb.RowStatus_ARCHIVED
	default:
		return apiv2pb.RowStatus_ROW_STATUS_UNSPECIFIED
	}
}
