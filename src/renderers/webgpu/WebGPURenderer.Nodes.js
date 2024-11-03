import Renderer from '../common/Renderer.js';
import WebGLBackend from '../webgl-fallback/WebGLBackend.js';
import WebGPUBackend from './WebGPUBackend.js';
import BasicNodeLibrary from './nodes/BasicNodeLibrary.js';

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

		super( backend, parameters );

		this.library = new BasicNodeLibrary();

		this.isWebGPURenderer = true;

	}

}

export default WebGPURenderer;
