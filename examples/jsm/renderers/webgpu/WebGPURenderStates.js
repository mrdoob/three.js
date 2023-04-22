import WebGPUWeakMap from './WebGPUWeakMap.js';

class WebGPURenderState {

	constructor() {

		this.depth = true;
		this.stencil = true;

		// defined by renderer(backend)

		this.descriptorGPU = null;
		this.encoderGPU = null;
		this.currentPassGPU = null;

	}

}

class WebGPURenderStates {

	constructor() {

		this.renderStates = new WebGPUWeakMap();

	}

	get( scene, camera ) {

		const chainKey = [ scene, camera ];

		let renderState = this.renderStates.get( chainKey );

		if ( renderState === undefined ) {

			renderState = new WebGPURenderState();

			this.renderStates.set( chainKey, renderState );

		}

		return renderState;

	}

	dispose() {

		this.renderStates = new WebGPUWeakMap();

	}

}

export default WebGPURenderStates;
