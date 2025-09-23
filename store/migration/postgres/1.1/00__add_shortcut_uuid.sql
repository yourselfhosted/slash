-- Add UUID column to shortcut table
ALTER TABLE shortcut ADD COLUMN uuid TEXT NOT NULL DEFAULT '';

-- Create index on UUID column for faster lookups
CREATE INDEX idx_shortcut_uuid ON shortcut(uuid);