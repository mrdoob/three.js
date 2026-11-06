import { assert, beforeEach, describe, test } from 'vitest';

import { TubeGeometry } from '../../../../src/geometries/TubeGeometry.js';

import { LineCurve3 } from '../../../../src/extras/curves/LineCurve3.js';
import { Vector3 } from '../../../../src/math/Vector3.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
// import { runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'TubeGeometry', () => {

		let geometries = undefined; // eslint-disable-line no-unused-vars
		beforeEach( function () {

			const path = new LineCurve3( new Vector3( 0, 0, 0 ), new Vector3( 0, 1, 0 ) );

			geometries = [
				new TubeGeometry( path ),
			];

		} );

		// INHERITANCE
		test( 'Extending', () => {

			const object = new TubeGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'TubeGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new TubeGeometry();
			assert.ok( object, 'Can instantiate a TubeGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new TubeGeometry();
			assert.ok(
				object.type === 'TubeGeometry',
				'TubeGeometry.type should be TubeGeometry'
			);

		} );

	} );

} );
