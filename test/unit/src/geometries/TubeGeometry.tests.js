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

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {};

			geometries = [
				new TubeGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

	QUnit.module.todo( 'TubeBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {};

			geometries = [
				new TubeBufferGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
