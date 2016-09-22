import { ImageLoader } from './ImageLoader';
import { CubeTexture } from '../textures/CubeTexture';
import { DefaultLoadingManager } from './LoadingManager';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function CubeTextureLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

Object.assign( CubeTextureLoader.prototype, {

	load: function ( urls, onLoad, onProgress, onError ) {

		var texture = new CubeTexture();

		var loader = new ImageLoader( this.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.setPath( this.path );

		var loaded = 0;

		function loadTexture( i ) {

			loader.load( urls[ i ], function ( image ) {

				texture.images[ i ] = image;

				loaded ++;

				if ( loaded === 6 ) {

					texture.needsUpdate = true;

					if ( onLoad ) onLoad( texture );

				}

			}, undefined, onError );

		}

		for ( var i = 0; i < urls.length; ++ i ) {

			loadTexture( i );

		}

		return texture;

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;
		return this;

	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	}

} );


export { CubeTextureLoader };
