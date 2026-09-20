import RenderContext from './RenderContext.js';

/**
 * Returns the child map stored under the given key, creating it on first use.
 *
 * @private
 * @param {Map} map - The parent map.
 * @param {any} key - The key.
 * @return {Map} The child map.
 */
function getChildMap( map, key ) {

	let childMap = map.get( key );

	if ( childMap === undefined ) {

		childMap = new Map();
		map.set( key, childMap );

	}

	return childMap;

}

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
		 * Render contexts keyed structurally by attachment configuration, then MRT
		 * configuration, then call depth. Using nested maps instead of a
		 * concatenated string avoids building a cache key on every `get()` call
		 * (which is on the render hot path) while keeping the exact same identity:
		 * render targets with a compatible attachment configuration share a context,
		 * and a configuration change yields a new one.
		 *
		 * @type {Map}
		 */
		this._renderContexts = new Map();

		/**
		 * Render contexts for the default framebuffer (`renderTarget === null`),
		 * keyed by MRT configuration and then by call depth.
		 *
		 * @type {Map<?MRTNode, Map<number, RenderContext>>}
		 */
		this._defaultRenderContexts = new Map();

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

		// resolve the map keyed by MRT configuration for the given attachment state

		let mrtStates;

		if ( renderTarget === null ) {

			mrtStates = this._defaultRenderContexts;

		} else {

			// nest by the same attachment properties the previous string key encoded

			const texture = renderTarget.texture;

			let map = getChildMap( this._renderContexts, renderTarget.textures.length );
			map = getChildMap( map, texture.format );
			map = getChildMap( map, texture.type );
			map = getChildMap( map, renderTarget.samples );
			map = getChildMap( map, renderTarget.depthBuffer );
			mrtStates = getChildMap( map, renderTarget.stencilBuffer );

		}

		// map of call depths for the given MRT configuration

		const callDepthStates = getChildMap( mrtStates, mrt );

		// render context for the given call depth

		let renderState = callDepthStates.get( callDepth );

		if ( renderState === undefined ) {

			renderState = new RenderContext();
			renderState.mrt = mrt;

			callDepthStates.set( callDepth, renderState );

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

		this._renderContexts = new Map();
		this._defaultRenderContexts = new Map();

	}

}

export default RenderContexts;
