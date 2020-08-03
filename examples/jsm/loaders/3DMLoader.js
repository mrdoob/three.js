/**
 * @author Luis Fraguada / https://github.com/fraguada
 */

import {
	BufferAttribute,
	BufferGeometry,
	FileLoader,
	Loader
} from "../../../build/three.module.js";

var Rhino3dmLoader = function ( manager ) {

    Loader.call( this, manager );

	this.libraryPath = '';
	this.libraryPending = null;
	this.libraryBinary = null;

};

Rhino3dmLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

    constructor: Rhino3dmLoader,

    setLibraryPath: function ( path ) {

		this.libraryPath = path;

		return this;

	},

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var path = ( this.path !== undefined ) ? this.path : LoaderUtils.extractUrlBase( url );

		var loader = new FileLoader( scope.manager );

		loader.load( url, function ( text ) {

			try {

				scope.parse( text, path, onLoad, onError );

			} catch ( e ) {

				if ( onError !== undefined ) {

					onError( e );

				} else {

					throw e;

				}

			}

		}, onProgress, onError );

	},

	parse: function ( ) {

		// parsing logic goes here
		console.log('3dm parsing');

	},

	_initLibrary: function () {

		if ( ! this.libraryPending ) {

			// Load transcoder wrapper.
			var jsLoader = new FileLoader( this.manager );
			jsLoader.setPath( this.transcoderPath );
			var jsContent = new Promise( ( resolve, reject ) => {

				jsLoader.load( 'rhino3dm.js', resolve, undefined, reject );

			} );

			// Load transcoder WASM binary.
			var binaryLoader = new FileLoader( this.manager );
			binaryLoader.setPath( this.transcoderPath );
			binaryLoader.setResponseType( 'arraybuffer' );
			var binaryContent = new Promise( ( resolve, reject ) => {

				binaryLoader.load( 'rhino3dm.wasm', resolve, undefined, reject );

			} );

			this.libraryPending = Promise.all( [ jsContent, binaryContent ] )
				.then( ( [ jsContent, binaryContent ] ) => {

					var fn = Rhino3dmLoader.Rhino3dmWorker.toString();

					var body = [
						'/* rhino3dm.js */',
						jsContent,
						'/* worker */',
						fn.substring( fn.indexOf( '{' ) + 1, fn.lastIndexOf( '}' ) )
					].join( '\n' );

					this.workerSourceURL = URL.createObjectURL( new Blob( [ body ] ) );
					this.libraryBinary = binaryContent;

				} );

		}

		return this.libraryPending;

	}
} );

/* WEB WORKER */

Rhino3dmLoader.Rhino3dmWorker = function () {

	var libraryConfig;
	var libraryPending;

	onmessage = function ( e ) {

		var message = e.data;

		switch ( message.type ) {

			case 'init':
				libraryPending = new Promise( function ( resolve/*, reject*/ ) {

					libraryPending.onModuleLoaded = function ( draco ) {

						// Module is Promise-like. Wrap before resolving to avoid loop.
						resolve( { rhino3dm: rhino3dm } );

					};

					DracoDecoderModule( decoderConfig );

				} );
				break;
			case 'decode':
				break;
		}
	}

	function init( wasmBinary ) {

		var rhino3dmModule;
		transcoderPending = new Promise( ( resolve ) => {

			rhino3dmModule = { wasmBinary, onRuntimeInitialized: resolve };
			BASIS( rhino3dmModule );

		} ).then( () => {

			var { BasisFile, initializeBasis } = rhino3dmModule;

			_BasisFile = BasisFile;

			initializeBasis();

		} );

	}

};

export { Rhino3dmLoader };