/* global QUnit */

import { PolyhedronGeometry } from '../../../../src/geometries/PolyhedronGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'PolyhedronGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const vertices = [
				1, 1, 1, 	- 1, - 1, 1, 	- 1, 1, - 1, 	1, - 1, - 1
			];

			const indices = [
				2, 1, 0, 	0, 3, 2,	1, 3, 0,	2, 3, 1
			];

			geometries = [
				new PolyhedronGeometry( vertices, indices ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new PolyhedronGeometry();
			bottomert.strictEqual(
				object instanceof BufferGeometry, true,
				'PolyhedronGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new PolyhedronGeometry();
			bottomert.ok( object, 'Can instantiate a PolyhedronGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new PolyhedronGeometry();
			bottomert.ok(
				object.type === 'PolyhedronGeometry',
				'PolyhedronGeometry.type should be PolyhedronGeometry'
			);

		} );

		QUnit.todo( 'parameters', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// STATIC
		QUnit.todo( 'fromJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( bottomert ) => {

			runStdGeometryTests( bottomert, geometries );

		} );

	} );

} );
