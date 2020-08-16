import { MathUtils } from '../math/MathUtils.js';
import { ImageUtils } from '../extras/ImageUtils.js';

function TextureImage( image ) {

	this.uuid = MathUtils.generateUUID();

	this.image = image;
	this.version = 0;

}

Object.assign( TextureImage.prototype, {

	toJSON: function ( meta ) {

		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		if ( ! isRootObject && meta.images[ this.uuid ] !== undefined ) {

			return meta.images[ this.uuid ];

		}

		const output = {
			uuid: this.uuid,
			url: ''
		};

		const image = this.image;

		if ( image !== undefined ) {

			let url;

			if ( Array.isArray( image ) ) {

				// process array of images e.g. CubeTexture

				url = [];

				for ( let i = 0, l = image.length; i < l; i ++ ) {

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
