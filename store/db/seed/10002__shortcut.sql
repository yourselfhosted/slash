INSERT INTO
  shortcut (
    `id`,
    `creator_id`,
    `name`,
    `link`,
    `visibility`
  )
VALUES
  (
    1,
    101,
    'memos',
    'https://usememos.com',
    'PUBLIC'
  );

INSERT INTO
  shortcut (
    `id`,
    `creator_id`,
    `name`,
    `link`,
    `visibility`
  )
VALUES
  (
    2,
    101,
    'sqlchat',
    'https://www.sqlchat.ai',
    'WORKSPACE'
  );

INSERT INTO
  shortcut (
    `id`,
    `creator_id`,
    `name`,
    `link`,
    `visibility`,
    `og_metadata`
  )
VALUES
  (
    3,
    101,
    'schema-change',
    'https://www.bytebase.com/blog/how-to-handle-database-schema-change/#what-is-a-database-schema-change',
    'PUBLIC',
    '{"title":"How to Handle Database Migration / Schema Change?","description":"A database schema is the structure of a database, which describes the relationships between the different tables and fields in the database. A database schema change, also known as schema migration, or simply migration refers to any alteration to this structure, such as adding a new table, modifying the data type of a field, or changing the relationships between tables.","image":"https://www.bytebase.com/_next/image/?url=%2Fcontent%2Fblog%2Fhow-to-handle-database-schema-change%2Fchange.webp\u0026w=2048\u0026q=75"}'
  );

INSERT INTO
  shortcut (
    `id`,
    `creator_id`,
    `name`,
    `link`,
    `visibility`
  )
VALUES
  (
    4,
    102,
    'stevenlgtm',
    'https://github.com/boojack',
    'PUBLIC'
  );
