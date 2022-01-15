/* global QUnit */

import { runStdGeometryTests } from '../../utils/qunit-utils';
import { PlaneGeometry, PlaneBufferGeometry } from '../../../../src/geometries/PlaneGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'PlaneGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				width: 10,
				height: 30,
				widthSegments: 3,
				heightSegments: 5
			};

			geometries = [
				new PlaneGeometry(),
				new PlaneGeometry( parameters.width ),
				new PlaneGeometry( parameters.width, parameters.height ),
				new PlaneGeometry( parameters.width, parameters.height, parameters.widthSegments ),
				new PlaneGeometry( parameters.width, parameters.height, parameters.widthSegments, parameters.heightSegments ),
				new PlaneBufferGeometry()
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
