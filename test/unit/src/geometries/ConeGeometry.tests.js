/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import {
	ConeGeometry,
	ConeBufferGeometry
} from '../../../../src/geometries/ConeGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'ConeGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {};

			geometries = [
				new ConeGeometry()
			];

		} );

		QUnit.test( 'standard geometry QUnit.tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

	QUnit.module( 'ConeBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {};

			geometries = [
				new ConeBufferGeometry()
			];

		} );

		QUnit.test( 'standard geometry QUnit.tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
