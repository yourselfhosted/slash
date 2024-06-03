package v1

import (
	"context"

	v1pb "github.com/yourselfhosted/slash/proto/gen/api/v1"
	"github.com/yourselfhosted/slash/store"
)

func convertRowStatusFromStore(rowStatus store.RowStatus) v1pb.RowStatus {
	switch rowStatus {
	case store.Normal:
		return v1pb.RowStatus_NORMAL
	case store.Archived:
		return v1pb.RowStatus_ARCHIVED
	default:
		return v1pb.RowStatus_ROW_STATUS_UNSPECIFIED
	}
}

func getCurrentUser(ctx context.Context, s *store.Store) (*store.User, error) {
	userID, ok := ctx.Value(userIDContextKey).(int32)
	if !ok {
		return nil, nil
	}
	user, err := s.GetUser(ctx, &store.FindUser{
		ID: &userID,
	})
	if err != nil {
		return nil, err
	}
	return user, nil
}
