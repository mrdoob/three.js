import ChainMap from './ChainMap.js';
import RenderContext from './RenderContext.js';
import { Scene } from '../../scenes/Scene.js';

const _chainKeys = [];
const _defaultScene = /*@__PURE__*/ new Scene();

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
		 * @type {Object<string,ChainMap>}
		 */
		this.chainMaps = {};

	}

	/**
	 * Returns a render context for the given scene, render target and MRT config.
	 *
	 * @param {Scene} scene - The scene.
	 * @param {?RenderTarget} [renderTarget=null] - The active render target.
	 * @param {?MRTNode} [mrt=null] - The MRT configuration.
	 * @return {RenderContext} The render context.
	 */
	get( scene, renderTarget = null, mrt = null ) {

		_chainKeys[ 0 ] = scene;

		if ( mrt !== null ) {

			_chainKeys[ 1 ] = mrt;

		}

		let attachmentState;

		if ( renderTarget === null ) {

			attachmentState = 'default';

		} else {

			const format = renderTarget.texture.format;
			const count = renderTarget.textures.length;

			attachmentState = `${ count }:${ format }:${ renderTarget.samples }:${ renderTarget.depthBuffer }:${ renderTarget.stencilBuffer }`;

		}

		const chainMap = this._getChainMap( attachmentState );

		let renderState = chainMap.get( _chainKeys );

		if ( renderState === undefined ) {

			renderState = new RenderContext();

			chainMap.set( _chainKeys, renderState );

		}

		_chainKeys.length = 0;

		if ( renderTarget !== null ) renderState.sampleCount = renderTarget.samples === 0 ? 1 : renderTarget.samples;

		return renderState;

	}

	/**
	 * Returns a render context intended for clear operations.
	 *
	 * @param {?RenderTarget} [renderTarget=null] - The active render target.
	 * @return {RenderContext} The render context.
	 */
	getForClear( renderTarget = null ) {

		return this.get( _defaultScene, renderTarget );

	}

	/**
	 * Returns a chain map for the given attachment state.
	 *
	 * @private
	 * @param {string} attachmentState - The attachment state.
	 * @return {ChainMap} The chain map.
	 */
	_getChainMap( attachmentState ) {

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
