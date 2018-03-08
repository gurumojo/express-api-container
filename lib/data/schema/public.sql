-- Public Schema Definition for Node Express HTTP API


DROP TYPE IF EXISTS node CASCADE;
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


DROP TABLE IF EXISTS config CASCADE;
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

CREATE TRIGGER updated_service_trigger BEFORE UPDATE ON service
	FOR EACH ROW EXECUTE PROCEDURE updated_timestamp();



INSERT INTO config (uuid, name, active, json)
VALUES ('00000000-0000-0000-0000-000000000000', 'registry', true, '[]');

INSERT INTO service (config, image, container)
VALUES (1, 'express-api', 'api');





-- Public Schema Definition for Role Based Access Control

-- aspects define the warranted behavior of related entities


DROP TABLE IF EXISTS entity CASCADE;
CREATE TABLE entity (
	id          SERIAL    PRIMARY KEY,
	uuid        UUID      NOT NULL UNIQUE,
	cipher      TEXT      NOT NULL,
	salt        TEXT      NOT NULL,
	created     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated     TIMESTAMP DEFAULT NULL
); -- AKA user credentials

CREATE TRIGGER updated_entity_trigger BEFORE UPDATE ON entity
	FOR EACH ROW EXECUTE PROCEDURE updated_timestamp();


DROP TABLE IF EXISTS profile;
CREATE TABLE profile (
	id          SERIAL    PRIMARY KEY,
	entity_id   INTEGER   NOT NULL REFERENCES entity(id),
	email       TEXT      NOT NULL UNIQUE,
	name        TEXT      DEFAULT NULL,
	description TEXT      DEFAULT NULL,
	content     JSONB     DEFAULT '{}',
	created     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated     TIMESTAMP DEFAULT NULL
); -- AKA user information

CREATE TRIGGER updated_profile_trigger BEFORE UPDATE ON profile
	FOR EACH ROW EXECUTE PROCEDURE updated_timestamp();


DROP TABLE IF EXISTS aspect;
CREATE TABLE aspect (
	id          SERIAL PRIMARY KEY,
	name        TEXT   NOT NULL UNIQUE,
	description TEXT   NOT NULL
); -- AKA role


DROP TABLE IF EXISTS warrant;
CREATE TABLE warrant (
	id          SERIAL PRIMARY KEY,
	name        TEXT   NOT NULL,
	description TEXT   NOT NULL
); -- AKA permission


DROP TABLE IF EXISTS entity_aspect;
CREATE TABLE entity_aspect (
	aspect_id INTEGER NOT NULL,
	entity_id INTEGER NOT NULL,
	UNIQUE (aspect_id, entity_id)
); -- n:n entity to aspect joins AKA user roles


DROP TABLE IF EXISTS aspect_warrant;
CREATE TABLE aspect_warrant (
	aspect_id  INTEGER NOT NULL,
	warrant_id INTEGER NOT NULL,
	UNIQUE (aspect_id, warrant_id)
); -- n:n aspect to warrant joins AKA role permissions


DROP TABLE IF EXISTS token;
CREATE TABLE token (
	id      SERIAL    PRIMARY KEY,
	sub     UUID      NOT NULL UNIQUE REFERENCES entity(uuid),
	refresh TEXT      NOT NULL UNIQUE,
	created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated TIMESTAMP DEFAULT NULL
); -- AKA request authorization

CREATE TRIGGER updated_token_trigger BEFORE UPDATE ON token
	FOR EACH ROW EXECUTE PROCEDURE updated_timestamp();



INSERT INTO entity (uuid, cipher, salt)
VALUES
('00000000-0000-0000-0000-000000000000', 'd5a73df5fda49b54e2f0bc17329f72dce076650d707fd91abdbf71300c8b5005944c1708a354f422af1558a11fd7730b4930dd945f5ce1c35e4acd3cc4bf5e9f', 'de57b60e14dc1ea4218e05781df293ef28bd15be17d032e371e8137b209cc4b21ed7d99af3f5ddf5116157052ed2cd7123df056267b2d0db688b5b9cf3cd8abe'),
('11111111-1111-1111-1111-111111111111', 'd5a73df5fda49b54e2f1bc17329f72dce176651d717fd91abdbf71311c8b5115944c1718a354f422af1558a11fd7731b4931dd945f5ce1c35e4acd3cc4bf5e9f', 'de57b61e14dc1ea4218e15781df293ef28bd15be17d132e371e8137b219cc4b21ed7d99af3f5ddf5116157152ed2cd7123df156267b2d1db688b5b9cf3cd8abe');

INSERT INTO profile (entity_id, email, name, description)
VALUES
(1, 'theguy@gurumojo.net', 'theguy', 'The Guy @ Guru Mojo'),
(2, 'thebot@gurumojo.net', 'thebot', 'The Bot @ Guru Mojo');

INSERT INTO aspect (name, description)
VALUES
('gurumojo', 'ops role'),
('ohnomojo', 'user role'),
('nadamojo', 'guest role');

INSERT INTO warrant (name, description)
VALUES
('*', 'ops.meta permission'),
('@', 'user.meta permission'),
('!', 'guest.meta permission');

INSERT INTO entity_aspect (entity_id, aspect_id)
VALUES (1, 1), (1, 2), (2, 3);

INSERT INTO aspect_warrant (aspect_id, warrant_id)
VALUES (1, 1), (2, 2), (3, 3);

INSERT INTO token (sub, refresh)
VALUES ('00000000-0000-0000-0000-000000000000', 'JWT');

