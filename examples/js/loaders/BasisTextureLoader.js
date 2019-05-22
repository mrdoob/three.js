/**
 * @author Don McCurdy / https://www.donmccurdy.com
 * @author Austin Eng / https://github.com/austinEng
 * @author Shrek Shao / https://github.com/shrekshao
 */

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
// TODO(donmccurdy): Don't use ES6 classes.
THREE.BasisTextureLoader = class BasisTextureLoader {

	constructor ( manager ) {

		// TODO(donmccurdy): Loading manager is unused.
		this.manager = manager || THREE.DefaultLoadingManager;

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

	}

	setTranscoderPath ( path ) {

		this.transcoderPath = path;

	}

	detectSupport ( renderer ) {

		var context = renderer.context;
		var config = this.workerConfig;

		config.etcSupported = !! context.getExtension('WEBGL_compressed_texture_etc1');
		config.dxtSupported = !! context.getExtension('WEBGL_compressed_texture_s3tc');
		config.pvrtcSupported = !! context.getExtension('WEBGL_compressed_texture_pvrtc')
			|| !! context.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');

		if ( config.etcSupported ) {

			config.format = THREE.BasisTextureLoader.BASIS_FORMAT.cTFETC1;

		} else if ( config.dxtSupported ) {

			config.format = THREE.BasisTextureLoader.BASIS_FORMAT.cTFBC1;

		} else if ( config.pvrtcSupported ) {

			config.format = THREE.BasisTextureLoader.BASIS_FORMAT.cTFPVRTC1_4_OPAQUE_ONLY;

		} else {

			throw new Error( 'THREE.BasisTextureLoader: No suitable compressed texture format found.' );

		}

		return this;

	}

	load ( url, onLoad, onProgress, onError ) {

		// TODO(donmccurdy): Use THREE.FileLoader.
		fetch( url )
			.then( ( res ) => res.arrayBuffer() )
			.then( ( buffer ) => this._createTexture( buffer ) )
			.then( onLoad )
			.catch( onError );

	}

	/**
	 * @param  {ArrayBuffer} buffer
	 * @return {Promise<THREE.CompressedTexture>}
	 */
	_createTexture ( buffer ) {

		return this.getWorker()
			.then( ( worker ) => {

				return new Promise( ( resolve ) => {

					var taskID = this.workerNextTaskID++;

					worker._callbacks[ taskID ] = resolve;
					worker._taskCosts[ taskID ] = buffer.byteLength;
					worker._taskLoad += worker._taskCosts[ taskID ];
					worker._taskCount++;

					worker.postMessage( { type: 'transcode', id: taskID, buffer }, [ buffer ] );

				} );

			} )
			.then( ( message ) => {

				var config = this.workerConfig;

				var { data, width, height } = message;

				var mipmaps = [ { data, width, height } ];

				var texture;

				if ( config.etcSupported ) {

					texture = new THREE.CompressedTexture( mipmaps, width, height, THREE.RGB_ETC1_Format );

				} else if ( config.dxtSupported ) {

					texture = new THREE.CompressedTexture( mipmaps, width, height, THREE.BasisTextureLoader.DXT_FORMAT_MAP[ config.format ], THREE.UnsignedByteType );

				} else if ( config.pvrtcSupported ) {

					texture = new THREE.CompressedTexture( mipmaps, width, height, THREE.RGB_PVRTC_4BPPV1_Format );

				} else {

					throw new Error( 'THREE.BasisTextureLoader: No supported format available.' );

				}

				texture.minFilter = THREE.LinearMipMapLinearFilter;
				texture.magFilter = THREE.LinearFilter;
				texture.encoding = THREE.sRGBEncoding;
				texture.generateMipmaps = false;
				texture.flipY = false;
				texture.needsUpdate = true;

				return texture;

			});

	}

	_initTranscoder () {

		if ( ! this.transcoderBinary ) {

			// TODO(donmccurdy): Use THREE.FileLoader.
			var jsContent = fetch( this.transcoderPath + 'basis_transcoder.js' )
				.then( ( response ) => response.text() );

			var binaryContent = fetch( this.transcoderPath + 'basis_transcoder.wasm' )
				.then( ( response ) => response.arrayBuffer() );

			this.transcoderPending = Promise.all( [ jsContent, binaryContent ] )
				.then( ( [ jsContent, binaryContent ] ) => {

					var fn = THREE.BasisTextureLoader.BasisWorker.toString();

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

	}

	getWorker () {

		return this._initTranscoder().then( () => {

			if ( this.workerPool.length < this.workerLimit ) {

				var worker = new Worker( this.workerSourceURL );

				worker._callbacks = {};
				worker._taskCosts = {};
				worker._taskLoad = 0;
				worker._taskCount = 0;

				worker.postMessage( {
					type: 'init',
					config: this.workerConfig,
					transcoderBinary: this.transcoderBinary,
				} );

				worker.onmessage = function ( e ) {

					var message = e.data;

					switch ( message.type ) {

						case 'transcode':
							worker._callbacks[ message.id ]( message );
							worker._taskLoad -= worker._taskCosts[ message.id ];
							delete worker._callbacks[ message.id ];
							delete worker._taskCosts[ message.id ];
							break;

						default:
							throw new Error( 'THREE.BasisTextureLoader: Unexpected message, "' + message.type + '"' );

					}

				}

				this.workerPool.push( worker );

			} else {

				this.workerPool.sort( function ( a, b ) { return a._taskLoad > b._taskLoad ? -1 : 1; } );

			}

			return this.workerPool[ this.workerPool.length - 1 ];

		} );

	}

	dispose () {

		for ( var i = 0; i < this.workerPool.length; i++ ) {

			this.workerPool[ i ].terminate();

		}

		this.workerPool.length = 0;

	}
}

/* CONSTANTS */

THREE.BasisTextureLoader.BASIS_FORMAT = {
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
THREE.BasisTextureLoader.DXT_FORMAT = {
	COMPRESSED_RGB_S3TC_DXT1_EXT: 0x83F0,
	COMPRESSED_RGBA_S3TC_DXT1_EXT: 0x83F1,
	COMPRESSED_RGBA_S3TC_DXT3_EXT: 0x83F2,
	COMPRESSED_RGBA_S3TC_DXT5_EXT: 0x83F3,
};
THREE.BasisTextureLoader.DXT_FORMAT_MAP = {};
THREE.BasisTextureLoader.DXT_FORMAT_MAP[ THREE.BasisTextureLoader.BASIS_FORMAT.cTFBC1 ] =
	THREE.BasisTextureLoader.DXT_FORMAT.COMPRESSED_RGB_S3TC_DXT1_EXT;
THREE.BasisTextureLoader.DXT_FORMAT_MAP[ THREE.BasisTextureLoader.BASIS_FORMAT.cTFBC3 ] =
	THREE.BasisTextureLoader.DXT_FORMAT.COMPRESSED_RGBA_S3TC_DXT5_EXT;

/* WEB WORKER */

THREE.BasisTextureLoader.BasisWorker = function () {
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

					var { data, width, height } = transcode( message.buffer );

					self.postMessage( { type: 'transcode', id: message.id, data, width, height }, [ data.buffer ] );

				} );
				break;

		}

	};

	function init ( wasmBinary ) {

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

	function transcode ( buffer ) {

		var basisFile = new _BasisFile( new Uint8Array( buffer ) );

		var width = basisFile.getImageWidth( 0, 0 );
		var height = basisFile.getImageHeight( 0, 0 );
		var images = basisFile.getNumImages();
		var levels = basisFile.getNumLevels( 0 );

		function cleanup () {

			basisFile.close();
			basisFile.delete();

		}

		if ( ! width || ! height || ! images || ! levels ) {

			cleanup();
			throw new Error( 'THREE.BasisTextureLoader:  Invalid .basis file' );

		}

		if ( ! basisFile.startTranscoding() ) {

			cleanup();
			throw new Error( 'THREE.BasisTextureLoader: .startTranscoding failed' );

		}

		var dst = new Uint8Array( basisFile.getImageTranscodedSizeInBytes( 0, 0, config.format ) );

		var startTime = performance.now();

		var status = basisFile.transcodeImage(
			dst,
			0,
			0,
			config.format,
			config.etcSupported ? 0 : ( config.dxtSupported ? 1 : 0 ),
			0
		);

		cleanup();

		if ( ! status ) {

			throw new Error( 'THREE.BasisTextureLoader: .transcodeImage failed.' );

		}

		return { data: dst, width, height };

	}

};
