import { Fn, If, float, getViewPosition, sample, textureSize, uniform, vec2, vec4 } from 'three/tsl';

/**
 * Upsamples a reduced resolution effect to full resolution with a joint bilateral
 * filter: the four nearest low resolution texels are bilinearly weighted and then
 * rejected by view depth and normal differences against the full resolution guides,
 * so the result does not bleed across silhouettes.
 *
 * Filters RGBA signals independently. With `coverage: true`, RGB is weighted by
 * alpha coverage. When no texel matches, plain bilinear interpolation is used.
 *
 * Reference: {@link https://johanneskopf.de/publications/jbu/}
 *
 * @tsl
 * @function
 * @param {TextureNode} inputNode - The low resolution texture to upsample (RGBA signal).
 * @param {TextureNode} lowDepthNode - Depth sampled at the input texel centers, in the red channel.
 * @param {Node<vec3>} lowNormalNode - Normalized view-space normals at the input's resolution.
 * @param {Node<float>} depthNode - Full resolution depth, in the red channel.
 * @param {Node<vec3>} normalNode - Normalized full resolution view-space normals.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @param {Object} [options] - Filter settings.
 * @param {boolean} [options.coverage=false] - Treat alpha as coverage when averaging RGB.
 * @param {number|Node<float>} [options.depthSigma=0.02] - Depth tolerance relative to view distance.
 * @param {number|Node<float>} [options.normalPower=8] - Normal similarity exponent.
 * @returns {SampleNode} The upsampled result, samplable at any coordinate.
 */
export const jointBilateralUpsample = ( inputNode, lowDepthNode, lowNormalNode, depthNode, normalNode, camera, { coverage = false, depthSigma = 0.02, normalPower = 8 } = {} ) => {

	const projectionInverse = uniform( camera.projectionMatrixInverse );

	return sample( coordinate => Fn( () => {

		const size = vec2( textureSize( inputNode ) );
		const pixel = coordinate.mul( size ).sub( 0.5 );
		const base = pixel.floor();
		const fraction = pixel.fract();
		const viewZ = depth => getViewPosition( coordinate, depth, projectionInverse ).z;
		const z = viewZ( depthNode.sample( coordinate ).r ).toConst();
		const n = normalNode.sample( coordinate ).normalize().toConst();
		const tolerance = z.abs().mul( depthSigma ).max( 0.001 );
		const sum = vec4( 0 ).toVar();
		const total = float( 0 ).toVar();

		for ( let y = 0; y <= 1; y ++ ) {

			for ( let x = 0; x <= 1; x ++ ) {

				const tapUV = base.add( vec2( x, y ) ).add( 0.5 ).div( size ).toConst();
				const depthWeight = viewZ( lowDepthNode.sample( tapUV ).r ).sub( z ).div( tolerance ).pow2().negate().exp();
				const normalWeight = lowNormalNode.sample( tapUV ).normalize().dot( n ).clamp().pow( normalPower );
				const wx = x === 0 ? fraction.x.oneMinus() : fraction.x;
				const wy = y === 0 ? fraction.y.oneMinus() : fraction.y;
				const weight = wx.mul( wy ).mul( depthWeight ).mul( normalWeight ).toConst();
				const value = inputNode.sample( tapUV );
				sum.addAssign( ( coverage ? vec4( value.rgb.mul( value.a ), value.a ) : value ).mul( weight ) );
				total.addAssign( weight );

			}

		}

		// no matching texel, use plain interpolation
		const result = inputNode.sample( coordinate ).toVar();
		If( total.greaterThan( 1e-4 ), () => {

			result.assign( coverage ? vec4( sum.rgb.div( sum.a.max( 1e-6 ) ), sum.a.div( total ) ) : sum.div( total ) );

		} );
		return result;

	} )() );

};
