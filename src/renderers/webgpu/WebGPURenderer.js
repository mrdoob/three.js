import Renderer from '../common/Renderer.js';
import Info from '../common/Info.js';
import WebGLBackend from '../webgl-fallback/WebGLBackend.js';
import WebGPUBackend from './WebGPUBackend.js';
import StandardNodeLibrary from './nodes/StandardNodeLibrary.js';
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

		if ( parameters.forceWebGL ) {

			BackendClass = WebGLBackend;

		} else {

			BackendClass = WebGPUBackend;

			parameters.getFallback = () => {

				console.warn( 'THREE.WebGPURenderer: WebGPU is not available, running under WebGL2 backend.' );

				this.info = new Info( 'webgl' );

				return new WebGLBackend( parameters );

			};

		}

		const backend = new BackendClass( parameters );

		//super( new Proxy( backend, debugHandler ) );
		super( backend, parameters );

		this.library = new StandardNodeLibrary();

		this.isWebGPURenderer = true;

		this.info = new Info( BackendClass instanceof WebGPUBackend ? 'webgpu' : 'webgl' );

	}

}

export default WebGPURenderer;
