import { TextureLoader } from 'three';
import { Fn, int, ivec2, textureLoad } from 'three/tsl';

/** @module Bayer */

let bayer16Texture = null;

/**
 * This TSL function can be used to sample a Bayer16 texture which is a 16x16 texture with a Bayer Matrix pattern.
 * It can be used for dithering effects but also as an alternative to blue-noise. When used with Ray Marching
 * specifically in {@link VolumeNodeMaterial#offsetNode}, it reduces banding problem, thus being able to use
 * fewer steps without affecting the visuals as much.
 *
 * @tsl
 * @function
 * @param {Node<vec2>} uv - The uv to sample the bayer16 texture.
 * @return {Node<vec4>} The sampled bayer value.
 */
export const bayer16 = Fn( ( [ uv ] ) => {

	if ( bayer16Texture === null ) {

		const bayer16Base64 = 'data:image/png;base64,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';

		bayer16Texture = new TextureLoader().load( bayer16Base64 );

	}

	return textureLoad( bayer16Texture, ivec2( uv ).mod( int( 16 ) ) );

} );
