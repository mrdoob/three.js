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
	}

	clone() {

		return new this.constructor( this.image ).copy( this );

	}

	update() {

		const video = this.image;
		
		if ( video == null ) {

			this._callbackSource = null;

			return;

		}

		const hasVideoFrameCallback = 'requestVideoFrameCallback' in video;

		if (hasVideoFrameCallback && video !== this._callbackSource) {

			this._callbackSource = video;

			const update = () => {

				this.needsUpdate = true;

				this._callbackSource.requestVideoFrameCallback(update);

			}

			this._callbackSource.requestVideoFrameCallback(update);

			return;

		}

		if ( hasVideoFrameCallback === false && video.readyState >= video.HAVE_CURRENT_DATA ) {

			this.needsUpdate = true;

		}

	}

}

export { VideoTexture };
