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
	 * @param {?Camera} [camera=null] - The camera of the render call.
	 * @return {RenderContext} The render context.
	 */
	get( renderTarget = null, mrt = null, callDepth = 0, camera = null ) {

		//

		let attachmentState;
		let samples = 0;

		if ( renderTarget === null ) {

			attachmentState = 'default';

		} else {

			const format = renderTarget.texture?.format;
			const type = renderTarget.texture?.type;
			const count = renderTarget.textures.length;

			attachmentState = `${ count }:${ format }:${ type }:${ renderTarget.depthBuffer }:${ renderTarget.stencilBuffer }`;
			samples = renderTarget.samples;

		}

		//

		let mrtState = 'default';

		if ( mrt !== null ) {

			mrtState = mrt.id;

			// MRT nodes pick the output of each attachment by the texture name at build time,
			// so render targets with different attachment names must not share render objects

			if ( renderTarget !== null ) {

				const textures = renderTarget.textures;

				for ( let i = 0; i < textures.length; i ++ ) {

					mrtState += ':' + textures[ i ].name;

				}

			}

		}

		//

		// materials check the camera type at build time, so camera types must not share render objects

		const cameraState = camera?.isOrthographicCamera === true ? 'orthographic' : 'perspective';

		//

		const buildKey = attachmentState + '-' + mrtState + '-' + cameraState;
		const contextKey = buildKey + '-' + samples + '-' + callDepth; // one render context per call depth keeps the bindings of nested renders separate

		let renderContext = this._renderContexts[ contextKey ];

		if ( renderContext === undefined ) {

			renderContext = new RenderContext();
			renderContext.mrt = mrt;
			renderContext.buildKey = buildKey;

			this._renderContexts[ contextKey ] = renderContext;

		}

		if ( renderTarget !== null ) renderContext.sampleCount = renderTarget.samples === 0 ? 1 : renderTarget.samples;

		renderContext.clearDepthValue = this.renderer.getClearDepth();
		renderContext.clearStencilValue = this.renderer.getClearStencil();

		return renderContext;

	}

	/**
	 * Frees internal resources.
	 */
	dispose() {

		this._renderContexts = {};

	}

}

export default RenderContexts;
