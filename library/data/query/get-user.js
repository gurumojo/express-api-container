'use strict';

module.exports = `
WITH
	entity_x_aspect AS (
		SELECT
			e.id,
			e.uuid,
			array_agg( a.name ) AS aspects,
			e.created,
			e.updated
		FROM entity e
		JOIN entity_aspect ea ON ea.entity_id = e.id
		JOIN aspect a ON a.id = ea.aspect_id
		$[where^]
		GROUP BY e.id
	),
	aspect_x_warrant AS (
		SELECT
			a.name AS aspect,
			array_agg( w.name ) AS warrants
		FROM aspect a
		JOIN aspect_warrant aw ON aw.aspect_id = a.id
		JOIN warrant w ON w.id = aw.warrant_id
		GROUP BY a.id
	),
	authority AS (
		SELECT
			e_a.id,
			e_a.uuid,
			json_object_agg( a_w.aspect, a_w.warrants )::text AS aspect,
			e_a.created,
			e_a.updated
		FROM entity_x_aspect e_a
		JOIN aspect_x_warrant a_w ON a_w.aspect = ANY( e_a.aspects )
		GROUP BY e_a.id, e_a.uuid, e_a.created, e_a.updated
	)
SELECT
	x.id,
	p.name,
	x.uuid,
	x.aspect,
	p.email,
	p.description,
	p.content,
	LEAST( p.created, x.created ) AS created,
	GREATEST( p.updated, x.updated ) AS updated
FROM authority x
JOIN profile p on p.entity_id = x.id
GROUP BY
	x.id, p.name, x.uuid, x.aspect, p.email, p.description,
	p.content, p.created, x.created, p.updated, x.updated
`;
