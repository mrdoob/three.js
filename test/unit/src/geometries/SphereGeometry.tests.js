/* global QUnit */

import { runStdGeometryTests } from '../../utils/qunit-utils.js';
import { SphereGeometry, SphereBufferGeometry } from '../../../../src/geometries/SphereGeometry.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'SphereGeometry', ( hooks ) => {

		var geometries = undefined;
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

			geometries = [
				new SphereGeometry(),
				new SphereGeometry( parameters.radius ),
				new SphereGeometry( parameters.radius, parameters.widthSegments ),
				new SphereGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments ),
				new SphereGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart ),
				new SphereGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart, parameters.phiLength ),
				new SphereGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart, parameters.phiLength, parameters.thetaStart ),
				new SphereGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart, parameters.phiLength, parameters.thetaStart, parameters.thetaLength ),
				new SphereBufferGeometry()
			];

		} );

		// INHERITANCE
		QUnit.todo( 'Extending', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
