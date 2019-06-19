/**
 * @author Don McCurdy / https://www.donmccurdy.com
 * @author Austin Eng / https://github.com/austinEng
 * @author Shrek Shao / https://github.com/shrekshao
 */

import {
	CompressedTexture,
	DefaultLoadingManager,
	FileLoader,
	LinearFilter,
	LinearMipMapLinearFilter,
	RGB_ETC1_Format,
	RGB_PVRTC_4BPPV1_Format,
	UnsignedByteType
} from "../../../build/three.module.js";

/* global Module, createBasisModule */

/**
 * Loader for Basis Universal GPU Texture Codec.
 *
 * Basis Universal is a "supercompressed" GPU texture and texture video
 * compression system that outputs a highly compressed intermediate file format
 * (.basis) that can be quickly transcoded to a wide variety of GPU texture
 * compression formats.
 *
 * This loader parallelizes the transcoding process across a configurable number
 * of web workers, before transferring the transcoded compressed texture back
 * to the main thread.
 */
var BasisTextureLoader = function ( manager ) {

	this.manager = manager || DefaultLoadingManager;

	this.crossOrigin = 'anonymous';

	this.transcoderPath = '';
	this.transcoderBinary = null;
	this.transcoderPending = null;

	this.workerLimit = 4;
	this.workerPool = [];
	this.workerNextTaskID = 1;
	this.workerSourceURL = '';
	this.workerConfig = {
		format: null,
		etcSupported: false,
		dxtSupported: false,
		pvrtcSupported: false,
	};

};

BasisTextureLoader.prototype = {

	constructor: BasisTextureLoader,

	setCrossOrigin: function ( crossOrigin ) {

		this.crossOrigin = crossOrigin;

		return this;

	},

	setTranscoderPath: function ( path ) {

		this.transcoderPath = path;

		return this;

	},

	setWorkerLimit: function ( workerLimit ) {

		this.workerLimit = workerLimit;

		return this;

	},

	detectSupport: function ( renderer ) {

		var context = renderer.context;
		var config = this.workerConfig;

		config.etcSupported = !! context.getExtension( 'WEBGL_compressed_texture_etc1' );
		config.dxtSupported = !! context.getExtension( 'WEBGL_compressed_texture_s3tc' );
		config.pvrtcSupported = !! context.getExtension( 'WEBGL_compressed_texture_pvrtc' )
			|| !! context.getExtension( 'WEBKIT_WEBGL_compressed_texture_pvrtc' );

		if ( config.etcSupported ) {

			config.format = BasisTextureLoader.BASIS_FORMAT.cTFETC1;

		} else if ( config.dxtSupported ) {

			config.format = BasisTextureLoader.BASIS_FORMAT.cTFBC1;

		} else if ( config.pvrtcSupported ) {

			config.format = BasisTextureLoader.BASIS_FORMAT.cTFPVRTC1_4_OPAQUE_ONLY;

		} else {

			throw new Error( 'THREE.BasisTextureLoader: No suitable compressed texture format found.' );

		}

		return this;

	},

	load: function ( url, onLoad, onProgress, onError ) {

		var loader = new FileLoader( this.manager );

		loader.setResponseType( 'arraybuffer' );

		loader.load( url, ( buffer ) => {

			this._createTexture( buffer )
				.then( onLoad )
				.catch( onError );

		}, onProgress, onError );

	},

	/**
	 * @param  {ArrayBuffer} buffer
	 * @return {Promise<CompressedTexture>}
	 */
	_createTexture: function ( buffer ) {

		var worker;
		var taskID;

		var texturePending = this._getWorker()
			.then( ( _worker ) => {

				worker = _worker;
				taskID = this.workerNextTaskID ++;

				return new Promise( ( resolve, reject ) => {

					worker._callbacks[ taskID ] = { resolve, reject };
					worker._taskCosts[ taskID ] = buffer.byteLength;
					worker._taskLoad += worker._taskCosts[ taskID ];

					worker.postMessage( { type: 'transcode', id: taskID, buffer }, [ buffer ] );

				} );

			} )
			.then( ( message ) => {

				var config = this.workerConfig;

				var { width, height, mipmaps } = message;

				var texture;

				if ( config.etcSupported ) {

					texture = new CompressedTexture( mipmaps, width, height, RGB_ETC1_Format );

				} else if ( config.dxtSupported ) {

					texture = new CompressedTexture( mipmaps, width, height, BasisTextureLoader.DXT_FORMAT_MAP[ config.format ], UnsignedByteType );

				} else if ( config.pvrtcSupported ) {

					texture = new CompressedTexture( mipmaps, width, height, RGB_PVRTC_4BPPV1_Format );

				} else {

					throw new Error( 'THREE.BasisTextureLoader: No supported format available.' );

				}

				texture.minFilter = mipmaps.length === 1 ? LinearFilter : LinearMipMapLinearFilter;
				texture.magFilter = LinearFilter;
				texture.generateMipmaps = false;
				texture.needsUpdate = true;

				return texture;

			} );

		texturePending
			.finally( () => {

				if ( worker && taskID ) {

					worker._taskLoad -= worker._taskCosts[ taskID ];
					delete worker._callbacks[ taskID ];
					delete worker._taskCosts[ taskID ];

				}

			} );

		return texturePending;

	},

	_initTranscoder: function () {

		if ( ! this.transcoderBinary ) {

			// Load transcoder wrapper.
			var jsLoader = new FileLoader( this.manager );
			jsLoader.setPath( this.transcoderPath );
			var jsContent = new Promise( ( resolve, reject ) => {

				jsLoader.load( 'basis_transcoder.js', resolve, undefined, reject );

			} );

			// Load transcoder WASM binary.
			var binaryLoader = new FileLoader( this.manager );
			binaryLoader.setPath( this.transcoderPath );
			binaryLoader.setResponseType( 'arraybuffer' );
			var binaryContent = new Promise( ( resolve, reject ) => {

				binaryLoader.load( 'basis_transcoder.wasm', resolve, undefined, reject );

			} );

			this.transcoderPending = Promise.all( [ jsContent, binaryContent ] )
				.then( ( [ jsContent, binaryContent ] ) => {

					var fn = BasisTextureLoader.BasisWorker.toString();

					var body = [
						'/* basis_transcoder.js */',
						'var Module;',
						'function createBasisModule () {',
						'  ' + jsContent,
						'  return Module;',
						'}',
						'',
						'/* worker */',
						fn.substring( fn.indexOf( '{' ) + 1, fn.lastIndexOf( '}' ) )
					].join( '\n' );

					this.workerSourceURL = URL.createObjectURL( new Blob( [ body ] ) );
					this.transcoderBinary = binaryContent;

				} );

		}

		return this.transcoderPending;

	},

	_getWorker: function () {

		return this._initTranscoder().then( () => {

			if ( this.workerPool.length < this.workerLimit ) {

				var worker = new Worker( this.workerSourceURL );

				worker._callbacks = {};
				worker._taskCosts = {};
				worker._taskLoad = 0;

				worker.postMessage( {
					type: 'init',
					config: this.workerConfig,
					transcoderBinary: this.transcoderBinary,
				} );

				worker.onmessage = function ( e ) {

					var message = e.data;

					switch ( message.type ) {

						case 'transcode':
							worker._callbacks[ message.id ].resolve( message );
							break;

						case 'error':
							worker._callbacks[ message.id ].reject( message );
							break;

						default:
							console.error( 'THREE.BasisTextureLoader: Unexpected message, "' + message.type + '"' );

					}

				};

				this.workerPool.push( worker );

			} else {

				this.workerPool.sort( function ( a, b ) {

					return a._taskLoad > b._taskLoad ? - 1 : 1;

				} );

			}

			return this.workerPool[ this.workerPool.length - 1 ];

		} );

	},

	dispose: function () {

		for ( var i = 0; i < this.workerPool.length; i ++ ) {

			this.workerPool[ i ].terminate();

		}

		this.workerPool.length = 0;

		return this;

	}
};

/* CONSTANTS */

BasisTextureLoader.BASIS_FORMAT = {
	cTFETC1: 0,
	cTFBC1: 1,
	cTFBC4: 2,
	cTFPVRTC1_4_OPAQUE_ONLY: 3,
	cTFBC7_M6_OPAQUE_ONLY: 4,
	cTFETC2: 5,
	cTFBC3: 6,
	cTFBC5: 7,
};

// DXT formats, from:
// http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
BasisTextureLoader.DXT_FORMAT = {
	COMPRESSED_RGB_S3TC_DXT1_EXT: 0x83F0,
	COMPRESSED_RGBA_S3TC_DXT1_EXT: 0x83F1,
	COMPRESSED_RGBA_S3TC_DXT3_EXT: 0x83F2,
	COMPRESSED_RGBA_S3TC_DXT5_EXT: 0x83F3,
};
BasisTextureLoader.DXT_FORMAT_MAP = {};
BasisTextureLoader.DXT_FORMAT_MAP[ BasisTextureLoader.BASIS_FORMAT.cTFBC1 ] =
	BasisTextureLoader.DXT_FORMAT.COMPRESSED_RGB_S3TC_DXT1_EXT;
BasisTextureLoader.DXT_FORMAT_MAP[ BasisTextureLoader.BASIS_FORMAT.cTFBC3 ] =
	BasisTextureLoader.DXT_FORMAT.COMPRESSED_RGBA_S3TC_DXT5_EXT;

/* WEB WORKER */

BasisTextureLoader.BasisWorker = function () {

	var config;
	var transcoderPending;
	var _BasisFile;

	onmessage = function ( e ) {

		var message = e.data;

		switch ( message.type ) {

			case 'init':
				config = message.config;
				init( message.transcoderBinary );
				break;

			case 'transcode':
				transcoderPending.then( () => {

					try {

						var { width, height, mipmaps } = transcode( message.buffer );

						var buffers = [];

						for ( var i = 0; i < mipmaps.length; ++ i ) {

							buffers.push( mipmaps[ i ].data.buffer );

						}

						self.postMessage( { type: 'transcode', id: message.id, width, height, mipmaps }, buffers );

					} catch ( error ) {

						console.error( error );

						self.postMessage( { type: 'error', id: message.id, error: error.message } );

					}

				} );
				break;

		}

	};

	function init( wasmBinary ) {

		transcoderPending = new Promise( ( resolve ) => {

			// The 'Module' global is used by the Basis wrapper, which will check for
			// the 'wasmBinary' property before trying to load the file itself.

			// TODO(donmccurdy): This only works with a modified version of the
			// emscripten-generated wrapper. The default seems to have a bug making it
			// impossible to override the WASM binary.
			Module = { wasmBinary, onRuntimeInitialized: resolve };

		} ).then( () => {

			var { BasisFile, initializeBasis } = Module;

			_BasisFile = BasisFile;

			initializeBasis();

		} );

		createBasisModule();

	}

	function transcode( buffer ) {

		var basisFile = new _BasisFile( new Uint8Array( buffer ) );

		var width = basisFile.getImageWidth( 0, 0 );
		var height = basisFile.getImageHeight( 0, 0 );
		var levels = basisFile.getNumLevels( 0 );

		function cleanup() {

			basisFile.close();
			basisFile.delete();

		}

		if ( ! width || ! height || ! levels ) {

			cleanup();
			throw new Error( 'THREE.BasisTextureLoader:  Invalid .basis file' );

		}

		if ( ! basisFile.startTranscoding() ) {

			cleanup();
			throw new Error( 'THREE.BasisTextureLoader: .startTranscoding failed' );

		}

		if ( basisFile.getHasAlpha() ) {

			console.warn( 'THREE.BasisTextureLoader: Alpha not yet implemented.' );

		}

		var mipmaps = [];

		for ( var mip = 0; mip < levels; mip ++ ) {

			var mipWidth = basisFile.getImageWidth( 0, mip );
			var mipHeight = basisFile.getImageHeight( 0, mip );
			var dst = new Uint8Array( basisFile.getImageTranscodedSizeInBytes( 0, mip, config.format ) );

			var status = basisFile.transcodeImage(
				dst,
				0,
				mip,
				config.format,
				config.etcSupported ? 0 : ( config.dxtSupported ? 1 : 0 ),
				0
			);

			if ( ! status ) {

				cleanup();
				throw new Error( 'THREE.BasisTextureLoader: .transcodeImage failed.' );

			}

			mipmaps.push( { data: dst, width: mipWidth, height: mipHeight } );

		}

		cleanup();

		return { width, height, mipmaps };

	}

};

export { BasisTextureLoader };
