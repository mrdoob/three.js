import { DataTexture, DataUtils, HalfFloatType, NearestFilter, RedFormat } from 'three';
import { Fn, float, mat3, mul, texture, uniform, vec2, vec3 } from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'contextual precision', () => {

		gpuTest( '16-bit context preserves ordinary arithmetic for exactly representable values', ( { assert } ) => {

			assert.closeAbs( float( 1.5 ).add( 2.5 ).setPrecision( 16 ), float( 4.0 ), 1e-3, 'scalar addition' );
			assert.closeAbs( vec3( 1, 2, 3 ).mul( vec3( 2, 3, 4 ) ).setPrecision( 16 ), vec3( 2, 6, 12 ), 1e-3, 'vector multiplication' );

			const scale = mat3(
				2, 0, 0,
				0, 3, 0,
				0, 0, 4
			);

			assert.closeAbs( mul( scale, vec3( 1, 1, 1 ) ).setPrecision( 16 ), vec3( 2, 3, 4 ), 1e-3, 'matrix-vector multiplication' );

		} );

		gpuTest( 'native 16-bit context rounds intermediate values', ( { assert } ) => {

			const expression = float( 2048 ).add( 1 ).sub( 2048 );

			assert.closeAbs( expression.setPrecision( 16 ), float( 0 ), 1e-3, '2048 + 1 rounds before subtracting in fp16' );

		}, { backends: [ 'webgpu' ], requiredFeatures: [ 'shader-f16' ] } );

		gpuTest( 'precision scope returns to fp32 outside the scoped expression', ( { assert } ) => {

			const fp32 = float( 2048 ).add( 1 ).sub( 2048 );
			const fp16ThenFp32 = float( 2048 ).add( 1 ).setPrecision( 16 ).sub( 2048 );

			assert.closeAbs( fp32, float( 1 ), 1e-3, 'unscoped expression keeps fp32 precision' );
			assert.closeAbs( fp16ThenFp32, float( 0 ), 1e-3, 'precision context result is promoted before surrounding fp32 math' );

		}, { backends: [ 'webgpu' ], requiredFeatures: [ 'shader-f16' ] } );

		gpuTest( 'shared node can be used in fp32 and fp16 contexts', ( { assert } ) => {

			const shared = float( 2048 ).add( 1 ).sub( 2048 );

			assert.closeAbs( shared, float( 1 ), 1e-3, 'shared node in default fp32 context' );
			assert.closeAbs( shared.setPrecision( 16 ), float( 0 ), 1e-3, 'same shared node in fp16 context' );

		}, { backends: [ 'webgpu' ], requiredFeatures: [ 'shader-f16' ] } );

		gpuTest( 'Fn call can be evaluated in a 16-bit context', ( { assert } ) => {

			const compute = Fn( () => {

				return float( 2048 ).add( 1 ).sub( 2048 );

			} );

			assert.closeAbs( compute().setPrecision( 16 ), float( 0 ), 1e-3, 'whole function call uses fp16 intermediates' );

		}, { backends: [ 'webgpu' ], requiredFeatures: [ 'shader-f16' ] } );

		gpuTest( 'normally typed uniform feeds contextual fp16 math', ( { assert } ) => {

			const value = uniform( 2, 'float' );

			assert.closeAbs( value.add( 2 ).setPrecision( 16 ), float( 4 ), 1e-3, 'uniform remains normally declared and converts at the computation boundary' );

		} );

		gpuTest( 'HalfFloatType texture can feed contextual fp16 math', ( { assert } ) => {

			const data = new Uint16Array( 1 );
			data[ 0 ] = DataUtils.toHalfFloat( 2 );

			const tex = new DataTexture( data, 1, 1, RedFormat, HalfFloatType );
			tex.minFilter = NearestFilter;
			tex.magFilter = NearestFilter;
			tex.generateMipmaps = false;
			tex.needsUpdate = true;

			const sampled = texture( tex, vec2( 0, 0 ) ).x;

			assert.closeAbs( sampled.add( 2 ).setPrecision( 16 ), float( 4 ), 1e-3, 'half-float texture format remains independent from compute precision' );

		} );

	} );

} );
