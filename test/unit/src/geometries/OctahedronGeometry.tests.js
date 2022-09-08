/* global QUnit */

import { runStdGeometryTests } from '../../utils/qunit-utils.js';
import { OctahedronGeometry } from '../../../../src/geometries/OctahedronGeometry.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'OctahedronGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				detail: undefined
			};

			geometries = [
				new OctahedronGeometry(),
				new OctahedronGeometry( parameters.radius ),
				new OctahedronGeometry( parameters.radius, parameters.detail ),
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
