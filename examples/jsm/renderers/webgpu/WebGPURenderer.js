import Renderer from '../universal/Renderer.js';
import WebGPUBackend from './backends/webgpu/WebGPUBackend.js';

class WebGPURenderer extends Renderer {

	constructor( parameters = {} ) {

		const backend = new WebGPUBackend( parameters );

		super( backend );

		this.isWebGPURenderer = true;

	}

}

export default WebGPURenderer;
