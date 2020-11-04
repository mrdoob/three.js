/* global QUnit */

import { ParametricBufferGeometry } from '../../../../src/geometries/ParametricBufferGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'ParametricBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			geometries = [
				new ParametricBufferGeometry()
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
		QUnit.todo( 'Standard geometry tests', ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

} );
