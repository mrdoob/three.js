/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import { runStdGeometryTests } from '../../utils/qunit-utils';
import {
	TorusBufferGeometry
} from '../../../../src/geometries/TorusGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'TorusBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				tube: 20,
				radialSegments: 30,
				tubularSegments: 10,
				arc: 2.0,
			};

			geometries = [
				new TorusBufferGeometry(),
				new TorusBufferGeometry( parameters.radius ),
				new TorusBufferGeometry( parameters.radius, parameters.tube ),
				new TorusBufferGeometry( parameters.radius, parameters.tube, parameters.radialSegments ),
				new TorusBufferGeometry( parameters.radius, parameters.tube, parameters.radialSegments, parameters.tubularSegments ),
				new TorusBufferGeometry( parameters.radius, parameters.tube, parameters.radialSegments, parameters.tubularSegments, parameters.arc ),
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
