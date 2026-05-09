import { interleavedGradientNoise, Fn, vec2, vec4, mix, uv, Loop, premultiplyAlpha, unpremultiplyAlpha, int, float, nodeObject, convertToTexture, screenCoordinate } from 'three/tsl';

/**
 * This TSL function blurs an image in a circular pattern, radiating from a configurable center point in screen space.
 *
 * Radial blurs can be used for different kind of effects like producing simple faked lighting effects also known as
 * "light shafts". The major limitation of this specific usage is the center point can only be defined in 2D so the
 * effect does not honor the depth of 3D objects. Consequently, it is not intended for physically correct lit scenes.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} textureNode - The texture node that should be blurred.
 * @param {Object} [options={}] - Additional options for the radial blur effect.
 * @param {Node<vec2>} [options.center=vec2(0.5, 0.5)] - The center of the light in screen uvs.
 * @param {Node<int>} [options.weight=float(0.9)] - Base weight factor for each sample in the range `[0,1]`.
 * @param {Node<int>} [options.decay=float(0.95)] - Decreases the weight factor so each iteration adds less to the sum. Must be in the range `[0,1]`.
 * If you increase the sample count, you have to increase this option as well to avoid a darking effect.
 * @param {Node<int>} [options.count=int(32)] - The number if iterations. Should be in the range `[16,64]`.
 * @param {Node<int>} [options.exposure=float(5)] - Exposure control of the blur.
 * @return {Node<vec4>} The blurred texture node.
 */
export const radialBlur = /*#__PURE__*/ Fn( ( [ textureNode, options = {} ] ) => {

	textureNode = convertToTexture( textureNode );

	const center = nodeObject( options.center ) || vec2( 0.5, 0.5 );
	const weight = nodeObject( options.weight ) || float( 0.9 );
	const decay = nodeObject( options.decay ) || float( 0.95 );
	const count = nodeObject( options.count ) || int( 32 );
	const exposure = nodeObject( options.exposure ) || float( 5 );
	const premultipliedAlpha = options.premultipliedAlpha || false;

	const tap = ( uv ) => {

		const sample = textureNode.sample( uv );

		return premultipliedAlpha ? premultiplyAlpha( sample ) : sample;

	};

	const sampleUv = vec2( textureNode.uvNode || uv() );

	const base = tap( sampleUv ).toConst();
	const blur = vec4().toVar();
	const offset = center.sub( sampleUv ).div( count ).toConst();
	const w = float( weight ).toVar();

	const noise = interleavedGradientNoise( screenCoordinate );
	sampleUv.addAssign( offset.mul( noise ) ); // mitigate banding

	Loop( { start: int( 0 ), end: int( count ), type: 'int', condition: '<' }, () => {

		sampleUv.addAssign( offset );
		const sample = tap( sampleUv );

		blur.addAssign( sample.mul( w ) );
		w.mulAssign( decay );

	} );

	blur.divAssign( count );
	blur.mulAssign( exposure );

	const color = mix( blur, base.mul( 2 ), 0.5 );

	return premultipliedAlpha ? unpremultiplyAlpha( color ) : color;

} );
