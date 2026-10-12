CREATE TABLE IF NOT EXISTS visits (
  event_id TEXT PRIMARY KEY NOT NULL,
  visited_at INTEGER NOT NULL,
  path TEXT NOT NULL CHECK (path IN ('/', '/research', '/publications', '/grants', '/gallery', '/contact')),
  ip TEXT NOT NULL CHECK (length(ip) BETWEEN 2 AND 45)
);
CREATE INDEX IF NOT EXISTS visits_time ON visits (visited_at);

-- Cloudflare Console/Studio only: no HTTP endpoint exposes this view.
CREATE VIEW IF NOT EXISTS recent_visits AS
SELECT datetime(visited_at / 1000, 'unixepoch', '+8 hours') AS time_beijing,
       ip, path
FROM visits
WHERE visited_at >= (unixepoch() - 30 * 86400) * 1000
ORDER BY visited_at DESC;
