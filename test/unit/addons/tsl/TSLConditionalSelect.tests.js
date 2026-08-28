import { bvec2, bvec3, bvec4, float, int, ivec2, ivec3, ivec4, select, uvec2, uvec3, uvec4, vec2, vec3, vec4 } from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'Conditional (select)', () => {

		// A vector condition selects per-component: each output lane picks
		// independently, matching WGSL's native select() and GLSL's mix().
		gpuTest( 'select() with a vector condition selects per-component, matching WGSL select()/GLSL mix() semantics', ( { assert } ) => {

			const cond = vec4( 1, 0, 1, 0 ).greaterThan( 0.5 ); // bvec4( true, false, true, false )
			const result = select( cond, vec4( 1, 2, 3, 4 ), vec4( 10, 20, 30, 40 ) );

			assert.eq( result, vec4( 1, 20, 3, 40 ) );

		} );

		gpuTest( 'per-component select() works for vec2/vec3/vec4', ( { assert } ) => {

			assert.eq(
				select( vec2( 1, 0 ).greaterThan( 0.5 ), vec2( 1, 2 ), vec2( 10, 20 ) ),
				vec2( 1, 20 )
			);

			assert.eq(
				select( vec3( 1, 0, 1 ).greaterThan( 0.5 ), vec3( 1, 2, 3 ), vec3( 10, 20, 30 ) ),
				vec3( 1, 20, 3 )
			);

			assert.eq(
				select( vec4( 0, 1, 0, 1 ).greaterThan( 0.5 ), vec4( 1, 2, 3, 4 ), vec4( 10, 20, 30, 40 ) ),
				vec4( 10, 2, 30, 4 )
			);

		} );

		gpuTest( 'per-component select() works for integer/unsigned vector types (ivec2-4, uvec2-4)', ( { assert } ) => {

			assert.eq(
				select( vec2( 1, 0 ).greaterThan( 0.5 ), ivec2( 1, 2 ), ivec2( - 10, - 20 ) ),
				ivec2( 1, - 20 )
			);

			assert.eq(
				select( vec3( 0, 1, 0 ).greaterThan( 0.5 ), ivec3( 1, 2, 3 ), ivec3( - 10, - 20, - 30 ) ),
				ivec3( - 10, 2, - 30 )
			);

			assert.eq(
				select( vec4( 1, 0, 1, 0 ).greaterThan( 0.5 ), ivec4( 1, 2, 3, 4 ), ivec4( - 10, - 20, - 30, - 40 ) ),
				ivec4( 1, - 20, 3, - 40 )
			);

			assert.eq(
				select( vec2( 0, 1 ).greaterThan( 0.5 ), uvec2( 1, 2 ), uvec2( 10, 20 ) ),
				uvec2( 10, 2 )
			);

			assert.eq(
				select( vec3( 1, 0, 1 ).greaterThan( 0.5 ), uvec3( 1, 2, 3 ), uvec3( 10, 20, 30 ) ),
				uvec3( 1, 20, 3 )
			);

			// uvec4( 4294967290, ... ) exercises the unsigned-wraparound
			// case: the subtraction wraps, but the result is still exact.
			assert.eq(
				select( vec4( 0, 1, 0, 1 ).greaterThan( 0.5 ), uvec4( 6, 2, 3, 4 ), uvec4( 4294967290, 20, 30, 40 ) ),
				uvec4( 4294967290, 2, 30, 4 )
			);

		} );

		// Reads each result component via a separate assert.eq call, to
		// cover repeated references to the same select()'d node.
		gpuTest( 'per-component select() works for boolean vector types (bvec2-4)', ( { assert } ) => {

			const resultBvec4 = select(
				vec4( 1, 0, 1, 0 ).greaterThan( 0.5 ),
				bvec4( true, true, true, true ),
				bvec4( false, false, true, false )
			);

			assert.eq( float( resultBvec4.x ), float( 1 ), 'bvec4 select() lane 0 (true) picks the "if" value' );
			assert.eq( float( resultBvec4.y ), float( 0 ), 'bvec4 select() lane 1 (false) picks the "else" value' );
			assert.eq( float( resultBvec4.z ), float( 1 ), 'bvec4 select() lane 2 (true) picks the "if" value' );
			assert.eq( float( resultBvec4.w ), float( 0 ), 'bvec4 select() lane 3 (false) picks the "else" value' );

			const resultBvec2 = select( vec2( 0, 1 ).greaterThan( 0.5 ), bvec2( false, true ), bvec2( true, false ) );

			assert.eq( float( resultBvec2.x ), float( 1 ), 'bvec2 select() lane 0 (false) picks the "else" value' );
			assert.eq( float( resultBvec2.y ), float( 1 ), 'bvec2 select() lane 1 (true) picks the "if" value' );

			const resultBvec3 = select( vec3( 1, 0, 1 ).greaterThan( 0.5 ), bvec3( true, false, true ), bvec3( false, true, false ) );

			assert.eq( float( resultBvec3.x ), float( 1 ), 'bvec3 select() lane 0 (true) picks the "if" value' );
			assert.eq( float( resultBvec3.y ), float( 1 ), 'bvec3 select() lane 1 (false) picks the "else" value' );
			assert.eq( float( resultBvec3.z ), float( 1 ), 'bvec3 select() lane 2 (true) picks the "if" value' );

		} );

		// A scalar condition still selects the whole vector as one unit.
		gpuTest( 'a scalar condition still selects a vector value wholesale (unaffected by the vector-condition fix)', ( { assert } ) => {

			assert.eq(
				select( int( 5 ).greaterThan( int( 3 ) ), vec3( 1, 2, 3 ), vec3( 10, 20, 30 ) ),
				vec3( 1, 2, 3 )
			);

			assert.eq(
				select( int( 5 ).lessThan( int( 3 ) ), vec3( 1, 2, 3 ), vec3( 10, 20, 30 ) ),
				vec3( 10, 20, 30 )
			);

		} );

	} );

} );
