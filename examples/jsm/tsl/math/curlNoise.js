import { mod, Fn, vec2, div, vec4, dot, floor, step, sub, min, max, mul, abs, vec3, inverseSqrt, add, float } from 'three/tsl';

/**
 * Permutation polynomial for noise generation.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} x - Input vector.
 * @return {Node<vec4>} Permuted vector.
 */
export const permute = /*@__PURE__*/ Fn( ( [ x ] ) => {

	return mod( x.mul( x ).mul( 34. ).add( x ), 289. );

}, { x: 'vec4', return: 'vec4' } );

/**
 * 3D Simplex noise implementation in TSL.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} v - Input coordinate vector.
 * @return {Node<float>} Simplex noise value.
 */
export const snoise = /*@__PURE__*/ Fn( ( [ v ] ) => {

	const C = div( 1., vec2( 6, 3 ) );
	const D = vec4( 0, .5, 1, 2 );
	const i = floor( v.add( dot( v, C.yyy ) ) );
	const x0 = v.sub( i ).add( dot( i, C.xxx ) );
	const g = step( x0.yzx, x0.xyz );
	const l = sub( 1., g );
	const i1 = min( g.xyz, l.zxy );
	const i2 = max( g.xyz, l.zxy );
	const x1 = x0.sub( i1 ).add( C.x );
	const x2 = x0.sub( i2 ).add( C.y );
	const x3 = x0.sub( D.yyy );
	i.assign( mod( i, 289. ) );
	const p = permute( permute( permute( i.z.add( vec4( 0., i1.z, i2.z, 1. ) ) ).add( i.y ).add( vec4( 0., i1.y, i2.y, 1. ) ) ).add( i.x ).add( vec4( 0., i1.x, i2.x, 1. ) ) );
	const ns = mul( .142857142857, D.wyz ).sub( D.xzx );
	const j = p.sub( mul( 49., floor( p.mul( ns.z ).mul( ns.z ) ) ) );
	const x_ = floor( j.mul( ns.z ) );
	const x = x_.mul( ns.x ).add( ns.yyyy );
	const y = floor( j.sub( mul( 7., x_ ) ) ).mul( ns.x ).add( ns.yyyy );
	const h = sub( 1., abs( x ) ).sub( abs( y ) );
	const b0 = vec4( x.xy, y.xy );
	const b1 = vec4( x.zw, y.zw );
	const sh = step( h, vec4( 0 ) ).negate();
	const a0 = b0.xzyw.add( floor( b0 ).mul( 2. ).add( 1. ).xzyw.mul( sh.xxyy ) );
	const a1 = b1.xzyw.add( floor( b1 ).mul( 2. ).add( 1. ).xzyw.mul( sh.zzww ) );
	const p0 = vec3( a0.xy, h.x );
	const p1 = vec3( a0.zw, h.y );
	const p2 = vec3( a1.xy, h.z );
	const p3 = vec3( a1.zw, h.w );
	const norm = inverseSqrt( vec4( dot( p0, p0 ), dot( p1, p1 ), dot( p2, p2 ), dot( p3, p3 ) ) );
	p0.mulAssign( norm.x );
	p1.mulAssign( norm.y );
	p2.mulAssign( norm.z );
	p3.mulAssign( norm.w );
	const m = max( sub( .6, vec4( dot( x0, x0 ), dot( x1, x1 ), dot( x2, x2 ), dot( x3, x3 ) ) ), 0. );

	return add( .5, mul( 12., dot( m.mul( m ).mul( m ), vec4( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 ), dot( p3, x3 ) ) ) ) );

}, { v: 'vec3', return: 'float' } );

/**
 * 3D Simplex noise vector. Returns a vec3 containing three independent noise samples.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} x - Input coordinate vector.
 * @return {Node<vec3>} Vector of three noise values.
 */
export const snoiseVec3 = /*@__PURE__*/ Fn( ( [ x ] ) => {

	return vec3( snoise( vec3( x ).mul( 2. ).sub( 1. ) ), snoise( vec3( x.y.sub( 19.1 ), x.z.add( 33.4 ), x.x.add( 47.2 ) ) ).mul( 2. ).sub( 1. ), snoise( vec3( x.z.add( 74.2 ), x.x.sub( 124.5 ), x.y.add( 99.4 ) ).mul( 2. ).sub( 1. ) ) );

}, { x: 'vec3', return: 'vec3' } );

/**
 * 3D Curl noise in TSL. Generates a divergence-free vector field from simplex noise.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} p - Input coordinate vector.
 * @return {Node<vec3>} Curl noise vector.
 */
export const curlNoise = /*@__PURE__*/ Fn( ( [ p ] ) => {

	const e = float( .1 );
	const dx = vec3( e, 0.0, 0.0 );
	const dy = vec3( 0.0, e, 0.0 );
	const dz = vec3( 0.0, 0.0, e );
	const p_x0 = snoiseVec3( p.sub( dx ) );
	const p_x1 = snoiseVec3( p.add( dx ) );
	const p_y0 = snoiseVec3( p.sub( dy ) );
	const p_y1 = snoiseVec3( p.add( dy ) );
	const p_z0 = snoiseVec3( p.sub( dz ) );
	const p_z1 = snoiseVec3( p.add( dz ) );
	const x = p_y1.z.sub( p_y0.z ).sub( p_z1.y ).add( p_z0.y );
	const y = p_z1.x.sub( p_z0.x ).sub( p_x1.z ).add( p_x0.z );
	const z = p_x1.y.sub( p_x0.y ).sub( p_y1.x ).add( p_y0.x );
	const divisor = div( 1.0, mul( 2.0, e ) );

	return vec3( x, y, z ).mul( divisor );

}, { p: 'vec3', return: 'vec3' } );
