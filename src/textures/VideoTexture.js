import { LinearFilter } from '../constants.js';
import { Texture } from './Texture.js';

class VideoTexture extends Texture {

	constructor( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		super( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		this.isVideoTexture = true;

		this.minFilter = minFilter !== undefined ? minFilter : LinearFilter;
		this.magFilter = magFilter !== undefined ? magFilter : LinearFilter;

		this.generateMipmaps = false;

		this._callbackSource = null;
		this._callbackId = null;

	}

	clone() {

		return new this.constructor( this.image ).copy( this );

	}

	update() {

		const video = this.image;

		if ( video == null ) {

			if ( this._callbackId !== null && this._callbackSource !== null ) {

				this._callbackSource.cancelVideoFrameCallback( this._callbackId );

			}

			this._callbackSource = null;

			this._callbackId = null;

			return;

		}

		const hasVideoFrameCallback = 'requestVideoFrameCallback' in video;

		if ( hasVideoFrameCallback && video !== this._callbackSource ) {

			if ( this._callbackId !== null && this._callbackSource !== null ) {

				this._callbackSource.cancelVideoFrameCallback( this._callbackId );

			}

			this._callbackSource = video;

			const update = () => {

				this.needsUpdate = true;

				this._callbackId = this._callbackSource.requestVideoFrameCallback( update );

			};

			 this._callbackId = this._callbackSource.requestVideoFrameCallback( update );

			return;

		}

		if ( hasVideoFrameCallback === false && video.readyState >= video.HAVE_CURRENT_DATA ) {

			this.needsUpdate = true;

		}

	}

}

export { VideoTexture };
