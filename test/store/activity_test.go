package teststore

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/boojack/slash/store"
)

func TestActivityStore(t *testing.T) {
	ctx := context.Background()
	ts := NewTestingStore(ctx, t)
	list, err := ts.ListActivities(ctx, &store.FindActivity{})
	require.NoError(t, err)
	require.Equal(t, 0, len(list))
	activity, err := ts.CreateActivity(ctx, &store.Activity{
		CreatorID: -1,
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
