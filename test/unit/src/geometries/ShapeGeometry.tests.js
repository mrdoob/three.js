/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import {
	ShapeGeometry,
	ShapeBufferGeometry
} from '../../../../src/geometries/ShapeGeometry';

import { Shape } from '../../../../src/extras/core/Shape';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'ShapeGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			var triangleShape = new Shape();
			triangleShape.moveTo( 0, - 1 );
			triangleShape.lineTo( 1, 1 );
			triangleShape.lineTo( - 1, 1 );

			geometries = [
				new ShapeGeometry( triangleShape )
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

	QUnit.module( 'ShapeBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			var triangleShape = new Shape();
			triangleShape.moveTo( 0, - 1 );
			triangleShape.lineTo( 1, 1 );
			triangleShape.lineTo( - 1, 1 );

			geometries = [
				new ShapeBufferGeometry( triangleShape )
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
