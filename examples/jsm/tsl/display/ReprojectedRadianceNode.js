import { Matrix4, Node, Vector2, WebGPUCoordinateSystem } from 'three/webgpu';
import { Fn, OnAfterRenderPipeline, float, getViewPosition, isBackgroundDepth, sample, textureSize, uniform, vec2, vec3, vec4 } from 'three/tsl';

/**
 * Reprojects the previous frame's lighting of static geometry into the current
 * frame. The beauty pass keeps its previous color and depth by swapping textures,
 * and after every render pipeline frame the node captures the camera matrices
 * they were rendered with. Each history texel is validated before interpolation. Only
 * camera motion is handled.
 *
 * Like {@link TRAANode}, the history is captured from a render pipeline callback,
 * so the node must be built in the pipeline's output graph. Sample it with
 * {@link ReprojectedRadianceNode#sample}.
 *
 * @augments Node
 * @three_import import { reprojectedRadiance } from 'three/addons/tsl/display/ReprojectedRadianceNode.js';
 */
class ReprojectedRadianceNode extends Node {

	static get type() {

		return 'ReprojectedRadianceNode';

	}

	/**
	 * @param {PassNode} beautyNode - The pass whose resolved linear radiance and depth become the history.
	 * @param {TextureNode} depth - Current device depth, nearest sampled.
	 * @param {Node<vec3>} normal - Current unpacked view-space surface normal.
	 * @param {Camera} camera - Current camera.
	 * @param {Object} [options] - Tolerance settings.
	 * @param {Node<float>} [options.tolerancePixels] - Surface uncertainty in previous pixels. Default 1.5.
	 * @param {Node<float>} [options.toleranceWorld] - Minimum uncertainty in world units. Default 0.001.
	 * @param {boolean} [options.analyticPixelFootprint] - Use diagonal projection scaling for standard perspective/orthographic cameras. Disable for custom projection matrices.
	 */
	constructor( beautyNode, depth, normal, camera, {
		tolerancePixels = uniform( 1.5 ), toleranceWorld = uniform( 0.001 ),
		analyticPixelFootprint = camera.isPerspectiveCamera === true || camera.isOrthographicCamera === true
	} = {} ) {

		super( 'vec4' );

		this.beautyNode = beautyNode;
		this.camera = camera;

		this._previousView = uniform( new Matrix4() );
		this._previousProjection = uniform( new Matrix4() );
		this._previousProjectionInverse = uniform( new Matrix4() );
		this._valid = uniform( false );
		// history resized textures hold no data until the pass renders into them
		this._capturedSize = uniform( new Vector2() );

		// the pass swaps current and previous textures before rendering, so no copy is needed
		const radiance = beautyNode.getPreviousTextureNode( 'output' );
		const historyDepth = beautyNode.getPreviousTextureNode( 'depth' );
		const previousView = this._previousView;
		const previousProjection = this._previousProjection;
		const previousProjectionInverse = this._previousProjectionInverse;

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
			const historyValid = this._valid.and( resolution.equal( this._capturedSize ).all() ).and( clip.w.greaterThan( 0 ) ).and( inBounds( previousUV ) ).and( inDepthBounds ).and( isBackgroundDepth( currentDepth ).not() );

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

		this._source = source;

	}

	/**
	 * Samples the reprojected history.
	 *
	 * @param {Node<vec2>} coordinate - Screen coordinate.
	 * @return {Node<vec4>} Linear radiance and accepted history support.
	 */
	sample( coordinate ) {

		return this._source.sample( coordinate );

	}

	/**
	 * Invalidates the history, e.g. after a camera cut or a scene change.
	 */
	reset() {

		this._valid.value = false;

	}

	setup() {

		// Capture the projection before TRAA clears its jitter.

		OnAfterRenderPipeline( () => this._capture() );

		return this.beautyNode;

	}

	_capture() {

		const { width, height } = this.beautyNode.getTexture( 'depth' ).image;
		this._capturedSize.value.set( width, height );
		this._previousView.value.copy( this.camera.matrixWorldInverse );
		this._previousProjection.value.copy( this.camera.projectionMatrix );
		this._previousProjectionInverse.value.copy( this.camera.projectionMatrixInverse );
		this._valid.value = true;

	}

}

export default ReprojectedRadianceNode;

/**
 * TSL function for creating a {@link ReprojectedRadianceNode}.
 *
 * @tsl
 * @function
 * @param {PassNode} beautyNode - The pass whose resolved linear radiance and depth become the history.
 * @param {TextureNode} depth - Current device depth, nearest sampled.
 * @param {Node<vec3>} normal - Current unpacked view-space surface normal.
 * @param {Camera} camera - Current camera.
 * @param {Object} [options] - See {@link ReprojectedRadianceNode}.
 * @return {ReprojectedRadianceNode}
 */
export const reprojectedRadiance = ( beautyNode, depth, normal, camera, options ) => new ReprojectedRadianceNode( beautyNode, depth, normal, camera, options );
