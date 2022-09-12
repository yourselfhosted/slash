INSERT INTO 
  user (
    `id`, 
    `email`,
    `name`, 
    `password_hash`,
    `open_id`
  )
VALUES
  (
    101, 
    'demo@iamcorgi.com',
    'Demo Host',
    -- raw password: secret
    '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK',
    'demo_open_id'
  );
