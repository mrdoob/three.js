import ChainMap from './ChainMap.js';
import RenderContext from './RenderContext.js';

class RenderContexts {

	constructor() {

		this.chainMaps = {};

	}

	get( scene, camera, renderTarget = null ) {

		const chainKey = [ scene, camera ];
		const attachmentState = renderTarget === null ? 'default' : `${renderTarget.texture.format}:${renderTarget.samples}:${renderTarget.depthBuffer}:${renderTarget.stencilBuffer}:`;

		const chainMap = this.getChainMap( attachmentState );

		let renderState = chainMap.get( chainKey );

		if ( renderState === undefined ) {

			renderState = new RenderContext();

			chainMap.set( chainKey, renderState );

		}

		return renderState;

	}

	getChainMap( attachmentState ) {

		return this.chainMaps[ attachmentState ] || ( this.chainMaps[ attachmentState ] = new ChainMap() );

	}

	dispose() {

		this.renderStates = new ChainMap();

	}

}

export default RenderContexts;
