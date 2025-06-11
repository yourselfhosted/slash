UPDATE shortcut SET visibility = 'WORKSPACE' WHERE visibility = 'PRIVATE';

ALTER TABLE shortcut RENAME TO shortcut_old;

CREATE TABLE shortcut (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  created_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  row_status TEXT NOT NULL CHECK (row_status IN ('NORMAL', 'ARCHIVED')) DEFAULT 'NORMAL',
  name TEXT NOT NULL UNIQUE,
  link TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'WORKSPACE',
  tag TEXT NOT NULL DEFAULT '',
  og_metadata TEXT NOT NULL DEFAULT '{}'
);

INSERT INTO shortcut (
  id, 
  creator_id, 
  created_ts, 
  updated_ts, 
  row_status, 
  name, 
  link, 
  title, 
  description, 
  visibility, 
  tag, 
  og_metadata
)
SELECT 
  id, 
  creator_id, 
  created_ts, 
  updated_ts, 
  row_status, 
  name, 
  link, 
  title, 
  description, 
  visibility, 
  tag, 
  og_metadata
FROM shortcut_old;

DROP TABLE shortcut_old;

UPDATE collection SET visibility = 'WORKSPACE' WHERE visibility = 'PRIVATE';

ALTER TABLE collection RENAME TO collection_old;

CREATE TABLE collection (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  created_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  shortcut_ids INTEGER[] NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'WORKSPACE'
);

INSERT INTO collection (
  id,
  creator_id,
  created_ts,
  updated_ts,
  name,
  title,
  description,
  shortcut_ids,
  visibility
)
SELECT
  id,
  creator_id,
  created_ts,
  updated_ts,
  name,
  title,
  description,
  shortcut_ids,
  visibility
FROM collection_old;

DROP TABLE collection_old;
