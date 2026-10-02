import { PassNode, RenderTarget, BlendMode, RendererUtils, Vector2, HalfFloatType, UnsignedByteType, RedFormat, CustomBlending, NormalBlending, OneFactor, ZeroFactor, OneMinusSrcColorFactor } from 'three/webgpu';
import { float, mix, mrt, output, positionView, texture, vec4 } from 'three/tsl';

const _size = /*@__PURE__*/ new Vector2();

let _rendererState, _sceneState;

/**
 * A render pass node that renders the scene with Order-Independent Transparency
 * based on the Weighted Blended OIT technique by McGuire and Bavoil.
 *
 * Transparent objects are rendered in a separate pass into two accumulation
 * targets (a weighted color sum and the pixel's revealage) which are
 * then composited over the rest of the scene. Since the result does not depend
 * on the draw order, artifacts from sorting-based transparency like popping or
 * incorrectly resolved intersecting geometry are avoided.
 *
 * Only transparent materials using `NormalBlending` and no transmission qualify
 * for OIT. All other objects are rendered as usual.
 *
 * MSAA is only supported with the WebGPU backend.
 *
 * MRT configurations assigned via `setMRT()` apply to the default pass only.
 * OIT-qualified objects contribute to the color output but not to custom
 * MRT outputs since a pixel may accumulate multiple transparent surfaces.
 *
 * ```js
 * const renderPipeline = new THREE.RenderPipeline( renderer );
 * renderPipeline.outputNode = oitPass( scene, camera );
 * ```
 *
 * References:
 * - {@link https://jcgt.org/published/0002/02/09/}
 * - {@link https://casual-effects.blogspot.com/2014/03/weighted-blended-order-independent.html}
 *
 * @augments PassNode
 * @three_import import { oitPass } from 'three/addons/tsl/display/OITPassNode.js';
 */
class OITPassNode extends PassNode {

	static get type() {

		return 'OITPassNode';

	}

	/**
	 * Constructs a new OIT pass node.
	 *
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to render the scene with.
	 * @param {Object} [options={}] - Options for the internal render target.
	 */
	constructor( scene, camera, options = {} ) {

		super( PassNode.COLOR, scene, camera, options );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isOITPassNode = true;

		/**
		 * The depth-based weight of a transparent fragment, see equations (7) to (9)
		 * in the paper. When `null`, equation (9) is used. Must be assigned before
		 * the first render.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.weightNode = null;

		// the accumulation target shares the depth of the default pass so transparent
		// fragments are depth-tested against the opaque scene (without depth writes)

		const oitRenderTarget = new RenderTarget( 1, 1, { count: 2 } );
		oitRenderTarget.depthTexture = this.renderTarget.depthTexture;

		const accumTexture = oitRenderTarget.textures[ 0 ]; // RGBA16
		accumTexture.name = 'accum';
		accumTexture.type = HalfFloatType;

		const revealageTexture = oitRenderTarget.textures[ 1 ]; // R8
		revealageTexture.name = 'revealage';
		revealageTexture.format = RedFormat;
		revealageTexture.type = UnsignedByteType;

		/**
		 * The render target holding the OIT accumulation textures.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._oitRenderTarget = oitRenderTarget;

		/**
		 * The MRT configuration for the OIT pass.
		 *
		 * @private
		 * @type {?MRTNode}
		 */
		this._oitMRTNode = null;

		/**
		 * The renderer of the current frame.
		 *
		 * @private
		 * @type {?Renderer}
		 */
		this._renderer = null;

		/**
		 * Renders opaque objects and transparent objects that do not qualify for OIT.
		 *
		 * @private
		 * @type {Function}
		 */
		this._defaultRenderObjectFunction = ( object, scene, camera, geometry, material, group, lightsNode, clippingContext, passId ) => {

			if ( isOITCapable( material ) === false ) {

				this._renderer.renderObject( object, scene, camera, geometry, material, group, lightsNode, clippingContext, passId );

			}

		};

		/**
		 * Renders OIT-qualified objects into the accumulation targets.
		 *
		 * @private
		 * @type {Function}
		 */
		this._oitRenderObjectFunction = ( object, scene, camera, geometry, material, group, lightsNode, clippingContext, passId ) => {

			if ( isOITCapable( material ) === true ) {

				const currentDepthWrite = material.depthWrite;

				material.depthWrite = false;

				this._renderer.renderObject( object, scene, camera, geometry, material, group, lightsNode, clippingContext, passId );

				material.depthWrite = currentDepthWrite;

			}

		};

	}

	/**
	 * Returns the MRT configuration for the OIT pass.
	 *
	 * @private
	 * @return {MRTNode} The MRT node.
	 */
	_getMRTNode() {

		if ( this._oitMRTNode === null ) {

			const alpha = output.a;

			let weight = this.weightNode;

			if ( weight === null ) {

				// equation (9) from the paper, based on the linear eye-space depth

				const z = positionView.z.negate();

				weight = alpha.mul( float( 0.03 ).div( z.div( 200 ).pow( 4 ).add( 1e-5 ) ).clamp( 1e-2, 3e3 ) );

			}

			// since the revealage target is single-channel, the alpha must be blended
			// via its red channel

			const accumBlending = new BlendMode( CustomBlending );
			accumBlending.blendSrc = OneFactor;
			accumBlending.blendDst = OneFactor;

			const revealageBlending = new BlendMode( CustomBlending );
			revealageBlending.blendSrc = ZeroFactor;
			revealageBlending.blendDst = OneMinusSrcColorFactor;

			this._oitMRTNode = mrt( {
				accum: vec4( output.rgb.mul( alpha ), alpha ).mul( weight ),
				revealage: alpha
			} ).setBlendMode( 'accum', accumBlending ).setBlendMode( 'revealage', revealageBlending )
				.setClearColor( 'accum', 0x000000, 0 ).setClearColor( 'revealage', 0xffffff, 1 );

		}

		return this._oitMRTNode;

	}

	setSize( width, height ) {

		super.setSize( width, height );

		this._oitRenderTarget.setSize( this.renderTarget.width, this.renderTarget.height );

	}

	setup( builder ) {

		const beautyNode = super.setup( builder );

		// MSAA

		if ( builder.renderer.backend.isWebGPUBackend === true ) {

			// sample counts must match since the depth buffer is shared

			this._oitRenderTarget.samples = this.renderTarget.samples;

		} else {

			// The WebGL backend does not support depth texture sharing with MSAA unless
			// WEBGL_multisampled_render_to_texture is supported (which isn't available on most devices)

			this.renderTarget.samples = 0;

		}

		// TSL

		const accumNode = texture( this._oitRenderTarget.textures[ 0 ] );
		const revealageNode = texture( this._oitRenderTarget.textures[ 1 ] ).r;

		const accumColor = accumNode.rgb.div( accumNode.a.max( 1e-5 ) );

		return vec4( mix( accumColor, beautyNode.rgb, revealageNode ), beautyNode.a );

	}

	updateBefore( frame ) {

		const { renderer } = frame;
		const { scene, camera } = this;

		this._renderer = renderer;

		renderer.getDrawingBufferSize( _size );
		this.setSize( _size.width, _size.height );

		_rendererState = RendererUtils.saveRendererState( renderer, _rendererState );

		const currentAutoClearColor = renderer.autoClearColor;
		const currentAutoClearDepth = renderer.autoClearDepth;
		const currentAutoClearStencil = renderer.autoClearStencil;
		const currentTransparent = renderer.transparent;
		const currentOpaque = renderer.opaque;
		const currentMask = camera.layers.mask;

		this._cameraNear.value = camera.near;
		this._cameraFar.value = camera.far;

		if ( this._layers !== null ) {

			camera.layers.mask = this._layers.mask;

		}

		renderer.autoClear = this.autoClear;
		renderer.autoClearColor = this.autoClearColor;
		renderer.autoClearDepth = this.autoClearDepth;
		renderer.autoClearStencil = this.autoClearStencil;

		// default pass: opaque objects and transparent objects that do not qualify for OIT

		renderer.setMRT( this._mrt );
		renderer.setRenderTarget( this.renderTarget );
		renderer.setRenderObjectFunction( this._defaultRenderObjectFunction );

		renderer.render( scene, camera );

		// OIT pass: accumulate the weighted colors and the revealage of all OIT-qualified objects

		_sceneState = RendererUtils.resetSceneState( scene, _sceneState ); // the background must not affect the accumulation targets

		renderer.setRenderTarget( this._oitRenderTarget );
		renderer.setMRT( this._getMRTNode() );
		renderer.setRenderObjectFunction( this._oitRenderObjectFunction );
		renderer.autoClearDepth = false; // the depth buffer is shared with the default pass
		renderer.opaque = false;
		renderer.transparent = true;

		renderer.render( scene, camera );

		// restore

		RendererUtils.restoreSceneState( scene, _sceneState );
		RendererUtils.restoreRendererState( renderer, _rendererState );

		renderer.autoClearColor = currentAutoClearColor;
		renderer.autoClearDepth = currentAutoClearDepth;
		renderer.autoClearStencil = currentAutoClearStencil;
		renderer.transparent = currentTransparent;
		renderer.opaque = currentOpaque;

		camera.layers.mask = currentMask;

		this._renderer = null;

	}

	dispose() {

		super.dispose();

		this._oitRenderTarget.dispose();

	}

}

/**
 * Returns `true` if the given material qualifies for OIT.
 *
 * @param {Material} material - The material to check.
 * @return {boolean} Whether the material qualifies for OIT or not.
 */
function isOITCapable( material ) {

	return material.transparent === true && material.blending === NormalBlending &&
		( material.transmission > 0 ) === false &&
		! ( material.transmissionNode && material.transmissionNode.isNode ) &&
		! ( material.backdropNode && material.backdropNode.isNode );

}


export default OITPassNode;

/**
 * TSL function for creating an OIT pass node.
 *
 * @tsl
 * @function
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to render the scene with.
 * @param {Object} [options={}] - Options for the internal render target.
 * @returns {OITPassNode}
 */
export const oitPass = ( scene, camera, options ) => new OITPassNode( scene, camera, options );
