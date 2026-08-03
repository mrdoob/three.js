import { output, renderOutput, uniform } from '../../nodes/TSL.js';

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
 */
class DirectRenderPipeline {

	/**
	 * Constructs a direct render pipeline.
	 *
	 * @param {Renderer} renderer - A reference to the renderer.
	 */
	constructor( renderer ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isDirectRenderPipeline = true;

		/**
		 * A reference to the renderer.
		 *
		 * @type {Renderer}
		 */
		this.renderer = renderer;

		/**
		 * An optional node for processing each material output before tone mapping
		 * and color conversion. The current material output is available through
		 * the TSL `output` property.
		 *
		 * @type {?Node<vec4>}
		 * @default null
		 */
		this.outputNode = null;

		/**
		 * Must be set to `true` when the output node changes.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.needsUpdate = true;

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
		 * The current tone mapping.
		 *
		 * @private
		 * @type {ToneMapping}
		 */
		this._toneMapping = renderer.toneMapping;

		/**
		 * The current output color space.
		 *
		 * @private
		 * @type {ColorSpace}
		 */
		this._outputColorSpace = renderer.outputColorSpace;

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

		if ( backgroundNode !== null ) scene.backgroundNode = backgroundNode;

		renderer.contextNode = this._contextNode;

		if ( useDirectXRRenderTarget ) {

			samples = outputRenderTarget.samples;
			depthBuffer = outputRenderTarget.depthBuffer;

			outputRenderTarget.samples = renderer.samples;
			outputRenderTarget.depthBuffer = true;

		}

		try {

			renderer.render( scene, camera );

		} finally {

			if ( backgroundNode !== null && scene.backgroundNode === backgroundNode ) scene.backgroundNode = currentBackgroundNode;

			if ( renderer.contextNode === this._contextNode ) renderer.contextNode = currentContextNode;

			if ( useDirectXRRenderTarget ) {

				outputRenderTarget.samples = samples;
				outputRenderTarget.depthBuffer = depthBuffer;

			}

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
	 * Updates the material context when pipeline or renderer output settings change.
	 *
	 * @private
	 */
	_update() {

		const renderer = this.renderer;

		if ( this._rendererContextNode !== renderer.contextNode ) {

			this._rendererContextNode = renderer.contextNode;
			this.needsUpdate = true;

		}

		if ( this._toneMapping !== renderer.toneMapping ) {

			this._toneMapping = renderer.toneMapping;
			this.needsUpdate = true;

		}

		if ( this._outputColorSpace !== renderer.outputColorSpace ) {

			this._outputColorSpace = renderer.outputColorSpace;
			this.needsUpdate = true;

		}

		if ( this.needsUpdate === true ) {

			const pipelineOutputNode = this.outputNode;
			const toneMapping = this._toneMapping;
			const outputColorSpace = this._outputColorSpace;

			this._contextNode = this._rendererContextNode.context( {
				outputColorTransform: false,

				getOutput: ( materialOutputNode, builder ) => {

					const renderer = builder.renderer;
					const renderTarget = renderer.getRenderTarget();

					if ( renderer.isOutputTarget === false && renderTarget?._hasExternalTextures !== true ) return materialOutputNode;

					let outputNode = materialOutputNode;

					if ( pipelineOutputNode !== null ) {

						output.assign( materialOutputNode );
						outputNode = pipelineOutputNode;

					}

					return renderOutput( outputNode, toneMapping, outputColorSpace );

				}
			} );

			this.needsUpdate = false;

		}

	}

}

export default DirectRenderPipeline;
