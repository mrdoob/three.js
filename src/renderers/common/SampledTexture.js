import Binding from './Binding.js';

let _id = 0;

class SampledTexture extends Binding {

	constructor( name, texture ) {

		super( name );

		this.id = _id ++;

		this.texture = texture;
		this.version = texture ? texture.version : 0;
		this.store = false;
		this.generation = null;

		this.isSampledTexture = true;

	}

	needsBindingsUpdate( generation ) {

		const { texture } = this;

		if ( generation !== this.generation ) {

			this.generation = generation;

			return true;

		}

		return texture.isVideoTexture;

	}

	update() {

		const { texture, version } = this;

		if ( version !== texture.version ) {

			this.version = texture.version;

			return true;

		}

		return false;

	}

}

class SampledArrayTexture extends SampledTexture {

	constructor( name, texture ) {

		super( name, texture );

		this.isSampledArrayTexture = true;

	}

}

class Sampled3DTexture extends SampledTexture {

	constructor( name, texture ) {

		super( name, texture );

		this.isSampled3DTexture = true;

	}

}

class SampledCubeTexture extends SampledTexture {

	constructor( name, texture ) {

		super( name, texture );

		this.isSampledCubeTexture = true;

	}

}

export { SampledTexture, SampledArrayTexture, Sampled3DTexture, SampledCubeTexture };
