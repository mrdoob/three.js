/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Texture } from './Texture.js';

function VideoTexture( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

	Texture.call( this, video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	this.generateMipmaps = false;
	this.frameRate = 30;

}

VideoTexture.prototype = Object.assign( Object.create( Texture.prototype ), {

	constructor: VideoTexture,

	isVideoTexture: true,

	update: ( function () {

		var prevTime = 0;

		return function () {

			var video = this.image;

			if ( video.readyState >= video.HAVE_CURRENT_DATA ) {

				var time = performance.now();

				if ( prevTime + ( 1 / this.frameRate ) < time ) {

					this.needsUpdate = true;
					prevTime = time;

				}

			}

		}

	} )()

} );


export { VideoTexture };
