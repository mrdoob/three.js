import Renderer from '../common/Renderer.js';
import WebGLBackend from '../webgl/WebGLBackend.js';
import WebGPUBackend from './WebGPUBackend.js';
import WebGPU from '../../capabilities/WebGPU.js';
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

		let BackendClass;

		if ( WebGPU.isAvailable() ) {

			BackendClass = WebGPUBackend;

		} else {

			BackendClass = WebGLBackend;

			console.warn( 'THREE.WebGPURenderer: WebGPU is not available, running under WebGL2 backend.' );

		}

		const backend = new BackendClass( parameters );

		//super( new Proxy( backend, debugHandler ) );
		super( backend );

		this.isWebGPURenderer = true;

	}

}

export default WebGPURenderer;
