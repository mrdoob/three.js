/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Line } from '../../../../src/objects/Line.js';
import { LineSegments } from '../../../../src/objects/LineSegments.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'LineSegments', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const lineSegments = new LineSegments();
			assert.strictEqual( lineSegments instanceof Object3D, true, 'LineSegments extends from Object3D' );
			assert.strictEqual( lineSegments instanceof Line, true, 'LineSegments extends from Line' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new LineSegments();
			assert.ok( object, 'Can instantiate a LineSegments.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new LineSegments();
			assert.ok(
				object.type === 'LineSegments',
				'LineSegments.type should be LineSegments'
			);

		} );

		// PUBLIC
		QUnit.test( 'isLineSegments', ( assert ) => {

			const object = new LineSegments();
			assert.ok(
				object.isLineSegments,
				'LineSegments.isLineSegments should be true'
			);

		} );

		QUnit.todo( 'computeLineDistances', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
