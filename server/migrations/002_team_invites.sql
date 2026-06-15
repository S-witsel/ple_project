-- Create invite codes for team membership

CREATE TABLE IF NOT EXISTS team_invites (
  id SERIAL PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);
