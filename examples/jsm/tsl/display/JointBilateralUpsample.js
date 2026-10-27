import { Fn, If, float, getViewPosition, sample, textureSize, uniform, vec2, vec4 } from 'three/tsl';

/**
 * Upsamples a reduced resolution effect to full resolution with a joint bilateral
 * filter: the four nearest low resolution texels are bilinearly weighted and then
 * rejected by view depth and normal differences against the full resolution guides,
 * so the result does not bleed across silhouettes.
 *
 * The input is expected to store a signal in RGB and its coverage in alpha. RGB is
 * averaged weighted by coverage, alpha by the filter weights alone. When no texel
 * matches, plain bilinear interpolation is used.
 *
 * Reference: {@link https://johanneskopf.de/publications/jbu/}
 *
 * @tsl
 * @function
 * @param {Node<vec4>} inputNode - The low resolution texture to upsample (RGB signal, alpha coverage).
 * @param {TextureNode} lowDepthNode - Depth at the input's resolution, in the red channel. Its size defines the texel grid.
 * @param {Node<vec3>} lowNormalNode - Normalized view-space normals at the input's resolution.
 * @param {Node<float>} depthNode - Full resolution depth, in the red channel.
 * @param {Node<vec3>} normalNode - Normalized full resolution view-space normals.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @returns {SampleNode} The upsampled result, samplable at any coordinate.
 */
export const jointBilateralUpsample = ( inputNode, lowDepthNode, lowNormalNode, depthNode, normalNode, camera ) => {

	const projectionInverse = uniform( camera.projectionMatrixInverse );

	return sample( coordinate => Fn( () => {

		const size = vec2( textureSize( lowDepthNode ) );
		const pixel = coordinate.mul( size ).sub( 0.5 );
		const base = pixel.floor();
		const fraction = pixel.fract();
		const viewZ = depth => getViewPosition( coordinate, depth, projectionInverse ).z;
		const z = viewZ( depthNode.sample( coordinate ).r ).toConst();
		const n = normalNode.sample( coordinate ).toConst();
		const tolerance = z.abs().mul( 0.02 ).max( 0.001 );
		const sum = vec4( 0 ).toVar();
		const total = float( 0 ).toVar();

		for ( let y = 0; y <= 1; y ++ ) {

			for ( let x = 0; x <= 1; x ++ ) {

				const tapUV = base.add( vec2( x, y ) ).add( 0.5 ).div( size ).toConst();
				const depthWeight = viewZ( lowDepthNode.sample( tapUV ).r ).sub( z ).div( tolerance ).pow2().negate().exp();
				const normalWeight = lowNormalNode.sample( tapUV ).dot( n ).max( 0 ).pow( 8 );
				const wx = x === 0 ? fraction.x.oneMinus() : fraction.x;
				const wy = y === 0 ? fraction.y.oneMinus() : fraction.y;
				const weight = wx.mul( wy ).mul( depthWeight ).mul( normalWeight ).toConst();
				const value = inputNode.sample( tapUV );
				sum.addAssign( vec4( value.rgb.mul( value.a ), value.a ).mul( weight ) );
				total.addAssign( weight );

			}

		}

		// no matching texel, use plain interpolation
		const result = inputNode.sample( coordinate ).toVar();
		If( total.greaterThan( 1e-4 ), () => {

			result.assign( vec4( sum.rgb.div( sum.a.max( 1e-6 ) ), sum.a.div( total ) ) );

		} );
		return result;

	} )() );

};
