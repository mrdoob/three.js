import { ImageLoader } from './ImageLoader.js';
import { Texture } from '../textures/Texture.js';
import { Loader } from './Loader.js';

class TextureLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const texture = new Texture();

		const loader = new ImageLoader( this.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.setPath( this.path );

		loader.load( url, function ( image ) {

			texture.image = image;
			texture.needsUpdate = true;

			if ( onLoad !== undefined ) {

				onLoad( texture );

			}

			texture.dispatchEvent( { type: 'load' } );

		}, function () {

			// TODO unimplemented in ImageLoader, so this is never called.

			// texture.dispatchEvent( { type: 'progress', percent: ___ } )

		}, function ( event ) {

			if ( onError !== undefined ) {

				onError( event );

			}

			texture.dispatchEvent( { type: 'error', errorEvent: event } );

		} );

		return texture;

	}

}


export { TextureLoader };
