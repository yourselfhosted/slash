INSERT INTO
  user (
    `id`,
    `role`,
    `email`,
    `nickname`,
    `password_hash`
  )
VALUES
  (
    101,
    'ADMIN',
    'slash@yourselfhosted.com',
    'Slasher',
    '$2a$10$H8HBWGcG/hoePhFy5SiNKOHxMD6omIpyEEWbl/fIorFC814bXW.Ua'
  );

INSERT INTO
  user (
    `id`,
    `role`,
    `email`,
    `nickname`,
    `password_hash`
  )
VALUES
  (
    102,
    'USER',
    'steven@yourselfhosted.com',
    'Steven',
    -- raw password: secret
    '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK'
  );
