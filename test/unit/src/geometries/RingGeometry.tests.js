/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import {
	RingGeometry,
	RingBufferGeometry
} from '../../../../src/geometries/RingGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'RingGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				innerRadius: 10,
				outerRadius: 60,
				thetaSegments: 12,
				phiSegments: 14,
				thetaStart: 0.1,
				thetaLength: 2.0
			};

			geometries = [
				new RingGeometry(),
				new RingGeometry( parameters.innerRadius ),
				new RingGeometry( parameters.innerRadius, parameters.outerRadius ),
				new RingGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments ),
				new RingGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments, parameters.phiSegments ),
				new RingGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments, parameters.phiSegments, parameters.thetaStart ),
				new RingGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments, parameters.phiSegments, parameters.thetaStart, parameters.thetaLength ),
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

	QUnit.module( 'RingBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				innerRadius: 10,
				outerRadius: 60,
				thetaSegments: 12,
				phiSegments: 14,
				thetaStart: 0.1,
				thetaLength: 2.0
			};

			geometries = [
				new RingBufferGeometry(),
				new RingBufferGeometry( parameters.innerRadius ),
				new RingBufferGeometry( parameters.innerRadius, parameters.outerRadius ),
				new RingBufferGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments ),
				new RingBufferGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments, parameters.phiSegments ),
				new RingBufferGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments, parameters.phiSegments, parameters.thetaStart ),
				new RingBufferGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments, parameters.phiSegments, parameters.thetaStart, parameters.thetaLength ),
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
