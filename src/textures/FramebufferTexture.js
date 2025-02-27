import { Texture } from './Texture.js';
import { NearestFilter } from '../constants.js';
import { warnOnce } from '../utils.js';

class FramebufferTexture extends Texture {

	constructor( width, height ) {

		super( { width, height } );

		this.isFramebufferTexture = true;

		this.magFilter = NearestFilter;
		this.minFilter = NearestFilter;

		this.generateMipmaps = false;

		this.needsUpdate = true;

		// @deprecated r170
		warnOnce( 'FramebufferTexture: FramebufferTexture has been deprecated. Use any other texture with copyTextureToTexture, instead.' );

	}

}

export { FramebufferTexture };
