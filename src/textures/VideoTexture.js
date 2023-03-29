import { LinearFilter } from '../constants.js';
import { Texture } from './Texture.js';

function updateVideo() {

	this.needsUpdate = true;
	this._callbackHandle = this.image.requestVideoFrameCallback( this._videoFrameCallback );

}

class VideoTexture extends Texture {

	constructor( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		super( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		this.isVideoTexture = true;

		this.minFilter = minFilter !== undefined ? minFilter : LinearFilter;
		this.magFilter = magFilter !== undefined ? magFilter : LinearFilter;

		this.generateMipmaps = false;

		this._videoFrameCallback = updateVideo.bind( this );
		this._callbackHandle = null;

		this.image = video;

	}

	get image() {

		return this.source.data;

	}

	set image( video = null ) {

		if ( this._callbackHandle !== null ) {

			this.image.cancelVideoFrameCallback( this._callbackHandle );
			this._callbackHandle = null;

		}

		this.source.data = video;

		if ( video !== null && video.requestVideoFrameCallback !== undefined ) {

			this._videoFrameCallback();

		}

	}

	clone() {

		return new this.constructor( this.image ).copy( this );

	}

	update() {

		const video = this.image;

		if ( video !== null && this._callbackHandle === null && video.readyState >= video.HAVE_CURRENT_DATA ) {

			this.needsUpdate = true;

		}

	}

}

export { VideoTexture };
