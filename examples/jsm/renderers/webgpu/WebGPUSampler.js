import WebGPUBinding from './WebGPUBinding.js';

class WebGPUSampler extends WebGPUBinding {

	constructor() {

		super();

		this.name = '';

		this.type = 'sampler';
		this.visibility = GPUShaderStage.FRAGMENT;

		this.samplerGPU = null; // set by the renderer

		Object.defineProperty( this, 'isSampler', { value: true } );

	}

	setName( name ) {

		this.name = name;

	}

}

export default WebGPUSampler;
