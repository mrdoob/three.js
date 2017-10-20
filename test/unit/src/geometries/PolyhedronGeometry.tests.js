/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import {
	PolyhedronGeometry,
	PolyhedronBufferGeometry
} from '../../../../src/geometries/PolyhedronGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module.todo( 'PolyhedronGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {};

			geometries = [
				new PolyhedronGeometry()
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

	QUnit.module.todo( 'PolyhedronBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {};

			geometries = [
				new PolyhedronBufferGeometry()
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
