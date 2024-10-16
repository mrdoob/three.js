import Renderer from '../common/Renderer.js';
import Info from '../common/Info.js';
import WebGLBackend from '../webgl-fallback/WebGLBackend.js';
import WebGPUBackend from './WebGPUBackend.js';
import BasicNodeLibrary from './nodes/BasicNodeLibrary.js';

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

		super( backend, parameters );

		this.library = new BasicNodeLibrary();

		this.isWebGPURenderer = true;

		this.info = new Info( BackendClass instanceof WebGPUBackend ? 'webgpu' : 'webgl' );

	}

}

export default WebGPURenderer;
