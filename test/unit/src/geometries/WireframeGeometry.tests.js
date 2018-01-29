/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WireframeGeometry } from '../../../../src/geometries/WireframeGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'WireframeGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {};

			geometries = [
				new WireframeGeometry()
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
