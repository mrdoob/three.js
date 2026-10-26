import { Fn, frameId, ivec2, screenCoordinate, textureLoad, uint, vec4 } from 'three/tsl';

/**
 * Reads a 128×128×32 FAST volume packed as an opaque RGB atlas.
 * The texture must use flipY=false and NoColorSpace and contain unmodified discrete samples.
 * The left tile stores a uniform vector2 in RG and a scalar in B. The right
 * tile stores a spatially offset copy of the scalar mask for a fourth input.
 * Opaque RGB storage avoids losing sample precision to image alpha conversion.
 * Keep the frame slices in order: moving the tile every frame destroys the
 * temporal correlations. A fixed offset can decorrelate different passes.
 *
 * @param {Texture} atlas - The 256×4096 noise atlas.
 * @param {Vector2} offset - Fixed integer offset in tracing pixels.
 * @param {Node<uint>} [index=frameId] - Temporal sample index.
 * @return {Node<vec4>} Four random values strictly inside (0,1).
 */
export const fastNoise = ( atlas, offset, index = frameId ) => Fn( () => {

	// The volume repeats every 32 frames, capping long histories at 32 samples. Shifting the
	// tile once per cycle keeps the in-cycle correlations and gives each pixel new samples.
	const cycle = uint( index ).div( 32 ).mod( 128 ).toInt();
	const pixel = ivec2( screenCoordinate ).add( ivec2( offset.x, offset.y ) ).add( ivec2( 37, 71 ).mul( cycle ) ).mod( 128 );
	const coordinate = ivec2( pixel.x, pixel.y.add( uint( index ).mod( 32 ).mul( 128 ).toInt() ) );
	// Decode byte bin centers, avoiding exact 0/1 at GGX singularities.
	return vec4( textureLoad( atlas, coordinate ).rgb, textureLoad( atlas, coordinate.add( ivec2( 128, 0 ) ) ).r ).mul( 255 ).add( 0.5 ).div( 256 );

} )();
