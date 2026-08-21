import { hash, vec3, float } from 'three/tsl';
import { sRGBTransferEOTF, sRGBTransferOETF } from 'three/tsl';
import { gpuTest, gpuFuzzTest } from './gpu-test-utils.js';

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'GPU-native unit tests (prototype)', () => {

		gpuTest( 'sRGB <-> linear round trip', ( { assert } ) => {

			const srgb = vec3( 0.5, 0.2, 0.8 );
			const roundTrip = sRGBTransferOETF( sRGBTransferEOTF( srgb ) );

			assert.closeAbs( roundTrip, srgb, 1e-4 );

		} );

		gpuTest( 'basic scalar and vector sanity checks', ( { assert } ) => {

			assert.eq( float( 1.0 ).add( 1.0 ), float( 2.0 ) );
			assert.closeRel( vec3( 100.0, 1.0, 0.01 ), vec3( 100.1, 1.001, 0.0101 ), 0.01 );

		} );

		gpuTest( 'relational assertions', ( { assert } ) => {

			assert.greaterThan( float( 5.0 ), float( 3.0 ) );
			assert.greaterThanOrEqual( float( 3.0 ), float( 3.0 ) );
			assert.lessThan( float( 3.0 ), float( 5.0 ) );
			assert.lessThanOrEqual( float( 3.0 ), float( 3.0 ) );
			assert.greaterThan( vec3( 5.0, 6.0, 7.0 ), vec3( 3.0, 3.0, 3.0 ) );

		} );

		gpuFuzzTest( 'sRGB <-> linear round trip (fuzz, 256 random colors)', 256, ( { instanceIndex, assert } ) => {

			// Deterministically pseudo-random per invocation -- every instance
			// generates and checks its own case, entirely on the GPU.
			const srgb = vec3(
				hash( instanceIndex.add( 1 ) ),
				hash( instanceIndex.add( 1000 ) ),
				hash( instanceIndex.add( 2000 ) )
			);
			const roundTrip = sRGBTransferOETF( sRGBTransferEOTF( srgb ) );

			assert.closeAbs( roundTrip, srgb, 1e-3 );

		}, { backends: [ 'webgpu', 'webgl' ] } );

	} );

} );
