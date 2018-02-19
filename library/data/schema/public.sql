-- Public Schema Definition for Node Express HTTP API


DROP TYPE IF EXISTS node;
CREATE TYPE node AS ENUM
	('gateway','lambda','event','resource','cache','database');


CREATE OR REPLACE FUNCTION updated_timestamp()
RETURNS TRIGGER AS $$BEGIN
    NEW.updated = now();
    RETURN NEW;	
END;$$ LANGUAGE plpgsql;

-- To limit the search path when a function performs queries:
-- ... SECURITY DEFINER SET search_path = $[schema], pg_temp;
-- REVOKE ALL ON FUNCTION updated_timestamp() FROM PUBLIC;
-- GRANT EXECUTE ON FUNCTION updated_timestamp() TO $[role];

-- BEGIN;
-- 	DROP TRIGGER IF EXISTS updated_xxx_trigger ON xxx;
-- 	CREATE TRIGGER updated_xxx_trigger BEFORE UPDATE ON xxx
-- 		FOR EACH ROW EXECUTE PROCEDURE updated_timestamp();
-- COMMIT;


DROP TABLE IF EXISTS config;
CREATE TABLE config (
	id      SERIAL    PRIMARY KEY,
	uuid    UUID      NOT NULL UNIQUE,
	name    TEXT      NOT NULL,
	json    JSONB     NOT NULL,
	type    node      DEFAULT 'resource',
	active  BOOLEAN   DEFAULT false,
	public  BOOLEAN   DEFAULT false,
	created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated TIMESTAMP DEFAULT NULL
);

DROP TRIGGER IF EXISTS updated_config_trigger ON config;
CREATE TRIGGER updated_config_trigger BEFORE UPDATE ON config
	FOR EACH ROW EXECUTE PROCEDURE updated_timestamp();


DROP TABLE IF EXISTS service;
CREATE TABLE service (
	id        SERIAL    PRIMARY KEY,
	image     TEXT      NOT NULL,
	container TEXT      NOT NULL,
	config    INTEGER   NOT NULL REFERENCES config(id),
	created   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated   TIMESTAMP DEFAULT NULL
);

DROP TRIGGER IF EXISTS updated_service_trigger ON service;
CREATE TRIGGER updated_service_trigger BEFORE UPDATE ON service
	FOR EACH ROW EXECUTE PROCEDURE updated_timestamp();


INSERT INTO config (uuid, name, active, json)
VALUES ('00000000-0000-0000-0000-000000000000', 'registry', true, '[]');

INSERT INTO service (config, image, container)
VALUES (1, 'express-api', 'api');




-- Public Schema Definition for Role Based Access Control

-- aspects define the warranted behavior of related entities


DROP TABLE IF EXISTS aspect;
CREATE TABLE aspect (
	id   SERIAL PRIMARY KEY,
	name TEXT   NOT NULL UNIQUE
); -- AKA role


DROP TABLE IF EXISTS entity;
CREATE TABLE entity (
	id          SERIAL PRIMARY KEY,
	uuid        UUID   NOT NULL UNIQUE,
	email       TEXT   NOT NULL UNIQUE,
	cipher      TEXT   NOT NULL,
	name        TEXT   DEFAULT NULL,
	description TEXT   DEFAULT NULL,
	created     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated     TIMESTAMP DEFAULT NULL
); -- AKA user

DROP TRIGGER IF EXISTS updated_entity_trigger ON entity;
CREATE TRIGGER updated_entity_trigger BEFORE UPDATE ON entity
	FOR EACH ROW EXECUTE PROCEDURE updated_timestamp();


DROP TABLE IF EXISTS warrant;
CREATE TABLE warrant (
	id   SERIAL PRIMARY KEY,
	name TEXT   NOT NULL
); -- AKA permission


DROP TABLE IF EXISTS aspect_entity;
CREATE TABLE aspect_entity (
	aspect INTEGER NOT NULL REFERENCES aspect(id),
	entity INTEGER NOT NULL REFERENCES entity(id),
	UNIQUE (aspect, entity)
); -- 1:n aspect to entity joins AKA role users


DROP TABLE IF EXISTS aspect_warrant;
CREATE TABLE aspect_warrant (
	aspect  INTEGER NOT NULL REFERENCES aspect(id),
	warrant INTEGER NOT NULL REFERENCES warrant(id),
	UNIQUE (aspect, warrant)
); -- 1:n aspect to warrant joins AKA role permissions


INSERT INTO aspect (name)
VALUES ('gurumojo');

INSERT INTO entity (email, uuid, cipher)
VALUES ('theguy@gurumojo.net', '00000000-0000-0000-0000-000000000000', '012ABC');

INSERT INTO warrant (name)
VALUES ('*');

INSERT INTO aspect_entity (aspect, entity)
VALUES (1, 1);

INSERT INTO aspect_warrant (aspect, warrant)
VALUES (1, 1);

