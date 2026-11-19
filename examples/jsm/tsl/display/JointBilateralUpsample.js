import { Fn, float, getViewPosition, sample, textureSize, uniform, vec2, vec4 } from 'three/tsl';

/**
 * Upsamples a reduced resolution effect with a joint bilateral filter: the bilinear
 * weights of the four nearest texels are scaled by how well their depth and normal
 * match the full resolution guides, so the result does not bleed across silhouettes.
 *
 * Reference: {@link https://johanneskopf.de/publications/jbu/}
 *
 * @tsl
 * @function
 * @param {Node<vec4>} inputNode - The low resolution texture to upsample.
 * @param {Node<float>} lowDepthNode - Depth of the input's texels, in the red channel.
 * @param {Node<vec3>} lowNormalNode - Normalized view-space normals at the input's resolution.
 * @param {Node<float>} depthNode - Full resolution depth, in the red channel.
 * @param {Node<vec3>} normalNode - Normalized full resolution view-space normals.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @param {Object} [options={}] - The filter options.
 * @param {Node<float>|number} [options.depthTolerance=0.005] - The distance to the surface plane, relative to the view depth, at which a texel is rejected.
 * @param {number} [options.normalPower=8] - How strongly a normal difference rejects a texel. Must be a power of two.
 * @param {Node<vec2>} [options.size] - The size of the input's texel grid. Defaults to the size of `lowDepthNode`, which must then be a texture.
 * @param {boolean} [options.coverage=false] - Whether the input's alpha is the coverage of its RGB, which is then averaged weighted by it.
 * @returns {SampleNode} The upsampled result, samplable at any coordinate.
 */
export const jointBilateralUpsample = ( inputNode, lowDepthNode, lowNormalNode, depthNode, normalNode, camera, options = {} ) => {

	const { depthTolerance = 0.005, normalPower = 8, coverage = false, size: gridSize = null } = options;

	const projectionInverse = uniform( camera.projectionMatrixInverse );

	return sample( coordinate => Fn( () => {

		const size = vec2( gridSize !== null ? gridSize : textureSize( lowDepthNode ) );
		const pixel = coordinate.mul( size ).sub( 0.5 );
		const base = pixel.floor();
		const fraction = pixel.fract();

		const viewPosition = ( uv, depth ) => getViewPosition( uv, depth, projectionInverse );

		// read the low resolution depths first, WGSL fails on a gather() that follows a plain read of the same texture
		const tapUVs = [[ 0, 0 ], [ 1, 0 ], [ 0, 1 ], [ 1, 1 ]].map( ( offset ) => base.add( vec2( ...offset ) ).add( 0.5 ).div( size ).toConst() );

		const gathered = gridSize === null ? lowDepthNode.gather().sample( base.add( 1 ).div( size ) ).toConst() : null;
		const tapDepths = gathered !== null ? [ gathered.w, gathered.z, gathered.x, gathered.y ] : tapUVs.map( ( tapUV ) => lowDepthNode.sample( tapUV ).r.toConst() );

		const position = viewPosition( coordinate, depthNode.sample( coordinate ).r ).toConst();
		const n = normalNode.sample( coordinate ).toConst();
		const tolerance = position.z.abs().mul( depthTolerance ).max( 0.001 );

		const sum = vec4( 0 ).toVar();
		const total = float( 0 ).toVar();

		for ( let y = 0; y <= 1; y ++ ) {

			for ( let x = 0; x <= 1; x ++ ) {

				const tapUV = tapUVs[ y * 2 + x ];

				// the distance to the surface plane stays small along slanted surfaces
				const planeDistance = viewPosition( tapUV, tapDepths[ y * 2 + x ] ).sub( position ).dot( n );
				const depthWeight = planeDistance.div( tolerance ).pow2().negate().exp();
				let normalWeight = lowNormalNode.sample( tapUV ).dot( n ).max( 0 );
				for ( let power = 1; power < normalPower; power *= 2 ) normalWeight = normalWeight.toConst().pow2();
				const wx = x === 0 ? fraction.x.oneMinus() : fraction.x;
				const wy = y === 0 ? fraction.y.oneMinus() : fraction.y;
				const weight = wx.mul( wy ).mul( depthWeight.mul( normalWeight ).add( 1e-4 ) ).toConst();
				const value = inputNode.sample( tapUV );
				sum.addAssign( ( coverage ? vec4( value.rgb.mul( value.a ), value.a ) : value ).mul( weight ) );
				total.addAssign( weight );

			}

		}

		return coverage ? vec4( sum.rgb.div( sum.a.max( 1e-6 ) ), sum.a.div( total ) ) : sum.div( total );

	} )() );

};
