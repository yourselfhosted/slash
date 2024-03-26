package v1

import (
	"context"
	"time"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	apiv1pb "github.com/yourselfhosted/slash/proto/gen/api/v1"
	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/server/metric"
	"github.com/yourselfhosted/slash/server/service/license"
	"github.com/yourselfhosted/slash/store"
)

func (s *APIV2Service) ListCollections(ctx context.Context, _ *apiv1pb.ListCollectionsRequest) (*apiv1pb.ListCollectionsResponse, error) {
	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get current user: %v", err)
	}
	collections, err := s.Store.ListCollections(ctx, &store.FindCollection{
		CreatorID: &user.ID,
		VisibilityList: []store.Visibility{
			store.VisibilityPrivate,
		},
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get collection list, err: %v", err)
	}

	sharedCollections, err := s.Store.ListCollections(ctx, &store.FindCollection{
		VisibilityList: []store.Visibility{
			store.VisibilityWorkspace,
			store.VisibilityPublic,
		},
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get collection list, err: %v", err)
	}
	collections = append(collections, sharedCollections...)

	convertedCollections := []*apiv1pb.Collection{}
	for _, collection := range collections {
		convertedCollections = append(convertedCollections, convertCollectionFromStore(collection))
	}

	response := &apiv1pb.ListCollectionsResponse{
		Collections: convertedCollections,
	}
	return response, nil
}

func (s *APIV2Service) GetCollection(ctx context.Context, request *apiv1pb.GetCollectionRequest) (*apiv1pb.GetCollectionResponse, error) {
	collection, err := s.Store.GetCollection(ctx, &store.FindCollection{
		ID: &request.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get collection by name: %v", err)
	}
	if collection == nil {
		return nil, status.Errorf(codes.NotFound, "collection not found")
	}

	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get current user: %v", err)
	}
	if collection.Visibility == storepb.Visibility_PRIVATE && collection.CreatorId != user.ID {
		return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
	}
	response := &apiv1pb.GetCollectionResponse{
		Collection: convertCollectionFromStore(collection),
	}
	return response, nil
}

func (s *APIV2Service) GetCollectionByName(ctx context.Context, request *apiv1pb.GetCollectionByNameRequest) (*apiv1pb.GetCollectionByNameResponse, error) {
	collection, err := s.Store.GetCollection(ctx, &store.FindCollection{
		Name: &request.Name,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get collection by name: %v", err)
	}
	if collection == nil {
		return nil, status.Errorf(codes.NotFound, "collection not found")
	}

	userID, ok := ctx.Value(userIDContextKey).(int32)
	if ok {
		if collection.Visibility == storepb.Visibility_PRIVATE && collection.CreatorId != userID {
			return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
		}
	} else {
		if collection.Visibility != storepb.Visibility_PUBLIC {
			return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
		}
	}
	response := &apiv1pb.GetCollectionByNameResponse{
		Collection: convertCollectionFromStore(collection),
	}
	return response, nil
}

func (s *APIV2Service) CreateCollection(ctx context.Context, request *apiv1pb.CreateCollectionRequest) (*apiv1pb.CreateCollectionResponse, error) {
	if request.Collection.Name == "" || request.Collection.Title == "" {
		return nil, status.Errorf(codes.InvalidArgument, "name and title are required")
	}

	if !s.LicenseService.IsFeatureEnabled(license.FeatureTypeUnlimitedAccounts) {
		collections, err := s.Store.ListCollections(ctx, &store.FindCollection{
			VisibilityList: []store.Visibility{store.VisibilityWorkspace, store.VisibilityPublic},
		})
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to get collection list, err: %v", err)
		}
		if len(collections) >= 5 {
			return nil, status.Errorf(codes.PermissionDenied, "Maximum number of collections reached")
		}
	}

	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get current user: %v", err)
	}
	collectionCreate := &storepb.Collection{
		CreatorId:   user.ID,
		Name:        request.Collection.Name,
		Title:       request.Collection.Title,
		Description: request.Collection.Description,
		ShortcutIds: request.Collection.ShortcutIds,
		Visibility:  storepb.Visibility(request.Collection.Visibility),
	}
	collection, err := s.Store.CreateCollection(ctx, collectionCreate)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create collection, err: %v", err)
	}

	response := &apiv1pb.CreateCollectionResponse{
		Collection: convertCollectionFromStore(collection),
	}
	metric.Enqueue("collection create")
	return response, nil
}

func (s *APIV2Service) UpdateCollection(ctx context.Context, request *apiv1pb.UpdateCollectionRequest) (*apiv1pb.UpdateCollectionResponse, error) {
	if request.UpdateMask == nil || len(request.UpdateMask.Paths) == 0 {
		return nil, status.Errorf(codes.InvalidArgument, "updateMask is required")
	}

	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get current user: %v", err)
	}
	collection, err := s.Store.GetCollection(ctx, &store.FindCollection{
		ID: &request.Collection.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get collection by name: %v", err)
	}
	if collection == nil {
		return nil, status.Errorf(codes.NotFound, "collection not found")
	}
	if collection.CreatorId != user.ID && user.Role != store.RoleAdmin {
		return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
	}

	update := &store.UpdateCollection{
		ID: collection.Id,
	}
	for _, path := range request.UpdateMask.Paths {
		switch path {
		case "name":
			update.Name = &request.Collection.Name
		case "title":
			update.Title = &request.Collection.Title
		case "description":
			update.Description = &request.Collection.Description
		case "shortcut_ids":
			update.ShortcutIDs = request.Collection.ShortcutIds
		case "visibility":
			visibility := store.Visibility(request.Collection.Visibility.String())
			update.Visibility = &visibility
		}
	}
	collection, err = s.Store.UpdateCollection(ctx, update)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update collection, err: %v", err)
	}

	response := &apiv1pb.UpdateCollectionResponse{
		Collection: convertCollectionFromStore(collection),
	}
	return response, nil
}

func (s *APIV2Service) DeleteCollection(ctx context.Context, request *apiv1pb.DeleteCollectionRequest) (*apiv1pb.DeleteCollectionResponse, error) {
	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get current user: %v", err)
	}
	collection, err := s.Store.GetCollection(ctx, &store.FindCollection{
		ID: &request.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get collection by name: %v", err)
	}
	if collection == nil {
		return nil, status.Errorf(codes.NotFound, "collection not found")
	}
	if collection.CreatorId != user.ID && user.Role != store.RoleAdmin {
		return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
	}

	err = s.Store.DeleteCollection(ctx, &store.DeleteCollection{
		ID: collection.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to delete collection, err: %v", err)
	}
	response := &apiv1pb.DeleteCollectionResponse{}
	return response, nil
}

func convertCollectionFromStore(collection *storepb.Collection) *apiv1pb.Collection {
	return &apiv1pb.Collection{
		Id:          collection.Id,
		CreatorId:   collection.CreatorId,
		CreatedTime: timestamppb.New(time.Unix(collection.CreatedTs, 0)),
		UpdatedTime: timestamppb.New(time.Unix(collection.UpdatedTs, 0)),
		Name:        collection.Name,
		Title:       collection.Title,
		Description: collection.Description,
		ShortcutIds: collection.ShortcutIds,
		Visibility:  apiv1pb.Visibility(collection.Visibility),
	}
}
