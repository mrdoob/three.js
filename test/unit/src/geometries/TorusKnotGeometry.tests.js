/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import {
	TorusKnotGeometry,
	TorusKnotBufferGeometry
} from '../../../../src/geometries/TorusKnotGeometry';

export default QUnit.module.todo( 'Geometries', () => {

	QUnit.module.todo( 'SphereGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				tube: 20,
				tubularSegments: 30,
				radialSegments: 10,
				p: 3,
				q: 2
			};

			this.geometries = [
				new TorusKnotGeometry(),
				new TorusKnotGeometry( parameters.radius ),
				new TorusKnotGeometry( parameters.radius, parameters.tube ),
				new TorusKnotGeometry( parameters.radius, parameters.tube, parameters.tubularSegments ),
				new TorusKnotGeometry( parameters.radius, parameters.tube, parameters.tubularSegments, parameters.radialSegments ),
				new TorusKnotGeometry( parameters.radius, parameters.tube, parameters.tubularSegments, parameters.radialSegments, parameters.p, parameters.q ),
			];

		} );

		QUnit.test( 'Standard geometry tests', function ( assert ) {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

	QUnit.module.todo( 'TorusKnotBufferGeometry', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				tube: 20,
				tubularSegments: 30,
				radialSegments: 10,
				p: 3,
				q: 2
			};

			this.geometries = [
				new TorusKnotBufferGeometry(),
				new TorusKnotBufferGeometry( parameters.radius ),
				new TorusKnotBufferGeometry( parameters.radius, parameters.tube ),
				new TorusKnotBufferGeometry( parameters.radius, parameters.tube, parameters.tubularSegments ),
				new TorusKnotBufferGeometry( parameters.radius, parameters.tube, parameters.tubularSegments, parameters.radialSegments ),
				new TorusKnotBufferGeometry( parameters.radius, parameters.tube, parameters.tubularSegments, parameters.radialSegments, parameters.p, parameters.q ),
			];

		} );

		QUnit.test( 'Standard geometry tests', function ( assert ) {

			runStdGeometryTests( assert, this.geometries );

		} );

	} );

} );
