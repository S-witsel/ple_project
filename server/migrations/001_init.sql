-- Initial schema for PLE project

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  team_id TEXT REFERENCES teams(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tasklists (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  tasklist_id TEXT REFERENCES tasklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Game tables: abilities and equipment catalog
CREATE TABLE IF NOT EXISTS abilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  power INTEGER,
  description TEXT
);

CREATE TABLE IF NOT EXISTS equipment (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slot TEXT,
  stats JSONB,
  description TEXT
);

-- Player character builds (one per user per project)
CREATE TABLE IF NOT EXISTS characters (
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  stats JSONB,
  abilities JSONB,
  equipment JSONB,
  inventory JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

-- Optional: seed abilities and equipment from gameData if desired via SQL inserts

