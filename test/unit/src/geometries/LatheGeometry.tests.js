/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import {
	LatheGeometry,
	LatheBufferGeometry
} from '../../../../src/geometries/LatheGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'LatheGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {};

			geometries = [
				new LatheGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

	QUnit.module( 'LatheBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {};

			geometries = [
				new LatheBufferGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
