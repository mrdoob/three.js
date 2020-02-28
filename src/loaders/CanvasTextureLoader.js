/**
 * @author rduboveckij / https://github.com/rduboveckij/
 */

import { Loader } from "./Loader";
import { RGBAFormat, RGBFormat } from '../constants.js';
import { CanvasTexture } from '../textures/CanvasTexture.js';
import { ImageBitmapLoader } from './ImageBitmapLoader.js';

function CanvasTextureLoader( manager ) {

	Loader.call( this, manager );

	this.options = undefined;

}

CanvasTextureLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

	constructor: CanvasTextureLoader,

	setOptions: function setOptions( options ) {

		this.options = options;

		return this;

	},
	load: function ( url, onLoad, onProgress, onError ) {

		var texture = new CanvasTexture();
		texture.needsUpdate = false;

		var loader = new ImageBitmapLoader( this.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.setPath( this.path );
		loader.setOptions( this.options );

		loader.load( url, function ( image ) {

			texture.image = image;

			// JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
			var isJPEG = url.search( /\.jpe?g($|\?)/i ) > 0 || url.search( /^data\:image\/jpeg/ ) === 0;

			texture.format = isJPEG ? RGBFormat : RGBAFormat;
			texture.needsUpdate = true;

			if ( onLoad !== undefined ) {

				onLoad( texture );

			}

		}, onProgress, onError );

		return texture;

	}

} );


export { CanvasTextureLoader };
