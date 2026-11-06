import { assert, describe, test } from 'vitest';

import { Object3D } from '../../../../src/core/Object3D.js';
import { Line } from '../../../../src/objects/Line.js';
import { LineSegments } from '../../../../src/objects/LineSegments.js';

describe( 'Objects', () => {

	describe( 'LineSegments', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const lineSegments = new LineSegments();
			assert.strictEqual( lineSegments instanceof Object3D, true, 'LineSegments extends from Object3D' );
			assert.strictEqual( lineSegments instanceof Line, true, 'LineSegments extends from Line' );

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new LineSegments();
			assert.ok( object, 'Can instantiate a LineSegments.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new LineSegments();
			assert.ok(
				object.type === 'LineSegments',
				'LineSegments.type should be LineSegments'
			);

		} );

		// PUBLIC
		test( 'isLineSegments', () => {

			const object = new LineSegments();
			assert.ok(
				object.isLineSegments,
				'LineSegments.isLineSegments should be true'
			);

		} );

	} );

} );
