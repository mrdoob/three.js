import { float, Fn, vec2, uv, sin, rand, degrees, cos, Loop, vec4 } from 'three/tsl';

/** @module HashBlur **/

/**
 * Applies a hash blur effect to the given texture node.
 *
 * Reference: {@link https://www.shadertoy.com/view/4lXXWn}.
 *
 * @function
 * @param {Node<vec4>} textureNode - The texture node that should be blurred.
 * @param {Node<float>} [bluramount=float(0.1)] - This node determines the amount of blur.
 * @param {Node<float>} [repeats=float(45)] - This node determines the quality of the blur. A higher value produces a less grainy result but is also more expensive.
 * @return {Node<vec4>} The blurred texture node.
 */
export const hashBlur = /*#__PURE__*/ Fn( ( [ textureNode, bluramount = float( 0.1 ), repeats = float( 45 ) ] ) => {

	const draw = ( uv ) => textureNode.sample( uv );

	const targetUV = textureNode.uvNode || uv();
	const blurred_image = vec4( 0. ).toVar();

	Loop( { start: 0., end: repeats, type: 'float' }, ( { i } ) => {

		const q = vec2( vec2( cos( degrees( i.div( repeats ).mul( 360. ) ) ), sin( degrees( i.div( repeats ).mul( 360. ) ) ) ).mul( rand( vec2( i, targetUV.x.add( targetUV.y ) ) ).add( bluramount ) ) );
		const uv2 = vec2( targetUV.add( q.mul( bluramount ) ) );
		blurred_image.addAssign( draw( uv2 ) );

	} );

	blurred_image.divAssign( repeats );

	return blurred_image;

} );
