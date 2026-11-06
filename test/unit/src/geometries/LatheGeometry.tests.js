import { beforeEach, describe, test } from 'vitest';

import { LatheGeometry } from '../../../../src/geometries/LatheGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { assert, runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'LatheGeometry', () => {

		let geometries = undefined;
		beforeEach( function () {

			const parameters = {
				points: [],
				segments: 0,
				phiStart: 0,
				phiLength: 0
			};

			geometries = [
				new LatheGeometry( parameters.points ),
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new LatheGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'LatheGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new LatheGeometry();
			assert.ok( object, 'Can instantiate a LatheGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new LatheGeometry();
			assert.ok(
				object.type === 'LatheGeometry',
				'LatheGeometry.type should be LatheGeometry'
			);

		} );

		// OTHERS
		test( 'Standard geometry tests', () => {

			runStdGeometryTests( assert, geometries );

		} );

		test( 'normals', () => {

			const normals = new LatheGeometry().getAttribute( 'normal' );
			const normal = new Vector3();
			let nonUnitNormals = 0;

			for ( let i = 0; i < normals.count; i ++ ) {

				normal.fromBufferAttribute( normals, i );

				if ( Math.abs( normal.length() - 1 ) > 1e-6 ) nonUnitNormals ++;

			}

			assert.strictEqual( nonUnitNormals, 0, 'All normals have unit length.' );

		} );

	} );

} );
