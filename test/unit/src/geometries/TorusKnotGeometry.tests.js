/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import { runStdGeometryTests } from '../../utils/qunit-utils';
import {
	TorusKnotBufferGeometry
} from '../../../../src/geometries/TorusKnotGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'TorusKnotBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				tube: 20,
				tubularSegments: 30,
				radialSegments: 10,
				p: 3,
				q: 2
			};

			geometries = [
				new TorusKnotBufferGeometry(),
				new TorusKnotBufferGeometry( parameters.radius ),
				new TorusKnotBufferGeometry( parameters.radius, parameters.tube ),
				new TorusKnotBufferGeometry( parameters.radius, parameters.tube, parameters.tubularSegments ),
				new TorusKnotBufferGeometry( parameters.radius, parameters.tube, parameters.tubularSegments, parameters.radialSegments ),
				new TorusKnotBufferGeometry( parameters.radius, parameters.tube, parameters.tubularSegments, parameters.radialSegments, parameters.p, parameters.q ),
			];

		} );

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
