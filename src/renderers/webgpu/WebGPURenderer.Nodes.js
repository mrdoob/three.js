import Renderer from '../common/Renderer.js';
import WebGPUBackend from './WebGPUBackend.js';
import BasicNodeLibrary from './nodes/BasicNodeLibrary.js';

class WebGPURenderer extends Renderer {

	constructor( parameters = {} ) {

		const backend = new WebGPUBackend( parameters );

		super( backend, parameters );

		this.library = new BasicNodeLibrary();

		this.isWebGPURenderer = true;

	}

}

export default WebGPURenderer;
