/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WireframeGeometry } from '../../../../src/geometries/WireframeGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module.todo( 'WireframeGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {};

			geometries = [
				new WireframeGeometry()
			];

		} );

		// INHERITANCE
		QUnit.test( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
