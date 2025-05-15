import { float, Fn, vec2, uv, sin, rand, degrees, cos, Loop, vec4, premult, unpremult } from 'three/tsl';

/**
 * Applies a hash blur effect to the given texture node.
 *
 * Reference: {@link https://www.shadertoy.com/view/4lXXWn}.
 *
 * @function
 * @param {Node<vec4>} textureNode - The texture node that should be blurred.
 * @param {Node<float>} [bluramount=float(0.1)] - This node determines the amount of blur.
 * @param {Object} [options={}] - Additional options for the hash blur effect.
 * @param {Node<float>} [options.repeats=float(45)] - The number of iterations for the blur effect.
 * @param {Node<vec4>} [options.mask=null] - A mask node to control the alpha blending of the blur.
 * @param {boolean} [options.premultipliedAlpha=false] - Whether to use premultiplied alpha for the blur effect.
 * @return {Node<vec4>} The blurred texture node.
 */
export const hashBlur = /*#__PURE__*/ Fn( ( [ textureNode, bluramount = float( 0.1 ), options = {} ] ) => {

	const {
		repeats = float( 45 ),
		mask = null,
		premultipliedAlpha = false
	} = options;

	const draw = ( uv ) => {

		let sample = textureNode.sample( uv );

		if ( mask !== null ) {

			const alpha = mask.sample( uv ).x;

			sample = vec4( sample.rgb, sample.a.mul( alpha ) );

		}

		return premultipliedAlpha ? premult( sample ) : sample;

	};

	const targetUV = textureNode.uvNode || uv();
	const blurred_image = vec4( 0. ).toVar();

	Loop( { start: 0., end: repeats, type: 'float' }, ( { i } ) => {

		const q = vec2( vec2( cos( degrees( i.div( repeats ).mul( 360. ) ) ), sin( degrees( i.div( repeats ).mul( 360. ) ) ) ).mul( rand( vec2( i, targetUV.x.add( targetUV.y ) ) ).add( bluramount ) ) );
		const uv2 = vec2( targetUV.add( q.mul( bluramount ) ) );
		blurred_image.addAssign( draw( uv2 ) );

	} );

	blurred_image.divAssign( repeats );

	return premultipliedAlpha ? unpremult( blurred_image ) : blurred_image;

} );
