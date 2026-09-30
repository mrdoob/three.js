import { float, Fn, vec2, vec4, uv, min, screenSize, convertToTexture } from 'three/tsl';

/**
 * Applies a lens dirt effect. The lens dirt texture is revealed wherever the
 * scene's luminance is bright. The input is typically a blurred luminance of
 * the scene, e.g. the result of a bloom pass. A wider blur reveals the dirt
 * over a larger area around bright spots.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} textureNode - The node that represents the scene's blurred luminance.
 * @param {TextureNode} dirtTextureNode - The lens dirt texture.
 * @param {Node<float>} [intensity=float(1)] - Defines the intensity of the lens dirt.
 * @return {Node<vec4>} The lens dirt.
 */
export const lensDirt = /*#__PURE__*/ Fn( ( [ textureNode, dirtTextureNode, intensity = float( 1 ) ] ) => {

	textureNode = convertToTexture( textureNode );

	const targetUV = textureNode.uvNode || uv();

	const dirtSize = vec2( dirtTextureNode.size( 0 ) ).toConst();
	const aspect = screenSize.x.div( screenSize.y ).div( dirtSize.x.div( dirtSize.y ) ).toConst();
	const dirtUV = targetUV.sub( 0.5 ).mul( vec2( min( aspect, 1 ), min( aspect.reciprocal(), 1 ) ) ).add( 0.5 ).toConst();

	const dirt = dirtTextureNode.sample( dirtUV ).rgb.mul( textureNode.sample( targetUV ).rgb ).mul( intensity );

	return vec4( dirt, 1 );

} );
