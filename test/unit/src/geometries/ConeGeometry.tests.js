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

		hooks.beforeEach( function () {

			const parameters = {};

			this.geometries = [
				new ConeGeometry()
			];

		} );

		QUnit.test( 'standard geometry QUnit.tests', ( assert ) => {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

	QUnit.module( 'ConeBufferGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {};

			this.geometries = [
				new ConeBufferGeometry()
			];

		} );

		QUnit.test( 'standard geometry QUnit.tests', ( assert ) => {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

} );
