import WebGPUBinding from './WebGPUBinding.js';
import { GPUBindingType, GPUTextureViewDimension } from './constants.js';

class WebGPUSampledTexture extends WebGPUBinding {

	constructor( name, texture ) {

		super( name );

		this.texture = texture;

		this.dimension = GPUTextureViewDimension.TwoD;

		this.type = GPUBindingType.SampledTexture;
		this.visibility = GPUShaderStage.FRAGMENT;

		this.textureGPU = null; // set by the renderer

		Object.defineProperty( this, 'isSampledTexture', { value: true } );

	}


}

class WebGPUSampledArrayTexture extends WebGPUSampledTexture {

	constructor( name ) {

		super( name );

		this.dimension = GPUTextureViewDimension.TwoDArray;

		Object.defineProperty( this, 'isSampledArrayTexture', { value: true } );

	}

}

class WebGPUSampled3DTexture extends WebGPUSampledTexture {

	constructor( name ) {

		super( name );

		this.dimension = GPUTextureViewDimension.ThreeD;

		Object.defineProperty( this, 'isSampled3DTexture', { value: true } );

	}

}

class WebGPUSampledCubeTexture extends WebGPUSampledTexture {

	constructor( name ) {

		super( name );

		this.dimension = GPUTextureViewDimension.Cube;

		Object.defineProperty( this, 'isSampledCubeTexture', { value: true } );

	}

}

export { WebGPUSampledTexture, WebGPUSampledArrayTexture, WebGPUSampled3DTexture, WebGPUSampledCubeTexture };
