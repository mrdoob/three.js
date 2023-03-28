import { LinearFilter } from '../constants.js';
import { Texture } from './Texture.js';

class VideoTexture extends Texture {

	constructor( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		super( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		this.isVideoTexture = true;

		this.minFilter = minFilter !== undefined ? minFilter : LinearFilter;
		this.magFilter = magFilter !== undefined ? magFilter : LinearFilter;

		this.generateMipmaps = false;

		this.image = video;

	}

	set image( video = null ) {

		this.source.data = video;

		const scope = this;

		function updateVideo() {

			scope.needsUpdate = true;
			video.requestVideoFrameCallback( updateVideo );

		}

		if ( ( video !== null ) && ( video.requestVideoFrameCallback !== undefined ) ) {

			video.requestVideoFrameCallback( updateVideo );

		}

	}

	clone() {

		return new this.constructor( this.image ).copy( this );

	}

	update() {

		const video = this.image;

		if ( video === null ) return;

		if ( video.requestVideoFrameCallback === undefined && video.readyState >= video.HAVE_CURRENT_DATA ) {

			this.needsUpdate = true;

		}

	}

}

export { VideoTexture };
