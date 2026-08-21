import {
	vec3, faceForward
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Regression coverage for a WGSL-only faceForward() bug: MathNode.FACEFORWARD
// is the literal string 'faceforward' (GLSL's own correct, all-lowercase
// spelling), but WGSL's built-in is spelled `faceForward` (camelCase). With
// no `faceforward -> faceForward` entry in WGSLNodeBuilder.js's wgslMethods
// table (the table that already exists specifically to paper over this class
// of GLSL/WGSL spelling mismatch -- see its `inversesqrt: 'inverseSqrt'`
// entry for the identical situation), every WebGPU-backend call to
// faceForward() failed to compile outright ("unresolved call target
// 'faceforward'"). The GLSL/WebGL backend was unaffected, which is exactly
// why this needs a two-backend gpuTest to catch.
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'faceForward()', () => {

		gpuTest( 'faceForward() picks the side facing the incident ray', ( { assert } ) => {

			const n = vec3( 0, 1, 0 );

			// dot(Nref, I) < 0 -> returns N unchanged.
			assert.closeAbs( faceForward( n, vec3( 0, - 1, 0 ), vec3( 0, 1, 0 ) ), n, 1e-5, 'faceForward keeps N when Nref and I already face opposite ways' );

			// dot(Nref, I) >= 0 -> returns -N.
			assert.closeAbs( faceForward( n, vec3( 0, 1, 0 ), vec3( 0, 1, 0 ) ), n.negate(), 1e-5, 'faceForward flips N when Nref and I face the same way' );

		} );

	} );

} );
