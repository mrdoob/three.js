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

		hooks.beforeEach( function () {

			const parameters = {};

			this.geometries = [
				new TextGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

	QUnit.module.todo( 'TextBufferGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {};

			this.geometries = [
				new TextBufferGeometry()
			];

		} );

		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

} );
