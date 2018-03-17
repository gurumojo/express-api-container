'use strict';

module.exports = `
WITH
	upsert_entity AS (
		INSERT INTO entity (uuid, cipher, salt)
		VALUES ($[uuid], $[cipher], $[salt])
		ON CONFLICT (uuid) DO UPDATE
			SET cipher = EXCLUDED.cipher,
				salt = EXCLUDED.salt
		RETURNING id, uuid
	),
	upsert_profile AS (
		INSERT INTO profile (entity_id, email, name, description, content)
		SELECT
			upsert_entity.id,
			$[email],
			$[name],
			$[description],
			$[content]
		FROM upsert_entity
		ON CONFLICT (email) DO UPDATE
			SET content = COALESCE(EXCLUDED.content, '{}'),
				description = EXCLUDED.description,
				email = EXCLUDED.email,
				name = EXCLUDED.name
		RETURNING entity_id AS id, (SELECT upsert_entity.uuid FROM upsert_entity)
	)
SELECT
	id,
	uuid
FROM upsert_profile
`;
