/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import {
	PolyhedronGeometry,
	PolyhedronBufferGeometry
} from '../../../../src/geometries/PolyhedronGeometry';

export default QUnit.module.todo( 'Geometries', () => {

	QUnit.module.todo( 'PolyhedronGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {};

			this.geometries = [
				new PolyhedronGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', function ( assert ) {

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

		QUnit.test( 'Standard geometry tests', function ( assert ) {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

} );
