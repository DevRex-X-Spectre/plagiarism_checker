-- 005: store a separate semantic embedding for project titles/topics
ALTER TABLE projects ADD COLUMN IF NOT EXISTS title_embedding JSONB;
CREATE INDEX IF NOT EXISTS idx_projects_title_embedding ON projects USING GIN (title_embedding);
