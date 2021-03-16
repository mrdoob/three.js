/* global QUnit */

import { ParametricGeometry, ParametricBufferGeometry } from '../../../../src/geometries/ParametricGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'ParametricGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			geometries = [
				new ParametricGeometry(),
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
