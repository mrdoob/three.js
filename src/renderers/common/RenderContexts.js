import ChainMap from './ChainMap.js';
import RenderContext from './RenderContext.js';

class RenderContexts {

	constructor() {

		this.chainMaps = {};

	}

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

	getChainMap( attachmentState ) {

		return this.chainMaps[ attachmentState ] || ( this.chainMaps[ attachmentState ] = new ChainMap() );

	}

	dispose() {

		this.chainMaps = {};

	}

}

export default RenderContexts;
