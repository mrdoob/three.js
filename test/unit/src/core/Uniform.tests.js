import { assert, describe, test } from 'vitest';

import { Uniform } from '../../../../src/core/Uniform.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import {
	x,
	y,
	z
} from '../../utils/math-constants.js';

describe( 'Core', () => {

	describe( 'Uniform', () => {

		// INSTANCING
		test( 'Instancing', () => {

			let a;
			const b = new Vector3( x, y, z );

			a = new Uniform( 5 );
			assert.strictEqual( a.value, 5, 'New constructor works with simple values' );

			a = new Uniform( b );
			assert.ok( a.value.equals( b ), 'New constructor works with complex values' );

		} );

		// PUBLIC
		test( 'clone', () => {

			let a = new Uniform( 23 );
			let b = a.clone();

			assert.strictEqual( b.value, a.value, 'clone() with simple values works' );

			a = new Uniform( new Vector3( 1, 2, 3 ) );
			b = a.clone();

			assert.ok( b.value.equals( a.value ), 'clone() with complex values works' );

		} );

	} );

} );
