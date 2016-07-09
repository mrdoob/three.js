import { Texture } from './Texture';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function VideoTexture ( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {
	this.isVideoTexture = this.isTexture = true;

	Texture.call( this, video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	this.generateMipmaps = false;

	var scope = this;

	function update() {

		requestAnimationFrame( update );

		if ( video.readyState >= video.HAVE_CURRENT_DATA ) {

			scope.needsUpdate = true;

		}

	}

	update();

};

VideoTexture.prototype = Object.create( Texture.prototype );
VideoTexture.prototype.constructor = VideoTexture;


export { VideoTexture };