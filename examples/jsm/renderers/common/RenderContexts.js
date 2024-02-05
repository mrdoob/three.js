import ChainMap from './ChainMap.js';
import RenderContext from './RenderContext.js';

class RenderContexts {

	constructor() {

		this.chainMaps = {};

	}

	get( scene, camera, renderTarget = null ) {

		const chainKey = [ scene, camera ];

		let attachmentState;

		if ( renderTarget === null ) {

			attachmentState = 'default';

		} else {

			let format, count;

			if ( renderTarget.isWebGLMultipleRenderTargets ) {

				format = renderTarget.texture[ 0 ].format;
				count = renderTarget.texture.length;

			} else {

				format = renderTarget.texture.format;
				count = 1;

			}

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
