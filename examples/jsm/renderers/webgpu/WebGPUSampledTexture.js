import WebGPUBinding from './WebGPUBinding.js';

class WebGPUSampledTexture extends WebGPUBinding {

	constructor() {

		super();

		this.type = 'sampled-texture';
		this.visibility = GPUShaderStage.FRAGMENT;

		this.textureGPU = null; // set by the renderer

		Object.defineProperty( this, 'isSampledTexture', { value: true } );

	}

}

export default WebGPUSampledTexture;
