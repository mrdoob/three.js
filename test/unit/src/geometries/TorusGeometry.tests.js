/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import {
	TorusGeometry,
	TorusBufferGeometry
} from '../../../../src/geometries/TorusGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'TorusGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				tube: 20,
				radialSegments: 30,
				tubularSegments: 10,
				arc: 2.0,
			};

			this.geometries = [
				new TorusGeometry(),
				new TorusGeometry( parameters.radius ),
				new TorusGeometry( parameters.radius, parameters.tube ),
				new TorusGeometry( parameters.radius, parameters.tube, parameters.radialSegments ),
				new TorusGeometry( parameters.radius, parameters.tube, parameters.radialSegments, parameters.tubularSegments ),
				new TorusGeometry( parameters.radius, parameters.tube, parameters.radialSegments, parameters.tubularSegments, parameters.arc ),
			];

		} );

		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

	QUnit.module( 'TorusBufferGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				tube: 20,
				radialSegments: 30,
				tubularSegments: 10,
				arc: 2.0,
			};

			this.geometries = [
				new TorusBufferGeometry(),
				new TorusBufferGeometry( parameters.radius ),
				new TorusBufferGeometry( parameters.radius, parameters.tube ),
				new TorusBufferGeometry( parameters.radius, parameters.tube, parameters.radialSegments ),
				new TorusBufferGeometry( parameters.radius, parameters.tube, parameters.radialSegments, parameters.tubularSegments ),
				new TorusBufferGeometry( parameters.radius, parameters.tube, parameters.radialSegments, parameters.tubularSegments, parameters.arc ),
			];

		} );

		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

} );
