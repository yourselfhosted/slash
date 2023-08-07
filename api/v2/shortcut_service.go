package v2

import (
	"context"

	apiv2pb "github.com/boojack/slash/proto/gen/api/v2"
	storepb "github.com/boojack/slash/proto/gen/store"
	"github.com/boojack/slash/store"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type ShortcutService struct {
	apiv2pb.UnimplementedShortcutServiceServer

	Secret string
	Store  *store.Store
}

// NewShortcutService creates a new Shortcut service.
func NewShortcutService(secret string, store *store.Store) *ShortcutService {
	return &ShortcutService{
		Secret: secret,
		Store:  store,
	}
}

func (s *ShortcutService) GetShortcut(ctx context.Context, request *apiv2pb.GetShortcutRequest) (*apiv2pb.GetShortcutResponse, error) {
	shortcut, err := s.Store.GetShortcut(ctx, &store.FindShortcut{
		Name: &request.Name,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get shortcut by name: %v", err)
	}
	if shortcut == nil {
		return nil, status.Errorf(codes.NotFound, "shortcut not found")
	}

	userID := ctx.Value(UserIDContextKey).(int32)
	if shortcut.Visibility == storepb.Visibility_PRIVATE && shortcut.CreatorId != userID {
		return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
	}
	shortcutMessage := convertShortcutFromStorepb(shortcut)
	response := &apiv2pb.GetShortcutResponse{
		Shortcut: shortcutMessage,
	}
	return response, nil
}

func convertShortcutFromStorepb(shortcut *storepb.Shortcut) *apiv2pb.Shortcut {
	return &apiv2pb.Shortcut{
		Id:          shortcut.Id,
		CreatorId:   shortcut.CreatorId,
		CreatedTs:   shortcut.CreatedTs,
		UpdatedTs:   shortcut.UpdatedTs,
		RowStatus:   apiv2pb.RowStatus(shortcut.RowStatus),
		Name:        shortcut.Name,
		Link:        shortcut.Link,
		Title:       shortcut.Title,
		Tags:        shortcut.Tags,
		Description: shortcut.Description,
		Visibility:  apiv2pb.Visibility(shortcut.Visibility),
		OgMetadata: &apiv2pb.OpenGraphMetadata{
			Title:       shortcut.OgMetadata.Title,
			Description: shortcut.OgMetadata.Description,
			Image:       shortcut.OgMetadata.Image,
		},
	}
}
