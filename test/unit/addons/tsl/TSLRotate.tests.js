import {
	float, vec2, vec3, rotate
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'rotate()', () => {

		gpuTest( 'rotate() on a 2D position by known angles', ( { assert } ) => {

			// A 90-degree (PI/2) counter-clockwise rotation sends +X to +Y.
			const rotated90 = rotate( vec2( 1, 0 ), float( Math.PI / 2 ) );
			assert.closeAbs( rotated90, vec2( 0, 1 ), 1e-4, 'rotate((1,0), PI/2) == (0,1)' );

			// A full 2*PI rotation is the identity (up to floating-point drift).
			const rotatedFull = rotate( vec2( 3, -2 ), float( Math.PI * 2 ) );
			assert.closeAbs( rotatedFull, vec2( 3, -2 ), 1e-3, 'rotate(v, 2*PI) returns to the original vector' );

			// Zero rotation is exactly the identity.
			assert.closeAbs( rotate( vec2( 5, 7 ), float( 0 ) ), vec2( 5, 7 ), 1e-5, 'rotate(v, 0) is the identity' );

		} );

		gpuTest( 'rotate() on a 3D position about a single axis matches the 2D case', ( { assert } ) => {

			// Rotating only about Z (x/y Euler angles held at 0) must behave
			// exactly like the 2D rotation above, with Z passed through
			// unchanged -- an independent cross-check between the 2D and 3D
			// code paths inside RotateNode.setup().
			const rotated = rotate( vec3( 1, 0, 5 ), vec3( 0, 0, Math.PI / 2 ) );
			assert.closeAbs( rotated, vec3( 0, 1, 5 ), 1e-4, 'rotating (1,0,5) by PI/2 about Z gives (0,1,5)' );

		} );

		// The X and Y single-axis paths weren't independently exercised when
		// RotateNode's 3D branch had its column/row transpose bug -- only Z
		// was empirically checked, even though the fix touched all three
		// per-axis matrices identically. These two tests close that gap by
		// applying the same 2D-vs-3D cross-check to X and Y, with the "other
		// two" coordinates held fixed as an independent pass-through check
		// (mirroring the Z test's own Z pass-through of `5`).
		gpuTest( 'rotate() on a 3D position about the X axis only matches the 2D case', ( { assert } ) => {

			// Rotating about X only: (y,z) behaves exactly like the 2D case's
			// (x,y), with X passed through unchanged.
			const rotated = rotate( vec3( 5, 1, 0 ), vec3( Math.PI / 2, 0, 0 ) );
			assert.closeAbs( rotated, vec3( 5, 0, 1 ), 1e-4, 'rotating (5,1,0) by PI/2 about X gives (5,0,1)' );

		} );

		gpuTest( 'rotate() on a 3D position about the Y axis only matches the 2D case', ( { assert } ) => {

			// Rotating about Y only, with Y passed through unchanged. Unlike
			// the X and Z axes, RotateNode's Y-axis matrix is built with its
			// sin/-sin terms swapped relative to the X/Z pattern (see
			// RotateNode.js's rotationYMatrix), so this rotates (x,z) the
			// opposite way round from what the X/Z pattern alone would
			// suggest: x' = x*cos + z*sin, z' = -x*sin + z*cos.
			const rotated = rotate( vec3( 1, 5, 0 ), vec3( 0, Math.PI / 2, 0 ) );
			assert.closeAbs( rotated, vec3( 0, 5, -1 ), 1e-4, 'rotating (1,5,0) by PI/2 about Y gives (0,5,-1)' );

		} );

	} );

} );
