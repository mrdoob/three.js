import WebGPUWeakMap from './WebGPUWeakMap.js';
import { lights } from 'three/nodes';

class WebGPURenderState {

	constructor() {

		this.lightsNode = lights( [] );

		this.lightsArray = [];

	}

	init() {

		this.lightsArray.length = 0;

	}

	pushLight( light ) {

		this.lightsArray.push( light );

	}

	getLightsNode() {

		return this.lightsNode.fromLights( this.lightsArray );

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
