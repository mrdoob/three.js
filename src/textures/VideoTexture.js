/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = VideoTexture;

var Texture = require( "./Texture" );

function VideoTexture( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

	Texture.call( this, video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	this.generateMipmaps = false;

	var scope = this;

	function update() {

		requestAnimationFrame( update );

		if ( video.readyState === video.HAVE_ENOUGH_DATA ) {

			scope.needsUpdate = true;

		}

	}

	update();

}

VideoTexture.prototype = Object.create( Texture.prototype );
VideoTexture.prototype.constructor = VideoTexture;
