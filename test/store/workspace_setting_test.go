package teststore

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"

	storepb "github.com/yourselfhosted/slash/proto/gen/store"
	"github.com/yourselfhosted/slash/store"
)

func TestWorkspaceSettingStore(t *testing.T) {
	ctx := context.Background()
	ts := NewTestingStore(ctx, t)
	tempSecret := uuid.New().String()
	workspaceSetting, err := ts.UpsertWorkspaceSetting(ctx, &storepb.WorkspaceSetting{
		Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL,
		Value: &storepb.WorkspaceSetting_General{
			General: &storepb.WorkspaceSetting_GeneralSetting{
				SecretSession: tempSecret,
			},
		},
	})
	require.NoError(t, err)
	foundWorkspaceSetting, err := ts.GetWorkspaceSetting(ctx, &store.FindWorkspaceSetting{
		Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL,
	})
	require.NoError(t, err)
	require.Equal(t, workspaceSetting, foundWorkspaceSetting)
	workspaceSettings, err := ts.ListWorkspaceSettings(ctx, &store.FindWorkspaceSetting{})
	require.NoError(t, err)
	require.Equal(t, 1, len(workspaceSettings))
	require.Equal(t, foundWorkspaceSetting, workspaceSettings[0])
}
