INSERT INTO
  user (
    `id`,
    `username`,
    `nickname`,
    `email`,
    `password_hash`
  )
VALUES
  (
    11,
    'frank',
    'Frank',
    'frank@shortify.demo',
    -- raw password: secret
    '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK'
  );

INSERT INTO
  user (
    `id`,
    `username`,
    `nickname`,
    `email`,
    `password_hash`
  )
VALUES
  (
    12,
    'bob',
    'Bob',
    'bob@shortify.demo',
    -- raw password: secret
    '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK'
  );
