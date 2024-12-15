import { float, Fn, vec3, vec4, min, max, mix, luminance } from 'three/tsl';

/** @module BleachBypass **/

/**
 * Applies a bleach bypass effect to the given color node.
 *
 * @function
 * @param {Node<vec4>} color - The color node to apply the sepia for.
 * @param {Node<float>} [opacity=1] - Influences how strong the effect is blended with the original color.
 * @return {Node<vec4>} The updated color node.
 */
export const bleach = /*@__PURE__*/ Fn( ( [ color, opacity = 1 ] ) => {

	const base = color;
	const lum = luminance( base.rgb );
	const blend = vec3( lum );

	const L = min( 1.0, max( 0.0, float( 10.0 ).mul( lum.sub( 0.45 ) ) ) );

	const result1 = blend.mul( base.rgb ).mul( 2.0 );
	const result2 = float( 2.0 ).mul( blend.oneMinus() ).mul( base.rgb.oneMinus() ).oneMinus();

	const newColor = mix( result1, result2, L );

	const A2 = base.a.mul( opacity );

	const mixRGB = A2.mul( newColor.rgb );

	mixRGB.addAssign( base.rgb.mul( A2.oneMinus() ) );

	return vec4( mixRGB, base.a );

} );
