import { VideoTexture } from './VideoTexture.js';

class VideoFrameTexture extends VideoTexture {

	constructor( mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		super( {}, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	}

	update() {

		// overwrites `VideoTexture.update()` with an empty method since
		// VideoTextureFrame are updated via `setFrame()`.

	}

	setFrame( frame ) {

		this.image = frame;
		this.needsUpdate = true;

	}

}

export { VideoFrameTexture };
