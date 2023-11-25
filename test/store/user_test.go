package teststore

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/store"
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
	_, err = ts.CreateShortcut(ctx, &storepb.Shortcut{
		CreatorId:  user.ID,
		Name:       "test_shortcut",
		Link:       "https://www.google.com",
		Visibility: storepb.Visibility_PUBLIC,
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
	shortcuts, err := ts.ListShortcuts(ctx, &store.FindShortcut{})
	require.NoError(t, err)
	require.Equal(t, 0, len(shortcuts))
}

// createTestingAdminUser creates a testing admin user.
func createTestingAdminUser(ctx context.Context, ts *store.Store) (*store.User, error) {
	userCreate := &store.User{
		Role:     store.RoleAdmin,
		Email:    "test@test.com",
		Nickname: "test_nickname",
	}
	passwordHash, err := bcrypt.GenerateFromPassword([]byte("test-password"), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	userCreate.PasswordHash = string(passwordHash)
	user, err := ts.CreateUser(ctx, userCreate)
	return user, err
}
