INSERT INTO 
  user (
    `id`, 
    `email`,
    `name`, 
    `password_hash`
  )
VALUES
  (
    101, 
    'demo@iamcorgi.com',
    'Demo Host',
    -- raw password: secret
    '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK'
  );

INSERT INTO 
  user (
    `id`, 
    `email`,
    `name`, 
    `password_hash`
  )
VALUES
  (
    102, 
    'jack@iamcorgi.com',
    'Jack',
    -- raw password: secret
    '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK'
  );

INSERT INTO 
  user (
    `id`, 
    `row_status`, 
    `email`,
    `name`, 
    `password_hash`
  )
VALUES
  (
    103, 
    'ARCHIVED', 
    'bob@iamcorgi.com',
    'Bob',
    -- raw password: secret
    '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK'
  );