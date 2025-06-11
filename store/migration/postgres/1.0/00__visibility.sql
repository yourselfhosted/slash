ALTER TABLE shortcut DROP CONSTRAINT IF EXISTS shortcut_visibility_check;

ALTER TABLE shortcut ALTER COLUMN visibility SET DEFAULT 'WORKSPACE';

UPDATE shortcut SET visibility = 'WORKSPACE' WHERE visibility = 'PRIVATE';

ALTER TABLE collection DROP CONSTRAINT IF EXISTS collection_visibility_check;

ALTER TABLE collection ALTER COLUMN visibility SET DEFAULT 'WORKSPACE';

UPDATE collection SET visibility = 'WORKSPACE' WHERE visibility = 'PRIVATE';
