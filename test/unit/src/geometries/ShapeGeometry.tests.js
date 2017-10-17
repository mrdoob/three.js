/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import {
	ShapeGeometry,
	ShapeBufferGeometry
} from '../../../../src/geometries/ShapeGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module.todo( 'ShapeGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {};

			this.geometries = [
				new ShapeGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', function ( assert ) {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

	QUnit.module.todo( 'ShapeBufferGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {};

			this.geometries = [
				new ShapeBufferGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', function ( assert ) {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

} );
