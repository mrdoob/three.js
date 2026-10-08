import {
	vec3, faceForward
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

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
