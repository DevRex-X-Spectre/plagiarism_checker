-- 002: Tables
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           CITEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  reset_token     TEXT,
  reset_expires   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS departments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT UNIQUE NOT NULL,
  code       TEXT UNIQUE,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  abstract      TEXT NOT NULL,
  author_name   TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES departments(id),
  year          INTEGER NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  uploaded_by   UUID NOT NULL REFERENCES users(id),
  embedding     JSONB NOT NULL,
  file_name     TEXT,
  original_file_name TEXT,
  mime_type     TEXT,
  file_size     INTEGER,
  is_deleted    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_dept ON projects(department_id) WHERE NOT is_deleted;
CREATE INDEX idx_projects_year ON projects(year) WHERE NOT is_deleted;
CREATE INDEX idx_projects_uploaded_by ON projects(uploaded_by) WHERE NOT is_deleted;
CREATE INDEX idx_projects_embedding ON projects USING GIN (embedding);

CREATE TABLE IF NOT EXISTS similarity_checks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id),
  query_text TEXT NOT NULL,
  threshold  NUMERIC(4,3) NOT NULL,
  results    JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_similarity_user ON similarity_checks(user_id);
CREATE INDEX idx_similarity_created ON similarity_checks(created_at DESC);
