import ChainMap from './ChainMap.js';
import RenderContext from './RenderContext.js';

class RenderContexts {

	constructor() {

		this.renderStates = new ChainMap();

	}

	get( scene, camera, renderTarget ) {

		const chainKey = [ scene, camera, renderTarget ];

		let renderState = this.renderStates.get( chainKey );

		if ( renderState === undefined ) {

			renderState = new RenderContext();

			this.renderStates.set( chainKey, renderState );

		}

		return renderState;

	}

	dispose() {

		this.renderStates = new ChainMap();

	}

}

export default RenderContexts;
