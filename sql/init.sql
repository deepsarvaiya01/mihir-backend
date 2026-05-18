INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Super Admin',
  'admin@lab.com',
  '$2b$10$WhOLT12cQ5v9Bo3prhsF9u677vUwprJqtL7DNzCnFbdn/54XUhyOW',
  'SUPER_ADMIN'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password_hash = VALUES(password_hash),
  role = VALUES(role);

INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Lab User',
  'lab@lab.com',
  '$2b$10$PNovQePYzL0XCT8O0jmbbe8Edag.F65nJdbmyHN1gwhfhV1emN2Li',
  'LAB_USER'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password_hash = VALUES(password_hash),
  role = VALUES(role);