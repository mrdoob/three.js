/**
 * Handles and keeps track of loaded and pending data. A default global
 * instance of this class is created and used by loaders if not supplied
 * manually.
 *
 * In general that should be sufficient, however there are times when it can
 * be useful to have separate loaders - for example if you want to show
 * separate loading bars for objects and textures.
 *
 * ```js
 * const manager = new THREE.LoadingManager();
 * manager.onLoad = () => console.log( 'Loading complete!' );
 *
 * const loader1 = new OBJLoader( manager );
 * const loader2 = new ColladaLoader( manager );
 * ```
 */
class LoadingManager {

	/**
	 * Constructs a new loading manager.
	 *
	 * @param {Function} [onLoad] - Executes when all items have been loaded.
	 * @param {Function} [onProgress] - Executes when single items have been loaded.
	 * @param {Function} [onError] - Executes when an error occurs.
	 */
	constructor( onLoad, onProgress, onError ) {

		const scope = this;

		let isLoading = false;
		let itemsLoaded = 0;
		let itemsTotal = 0;
		let urlModifier = undefined;
		const handlers = [];

		// Refer to #5689 for the reason why we don't set .onStart
		// in the constructor

		/**
		 * Executes when an item starts loading.
		 *
		 * @type {Function|undefined}
		 * @default undefined
		 */
		this.onStart = undefined;

		/**
		 * Executes when all items have been loaded.
		 *
		 * @type {Function|undefined}
		 * @default undefined
		 */
		this.onLoad = onLoad;

		/**
		 * Executes when single items have been loaded.
		 *
		 * @type {Function|undefined}
		 * @default undefined
		 */
		this.onProgress = onProgress;

		/**
		 * Executes when an error occurs.
		 *
		 * @type {Function|undefined}
		 * @default undefined
		 */
		this.onError = onError;

		/**
		 * This should be called by any loader using the manager when the loader
		 * starts loading an item.
		 *
		 * @param {string} url - The URL to load.
		 */
		this.itemStart = function ( url ) {

			itemsTotal ++;

			if ( isLoading === false ) {

				if ( scope.onStart !== undefined ) {

					scope.onStart( url, itemsLoaded, itemsTotal );

				}

			}

			isLoading = true;

		};

		/**
		 * This should be called by any loader using the manager when the loader
		 * ended loading an item.
		 *
		 * @param {string} url - The URL of the loaded item.
		 */
		this.itemEnd = function ( url ) {

			itemsLoaded ++;

			if ( scope.onProgress !== undefined ) {

				scope.onProgress( url, itemsLoaded, itemsTotal );

			}

			if ( itemsLoaded === itemsTotal ) {

				isLoading = false;

				if ( scope.onLoad !== undefined ) {

					scope.onLoad();

				}

			}

		};

		/**
		 * This should be called by any loader using the manager when the loader
		 * encounters an error when loading an item.
		 *
		 * @param {string} url - The URL of the item that produces an error.
		 */
		this.itemError = function ( url ) {

			if ( scope.onError !== undefined ) {

				scope.onError( url );

			}

		};

		/**
		 * Given a URL, uses the URL modifier callback (if any) and returns a
		 * resolved URL. If no URL modifier is set, returns the original URL.
		 *
		 * @param {string} url - The URL to load.
		 * @return {string} The resolved URL.
		 */
		this.resolveURL = function ( url ) {

			if ( urlModifier ) {

				return urlModifier( url );

			}

			return url;

		};

		/**
		 * If provided, the callback will be passed each resource URL before a
		 * request is sent. The callback may return the original URL, or a new URL to
		 * override loading behavior. This behavior can be used to load assets from
		 * .ZIP files, drag-and-drop APIs, and Data URIs.
		 *
		 * ```js
		 * const blobs = {'fish.gltf': blob1, 'diffuse.png': blob2, 'normal.png': blob3};
		 *
		 * const manager = new THREE.LoadingManager();
		 *
		 * // Initialize loading manager with URL callback.
		 * const objectURLs = [];
		 * manager.setURLModifier( ( url ) => {
		 *
		 * 	url = URL.createObjectURL( blobs[ url ] );
		 * 	objectURLs.push( url );
		 * 	return url;
		 *
		 * } );
		 *
		 * // Load as usual, then revoke the blob URLs.
		 * const loader = new GLTFLoader( manager );
		 * loader.load( 'fish.gltf', (gltf) => {
		 *
		 * 	scene.add( gltf.scene );
		 * 	objectURLs.forEach( ( url ) => URL.revokeObjectURL( url ) );
		 *
		 * } );
		 * ```
		 *
		 * @param {function(string):string} transform - URL modifier callback. Called with an URL and must return a resolved URL.
		 * @return {LoadingManager} A reference to this loading manager.
		 */
		this.setURLModifier = function ( transform ) {

			urlModifier = transform;

			return this;

		};

		/**
		 * Registers a loader with the given regular expression. Can be used to
		 * define what loader should be used in order to load specific files. A
		 * typical use case is to overwrite the default loader for textures.
		 *
		 * ```js
		 * // add handler for TGA textures
		 * manager.addHandler( /\.tga$/i, new TGALoader() );
		 * ```
		 *
		 * @param {string} regex - A regular expression.
		 * @param {Loader} loader - A loader that should handle matched cases.
		 * @return {LoadingManager} A reference to this loading manager.
		 */
		this.addHandler = function ( regex, loader ) {

			handlers.push( regex, loader );

			return this;

		};

		/**
		 * Removes the loader for the given regular expression.
		 *
		 * @param {string} regex - A regular expression.
		 * @return {LoadingManager} A reference to this loading manager.
		 */
		this.removeHandler = function ( regex ) {

			const index = handlers.indexOf( regex );

			if ( index !== - 1 ) {

				handlers.splice( index, 2 );

			}

			return this;

		};

		/**
		 * Can be used to retrieve the registered loader for the given file path.
		 *
		 * @param {string} file - The file path.
		 * @return {?Loader} The registered loader. Returns `null` if no loader was found.
		 */
		this.getHandler = function ( file ) {

			for ( let i = 0, l = handlers.length; i < l; i += 2 ) {

				const regex = handlers[ i ];
				const loader = handlers[ i + 1 ];

				if ( regex.global ) regex.lastIndex = 0; // see #17920

				if ( regex.test( file ) ) {

					return loader;

				}

			}

			return null;

		};

	}

}

/**
 * The global default loading manager.
 *
 * @constant
 * @type {LoadingManager}
 */
const DefaultLoadingManager = /*@__PURE__*/ new LoadingManager();

export { DefaultLoadingManager, LoadingManager };
