import { Texture } from './Texture.js';
import { NearestFilter } from '../constants.js';

class FramebufferTexture extends Texture {

	constructor( width, height, format ) {

		super( { width, height } );

		this.format = format;

		this.magFilter = NearestFilter;
		this.minFilter = NearestFilter;

		this.generateMipmaps = false;

		this.needsUpdate = true;

	}

}

FramebufferTexture.prototype.isFramebufferTexture = true;

export { FramebufferTexture };
