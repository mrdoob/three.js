/**
 * @author mrdoob / http://mrdoob.com/
 */

import { RGBFormat, LinearFilter } from '../constants.js';
import { Texture } from './Texture.js';

function VideoTexture( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

	Texture.call( this, video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	this.format = format !== undefined ? format : RGBFormat;

	this.minFilter = minFilter !== undefined ? minFilter : LinearFilter;
	this.magFilter = magFilter !== undefined ? magFilter : LinearFilter;

	this.generateMipmaps = false;

}

VideoTexture.prototype = Object.assign( Object.create( Texture.prototype ), {

	constructor: VideoTexture,

	isVideoTexture: true,

	update: function () {

		const video = this.image;

		if ( video.readyState >= video.HAVE_CURRENT_DATA ) {

			this.needsUpdate = true;

		}

	}

} );


export { VideoTexture };
