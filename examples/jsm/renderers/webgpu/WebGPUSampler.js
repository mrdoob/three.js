import WebGPUBinding from './WebGPUBinding.js';

class WebGPUSampler extends WebGPUBinding {

	constructor() {

		super();

		this.type = 'sampler';
		this.visibility = GPUShaderStage.FRAGMENT;

		this.samplerGPU = null; // set by the renderer

		Object.defineProperty( this, 'isSampler', { value: true } );

	}

}

export default WebGPUSampler;
