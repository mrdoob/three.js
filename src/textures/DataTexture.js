import { Texture } from './Texture.js';
import { NearestFilter } from '../constants.js';

class DataTexture extends Texture {

	constructor( data = null, width = 1, height = 1, format, type, mapping, wrapS, wrapT, magFilter = NearestFilter, minFilter = NearestFilter, anisotropy, encoding ) {

		super( null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding );

		this.image = { data: data, width: width, height: height };

		this.generateMipmaps = false;
		this.flipY = false;
		this.unpackAlignment = 1;

	}

}

DataTexture.prototype.isDataTexture = true;

export { DataTexture };
