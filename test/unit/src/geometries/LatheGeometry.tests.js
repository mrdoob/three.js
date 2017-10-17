/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import {
	LatheGeometry,
	LatheBufferGeometry
} from '../../../../src/geometries/LatheGeometry';

export default QUnit.module.todo( 'Geometries', () => {

	QUnit.module.todo( 'LatheGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {};

			this.geometries = [
				new LatheGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', function ( assert ) {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

	QUnit.module.todo( 'LatheBufferGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {};

			this.geometries = [
				new LatheBufferGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', function ( assert ) {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

} );
