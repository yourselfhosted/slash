-- migration_history
CREATE TABLE migration_history (
  version TEXT NOT NULL PRIMARY KEY,
  created_ts BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())
);

-- workspace_setting
CREATE TABLE workspace_setting (
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL
);

-- user
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  created_ts BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  updated_ts BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  row_status TEXT NOT NULL CHECK (row_status IN ('NORMAL', 'ARCHIVED')) DEFAULT 'NORMAL',
  email TEXT NOT NULL UNIQUE,
  nickname TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER')) DEFAULT 'USER'
);

CREATE INDEX idx_user_email ON "user"(email);

-- user_setting
CREATE TABLE user_setting (
  user_id INTEGER REFERENCES "user"(id) NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (user_id, key)
);

-- shortcut
CREATE TABLE shortcut (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER REFERENCES "user"(id) NOT NULL,
  created_ts BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  updated_ts BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
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
  id SERIAL PRIMARY KEY,
  creator_id INTEGER REFERENCES "user"(id) NOT NULL,
  created_ts BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  type TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR')) DEFAULT 'INFO',
  payload TEXT NOT NULL DEFAULT '{}'
);

-- collection
CREATE TABLE collection (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER REFERENCES "user"(id) NOT NULL,
  created_ts BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  updated_ts BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  shortcut_ids INTEGER ARRAY NOT NULL,
  visibility TEXT NOT NULL CHECK (visibility IN ('PRIVATE', 'WORKSPACE', 'PUBLIC')) DEFAULT 'PRIVATE'
);

CREATE INDEX idx_collection_name ON collection(name);

-- memo
CREATE TABLE memo (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER REFERENCES "user"(id) NOT NULL,
  created_ts BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  updated_ts BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  row_status TEXT NOT NULL CHECK (row_status IN ('NORMAL', 'ARCHIVED')) DEFAULT 'NORMAL',
  name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL CHECK (visibility IN ('PRIVATE', 'WORKSPACE', 'PUBLIC')) DEFAULT 'PRIVATE',
  tag TEXT NOT NULL DEFAULT ''
);

CREATE INDEX idx_memo_name ON memo(name);
