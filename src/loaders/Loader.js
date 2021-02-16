import { DefaultLoadingManager } from './LoadingManager.js';

function Loader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

	this.crossOrigin = 'anonymous';
	this.withCredentials = false;
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

	setWithCredentials: function ( value ) {

		this.withCredentials = value;
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

	},

	setFromFetchOptions: function ( fetchOptions ) {

		const defaultedOptions = Object.assign( {
			credentials: 'same-origin',
			mode: 'cors',
			headers: {},

		}, fetchOptions );

		this.setWithCredentials( defaultedOptions.credentials === 'include' );
		this.setRequestHeader( defaultedOptions.headers );

		if ( defaultedOptions.credentials === 'include' && defaultedOptions.mode === 'cors' ) {

			this.setCrossOrigin( 'use-credentials' );

		} else {

			this.setCrossOrigin( 'anonymous' );

		}

	}

} );

export { Loader };
