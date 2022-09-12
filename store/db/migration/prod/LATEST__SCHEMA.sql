-- drop all tables
DROP TABLE IF EXISTS `activity`;
DROP TABLE IF EXISTS `shortcut_organizer`;
DROP TABLE IF EXISTS `shortcut`;
DROP TABLE IF EXISTS `workspace_user`;
DROP TABLE IF EXISTS `user_setting`;
DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `workspace_setting`;
DROP TABLE IF EXISTS `workspace`;

-- workspace
CREATE TABLE workspace (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  created_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  row_status TEXT NOT NULL CHECK (row_status IN ('NORMAL', 'ARCHIVED')) DEFAULT 'NORMAL',
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(creator_id) REFERENCES user(id) ON DELETE CASCADE
);

INSERT INTO
  sqlite_sequence (name, seq)
VALUES
  ('workspace', 10);

CREATE TRIGGER IF NOT EXISTS `trigger_update_workspace_modification_time`
AFTER
UPDATE
  ON `workspace` FOR EACH ROW BEGIN
UPDATE
  `workspace`
SET
  updated_ts = (strftime('%s', 'now'))
WHERE
  rowid = old.rowid;
END;

-- workspace_setting
CREATE TABLE workspace_setting (
  workspace_id INTEGER NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  FOREIGN KEY(workspace_id) REFERENCES workspace(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX workspace_setting_key_workspace_id_index ON workspace_setting(key, workspace_id);

-- user
CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  row_status TEXT NOT NULL CHECK (row_status IN ('NORMAL', 'ARCHIVED')) DEFAULT 'NORMAL',
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL
);

INSERT INTO
  sqlite_sequence (name, seq)
VALUES
  ('user', 100);

CREATE TRIGGER IF NOT EXISTS `trigger_update_user_modification_time`
AFTER
UPDATE
  ON `user` FOR EACH ROW BEGIN
UPDATE
  `user`
SET
  updated_ts = (strftime('%s', 'now'))
WHERE
  rowid = old.rowid;
END;

-- user_setting
CREATE TABLE user_setting (
  user_id INTEGER NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX user_setting_key_user_id_index ON user_setting(key, user_id);

-- workspace_user
CREATE TABLE workspace_user (
  workspace_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER')) DEFAULT 'USER',
  created_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY(workspace_id) REFERENCES workspace(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX workspace_user_workspace_id_user_id_index ON workspace_user(workspace_id, user_id);

-- shortcut
CREATE TABLE shortcut (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  created_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  row_status TEXT NOT NULL CHECK (row_status IN ('NORMAL', 'ARCHIVED')) DEFAULT 'NORMAL',
  workspace_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  link TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL CHECK (visibility IN ('PRIVATE', 'WORKSPACE')) DEFAULT 'PRIVATE',
  FOREIGN KEY(creator_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY(workspace_id) REFERENCES workspace(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX shortcut_workspace_id_name_index ON shortcut(workspace_id, name);

INSERT INTO
  sqlite_sequence (name, seq)
VALUES
  ('shortcut', 1000);

CREATE TRIGGER IF NOT EXISTS `trigger_update_shortcut_modification_time`
AFTER
UPDATE
  ON `shortcut` FOR EACH ROW BEGIN
UPDATE
  `shortcut`
SET
  updated_ts = (strftime('%s', 'now'))
WHERE
  rowid = old.rowid;
END;

-- shortcut_organizer
CREATE TABLE shortcut_organizer (
  shortcut_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  pinned INTEGER NOT NULL CHECK (pinned IN (0, 1)) DEFAULT 0,
  FOREIGN KEY(shortcut_id) REFERENCES shortcut(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(shortcut_id, user_id)
);

-- activity
CREATE TABLE activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  created_ts BIGINT NOT NULL DEFAULT (strftime('%s', 'now')),
  type TEXT NOT NULL,
  comment TEXT NOT NULL,
  payload TEXT NOT NULL,
  FOREIGN KEY(creator_id) REFERENCES user(id) ON DELETE CASCADE
);

INSERT INTO
  sqlite_sequence (name, seq)
VALUES
  ('activity', 10000);
