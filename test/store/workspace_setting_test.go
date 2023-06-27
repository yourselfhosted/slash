package teststore

import (
	"context"
	"testing"

	"github.com/boojack/shortify/store"
	"github.com/gorilla/securecookie"
	"github.com/stretchr/testify/require"
)

func TestWorkspaceSettingStore(t *testing.T) {
	ctx := context.Background()
	ts := NewTestingStore(ctx, t)
	tempSecret := securecookie.GenerateRandomKey(16)
	workspaceSetting, err := ts.UpsertWorkspaceSetting(ctx, &store.WorkspaceSetting{
		Key:   store.WorkspaceSecretSessionName,
		Value: string(tempSecret),
	})
	require.NoError(t, err)
	foundWorkspaceSetting, err := ts.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
		Key: store.WorkspaceSecretSessionName,
	})
	require.NoError(t, err)
	require.Equal(t, workspaceSetting, foundWorkspaceSetting)
	workspaceSettings, err := ts.ListWorkspaceSettings(ctx, &store.FindWorkspaceSetting{})
	require.NoError(t, err)
	require.Equal(t, 1, len(workspaceSettings))
	require.Equal(t, foundWorkspaceSetting, workspaceSettings[0])
}
