// Three.js Transpiler
// https://github.com/AcademySoftwareFoundation/MaterialX/blob/main/libraries/stdlib/genglsl/lib/mx_hsv.glsl

import { int, float, vec3, If, tslFn } from '../../shadernode/ShaderNode.js';
import { add, sub, mul } from '../../math/OperatorNode.js';
import { floor, trunc, max, min } from '../../math/MathNode.js';

export const mx_hsvtorgb = /*#__PURE__*/ tslFn( ( [ hsv_immutable ] ) => {

	const hsv = vec3( hsv_immutable ).toVar();
	const h = float( hsv.x ).toVar();
	const s = float( hsv.y ).toVar();
	const v = float( hsv.z ).toVar();

	If( s.lessThan( 0.0001 ), () => {

		return vec3( v, v, v );

	} ).else( () => {

		h.assign( mul( 6.0, h.sub( floor( h ) ) ) );
		const hi = int( trunc( h ) ).toVar();
		const f = float( h.sub( float( hi ) ) ).toVar();
		const p = float( v.mul( sub( 1.0, s ) ) ).toVar();
		const q = float( v.mul( sub( 1.0, s.mul( f ) ) ) ).toVar();
		const t = float( v.mul( sub( 1.0, s.mul( sub( 1.0, f ) ) ) ) ).toVar();

		If( hi.equal( int( 0 ) ), () => {

			return vec3( v, t, p );

		} ).elseif( hi.equal( int( 1 ) ), () => {

			return vec3( q, v, p );

		} ).elseif( hi.equal( int( 2 ) ), () => {

			return vec3( p, v, t );

		} ).elseif( hi.equal( int( 3 ) ), () => {

			return vec3( p, q, v );

		} ).elseif( hi.equal( int( 4 ) ), () => {

			return vec3( t, p, v );

		} );

		return vec3( v, p, q );

	} );

} ).setLayout( {
	name: 'mx_hsvtorgb',
	type: 'vec3',
	inputs: [
		{ name: 'hsv', type: 'vec3' }
	]
} );

export const mx_rgbtohsv = /*#__PURE__*/ tslFn( ( [ c_immutable ] ) => {

	const c = vec3( c_immutable ).toVar();
	const r = float( c.x ).toVar();
	const g = float( c.y ).toVar();
	const b = float( c.z ).toVar();
	const mincomp = float( min( r, min( g, b ) ) ).toVar();
	const maxcomp = float( max( r, max( g, b ) ) ).toVar();
	const delta = float( maxcomp.sub( mincomp ) ).toVar();
	const h = float().toVar(), s = float().toVar(), v = float().toVar();
	v.assign( maxcomp );

	If( maxcomp.greaterThan( 0.0 ), () => {

		s.assign( delta.div( maxcomp ) );

	} ).else( () => {

		s.assign( 0.0 );

	} );

	If( s.lessThanEqual( 0.0 ), () => {

		h.assign( 0.0 );

	} ).else( () => {

		If( r.greaterThanEqual( maxcomp ), () => {

			h.assign( g.sub( b ).div( delta ) );

		} ).elseif( g.greaterThanEqual( maxcomp ), () => {

			h.assign( add( 2.0, b.sub( r ).div( delta ) ) );

		} ).else( () => {

			h.assign( add( 4.0, r.sub( g ).div( delta ) ) );

		} );

		h.mulAssign( 1.0 / 6.0 );

		If( h.lessThan( 0.0 ), () => {

			h.addAssign( 1.0 );

		} );

	} );

	return vec3( h, s, v );

} ).setLayout( {
	name: 'mx_rgbtohsv',
	type: 'vec3',
	inputs: [
		{ name: 'c', type: 'vec3' }
	]
} );
