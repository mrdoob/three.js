/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import {
	TextGeometry,
	TextBufferGeometry
} from '../../../../src/geometries/TextGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module.todo( 'TextGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {};

			geometries = [
				new TextGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

	QUnit.module.todo( 'TextBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {};

			geometries = [
				new TextBufferGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
