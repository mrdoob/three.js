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

		hooks.beforeEach( function () {

			const parameters = {};

			this.geometries = [
				new PolyhedronGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

	QUnit.module.todo( 'PolyhedronBufferGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {};

			this.geometries = [
				new PolyhedronBufferGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

} );
