import { beforeEach, describe, test } from 'vitest';

import { PolyhedronGeometry } from '../../../../src/geometries/PolyhedronGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { assert, runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'PolyhedronGeometry', () => {

		let geometries = undefined;
		beforeEach( function () {

			const vertices = [
				1, 1, 1, 	- 1, - 1, 1, 	- 1, 1, - 1, 	1, - 1, - 1
			];

			const indices = [
				2, 1, 0, 	0, 3, 2,	1, 3, 0,	2, 3, 1
			];

			geometries = [
				new PolyhedronGeometry( vertices, indices ),
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new PolyhedronGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'PolyhedronGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new PolyhedronGeometry();
			assert.ok( object, 'Can instantiate a PolyhedronGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new PolyhedronGeometry();
			assert.ok(
				object.type === 'PolyhedronGeometry',
				'PolyhedronGeometry.type should be PolyhedronGeometry'
			);

		} );

		// OTHERS
		test( 'Standard geometry tests', () => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
