package v2

import (
	"context"
	"time"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	apiv2pb "github.com/boojack/slash/proto/gen/api/v2"
	storepb "github.com/boojack/slash/proto/gen/store"
	"github.com/boojack/slash/server/metric"
	"github.com/boojack/slash/store"
)

func (s *APIV2Service) ListCollections(ctx context.Context, _ *apiv2pb.ListCollectionsRequest) (*apiv2pb.ListCollectionsResponse, error) {
	userID := ctx.Value(userIDContextKey).(int32)
	find := &store.FindCollection{}
	find.CreatorID = &userID
	collections, err := s.Store.ListCollections(ctx, find)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get collection list, err: %v", err)
	}

	convertedCollections := []*apiv2pb.Collection{}
	for _, collection := range collections {
		convertedCollections = append(convertedCollections, convertCollectionFromStore(collection))
	}

	response := &apiv2pb.ListCollectionsResponse{
		Collections: convertedCollections,
	}
	return response, nil
}

func (s *APIV2Service) GetCollection(ctx context.Context, request *apiv2pb.GetCollectionRequest) (*apiv2pb.GetCollectionResponse, error) {
	collection, err := s.Store.GetCollection(ctx, &store.FindCollection{
		ID: &request.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get collection by name: %v", err)
	}
	if collection == nil {
		return nil, status.Errorf(codes.NotFound, "collection not found")
	}

	userID := ctx.Value(userIDContextKey).(int32)
	if collection.Visibility == storepb.Visibility_PRIVATE && collection.CreatorId != userID {
		return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
	}
	response := &apiv2pb.GetCollectionResponse{
		Collection: convertCollectionFromStore(collection),
	}
	return response, nil
}

func (s *APIV2Service) GetCollectionByName(ctx context.Context, request *apiv2pb.GetCollectionByNameRequest) (*apiv2pb.GetCollectionByNameResponse, error) {
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
	response := &apiv2pb.GetCollectionByNameResponse{
		Collection: convertCollectionFromStore(collection),
	}
	metric.Enqueue("collection view")
	return response, nil
}

func (s *APIV2Service) CreateCollection(ctx context.Context, request *apiv2pb.CreateCollectionRequest) (*apiv2pb.CreateCollectionResponse, error) {
	userID := ctx.Value(userIDContextKey).(int32)
	collection := &storepb.Collection{
		CreatorId:   userID,
		Name:        request.Collection.Name,
		Title:       request.Collection.Title,
		Description: request.Collection.Description,
		ShortcutIds: request.Collection.ShortcutIds,
		Visibility:  storepb.Visibility(request.Collection.Visibility),
	}
	collection, err := s.Store.CreateCollection(ctx, collection)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create collection, err: %v", err)
	}

	response := &apiv2pb.CreateCollectionResponse{
		Collection: convertCollectionFromStore(collection),
	}
	metric.Enqueue("collection create")
	return response, nil
}

func (s *APIV2Service) UpdateCollection(ctx context.Context, request *apiv2pb.UpdateCollectionRequest) (*apiv2pb.UpdateCollectionResponse, error) {
	if request.UpdateMask == nil || len(request.UpdateMask.Paths) == 0 {
		return nil, status.Errorf(codes.InvalidArgument, "updateMask is required")
	}

	userID := ctx.Value(userIDContextKey).(int32)
	currentUser, err := s.Store.GetUser(ctx, &store.FindUser{
		ID: &userID,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get current user, err: %v", err)
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
	if collection.CreatorId != userID && currentUser.Role != store.RoleAdmin {
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

	response := &apiv2pb.UpdateCollectionResponse{
		Collection: convertCollectionFromStore(collection),
	}
	return response, nil
}

func (s *APIV2Service) DeleteCollection(ctx context.Context, request *apiv2pb.DeleteCollectionRequest) (*apiv2pb.DeleteCollectionResponse, error) {
	userID := ctx.Value(userIDContextKey).(int32)
	currentUser, err := s.Store.GetUser(ctx, &store.FindUser{
		ID: &userID,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get current user, err: %v", err)
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
	if collection.CreatorId != userID && currentUser.Role != store.RoleAdmin {
		return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
	}

	err = s.Store.DeleteCollection(ctx, &store.DeleteCollection{
		ID: collection.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to delete collection, err: %v", err)
	}
	response := &apiv2pb.DeleteCollectionResponse{}
	return response, nil
}

func convertCollectionFromStore(collection *storepb.Collection) *apiv2pb.Collection {
	return &apiv2pb.Collection{
		Id:          collection.Id,
		CreatorId:   collection.CreatorId,
		CreatedTime: timestamppb.New(time.Unix(collection.CreatedTs, 0)),
		UpdatedTime: timestamppb.New(time.Unix(collection.UpdatedTs, 0)),
		Name:        collection.Name,
		Title:       collection.Title,
		Description: collection.Description,
		ShortcutIds: collection.ShortcutIds,
		Visibility:  apiv2pb.Visibility(collection.Visibility),
	}
}
