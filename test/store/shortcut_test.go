package teststore

import (
	"context"
	"testing"

	"github.com/boojack/slash/store"
	"github.com/stretchr/testify/require"
)

func TestShortcutStore(t *testing.T) {
	ctx := context.Background()
	ts := NewTestingStore(ctx, t)
	user, err := createTestingAdminUser(ctx, ts)
	require.NoError(t, err)
	shortcut, err := ts.CreateShortcut(ctx, &store.Shortcut{
		CreatorID:   user.ID,
		Name:        "test",
		Link:        "https://test.link",
		Description: "A test shortcut",
		Visibility:  store.VisibilityPrivate,
		Tag:         "test link",
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
		ID:   shortcut.ID,
		Link: &newLink,
	})
	require.NoError(t, err)
	require.Equal(t, newLink, updatedShortcut.Link)
	tag := "test"
	shortcut, err = ts.GetShortcut(ctx, &store.FindShortcut{
		Tag: &tag,
	})
	require.NoError(t, err)
	require.Equal(t, updatedShortcut, shortcut)
	err = ts.DeleteShortcut(ctx, &store.DeleteShortcut{
		ID: shortcut.ID,
	})
	require.NoError(t, err)
	shortcuts, err = ts.ListShortcuts(ctx, &store.FindShortcut{
		CreatorID: &user.ID,
	})
	require.NoError(t, err)
	require.Equal(t, 0, len(shortcuts))
}
