import { bvec2, bvec3, bvec4, float, ivec2, ivec3, ivec4, mix, uvec2, uvec3, uvec4, vec2, vec3, vec4 } from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'mix() with boolean interpolation', () => {

		gpuTest( 'selects floating-point vector components', ( { assert } ) => {

			assert.eq( mix( vec2( 1, 2 ), vec2( 10, 20 ), bvec2( true, false ) ), vec2( 10, 2 ) );
			assert.eq( mix( vec3( 1, 2, 3 ), vec3( 10, 20, 30 ), bvec3( false, true, false ) ), vec3( 1, 20, 3 ) );
			assert.eq( mix( vec4( 1, 2, 3, 4 ), vec4( 10, 20, 30, 40 ), bvec4( true, false, true, false ) ), vec4( 10, 2, 30, 4 ) );

		} );

		gpuTest( 'supports chained mix with a comparison-generated mask', ( { assert } ) => {

			const condition = vec3( - 1, 2, - 3 ).toVar().greaterThan( 0 );
			const result = condition.mix( vec3( 10, 20, 30 ), vec3( 1, 2, 3 ) );

			assert.eq( result, vec3( 10, 2, 30 ), 'chained mix takes the false value before the true value' );

		} );

		gpuTest( 'selects signed and unsigned integer vector components', ( { assert } ) => {

			assert.eq( mix( ivec2( 1, 2 ), ivec2( - 10, - 20 ), bvec2( true, false ) ), ivec2( - 10, 2 ) );
			assert.eq( mix( ivec3( 1, 2, 3 ), ivec3( - 10, - 20, - 30 ), bvec3( false, true, false ) ), ivec3( 1, - 20, 3 ) );
			assert.eq( mix( ivec4( 1, 2, 3, 4 ), ivec4( - 10, - 20, - 30, - 40 ), bvec4( true, false, true, false ) ), ivec4( - 10, 2, - 30, 4 ) );

			assert.eq( mix( uvec2( 1, 2 ), uvec2( 10, 20 ), bvec2( false, true ) ), uvec2( 1, 20 ) );
			assert.eq( mix( uvec3( 1, 2, 3 ), uvec3( 10, 20, 30 ), bvec3( true, false, true ) ), uvec3( 10, 2, 30 ) );
			assert.eq( mix( uvec4( 1, 2, 3, 4 ), uvec4( 10, 20, 30, 40 ), bvec4( false, true, false, true ) ), uvec4( 1, 20, 3, 40 ) );

		} );

		gpuTest( 'selects boolean vector components', ( { assert } ) => {

			const resultBvec2 = mix(
				bvec2( false, true ),
				bvec2( true, false ),
				bvec2( true, false )
			);

			assert.eq( float( resultBvec2.x ), float( 1 ) );
			assert.eq( float( resultBvec2.y ), float( 1 ) );

			const resultBvec3 = mix(
				bvec3( false, true, false ),
				bvec3( true, false, true ),
				bvec3( false, true, true )
			);

			assert.eq( float( resultBvec3.x ), float( 0 ) );
			assert.eq( float( resultBvec3.y ), float( 0 ) );
			assert.eq( float( resultBvec3.z ), float( 1 ) );

			const resultBvec4 = mix(
				bvec4( false, false, true, true ),
				bvec4( true, true, false, false ),
				bvec4( true, false, true, false )
			);

			assert.eq( float( resultBvec4.x ), float( 1 ) );
			assert.eq( float( resultBvec4.y ), float( 0 ) );
			assert.eq( float( resultBvec4.z ), float( 0 ) );
			assert.eq( float( resultBvec4.w ), float( 1 ) );

		} );

	} );

} );
