package v1

import (
	"context"
	"strings"
	"time"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	apiv1pb "github.com/yourselfhosted/slash/proto/gen/api/v1"
	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/store"
)

func (s *APIV2Service) ListMemos(ctx context.Context, _ *apiv1pb.ListMemosRequest) (*apiv1pb.ListMemosResponse, error) {
	find := &store.FindMemo{}
	memos, err := s.Store.ListMemos(ctx, find)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to fetch memo list, err: %v", err)
	}

	composedMemos := []*apiv1pb.Memo{}
	for _, memo := range memos {
		composedMemo, err := s.convertMemoFromStorepb(ctx, memo)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to convert memo, err: %v", err)
		}
		composedMemos = append(composedMemos, composedMemo)
	}

	response := &apiv1pb.ListMemosResponse{
		Memos: composedMemos,
	}
	return response, nil
}

func (s *APIV2Service) GetMemo(ctx context.Context, request *apiv1pb.GetMemoRequest) (*apiv1pb.GetMemoResponse, error) {
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
	response := &apiv1pb.GetMemoResponse{
		Memo: composedMemo,
	}
	return response, nil
}

func (s *APIV2Service) CreateMemo(ctx context.Context, request *apiv1pb.CreateMemoRequest) (*apiv1pb.CreateMemoResponse, error) {
	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get current user: %v", err)
	}
	memoCreate := &storepb.Memo{
		CreatorId:  user.ID,
		Name:       request.Memo.Name,
		Title:      request.Memo.Title,
		Content:    request.Memo.Content,
		Tags:       request.Memo.Tags,
		Visibility: storepb.Visibility(request.Memo.Visibility),
	}
	memo, err := s.Store.CreateMemo(ctx, memoCreate)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create memo, err: %v", err)
	}

	composedMemo, err := s.convertMemoFromStorepb(ctx, memo)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to convert memo, err: %v", err)
	}
	response := &apiv1pb.CreateMemoResponse{
		Memo: composedMemo,
	}
	return response, nil
}

func (s *APIV2Service) UpdateMemo(ctx context.Context, request *apiv1pb.UpdateMemoRequest) (*apiv1pb.UpdateMemoResponse, error) {
	if request.UpdateMask == nil || len(request.UpdateMask.Paths) == 0 {
		return nil, status.Errorf(codes.InvalidArgument, "updateMask is required")
	}

	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get current user: %v", err)
	}
	currentUser, err := s.Store.GetUser(ctx, &store.FindUser{
		ID: &user.ID,
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
	if memo.CreatorId != user.ID && currentUser.Role != store.RoleAdmin {
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
	response := &apiv1pb.UpdateMemoResponse{
		Memo: composedMemo,
	}
	return response, nil
}

func (s *APIV2Service) DeleteMemo(ctx context.Context, request *apiv1pb.DeleteMemoRequest) (*apiv1pb.DeleteMemoResponse, error) {
	user, err := getCurrentUser(ctx, s.Store)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get current user: %v", err)
	}
	currentUser, err := s.Store.GetUser(ctx, &store.FindUser{
		ID: &user.ID,
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
	if memo.CreatorId != user.ID && currentUser.Role != store.RoleAdmin {
		return nil, status.Errorf(codes.PermissionDenied, "Permission denied")
	}

	err = s.Store.DeleteMemo(ctx, &store.DeleteMemo{
		ID: memo.Id,
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to delete memo, err: %v", err)
	}
	response := &apiv1pb.DeleteMemoResponse{}
	return response, nil
}

func (*APIV2Service) convertMemoFromStorepb(_ context.Context, memo *storepb.Memo) (*apiv1pb.Memo, error) {
	return &apiv1pb.Memo{
		Id:          memo.Id,
		CreatedTime: timestamppb.New(time.Unix(memo.CreatedTs, 0)),
		UpdatedTime: timestamppb.New(time.Unix(memo.UpdatedTs, 0)),
		CreatorId:   memo.CreatorId,
		Name:        memo.Name,
		Title:       memo.Title,
		Content:     memo.Content,
		Tags:        memo.Tags,
		Visibility:  apiv1pb.Visibility(memo.Visibility),
	}, nil
}
