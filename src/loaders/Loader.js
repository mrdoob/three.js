import { DefaultLoadingManager } from './LoadingManager.js';

/**
 * @author alteredq / http://alteredqualia.com/
 */

function Loader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

	this.crossOrigin = 'anonymous';
	this.path = '';
	this.resourcePath = '';
	this.requestHeader = {};

}

Object.assign( Loader.prototype, {

	load: function ( /* url, onLoad, onProgress, onError */ ) {},

	loadAsync: function ( url, onProgress ) {

		const scope = this;

		return new Promise( function ( resolve, reject ) {

			scope.load( url, resolve, onProgress, reject );

		} );

	},

	parse: function ( /* data */ ) {},

	setCrossOrigin: function ( crossOrigin ) {

		this.crossOrigin = crossOrigin;
		return this;

	},

	setPath: function ( path ) {

		this.path = path;
		return this;

	},

	setResourcePath: function ( resourcePath ) {

		this.resourcePath = resourcePath;
		return this;

	},

	setRequestHeader: function ( requestHeader ) {

		this.requestHeader = requestHeader;
		return this;

	}

} );

export { Loader };
