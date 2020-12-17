/* global QUnit */

import { runStdGeometryTests } from '../../utils/qunit-utils';
import { PolyhedronBufferGeometry } from '../../../../src/geometries/PolyhedronBufferGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'PolyhedronBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			var vertices = [
				1, 1, 1, 	- 1, - 1, 1, 	- 1, 1, - 1, 	1, - 1, - 1
			];

			var indices = [
				2, 1, 0, 	0, 3, 2,	1, 3, 0,	2, 3, 1
			];

			geometries = [
				new PolyhedronBufferGeometry( vertices, indices )
			];

		} );

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
