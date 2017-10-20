/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import {
	TubeGeometry,
	TubeBufferGeometry
} from '../../../../src/geometries/TubeGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module.todo( 'TubeGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {};

			geometries = [
				new TubeGeometry()
			];

		} );

		// INHERITANCE
		QUnit.test( "Extending", ( assert ) => {} );

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

	QUnit.module.todo( 'TubeBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {};

			geometries = [
				new TubeBufferGeometry()
			];

		} );

		// INHERITANCE
		QUnit.test( "Extending", ( assert ) => {} );

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
