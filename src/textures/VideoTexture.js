import { RGBFormat, LinearFilter } from '../constants.js';
import { Texture } from './Texture.js';

function VideoTexture( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

	Texture.call( this, video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	this.format = format !== undefined ? format : RGBFormat;

	this.minFilter = minFilter !== undefined ? minFilter : LinearFilter;
	this.magFilter = magFilter !== undefined ? magFilter : LinearFilter;

	this.generateMipmaps = false;

	const scope = this;

	function updateVideo() {

		scope.needsUpdate = true;
		video.requestVideoFrameCallback( updateVideo );

	}

	if ( 'requestVideoFrameCallback' in video ) {

		video.requestVideoFrameCallback( updateVideo );

	}

}

VideoTexture.prototype = Object.assign( Object.create( Texture.prototype ), {

	constructor: VideoTexture,

	clone: function () {

		return new this.constructor( this.image ).copy( this );

	},

	isVideoTexture: true,

	update: function () {

		const video = this.image;
		const hasVideoFrameCallback = 'requestVideoFrameCallback' in video;

		if ( hasVideoFrameCallback === false && video.readyState >= video.HAVE_CURRENT_DATA ) {

			this.needsUpdate = true;

		}

	}

} );


export { VideoTexture };
