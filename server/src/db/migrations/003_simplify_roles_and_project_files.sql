-- 003: remove email verification, simplify roles, and keep uploaded project files
ALTER TABLE users DROP COLUMN IF EXISTS email_verified;
ALTER TABLE users DROP COLUMN IF EXISTS verify_token;
ALTER TABLE users DROP COLUMN IF EXISTS verify_expires;

UPDATE users SET role = 'student' WHERE role = 'lecturer';

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'users'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%role%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE users DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'users'::regclass
      AND conname = 'users_role_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'admin'));
  END IF;
END $$;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS original_file_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS file_size INTEGER;
