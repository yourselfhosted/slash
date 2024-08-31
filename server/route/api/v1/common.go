package v1

import (
	"context"

	v1pb "github.com/yourselfhosted/slash/proto/gen/api/v1"
	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/store"
)

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

func convertStateFromRowStatus(rowStatus storepb.RowStatus) v1pb.State {
	switch rowStatus {
	case storepb.RowStatus_NORMAL:
		return v1pb.State_ACTIVE
	case storepb.RowStatus_ARCHIVED:
		return v1pb.State_INACTIVE
	default:
		return v1pb.State_STATE_UNSPECIFIED
	}
}

// ConvertStateToRowStatus converts a v1pb.State to a storepb.RowStatus.
func ConvertStateToRowStatus(state v1pb.State) storepb.RowStatus {
	switch state {
	case v1pb.State_ACTIVE:
		return storepb.RowStatus_NORMAL
	case v1pb.State_INACTIVE:
		return storepb.RowStatus_ARCHIVED
	default:
		return storepb.RowStatus_ROW_STATUS_UNSPECIFIED
	}
}

func convertVisibilityFromStorepb(visibility storepb.Visibility) v1pb.Visibility {
	switch visibility {
	case storepb.Visibility_WORKSPACE:
		return v1pb.Visibility_WORKSPACE
	case storepb.Visibility_PUBLIC:
		return v1pb.Visibility_PUBLIC
	default:
		return v1pb.Visibility_VISIBILITY_UNSPECIFIED
	}
}

func convertVisibilityToStorepb(visibility v1pb.Visibility) storepb.Visibility {
	switch visibility {
	case v1pb.Visibility_WORKSPACE:
		return storepb.Visibility_WORKSPACE
	case v1pb.Visibility_PUBLIC:
		return storepb.Visibility_PUBLIC
	default:
		return storepb.Visibility_VISIBILITY_UNSPECIFIED
	}
}
