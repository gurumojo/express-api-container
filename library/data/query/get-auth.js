'use strict';

module.exports = `
WITH
	a_w AS (
		SELECT
			a.name AS an,
			w.name AS wn
		FROM aspect a
		JOIN aspect_warrant aw ON aw.aspect = a.id
		JOIN warrant w ON w.id = aw.warrant
	),
	a_e AS (
		SELECT
			a.name AS an,
			e.uuid AS en
		FROM aspect a
		JOIN aspect_entity ae ON ae.aspect = a.id
		JOIN entity e ON e.id = ae.entity
		WHERE e.id = $[entity]
	)
SELECT
	a_e.an,
	a_e.en,
	array_agg(a_w.wn)
FROM a_e
JOIN a_w ON a_e.an = a_w.an
GROUP BY a_e.an, a_w.an, a_e.en
`;
