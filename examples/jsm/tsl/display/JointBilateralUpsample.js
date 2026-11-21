import { Fn, float, getViewPosition, sample, textureSize, uniform, vec2, vec4 } from 'three/tsl';

/**
 * Upsamples a reduced resolution effect with a joint bilateral filter: the bilinear
 * weights of the four nearest texels are scaled by how well their depth matches the
 * full resolution depth, so the result does not bleed across silhouettes.
 *
 * Reference: {@link https://johanneskopf.de/publications/jbu/}
 *
 * @tsl
 * @function
 * @param {Node<vec4>} inputNode - The low resolution effect to upsample.
 * @param {Node<float>} lowDepthNode - Depth of the input's texels, in the red channel.
 * @param {Node<float>} depthNode - Full resolution depth, in the red channel.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @param {Object} [options={}] - The filter options.
 * @param {Node<float>|number} [options.depthTolerance=0.005] - The view depth difference, relative to the view depth, at which a texel is rejected.
 * @param {Node<vec2>} [options.size] - The size of the input's texel grid. Defaults to the size of `inputNode`, which must then be a texture.
 * @returns {SampleNode} The upsampled result, samplable at any coordinate.
 */
export const jointBilateralUpsample = ( inputNode, lowDepthNode, depthNode, camera, options = {} ) => {

	const { depthTolerance = 0.005, size = vec2( textureSize( inputNode ) ) } = options;

	const projectionInverse = uniform( camera.projectionMatrixInverse );

	return sample( coordinate => Fn( () => {

		const pixel = coordinate.mul( size ).sub( 0.5 );
		const base = pixel.floor();
		const fraction = pixel.fract();

		const viewZ = ( uv, depth ) => getViewPosition( uv, depth, projectionInverse ).z;

		const tapUVs = [[ 0, 0 ], [ 1, 0 ], [ 0, 1 ], [ 1, 1 ]].map( ( offset ) => base.add( vec2( ...offset ) ).add( 0.5 ).div( size ).toConst() );

		const tapDepths = tapUVs.map( ( tapUV ) => lowDepthNode.sample( tapUV ).r.toConst() );

		const z = viewZ( coordinate, depthNode.sample( coordinate ).r ).toConst();
		const tolerance = z.abs().mul( depthTolerance ).max( 0.001 );

		const sum = vec4( 0 ).toVar();
		const total = float( 0 ).toVar();

		for ( let y = 0; y <= 1; y ++ ) {

			for ( let x = 0; x <= 1; x ++ ) {

				const tapUV = tapUVs[ y * 2 + x ];

				const depthWeight = viewZ( tapUV, tapDepths[ y * 2 + x ] ).sub( z ).div( tolerance ).pow2().negate().exp();
				const wx = x === 0 ? fraction.x.oneMinus() : fraction.x;
				const wy = y === 0 ? fraction.y.oneMinus() : fraction.y;
				const weight = wx.mul( wy ).mul( depthWeight.add( 1e-4 ) ).toConst();
				sum.addAssign( inputNode.sample( tapUV ).mul( weight ) );
				total.addAssign( weight );

			}

		}

		return sum.div( total );

	} )() );

};
