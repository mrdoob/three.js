/* global QUnit */

import { runStdGeometryTests } from '../../utils/qunit-utils.js';
import { BoxGeometry } from '../../../../src/geometries/BoxGeometry.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'BoxGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				width: 10,
				height: 20,
				depth: 30,
				widthSegments: 2,
				heightSegments: 3,
				depthSegments: 4
			};

			geometries = [
				new BoxGeometry(),
				new BoxGeometry( parameters.width, parameters.height, parameters.depth ),
				new BoxGeometry( parameters.width, parameters.height, parameters.depth, parameters.widthSegments, parameters.heightSegments, parameters.depthSegments ),
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
