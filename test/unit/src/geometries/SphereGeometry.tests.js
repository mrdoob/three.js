import { beforeEach, describe, test } from 'vitest';

import { SphereGeometry } from '../../../../src/geometries/SphereGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { assert, runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'SphereGeometry', () => {

		let geometries = undefined;
		beforeEach( function () {

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
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new SphereGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'SphereGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new SphereGeometry();
			assert.ok( object, 'Can instantiate a SphereGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new SphereGeometry();
			assert.ok(
				object.type === 'SphereGeometry',
				'SphereGeometry.type should be SphereGeometry'
			);

		} );

		// OTHERS
		test( 'Standard geometry tests', () => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
