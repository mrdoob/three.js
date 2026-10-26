import { FloatType, NearestFilter, RTTNode, WebGPUCoordinateSystem } from 'three/webgpu';
import { Fn, If, float, getViewPosition, isBackgroundDepth, nodeObject, sample, textureSize, uniform, uv, vec2, vec3, vec4 } from 'three/tsl';

// cached on the depth texel grid and nearest sampled
class ReprojectedRadianceCacheNode extends RTTNode {

	constructor( source, depth ) {

		super( source.sample( uv() ), 1, 1, { type: FloatType, minFilter: NearestFilter, magFilter: NearestFilter, depthBuffer: false } );
		this.depthNode = depth;
		this.name = 'Reprojected Radiance Cache';

	}

	updateBefore( frame ) {

		if ( this.depthNode.isPassTextureNode ) frame.updateBeforeNode( this.depthNode.passNode );
		const { width, height } = this.depthNode.value.image;
		if ( this.renderTarget.width !== width || this.renderTarget.height !== height ) this.setSize( width, height );
		super.updateBefore( frame );

	}

}

/**
 * Reprojects radiance of static geometry from the previous frame. Each history
 * texel is validated before interpolation. Only camera motion is handled.
 *
 * @param {TextureNode} radiance - Previous resolved linear radiance.
 * @param {TextureNode} historyDepth - Previous device depth, nearest sampled.
 * @param {TextureNode} depth - Current device depth, nearest sampled.
 * @param {Node<vec3>} normal - Current unpacked view-space surface normal.
 * @param {Camera} camera - Current camera.
 * @param {Object} options - Previous camera and tolerance settings.
 * @param {Node<mat4>} options.previousView - Previous world-to-view matrix.
 * @param {Node<mat4>} options.previousProjection - Previous projection matrix.
 * @param {Node<mat4>} options.previousProjectionInverse - Previous inverse projection.
 * @param {Node<bool>} options.valid - Whether history exists.
 * @param {Node<float>} [options.tolerancePixels] - Surface uncertainty in previous pixels. Default 1.5.
 * @param {Node<float>} [options.toleranceWorld] - Minimum uncertainty in world units. Default 0.001.
 * @param {boolean} [options.analyticPixelFootprint] - Use diagonal projection scaling for standard perspective/orthographic cameras. Disable for custom projection matrices.
 * @param {boolean} [options.cache=false] - Evaluate once per depth texel per frame into a nearest-sampled float texture. Useful when many rays reuse the same source texels.
 * @return {Node<vec4>} Linear radiance and accepted history support.
 */
export const reprojectedRadiance = ( radiance, historyDepth, depth, normal, camera, {
	previousView, previousProjection, previousProjectionInverse, valid,
	tolerancePixels = uniform( 1.5 ), toleranceWorld = uniform( 0.001 ),
	analyticPixelFootprint = camera.isPerspectiveCamera === true || camera.isOrthographicCamera === true,
	cache = false
} ) => {

	const projectionInverse = uniform( camera.projectionMatrixInverse );
	const worldMatrix = uniform( camera.matrixWorld );
	const inBounds = coordinate => coordinate.x.greaterThanEqual( 0 ).and( coordinate.x.lessThanEqual( 1 ) )
		.and( coordinate.y.greaterThanEqual( 0 ) ).and( coordinate.y.lessThanEqual( 1 ) );

	const source = sample( coordinate => Fn( ( _, builder ) => {

		const currentResolution = vec2( textureSize( depth ) );
		const guideUV = coordinate.mul( currentResolution ).floor().add( 0.5 ).div( currentResolution ).toConst();
		const currentDepth = depth.sample( guideUV ).r;
		const position = getViewPosition( guideUV, currentDepth, projectionInverse );
		const oldPosition = previousView.mul( worldMatrix.mul( vec4( position, 1 ) ) ).xyz.toConst();
		const oldNormal = normal.sample( guideUV ).xyz.transformDirection( worldMatrix ).transformDirection( previousView ).toConst();
		const clip = previousProjection.mul( vec4( oldPosition, 1 ) ).toConst();
		const previousUV = clip.xy.div( clip.w.max( 1e-6 ) ).mul( vec2( 0.5, - 0.5 ) ).add( 0.5 ).toConst();
		const resolution = vec2( textureSize( historyDepth ) );
		let footprint;
		if ( analyticPixelFootprint ) {

			// clip.w scales a pixel displacement to view space
			const scaling = vec2( previousProjection.element( 0 ).x.abs(), previousProjection.element( 1 ).y.abs() ).mul( resolution ).max( vec2( 1e-6 ) );
			const pixelSize = vec2( clip.w.abs().mul( 2 ) ).div( scaling );
			footprint = pixelSize.x.max( pixelSize.y );

		} else {

			// custom projections
			let expectedDepth = clip.z.div( clip.w.max( 1e-6 ) );
			if ( builder.renderer.coordinateSystem !== WebGPUCoordinateSystem && builder.renderer.reversedDepthBuffer !== true ) expectedDepth = expectedDepth.mul( 0.5 ).add( 0.5 );
			const pixelX = getViewPosition( previousUV.add( vec2( 1, 0 ).div( resolution ) ), expectedDepth, previousProjectionInverse ).sub( oldPosition ).length();
			const pixelY = getViewPosition( previousUV.add( vec2( 0, 1 ).div( resolution ) ), expectedDepth, previousProjectionInverse ).sub( oldPosition ).length();
			footprint = pixelX.max( pixelY );

		}

		const tolerance = toleranceWorld.max( 0 ).add( tolerancePixels.max( 0 ).mul( footprint ) ).max( 1e-6 );
		const pixel = previousUV.mul( resolution ).sub( 0.5 );
		const base = pixel.floor();
		const fraction = pixel.fract();
		const color = vec3( 0 ).toVar();
		const support = float( 0 ).toVar();
		// depth is in [0,1] for all backends, including reversed depth
		const minimumDepth = builder.renderer.coordinateSystem === WebGPUCoordinateSystem || builder.renderer.reversedDepthBuffer === true ? 0 : - 1;
		const inDepthBounds = clip.z.greaterThanEqual( clip.w.mul( minimumDepth ) ).and( clip.z.lessThanEqual( clip.w ) );
		const historyValid = valid.and( clip.w.greaterThan( 0 ) ).and( inBounds( previousUV ) ).and( inDepthBounds ).and( isBackgroundDepth( currentDepth ).not() );

		for ( let y = 0; y <= 1; y ++ ) {

			for ( let x = 0; x <= 1; x ++ ) {

				const tapUV = base.add( vec2( x, y ) ).add( 0.5 ).div( resolution ).toConst();
				const oldDepth = historyDepth.sample( tapUV ).r;
				const tapPosition = getViewPosition( tapUV, oldDepth, previousProjectionInverse );
				const planeError = tapPosition.sub( oldPosition ).dot( oldNormal ).abs();
				const accepted = historyValid.and( inBounds( tapUV ) ).and( isBackgroundDepth( oldDepth ).not() ).and( planeError.lessThanEqual( tolerance ) );
				const wx = x === 0 ? fraction.x.oneMinus() : fraction.x;
				const wy = y === 0 ? fraction.y.oneMinus() : fraction.y;
				const weight = wx.mul( wy ).mul( accepted ).toConst();
				color.addAssign( radiance.sample( tapUV ).rgb.mul( weight ) );
				support.addAssign( weight );

			}

		}

		return vec4( color.div( support.max( 1e-6 ) ), support.clamp() );

	} )() );

	if ( cache === false ) return source;

	const cached = nodeObject( new ReprojectedRadianceCacheNode( source, depth ) );
	const result = sample( coordinate => Fn( () => {

		const value = vec4().toVar();
		// don't clamp to edge cache texels outside the raster grid
		const inside = coordinate.greaterThanEqual( vec2( 0 ) ).all().and( coordinate.lessThan( vec2( 1 ) ).all() );
		If( inside, () => {

			value.assign( cached.sample( coordinate ) );

		} ).Else( () => {

			value.assign( source.sample( coordinate ) );

		} );
		return value;

	} )() );
	result.addEventListener( 'dispose', () => cached.dispose() );
	return result;

};
