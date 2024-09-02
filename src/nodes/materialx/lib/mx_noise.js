// Three.js Transpiler
// https://raw.githubusercontent.com/AcademySoftwareFoundation/MaterialX/main/libraries/stdlib/genglsl/lib/mx_noise.glsl

import { int, uint, float, vec3, bool, uvec3, vec2, vec4, If, Fn } from '../../tsl/TSLBase.js';
import { select } from '../../math/ConditionalNode.js';
import { sub, mul } from '../../math/OperatorNode.js';
import { floor, abs, max, dot, min, sqrt } from '../../math/MathNode.js';
import { overloadingFn } from '../../utils/FunctionOverloadingNode.js';
import { Loop } from '../../utils/LoopNode.js';


export const mx_select = /*@__PURE__*/ Fn( ( [ b_immutable, t_immutable, f_immutable ] ) => {

	const f = float( f_immutable ).toVar();
	const t = float( t_immutable ).toVar();
	const b = bool( b_immutable ).toVar();

	return select( b, t, f );

} ).setLayout( {
	name: 'mx_select',
	type: 'float',
	inputs: [
		{ name: 'b', type: 'bool' },
		{ name: 't', type: 'float' },
		{ name: 'f', type: 'float' }
	]
} );

export const mx_negate_if = /*@__PURE__*/ Fn( ( [ val_immutable, b_immutable ] ) => {

	const b = bool( b_immutable ).toVar();
	const val = float( val_immutable ).toVar();

	return select( b, val.negate(), val );

} ).setLayout( {
	name: 'mx_negate_if',
	type: 'float',
	inputs: [
		{ name: 'val', type: 'float' },
		{ name: 'b', type: 'bool' }
	]
} );

export const mx_floor = /*@__PURE__*/ Fn( ( [ x_immutable ] ) => {

	const x = float( x_immutable ).toVar();

	return int( floor( x ) );

} ).setLayout( {
	name: 'mx_floor',
	type: 'int',
	inputs: [
		{ name: 'x', type: 'float' }
	]
} );

export const mx_floorfrac = /*@__PURE__*/ Fn( ( [ x_immutable, i ] ) => {

	const x = float( x_immutable ).toVar();
	i.assign( mx_floor( x ) );

	return x.sub( float( i ) );

} );

export const mx_bilerp_0 = /*@__PURE__*/ Fn( ( [ v0_immutable, v1_immutable, v2_immutable, v3_immutable, s_immutable, t_immutable ] ) => {

	const t = float( t_immutable ).toVar();
	const s = float( s_immutable ).toVar();
	const v3 = float( v3_immutable ).toVar();
	const v2 = float( v2_immutable ).toVar();
	const v1 = float( v1_immutable ).toVar();
	const v0 = float( v0_immutable ).toVar();
	const s1 = float( sub( 1.0, s ) ).toVar();

	return sub( 1.0, t ).mul( v0.mul( s1 ).add( v1.mul( s ) ) ).add( t.mul( v2.mul( s1 ).add( v3.mul( s ) ) ) );

} ).setLayout( {
	name: 'mx_bilerp_0',
	type: 'float',
	inputs: [
		{ name: 'v0', type: 'float' },
		{ name: 'v1', type: 'float' },
		{ name: 'v2', type: 'float' },
		{ name: 'v3', type: 'float' },
		{ name: 's', type: 'float' },
		{ name: 't', type: 'float' }
	]
} );

export const mx_bilerp_1 = /*@__PURE__*/ Fn( ( [ v0_immutable, v1_immutable, v2_immutable, v3_immutable, s_immutable, t_immutable ] ) => {

	const t = float( t_immutable ).toVar();
	const s = float( s_immutable ).toVar();
	const v3 = vec3( v3_immutable ).toVar();
	const v2 = vec3( v2_immutable ).toVar();
	const v1 = vec3( v1_immutable ).toVar();
	const v0 = vec3( v0_immutable ).toVar();
	const s1 = float( sub( 1.0, s ) ).toVar();

	return sub( 1.0, t ).mul( v0.mul( s1 ).add( v1.mul( s ) ) ).add( t.mul( v2.mul( s1 ).add( v3.mul( s ) ) ) );

} ).setLayout( {
	name: 'mx_bilerp_1',
	type: 'vec3',
	inputs: [
		{ name: 'v0', type: 'vec3' },
		{ name: 'v1', type: 'vec3' },
		{ name: 'v2', type: 'vec3' },
		{ name: 'v3', type: 'vec3' },
		{ name: 's', type: 'float' },
		{ name: 't', type: 'float' }
	]
} );

export const mx_bilerp = /*@__PURE__*/ overloadingFn( [ mx_bilerp_0, mx_bilerp_1 ] );

export const mx_trilerp_0 = /*@__PURE__*/ Fn( ( [ v0_immutable, v1_immutable, v2_immutable, v3_immutable, v4_immutable, v5_immutable, v6_immutable, v7_immutable, s_immutable, t_immutable, r_immutable ] ) => {

	const r = float( r_immutable ).toVar();
	const t = float( t_immutable ).toVar();
	const s = float( s_immutable ).toVar();
	const v7 = float( v7_immutable ).toVar();
	const v6 = float( v6_immutable ).toVar();
	const v5 = float( v5_immutable ).toVar();
	const v4 = float( v4_immutable ).toVar();
	const v3 = float( v3_immutable ).toVar();
	const v2 = float( v2_immutable ).toVar();
	const v1 = float( v1_immutable ).toVar();
	const v0 = float( v0_immutable ).toVar();
	const s1 = float( sub( 1.0, s ) ).toVar();
	const t1 = float( sub( 1.0, t ) ).toVar();
	const r1 = float( sub( 1.0, r ) ).toVar();

	return r1.mul( t1.mul( v0.mul( s1 ).add( v1.mul( s ) ) ).add( t.mul( v2.mul( s1 ).add( v3.mul( s ) ) ) ) ).add( r.mul( t1.mul( v4.mul( s1 ).add( v5.mul( s ) ) ).add( t.mul( v6.mul( s1 ).add( v7.mul( s ) ) ) ) ) );

} ).setLayout( {
	name: 'mx_trilerp_0',
	type: 'float',
	inputs: [
		{ name: 'v0', type: 'float' },
		{ name: 'v1', type: 'float' },
		{ name: 'v2', type: 'float' },
		{ name: 'v3', type: 'float' },
		{ name: 'v4', type: 'float' },
		{ name: 'v5', type: 'float' },
		{ name: 'v6', type: 'float' },
		{ name: 'v7', type: 'float' },
		{ name: 's', type: 'float' },
		{ name: 't', type: 'float' },
		{ name: 'r', type: 'float' }
	]
} );

export const mx_trilerp_1 = /*@__PURE__*/ Fn( ( [ v0_immutable, v1_immutable, v2_immutable, v3_immutable, v4_immutable, v5_immutable, v6_immutable, v7_immutable, s_immutable, t_immutable, r_immutable ] ) => {

	const r = float( r_immutable ).toVar();
	const t = float( t_immutable ).toVar();
	const s = float( s_immutable ).toVar();
	const v7 = vec3( v7_immutable ).toVar();
	const v6 = vec3( v6_immutable ).toVar();
	const v5 = vec3( v5_immutable ).toVar();
	const v4 = vec3( v4_immutable ).toVar();
	const v3 = vec3( v3_immutable ).toVar();
	const v2 = vec3( v2_immutable ).toVar();
	const v1 = vec3( v1_immutable ).toVar();
	const v0 = vec3( v0_immutable ).toVar();
	const s1 = float( sub( 1.0, s ) ).toVar();
	const t1 = float( sub( 1.0, t ) ).toVar();
	const r1 = float( sub( 1.0, r ) ).toVar();

	return r1.mul( t1.mul( v0.mul( s1 ).add( v1.mul( s ) ) ).add( t.mul( v2.mul( s1 ).add( v3.mul( s ) ) ) ) ).add( r.mul( t1.mul( v4.mul( s1 ).add( v5.mul( s ) ) ).add( t.mul( v6.mul( s1 ).add( v7.mul( s ) ) ) ) ) );

} ).setLayout( {
	name: 'mx_trilerp_1',
	type: 'vec3',
	inputs: [
		{ name: 'v0', type: 'vec3' },
		{ name: 'v1', type: 'vec3' },
		{ name: 'v2', type: 'vec3' },
		{ name: 'v3', type: 'vec3' },
		{ name: 'v4', type: 'vec3' },
		{ name: 'v5', type: 'vec3' },
		{ name: 'v6', type: 'vec3' },
		{ name: 'v7', type: 'vec3' },
		{ name: 's', type: 'float' },
		{ name: 't', type: 'float' },
		{ name: 'r', type: 'float' }
	]
} );

export const mx_trilerp = /*@__PURE__*/ overloadingFn( [ mx_trilerp_0, mx_trilerp_1 ] );

export const mx_gradient_float_0 = /*@__PURE__*/ Fn( ( [ hash_immutable, x_immutable, y_immutable ] ) => {

	const y = float( y_immutable ).toVar();
	const x = float( x_immutable ).toVar();
	const hash = uint( hash_immutable ).toVar();
	const h = uint( hash.bitAnd( uint( 7 ) ) ).toVar();
	const u = float( mx_select( h.lessThan( uint( 4 ) ), x, y ) ).toVar();
	const v = float( mul( 2.0, mx_select( h.lessThan( uint( 4 ) ), y, x ) ) ).toVar();

	return mx_negate_if( u, bool( h.bitAnd( uint( 1 ) ) ) ).add( mx_negate_if( v, bool( h.bitAnd( uint( 2 ) ) ) ) );

} ).setLayout( {
	name: 'mx_gradient_float_0',
	type: 'float',
	inputs: [
		{ name: 'hash', type: 'uint' },
		{ name: 'x', type: 'float' },
		{ name: 'y', type: 'float' }
	]
} );

export const mx_gradient_float_1 = /*@__PURE__*/ Fn( ( [ hash_immutable, x_immutable, y_immutable, z_immutable ] ) => {

	const z = float( z_immutable ).toVar();
	const y = float( y_immutable ).toVar();
	const x = float( x_immutable ).toVar();
	const hash = uint( hash_immutable ).toVar();
	const h = uint( hash.bitAnd( uint( 15 ) ) ).toVar();
	const u = float( mx_select( h.lessThan( uint( 8 ) ), x, y ) ).toVar();
	const v = float( mx_select( h.lessThan( uint( 4 ) ), y, mx_select( h.equal( uint( 12 ) ).or( h.equal( uint( 14 ) ) ), x, z ) ) ).toVar();

	return mx_negate_if( u, bool( h.bitAnd( uint( 1 ) ) ) ).add( mx_negate_if( v, bool( h.bitAnd( uint( 2 ) ) ) ) );

} ).setLayout( {
	name: 'mx_gradient_float_1',
	type: 'float',
	inputs: [
		{ name: 'hash', type: 'uint' },
		{ name: 'x', type: 'float' },
		{ name: 'y', type: 'float' },
		{ name: 'z', type: 'float' }
	]
} );

export const mx_gradient_float = /*@__PURE__*/ overloadingFn( [ mx_gradient_float_0, mx_gradient_float_1 ] );

export const mx_gradient_vec3_0 = /*@__PURE__*/ Fn( ( [ hash_immutable, x_immutable, y_immutable ] ) => {

	const y = float( y_immutable ).toVar();
	const x = float( x_immutable ).toVar();
	const hash = uvec3( hash_immutable ).toVar();

	return vec3( mx_gradient_float( hash.x, x, y ), mx_gradient_float( hash.y, x, y ), mx_gradient_float( hash.z, x, y ) );

} ).setLayout( {
	name: 'mx_gradient_vec3_0',
	type: 'vec3',
	inputs: [
		{ name: 'hash', type: 'uvec3' },
		{ name: 'x', type: 'float' },
		{ name: 'y', type: 'float' }
	]
} );

export const mx_gradient_vec3_1 = /*@__PURE__*/ Fn( ( [ hash_immutable, x_immutable, y_immutable, z_immutable ] ) => {

	const z = float( z_immutable ).toVar();
	const y = float( y_immutable ).toVar();
	const x = float( x_immutable ).toVar();
	const hash = uvec3( hash_immutable ).toVar();

	return vec3( mx_gradient_float( hash.x, x, y, z ), mx_gradient_float( hash.y, x, y, z ), mx_gradient_float( hash.z, x, y, z ) );

} ).setLayout( {
	name: 'mx_gradient_vec3_1',
	type: 'vec3',
	inputs: [
		{ name: 'hash', type: 'uvec3' },
		{ name: 'x', type: 'float' },
		{ name: 'y', type: 'float' },
		{ name: 'z', type: 'float' }
	]
} );

export const mx_gradient_vec3 = /*@__PURE__*/ overloadingFn( [ mx_gradient_vec3_0, mx_gradient_vec3_1 ] );

export const mx_gradient_scale2d_0 = /*@__PURE__*/ Fn( ( [ v_immutable ] ) => {

	const v = float( v_immutable ).toVar();

	return mul( 0.6616, v );

} ).setLayout( {
	name: 'mx_gradient_scale2d_0',
	type: 'float',
	inputs: [
		{ name: 'v', type: 'float' }
	]
} );

export const mx_gradient_scale3d_0 = /*@__PURE__*/ Fn( ( [ v_immutable ] ) => {

	const v = float( v_immutable ).toVar();

	return mul( 0.9820, v );

} ).setLayout( {
	name: 'mx_gradient_scale3d_0',
	type: 'float',
	inputs: [
		{ name: 'v', type: 'float' }
	]
} );

export const mx_gradient_scale2d_1 = /*@__PURE__*/ Fn( ( [ v_immutable ] ) => {

	const v = vec3( v_immutable ).toVar();

	return mul( 0.6616, v );

} ).setLayout( {
	name: 'mx_gradient_scale2d_1',
	type: 'vec3',
	inputs: [
		{ name: 'v', type: 'vec3' }
	]
} );

export const mx_gradient_scale2d = /*@__PURE__*/ overloadingFn( [ mx_gradient_scale2d_0, mx_gradient_scale2d_1 ] );

export const mx_gradient_scale3d_1 = /*@__PURE__*/ Fn( ( [ v_immutable ] ) => {

	const v = vec3( v_immutable ).toVar();

	return mul( 0.9820, v );

} ).setLayout( {
	name: 'mx_gradient_scale3d_1',
	type: 'vec3',
	inputs: [
		{ name: 'v', type: 'vec3' }
	]
} );

export const mx_gradient_scale3d = /*@__PURE__*/ overloadingFn( [ mx_gradient_scale3d_0, mx_gradient_scale3d_1 ] );

export const mx_rotl32 = /*@__PURE__*/ Fn( ( [ x_immutable, k_immutable ] ) => {

	const k = int( k_immutable ).toVar();
	const x = uint( x_immutable ).toVar();

	return x.shiftLeft( k ).bitOr( x.shiftRight( int( 32 ).sub( k ) ) );

} ).setLayout( {
	name: 'mx_rotl32',
	type: 'uint',
	inputs: [
		{ name: 'x', type: 'uint' },
		{ name: 'k', type: 'int' }
	]
} );

export const mx_bjmix = /*@__PURE__*/ Fn( ( [ a, b, c ] ) => {

	a.subAssign( c );
	a.bitXorAssign( mx_rotl32( c, int( 4 ) ) );
	c.addAssign( b );
	b.subAssign( a );
	b.bitXorAssign( mx_rotl32( a, int( 6 ) ) );
	a.addAssign( c );
	c.subAssign( b );
	c.bitXorAssign( mx_rotl32( b, int( 8 ) ) );
	b.addAssign( a );
	a.subAssign( c );
	a.bitXorAssign( mx_rotl32( c, int( 16 ) ) );
	c.addAssign( b );
	b.subAssign( a );
	b.bitXorAssign( mx_rotl32( a, int( 19 ) ) );
	a.addAssign( c );
	c.subAssign( b );
	c.bitXorAssign( mx_rotl32( b, int( 4 ) ) );
	b.addAssign( a );

} );

export const mx_bjfinal = /*@__PURE__*/ Fn( ( [ a_immutable, b_immutable, c_immutable ] ) => {

	const c = uint( c_immutable ).toVar();
	const b = uint( b_immutable ).toVar();
	const a = uint( a_immutable ).toVar();
	c.bitXorAssign( b );
	c.subAssign( mx_rotl32( b, int( 14 ) ) );
	a.bitXorAssign( c );
	a.subAssign( mx_rotl32( c, int( 11 ) ) );
	b.bitXorAssign( a );
	b.subAssign( mx_rotl32( a, int( 25 ) ) );
	c.bitXorAssign( b );
	c.subAssign( mx_rotl32( b, int( 16 ) ) );
	a.bitXorAssign( c );
	a.subAssign( mx_rotl32( c, int( 4 ) ) );
	b.bitXorAssign( a );
	b.subAssign( mx_rotl32( a, int( 14 ) ) );
	c.bitXorAssign( b );
	c.subAssign( mx_rotl32( b, int( 24 ) ) );

	return c;

} ).setLayout( {
	name: 'mx_bjfinal',
	type: 'uint',
	inputs: [
		{ name: 'a', type: 'uint' },
		{ name: 'b', type: 'uint' },
		{ name: 'c', type: 'uint' }
	]
} );

export const mx_bits_to_01 = /*@__PURE__*/ Fn( ( [ bits_immutable ] ) => {

	const bits = uint( bits_immutable ).toVar();

	return float( bits ).div( float( uint( int( 0xffffffff ) ) ) );

} ).setLayout( {
	name: 'mx_bits_to_01',
	type: 'float',
	inputs: [
		{ name: 'bits', type: 'uint' }
	]
} );

export const mx_fade = /*@__PURE__*/ Fn( ( [ t_immutable ] ) => {

	const t = float( t_immutable ).toVar();

	return t.mul( t ).mul( t ).mul( t.mul( t.mul( 6.0 ).sub( 15.0 ) ).add( 10.0 ) );

} ).setLayout( {
	name: 'mx_fade',
	type: 'float',
	inputs: [
		{ name: 't', type: 'float' }
	]
} );

export const mx_hash_int_0 = /*@__PURE__*/ Fn( ( [ x_immutable ] ) => {

	const x = int( x_immutable ).toVar();
	const len = uint( uint( 1 ) ).toVar();
	const seed = uint( uint( int( 0xdeadbeef ) ).add( len.shiftLeft( uint( 2 ) ) ).add( uint( 13 ) ) ).toVar();

	return mx_bjfinal( seed.add( uint( x ) ), seed, seed );

} ).setLayout( {
	name: 'mx_hash_int_0',
	type: 'uint',
	inputs: [
		{ name: 'x', type: 'int' }
	]
} );

export const mx_hash_int_1 = /*@__PURE__*/ Fn( ( [ x_immutable, y_immutable ] ) => {

	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const len = uint( uint( 2 ) ).toVar();
	const a = uint().toVar(), b = uint().toVar(), c = uint().toVar();
	a.assign( b.assign( c.assign( uint( int( 0xdeadbeef ) ).add( len.shiftLeft( uint( 2 ) ) ).add( uint( 13 ) ) ) ) );
	a.addAssign( uint( x ) );
	b.addAssign( uint( y ) );

	return mx_bjfinal( a, b, c );

} ).setLayout( {
	name: 'mx_hash_int_1',
	type: 'uint',
	inputs: [
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' }
	]
} );

export const mx_hash_int_2 = /*@__PURE__*/ Fn( ( [ x_immutable, y_immutable, z_immutable ] ) => {

	const z = int( z_immutable ).toVar();
	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const len = uint( uint( 3 ) ).toVar();
	const a = uint().toVar(), b = uint().toVar(), c = uint().toVar();
	a.assign( b.assign( c.assign( uint( int( 0xdeadbeef ) ).add( len.shiftLeft( uint( 2 ) ) ).add( uint( 13 ) ) ) ) );
	a.addAssign( uint( x ) );
	b.addAssign( uint( y ) );
	c.addAssign( uint( z ) );

	return mx_bjfinal( a, b, c );

} ).setLayout( {
	name: 'mx_hash_int_2',
	type: 'uint',
	inputs: [
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' },
		{ name: 'z', type: 'int' }
	]
} );

export const mx_hash_int_3 = /*@__PURE__*/ Fn( ( [ x_immutable, y_immutable, z_immutable, xx_immutable ] ) => {

	const xx = int( xx_immutable ).toVar();
	const z = int( z_immutable ).toVar();
	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const len = uint( uint( 4 ) ).toVar();
	const a = uint().toVar(), b = uint().toVar(), c = uint().toVar();
	a.assign( b.assign( c.assign( uint( int( 0xdeadbeef ) ).add( len.shiftLeft( uint( 2 ) ) ).add( uint( 13 ) ) ) ) );
	a.addAssign( uint( x ) );
	b.addAssign( uint( y ) );
	c.addAssign( uint( z ) );
	mx_bjmix( a, b, c );
	a.addAssign( uint( xx ) );

	return mx_bjfinal( a, b, c );

} ).setLayout( {
	name: 'mx_hash_int_3',
	type: 'uint',
	inputs: [
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' },
		{ name: 'z', type: 'int' },
		{ name: 'xx', type: 'int' }
	]
} );

export const mx_hash_int_4 = /*@__PURE__*/ Fn( ( [ x_immutable, y_immutable, z_immutable, xx_immutable, yy_immutable ] ) => {

	const yy = int( yy_immutable ).toVar();
	const xx = int( xx_immutable ).toVar();
	const z = int( z_immutable ).toVar();
	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const len = uint( uint( 5 ) ).toVar();
	const a = uint().toVar(), b = uint().toVar(), c = uint().toVar();
	a.assign( b.assign( c.assign( uint( int( 0xdeadbeef ) ).add( len.shiftLeft( uint( 2 ) ) ).add( uint( 13 ) ) ) ) );
	a.addAssign( uint( x ) );
	b.addAssign( uint( y ) );
	c.addAssign( uint( z ) );
	mx_bjmix( a, b, c );
	a.addAssign( uint( xx ) );
	b.addAssign( uint( yy ) );

	return mx_bjfinal( a, b, c );

} ).setLayout( {
	name: 'mx_hash_int_4',
	type: 'uint',
	inputs: [
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' },
		{ name: 'z', type: 'int' },
		{ name: 'xx', type: 'int' },
		{ name: 'yy', type: 'int' }
	]
} );

export const mx_hash_int = /*@__PURE__*/ overloadingFn( [ mx_hash_int_0, mx_hash_int_1, mx_hash_int_2, mx_hash_int_3, mx_hash_int_4 ] );

export const mx_hash_vec3_0 = /*@__PURE__*/ Fn( ( [ x_immutable, y_immutable ] ) => {

	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const h = uint( mx_hash_int( x, y ) ).toVar();
	const result = uvec3().toVar();
	result.x.assign( h.bitAnd( int( 0xFF ) ) );
	result.y.assign( h.shiftRight( int( 8 ) ).bitAnd( int( 0xFF ) ) );
	result.z.assign( h.shiftRight( int( 16 ) ).bitAnd( int( 0xFF ) ) );

	return result;

} ).setLayout( {
	name: 'mx_hash_vec3_0',
	type: 'uvec3',
	inputs: [
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' }
	]
} );

export const mx_hash_vec3_1 = /*@__PURE__*/ Fn( ( [ x_immutable, y_immutable, z_immutable ] ) => {

	const z = int( z_immutable ).toVar();
	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const h = uint( mx_hash_int( x, y, z ) ).toVar();
	const result = uvec3().toVar();
	result.x.assign( h.bitAnd( int( 0xFF ) ) );
	result.y.assign( h.shiftRight( int( 8 ) ).bitAnd( int( 0xFF ) ) );
	result.z.assign( h.shiftRight( int( 16 ) ).bitAnd( int( 0xFF ) ) );

	return result;

} ).setLayout( {
	name: 'mx_hash_vec3_1',
	type: 'uvec3',
	inputs: [
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' },
		{ name: 'z', type: 'int' }
	]
} );

export const mx_hash_vec3 = /*@__PURE__*/ overloadingFn( [ mx_hash_vec3_0, mx_hash_vec3_1 ] );

export const mx_perlin_noise_float_0 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec2( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar();
	const fx = float( mx_floorfrac( p.x, X ) ).toVar();
	const fy = float( mx_floorfrac( p.y, Y ) ).toVar();
	const u = float( mx_fade( fx ) ).toVar();
	const v = float( mx_fade( fy ) ).toVar();
	const result = float( mx_bilerp( mx_gradient_float( mx_hash_int( X, Y ), fx, fy ), mx_gradient_float( mx_hash_int( X.add( int( 1 ) ), Y ), fx.sub( 1.0 ), fy ), mx_gradient_float( mx_hash_int( X, Y.add( int( 1 ) ) ), fx, fy.sub( 1.0 ) ), mx_gradient_float( mx_hash_int( X.add( int( 1 ) ), Y.add( int( 1 ) ) ), fx.sub( 1.0 ), fy.sub( 1.0 ) ), u, v ) ).toVar();

	return mx_gradient_scale2d( result );

} ).setLayout( {
	name: 'mx_perlin_noise_float_0',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2' }
	]
} );

export const mx_perlin_noise_float_1 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec3( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar(), Z = int().toVar();
	const fx = float( mx_floorfrac( p.x, X ) ).toVar();
	const fy = float( mx_floorfrac( p.y, Y ) ).toVar();
	const fz = float( mx_floorfrac( p.z, Z ) ).toVar();
	const u = float( mx_fade( fx ) ).toVar();
	const v = float( mx_fade( fy ) ).toVar();
	const w = float( mx_fade( fz ) ).toVar();
	const result = float( mx_trilerp( mx_gradient_float( mx_hash_int( X, Y, Z ), fx, fy, fz ), mx_gradient_float( mx_hash_int( X.add( int( 1 ) ), Y, Z ), fx.sub( 1.0 ), fy, fz ), mx_gradient_float( mx_hash_int( X, Y.add( int( 1 ) ), Z ), fx, fy.sub( 1.0 ), fz ), mx_gradient_float( mx_hash_int( X.add( int( 1 ) ), Y.add( int( 1 ) ), Z ), fx.sub( 1.0 ), fy.sub( 1.0 ), fz ), mx_gradient_float( mx_hash_int( X, Y, Z.add( int( 1 ) ) ), fx, fy, fz.sub( 1.0 ) ), mx_gradient_float( mx_hash_int( X.add( int( 1 ) ), Y, Z.add( int( 1 ) ) ), fx.sub( 1.0 ), fy, fz.sub( 1.0 ) ), mx_gradient_float( mx_hash_int( X, Y.add( int( 1 ) ), Z.add( int( 1 ) ) ), fx, fy.sub( 1.0 ), fz.sub( 1.0 ) ), mx_gradient_float( mx_hash_int( X.add( int( 1 ) ), Y.add( int( 1 ) ), Z.add( int( 1 ) ) ), fx.sub( 1.0 ), fy.sub( 1.0 ), fz.sub( 1.0 ) ), u, v, w ) ).toVar();

	return mx_gradient_scale3d( result );

} ).setLayout( {
	name: 'mx_perlin_noise_float_1',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' }
	]
} );

export const mx_perlin_noise_float = /*@__PURE__*/ overloadingFn( [ mx_perlin_noise_float_0, mx_perlin_noise_float_1 ] );

export const mx_perlin_noise_vec3_0 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec2( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar();
	const fx = float( mx_floorfrac( p.x, X ) ).toVar();
	const fy = float( mx_floorfrac( p.y, Y ) ).toVar();
	const u = float( mx_fade( fx ) ).toVar();
	const v = float( mx_fade( fy ) ).toVar();
	const result = vec3( mx_bilerp( mx_gradient_vec3( mx_hash_vec3( X, Y ), fx, fy ), mx_gradient_vec3( mx_hash_vec3( X.add( int( 1 ) ), Y ), fx.sub( 1.0 ), fy ), mx_gradient_vec3( mx_hash_vec3( X, Y.add( int( 1 ) ) ), fx, fy.sub( 1.0 ) ), mx_gradient_vec3( mx_hash_vec3( X.add( int( 1 ) ), Y.add( int( 1 ) ) ), fx.sub( 1.0 ), fy.sub( 1.0 ) ), u, v ) ).toVar();

	return mx_gradient_scale2d( result );

} ).setLayout( {
	name: 'mx_perlin_noise_vec3_0',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec2' }
	]
} );

export const mx_perlin_noise_vec3_1 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec3( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar(), Z = int().toVar();
	const fx = float( mx_floorfrac( p.x, X ) ).toVar();
	const fy = float( mx_floorfrac( p.y, Y ) ).toVar();
	const fz = float( mx_floorfrac( p.z, Z ) ).toVar();
	const u = float( mx_fade( fx ) ).toVar();
	const v = float( mx_fade( fy ) ).toVar();
	const w = float( mx_fade( fz ) ).toVar();
	const result = vec3( mx_trilerp( mx_gradient_vec3( mx_hash_vec3( X, Y, Z ), fx, fy, fz ), mx_gradient_vec3( mx_hash_vec3( X.add( int( 1 ) ), Y, Z ), fx.sub( 1.0 ), fy, fz ), mx_gradient_vec3( mx_hash_vec3( X, Y.add( int( 1 ) ), Z ), fx, fy.sub( 1.0 ), fz ), mx_gradient_vec3( mx_hash_vec3( X.add( int( 1 ) ), Y.add( int( 1 ) ), Z ), fx.sub( 1.0 ), fy.sub( 1.0 ), fz ), mx_gradient_vec3( mx_hash_vec3( X, Y, Z.add( int( 1 ) ) ), fx, fy, fz.sub( 1.0 ) ), mx_gradient_vec3( mx_hash_vec3( X.add( int( 1 ) ), Y, Z.add( int( 1 ) ) ), fx.sub( 1.0 ), fy, fz.sub( 1.0 ) ), mx_gradient_vec3( mx_hash_vec3( X, Y.add( int( 1 ) ), Z.add( int( 1 ) ) ), fx, fy.sub( 1.0 ), fz.sub( 1.0 ) ), mx_gradient_vec3( mx_hash_vec3( X.add( int( 1 ) ), Y.add( int( 1 ) ), Z.add( int( 1 ) ) ), fx.sub( 1.0 ), fy.sub( 1.0 ), fz.sub( 1.0 ) ), u, v, w ) ).toVar();

	return mx_gradient_scale3d( result );

} ).setLayout( {
	name: 'mx_perlin_noise_vec3_1',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec3' }
	]
} );

export const mx_perlin_noise_vec3 = /*@__PURE__*/ overloadingFn( [ mx_perlin_noise_vec3_0, mx_perlin_noise_vec3_1 ] );

export const mx_cell_noise_float_0 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = float( p_immutable ).toVar();
	const ix = int( mx_floor( p ) ).toVar();

	return mx_bits_to_01( mx_hash_int( ix ) );

} ).setLayout( {
	name: 'mx_cell_noise_float_0',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'float' }
	]
} );

export const mx_cell_noise_float_1 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec2( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();

	return mx_bits_to_01( mx_hash_int( ix, iy ) );

} ).setLayout( {
	name: 'mx_cell_noise_float_1',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2' }
	]
} );

export const mx_cell_noise_float_2 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec3( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();
	const iz = int( mx_floor( p.z ) ).toVar();

	return mx_bits_to_01( mx_hash_int( ix, iy, iz ) );

} ).setLayout( {
	name: 'mx_cell_noise_float_2',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' }
	]
} );

export const mx_cell_noise_float_3 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec4( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();
	const iz = int( mx_floor( p.z ) ).toVar();
	const iw = int( mx_floor( p.w ) ).toVar();

	return mx_bits_to_01( mx_hash_int( ix, iy, iz, iw ) );

} ).setLayout( {
	name: 'mx_cell_noise_float_3',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec4' }
	]
} );

export const mx_cell_noise_float = /*@__PURE__*/ overloadingFn( [ mx_cell_noise_float_0, mx_cell_noise_float_1, mx_cell_noise_float_2, mx_cell_noise_float_3 ] );

export const mx_cell_noise_vec3_0 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = float( p_immutable ).toVar();
	const ix = int( mx_floor( p ) ).toVar();

	return vec3( mx_bits_to_01( mx_hash_int( ix, int( 0 ) ) ), mx_bits_to_01( mx_hash_int( ix, int( 1 ) ) ), mx_bits_to_01( mx_hash_int( ix, int( 2 ) ) ) );

} ).setLayout( {
	name: 'mx_cell_noise_vec3_0',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'float' }
	]
} );

export const mx_cell_noise_vec3_1 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec2( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();

	return vec3( mx_bits_to_01( mx_hash_int( ix, iy, int( 0 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, int( 1 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, int( 2 ) ) ) );

} ).setLayout( {
	name: 'mx_cell_noise_vec3_1',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec2' }
	]
} );

export const mx_cell_noise_vec3_2 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec3( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();
	const iz = int( mx_floor( p.z ) ).toVar();

	return vec3( mx_bits_to_01( mx_hash_int( ix, iy, iz, int( 0 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, iz, int( 1 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, iz, int( 2 ) ) ) );

} ).setLayout( {
	name: 'mx_cell_noise_vec3_2',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec3' }
	]
} );

export const mx_cell_noise_vec3_3 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec4( p_immutable ).toVar();
	const ix = int( mx_floor( p.x ) ).toVar();
	const iy = int( mx_floor( p.y ) ).toVar();
	const iz = int( mx_floor( p.z ) ).toVar();
	const iw = int( mx_floor( p.w ) ).toVar();

	return vec3( mx_bits_to_01( mx_hash_int( ix, iy, iz, iw, int( 0 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, iz, iw, int( 1 ) ) ), mx_bits_to_01( mx_hash_int( ix, iy, iz, iw, int( 2 ) ) ) );

} ).setLayout( {
	name: 'mx_cell_noise_vec3_3',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec4' }
	]
} );

export const mx_cell_noise_vec3 = /*@__PURE__*/ overloadingFn( [ mx_cell_noise_vec3_0, mx_cell_noise_vec3_1, mx_cell_noise_vec3_2, mx_cell_noise_vec3_3 ] );

export const mx_fractal_noise_float = /*@__PURE__*/ Fn( ( [ p_immutable, octaves_immutable, lacunarity_immutable, diminish_immutable ] ) => {

	const diminish = float( diminish_immutable ).toVar();
	const lacunarity = float( lacunarity_immutable ).toVar();
	const octaves = int( octaves_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const result = float( 0.0 ).toVar();
	const amplitude = float( 1.0 ).toVar();

	Loop( octaves, () => {

		result.addAssign( amplitude.mul( mx_perlin_noise_float( p ) ) );
		amplitude.mulAssign( diminish );
		p.mulAssign( lacunarity );

	} );

	return result;

} ).setLayout( {
	name: 'mx_fractal_noise_float',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'octaves', type: 'int' },
		{ name: 'lacunarity', type: 'float' },
		{ name: 'diminish', type: 'float' }
	]
} );

export const mx_fractal_noise_vec3 = /*@__PURE__*/ Fn( ( [ p_immutable, octaves_immutable, lacunarity_immutable, diminish_immutable ] ) => {

	const diminish = float( diminish_immutable ).toVar();
	const lacunarity = float( lacunarity_immutable ).toVar();
	const octaves = int( octaves_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const result = vec3( 0.0 ).toVar();
	const amplitude = float( 1.0 ).toVar();

	Loop( octaves, () => {

		result.addAssign( amplitude.mul( mx_perlin_noise_vec3( p ) ) );
		amplitude.mulAssign( diminish );
		p.mulAssign( lacunarity );

	} );

	return result;

} ).setLayout( {
	name: 'mx_fractal_noise_vec3',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'octaves', type: 'int' },
		{ name: 'lacunarity', type: 'float' },
		{ name: 'diminish', type: 'float' }
	]
} );

export const mx_fractal_noise_vec2 = /*@__PURE__*/ Fn( ( [ p_immutable, octaves_immutable, lacunarity_immutable, diminish_immutable ] ) => {

	const diminish = float( diminish_immutable ).toVar();
	const lacunarity = float( lacunarity_immutable ).toVar();
	const octaves = int( octaves_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();

	return vec2( mx_fractal_noise_float( p, octaves, lacunarity, diminish ), mx_fractal_noise_float( p.add( vec3( int( 19 ), int( 193 ), int( 17 ) ) ), octaves, lacunarity, diminish ) );

} ).setLayout( {
	name: 'mx_fractal_noise_vec2',
	type: 'vec2',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'octaves', type: 'int' },
		{ name: 'lacunarity', type: 'float' },
		{ name: 'diminish', type: 'float' }
	]
} );

export const mx_fractal_noise_vec4 = /*@__PURE__*/ Fn( ( [ p_immutable, octaves_immutable, lacunarity_immutable, diminish_immutable ] ) => {

	const diminish = float( diminish_immutable ).toVar();
	const lacunarity = float( lacunarity_immutable ).toVar();
	const octaves = int( octaves_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const c = vec3( mx_fractal_noise_vec3( p, octaves, lacunarity, diminish ) ).toVar();
	const f = float( mx_fractal_noise_float( p.add( vec3( int( 19 ), int( 193 ), int( 17 ) ) ), octaves, lacunarity, diminish ) ).toVar();

	return vec4( c, f );

} ).setLayout( {
	name: 'mx_fractal_noise_vec4',
	type: 'vec4',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'octaves', type: 'int' },
		{ name: 'lacunarity', type: 'float' },
		{ name: 'diminish', type: 'float' }
	]
} );

export const mx_worley_distance_0 = /*@__PURE__*/ Fn( ( [ p_immutable, x_immutable, y_immutable, xoff_immutable, yoff_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const yoff = int( yoff_immutable ).toVar();
	const xoff = int( xoff_immutable ).toVar();
	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	const tmp = vec3( mx_cell_noise_vec3( vec2( x.add( xoff ), y.add( yoff ) ) ) ).toVar();
	const off = vec2( tmp.x, tmp.y ).toVar();
	off.subAssign( 0.5 );
	off.mulAssign( jitter );
	off.addAssign( 0.5 );
	const cellpos = vec2( vec2( float( x ), float( y ) ).add( off ) ).toVar();
	const diff = vec2( cellpos.sub( p ) ).toVar();

	If( metric.equal( int( 2 ) ), () => {

		return abs( diff.x ).add( abs( diff.y ) );

	} );

	If( metric.equal( int( 3 ) ), () => {

		return max( abs( diff.x ), abs( diff.y ) );

	} );

	return dot( diff, diff );

} ).setLayout( {
	name: 'mx_worley_distance_0',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2' },
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' },
		{ name: 'xoff', type: 'int' },
		{ name: 'yoff', type: 'int' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

export const mx_worley_distance_1 = /*@__PURE__*/ Fn( ( [ p_immutable, x_immutable, y_immutable, z_immutable, xoff_immutable, yoff_immutable, zoff_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const zoff = int( zoff_immutable ).toVar();
	const yoff = int( yoff_immutable ).toVar();
	const xoff = int( xoff_immutable ).toVar();
	const z = int( z_immutable ).toVar();
	const y = int( y_immutable ).toVar();
	const x = int( x_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const off = vec3( mx_cell_noise_vec3( vec3( x.add( xoff ), y.add( yoff ), z.add( zoff ) ) ) ).toVar();
	off.subAssign( 0.5 );
	off.mulAssign( jitter );
	off.addAssign( 0.5 );
	const cellpos = vec3( vec3( float( x ), float( y ), float( z ) ).add( off ) ).toVar();
	const diff = vec3( cellpos.sub( p ) ).toVar();

	If( metric.equal( int( 2 ) ), () => {

		return abs( diff.x ).add( abs( diff.y ) ).add( abs( diff.z ) );

	} );

	If( metric.equal( int( 3 ) ), () => {

		return max( max( abs( diff.x ), abs( diff.y ) ), abs( diff.z ) );

	} );

	return dot( diff, diff );

} ).setLayout( {
	name: 'mx_worley_distance_1',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'x', type: 'int' },
		{ name: 'y', type: 'int' },
		{ name: 'z', type: 'int' },
		{ name: 'xoff', type: 'int' },
		{ name: 'yoff', type: 'int' },
		{ name: 'zoff', type: 'int' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

export const mx_worley_distance = /*@__PURE__*/ overloadingFn( [ mx_worley_distance_0, mx_worley_distance_1 ] );

export const mx_worley_noise_float_0 = /*@__PURE__*/ Fn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar();
	const localpos = vec2( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ) ).toVar();
	const sqdist = float( 1e6 ).toVar();

	Loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		Loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			const dist = float( mx_worley_distance( localpos, x, y, X, Y, jitter, metric ) ).toVar();
			sqdist.assign( min( sqdist, dist ) );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} ).setLayout( {
	name: 'mx_worley_noise_float_0',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

export const mx_worley_noise_vec2_0 = /*@__PURE__*/ Fn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar();
	const localpos = vec2( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ) ).toVar();
	const sqdist = vec2( 1e6, 1e6 ).toVar();

	Loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		Loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			const dist = float( mx_worley_distance( localpos, x, y, X, Y, jitter, metric ) ).toVar();

			If( dist.lessThan( sqdist.x ), () => {

				sqdist.y.assign( sqdist.x );
				sqdist.x.assign( dist );

			} ).ElseIf( dist.lessThan( sqdist.y ), () => {

				sqdist.y.assign( dist );

			} );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} ).setLayout( {
	name: 'mx_worley_noise_vec2_0',
	type: 'vec2',
	inputs: [
		{ name: 'p', type: 'vec2' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

export const mx_worley_noise_vec3_0 = /*@__PURE__*/ Fn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar();
	const localpos = vec2( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ) ).toVar();
	const sqdist = vec3( 1e6, 1e6, 1e6 ).toVar();

	Loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		Loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			const dist = float( mx_worley_distance( localpos, x, y, X, Y, jitter, metric ) ).toVar();

			If( dist.lessThan( sqdist.x ), () => {

				sqdist.z.assign( sqdist.y );
				sqdist.y.assign( sqdist.x );
				sqdist.x.assign( dist );

			} ).ElseIf( dist.lessThan( sqdist.y ), () => {

				sqdist.z.assign( sqdist.y );
				sqdist.y.assign( dist );

			} ).ElseIf( dist.lessThan( sqdist.z ), () => {

				sqdist.z.assign( dist );

			} );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} ).setLayout( {
	name: 'mx_worley_noise_vec3_0',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec2' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

export const mx_worley_noise_float_1 = /*@__PURE__*/ Fn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar(), Z = int().toVar();
	const localpos = vec3( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ), mx_floorfrac( p.z, Z ) ).toVar();
	const sqdist = float( 1e6 ).toVar();

	Loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		Loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			Loop( { start: - 1, end: int( 1 ), name: 'z', condition: '<=' }, ( { z } ) => {

				const dist = float( mx_worley_distance( localpos, x, y, z, X, Y, Z, jitter, metric ) ).toVar();
				sqdist.assign( min( sqdist, dist ) );

			} );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} ).setLayout( {
	name: 'mx_worley_noise_float_1',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

export const mx_worley_noise_float = /*@__PURE__*/ overloadingFn( [ mx_worley_noise_float_0, mx_worley_noise_float_1 ] );

export const mx_worley_noise_vec2_1 = /*@__PURE__*/ Fn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar(), Z = int().toVar();
	const localpos = vec3( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ), mx_floorfrac( p.z, Z ) ).toVar();
	const sqdist = vec2( 1e6, 1e6 ).toVar();

	Loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		Loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			Loop( { start: - 1, end: int( 1 ), name: 'z', condition: '<=' }, ( { z } ) => {

				const dist = float( mx_worley_distance( localpos, x, y, z, X, Y, Z, jitter, metric ) ).toVar();

				If( dist.lessThan( sqdist.x ), () => {

					sqdist.y.assign( sqdist.x );
					sqdist.x.assign( dist );

				} ).ElseIf( dist.lessThan( sqdist.y ), () => {

					sqdist.y.assign( dist );

				} );

			} );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} ).setLayout( {
	name: 'mx_worley_noise_vec2_1',
	type: 'vec2',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

export const mx_worley_noise_vec2 = /*@__PURE__*/ overloadingFn( [ mx_worley_noise_vec2_0, mx_worley_noise_vec2_1 ] );

export const mx_worley_noise_vec3_1 = /*@__PURE__*/ Fn( ( [ p_immutable, jitter_immutable, metric_immutable ] ) => {

	const metric = int( metric_immutable ).toVar();
	const jitter = float( jitter_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	const X = int().toVar(), Y = int().toVar(), Z = int().toVar();
	const localpos = vec3( mx_floorfrac( p.x, X ), mx_floorfrac( p.y, Y ), mx_floorfrac( p.z, Z ) ).toVar();
	const sqdist = vec3( 1e6, 1e6, 1e6 ).toVar();

	Loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		Loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			Loop( { start: - 1, end: int( 1 ), name: 'z', condition: '<=' }, ( { z } ) => {

				const dist = float( mx_worley_distance( localpos, x, y, z, X, Y, Z, jitter, metric ) ).toVar();

				If( dist.lessThan( sqdist.x ), () => {

					sqdist.z.assign( sqdist.y );
					sqdist.y.assign( sqdist.x );
					sqdist.x.assign( dist );

				} ).ElseIf( dist.lessThan( sqdist.y ), () => {

					sqdist.z.assign( sqdist.y );
					sqdist.y.assign( dist );

				} ).ElseIf( dist.lessThan( sqdist.z ), () => {

					sqdist.z.assign( dist );

				} );

			} );

		} );

	} );

	If( metric.equal( int( 0 ) ), () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} ).setLayout( {
	name: 'mx_worley_noise_vec3_1',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 'jitter', type: 'float' },
		{ name: 'metric', type: 'int' }
	]
} );

export const mx_worley_noise_vec3 = /*@__PURE__*/ overloadingFn( [ mx_worley_noise_vec3_0, mx_worley_noise_vec3_1 ] );
