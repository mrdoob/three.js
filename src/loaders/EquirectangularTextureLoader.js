/**
 * @author mrdoob / http://mrdoob.com/
 */

import { RGBAFormat, RGBFormat } from '../constants.js';
import { ImageLoader } from './ImageLoader.js';
import { EquirectangularTexture } from '../textures/EquirectangularTexture.js';
import { Loader } from './Loader.js';


function EquirectangularTextureLoader( manager ) {

	Loader.call( this, manager );

}

EquirectangularTextureLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

	constructor: EquirectangularTextureLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		const texture = new EquirectangularTexture();

		const loader = new ImageLoader( this.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.setPath( this.path );

		loader.load( url, function ( image ) {

			texture.image = image;

			// JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
			const isJPEG = url.search( /\.jpe?g($|\?)/i ) > 0 || url.search( /^data\:image\/jpeg/ ) === 0;

			texture.format = isJPEG ? RGBFormat : RGBAFormat;
			texture.needsUpdate = true;

			if ( onLoad !== undefined ) {

				onLoad( texture );

			}

		}, onProgress, onError );

		return texture;

	}

} );


export { EquirectangularTextureLoader };
