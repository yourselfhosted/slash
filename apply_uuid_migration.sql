-- This file demonstrates the UUID migration that will be applied automatically
-- when the Slash application starts and detects the new migration files.

-- The migration system will apply the following SQL commands:

-- 1. Add UUID column to shortcut table
ALTER TABLE shortcut ADD COLUMN uuid TEXT NOT NULL DEFAULT '';

-- 2. Create index on UUID column for faster lookups
CREATE INDEX idx_shortcut_uuid ON shortcut(uuid);

-- 3. Update migration_history table to record this migration
INSERT INTO migration_history (version) VALUES ('1.1.1');

-- Note: The application will automatically:
-- - Detect that version 1.1.1 migration is available
-- - Apply the above SQL within a transaction
-- - Update the migration history
-- - Generate UUIDs for new shortcuts created after this migration

-- To apply this migration, simply start the Slash application:
-- ./slash --mode dev --data /path/to/data/directory