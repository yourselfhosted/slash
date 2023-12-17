-- collection
CREATE TABLE collection (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  created_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  shortcut_ids INTEGER[] NOT NULL,
  visibility TEXT NOT NULL CHECK (visibility IN ('PRIVATE', 'WORKSPACE', 'PUBLIC')) DEFAULT 'PRIVATE'
);

CREATE INDEX idx_collection_name ON collection(name);
