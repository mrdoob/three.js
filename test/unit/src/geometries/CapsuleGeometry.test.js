/* global QUnit */

import { runStdGeometryTests } from '../../utils/qunit-utils.js';
import { CapsuleGeometry, CapsuleBufferGeometry } from '../../../../src/geometries/CapsuleGeometry.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'CapsuleGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radiusTop: 2,
				radiusBottom: 2,
				height: 2,
				capSegments: 20,
				heightSegments: 20
			};

			geometries = [
				new CapsuleGeometry(),
				new CapsuleGeometry( parameters.radiusTop ),
				new CapsuleGeometry( parameters.radiusTop, parameters.radiusBottom ),
				new CapsuleGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height ),
				new CapsuleGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.capSegments ),
				new CapsuleGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.capSegments, parameters.heightSegments ),
				new CapsuleBufferGeometry(),
			];

		} );

		// INHERITANCE
		QUnit.todo( 'Extending', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
