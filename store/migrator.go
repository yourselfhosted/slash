package store

import (
	"context"

	"database/sql"
	"embed"
	"fmt"
	"io/fs"
	"log/slog"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/pkg/errors"

	storepb "github.com/bshort/monotreme/proto/gen/store"
	"github.com/bshort/monotreme/server/common"
)

//go:embed migration
var migrationFS embed.FS

const (
	// MigrateFileNameSplit is the split character between the patch version and the description in the migration file name.
	// For example, "1__create_table.sql".
	MigrateFileNameSplit = "__"
	// LatestSchemaFileName is the name of the latest schema file.
	// This file is used to apply the latest schema when no migration history is found.
	LatestSchemaFileName = "LATEST.sql"
)

// Migrate applies the latest schema to the database.
func (s *Store) Migrate(ctx context.Context) error {
	// Validate migration setup
	if err := s.validateMigrationSetup(); err != nil {
		return errors.Wrap(err, "migration setup validation failed")
	}

	if err := s.preMigrate(ctx); err != nil {
		return errors.Wrap(err, "failed to pre-migrate")
	}

	if s.profile.Mode == "prod" {
		migrationHistoryList, err := s.driver.ListMigrationHistories(ctx, &FindMigrationHistory{})
		if err != nil {
			return errors.Wrap(err, "failed to find migration history")
		}
		if len(migrationHistoryList) == 0 {
			return errors.Errorf("no migration history found")
		}

		migrationHistoryVersions := []string{}
		for _, migrationHistory := range migrationHistoryList {
			migrationHistoryVersions = append(migrationHistoryVersions, migrationHistory.Version)
		}
		sort.Sort(common.SortVersion(migrationHistoryVersions))
		latestMigrationHistoryVersion := migrationHistoryVersions[len(migrationHistoryVersions)-1]
		schemaVersion, err := s.GetCurrentSchemaVersion()
		if err != nil {
			return errors.Wrap(err, "failed to get current schema version")
		}

		if common.IsVersionGreaterThan(schemaVersion, latestMigrationHistoryVersion) {
			filePaths, err := fs.Glob(migrationFS, fmt.Sprintf("%s*/*.sql", s.getMigrationBasePath()))
			if err != nil {
				return errors.Wrap(err, "failed to read migration files")
			}
			sort.Strings(filePaths)

			slog.Info("start migration", slog.String("currentSchemaVersion", latestMigrationHistoryVersion), slog.String("targetSchemaVersion", schemaVersion))

			// Apply migrations within a transaction
			if err := s.executeInTransaction(ctx, func(tx *sql.Tx) error {
				for _, filePath := range filePaths {
					fileSchemaVersion, err := s.getSchemaVersionOfMigrateScript(filePath)
					if err != nil {
						return errors.Wrapf(err, "failed to get schema version of migrate script for file: %s", filePath)
					}
					if common.IsVersionGreaterThan(fileSchemaVersion, latestMigrationHistoryVersion) && common.IsVersionGreaterOrEqualThan(schemaVersion, fileSchemaVersion) {
						bytes, err := migrationFS.ReadFile(filePath)
						if err != nil {
							return errors.Wrapf(err, "failed to read migration file: %s", filePath)
						}
						stmt := string(bytes)
						slog.Debug("applying migration", slog.String("file", filePath), slog.String("version", fileSchemaVersion))
						if err := s.execute(ctx, tx, stmt); err != nil {
							return errors.Wrapf(err, "failed to execute migration file %s", filePath)
						}
					}
				}
				return nil
			}); err != nil {
				return err
			}

			slog.Info("end migrate")

			// Upsert the current schema version to migration_history.
			if _, err = s.driver.UpsertMigrationHistory(ctx, &UpsertMigrationHistory{
				Version: schemaVersion,
			}); err != nil {
				return errors.Wrapf(err, "failed to upsert migration history with version: %s", schemaVersion)
			}
		}
	}

	// Manually migrate workspace settings.
	// TODO: remove this after the next release.
	if err := s.migrateWorkspaceSettings(ctx); err != nil {
		return errors.Wrap(err, "failed to migrate workspace settings")
	}
	return nil
}

func (s *Store) preMigrate(ctx context.Context) error {
	migrationHistoryList, err := s.driver.ListMigrationHistories(ctx, &FindMigrationHistory{})
	// If any error occurs or no migration history found, apply the latest schema.
	if err != nil || len(migrationHistoryList) == 0 {
		if err != nil {
			slog.Warn("failed to find migration history in pre-migrate", slog.String("error", err.Error()))
		}
		filePath := s.getMigrationBasePath() + LatestSchemaFileName
		bytes, err := migrationFS.ReadFile(filePath)
		if err != nil {
			return errors.Errorf("failed to read latest schema file: %s", err)
		}
		schemaVersion, err := s.GetCurrentSchemaVersion()
		if err != nil {
			return errors.Wrap(err, "failed to get current schema version")
		}

		// Apply the latest schema within a transaction
		if err := s.executeInTransaction(ctx, func(tx *sql.Tx) error {
			slog.Info("applying latest schema", slog.String("file", filePath), slog.String("version", schemaVersion))
			if err := s.execute(ctx, tx, string(bytes)); err != nil {
				return errors.Wrapf(err, "failed to execute latest schema file: %s", filePath)
			}
			return nil
		}); err != nil {
			return err
		}

		if _, err := s.driver.UpsertMigrationHistory(ctx, &UpsertMigrationHistory{
			Version: schemaVersion,
		}); err != nil {
			return errors.Wrap(err, "failed to upsert migration history")
		}
	}
	if s.profile.Mode == "prod" {
		if err := s.normalizedMigrationHistoryList(ctx); err != nil {
			return errors.Wrap(err, "failed to normalize migration history list")
		}
	}
	return nil
}

func (s *Store) getMigrationBasePath() string {
	return fmt.Sprintf("migration/%s/", s.profile.Driver)
}

// validateMigrationSetup validates that the migration system is properly configured.
func (s *Store) validateMigrationSetup() error {
	if s.driver == nil {
		return errors.New("database driver is not initialized")
	}
	if s.profile == nil {
		return errors.New("store profile is not initialized")
	}
	if s.profile.Driver == "" {
		return errors.New("database driver type is not specified")
	}

	// Check if migration files exist
	basePath := s.getMigrationBasePath()
	if _, err := fs.Stat(migrationFS, strings.TrimSuffix(basePath, "/")); err != nil {
		return errors.Wrapf(err, "migration directory not found: %s", basePath)
	}

	return nil
}

func (s *Store) GetCurrentSchemaVersion() (string, error) {
	currentVersion := common.GetCurrentVersion(s.profile.Mode)
	minorVersion := common.GetMinorVersion(currentVersion)
	filePaths, err := fs.Glob(migrationFS, fmt.Sprintf("%s%s/*.sql", s.getMigrationBasePath(), minorVersion))
	if err != nil {
		return "", errors.Wrap(err, "failed to read migration files")
	}

	sort.Strings(filePaths)
	if len(filePaths) == 0 {
		return fmt.Sprintf("%s.0", minorVersion), nil
	}
	return s.getSchemaVersionOfMigrateScript(filePaths[len(filePaths)-1])
}

func (s *Store) getSchemaVersionOfMigrateScript(filePath string) (string, error) {
	// If the file is the latest schema file, return the current schema version.
	if strings.HasSuffix(filePath, LatestSchemaFileName) {
		return s.GetCurrentSchemaVersion()
	}

	normalizedPath := filepath.ToSlash(filePath)
	elements := strings.Split(normalizedPath, "/")
	if len(elements) < 2 {
		return "", errors.Errorf("invalid migration file path format: %s (expected migration/driver/version/file.sql)", filePath)
	}

	minorVersion := elements[len(elements)-2]
	fileName := elements[len(elements)-1]

	// Validate file name format
	if !strings.HasSuffix(fileName, ".sql") {
		return "", errors.Errorf("invalid migration file extension: %s (expected .sql)", filePath)
	}

	fileNameParts := strings.Split(fileName, MigrateFileNameSplit)
	if len(fileNameParts) < 2 {
		return "", errors.Errorf("invalid migration file name format: %s (expected format: number%sdescription.sql)", fileName, MigrateFileNameSplit)
	}

	rawPatchVersion := fileNameParts[0]
	patchVersion, err := strconv.Atoi(rawPatchVersion)
	if err != nil {
		return "", errors.Wrapf(err, "invalid patch version number in file: %s", filePath)
	}

	if patchVersion < 0 {
		return "", errors.Errorf("patch version cannot be negative in file: %s", filePath)
	}

	return fmt.Sprintf("%s.%d", minorVersion, patchVersion+1), nil
}

// execute runs a single SQL statement within a transaction.
func (*Store) execute(ctx context.Context, tx *sql.Tx, stmt string) error {
	if _, err := tx.ExecContext(ctx, stmt); err != nil {
		return errors.Wrap(err, "failed to execute statement")
	}
	return nil
}

// executeInTransaction runs a function within a database transaction.
// It automatically handles commit and rollback.
func (s *Store) executeInTransaction(_ context.Context, fn func(*sql.Tx) error) error {
	tx, err := s.driver.GetDB().Begin()
	if err != nil {
		return errors.Wrap(err, "failed to start transaction")
	}

	// Ensure rollback is called if commit wasn't successful
	committed := false
	defer func() {
		if !committed {
			_ = tx.Rollback()
		}
	}()

	if err := fn(tx); err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return errors.Wrap(err, "failed to commit transaction")
	}
	committed = true
	return nil
}

func (s *Store) normalizedMigrationHistoryList(ctx context.Context) error {
	migrationHistoryList, err := s.driver.ListMigrationHistories(ctx, &FindMigrationHistory{})
	if err != nil {
		return errors.Wrap(err, "failed to find migration history")
	}
	versions := []string{}
	for _, migrationHistory := range migrationHistoryList {
		versions = append(versions, migrationHistory.Version)
	}
	sort.Sort(common.SortVersion(versions))
	latestVersion := versions[len(versions)-1]
	latestMinorVersion := common.GetMinorVersion(latestVersion)
	// If the latest version is greater than or equal to 1.0, the migration history is already normalized.
	if common.IsVersionGreaterOrEqualThan(latestMinorVersion, "1.0") {
		return nil
	}

	filePaths, err := fs.Glob(migrationFS, fmt.Sprintf("%s*/*.sql", s.getMigrationBasePath()))
	if err != nil {
		return errors.Wrap(err, "failed to read migration files")
	}
	sort.Strings(filePaths)
	schemaVersionMap := map[string]string{}
	for _, filePath := range filePaths {
		fileSchemaVersion, err := s.getSchemaVersionOfMigrateScript(filePath)
		if err != nil {
			return errors.Wrap(err, "failed to get schema version of migrate script")
		}
		schemaVersionMap[common.GetMinorVersion(fileSchemaVersion)] = fileSchemaVersion
	}
	// Add the current schema version to the map.
	currentSchemaVersion, err := s.GetCurrentSchemaVersion()
	if err != nil {
		return errors.Wrap(err, "failed to get current schema version")
	}
	schemaVersionMap[common.GetMinorVersion(currentSchemaVersion)] = currentSchemaVersion
	latestSchemaVersion := schemaVersionMap[latestMinorVersion]
	if latestSchemaVersion == "" {
		return errors.Errorf("latest schema version not found")
	}
	if common.IsVersionGreaterOrEqualThan(latestVersion, latestSchemaVersion) {
		return nil
	}

	// Insert the latest schema version to migration_history within a transaction
	return s.executeInTransaction(ctx, func(tx *sql.Tx) error {
		stmt := fmt.Sprintf("INSERT INTO migration_history (version) VALUES ('%s')", latestSchemaVersion)
		if err := s.execute(ctx, tx, stmt); err != nil {
			return errors.Wrapf(err, "failed to insert migration history for version: %s", latestSchemaVersion)
		}
		return nil
	})
}

// migrateWorkspaceSettings migrates workspace settings manually.
func (s *Store) migrateWorkspaceSettings(ctx context.Context) error {
	workspaceSettings, err := s.driver.ListWorkspaceSettings(ctx, &FindWorkspaceSetting{})
	if err != nil {
		return err
	}

	workspaceGeneralSetting, err := s.GetWorkspaceGeneralSetting(ctx)
	if err != nil {
		return err
	}
	updateWorkspaceSetting := false
	for _, workspaceSetting := range workspaceSettings {
		if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_LICENSE_KEY {
			workspaceGeneralSetting.LicenseKey = workspaceSetting.Raw
			updateWorkspaceSetting = true
			if err := s.DeleteWorkspaceSetting(ctx, storepb.WorkspaceSettingKey_WORKSPACE_SETTING_LICENSE_KEY); err != nil {
				return err
			}
		} else if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_CUSTOM_STYLE {
			workspaceGeneralSetting.CustomStyle = workspaceSetting.Raw
			updateWorkspaceSetting = true
			if err := s.DeleteWorkspaceSetting(ctx, storepb.WorkspaceSettingKey_WORKSPACE_SETTING_CUSTOM_STYLE); err != nil {
				return err
			}
		} else if workspaceSetting.Key == storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SECRET_SESSION {
			workspaceGeneralSetting.SecretSession = workspaceSetting.Raw
			updateWorkspaceSetting = true
			if err := s.DeleteWorkspaceSetting(ctx, storepb.WorkspaceSettingKey_WORKSPACE_SETTING_SECRET_SESSION); err != nil {
				return err
			}
		}
	}
	if updateWorkspaceSetting {
		if _, err := s.UpsertWorkspaceSetting(ctx, &storepb.WorkspaceSetting{
			Key: storepb.WorkspaceSettingKey_WORKSPACE_SETTING_GENERAL,
			Value: &storepb.WorkspaceSetting_General{
				General: workspaceGeneralSetting,
			},
		}); err != nil {
			return err
		}
	}
	return nil
}
