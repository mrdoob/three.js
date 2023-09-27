/* global QUnit */

import { CapsuleGeometry } from '../../../../src/geometries/CapsuleGeometry.js';

import { LatheGeometry } from '../../../../src/geometries/LatheGeometry.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'CapsuleGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radius: 2,
				length: 2,
				capSegments: 20,
				radialSegments: 20
			};

			geometries = [
				new CapsuleGeometry(),
				new CapsuleGeometry( parameters.radius ),
				new CapsuleGeometry( parameters.radius, parameters.length ),
				new CapsuleGeometry( parameters.radius, parameters.length, parameters.capSegments ),
				new CapsuleGeometry( parameters.radius, parameters.length, parameters.capSegments, parameters.radialSegments ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new CapsuleGeometry();
			assert.strictEqual(
				object instanceof LatheGeometry, true,
				'CapsuleGeometry extends from LatheGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new CapsuleGeometry();
			assert.ok( object, 'Can instantiate a CapsuleGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new CapsuleGeometry();
			assert.ok(
				object.type === 'CapsuleGeometry',
				'CapsuleGeometry.type should be CapsuleGeometry'
			);

		} );

		QUnit.todo( 'parameters', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// STATIC
		QUnit.todo( 'fromJSON', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
