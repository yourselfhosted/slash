package teststore

import (
	"context"
	"testing"

	"github.com/boojack/shortify/store"

	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

func TestUserStore(t *testing.T) {
	ctx := context.Background()
	ts := NewTestingStore(ctx, t)
	user, err := createTestingAdminUser(ctx, ts)
	require.NoError(t, err)
	users, err := ts.ListUsers(ctx, &store.FindUser{})
	require.NoError(t, err)
	require.Equal(t, 1, len(users))
	require.Equal(t, store.RoleAdmin, users[0].Role)
	require.Equal(t, user, users[0])
	userPatchNickname := "test_nickname_2"
	user, err = ts.UpdateUser(ctx, &store.UpdateUser{
		ID:       user.ID,
		Nickname: &userPatchNickname,
	})
	require.NoError(t, err)
	require.Equal(t, userPatchNickname, user.Nickname)
	err = ts.DeleteUser(ctx, &store.DeleteUser{
		ID: user.ID,
	})
	require.NoError(t, err)
	users, err = ts.ListUsers(ctx, &store.FindUser{})
	require.NoError(t, err)
	require.Equal(t, 0, len(users))
}

// createTestingAdminUser creates a testing admin user.
func createTestingAdminUser(ctx context.Context, ts *store.Store) (*store.User, error) {
	userCreate := &store.User{
		Role:     store.RoleAdmin,
		Username: "test",
		Nickname: "test_nickname",
		Email:    "test@test.com",
	}
	passwordHash, err := bcrypt.GenerateFromPassword([]byte("test-password"), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	userCreate.PasswordHash = string(passwordHash)
	user, err := ts.CreateUser(ctx, userCreate)
	return user, err
}
