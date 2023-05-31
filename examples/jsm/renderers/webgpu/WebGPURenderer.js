import Renderer from '../common/Renderer.js';
import WebGPUBackend from './WebGPUBackend.js';
/*
const debugHandler = {

	get: function ( target, name ) {

		// Add |update
		if ( /^(create|destroy)/.test( name ) ) console.log( 'WebGPUBackend.' + name );

		return target[ name ];

	}

};
*/
class WebGPURenderer extends Renderer {

	constructor( parameters = {} ) {

		const backend = new WebGPUBackend( parameters );
		//const backend = new Proxy( new WebGPUBackend( parameters ), debugHandler );

		super( backend );

		this.isWebGPURenderer = true;

	}

}

export default WebGPURenderer;
