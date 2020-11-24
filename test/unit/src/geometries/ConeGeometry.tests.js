/* global QUnit */

import { runStdGeometryTests } from '../../utils/qunit-utils';
import { ConeBufferGeometry } from '../../../../src/geometries/ConeBufferGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'ConeBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			geometries = [
				new ConeBufferGeometry()
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
