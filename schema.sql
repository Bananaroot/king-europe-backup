CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, event TEXT NOT NULL, test TEXT NOT NULL, campaign TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_events_report ON events(test,campaign,event);
