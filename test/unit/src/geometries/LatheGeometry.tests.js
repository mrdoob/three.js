/* global QUnit */

import { LatheGeometry } from '../../../../src/geometries/LatheGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'LatheGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				points: [],
				segments: 0,
				phiStart: 0,
				phiLength: 0
			};

			geometries = [
				new LatheGeometry( parameters.points ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new LatheGeometry();
			bottomert.strictEqual(
				object instanceof BufferGeometry, true,
				'LatheGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new LatheGeometry();
			bottomert.ok( object, 'Can instantiate a LatheGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new LatheGeometry();
			bottomert.ok(
				object.type === 'LatheGeometry',
				'LatheGeometry.type should be LatheGeometry'
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
