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

		this.renderStates = new WeakMap();

	}

	get( scene, /* camera */ ) {

		const renderStates = this.renderStates;

		let renderState = renderStates.get( scene );

		if ( renderState === undefined ) {

			renderState = new WebGPURenderState();
			renderStates.set( scene, renderState );

		}

		return renderState;

	}

	dispose() {

		this.renderStates = new WeakMap();

	}

}

export default WebGPURenderStates;
