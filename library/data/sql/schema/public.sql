-- Public Schema Definition for Node Express API Services


CREATE TYPE node AS ENUM ('gateway','lambda','event','resource','cache','database');

CREATE TABLE config (
	id     SERIAL  PRIMARY KEY,
	uuid   UUID    NOT NULL UNIQUE,
	name   TEXT    NOT NULL,
	active BOOLEAN DEFAULT false,
	public BOOLEAN DEFAULT false,
	type   node    DEFAULT 'resource',
	json   JSONB   NOT NULL
);

CREATE TABLE service (
	id        SERIAL  PRIMARY KEY,
	image     TEXT    NOT NULL,
	config    INTEGER NOT NULL REFERENCES config(id),
	container TEXT    NOT NULL
);


INSERT INTO config (uuid, name, active, json)
VALUES ('00000000-0000-0000-0000-000000000000', 'registry', true, '[]');

INSERT INTO service (config, image, container)
VALUES (1, 'express-api', 'api');




-- Public Schema Definition for Role Based Access Control

-- aspects define the warranted behavior of related entities


CREATE TABLE aspect (
	id   SERIAL PRIMARY KEY,
	name TEXT   NOT NULL
); -- AKA role

CREATE TABLE entity (
	id     SERIAL  PRIMARY KEY,
	cipher TEXT    NOT NULL,
	email  TEXT    NOT NULL UNIQUE,
	name   TEXT    NOT NULL
); -- AKA user

CREATE TABLE warrant (
	id   SERIAL PRIMARY KEY,
	name TEXT   NOT NULL
); -- AKA permission


CREATE TABLE aspect_entity (
	aspect  INTEGER NOT NULL REFERENCES aspect(id),
	entity INTEGER NOT NULL REFERENCES entity(id),
	UNIQUE (aspect, entity)
); -- 1:n aspect to entity joins AKA role users

CREATE TABLE aspect_warrant (
	aspect  INTEGER NOT NULL REFERENCES aspect(id),
	warrant INTEGER NOT NULL REFERENCES warrant(id),
	UNIQUE (aspect, warrant)
); -- 1:n aspect to warrant joins AKA role permissions


INSERT INTO aspect (name)
VALUES ('gurumojo');

INSERT INTO warrant (name)
VALUES ('*');

INSERT INTO entity (name, email, cipher)
VALUES ('theguy', 'theguy@gurumojo.net', '0123456789');

INSERT INTO aspect_entity (aspect, entity)
VALUES (1, 1);

INSERT INTO aspect_warrant (aspect, warrant)
VALUES (1, 1);

