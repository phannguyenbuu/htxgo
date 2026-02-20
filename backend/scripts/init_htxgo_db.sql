-- HTX Go PostgreSQL schema + seed

CREATE TABLE IF NOT EXISTS units (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) UNIQUE NOT NULL,
  is_virtual BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(32),
  license_number VARCHAR(64),
  unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  plate_number VARCHAR(32) UNIQUE NOT NULL,
  type VARCHAR(64),
  capacity VARCHAR(64),
  unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  doc_type VARCHAR(64),
  number VARCHAR(64),
  issued_date DATE,
  expiry_date DATE,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(16) NOT NULL DEFAULT 'driver',
  driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  auth_provider VARCHAR(32) NOT NULL DEFAULT 'local',
  google_sub VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  target_type VARCHAR(16) NOT NULL DEFAULT 'all',
  unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO units(name, is_virtual)
VALUES
  ('HTX MINH VY', FALSE),
  ('HTX THANH VY', FALSE),
  ('HTX KIM THINH', FALSE),
  ('HTX NGHIA PHAT', FALSE),
  ('HTX-VIRTUAL', TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO drivers(full_name, phone, license_number, unit_id)
SELECT 'Nguyen Van Binh', '0987654321', 'B2-123456', u.id
FROM units u
WHERE u.name = 'HTX MINH VY'
AND NOT EXISTS (
  SELECT 1 FROM drivers d WHERE d.full_name = 'Nguyen Van Binh' AND d.license_number = 'B2-123456'
);

INSERT INTO vehicles(plate_number, type, capacity, unit_id, driver_id)
SELECT
  '50E57390',
  'O to con',
  '5 cho',
  u.id,
  d.id
FROM units u
JOIN drivers d ON d.full_name = 'Nguyen Van Binh'
WHERE u.name = 'HTX MINH VY'
AND NOT EXISTS (SELECT 1 FROM vehicles v WHERE v.plate_number = '50E57390');

INSERT INTO documents(title, doc_type, number, issued_date, expiry_date, driver_id, vehicle_id)
SELECT
  'Phu hieu xe',
  'PHU_HIEU',
  'HD7926015983',
  DATE '2024-01-16',
  DATE '2033-01-16',
  d.id,
  v.id
FROM drivers d
JOIN vehicles v ON v.plate_number = '50E57390'
WHERE d.full_name = 'Nguyen Van Binh'
AND NOT EXISTS (
  SELECT 1 FROM documents x WHERE x.doc_type = 'PHU_HIEU' AND x.number = 'HD7926015983'
);

INSERT INTO users(username, password_hash, role, driver_id)
SELECT
  'admin',
  'scrypt:32768:8:1$JOvAPmU7xU8WkMhQ$7fc3700402ca02a80ebe48e3ee8f6eb7674b172ff64d561c07a222befaa6026619dc2c29bbd6cfa2a1ba8dd92502d25807244a8730d8c8efb5fef3aee23dbb7a',
  'admin',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

INSERT INTO users(username, password_hash, role, driver_id)
SELECT
  'driver01',
  'scrypt:32768:8:1$CUGejdcmUD5rNex9$3ab28f3ffa52242e8714bd64f85990fe0a61f41d0f4f52fd9057b6643aa7ac769def6119c56afe7f19dbdeff86b871fcb5055d338d70c5635aa9a1235d383afe',
  'driver',
  d.id
FROM drivers d
WHERE d.full_name = 'Nguyen Van Binh'
AND NOT EXISTS (SELECT 1 FROM users WHERE username = 'driver01');
