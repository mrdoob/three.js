import { LinearFilter } from '../constants.js';
import { Texture } from './Texture.js';

class VideoTexture extends Texture {

	constructor( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		super( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		this.isVideoTexture = true;

		this.minFilter = minFilter !== undefined ? minFilter : LinearFilter;
		this.magFilter = magFilter !== undefined ? magFilter : LinearFilter;

		this.generateMipmaps = false;

		this.lastImage = null;

		this.update();

	}

	clone() {

		return new this.constructor( this.image ).copy( this );

	}

	update() {

		const video = this.image;
		const hasVideoFrameCallback = 'requestVideoFrameCallback' in video;

		if ( hasVideoFrameCallback === false) {

			if ( video.readyState >= video.HAVE_CURRENT_DATA ) {

				this.needsUpdate = true;

			}

		} else {

			if ( ( video !== this.lastImage ) && ( video !== null ) ) {

				const updateVideo = () => {

					if ( video !== this.image ) return;
					this.needsUpdate = true;
					video.requestVideoFrameCallback( updateVideo );

				};

				this.lastImage = video;

				video.requestVideoFrameCallback( updateVideo );

			}

		}

	}

}

export { VideoTexture };
