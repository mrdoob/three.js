import { beforeEach, describe, test } from 'vitest';

import { PlaneGeometry } from '../../../../src/geometries/PlaneGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { assert, runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'PlaneGeometry', () => {

		let geometries = undefined;
		beforeEach( function () {

			const parameters = {
				width: 10,
				height: 30,
				widthSegments: 3,
				heightSegments: 5
			};

			geometries = [
				new PlaneGeometry(),
				new PlaneGeometry( parameters.width ),
				new PlaneGeometry( parameters.width, parameters.height ),
				new PlaneGeometry( parameters.width, parameters.height, parameters.widthSegments ),
				new PlaneGeometry( parameters.width, parameters.height, parameters.widthSegments, parameters.heightSegments ),
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new PlaneGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'PlaneGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new PlaneGeometry();
			assert.ok( object, 'Can instantiate a PlaneGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new PlaneGeometry();
			assert.ok(
				object.type === 'PlaneGeometry',
				'PlaneGeometry.type should be PlaneGeometry'
			);

		} );

		// OTHERS
		test( 'Standard geometry tests', () => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
