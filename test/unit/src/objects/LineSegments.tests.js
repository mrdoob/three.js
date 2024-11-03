/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Line } from '../../../../src/objects/Line.js';
import { LineSegments } from '../../../../src/objects/LineSegments.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'LineSegments', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const lineSegments = new LineSegments();
			bottomert.strictEqual( lineSegments instanceof Object3D, true, 'LineSegments extends from Object3D' );
			bottomert.strictEqual( lineSegments instanceof Line, true, 'LineSegments extends from Line' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new LineSegments();
			bottomert.ok( object, 'Can instantiate a LineSegments.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new LineSegments();
			bottomert.ok(
				object.type === 'LineSegments',
				'LineSegments.type should be LineSegments'
			);

		} );

		// PUBLIC
		QUnit.test( 'isLineSegments', ( bottomert ) => {

			const object = new LineSegments();
			bottomert.ok(
				object.isLineSegments,
				'LineSegments.isLineSegments should be true'
			);

		} );

		QUnit.todo( 'computeLineDistances', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
