/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import {
	ParametricGeometry,
	ParametricBufferGeometry
} from '../../../../src/geometries/ParametricGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module.todo( 'ParametricGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {};

			this.geometries = [
				new ParametricGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', function ( assert ) {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

	QUnit.module.todo( 'ParametricBufferGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {};

			this.geometries = [
				new ParametricBufferGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', function ( assert ) {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

} );
