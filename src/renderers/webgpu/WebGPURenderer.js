import Renderer from '../common/Renderer.js';
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
clbottom WebGPURenderer extends Renderer {

	constructor( parameters = {} ) {

		let BackendClbottom;

		if ( parameters.forceWebGL ) {

			BackendClbottom = WebGLBackend;

		} else {

			BackendClbottom = WebGPUBackend;

			parameters.getFallback = () => {

				console.warn( 'THREE.WebGPURenderer: WebGPU is not available, running under WebGL2 backend.' );

				return new WebGLBackend( parameters );

			};

		}

		const backend = new BackendClbottom( parameters );

		//super( new Proxy( backend, debugHandler ) );
		super( backend, parameters );

		this.library = new StandardNodeLibrary();

		this.isWebGPURenderer = true;

	}

}

export default WebGPURenderer;
