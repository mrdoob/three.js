import { beforeEach, describe, test } from 'vitest';

import { CapsuleGeometry } from '../../../../src/geometries/CapsuleGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { assert, runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'CapsuleGeometry', () => {

		let geometries = undefined;
		beforeEach( function () {

			const parameters = {
				radius: 2,
				height: 2,
				capSegments: 20,
				radialSegments: 20,
				heightSegments: 1
			};

			geometries = [
				new CapsuleGeometry(),
				new CapsuleGeometry( parameters.radius ),
				new CapsuleGeometry( parameters.radius, parameters.height ),
				new CapsuleGeometry( parameters.radius, parameters.height, parameters.capSegments ),
				new CapsuleGeometry( parameters.radius, parameters.height, parameters.capSegments, parameters.radialSegments ),
				new CapsuleGeometry( parameters.radius, parameters.height, parameters.capSegments, parameters.radialSegments, parameters.heightSegments )
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new CapsuleGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'CapsuleGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new CapsuleGeometry();
			assert.ok( object, 'Can instantiate a CapsuleGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new CapsuleGeometry();
			assert.ok(
				object.type === 'CapsuleGeometry',
				'CapsuleGeometry.type should be CapsuleGeometry'
			);

		} );

		// OTHERS
		test( 'Standard geometry tests', () => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
