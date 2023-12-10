package v2

import (
	"context"
	"strings"
	"time"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	apiv2pb "github.com/yourselfhosted/slash/proto/gen/api/v2"
	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/store"
)

func (s *APIV2Service) ListMemos(ctx context.Context, _ *apiv2pb.ListMemosRequest) (*apiv2pb.ListMemosResponse, error) {
	find := &store.FindMemo{}
	memos, err := s.Store.ListMemos(ctx, find)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to fetch memo list, err: %v", err)
	}

	composedMemos := []*apiv2pb.Memo{}
	for _, memo := range memos {
		composedMemo, err := s.convertMemoFromStorepb(ctx, memo)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to convert memo, err: %v", err)
		}
		composedMemos = append(composedMemos, composedMemo)
	}

	response := &apiv2pb.ListMemosResponse{
		Memos: composedMemos,
	}
	return response, nil
}

func (s *APIV2Service) GetMemo(ctx context.Context, request *apiv2pb.GetMemoRequest) (*apiv2pb.GetMemoResponse, error) {
	memo, err := s.Store.GetMemo(ctx, &store.FindMemo{
		ID: &request.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get memo by ID: %v", err)
	}
	if memo == nil {
		return nil, status.Errorf(codes.NotFound, "memo not found")
	}

	composedMemo, err := s.convertMemoFromStorepb(ctx, memo)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to convert memo, err: %v", err)
	}
	response := &apiv2pb.GetMemoResponse{
		Memo: composedMemo,
	}
	return response, nil
}

func (s *APIV2Service) CreateMemo(ctx context.Context, request *apiv2pb.CreateMemoRequest) (*apiv2pb.CreateMemoResponse, error) {
	userID := ctx.Value(userIDContextKey).(int32)
	memo := &storepb.Memo{
		CreatorId:  userID,
		Name:       request.Memo.Name,
		Title:      request.Memo.Title,
		Content:    request.Memo.Content,
		Tags:       request.Memo.Tags,
		Visibility: storepb.Visibility(request.Memo.Visibility),
	}
	memo, err := s.Store.CreateMemo(ctx, memo)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create memo, err: %v", err)
	}

	composedMemo, err := s.convertMemoFromStorepb(ctx, memo)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to convert memo, err: %v", err)
	}
	response := &apiv2pb.CreateMemoResponse{
		Memo: composedMemo,
	}
	return response, nil
}

func (s *APIV2Service) UpdateMemo(ctx context.Context, request *apiv2pb.UpdateMemoRequest) (*apiv2pb.UpdateMemoResponse, error) {
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
	memo, err := s.Store.GetMemo(ctx, &store.FindMemo{
		ID: &request.Memo.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get memo by ID: %v", err)
	}
	if memo == nil {
		return nil, status.Errorf(codes.NotFound, "memo not found")
	}
	if memo.CreatorId != userID && currentUser.Role != store.RoleAdmin {
		return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
	}

	update := &store.UpdateMemo{
		ID: memo.Id,
	}
	for _, path := range request.UpdateMask.Paths {
		switch path {
		case "name":
			update.Name = &request.Memo.Name
		case "title":
			update.Title = &request.Memo.Title
		case "content":
			update.Content = &request.Memo.Content
		case "tags":
			tag := strings.Join(request.Memo.Tags, " ")
			update.Tag = &tag
		case "visibility":
			visibility := store.Visibility(request.Memo.Visibility.String())
			update.Visibility = &visibility
		}
	}
	memo, err = s.Store.UpdateMemo(ctx, update)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update memo, err: %v", err)
	}

	composedMemo, err := s.convertMemoFromStorepb(ctx, memo)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to convert memo, err: %v", err)
	}
	response := &apiv2pb.UpdateMemoResponse{
		Memo: composedMemo,
	}
	return response, nil
}

func (s *APIV2Service) DeleteMemo(ctx context.Context, request *apiv2pb.DeleteMemoRequest) (*apiv2pb.DeleteMemoResponse, error) {
	userID := ctx.Value(userIDContextKey).(int32)
	currentUser, err := s.Store.GetUser(ctx, &store.FindUser{
		ID: &userID,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get current user, err: %v", err)
	}
	memo, err := s.Store.GetMemo(ctx, &store.FindMemo{
		ID: &request.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get memo by ID: %v", err)
	}
	if memo == nil {
		return nil, status.Errorf(codes.NotFound, "memo not found")
	}
	if memo.CreatorId != userID && currentUser.Role != store.RoleAdmin {
		return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
	}

	err = s.Store.DeleteMemo(ctx, &store.DeleteMemo{
		ID: memo.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to delete memo, err: %v", err)
	}
	response := &apiv2pb.DeleteMemoResponse{}
	return response, nil
}

func (*APIV2Service) convertMemoFromStorepb(_ context.Context, memo *storepb.Memo) (*apiv2pb.Memo, error) {
	return &apiv2pb.Memo{
		Id:          memo.Id,
		CreatedTime: timestamppb.New(time.Unix(memo.CreatedTs, 0)),
		UpdatedTime: timestamppb.New(time.Unix(memo.UpdatedTs, 0)),
		CreatorId:   memo.CreatorId,
		Name:        memo.Name,
		Title:       memo.Title,
		Content:     memo.Content,
		Tags:        memo.Tags,
		Visibility:  apiv2pb.Visibility(memo.Visibility),
	}, nil
}
