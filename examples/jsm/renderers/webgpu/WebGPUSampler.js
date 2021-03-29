import WebGPUBinding from './WebGPUBinding.js';
import { GPUBindingType } from './constants.js';

class WebGPUSampler extends WebGPUBinding {

	constructor( name, texture ) {

		super( name );

		this.texture = texture;

		this.type = GPUBindingType.Sampler;
		this.visibility = GPUShaderStage.FRAGMENT;

		this.samplerGPU = null; // set by the renderer

	}

	getTexture() {

		return this.texture; 

	}

}

WebGPUSampler.prototype.isSampler = true;

export default WebGPUSampler;
