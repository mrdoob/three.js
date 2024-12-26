import ChainMap from './ChainMap.js';
import RenderContext from './RenderContext.js';

/**
 * This module manages the render contexts of the renderer.
 *
 * @private
 */
class RenderContexts {

	/**
	 * Constructs a new render context management component.
	 */
	constructor() {

		/**
		 * A dictionary that manages render contexts in chain maps
		 * for each attachment state.
		 *
		 * @type {Object<String,ChainMap>}
		 */
		this.chainMaps = {};

	}

	/**
	 * Returns a render context for the given scene, camera and render target.
	 *
	 * @param {Scene?} [scene=null] - The scene. The parameter can become `null` e.g. when the renderer clears a render target.
	 * @param {Camera?} [camera=null] - The camera that is used to render the scene. The parameter can become `null` e.g. when the renderer clears a render target.
	 * @param {RenderTarget?} [renderTarget=null] - The active render target.
	 * @return {RenderContext} The render context.
	 */
	get( scene = null, camera = null, renderTarget = null ) {

		const chainKey = [];
		if ( scene !== null ) chainKey.push( scene );
		if ( camera !== null ) chainKey.push( camera );

		if ( chainKey.length === 0 ) {

			chainKey.push( { id: 'default' } );

		}


		let attachmentState;

		if ( renderTarget === null ) {

			attachmentState = 'default';

		} else {

			const format = renderTarget.texture.format;
			const count = renderTarget.textures.length;

			attachmentState = `${ count }:${ format }:${ renderTarget.samples }:${ renderTarget.depthBuffer }:${ renderTarget.stencilBuffer }`;

		}

		const chainMap = this.getChainMap( attachmentState );

		let renderState = chainMap.get( chainKey );

		if ( renderState === undefined ) {

			renderState = new RenderContext();

			chainMap.set( chainKey, renderState );

		}

		if ( renderTarget !== null ) renderState.sampleCount = renderTarget.samples === 0 ? 1 : renderTarget.samples;

		return renderState;

	}

	/**
	 * Returns a chain map for the given attachment state.
	 *
	 * @param {String} attachmentState - The attachment state.
	 * @return {ChainMap} The chain map.
	 */
	getChainMap( attachmentState ) {

		return this.chainMaps[ attachmentState ] || ( this.chainMaps[ attachmentState ] = new ChainMap() );

	}

	/**
	 * Frees internal resources.
	 */
	dispose() {

		this.chainMaps = {};

	}

}

export default RenderContexts;
