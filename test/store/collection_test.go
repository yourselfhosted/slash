package teststore

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/store"
)

func TestCollectionStore(t *testing.T) {
	ctx := context.Background()
	ts := NewTestingStore(ctx, t)
	user, err := createTestingAdminUser(ctx, ts)
	require.NoError(t, err)
	collection, err := ts.CreateCollection(ctx, &storepb.Collection{
		CreatorId:   user.ID,
		Name:        "test",
		Title:       "My collection",
		Description: "A test collection",
		ShortcutIds: []int32{101, 102},
		Visibility:  storepb.Visibility_WORKSPACE,
	})
	require.NoError(t, err)
	collections, err := ts.ListCollections(ctx, &store.FindCollection{
		CreatorID: &user.ID,
	})
	require.NoError(t, err)
	require.Equal(t, 1, len(collections))
	require.Equal(t, collection, collections[0])
	newTitle := "My new collection"
	newShortcutIds := []int32{101, 103}
	updatedCollection, err := ts.UpdateCollection(ctx, &store.UpdateCollection{
		ID:          collection.Id,
		Title:       &newTitle,
		ShortcutIDs: newShortcutIds,
	})
	require.NoError(t, err)
	require.Equal(t, newTitle, updatedCollection.Title)
	require.Equal(t, newShortcutIds, updatedCollection.ShortcutIds)
	err = ts.DeleteCollection(ctx, &store.DeleteCollection{
		ID: collection.Id,
	})
	require.NoError(t, err)
	collections, err = ts.ListCollections(ctx, &store.FindCollection{
		CreatorID: &user.ID,
	})
	require.NoError(t, err)
	require.Equal(t, 0, len(collections))
}
