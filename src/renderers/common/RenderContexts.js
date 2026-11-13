import { getTextureType } from '../../nodes/core/NodeUtils.js';
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
		let buildState;

		if ( renderTarget === null ) {

			attachmentState = 'default';
			buildState = 'default';

		} else {

			const format = renderTarget.texture?.format;
			const type = renderTarget.texture?.type;
			const count = renderTarget.textures.length;

			// Texture names are part of the attachment state as well: two
			// targets that only differ in a texture name must not share a
			// render context, since the name can end up in the node build
			// (see buildState below).

			const names = renderTarget.textures.map( ( texture ) => texture.name ).join( ',' );

			attachmentState = `${ count }:${ format }:${ type }:${ renderTarget.samples }:${ renderTarget.depthBuffer }:${ renderTarget.stencilBuffer }:${ names }`;

			// A node build only reads the output types of the target textures
			// (`NodeBuilder.getOutputType()`), the texture names used for MRT
			// outputs (`NodeMaterial.setup()`), and whether the target has a
			// depth buffer (`NodeMaterial.setupDepth()`). Sample count, exact
			// format/type and stencil only change pipeline state, which the
			// backend keys separately (`WebGPUBackend.getRenderCacheKey()`),
			// so they must not split the node build cache. See #35388.

			buildState = `${ renderTarget.textures.map( ( texture ) => getTextureType( texture ) + ':' + texture.name ).join( ',' ) }:${ renderTarget.depthBuffer }`;

		}

		//

		const mrtState = ( mrt !== null ) ? mrt.id : 'default';

		//

		// materials check the camera type at build time, so camera types must not share render objects

		const cameraState = camera?.isOrthographicCamera === true ? 'orthographic' : 'perspective';

		//

		const stateKey = buildState + '-' + mrtState + '-' + cameraState;
		const renderStateKey = attachmentState + '-' + mrtState + '-' + cameraState + '-' + callDepth; // one render context per call depth keeps the bindings of nested renders separate

		let renderState = this._renderContexts[ renderStateKey ];

		if ( renderState === undefined ) {

			renderState = new RenderContext();
			renderState.mrt = mrt;
			renderState.stateKey = stateKey;

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
