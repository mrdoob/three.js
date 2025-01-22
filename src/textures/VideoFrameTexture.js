import { VideoTexture } from './VideoTexture.js';

class VideoFrameTexture extends VideoTexture {

	constructor( mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		super( {}, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		this.isVideoFrameTexture = true;

	}

	update() {

		// overwrites `VideoTexture.update()` with an empty method since
		// this type of texture is updated via `setFrame()`.

	}

	clone() {

		return new this.constructor().copy( this ); // restoring Texture.clone()

	}

	setFrame( frame ) {

		this.image = frame;
		this.needsUpdate = true;

	}

}

export { VideoFrameTexture };
