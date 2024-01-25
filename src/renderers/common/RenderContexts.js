import ChainMap from './ChainMap.js';
import RenderContext from './RenderContext.js';

class RenderContexts {

	constructor() {

		this.chainMaps = {};

	}

	get( scene, camera, renderTarget ) {

		const chainKey = [ scene, camera ];

		let attachmentState;

		if ( renderTarget.isCanvasRenderTarget ) {

			attachmentState = `${ renderTarget.samples }:${ renderTarget.depth }:${ renderTarget.stencil }`;

		} else {

			const format = renderTarget.texture.format;
			const count = renderTarget.count;

			attachmentState = `${ count }:${ format }:${ renderTarget.samples }:${ renderTarget.depthBuffer }:${ renderTarget.stencilBuffer }`;

		}

		const chainMap = this.getChainMap( attachmentState );

		let renderState = chainMap.get( chainKey );

		if ( renderState === undefined ) {

			renderState = new RenderContext();

			chainMap.set( chainKey, renderState );

			renderState.sampleCount = renderTarget.samples === 0 ? 1 : renderTarget.samples;
			renderState.depth = renderTarget.depthBuffer;
			renderState.stencil = renderTarget.stencilBuffer;

		}

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
