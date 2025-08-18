package v1

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/mssola/useragent"
	"github.com/pkg/errors"
	"golang.org/x/exp/slices"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/emptypb"
	"google.golang.org/protobuf/types/known/timestamppb"

	v1pb "github.com/yourselfhosted/slash/proto/gen/api/v1"
	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/server/service/license"
	"github.com/yourselfhosted/slash/store"
)

func (s *APIV1Service) ListShortcuts(ctx context.Context, _ *v1pb.ListShortcutsRequest) (*v1pb.ListShortcutsResponse, error) {
	shortcutList, err := s.Store.ListShortcuts(ctx, &store.FindShortcut{})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list shortcuts, err: %v", err)
	}

	shortcutMessageList := []*v1pb.Shortcut{}
	for _, shortcut := range shortcutList {
		composedShortcut, err := s.convertShortcutFromStorepb(ctx, shortcut)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to convert shortcut, err: %v", err)
		}
		shortcutMessageList = append(shortcutMessageList, composedShortcut)
	}

	response := &v1pb.ListShortcutsResponse{
		Shortcuts: shortcutMessageList,
	}
	return response, nil
}

func (s *APIV1Service) GetShortcut(ctx context.Context, request *v1pb.GetShortcutRequest) (*v1pb.Shortcut, error) {
	shortcut, err := s.Store.GetShortcut(ctx, &store.FindShortcut{
		ID: &request.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get shortcut by id: %v", err)
	}
	if shortcut == nil {
		return nil, status.Errorf(codes.NotFound, "shortcut not found")
	}

	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get current user: %v", err)
	}
	if user == nil && shortcut.Visibility != storepb.Visibility_PUBLIC {
		return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
	}

	composedShortcut, err := s.convertShortcutFromStorepb(ctx, shortcut)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to convert shortcut, err: %v", err)
	}
	return composedShortcut, nil
}

func (s *APIV1Service) GetShortcutByName(ctx context.Context, request *v1pb.GetShortcutByNameRequest) (*v1pb.Shortcut, error) {
	shortcut, err := s.Store.GetShortcut(ctx, &store.FindShortcut{
		Name: &request.Name,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get shortcut by name: %v", err)
	}
	if shortcut == nil {
		return nil, status.Errorf(codes.NotFound, "shortcut not found")
	}

	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get current user: %v", err)
	}
	if user == nil && shortcut.Visibility != storepb.Visibility_PUBLIC {
		return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
	}

	composedShortcut, err := s.convertShortcutFromStorepb(ctx, shortcut)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to convert shortcut, err: %v", err)
	}
	return composedShortcut, nil
}

func (s *APIV1Service) CreateShortcut(ctx context.Context, request *v1pb.CreateShortcutRequest) (*v1pb.Shortcut, error) {
	if request.Shortcut.Name == "" || request.Shortcut.Link == "" {
		return nil, status.Errorf(codes.InvalidArgument, "name and link are required")
	}

	if !s.LicenseService.IsFeatureEnabled(license.FeatureTypeUnlimitedShortcuts) {
		shortcuts, err := s.Store.ListShortcuts(ctx, &store.FindShortcut{})
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to get shortcut list, err: %v", err)
		}
		shortcutsLimit := int(s.LicenseService.GetSubscription().ShortcutsLimit)
		if len(shortcuts) >= shortcutsLimit {
			return nil, status.Errorf(codes.PermissionDenied, "Maximum number of shortcuts %d reached", shortcutsLimit)
		}
	}

	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get current user: %v", err)
	}
	shortcutCreate := &storepb.Shortcut{
		CreatorId:   user.ID,
		Name:        request.Shortcut.Name,
		Link:        request.Shortcut.Link,
		Title:       request.Shortcut.Title,
		Tags:        request.Shortcut.Tags,
		Description: request.Shortcut.Description,
		Visibility:  convertVisibilityToStorepb(request.Shortcut.Visibility),
		OgMetadata:  &storepb.OpenGraphMetadata{},
	}
	if shortcutCreate.Visibility == storepb.Visibility_VISIBILITY_UNSPECIFIED {
		workspaceSetting, err := s.GetWorkspaceSetting(ctx, nil)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to get workspace setting, err: %v", err)
		}
		visibility := v1pb.Visibility_WORKSPACE
		if workspaceSetting.DefaultVisibility != v1pb.Visibility_VISIBILITY_UNSPECIFIED {
			visibility = workspaceSetting.DefaultVisibility
		}
		shortcutCreate.Visibility = convertVisibilityToStorepb(visibility)
	}
	if request.Shortcut.OgMetadata != nil {
		shortcutCreate.OgMetadata = &storepb.OpenGraphMetadata{
			Title:       request.Shortcut.OgMetadata.Title,
			Description: request.Shortcut.OgMetadata.Description,
			Image:       request.Shortcut.OgMetadata.Image,
		}
	}
	shortcut, err := s.Store.CreateShortcut(ctx, shortcutCreate)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create shortcut, err: %v", err)
	}
	if err := s.createShortcutCreateActivity(ctx, shortcut); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create activity, err: %v", err)
	}

	composedShortcut, err := s.convertShortcutFromStorepb(ctx, shortcut)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to convert shortcut, err: %v", err)
	}
	return composedShortcut, nil
}

func (s *APIV1Service) UpdateShortcut(ctx context.Context, request *v1pb.UpdateShortcutRequest) (*v1pb.Shortcut, error) {
	if request.UpdateMask == nil || len(request.UpdateMask.Paths) == 0 {
		return nil, status.Errorf(codes.InvalidArgument, "updateMask is required")
	}

	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get current user: %v", err)
	}
	shortcut, err := s.Store.GetShortcut(ctx, &store.FindShortcut{
		ID: &request.Shortcut.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get shortcut by id: %v", err)
	}
	if shortcut == nil {
		return nil, status.Errorf(codes.NotFound, "shortcut not found")
	}
	if shortcut.CreatorId != user.ID && user.Role != store.RoleAdmin {
		return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
	}

	update := &store.UpdateShortcut{
		ID: shortcut.Id,
	}
	for _, path := range request.UpdateMask.Paths {
		switch path {
		case "name":
			update.Name = &request.Shortcut.Name
		case "link":
			update.Link = &request.Shortcut.Link
		case "title":
			update.Title = &request.Shortcut.Title
		case "description":
			update.Description = &request.Shortcut.Description
		case "tags":
			tag := strings.Join(request.Shortcut.Tags, " ")
			update.Tag = &tag
		case "visibility":
			visibility := convertVisibilityToStorepb(request.Shortcut.Visibility)
			update.Visibility = &visibility
		case "og_metadata":
			if request.Shortcut.OgMetadata != nil {
				update.OpenGraphMetadata = &storepb.OpenGraphMetadata{
					Title:       request.Shortcut.OgMetadata.Title,
					Description: request.Shortcut.OgMetadata.Description,
					Image:       request.Shortcut.OgMetadata.Image,
				}
			}
		}
	}
	shortcut, err = s.Store.UpdateShortcut(ctx, update)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update shortcut, err: %v", err)
	}

	composedShortcut, err := s.convertShortcutFromStorepb(ctx, shortcut)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to convert shortcut, err: %v", err)
	}
	return composedShortcut, nil
}

func (s *APIV1Service) DeleteShortcut(ctx context.Context, request *v1pb.DeleteShortcutRequest) (*emptypb.Empty, error) {
	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get current user: %v", err)
	}
	shortcut, err := s.Store.GetShortcut(ctx, &store.FindShortcut{
		ID: &request.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get shortcut by id: %v", err)
	}
	if shortcut == nil {
		return nil, status.Errorf(codes.NotFound, "shortcut not found")
	}
	if shortcut.CreatorId != user.ID && user.Role != store.RoleAdmin {
		return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
	}

	err = s.Store.DeleteShortcut(ctx, &store.DeleteShortcut{
		ID: shortcut.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to delete shortcut, err: %v", err)
	}
	return &emptypb.Empty{}, nil
}

func (s *APIV1Service) GetShortcutAnalytics(ctx context.Context, request *v1pb.GetShortcutAnalyticsRequest) (*v1pb.GetShortcutAnalyticsResponse, error) {
	shortcut, err := s.Store.GetShortcut(ctx, &store.FindShortcut{
		ID: &request.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get shortcut by id: %v", err)
	}
	if shortcut == nil {
		return nil, status.Errorf(codes.NotFound, "shortcut not found")
	}

	activityFind := &store.FindActivity{
		Type:              store.ActivityShortcutView,
		PayloadShortcutID: &shortcut.Id,
	}
	// For non-advanced analytics users, we limit the activity to the last 14 days.
	if !s.LicenseService.IsFeatureEnabled(license.FeatureTypeAdvancedAnalytics) {
		createdTsAfter := time.Now().AddDate(0, 0, -14).Unix()
		activityFind.CreatedTsAfter = &createdTsAfter
	}
	activities, err := s.Store.ListActivities(ctx, activityFind)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get activities, err: %v", err)
	}

	referenceMap := make(map[string]int32)
	deviceMap := make(map[string]int32)
	browserMap := make(map[string]int32)
	for _, activity := range activities {
		payload := &storepb.ActivityShorcutViewPayload{}
		if err := protojson.Unmarshal([]byte(activity.Payload), payload); err != nil {
			return nil, status.Error(codes.Internal, fmt.Sprintf("failed to unmarshal payload, err: %v", err))
		}

		if _, ok := referenceMap[payload.Referer]; !ok {
			referenceMap[payload.Referer] = 0
		}
		referenceMap[payload.Referer]++

		ua := useragent.New(payload.UserAgent)
		deviceName := ua.OSInfo().Name
		browserName, _ := ua.Browser()

		if _, ok := deviceMap[deviceName]; !ok {
			deviceMap[deviceName] = 0
		}
		deviceMap[deviceName]++

		if _, ok := browserMap[browserName]; !ok {
			browserMap[browserName] = 0
		}
		browserMap[browserName]++
	}

	response := &v1pb.GetShortcutAnalyticsResponse{
		References: mapToAnalyticsSlice(referenceMap),
		Devices:    mapToAnalyticsSlice(deviceMap),
		Browsers:   mapToAnalyticsSlice(browserMap),
	}
	return response, nil
}

func mapToAnalyticsSlice(m map[string]int32) []*v1pb.GetShortcutAnalyticsResponse_AnalyticsItem {
	analyticsSlice := make([]*v1pb.GetShortcutAnalyticsResponse_AnalyticsItem, 0)
	for key, value := range m {
		analyticsSlice = append(analyticsSlice, &v1pb.GetShortcutAnalyticsResponse_AnalyticsItem{
			Name:  key,
			Count: value,
		})
	}
	slices.SortFunc(analyticsSlice, func(i, j *v1pb.GetShortcutAnalyticsResponse_AnalyticsItem) int {
		return int(i.Count - j.Count)
	})
	return analyticsSlice
}

func (s *APIV1Service) createShortcutCreateActivity(ctx context.Context, shortcut *storepb.Shortcut) error {
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

func (s *APIV1Service) convertShortcutFromStorepb(ctx context.Context, shortcut *storepb.Shortcut) (*v1pb.Shortcut, error) {
	composedShortcut := &v1pb.Shortcut{
		Id:          shortcut.Id,
		CreatorId:   shortcut.CreatorId,
		CreatedTime: timestamppb.New(time.Unix(shortcut.CreatedTs, 0)),
		UpdatedTime: timestamppb.New(time.Unix(shortcut.UpdatedTs, 0)),
		Name:        shortcut.Name,
		Link:        shortcut.Link,
		Title:       shortcut.Title,
		Tags:        shortcut.Tags,
		Description: shortcut.Description,
		Visibility:  convertVisibilityFromStorepb(shortcut.Visibility),
		OgMetadata: &v1pb.Shortcut_OpenGraphMetadata{
			Title:       shortcut.OgMetadata.Title,
			Description: shortcut.OgMetadata.Description,
			Image:       shortcut.OgMetadata.Image,
		},
	}

	activityList, err := s.Store.ListActivities(ctx, &store.FindActivity{
		Type:              store.ActivityShortcutView,
		Level:             store.ActivityInfo,
		PayloadShortcutID: &composedShortcut.Id,
	})
	if err != nil {
		return nil, errors.Wrap(err, "Failed to list activities")
	}
	composedShortcut.ViewCount = int32(len(activityList))

	return composedShortcut, nil
}
