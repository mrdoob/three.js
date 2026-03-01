import { Fn, vec3 } from '../tsl/TSLCore.js';
import { atan, cbrt, cos, fract, sin, sqrt } from '../math/MathNode.js';

const TWO_PI = 2 * Math.PI;

/**
 * Converts a linear sRGB color to OKLab color space.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} color - The linear sRGB color.
 * @return {Node<vec3>} The OKLab color (L, a, b).
 */
export const linearSRGBToOKLab = /*@__PURE__*/ Fn( ( [ color ] ) => {

	const r = color.x, g = color.y, b = color.z;

	// Linear sRGB → LMS
	const l = r.mul( 0.4122214708 ).add( g.mul( 0.5363325363 ) ).add( b.mul( 0.0514459929 ) );
	const m = r.mul( 0.2119034982 ).add( g.mul( 0.6806995451 ) ).add( b.mul( 0.1073969566 ) );
	const s = r.mul( 0.0883024619 ).add( g.mul( 0.2817188376 ) ).add( b.mul( 0.6299787005 ) );

	// LMS → OKLab (cube root, then M2)
	const l_ = cbrt( l );
	const m_ = cbrt( m );
	const s_ = cbrt( s );

	const L = l_.mul( 0.2104542553 ).add( m_.mul( 0.7936177850 ) ).sub( s_.mul( 0.0040720468 ) );
	const a = l_.mul( 1.9779984951 ).sub( m_.mul( 2.4285922050 ) ).add( s_.mul( 0.4505937099 ) );
	const bLab = l_.mul( 0.0259040371 ).add( m_.mul( 0.7827717662 ) ).sub( s_.mul( 0.8086757660 ) );

	return vec3( L, a, bLab );

} ).setLayout( {
	name: 'linearSRGBToOKLab',
	type: 'vec3',
	inputs: [
		{ name: 'color', type: 'vec3' }
	]
} );

/**
 * Converts an OKLab color to linear sRGB color space.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} lab - The OKLab color (L, a, b).
 * @return {Node<vec3>} The linear sRGB color.
 */
export const okLabToLinearSRGB = /*@__PURE__*/ Fn( ( [ lab ] ) => {

	const L = lab.x, a = lab.y, b = lab.z;

	// OKLab → LMS (inverse M2)
	const l_ = L.add( a.mul( 0.3963377774 ) ).add( b.mul( 0.2158037573 ) );
	const m_ = L.sub( a.mul( 0.1055613458 ) ).sub( b.mul( 0.0638541728 ) );
	const s_ = L.sub( a.mul( 0.0894841775 ) ).sub( b.mul( 1.2914855480 ) );

	// cube
	const l = l_.mul( l_ ).mul( l_ );
	const m = m_.mul( m_ ).mul( m_ );
	const s = s_.mul( s_ ).mul( s_ );

	// LMS → Linear sRGB (inverse M1)
	const r = l.mul( 4.0767416621 ).sub( m.mul( 3.3077115913 ) ).add( s.mul( 0.2309699292 ) );
	const g = l.mul( - 1.2684380046 ).add( m.mul( 2.6097574011 ) ).sub( s.mul( 0.3413193965 ) );
	const bOut = l.mul( - 0.0041960863 ).sub( m.mul( 0.7034186147 ) ).add( s.mul( 1.7076147010 ) );

	return vec3( r, g, bOut );

} ).setLayout( {
	name: 'okLabToLinearSRGB',
	type: 'vec3',
	inputs: [
		{ name: 'lab', type: 'vec3' }
	]
} );

/**
 * Converts a linear sRGB color to OKLCH color space.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} color - The linear sRGB color.
 * @return {Node<vec3>} The OKLCH color (L, C, H) where H is normalized 0-1.
 */
export const linearSRGBToOKLCH = /*@__PURE__*/ Fn( ( [ color ] ) => {

	const lab = linearSRGBToOKLab( color );
	const L = lab.x, a = lab.y, b = lab.z;

	const C = sqrt( a.mul( a ).add( b.mul( b ) ) );
	const H = fract( atan( b, a ).div( TWO_PI ) );

	return vec3( L, C, H );

} ).setLayout( {
	name: 'linearSRGBToOKLCH',
	type: 'vec3',
	inputs: [
		{ name: 'color', type: 'vec3' }
	]
} );

/**
 * Converts an OKLCH color to linear sRGB color space.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} lch - The OKLCH color (L, C, H) where H is normalized 0-1.
 * @return {Node<vec3>} The linear sRGB color.
 */
export const oklchToLinearSRGB = /*@__PURE__*/ Fn( ( [ lch ] ) => {

	const L = lch.x, C = lch.y, H = lch.z;

	const hRad = H.mul( TWO_PI );
	const a = C.mul( cos( hRad ) );
	const b = C.mul( sin( hRad ) );

	return okLabToLinearSRGB( vec3( L, a, b ) );

} ).setLayout( {
	name: 'oklchToLinearSRGB',
	type: 'vec3',
	inputs: [
		{ name: 'lch', type: 'vec3' }
	]
} );
