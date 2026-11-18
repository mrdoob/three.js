import { HalfFloatType, LinearFilter, LinearMipmapLinearFilter, Matrix4, Node, NodeMaterial, NodeUpdateType, QuadMesh, RenderTarget, RendererUtils, Vector2 } from 'three/webgpu';
import { Fn, OnAfterObjectUpdate, convertToTexture, float, getViewPosition, isBackgroundDepth, ivec2, luminance, nodeObject, passTexture, texture, textureSize, uniform, uv, vec2, vec3, vec4 } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

let _rendererState;

/**
 * @typedef {Object} ReprojectNodeOptions
 * @property {Camera} [camera] - The camera the scene is rendered with. Inferred from the depth pass when omitted.
 * @property {boolean} [cache=true] - When `true`, the frame is reprojected once into a buffer that all lookups share. When `false`, each lookup is reprojected on its own, which is exact at the lookup's UV but costs eight texture reads.
 * @property {number} [resolutionScale=1] - The resolution of the buffer relative to the drawing buffer.
 * @property {boolean} [mipmaps=false] - Whether the buffer has a mip chain, for lookups by rough reflections and diffuse rays.
 */

/**
 * Reprojects the previous frame's linear HDR output into the current frame, so effects
 * that run before the current frame is shaded (SSR, SSGI) can read it as their radiance.
 *
 * Each pixel gathers from the previous frame by its velocity and is validated against the
 * previous depth. The node is a radiance input: `sample( uv, level )` returns the radiance
 * in RGB and its validity in alpha, and invalid history returns zero.
 *
 * ```js
 * const history = reproject( velocity, depth, scenePass.getPreviousTextureNode( 'depth' ) );
 * const reflection = ssr( history, depth, normal, { camera } );
 * renderPipeline.outputNode = history.capture( beauty );
 * ```
 *
 * Depth validation assumes static geometry, so objects that move in depth lose history.
 *
 * @augments Node
 * @three_import import { reproject } from 'three/addons/tsl/display/ReprojectNode.js';
 */
class ReprojectNode extends Node {

	static get type() {

		return 'ReprojectNode';

	}

	/**
	 * Constructs a new reproject node.
	 *
	 * @param {TextureNode} velocityNode - The current frame's velocity.
	 * @param {TextureNode} depthNode - The current frame's depth.
	 * @param {TextureNode} previousDepthNode - The previous frame's depth.
	 * @param {ReprojectNodeOptions} [options] - The options.
	 */
	constructor( velocityNode, depthNode, previousDepthNode, options = {} ) {

		super( 'vec4' );

		const { camera = depthNode.passNode.camera, cache = true, resolutionScale = 1, mipmaps = false } = options;

		/**
		 * Consumers sample this node per lookup instead of converting it to a texture.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSampleNode = true;

		/**
		 * The current frame's velocity.
		 *
		 * @type {TextureNode}
		 */
		this.velocityNode = velocityNode;

		/**
		 * The current frame's depth.
		 *
		 * @type {TextureNode}
		 */
		this.depthNode = depthNode;

		/**
		 * The previous frame's depth.
		 *
		 * @type {TextureNode}
		 */
		this.previousDepthNode = previousDepthNode;

		/**
		 * The camera the scene is rendered with.
		 *
		 * @type {Camera}
		 */
		this.camera = camera;

		/**
		 * Whether the frame is reprojected once into a shared buffer.
		 *
		 * @type {boolean}
		 * @readonly
		 */
		this.cache = cache;

		/**
		 * The resolution of the buffer relative to the drawing buffer.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.resolutionScale = resolutionScale;

		/**
		 * Radiance above this luminance is scaled down, so fireflies do not compound
		 * as they feed back from frame to frame.
		 *
		 * @type {UniformNode<float>}
		 * @default 10
		 */
		this.maxLuminance = uniform( 10 );

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders
		 * its buffer once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 */
		this.updateBeforeType = cache ? NodeUpdateType.FRAME : NodeUpdateType.NONE;

		this._cameraWorldMatrix = uniform( camera.matrixWorld );
		this._cameraProjectionMatrixInverse = uniform( camera.projectionMatrixInverse );

		const viewMatrix = new Matrix4();

		this._previousCameraViewMatrix = uniform( new Matrix4() ).onFrameUpdate( ( frame, self ) => {

			self.value.copy( viewMatrix );
			viewMatrix.copy( camera.matrixWorldInverse );

		} );

		/**
		 * Holds the output captured by {@link ReprojectNode#capture}.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._beautyRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._beautyRenderTarget.texture.name = 'ReprojectNode.beauty';

		/**
		 * The reprojected buffer. Radiance is stored premultiplied by its validity so
		 * filtering and mips weight valid texels only.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._renderTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType, generateMipmaps: mipmaps, minFilter: mipmaps ? LinearMipmapLinearFilter : LinearFilter } );
		this._renderTarget.texture.name = 'ReprojectNode.output';

		this._material = new NodeMaterial();
		this._material.name = 'Reproject';
		this._material.fragmentNode = Fn( () => {

			const history = this._reproject( uv() ).toConst();

			return vec4( history.rgb.mul( history.a ), history.a );

		} )();

		this._textureNode = passTexture( this, this._renderTarget.texture );

	}

	/**
	 * Returns the previous frame's radiance at the given current-frame UV.
	 *
	 * @param {Node<vec2>} uv - The screen UV.
	 * @param {Node<float>|number} [level=0] - The mip level. Only used by the cached buffer.
	 * @return {Node<vec4>} The radiance in RGB and its validity in alpha.
	 */
	sample( uv, level = 0 ) {

		if ( this.cache === false ) return this._reproject( uv );

		const history = this._textureNode.sample( uv );
		history.levelNode = nodeObject( level );

		return vec4( history.rgb.div( history.a.max( 1e-4 ) ), history.a );

	}

	/**
	 * Stores the given node's output as the frame the next frame reprojects. Apply it to
	 * the linear HDR image after anti-aliasing and before bloom and tone mapping.
	 *
	 * @param {Node<vec4>} node - The frame's output.
	 * @return {Node<vec4>} The given output.
	 */
	capture( node ) {

		const beautyNode = convertToTexture( nodeObject( node ) );
		const renderTarget = this._beautyRenderTarget;

		return Fn( () => {

			OnAfterObjectUpdate( ( { renderer } ) => {

				const beauty = beautyNode.value;

				if ( renderTarget.width !== beauty.width || renderTarget.height !== beauty.height ) {

					// a texture copy requires matching types

					renderTarget.texture.type = beauty.type;
					renderTarget.setSize( beauty.width, beauty.height );
					renderer.initRenderTarget( renderTarget );

				}

				renderer.copyTextureToTexture( beauty, renderTarget.texture );

			} );

			return beautyNode;

		} )();

	}

	/**
	 * This method is used to render the buffer once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		const size = renderer.getDrawingBufferSize( _size );
		this._renderTarget.setSize( Math.round( size.width * this.resolutionScale ), Math.round( size.height * this.resolutionScale ) );

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		renderer.setRenderTarget( this._renderTarget );
		_quadMesh.material = this._material;
		_quadMesh.name = 'Reproject';
		_quadMesh.render( renderer );

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @return {Node<vec4>}
	 */
	setup() {

		return this.sample( uv() );

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		super.dispose();

		this._beautyRenderTarget.dispose();
		this._renderTarget.dispose();
		this._material.dispose();

	}

	/**
	 * Gathers the previous frame's radiance for the given current-frame UV.
	 *
	 * @private
	 * @param {Node<vec2>} uv - The screen UV.
	 * @return {Node<vec4>} The radiance in RGB and its validity in alpha.
	 */
	_reproject( uv ) {

		const { velocityNode, depthNode, previousDepthNode } = this;
		const beautyNode = texture( this._beautyRenderTarget.texture );

		return Fn( () => {

			// load the velocity of one surface, filtering would mix the motion at silhouettes

			const velocitySize = ivec2( textureSize( velocityNode ) );
			const velocityTexel = ivec2( uv.mul( vec2( velocitySize ) ) ).clamp( ivec2( 0 ), velocitySize.sub( 1 ) );
			const historyUV = uv.sub( velocityNode.load( velocityTexel ).xy.mul( vec2( 0.5, - 0.5 ) ) ).toConst();

			// the view depth the surface had in the previous frame

			const depth = depthNode.sample( uv ).r.toConst();
			const viewPosition = getViewPosition( uv, depth, this._cameraProjectionMatrixInverse );
			const previousZ = this._previousCameraViewMatrix.mul( this._cameraWorldMatrix.mul( vec4( viewPosition, 1 ) ) ).z.toConst();

			// allow for the depth slope over a pixel and the precision of the depth buffer

			const size = vec2( textureSize( previousDepthNode ) ).toConst();
			const pixelDepth = this._cameraProjectionMatrixInverse.element( 1 ).y.abs().mul( previousZ.abs() ).mul( 3 ).div( size.y );
			const tolerance = pixelDepth.max( previousZ.abs().mul( 0.002 ) ).max( 0.001 ).toConst();

			const inBounds = ( p ) => p.greaterThanEqual( 0 ).all().and( p.lessThanEqual( 1 ).all() );
			const valid = inBounds( historyUV ).and( isBackgroundDepth( depth ).not() ).toConst();

			const pixel = historyUV.mul( size ).sub( 0.5 ).toConst();
			const base = pixel.floor().toConst();
			const fraction = pixel.fract().toConst();

			const radiance = vec3( 0 ).toVar();
			const validity = float( 0 ).toVar();

			// validate each bilinear tap, so no color is pulled across an occlusion edge

			for ( let y = 0; y <= 1; y ++ ) {

				for ( let x = 0; x <= 1; x ++ ) {

					const tapUV = base.add( vec2( x, y ) ).add( 0.5 ).div( size ).toConst();
					const tapDepth = previousDepthNode.sample( tapUV ).r.toConst();
					const tapZ = getViewPosition( tapUV, tapDepth, this._cameraProjectionMatrixInverse ).z;

					const accepted = valid.and( inBounds( tapUV ) ).and( isBackgroundDepth( tapDepth ).not() )
						.and( tapZ.sub( previousZ ).abs().lessThanEqual( tolerance ) );

					const weightX = x === 0 ? fraction.x.oneMinus() : fraction.x;
					const weightY = y === 0 ? fraction.y.oneMinus() : fraction.y;
					const weight = weightX.mul( weightY ).mul( float( accepted ) ).toConst();

					radiance.addAssign( beautyNode.sample( tapUV ).rgb.mul( weight ) );
					validity.addAssign( weight );

				}

			}

			radiance.divAssign( validity.max( 1e-6 ) );
			radiance.mulAssign( this.maxLuminance.div( luminance( radiance ).max( 1e-4 ) ).min( 1 ) );

			return vec4( radiance, validity );

		} )();

	}

}

export default ReprojectNode;

/**
 * TSL function for reprojecting the previous frame's output into the current frame.
 *
 * @tsl
 * @function
 * @param {TextureNode} velocityNode - The current frame's velocity.
 * @param {TextureNode} depthNode - The current frame's depth.
 * @param {TextureNode} previousDepthNode - The previous frame's depth.
 * @param {ReprojectNodeOptions} [options] - The options.
 * @returns {ReprojectNode}
 */
export const reproject = ( velocityNode, depthNode, previousDepthNode, options ) => new ReprojectNode( velocityNode, depthNode, previousDepthNode, options );
