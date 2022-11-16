import WebGPUBinding from './WebGPUBinding.js';
import { GPUBindingType, GPUTextureViewDimension } from './constants.js';

class WebGPUSampledTexture extends WebGPUBinding {

	constructor( name, texture ) {

		super( name );

		this.isSampledTexture = true;

		this.texture = texture;

		this.dimension = GPUTextureViewDimension.TwoD;

		this.type = GPUBindingType.SampledTexture;
		this.visibility = GPUShaderStage.FRAGMENT;

		this.textureGPU = null; // set by the renderer

	}

	getTexture() {

		return this.texture;

	}

}

class WebGPUSampledArrayTexture extends WebGPUSampledTexture {

	constructor( name, texture ) {

		super( name, texture );

		this.isSampledArrayTexture = true;

		this.dimension = GPUTextureViewDimension.TwoDArray;

	}

}

class WebGPUSampled3DTexture extends WebGPUSampledTexture {

	constructor( name, texture ) {

		super( name, texture );

		this.isSampled3DTexture = true;

		this.dimension = GPUTextureViewDimension.ThreeD;

	}

}

class WebGPUSampledCubeTexture extends WebGPUSampledTexture {

	constructor( name, texture ) {

		super( name, texture );

		this.isSampledCubeTexture = true;

		this.dimension = GPUTextureViewDimension.Cube;

	}

}

export { WebGPUSampledTexture, WebGPUSampledArrayTexture, WebGPUSampled3DTexture, WebGPUSampledCubeTexture };
