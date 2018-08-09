/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Texture } from './Texture.js';

class VideoTexture extends Texture {

	constructor( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		super( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		this.generateMipmaps = false;

	}

	update() {

		var video = this.image;

		if ( video.readyState >= video.HAVE_CURRENT_DATA ) {

			this.needsUpdate = true;

		}

	}

}

VideoTexture.prototype.isVideoTexture = true;


export { VideoTexture };
