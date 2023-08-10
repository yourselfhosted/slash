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

func TestShortcutServer(t *testing.T) {
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
	shortcutCreate := &apiv1.CreateShortcutRequest{
		Name:       "test",
		Link:       "https://google.com",
		Visibility: apiv1.VisibilityPublic,
		Tags:       []string{},
	}
	shortcut, err := s.postShortcutCreate(shortcutCreate)
	require.NoError(t, err)
	require.Equal(t, shortcutCreate.Name, shortcut.Name)
	require.Equal(t, shortcutCreate.Link, shortcut.Link)
	err = s.deleteShortcut(shortcut.ID)
	require.NoError(t, err)
}

func (s *TestingServer) postShortcutCreate(request *apiv1.CreateShortcutRequest) (*apiv1.Shortcut, error) {
	rawData, err := json.Marshal(&request)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshal shortcut create")
	}
	reader := bytes.NewReader(rawData)
	body, err := s.post("/api/v1/shortcut", reader, nil)
	if err != nil {
		return nil, errors.Wrap(err, "fail to post request")
	}

	buf := &bytes.Buffer{}
	_, err = buf.ReadFrom(body)
	if err != nil {
		return nil, errors.Wrap(err, "fail to read response body")
	}

	shortcut := &apiv1.Shortcut{}
	if err = json.Unmarshal(buf.Bytes(), &shortcut); err != nil {
		return nil, errors.Wrap(err, "fail to unmarshal post shortcut response")
	}
	return shortcut, nil
}

func (s *TestingServer) deleteShortcut(shortcutID int32) error {
	_, err := s.delete(fmt.Sprintf("/api/v1/shortcut/%d", shortcutID), nil)
	return err
}
