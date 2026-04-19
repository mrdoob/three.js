import RenderContext from './RenderContext.js';

/**
 * This module manages the render contexts of the renderer.
 *
 * @private
 */
class RenderContexts {

	/**
	 * Constructs a new render context management component.
	 *
	 * @param {Renderer} renderer - The renderer.
	 */
	constructor( renderer ) {

		/**
		 * The renderer.
		 *
		 * @type {Renderer}
		 */
		this.renderer = renderer;

		/**
		 * A dictionary that manages render contexts.
		 *
		 * @type {Object<string,RenderContext>}
		 */
		this._renderContexts = {};

	}

	/**
	 * Returns a render context for the given scene, camera and render target.
	 *
	 * @param {?RenderTarget} [renderTarget=null] - The active render target.
	 * @param {?MRTNode} [mrt=null] - The MRT configuration
	 * @param {?number} [callDepth=0] - The call depth of the renderer.
	 * @return {RenderContext} The render context.
	 */
	get( renderTarget = null, mrt = null, callDepth = 0 ) {

		//

		let attachmentState;

		if ( renderTarget === null ) {

			attachmentState = 'default';

		} else {

			const format = renderTarget.texture.format;
			const type = renderTarget.texture.type;
			const count = renderTarget.textures.length;
			const samples = renderTarget.samples;
			const depthBuffer = renderTarget.depthBuffer;
			const stencilBuffer = renderTarget.stencilBuffer;

			if ( renderTarget._attachmentState === undefined ||
				renderTarget._attachmentStateFormat !== format ||
				renderTarget._attachmentStateType !== type ||
				renderTarget._attachmentStateSamples !== samples ||
				renderTarget._attachmentStateCount !== count ||
				renderTarget._attachmentStateDepth !== depthBuffer ||
				renderTarget._attachmentStateStencil !== stencilBuffer ) {

				renderTarget._attachmentState = `${ count }:${ format }:${ type }:${ samples }:${ depthBuffer }:${ stencilBuffer }`;
				renderTarget._attachmentStateFormat = format;
				renderTarget._attachmentStateType = type;
				renderTarget._attachmentStateSamples = samples;
				renderTarget._attachmentStateCount = count;
				renderTarget._attachmentStateDepth = depthBuffer;
				renderTarget._attachmentStateStencil = stencilBuffer;

			}

			attachmentState = renderTarget._attachmentState;

		}

		//

		const mrtState = ( mrt !== null ) ? mrt.id : 'default';

		//

		const renderStateKey = attachmentState + '-' + mrtState + '-' + callDepth;

		let renderState = this._renderContexts[ renderStateKey ];

		if ( renderState === undefined ) {

			renderState = new RenderContext();
			renderState.mrt = mrt;

			this._renderContexts[ renderStateKey ] = renderState;

		}

		if ( renderTarget !== null ) renderState.sampleCount = renderTarget.samples === 0 ? 1 : renderTarget.samples;

		renderState.clearDepthValue = this.renderer.getClearDepth();
		renderState.clearStencilValue = this.renderer.getClearStencil();

		return renderState;

	}

	/**
	 * Frees internal resources.
	 */
	dispose() {

		this._renderContexts = {};

	}

}

export default RenderContexts;
