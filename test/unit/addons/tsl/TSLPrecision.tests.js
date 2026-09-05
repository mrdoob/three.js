import { DataTexture, DataUtils, HalfFloatType, NearestFilter, RedFormat } from 'three';
import { Fn, Loop, cos, cross, distance, dot, float, length, mat2, mat3, mat4, mix, mul, mx_noise_float, normalize, reflect, refract, sin, tan, texture, uniform, vec2, vec3, vec4 } from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

const HALF_ULP_QUARTER_AT_ONE = 1 / 4096;
const NATIVE_F16_OPTIONS = { backends: [ 'webgpu' ], requiredFeatures: [ 'shader-f16' ] };

function assertHalfEquals( assert, actual, expected, message, tolerance = 1e-5 ) {

	assert.closeAbs( actual.setPrecision( 16 ), expected, tolerance, message );

}

function assertFp32KeepsDelta( assert, deltaNode, message, threshold = 1e-4 ) {

	assert.greaterThan( deltaNode.setPrecision( 32 ), float( threshold ), message );

}

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'contextual precision', () => {

		QUnit.test( 'getPrecision reports explicit precision scopes', ( assert ) => {

			assert.strictEqual( float( 1 ).getPrecision(), null, 'nodes use default precision unless a scope is requested' );
			assert.strictEqual( float( 1 ).add( 2 ).setPrecision( 16 ).getPrecision(), 16, 'setPrecision( 16 ) reports a 16-bit scope' );
			assert.strictEqual( float( 1 ).add( 2 ).setPrecision( 32 ).getPrecision(), 32, 'setPrecision( 32 ) reports a 32-bit scope' );
			assert.strictEqual( uniform( 1, 'float' ).setPrecision( 'high' ).getPrecision(), 'high', 'input declaration precision is preserved' );

		} );

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

		}, NATIVE_F16_OPTIONS );

		gpuTest( 'native 16-bit context reaches temporaries', ( { assert } ) => {

			const rounded = float( 2048 ).add( 1 ).toVar();

			assertHalfEquals( assert, rounded.sub( 2048 ), float( 0 ), 'temporary stores rounded fp16 value', 1e-3 );

		}, NATIVE_F16_OPTIONS );

		gpuTest( 'precision scope returns to fp32 outside the scoped expression', ( { assert } ) => {

			const fp32 = float( 2048 ).add( 1 ).sub( 2048 );
			const fp16ThenFp32 = float( 2048 ).add( 1 ).setPrecision( 16 ).sub( 2048 );

			assert.closeAbs( fp32, float( 1 ), 1e-3, 'unscoped expression keeps fp32 precision' );
			assert.closeAbs( fp16ThenFp32, float( 0 ), 1e-3, 'precision context result is promoted before surrounding fp32 math' );

		}, NATIVE_F16_OPTIONS );

		gpuTest( '32-bit context overrides an outer 16-bit context', ( { assert } ) => {

			const fp32Scoped = float( 2048 ).add( 1 ).sub( 2048 ).setPrecision( 32 );
			const nested = fp32Scoped.setPrecision( 16 );

			assert.closeAbs( fp32Scoped, float( 1 ), 1e-3, 'setPrecision( 32 ) keeps fp32 arithmetic' );
			assert.closeAbs( nested, float( 1 ), 1e-3, 'inner fp32 scope is preserved inside outer fp16 scope' );

		}, NATIVE_F16_OPTIONS );

		gpuTest( '32-bit context preserves sub-half-ulp scalar differences', ( { assert } ) => {

			const x = float( 1 ).add( HALF_ULP_QUARTER_AT_ONE );

			assertFp32KeepsDelta( assert, x.sub( 1 ), 'setPrecision( 32 ) keeps fp32 scalar difference' );
			assertHalfEquals( assert, x.sub( 1 ), float( 0 ), 'setPrecision( 16 ) rounds same scalar difference away' );

		}, NATIVE_F16_OPTIONS );

		gpuTest( 'native 16-bit context rounds trigonometric inputs', ( { assert } ) => {

			const x = float( 1 ).add( HALF_ULP_QUARTER_AT_ONE );
			const one = float( 1 );
			const sinDelta = sin( x ).sub( sin( one ) );
			const cosDelta = cos( one ).sub( cos( x ) );
			const tanDelta = tan( x ).sub( tan( one ) );

			assertHalfEquals( assert, sinDelta, float( 0 ), 'sin input is evaluated at fp16 precision' );
			assertHalfEquals( assert, cosDelta, float( 0 ), 'cos input is evaluated at fp16 precision', 1e-3 );
			assertHalfEquals( assert, tanDelta, float( 0 ), 'tan input is evaluated at fp16 precision' );

			assertFp32KeepsDelta( assert, sinDelta, 'sin keeps the sub-half-ulp input delta in fp32' );
			assertFp32KeepsDelta( assert, cosDelta, 'cos keeps the sub-half-ulp input delta in fp32' );
			assertFp32KeepsDelta( assert, tanDelta, 'tan keeps the sub-half-ulp input delta in fp32' );

		}, NATIVE_F16_OPTIONS );

		gpuTest( 'native 16-bit context rounds vector operation inputs', ( { assert } ) => {

			const delta = HALF_ULP_QUARTER_AT_ONE;
			const x = float( 1 ).add( delta );
			const v = vec3( x, 1, 0 );
			const base = vec3( 1, 1, 0 );
			const z = vec3( 0, 0, 1 );
			const normal = vec3( 0, 1, 0 );
			const dotDelta = dot( v, vec3( 1, 0, 0 ) ).sub( 1 );
			const lengthDelta = length( vec3( x, 0, 0 ) ).sub( 1 );
			const distanceDelta = distance( vec3( x, 0, 0 ), vec3( 0, 0, 0 ) ).sub( 1 );
			const crossDelta = cross( v, z ).sub( cross( base, z ) );
			const normalizeDelta = normalize( v ).sub( normalize( base ) );
			const reflectDelta = reflect( vec3( x, - 1, 0 ), normal ).sub( reflect( vec3( 1, - 1, 0 ), normal ) );
			const refractDelta = refract( vec3( x, - 1, 0 ), normal, 1 ).sub( refract( vec3( 1, - 1, 0 ), normal, 1 ) );

			assertHalfEquals( assert, dotDelta, float( 0 ), 'dot rounds vector components to fp16' );
			assertHalfEquals( assert, lengthDelta, float( 0 ), 'length rounds vector components to fp16' );
			assertHalfEquals( assert, distanceDelta, float( 0 ), 'distance rounds vector components to fp16' );
			assertHalfEquals( assert, crossDelta, vec3( 0, 0, 0 ), 'cross rounds vector components to fp16' );
			assertHalfEquals( assert, normalizeDelta, vec3( 0, 0, 0 ), 'normalize rounds vector components to fp16' );
			assertHalfEquals( assert, reflectDelta, vec3( 0, 0, 0 ), 'reflect rounds vector components to fp16' );
			assertHalfEquals( assert, refractDelta, vec3( 0, 0, 0 ), 'refract rounds vector components to fp16' );

			assertFp32KeepsDelta( assert, dotDelta, 'dot keeps fp32 delta in 32-bit scope' );
			assertFp32KeepsDelta( assert, lengthDelta, 'length keeps fp32 delta in 32-bit scope' );
			assertFp32KeepsDelta( assert, distanceDelta, 'distance keeps fp32 delta in 32-bit scope' );
			assertFp32KeepsDelta( assert, crossDelta.y.negate(), 'cross keeps fp32 delta in 32-bit scope' );
			assertFp32KeepsDelta( assert, reflectDelta.x, 'reflect keeps fp32 delta in 32-bit scope' );
			assertFp32KeepsDelta( assert, refractDelta.x, 'refract keeps fp32 delta in 32-bit scope' );

		}, NATIVE_F16_OPTIONS );

		gpuTest( 'native 16-bit context converts vector widths at precision boundaries', ( { assert } ) => {

			const x = float( 1 ).add( HALF_ULP_QUARTER_AT_ONE );

			const v2 = vec2( x, 1 );
			const v3 = vec3( x, 1, 1 );
			const v4 = vec4( x, 1, 1, 1 );

			assertHalfEquals( assert, v2, vec2( 1, 1 ), 'vec2 converts to hvec2 and promotes back to vec2' );
			assertHalfEquals( assert, v3, vec3( 1, 1, 1 ), 'vec3 converts to hvec3 and promotes back to vec3' );
			assertHalfEquals( assert, v4, vec4( 1, 1, 1, 1 ), 'vec4 converts to hvec4 and promotes back to vec4' );

			assertFp32KeepsDelta( assert, v2.x.sub( 1 ), 'vec2 keeps fp32 delta in 32-bit scope' );
			assertFp32KeepsDelta( assert, v3.x.sub( 1 ), 'vec3 keeps fp32 delta in 32-bit scope' );
			assertFp32KeepsDelta( assert, v4.x.sub( 1 ), 'vec4 keeps fp32 delta in 32-bit scope' );

		}, NATIVE_F16_OPTIONS );

		gpuTest( 'native 16-bit context converts matrix widths at precision boundaries', ( { assert } ) => {

			const x = float( 1 ).add( HALF_ULP_QUARTER_AT_ONE );
			const m2 = mat2(
				x, 0,
				0, 1
			);
			const i2 = mat2(
				1, 0,
				0, 1
			);
			const m3 = mat3(
				x, 0, 0,
				0, 1, 0,
				0, 0, 1
			);
			const i3 = mat3(
				1, 0, 0,
				0, 1, 0,
				0, 0, 1
			);
			const m4 = mat4(
				x, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			);
			const i4 = mat4(
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			);

			assertHalfEquals( assert, m2, i2, 'mat2 converts to hmat2 and promotes back to mat2' );
			assertHalfEquals( assert, m3, i3, 'mat3 converts to hmat3 and promotes back to mat3' );
			assertHalfEquals( assert, m4, i4, 'mat4 converts to hmat4 and promotes back to mat4' );

			assertFp32KeepsDelta( assert, m2.element( 0 ).x.sub( 1 ), 'mat2 keeps fp32 delta in 32-bit scope' );
			assertFp32KeepsDelta( assert, m3.element( 0 ).x.sub( 1 ), 'mat3 keeps fp32 delta in 32-bit scope' );
			assertFp32KeepsDelta( assert, m4.element( 0 ).x.sub( 1 ), 'mat4 keeps fp32 delta in 32-bit scope' );

		}, NATIVE_F16_OPTIONS );

		gpuTest( 'native 16-bit context rounds vector-matrix operation inputs', ( { assert } ) => {

			const x = float( 1 ).add( HALF_ULP_QUARTER_AT_ONE );
			const matrix = mat3(
				x, 0, 0,
				0, 1, 0,
				0, 0, 1
			);
			const identity = mat3(
				1, 0, 0,
				0, 1, 0,
				0, 0, 1
			);
			const axis = vec3( 1, 0, 0 );

			assertHalfEquals( assert, mul( matrix, axis ), axis, 'matrix-vector multiplication rounds matrix input to fp16' );
			assertHalfEquals( assert, mul( axis, matrix ), axis, 'vector-matrix multiplication rounds matrix input to fp16' );
			assertHalfEquals( assert, mul( matrix, identity ), identity, 'matrix-matrix multiplication rounds matrix input to fp16' );

			assertFp32KeepsDelta( assert, mul( matrix, axis ).x.sub( 1 ), 'matrix-vector multiplication keeps fp32 input delta in fp32 scope' );

		}, NATIVE_F16_OPTIONS );

		gpuTest( 'native 16-bit context reaches mix and select branches', ( { assert } ) => {

			const x = float( 1 ).add( HALF_ULP_QUARTER_AT_ONE );
			const condition = x.greaterThan( 0 );
			const mixedScalar = mix( float( 1 ), x, float( 1 ) ).sub( 1 );
			const selectedScalar = condition.select( x, float( 0 ) ).sub( 1 );
			const mixedVector = mix( vec3( 1 ), vec3( x, 1, 1 ), vec3( 1 ) ).sub( vec3( 1 ) );
			const selectedVector = condition.select( vec3( x, 1, 1 ), vec3( 0 ) ).sub( vec3( 1 ) );

			assertHalfEquals( assert, mixedScalar, float( 0 ), 'mix scalar inputs round in fp16 scope' );
			assertHalfEquals( assert, selectedScalar, float( 0 ), 'select scalar branch rounds in fp16 scope' );
			assertHalfEquals( assert, mixedVector, vec3( 0, 0, 0 ), 'mix vector inputs round in fp16 scope' );
			assertHalfEquals( assert, selectedVector, vec3( 0, 0, 0 ), 'select vector branch rounds in fp16 scope' );

			assertFp32KeepsDelta( assert, mixedScalar, 'mix scalar keeps fp32 delta in 32-bit scope' );
			assertFp32KeepsDelta( assert, selectedScalar, 'select scalar keeps fp32 delta in 32-bit scope' );
			assertFp32KeepsDelta( assert, mixedVector.x, 'mix vector keeps fp32 delta in 32-bit scope' );
			assertFp32KeepsDelta( assert, selectedVector.x, 'select vector keeps fp32 delta in 32-bit scope' );

		}, NATIVE_F16_OPTIONS );

		gpuTest( 'shared node can be used in fp32 and fp16 contexts', ( { assert } ) => {

			const shared = float( 2048 ).add( 1 ).sub( 2048 );

			assert.closeAbs( shared, float( 1 ), 1e-3, 'shared node in default fp32 context' );
			assertHalfEquals( assert, shared, float( 0 ), 'same shared node in fp16 context', 1e-3 );

		}, NATIVE_F16_OPTIONS );

		gpuTest( 'Fn call can be evaluated in a 16-bit context', ( { assert } ) => {

			const compute = Fn( () => {

				return float( 2048 ).add( 1 ).sub( 2048 );

			} );

			assertHalfEquals( assert, compute(), float( 0 ), 'whole function call uses fp16 intermediates', 1e-3 );

		}, NATIVE_F16_OPTIONS );

		gpuTest( 'swizzled vector resources convert at a 16-bit operator boundary', ( { assert } ) => {

			const position = uniform( vec3( 1, 0, 1 ), 'vec3' );
			const offset = uniform( vec2( 2, 3 ), 'vec2' );

			assert.closeAbs( position.xz.add( offset ).setPrecision( 16 ), vec2( 3, 4 ), 1e-3, 'fp32 vector swizzles and uniforms convert before the operator emits code' );

		}, NATIVE_F16_OPTIONS );

		gpuTest( 'Fn call converts swizzled vector inputs and uniforms in a 16-bit context', ( { assert } ) => {

			const offset = uniform( vec2( 2, 3 ), 'vec2' );
			const compute = Fn( ( [ position ] ) => {

				return position.xz.add( offset );

			} );

			assert.closeAbs( compute( vec3( 1, 0, 1 ) ).setPrecision( 16 ), vec2( 3, 4 ), 1e-3, 'fp32 vector swizzles and uniforms convert at the operator boundary' );

		}, NATIVE_F16_OPTIONS );

		gpuTest( 'Fn call converts nested scalar resource operations in a 16-bit context', ( { assert } ) => {

			const frequency = uniform( vec2( 3, 1 ), 'vec2' );
			const speed = uniform( 1.25, 'float' );
			const multiplier = uniform( 0.15, 'float' );
			const compute = Fn( ( [ position ] ) => {

				return sin( position.x.mul( frequency.x ).add( float( 1 ).mul( speed ) ) ).mul( multiplier );

			} );

			assert.closeAbs( compute( vec3( 1, 0, 1 ) ).setPrecision( 16 ), compute( vec3( 1, 0, 1 ) ).setPrecision( 32 ), 1e-2, 'nested fp32 scalar resource operations convert before mixing with fp16 terms' );

		}, NATIVE_F16_OPTIONS );

		gpuTest( '16-bit addAssign converts a nested 32-bit term', ( { assert } ) => {

			const compute = Fn( () => {

				const sum = float( 1 ).toVar();

				sum.addAssign( float( 1 ).setPrecision( 32 ) );

				return sum;

			} );

			assert.closeAbs( compute().setPrecision( 16 ), float( 2 ), 1e-2, 'nested fp32 addend converts before addAssign in an fp16 scope' );

		}, NATIVE_F16_OPTIONS );

		gpuTest( '16-bit loop addAssign converts a nested 32-bit term', ( { assert } ) => {

			const compute = Fn( () => {

				const elevation = float( 0 ).toVar();

				Loop( { type: 'float', start: float( 1 ), end: float( 2 ), condition: '<' }, ( { i } ) => {

					elevation.addAssign( mx_noise_float( vec2( i, 1.25 ), 1, 0 ).setPrecision( 32 ).div( i.add( 1 ) ) );

				} );

				return elevation;

			} );

			assert.closeAbs( compute().setPrecision( 16 ), compute().setPrecision( 32 ), 1, 'loop addAssign converts nested fp32 noise into the surrounding fp16 temporary' );

		}, NATIVE_F16_OPTIONS );

		gpuTest( 'constructor converts unary uniform operands in a 16-bit context', ( { assert } ) => {

			const shift = uniform( 0.25, 'float' );

			assert.closeAbs( vec3( 0, 0, shift.negate() ).setPrecision( 16 ), vec3( 0, 0, - 0.25 ), 1e-3, 'unary uniform operands convert before entering an fp16 vector constructor' );

		}, NATIVE_F16_OPTIONS );

		gpuTest( 'overloaded functions match precision-lowered vector inputs by base type', ( { assert } ) => {

			const noise = mx_noise_float( vec3( 1.25, 2.5, 3.75 ) );

			assert.closeAbs( noise.setPrecision( 16 ), noise.setPrecision( 32 ), 1, 'hvec3 input selects the vec3 overload instead of the vec2 overload' );

		}, NATIVE_F16_OPTIONS );

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
