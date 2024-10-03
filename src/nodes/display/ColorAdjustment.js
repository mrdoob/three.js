import { dot, max, mix } from '../math/MathNode.js';
import { add } from '../math/OperatorNode.js';
import { Fn, If, float, vec3, vec4 } from '../tsl/TSLBase.js';
import { ColorManagement } from '../../math/ColorManagement.js';
import { Vector3 } from '../../math/Vector3.js';
import { LinearSRGBColorSpace } from '../../constants.js';

export const grayscale = /*@__PURE__*/ Fn( ( [ color ] ) => {

	return luminance( color.rgb );

} );

export const saturation = /*@__PURE__*/ Fn( ( [ color, adjustment = float( 1 ) ] ) => {

	return adjustment.mix( luminance( color.rgb ), color.rgb );

} );

export const vibrance = /*@__PURE__*/ Fn( ( [ color, adjustment = float( 1 ) ] ) => {

	const average = add( color.r, color.g, color.b ).div( 3.0 );

	const mx = color.r.max( color.g.max( color.b ) );
	const amt = mx.sub( average ).mul( adjustment ).mul( - 3.0 );

	return mix( color.rgb, mx, amt );

} );

export const hue = /*@__PURE__*/ Fn( ( [ color, adjustment = float( 1 ) ] ) => {

	const k = vec3( 0.57735, 0.57735, 0.57735 );

	const cosAngle = adjustment.cos();

	return vec3( color.rgb.mul( cosAngle ).add( k.cross( color.rgb ).mul( adjustment.sin() ).add( k.mul( dot( k, color.rgb ).mul( cosAngle.oneMinus() ) ) ) ) );

} );

const _luminanceCoefficients = /*@__PURE__*/ new Vector3();
export const luminance = (
	color,
	luminanceCoefficients = vec3( ... ColorManagement.getLuminanceCoefficients( _luminanceCoefficients ) )
) => dot( color, luminanceCoefficients );

export const threshold = ( color, threshold ) => mix( vec3( 0.0 ), color, luminance( color ).sub( threshold ).max( 0 ) );

/**
 * Color Decision List (CDL) v1.2
 *
 * References:
 * - ASC CDL v1.2
 * - https://blender.stackexchange.com/a/55239/43930
 * - https://docs.acescentral.com/specifications/acescc/
 */
export const cdl = /*@__PURE__*/ Fn( ( [
	color,
	slope = vec3( 1 ),
	offset = vec3( 0 ),
	power = vec3( 1 ),
	saturation = vec3( 1 ),
	// ASC CDL v1.2 explicitly requires Rec. 709 luminance coefficients, without input conversion to Rec. 709.
	luminanceCoefficients = vec3( ColorManagement.getLuminanceCoefficients( new Vector3(), LinearSRGBColorSpace ) )
] ) => {

	// NOTE: The ASC CDL v1.2 defines a [0, 1] clamp on slope+offset output,
	// and another on saturation output. As discussed in the ACEScc specification
	// and Filament implementation, the limits may be omitted to support values >1
	// if negative inputs to the power expression are avoided. We use `max( in, 0.0 )`
	// on final output, but the lower limit may not be required in all cases.

	const luma = color.rgb.dot( vec3( luminanceCoefficients ) );

	const v = max( color.rgb.mul( slope ).add( offset ), 0.0 ).toVar( 'v' );
	const pv = v.pow( power ).toVar( 'pv' );

	If( v.r.greaterThan( 0.0 ), () => { v.r.assign( pv.r ); } ); // eslint-disable-line
	If( v.g.greaterThan( 0.0 ), () => { v.g.assign( pv.g ); } ); // eslint-disable-line
	If( v.b.greaterThan( 0.0 ), () => { v.b.assign( pv.b ); } ); // eslint-disable-line

	v.assign( max( luma.add( saturation.mul( v.sub( luma ) ) ), 0.0 ) );

	return vec4( v.rgb, color.a );

} );
