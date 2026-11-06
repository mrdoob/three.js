import { beforeEach, describe, test } from 'vitest';

import { CircleGeometry } from '../../../../src/geometries/CircleGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { assert, runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'CircleGeometry', () => {

		let geometries = undefined;
		beforeEach( function () {

			const parameters = {
				radius: 10,
				segments: 20,
				thetaStart: 0.1,
				thetaLength: 0.2
			};

			geometries = [
				new CircleGeometry(),
				new CircleGeometry( parameters.radius ),
				new CircleGeometry( parameters.radius, parameters.segments ),
				new CircleGeometry( parameters.radius, parameters.segments, parameters.thetaStart ),
				new CircleGeometry( parameters.radius, parameters.segments, parameters.thetaStart, parameters.thetaLength ),
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new CircleGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'CircleGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new CircleGeometry();
			assert.ok( object, 'Can instantiate a CircleGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new CircleGeometry();
			assert.ok(
				object.type === 'CircleGeometry',
				'CircleGeometry.type should be CircleGeometry'
			);

		} );

		// OTHERS
		test( 'Standard geometry tests', () => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
