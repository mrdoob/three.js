import { DefaultLoadingManager } from './LoadingManager.js';

/**
 * Abstract base class for loaders.
 *
 * @abstract
 */
class Loader {

	/**
	 * Constructs a new loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		/**
		 * The loading manager.
		 *
		 * @type {LoadingManager}
		 * @default DefaultLoadingManager
		 */
		this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

		/**
		 * The crossOrigin string to implement CORS for loading the url from a
		 * different domain that allows CORS.
		 *
		 * @type {string}
		 * @default 'anonymous'
		 */
		this.crossOrigin = 'anonymous';

		/**
		 * Whether the XMLHttpRequest uses credentials.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.withCredentials = false;

		/**
		 * The base path from which the asset will be loaded.
		 *
		 * @type {string}
		 */
		this.path = '';

		/**
		 * The base path from which additional resources like textures will be loaded.
		 *
		 * @type {string}
		 */
		this.resourcePath = '';

		/**
		 * The [request header]{@link https://developer.mozilla.org/en-US/docs/Glossary/Request_header}
		 * used in HTTP request.
		 *
		 * @type {Object}
		 */
		this.requestHeader = {};

	}

	/**
	 * This method needs to be implemented by all concrete loaders. It holds the
	 * logic for loading assets from the backend.
	 *
	 * @param {string} url - The path/URL of the file to be loaded.
	 * @param {Function} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( /* url, onLoad, onProgress, onError */ ) {}

	/**
	 * A async version of {@link Loader#load}.
	 *
	 * @param {string} url - The path/URL of the file to be loaded.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @return {Promise} A Promise that resolves when the asset has been loaded.
	 */
	loadAsync( url, onProgress ) {

		const scope = this;

		return new Promise( function ( resolve, reject ) {

			scope.load( url, resolve, onProgress, reject );

		} );

	}

	/**
	 * This method needs to be implemented by all concrete loaders. It holds the
	 * logic for parsing the asset into three.js entities.
	 *
	 * @param {any} data - The data to parse.
	 */
	parse( /* data */ ) {}

	/**
	 * Sets the `crossOrigin` String to implement CORS for loading the URL
	 * from a different domain that allows CORS.
	 *
	 * @param {string} crossOrigin - The `crossOrigin` value.
	 * @return {Loader} A reference to this instance.
	 */
	setCrossOrigin( crossOrigin ) {

		this.crossOrigin = crossOrigin;
		return this;

	}

	/**
	 * Whether the XMLHttpRequest uses credentials such as cookies, authorization
	 * headers or TLS client certificates, see [XMLHttpRequest.withCredentials]{@link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials}.
	 *
	 * Note: This setting has no effect if you are loading files locally or from the same domain.
	 *
	 * @param {boolean} value - The `withCredentials` value.
	 * @return {Loader} A reference to this instance.
	 */
	setWithCredentials( value ) {

		this.withCredentials = value;
		return this;

	}

	/**
	 * Sets the base path for the asset.
	 *
	 * @param {string} path - The base path.
	 * @return {Loader} A reference to this instance.
	 */
	setPath( path ) {

		this.path = path;
		return this;

	}

	/**
	 * Sets the base path for dependent resources like textures.
	 *
	 * @param {string} resourcePath - The resource path.
	 * @return {Loader} A reference to this instance.
	 */
	setResourcePath( resourcePath ) {

		this.resourcePath = resourcePath;
		return this;

	}

	/**
	 * Sets the given request header.
	 *
	 * @param {Object} requestHeader - A [request header]{@link https://developer.mozilla.org/en-US/docs/Glossary/Request_header}
	 * for configuring the HTTP request.
	 * @return {Loader} A reference to this instance.
	 */
	setRequestHeader( requestHeader ) {

		this.requestHeader = requestHeader;
		return this;

	}

}

/**
 * Callback for onProgress in loaders.
 *
 *
 * @callback onProgressCallback
 * @param {ProgressEvent} event - An instance of `ProgressEvent` that represents the current loading status.
 */

/**
 * Callback for onError in loaders.
 *
 *
 * @callback onErrorCallback
 * @param {Error} error - The error which occurred during the loading process.
 */

/**
 * The default material name that is used by loaders
 * when creating materials for loaded 3D objects.
 *
 * Note: Not all loaders might honor this setting.
 *
 * @static
 * @type {string}
 * @default '__DEFAULT'
 */
Loader.DEFAULT_MATERIAL_NAME = '__DEFAULT';

export { Loader };
