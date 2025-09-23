package teststore

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/bshort/monotreme/store"
)

func TestActivityStore(t *testing.T) {
	ctx := context.Background()
	ts := NewTestingStore(ctx, t)
	user, err := createTestingAdminUser(ctx, ts)
	require.NoError(t, err)
	list, err := ts.ListActivities(ctx, &store.FindActivity{})
	require.NoError(t, err)
	require.Equal(t, 0, len(list))
	activity, err := ts.CreateActivity(ctx, &store.Activity{
		CreatorID: user.ID,
		Type:      store.ActivityShortcutCreate,
		Level:     store.ActivityInfo,
		Payload:   "",
	})
	require.NoError(t, err)
	list, err = ts.ListActivities(ctx, &store.FindActivity{})
	require.NoError(t, err)
	require.Equal(t, 1, len(list))
	require.Equal(t, activity, list[0])
}
