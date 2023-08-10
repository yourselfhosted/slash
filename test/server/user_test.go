package testserver

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"testing"

	apiv1 "github.com/boojack/slash/api/v1"
	"github.com/pkg/errors"
	"github.com/stretchr/testify/require"
)

func TestUserServer(t *testing.T) {
	ctx := context.Background()
	s, err := NewTestingServer(ctx, t)
	require.NoError(t, err)
	defer s.Shutdown(ctx)

	signup := &apiv1.SignUpRequest{
		Email:    "slash@yourselfhosted.com",
		Password: "testpassword",
	}
	user, err := s.postAuthSignUp(signup)
	require.NoError(t, err)
	require.Equal(t, signup.Email, user.Email)
	user, err = s.getCurrentUser()
	require.NoError(t, err)
	require.Equal(t, signup.Email, user.Email)
	user, err = s.getUserByID(user.ID)
	require.NoError(t, err)
	require.Equal(t, signup.Email, user.Email)
	newEmail := "test@usermemos.com"
	userPatch := &apiv1.PatchUserRequest{
		Email: &newEmail,
	}
	user, err = s.patchUser(user.ID, userPatch)
	require.NoError(t, err)
	require.Equal(t, newEmail, user.Email)
}

func (s *TestingServer) getCurrentUser() (*apiv1.User, error) {
	body, err := s.get("/api/v1/user/me", nil)
	if err != nil {
		return nil, err
	}

	buf := &bytes.Buffer{}
	_, err = buf.ReadFrom(body)
	if err != nil {
		return nil, errors.Wrap(err, "fail to read response body")
	}

	user := &apiv1.User{}
	if err = json.Unmarshal(buf.Bytes(), &user); err != nil {
		return nil, errors.Wrap(err, "fail to unmarshal get user response")
	}
	return user, nil
}

func (s *TestingServer) getUserByID(userID int32) (*apiv1.User, error) {
	body, err := s.get(fmt.Sprintf("/api/v1/user/%d", userID), nil)
	if err != nil {
		return nil, err
	}

	buf := &bytes.Buffer{}
	_, err = buf.ReadFrom(body)
	if err != nil {
		return nil, errors.Wrap(err, "fail to read response body")
	}

	user := &apiv1.User{}
	if err = json.Unmarshal(buf.Bytes(), &user); err != nil {
		return nil, errors.Wrap(err, "fail to unmarshal get user response")
	}
	return user, nil
}

func (s *TestingServer) patchUser(userID int32, request *apiv1.PatchUserRequest) (*apiv1.User, error) {
	rawData, err := json.Marshal(&request)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshal request")
	}
	reader := bytes.NewReader(rawData)
	body, err := s.patch(fmt.Sprintf("/api/v1/user/%d", userID), reader, nil)
	if err != nil {
		return nil, err
	}

	buf := &bytes.Buffer{}
	_, err = buf.ReadFrom(body)
	if err != nil {
		return nil, errors.Wrap(err, "fail to read response body")
	}

	user := &apiv1.User{}
	if err = json.Unmarshal(buf.Bytes(), user); err != nil {
		return nil, errors.Wrap(err, "fail to unmarshal patch user response")
	}
	return user, nil
}
