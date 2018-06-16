/**
 * @author mrdoob / http://mrdoob.com/
 * @author Aaron Powell / http://lunadigital.tv
 */

import { RGBAFormat, RGBFormat, LinearFilter } from '../constants.js';
import { VideoLoader } from './VideoLoader.js';
import { VideoTexture } from '../textures/VideoTexture.js';
import { DefaultLoadingManager } from './LoadingManager.js';


function VideoTextureLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

Object.assign( VideoTextureLoader.prototype, {

	crossOrigin: 'Anonymous',

	load: function ( url, onLoad, onProgress, onError ) {

		var texture = new VideoTexture();

		var loader = new VideoLoader( this.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.setPath( this.path );

		loader.load( url, function ( image ) {

			texture.image = image;

			texture.minFilter = LinearFilter;
			texture.format = RGBFormat;
			texture.needsUpdate = true;

			if ( onLoad !== undefined ) {

				onLoad( texture );

			}

		}, onProgress, onError );

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


export { VideoTextureLoader };
