import { Texture } from './Texture.js';
import { CubeReflectionMapping } from '../constants.js';

class DataCubeTexture extends Texture {

	constructor( data, width, height ) {

		super( data, CubeReflectionMapping );

		this.isDataCubeTexture = true;
		this.isCubeTexture = true;

		this.image = { data: data, width: width, height: height };

		this.generateMipmaps = false;
		this.flipY = false;
		this.unpackAlignment = 1;

	}

	get images() {

		return this.image;

	}

	set images( value ) {

		this.image = value;

	}

}

export { DataCubeTexture };
