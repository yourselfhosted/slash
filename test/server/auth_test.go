package testserver

import (
	"bytes"
	"context"
	"encoding/json"
	"testing"

	apiv1 "github.com/boojack/slash/api/v1"
	"github.com/pkg/errors"
	"github.com/stretchr/testify/require"
)

func TestAuthServer(t *testing.T) {
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

	signin := &apiv1.SignInRequest{
		Email:    "slash@yourselfhosted.com",
		Password: "testpassword",
	}
	user, err = s.postAuthSignIn(signin)
	require.NoError(t, err)
	require.Equal(t, signup.Email, user.Email)
	err = s.postLogout()
	require.NoError(t, err)
}

func (s *TestingServer) postAuthSignUp(signup *apiv1.SignUpRequest) (*apiv1.User, error) {
	rawData, err := json.Marshal(&signup)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshal signup")
	}
	reader := bytes.NewReader(rawData)
	body, err := s.post("/api/v1/auth/signup", reader, nil)
	if err != nil {
		return nil, errors.Wrap(err, "fail to post request")
	}

	buf := &bytes.Buffer{}
	_, err = buf.ReadFrom(body)
	if err != nil {
		return nil, errors.Wrap(err, "fail to read response body")
	}

	user := &apiv1.User{}
	if err = json.Unmarshal(buf.Bytes(), user); err != nil {
		return nil, errors.Wrap(err, "fail to unmarshal post signup response")
	}
	return user, nil
}

func (s *TestingServer) postAuthSignIn(signip *apiv1.SignInRequest) (*apiv1.User, error) {
	rawData, err := json.Marshal(&signip)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshal signin")
	}
	reader := bytes.NewReader(rawData)
	body, err := s.post("/api/v1/auth/signin", reader, nil)
	if err != nil {
		return nil, errors.Wrap(err, "fail to post request")
	}

	buf := &bytes.Buffer{}
	_, err = buf.ReadFrom(body)
	if err != nil {
		return nil, errors.Wrap(err, "fail to read response body")
	}

	user := &apiv1.User{}
	if err = json.Unmarshal(buf.Bytes(), user); err != nil {
		return nil, errors.Wrap(err, "fail to unmarshal post signin response")
	}
	return user, nil
}

func (s *TestingServer) postLogout() error {
	_, err := s.post("/api/v1/auth/logout", nil, nil)
	if err != nil {
		return errors.Wrap(err, "fail to post request")
	}
	return nil
}
