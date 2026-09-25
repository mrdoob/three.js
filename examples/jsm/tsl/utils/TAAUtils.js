import { add, float, Fn, If, luminance, max, struct, vec2, vec4, getViewPosition, logarithmicDepthToViewZ, viewZToOrthographicDepth, viewZToPerspectiveDepth } from 'three/tsl';

/**
 * Optimized version of AABB clipping.
 *
 * Reference: {@link https://github.com/playdeadgames/temporal}
 *
 * @tsl
 * @private
 * @function
 * @param {Node<vec4>} currentColor - The current color.
 * @param {Node<vec4>} historyColor - The history color.
 * @param {Node<vec4>} minColor - The minimum color of the AABB.
 * @param {Node<vec4>} maxColor - The maximum color of the AABB.
 * @return {Node<vec4>} The clipped history color.
 */
export const clipAABB = Fn( ( [ currentColor, historyColor, minColor, maxColor ] ) => {

	const pClip = maxColor.rgb.add( minColor.rgb ).mul( 0.5 ).toConst();
	const eClip = maxColor.rgb.sub( minColor.rgb ).mul( 0.5 ).add( 1e-7 ).toConst();
	const vClip = historyColor.sub( vec4( pClip, currentColor.a ) ).toConst();
	const vUnit = vClip.xyz.div( eClip ).toConst();
	const absUnit = vUnit.abs().toConst();
	const maxUnit = max( absUnit.x, absUnit.y, absUnit.z ).toConst();
	return maxUnit.greaterThan( 1 ).select(
		vec4( pClip, currentColor.a ).add( vClip.div( maxUnit ) ),
		historyColor
	);

} ).setLayout( {
	name: 'clipAABB',
	type: 'vec4',
	inputs: [
		{ name: 'currentColor', type: 'vec4' },
		{ name: 'historyColor', type: 'vec4' },
		{ name: 'minColor', type: 'vec4' },
		{ name: 'maxColor', type: 'vec4' }
	]
} );

/**
 * Blends the current and history color with a flicker reduction based on luminance weighing.
 *
 * @tsl
 * @private
 * @function
 * @param {Node<vec4>} currentColor - The current color.
 * @param {Node<vec4>} historyColor - The history color.
 * @param {Node<float>} currentWeight - The weight of the current color.
 * @return {Node<vec4>} The blended color.
 */
export const flickerReduction = Fn( ( [ currentColor, historyColor, currentWeight ] ) => {

	const compressedCurrent = currentColor.mul( float( 1 ).div( ( max( currentColor.r, currentColor.g, currentColor.b ).add( 1 ) ) ) ).toConst();
	const compressedHistory = historyColor.mul( float( 1 ).div( ( max( historyColor.r, historyColor.g, historyColor.b ).add( 1 ) ) ) ).toConst();

	const luminanceCurrent = luminance( compressedCurrent.rgb ).toConst();
	const luminanceHistory = luminance( compressedHistory.rgb ).toConst();

	const weightCurrent = currentWeight.div( luminanceCurrent.add( 1 ) ).toConst();
	const weightHistory = currentWeight.oneMinus().div( luminanceHistory.add( 1 ) ).toConst();

	return add( currentColor.mul( weightCurrent ), historyColor.mul( weightHistory ) ).div( max( weightCurrent.add( weightHistory ), 0.00001 ) );

} ).setLayout( {
	name: 'flickerReduction',
	type: 'vec4',
	inputs: [
		{ name: 'currentColor', type: 'vec4' },
		{ name: 'historyColor', type: 'vec4' },
		{ name: 'currentWeight', type: 'float' }
	]
} );

/**
 * Samples the 3×3 neighborhood of the given texel position in the depth buffer and returns
 * the closest depth, its texel position and the farthest depth. Reversed and logarithmic depth
 * values are converted to perspective depth.
 *
 * @tsl
 * @private
 * @function
 * @param {TextureNode} depthNode - The depth buffer.
 * @param {Node<vec2>} positionTexel - The texel position.
 * @param {Node<vec2>} cameraNearFar - The camera's near and far.
 * @return {Node<struct>} A struct with the members `closestDepth`, `closestPositionTexel` and `farthestDepth`.
 */
export const sampleCurrentDepth = Fn( ( [ depthNode, positionTexel, cameraNearFar ], builder ) => {

	const closestDepth = float( 2 ).toVar();
	const closestPositionTexel = vec2( 0 ).toVar();
	const farthestDepth = float( - 1 ).toVar();

	for ( let x = - 1; x <= 1; ++ x ) {

		for ( let y = - 1; y <= 1; ++ y ) {

			const neighbor = positionTexel.add( vec2( x, y ) ).toVar();
			let depth = depthNode.load( neighbor ).r;
			if ( builder.renderer.reversedDepthBuffer ) depth = depth.oneMinus();
			if ( builder.renderer.logarithmicDepthBuffer ) depth = logarithmicToPerspectiveDepth( depth, cameraNearFar );
			depth = depth.toVar();

			If( depth.lessThan( closestDepth ), () => {

				closestDepth.assign( depth );
				closestPositionTexel.assign( neighbor );

			} );

			If( depth.greaterThan( farthestDepth ), () => {

				farthestDepth.assign( depth );

			} );

		}

	}

	return currentDepthStruct( closestDepth, closestPositionTexel, farthestDepth );

} );

/**
 * Samples the previous depth buffer and reprojects the depth into the current view.
 *
 * @tsl
 * @private
 * @function
 * @param {TextureNode} previousDepthNode - The previous depth buffer.
 * @param {Node<vec2>} uv - The uv coordinates.
 * @param {Node<mat4>} previousCameraProjectionMatrixInverse - The previous camera projection matrix inverse.
 * @param {Node<mat4>} previousCameraWorldMatrix - The previous camera world matrix.
 * @param {Node<mat4>} cameraWorldMatrixInverse - The current camera world matrix inverse.
 * @param {Node<vec2>} cameraNearFar - The camera's near and far.
 * @param {Camera} camera - The camera.
 * @return {Node<float>} The reprojected depth.
 */
export const samplePreviousDepth = Fn( ( [ previousDepthNode, uv, previousCameraProjectionMatrixInverse, previousCameraWorldMatrix, cameraWorldMatrixInverse, cameraNearFar, camera ], builder ) => {

	let depth = previousDepthNode.sample( uv ).r;
	if ( builder.renderer.logarithmicDepthBuffer ) depth = logarithmicToPerspectiveDepth( depth, cameraNearFar );
	const positionView = getViewPosition( uv, depth, previousCameraProjectionMatrixInverse );
	const positionWorld = previousCameraWorldMatrix.mul( vec4( positionView, 1 ) ).xyz;
	const viewZ = cameraWorldMatrixInverse.mul( vec4( positionWorld, 1 ) ).z;
	return camera.isOrthographicCamera
		? viewZToOrthographicDepth( viewZ, cameraNearFar.x, cameraNearFar.y )
		: viewZToPerspectiveDepth( viewZ, cameraNearFar.x, cameraNearFar.y );

} );

/**
 * Computes a sequence of Halton(2, 3) jitter offsets in the range [0, 1].
 *
 * @private
 * @function
 * @param {number} length - The number of offsets.
 * @return {Array<Array<number>>} The jitter offsets.
 */
export function computeHaltonOffsets( length ) {

	return Array.from( { length }, ( _, index ) => [ halton( index + 1, 2 ), halton( index + 1, 3 ) ] );

}

const currentDepthStruct = struct( {
	closestDepth: 'float',
	closestPositionTexel: 'vec2',
	farthestDepth: 'float'
} );

const logarithmicToPerspectiveDepth = ( depth, cameraNearFar ) => {

	const { x: near, y: far } = cameraNearFar;
	const viewZ = logarithmicDepthToViewZ( depth, near, far );
	return viewZToPerspectiveDepth( viewZ, near, far );

};

function halton( index, base ) {

	let fraction = 1;
	let result = 0;
	while ( index > 0 ) {

		fraction /= base;
		result += fraction * ( index % base );
		index = Math.floor( index / base );

	}

	return result;

}
