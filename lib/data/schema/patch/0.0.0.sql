-- Public Schema Patch 0.0.0


CREATE TABLE IF NOT EXISTS patch (
	version     TEXT      PRIMARY KEY,
	timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	description TEXT      DEFAULT NULL
);

INSERT INTO patch (version, description)
VALUES ('0.0.0', 'add schema revision tracking table')
ON CONFLICT DO NOTHING;

