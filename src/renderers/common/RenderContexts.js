import NodeHandler from '../../nodes/core/NodeHandler.js';
import ChainMap from './ChainMap.js';
import RenderContext from './RenderContext.js';

const defaultHander = new NodeHandler();

class RenderContexts {

	constructor() {

		this.chainMaps = {};

	}

	get( scene, camera, handler, renderTarget = null ) {

		const chainKey = [ scene, camera, handler || defaultHander ];

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
