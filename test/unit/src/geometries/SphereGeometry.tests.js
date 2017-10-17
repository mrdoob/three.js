/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import {
	SphereGeometry,
	SphereBufferGeometry
} from '../../../../src/geometries/SphereGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'SphereGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				widthSegments: 20,
				heightSegments: 30,
				phiStart: 0.5,
				phiLength: 1.0,
				thetaStart: 0.4,
				thetaLength: 2.0,
			};

			this.geometries = [
				new SphereGeometry(),
				new SphereGeometry( parameters.radius ),
				new SphereGeometry( parameters.radius, parameters.widthSegments ),
				new SphereGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments ),
				new SphereGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart ),
				new SphereGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart, parameters.phiLength ),
				new SphereGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart, parameters.phiLength, parameters.thetaStart ),
				new SphereGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart, parameters.phiLength, parameters.thetaStart, parameters.thetaLength ),
			];

		} );

		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

	QUnit.module( 'SphereBufferGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				widthSegments: 20,
				heightSegments: 30,
				phiStart: 0.5,
				phiLength: 1.0,
				thetaStart: 0.4,
				thetaLength: 2.0,
			};

			this.geometries = [
				new SphereBufferGeometry(),
				new SphereBufferGeometry( parameters.radius ),
				new SphereBufferGeometry( parameters.radius, parameters.widthSegments ),
				new SphereBufferGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments ),
				new SphereBufferGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart ),
				new SphereBufferGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart, parameters.phiLength ),
				new SphereBufferGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart, parameters.phiLength, parameters.thetaStart ),
				new SphereBufferGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart, parameters.phiLength, parameters.thetaStart, parameters.thetaLength ),
			];

		} );

		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

} );
