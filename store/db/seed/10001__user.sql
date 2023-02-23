INSERT INTO
  user (
    `id`,
    `email`,
    `display_name`,
    `password_hash`,
    `open_id`
  )
VALUES
  (
    101,
    'frank@iamcorgi.com',
    'Frank',
    -- raw password: secret
    '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK',
    'frank_open_id'
  );

INSERT INTO
  user (
    `id`,
    `email`,
    `display_name`,
    `password_hash`,
    `open_id`
  )
VALUES
  (
    102,
    'bob@iamcorgi.com',
    'Bob',
    -- raw password: secret
    '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK',
    'bob_open_id'
  );