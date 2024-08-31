package teststore

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/store"
)

func TestShortcutStore(t *testing.T) {
	ctx := context.Background()
	ts := NewTestingStore(ctx, t)
	user, err := createTestingAdminUser(ctx, ts)
	require.NoError(t, err)
	shortcut, err := ts.CreateShortcut(ctx, &storepb.Shortcut{
		CreatorId:   user.ID,
		Name:        "test",
		Link:        "https://test.link",
		Description: "A test shortcut",
		Visibility:  storepb.Visibility_WORKSPACE,
		Tags:        []string{"test", "shortcut"},
		OgMetadata:  &storepb.OpenGraphMetadata{},
	})
	require.NoError(t, err)
	shortcuts, err := ts.ListShortcuts(ctx, &store.FindShortcut{
		CreatorID: &user.ID,
	})
	require.NoError(t, err)
	require.Equal(t, 1, len(shortcuts))
	require.Equal(t, shortcut, shortcuts[0])
	newLink := "https://new.link"
	updatedShortcut, err := ts.UpdateShortcut(ctx, &store.UpdateShortcut{
		ID:   shortcut.Id,
		Link: &newLink,
	})
	require.NoError(t, err)
	require.Equal(t, newLink, updatedShortcut.Link)
	tag := "test"
	shortcut, err = ts.GetShortcut(ctx, &store.FindShortcut{
		Tag: &tag,
	})
	require.NoError(t, err)
	err = ts.DeleteShortcut(ctx, &store.DeleteShortcut{
		ID: shortcut.Id,
	})
	require.NoError(t, err)
	shortcuts, err = ts.ListShortcuts(ctx, &store.FindShortcut{
		CreatorID: &user.ID,
	})
	require.NoError(t, err)
	require.Equal(t, 0, len(shortcuts))
}
