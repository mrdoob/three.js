/* global QUnit */

import { runStdGeometryTests } from '../../utils/qunit-utils';
import { ConeGeometry } from '../../../../src/geometries/ConeGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'ConeGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			geometries = [
				new ConeGeometry()
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
