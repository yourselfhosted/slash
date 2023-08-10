package v2

import (
	"context"

	apiv2pb "github.com/boojack/slash/proto/gen/api/v2"
	storepb "github.com/boojack/slash/proto/gen/store"
	"github.com/boojack/slash/store"
	"github.com/pkg/errors"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/encoding/protojson"
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

func (s *ShortcutService) ListShortcuts(ctx context.Context, _ *apiv2pb.ListShortcutsRequest) (*apiv2pb.ListShortcutsResponse, error) {
	userID := ctx.Value(UserIDContextKey).(int32)
	find := &store.FindShortcut{}
	find.VisibilityList = []store.Visibility{store.VisibilityWorkspace, store.VisibilityPublic}
	visibleShortcutList, err := s.Store.ListShortcuts(ctx, find)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to fetch visible shortcut list, err: %v", err)
	}

	find.VisibilityList = []store.Visibility{store.VisibilityPrivate}
	find.CreatorID = &userID
	shortcutList, err := s.Store.ListShortcuts(ctx, find)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to fetch private shortcut list, err: %v", err)
	}

	shortcutList = append(shortcutList, visibleShortcutList...)
	shortcuts := []*apiv2pb.Shortcut{}
	for _, shortcut := range shortcutList {
		shortcuts = append(shortcuts, convertShortcutFromStorepb(shortcut))
	}

	response := &apiv2pb.ListShortcutsResponse{
		Shortcuts: shortcuts,
	}
	return response, nil
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

func (s *ShortcutService) CreateShortcut(ctx context.Context, request *apiv2pb.CreateShortcutRequest) (*apiv2pb.CreateShortcutResponse, error) {
	userID := ctx.Value(UserIDContextKey).(int32)
	shortcut := &storepb.Shortcut{
		CreatorId:   userID,
		Name:        request.Shortcut.Name,
		Link:        request.Shortcut.Link,
		Title:       request.Shortcut.Title,
		Tags:        request.Shortcut.Tags,
		Description: request.Shortcut.Description,
		Visibility:  storepb.Visibility(request.Shortcut.Visibility),
		OgMetadata:  &storepb.OpenGraphMetadata{},
	}
	if request.Shortcut.OgMetadata != nil {
		shortcut.OgMetadata = &storepb.OpenGraphMetadata{
			Title:       request.Shortcut.OgMetadata.Title,
			Description: request.Shortcut.OgMetadata.Description,
			Image:       request.Shortcut.OgMetadata.Image,
		}
	}
	shortcut, err := s.Store.CreateShortcut(ctx, shortcut)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create shortcut, err: %v", err)
	}
	if err := s.createShortcutCreateActivity(ctx, shortcut); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create activity, err: %v", err)
	}

	response := &apiv2pb.CreateShortcutResponse{
		Shortcut: convertShortcutFromStorepb(shortcut),
	}
	return response, nil
}

func (s *ShortcutService) createShortcutCreateActivity(ctx context.Context, shortcut *storepb.Shortcut) error {
	payload := &storepb.ActivityShorcutCreatePayload{
		ShortcutId: shortcut.Id,
	}
	payloadStr, err := protojson.Marshal(payload)
	if err != nil {
		return errors.Wrap(err, "Failed to marshal activity payload")
	}
	activity := &store.Activity{
		CreatorID: shortcut.CreatorId,
		Type:      store.ActivityShortcutCreate,
		Level:     store.ActivityInfo,
		Payload:   string(payloadStr),
	}
	_, err = s.Store.CreateActivity(ctx, activity)
	if err != nil {
		return errors.Wrap(err, "Failed to create activity")
	}
	return nil
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
