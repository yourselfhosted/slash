package teststore

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/store"
)

func TestMemoStore(t *testing.T) {
	ctx := context.Background()
	ts := NewTestingStore(ctx, t)
	user, err := createTestingAdminUser(ctx, ts)
	require.NoError(t, err)

	memo, err := ts.CreateMemo(ctx, &storepb.Memo{
		CreatorId:  user.ID,
		Name:       "test",
		Title:      "Test Memo",
		Content:    "This is a test memo.",
		Visibility: storepb.Visibility_PRIVATE,
		Tags:       []string{"test", "memo"},
	})
	require.NoError(t, err)

	memos, err := ts.ListMemos(ctx, &store.FindMemo{
		CreatorID: &user.ID,
	})
	require.NoError(t, err)
	require.Equal(t, 1, len(memos))
	require.Equal(t, memo, memos[0])

	newContent := "Updated content."
	updatedMemo, err := ts.UpdateMemo(ctx, &store.UpdateMemo{
		ID:      memo.Id,
		Content: &newContent,
	})
	require.NoError(t, err)
	require.Equal(t, newContent, updatedMemo.Content)

	tag := "test"
	memo, err = ts.GetMemo(ctx, &store.FindMemo{
		Tag: &tag,
	})
	require.NoError(t, err)

	err = ts.DeleteMemo(ctx, &store.DeleteMemo{
		ID: memo.Id,
	})
	require.NoError(t, err)

	memos, err = ts.ListMemos(ctx, &store.FindMemo{
		CreatorID: &user.ID,
	})
	require.NoError(t, err)
	require.Equal(t, 0, len(memos))
}
