-- Public Schema Definition for a Node Express API

CREATE TYPE node AS ENUM ('gateway','lambda','event','resource','cache','database');

CREATE TABLE config (
	id     SERIAL  PRIMARY KEY,
	uuid   UUID    NOT NULL UNIQUE,
	name   TEXT    NOT NULL,
	json   JSONB   NOT NULL,
	active BOOLEAN DEFAULT false,
	public BOOLEAN DEFAULT false,
	type   node    DEFAULT 'resource'
);

CREATE TABLE service (
	id        SERIAL  PRIMARY KEY,
	config    INTEGER NOT NULL REFERENCES config(id),
	image     TEXT    NOT NULL,
	container TEXT    NOT NULL
);

INSERT INTO config (uuid, name, active, json)
VALUES
	('00000000-0000-0000-0000-000000000000', 'registry', true, '[]');
