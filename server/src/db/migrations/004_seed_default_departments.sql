-- 004: default faculty departments
INSERT INTO departments (name, code, is_active)
VALUES
  ('Software Engineering', 'SWE', true),
  ('Computer Science', 'CS', true),
  ('Information System', 'IS', true),
  ('Information Technology', 'IT', true),
  ('Cyber Security', 'CYB', true)
ON CONFLICT (name) DO UPDATE
SET code = EXCLUDED.code,
    is_active = true;
