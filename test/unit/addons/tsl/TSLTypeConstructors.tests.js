import {
	float, int, uint, vec2, vec3,
	bool, bvec2, bvec3, ivec2, ivec3, ivec4, uvec2, uvec3, uvec4, mat2, color,
	transpose, greaterThan
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Coverage for the smaller/less-common TSL type constructors built by
// TSLCore.js's `ConvertType` factory (the same machinery mat3()/mat4() go
// through -- see TSLVectorMatrix.tests.js's dedicated row-major-convention
// tests for that finding), and for `color()`.
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'type constructors', () => {

		gpuTest( 'mat2(a,b,c,d) 4-scalar constructor is ROW-major, like mat3()/mat4() (see TSLVectorMatrix.tests.js)', ( { assert } ) => {

			// Same finding as mat3()'s 9-scalar constructor: a plain-number
			// call routes through getValueFromType('mat2', ...) ->
			// `new Matrix2().set(...)`, and Matrix2.set(n11,n12,n21,n22) is
			// ROW-major (matching every other three.js Matrix API) while
			// storing column-major internally. So mat2(1,2,3,4)'s *rows*
			// (conventionally written) are (1,2) and (3,4) -- element(i)
			// means "column i" of that (conventional) matrix, so column 0
			// is (1,3): the first entry of each row.
			const m = mat2( 1, 2, 3, 4 );
			assert.eq( m.element( 0 ), vec2( 1, 3 ), 'column 0 == the first entry of each constructor row' );
			assert.eq( m.element( 1 ), vec2( 2, 4 ), 'column 1 == the second entry of each constructor row' );

		} );

		gpuTest( 'transpose(mat2(a,b,c,d)) confirms the row-major reading of the 4-scalar constructor', ( { assert } ) => {

			// transpose(m)'s column i is m's row i -- hand-derived,
			// independent of whatever transpose() actually does internally.
			const m = mat2( 1, 2, 3, 4 );
			assert.eq( transpose( m ).element( 0 ), vec2( 1, 2 ), 'transpose column 0 == original row 0' );
			assert.eq( transpose( m ).element( 1 ), vec2( 3, 4 ), 'transpose column 1 == original row 1' );

		} );

		gpuTest( 'bool() converts a truthy/falsy numeric node to a boolean', ( { assert } ) => {

			assert.eq( bool( float( 1 ) ), bool( true ), 'bool(1) == true' );
			assert.eq( bool( float( 0 ) ), bool( false ), 'bool(0) == false' );

		} );

		gpuTest( 'ivec2/ivec3/ivec4 broadcast a single scalar to every component', ( { assert } ) => {

			// Same single-argument broadcast rule as vec2/vec3/vec4 (see
			// getValueFromType()'s `params.length === 1` branch, which
			// applies uniformly regardless of the i/u/b prefix).
			assert.eq( ivec2( int( 5 ) ).x, int( 5 ), 'ivec2(5).x == 5' );
			assert.eq( ivec2( int( 5 ) ).y, int( 5 ), 'ivec2(5).y == 5' );
			assert.eq( ivec3( int( - 2 ) ).z, int( - 2 ), 'ivec3(-2).z == -2' );
			assert.eq( ivec4( int( 7 ) ).w, int( 7 ), 'ivec4(7).w == 7' );

		} );

		gpuTest( 'ivec3(a,b,c) constructs component-wise from three explicit scalars', ( { assert } ) => {

			const v = ivec3( int( 1 ), int( 2 ), int( 3 ) );
			assert.eq( v.x, int( 1 ), 'ivec3(1,2,3).x == 1' );
			assert.eq( v.y, int( 2 ), 'ivec3(1,2,3).y == 2' );
			assert.eq( v.z, int( 3 ), 'ivec3(1,2,3).z == 3' );

		} );

		gpuTest( 'uvec2/uvec3/uvec4 broadcast a single scalar to every component', ( { assert } ) => {

			assert.eq( uvec2( uint( 3 ) ).x, uint( 3 ), 'uvec2(3).x == 3' );
			assert.eq( uvec3( uint( 4 ) ).y, uint( 4 ), 'uvec3(4).y == 4' );
			assert.eq( uvec4( uint( 9 ) ).w, uint( 9 ), 'uvec4(9).w == 9' );

		} );

		gpuTest( 'bvec2/bvec3 pack independently computed booleans component-wise', ( { assert } ) => {

			// Built from real comparison results (greaterThan()), not from
			// plain JS boolean literals -- so this exercises bvecN() the way
			// it's actually used downstream of boolean vector comparisons,
			// not just as a constant-literal packer.
			const cmp = greaterThan( vec3( 5, 1, 5 ), vec3( 2, 2, 2 ) ); // (true, false, true)

			assert.eq( bvec3( cmp.x, cmp.y, cmp.z ).x, bool( true ), 'bvec3(cmp).x == true (5 > 2)' );
			assert.eq( bvec3( cmp.x, cmp.y, cmp.z ).y, bool( false ), 'bvec3(cmp).y == false (1 > 2 is false)' );
			assert.eq( bvec3( cmp.x, cmp.y, cmp.z ).z, bool( true ), 'bvec3(cmp).z == true (5 > 2)' );

			assert.eq( bvec2( bool( true ), bool( false ) ).x, bool( true ), 'bvec2(true, false).x == true' );
			assert.eq( bvec2( bool( true ), bool( false ) ).y, bool( false ), 'bvec2(true, false).y == false' );

		} );

		gpuTest( 'color(r,g,b) behaves as a plain 3-component RGB node', ( { assert } ) => {

			const c = color( 0.2, 0.4, 0.6 );
			assert.eq( c.r, float( 0.2 ), 'color(0.2,0.4,0.6).r == 0.2' );
			assert.eq( c.g, float( 0.4 ), 'color(0.2,0.4,0.6).g == 0.4' );
			assert.eq( c.b, float( 0.6 ), 'color(0.2,0.4,0.6).b == 0.6' );

			// Arithmetic works the same as a vec3. closeAbs (not eq) since
			// this crosses a float32 addition, which isn't guaranteed to be
			// bit-exact with the CPU-side reference value.
			assert.closeAbs( c.add( color( 0.1, 0.1, 0.1 ) ), color( 0.3, 0.5, 0.7 ), 1e-6, 'color addition works component-wise like vec3' );

		} );

	} );

} );
