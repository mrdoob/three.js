import { output, renderOutput, uniform } from '../../nodes/TSL.js';
import { ColorManagement } from '../../math/ColorManagement.js';
import { NoToneMapping } from '../../constants.js';
import RenderPipeline from './RenderPipeline.js';

/**
 * An alternative render pipeline that applies output processing directly in
 * material shaders. This avoids the intermediate framebuffer and output pass
 * used by {@link Renderer}, but changes blending and is not compatible with
 * materials that sample the framebuffer, such as transmissive materials.
 *
 * ```js
 * const renderPipeline = new DirectRenderPipeline( renderer );
 * renderPipeline.render( scene, camera );
 * ```
 *
 * Note: This module can only be used with `WebGPURenderer`.
 *
 * @augments RenderPipeline
 */
class DirectRenderPipeline extends RenderPipeline {

	/**
	 * Constructs a direct render pipeline.
	 *
	 * @param {Renderer} renderer - A reference to the renderer.
	 * @param {Node<vec4>} outputNode - An optional output node.
	 */
	constructor( renderer, outputNode = output ) {

		super( renderer, outputNode );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isDirectRenderPipeline = true;

		/**
		 * The context node used to apply output processing in material shaders.
		 *
		 * @private
		 * @type {?ContextNode}
		 * @default null
		 */
		this._contextNode = null;

		/**
		 * The renderer context node wrapped by this pipeline.
		 *
		 * @private
		 * @type {?ContextNode}
		 * @default null
		 */
		this._rendererContextNode = null;

		/**
		 * Cached node representations of solid scene backgrounds.
		 *
		 * @private
		 * @type {WeakMap<Color, UniformNode>}
		 */
		this._backgroundNodes = new WeakMap();

	}

	/**
	 * Renders the scene with output processing applied directly in material shaders.
	 *
	 * @param {Object3D} scene - The scene or object to render.
	 * @param {Camera} camera - The camera.
	 */
	render( scene, camera ) {

		const renderer = this.renderer;

		this._update();

		const backgroundNode = this._getBackgroundNode( scene );
		const currentBackgroundNode = backgroundNode !== null ? scene.backgroundNode : null;
		const currentContextNode = renderer.contextNode;
		const outputRenderTarget = renderer.getOutputRenderTarget();
		const useDirectXRRenderTarget = outputRenderTarget !== null && renderer.xr.isPresenting === true &&
			renderer.backend.isWebGPUBackend === true && renderer.isOutputTarget === true;

		let samples;
		let depthBuffer;
		let toneMapping;
		let outputColorSpace;

		if ( backgroundNode !== null ) scene.backgroundNode = backgroundNode;

		renderer.contextNode = this._contextNode;

		if ( useDirectXRRenderTarget ) {

			samples = outputRenderTarget.samples;
			depthBuffer = outputRenderTarget.depthBuffer;

			outputRenderTarget.samples = renderer.samples;
			outputRenderTarget.depthBuffer = true;

		}

		try {

			for ( const callback of this._contextData.onBeforePipelineCallbacks ) callback();

			toneMapping = renderer.toneMapping;
			outputColorSpace = renderer.outputColorSpace;

			renderer.toneMapping = NoToneMapping;
			renderer.outputColorSpace = ColorManagement.workingColorSpace;

			if ( renderer.xr.enabled ) {

				renderer.xr.renderLayers();

			}

			renderer.render( scene, camera );

		} finally {

			if ( toneMapping !== undefined ) renderer.toneMapping = toneMapping;
			if ( outputColorSpace !== undefined ) renderer.outputColorSpace = outputColorSpace;

			if ( backgroundNode !== null && scene.backgroundNode === backgroundNode ) scene.backgroundNode = currentBackgroundNode;

			if ( renderer.contextNode === this._contextNode ) renderer.contextNode = currentContextNode;

			if ( useDirectXRRenderTarget ) {

				outputRenderTarget.samples = samples;
				outputRenderTarget.depthBuffer = depthBuffer;

			}

			for ( const callback of this._contextData.onAfterPipelineCallbacks ) callback();

		}

	}

	/**
	 * Returns a node representation of a solid scene background so it receives
	 * the same inline output processing as material fragments.
	 *
	 * @private
	 * @param {Object3D} scene - The scene or object to render.
	 * @return {?UniformNode} The background node.
	 */
	_getBackgroundNode( scene ) {

		if ( scene.isScene !== true || scene.backgroundNode != null || scene.background?.isColor !== true ) return null;

		const environmentBlendMode = this.renderer.xr.getEnvironmentBlendMode();

		if ( environmentBlendMode === 'additive' || environmentBlendMode === 'alpha-blend' ) return null;

		let backgroundNode = this._backgroundNodes.get( scene.background );

		if ( backgroundNode === undefined ) {

			backgroundNode = uniform( scene.background );
			this._backgroundNodes.set( scene.background, backgroundNode );

		}

		return backgroundNode;

	}

	/**
	 * Updates the state of the module.
	 *
	 * @private
	 */
	_update() {

		if ( this._rendererContextNode !== this.renderer.contextNode ) {

			this._rendererContextNode = this.renderer.contextNode;
			this.needsUpdate = true;

		}

		super._update();

	}

	/**
	 * Updates the context used to process material output directly.
	 *
	 * @private
	 */
	_updateContext() {

		super._updateContext();

		const pipelineOutputNode = this.outputNode;
		const toneMapping = this._toneMapping;
		const outputColorSpace = this._outputColorSpace;
		const outputColorTransform = this.outputColorTransform;

		this._contextNode = this._rendererContextNode.context( {

			...this._contextData,

			getOutput: ( materialOutputNode, builder ) => {

				const renderer = builder.renderer;
				const renderTarget = renderer.getRenderTarget();

				if ( renderer.isOutputTarget === false && renderTarget?._hasExternalTextures !== true ) return materialOutputNode;

				output.assign( materialOutputNode );

				return outputColorTransform === true ?
					renderOutput( pipelineOutputNode, toneMapping, outputColorSpace ) :
					pipelineOutputNode;

			}
		} );

	}

}

export default DirectRenderPipeline;
