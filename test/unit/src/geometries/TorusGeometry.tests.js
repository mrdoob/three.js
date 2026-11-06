import { beforeEach, describe, test } from 'vitest';

import { TorusGeometry } from '../../../../src/geometries/TorusGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { assert, runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'TorusGeometry', () => {

		let geometries = undefined;
		beforeEach( function () {

			const parameters = {
				radius: 10,
				tube: 20,
				radialSegments: 30,
				tubularSegments: 10,
				arc: 2.0,
				thetaStart: Math.PI * 0.5,
				thetaLength: Math.PI
			};

			geometries = [
				new TorusGeometry(),
				new TorusGeometry( parameters.radius ),
				new TorusGeometry( parameters.radius, parameters.tube ),
				new TorusGeometry( parameters.radius, parameters.tube, parameters.radialSegments ),
				new TorusGeometry( parameters.radius, parameters.tube, parameters.radialSegments, parameters.tubularSegments ),
				new TorusGeometry( parameters.radius, parameters.tube, parameters.radialSegments, parameters.tubularSegments, parameters.arc ),
				new TorusGeometry( parameters.radius, parameters.tube, parameters.radialSegments, parameters.tubularSegments, parameters.arc, parameters.thetaStart ),
				new TorusGeometry( parameters.radius, parameters.tube, parameters.radialSegments, parameters.tubularSegments, parameters.arc, parameters.thetaStart, parameters.thetaLength ),
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new TorusGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'TorusGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new TorusGeometry();
			assert.ok( object, 'Can instantiate a TorusGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new TorusGeometry();
			assert.ok(
				object.type === 'TorusGeometry',
				'TorusGeometry.type should be TorusGeometry'
			);

		} );

		// OTHERS
		test( 'Standard geometry tests', () => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
