import Binding from './Binding.js';

let id = 0;

class SampledTexture extends Binding {

	constructor( name, texture ) {

		super( name );

		this.id = id ++;

		this.texture = texture;
		this.version = texture ? texture.version : 0;
		this.store = false;

		this.isSampledTexture = true;

	}

	get needsBindingsUpdate() {

		const { texture, version } = this;

		return texture.isVideoTexture ? true : version !== texture.version; // @TODO: version === 0 && texture.version > 0 ( add it just to External Textures like PNG,JPG )

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
