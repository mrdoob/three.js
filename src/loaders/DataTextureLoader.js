import { LinearFilter, LinearMipMapLinearFilter, ClampToEdgeWrapping } from '../constants.js';
import { FileLoader } from './FileLoader.js';
import { DataTexture } from '../textures/DataTexture.js';
import { DefaultLoadingManager } from './LoadingManager.js';

/**
 * @author Nikos M. / https://github.com/foo123/
 *
 * Abstract Base class to load generic binary textures formats (rgbe, hdr, ...)
 */

function DataTextureLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

	// override in sub classes
	this._parser = null;

}

Object.assign( DataTextureLoader.prototype, {

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var texture = new DataTexture();

		var loader = new FileLoader( this.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.setPath( this.path );
		loader.load( url, function ( buffer ) {

			var texData = scope._parser( buffer );

			if ( ! texData ) return;

			if ( texData.image !== undefined ) {

				texture.image = texData.image;

			} else if ( texData.data !== undefined ) {

				texture.image.width = texData.width;
				texture.image.height = texData.height;
				texture.image.data = texData.data;

			}

			texture.wrapS = texData.wrapS !== undefined ? texData.wrapS : ClampToEdgeWrapping;
			texture.wrapT = texData.wrapT !== undefined ? texData.wrapT : ClampToEdgeWrapping;

			texture.magFilter = texData.magFilter !== undefined ? texData.magFilter : LinearFilter;
			texture.minFilter = texData.minFilter !== undefined ? texData.minFilter : LinearMipMapLinearFilter;

			texture.anisotropy = texData.anisotropy !== undefined ? texData.anisotropy : 1;

			if ( texData.format !== undefined ) {

				texture.format = texData.format;

			}
			if ( texData.type !== undefined ) {

				texture.type = texData.type;

			}

			if ( texData.mipmaps !== undefined ) {

				texture.mipmaps = texData.mipmaps;

			}

			if ( texData.mipmapCount === 1 ) {

				texture.minFilter = LinearFilter;

			}

			texture.needsUpdate = true;

			if ( onLoad ) onLoad( texture, texData );

		}, onProgress, onError );


		return texture;

	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	}

} );


export { DataTextureLoader };
