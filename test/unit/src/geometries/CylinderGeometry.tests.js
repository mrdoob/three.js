/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import { runStdGeometryTests } from '../../utils/qunit-utils';
import {
	CylinderBufferGeometry
} from '../../../../src/geometries/CylinderGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'CylinderBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radiusTop: 10,
				radiusBottom: 20,
				height: 30,
				radialSegments: 20,
				heightSegments: 30,
				openEnded: true,
				thetaStart: 0.1,
				thetaLength: 2.0,
			};

			geometries = [
				new CylinderBufferGeometry(),
				new CylinderBufferGeometry( parameters.radiusTop ),
				new CylinderBufferGeometry( parameters.radiusTop, parameters.radiusBottom ),
				new CylinderBufferGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height ),
				new CylinderBufferGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments ),
				new CylinderBufferGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments, parameters.heightSegments ),
				new CylinderBufferGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments, parameters.heightSegments, parameters.openEnded ),
				new CylinderBufferGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments, parameters.heightSegments, parameters.openEnded, parameters.thetaStart ),
				new CylinderBufferGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments, parameters.heightSegments, parameters.openEnded, parameters.thetaStart, parameters.thetaLength ),
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
