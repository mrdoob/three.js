import Binding from './Binding.js';

let id = 0;

class SampledTexture extends Binding {

	constructor( name, texture ) {

		super( name );

		this.id = id ++;

		this.texture = texture;
		this.version = 0;

		this.isSampledTexture = true;

	}

	update() {

		if ( this.version !== this.texture.version ) {

			this.version = this.texture.version;

			return true;

		}

		return false;

	}

}

class WebGPUSampledArrayTexture extends SampledTexture {

	constructor( name, texture ) {

		super( name, texture );

		this.isSampledArrayTexture = true;

	}

}

class WebGPUSampled3DTexture extends SampledTexture {

	constructor( name, texture ) {

		super( name, texture );

		this.isSampled3DTexture = true;

	}

}

class WebGPUSampledCubeTexture extends SampledTexture {

	constructor( name, texture ) {

		super( name, texture );

		this.isSampledCubeTexture = true;

	}

}

export { SampledTexture as WebGPUSampledTexture, WebGPUSampledArrayTexture, WebGPUSampled3DTexture, WebGPUSampledCubeTexture };
