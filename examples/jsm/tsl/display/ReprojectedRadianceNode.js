import { DepthTexture, FloatType, HalfFloatType, Matrix4, NearestFilter, Node, RenderTarget, RTTNode, WebGPUCoordinateSystem } from 'three/webgpu';
import { Fn, If, OnAfterRenderPipeline, float, getViewPosition, isBackgroundDepth, nodeObject, sample, texture, textureSize, uniform, uv, vec2, vec3, vec4 } from 'three/tsl';

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
 * Reprojects the previous frame's lighting of static geometry into the current
 * frame. The node owns its history: after every render pipeline frame it copies
 * the beauty pass color and depth along with the camera matrices they were
 * rendered with. Each history texel is validated before interpolation. Only
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
	 * @param {boolean} [options.cache=false] - Evaluate once per depth texel per frame into a nearest-sampled float texture. Useful when many rays reuse the same source texels.
	 */
	constructor( beautyNode, depth, normal, camera, {
		tolerancePixels = uniform( 1.5 ), toleranceWorld = uniform( 0.001 ),
		analyticPixelFootprint = camera.isPerspectiveCamera === true || camera.isOrthographicCamera === true,
		cache = false
	} = {} ) {

		super( 'vec4' );

		this.beautyNode = beautyNode;
		this.camera = camera;

		this._historyRenderTarget = new RenderTarget( 1, 1, { type: HalfFloatType, depthTexture: new DepthTexture() } );
		this._historyRenderTarget.texture.name = 'ReprojectedRadianceNode.history';
		this._historyRenderTarget.depthTexture.minFilter = NearestFilter;
		this._historyRenderTarget.depthTexture.magFilter = NearestFilter;

		this._previousView = uniform( new Matrix4() );
		this._previousProjection = uniform( new Matrix4() );
		this._previousProjectionInverse = uniform( new Matrix4() );
		this._valid = uniform( false );

		const radiance = texture( this._historyRenderTarget.texture );
		const historyDepth = texture( this._historyRenderTarget.depthTexture );
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
			const historyValid = this._valid.and( clip.w.greaterThan( 0 ) ).and( inBounds( previousUV ) ).and( inDepthBounds ).and( isBackgroundDepth( currentDepth ).not() );

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

		this._cache = cache ? nodeObject( new ReprojectedRadianceCacheNode( source, depth ) ) : null;
		this._source = cache ? sample( coordinate => Fn( () => {

			const value = vec4().toVar();
			// don't clamp to edge cache texels outside the raster grid
			const inside = coordinate.greaterThanEqual( vec2( 0 ) ).all().and( coordinate.lessThan( vec2( 1 ) ).all() );
			If( inside, () => {

				value.assign( this._cache.sample( coordinate ) );

			} ).Else( () => {

				value.assign( source.sample( coordinate ) );

			} );
			return value;

		} )() ) : source;

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

	setup( builder ) {

		const depthTexture = this.beautyNode.getTexture( 'depth' );
		this._historyRenderTarget.depthTexture.format = depthTexture.format;
		this._historyRenderTarget.depthTexture.type = depthTexture.type;

		// runs before callbacks registered later, e.g. TRAA clearing its jitter, so the
		// captured projection matches the depth that was rendered
		OnAfterRenderPipeline( () => this._capture( builder.renderer ) );

		return this.beautyNode;

	}

	_capture( renderer ) {

		const color = this.beautyNode.getTexture( 'output' );
		const depth = this.beautyNode.getTexture( 'depth' );
		const { width, height } = color.image;

		if ( this._historyRenderTarget.width !== width || this._historyRenderTarget.height !== height ) {

			this._historyRenderTarget.setSize( width, height );
			renderer.initRenderTarget( this._historyRenderTarget );

		}

		renderer.copyTextureToTexture( color, this._historyRenderTarget.texture );
		renderer.copyTextureToTexture( depth, this._historyRenderTarget.depthTexture );
		this._previousView.value.copy( this.camera.matrixWorldInverse );
		this._previousProjection.value.copy( this.camera.projectionMatrix );
		this._previousProjectionInverse.value.copy( this.camera.projectionMatrixInverse );
		this._valid.value = true;

	}

	dispose() {

		super.dispose();

		this._historyRenderTarget.dispose();
		if ( this._cache !== null ) this._cache.dispose();

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
