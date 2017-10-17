/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import {
	DodecahedronGeometry,
	DodecahedronBufferGeometry
} from '../../../../src/geometries/DodecahedronGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'CircleGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				detail: undefined
			};

			geometries = [
				new DodecahedronGeometry(),
				new DodecahedronGeometry( parameters.radius ),
				new DodecahedronGeometry( parameters.radius, parameters.detail ),
			];

		} );

		QUnit.test( 'standard geometry QUnit.tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

	QUnit.module( 'CircleBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				detail: undefined
			};

			geometries = [
				new DodecahedronBufferGeometry(),
				new DodecahedronBufferGeometry( parameters.radius ),
				new DodecahedronBufferGeometry( parameters.radius, parameters.detail ),
			];

		} );

		QUnit.test( 'standard geometry QUnit.tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
