// Three.js Transpiler
// https://github.com/AcademySoftwareFoundation/MaterialX/blob/main/libraries/stdlib/genglsl/lib/mx_hsv.glsl

import { int, float, vec3, If, Fn } from '../../tsl/TSLBase.js';
import { add } from '../../math/OperatorNode.js';
import { floor, trunc, max, min } from '../../math/MathNode.js';

export const mx_hsvtorgb = /*@__PURE__*/ Fn( ( [ hsv ] ) => {

	const s = hsv.y;
	const v = hsv.z;

	const result = vec3().toVar();

	If( s.lessThan( 0.0001 ), () => {

		result.assign( vec3( v, v, v ) );

	} ).Else( () => {

		let h = hsv.x;
		h = h.sub( floor( h ) ).mul( 6.0 ).toVar(); // TODO: check what .toVar() is needed in node system cache
		const hi = int( trunc( h ) );
		const f = h.sub( float( hi ) );
		const p = v.mul( s.oneMinus() );
		const q = v.mul( s.mul( f ).oneMinus() );
		const t = v.mul( s.mul( f.oneMinus() ).oneMinus() );

		If( hi.equal( int( 0 ) ), () => {

			result.assign( vec3( v, t, p ) );

		} ).ElseIf( hi.equal( int( 1 ) ), () => {

			result.assign( vec3( q, v, p ) );

		} ).ElseIf( hi.equal( int( 2 ) ), () => {

			result.assign( vec3( p, v, t ) );

		} ).ElseIf( hi.equal( int( 3 ) ), () => {

			result.assign( vec3( p, q, v ) );

		} ).ElseIf( hi.equal( int( 4 ) ), () => {

			result.assign( vec3( t, p, v ) );

		} ).Else( () => {

			result.assign( vec3( v, p, q ) );

		} );

	} );

	return result;

} ).setLayout( {
	name: 'mx_hsvtorgb',
	type: 'vec3',
	inputs: [
		{ name: 'hsv', type: 'vec3' }
	]
} );

export const mx_rgbtohsv = /*@__PURE__*/ Fn( ( [ c_immutable ] ) => {

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

	} ).Else( () => {

		s.assign( 0.0 );

	} );

	If( s.lessThanEqual( 0.0 ), () => {

		h.assign( 0.0 );

	} ).Else( () => {

		If( r.greaterThanEqual( maxcomp ), () => {

			h.assign( g.sub( b ).div( delta ) );

		} ).ElseIf( g.greaterThanEqual( maxcomp ), () => {

			h.assign( add( 2.0, b.sub( r ).div( delta ) ) );

		} ).Else( () => {

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
