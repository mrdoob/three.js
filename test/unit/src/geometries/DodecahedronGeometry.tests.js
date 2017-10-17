/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import { DodecahedronGeometry, DodecahedronBufferGeometry } from '../../../../src/geometries/DodecahedronGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'CircleGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				detail: undefined
			};

			this.geometries = [
				new DodecahedronGeometry(),
				new DodecahedronGeometry( parameters.radius ),
				new DodecahedronGeometry( parameters.radius, parameters.detail ),
			];

		} );

		QUnit.test( 'standard geometry QUnit.tests', ( assert ) => {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

	QUnit.module( 'CircleBufferGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				detail: undefined
			};

			this.geometries = [
				new DodecahedronBufferGeometry(),
				new DodecahedronBufferGeometry( parameters.radius ),
				new DodecahedronBufferGeometry( parameters.radius, parameters.detail ),
			];

		} );

		QUnit.test( 'standard geometry QUnit.tests', ( assert ) => {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

} );
