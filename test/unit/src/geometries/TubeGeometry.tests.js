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

		hooks.beforeEach( function () {

			const parameters = {};

			this.geometries = [
				new TubeGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', function ( assert ) {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

	QUnit.module.todo( 'TubeBufferGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {};

			this.geometries = [
				new TubeBufferGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', function ( assert ) {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

} );
