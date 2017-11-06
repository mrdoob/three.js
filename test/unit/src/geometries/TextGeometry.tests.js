/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import {
	TextGeometry,
	TextBufferGeometry
} from '../../../../src/geometries/TextGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module.todo( 'TextGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			// TODO: we cannot load any font from Threejs package :S
			const parameters = {
				font: undefined
			};

			geometries = [
				new TextGeometry()
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

	QUnit.module.todo( 'TextBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {};

			geometries = [
				new TextBufferGeometry()
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
