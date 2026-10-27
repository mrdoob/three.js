import { NearestFilter, NoColorSpace, TextureLoader } from 'three/webgpu';
import { Fn, frameId, ivec2, screenCoordinate, textureLoad, uint, vec4 } from 'three/tsl';

/**
 * Loads a FAST noise atlas with the sampling settings {@link fastNoise} requires.
 *
 * @param {string} url - The atlas URL.
 * @return {Promise<Texture>} The configured atlas.
 */
export const loadFASTNoise = async ( url ) => {

	const atlas = await new TextureLoader().loadAsync( url );
	atlas.flipY = false;
	atlas.colorSpace = NoColorSpace;
	atlas.generateMipmaps = false;
	atlas.minFilter = atlas.magFilter = NearestFilter;
	return atlas;

};

/**
 * Reads a 128×128×32 FAST blue noise volume packed as an RGB atlas. Load the
 * atlas with {@link loadFASTNoise}, or use `flipY = false` and `NoColorSpace`.
 *
 * @param {Texture} atlas - The 256×4096 noise atlas.
 * @param {Vector2} offset - Fixed integer offset in tracing pixels.
 * @param {Node<uint>} [index=frameId] - Temporal sample index.
 * @return {Node<vec4>} Four random values strictly inside (0,1).
 */
export const fastNoise = ( atlas, offset, index = frameId ) => Fn( () => {

	// shift the tile once per 32 frame cycle so long histories keep getting new samples
	const cycle = uint( index ).div( 32 ).mod( 128 ).toInt();
	const pixel = ivec2( screenCoordinate ).add( ivec2( offset.x, offset.y ) ).add( ivec2( 37, 71 ).mul( cycle ) ).mod( 128 );
	const coordinate = ivec2( pixel.x, pixel.y.add( uint( index ).mod( 32 ).mul( 128 ).toInt() ) );
	// bin centers avoid exact 0 and 1
	return vec4( textureLoad( atlas, coordinate ).rgb, textureLoad( atlas, coordinate.add( ivec2( 128, 0 ) ) ).r ).mul( 255 ).add( 0.5 ).div( 256 );

} )();
