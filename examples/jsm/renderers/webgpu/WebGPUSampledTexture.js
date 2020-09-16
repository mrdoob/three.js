import WebGPUBinding from './WebGPUBinding.js';

class WebGPUSampledTexture extends WebGPUBinding {

	constructor() {

		super();

		this.name = '';

		this.type = 'sampled-texture';
		this.visibility = GPUShaderStage.FRAGMENT;

		this.textureGPU = null; // set by the renderer

		Object.defineProperty( this, 'isSampledTexture', { value: true } );

	}

	setName( name ) {

		this.name = name;

	}

}

export default WebGPUSampledTexture;
