/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { _Math } from '../math/Math.js';
import { ImageUtils } from '../extras/ImageUtils.js';

function TextureImage( image ) {

	this.uuid = _Math.generateUUID();

	this.image = image;
	this.version = 0;

}

Object.assign( TextureImage.prototype, {

	toJSON: function ( meta ) {

		var isRootObject = ( meta === undefined || typeof meta === 'string' );

		if ( ! isRootObject && meta.images[ this.uuid ] !== undefined ) {

			return meta.images[ this.uuid ];

		}

		var output = {
			uuid: this.uuid,
			url: ''
		};

		var image = this.image;

		if ( image !== undefined ) {

			var url;

			if ( Array.isArray( image ) ) {

				// process array of images e.g. CubeTexture

				url = [];

				for ( var i = 0, l = image.length; i < l; i ++ ) {

					url.push( ImageUtils.getDataURL( image[ i ] ) );

				}

			} else {

				// process single image

				url = ImageUtils.getDataURL( image );

			}

			output.url = url;

		}

		if ( ! isRootObject ) {

			meta.images[ this.uuid ] = output;

		}

		return output;

	}

} );

export { TextureImage };
