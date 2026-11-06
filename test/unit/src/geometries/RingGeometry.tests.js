import { beforeEach, describe, test } from 'vitest';

import { RingGeometry } from '../../../../src/geometries/RingGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { assert, runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'RingGeometry', () => {

		let geometries = undefined;
		beforeEach( function () {

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
		test( 'Extending', () => {

			const object = new RingGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'RingGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new RingGeometry();
			assert.ok( object, 'Can instantiate a RingGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new RingGeometry();
			assert.ok(
				object.type === 'RingGeometry',
				'RingGeometry.type should be RingGeometry'
			);

		} );

		// OTHERS
		test( 'Standard geometry tests', () => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
