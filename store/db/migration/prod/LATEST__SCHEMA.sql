-- migration_history
CREATE TABLE migration_history (
  version TEXT NOT NULL PRIMARY KEY,
  created_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- workspace_setting
CREATE TABLE workspace_setting (
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL
);

-- user
CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  row_status TEXT NOT NULL CHECK (row_status IN ('NORMAL', 'ARCHIVED')) DEFAULT 'NORMAL',
  email TEXT NOT NULL UNIQUE,
  nickname TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER')) DEFAULT 'USER'
);

CREATE INDEX idx_user_email ON user(email);

-- user_setting
CREATE TABLE user_setting (
  user_id INTEGER NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  UNIQUE(user_id, key)
);

-- shortcut
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
  visibility TEXT NOT NULL CHECK (visibility IN ('PRIVATE', 'WORKSPACE', 'PUBLIC')) DEFAULT 'PRIVATE',
  tag TEXT NOT NULL DEFAULT '',
  og_metadata TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_shortcut_name ON shortcut(name);

-- activity
CREATE TABLE activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  created_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  type TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR')) DEFAULT 'INFO',
  payload TEXT NOT NULL DEFAULT '{}'
);
