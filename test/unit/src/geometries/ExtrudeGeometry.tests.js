import { assert, describe, test } from 'vitest';

import { ExtrudeGeometry } from '../../../../src/geometries/ExtrudeGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
// import { runStdGeometryTests } from '../../utils/test-utils.js';

describe( 'Geometries', () => {

	describe( 'ExtrudeGeometry', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new ExtrudeGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'ExtrudeGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new ExtrudeGeometry();
			assert.ok( object, 'Can instantiate an ExtrudeGeometry.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new ExtrudeGeometry();
			assert.ok(
				object.type === 'ExtrudeGeometry',
				'ExtrudeGeometry.type should be ExtrudeGeometry'
			);

		} );

	} );

} );
