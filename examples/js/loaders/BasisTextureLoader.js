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
THREE.BasisTextureLoader = function ( manager ) {

	THREE.Loader.call( this, manager );

  this.useAlpha = true;
	this.transcoderPath = '';
	this.transcoderBinary = null;
	this.transcoderPending = null;

	this.workerLimit = 4;
	this.workerPool = [];
	this.workerNextTaskID = 1;
	this.workerSourceURL = '';
	this.workerConfig = {
    format: null,
    useAlpha: true,
    astcSupported: false,
		etcSupported: false,
		dxtSupported: false,
    pvrtcSupported: false,
	};

};

THREE.BasisTextureLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

	constructor: THREE.BasisTextureLoader,

	setTranscoderPath: function ( path ) {

		this.transcoderPath = path;

		return this;

	},

	setWorkerLimit: function ( workerLimit ) {

		this.workerLimit = workerLimit;

		return this;

	},

	detectSupport: function ( renderer ) {

		var config = this.workerConfig;

    config.astcSupported = !! renderer.extensions.get( 'WEBGL_compressed_texture_astc' );
		config.etcSupported = !! renderer.extensions.get( 'WEBGL_compressed_texture_etc1' );
		config.dxtSupported = !! renderer.extensions.get( 'WEBGL_compressed_texture_s3tc' );
		config.pvrtcSupported = !! renderer.extensions.get( 'WEBGL_compressed_texture_pvrtc' )
      || !! renderer.extensions.get( 'WEBKIT_WEBGL_compressed_texture_pvrtc' );

    if (config.astcSupported) {

      config.format = THREE.BasisTextureLoader.BASIS_FORMAT.cTFASTC_4x4;

    } else if ( config.dxtSupported ) {

			config.format = this.useAlpha ? THREE.BasisTextureLoader.BASIS_FORMAT.cTFBC3 : THREE.BasisTextureLoader.BASIS_FORMAT.cTFBC1;

		} else if ( config.pvrtcSupported ) {

			config.format = this.useAlpha ? THREE.BasisTextureLoader.BASIS_FORMAT.cTFPVRTC1_4_RGBA : THREE.BasisTextureLoader.BASIS_FORMAT.cTFPVRTC1_4_RGB;

    } else if ( config.etcSupported ) {

			config.format = THREE.BasisTextureLoader.BASIS_FORMAT.cTFETC1;

		} else {

			throw new Error( 'THREE.BasisTextureLoader: No suitable compressed texture format found.' );

		}

		return this;

	},

	load: function ( url, onLoad, onProgress, onError ) {

		var loader = new THREE.FileLoader( this.manager );

		loader.setResponseType( 'arraybuffer' );

		loader.load( url, ( buffer ) => {

			this._createTexture( buffer )
				.then( onLoad )
				.catch( onError );

		}, onProgress, onError );

	},

	/**
	 * @param  {ArrayBuffer} buffer
	 * @return {Promise<THREE.CompressedTexture>}
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

				var { width, height, hasAlpha, mipmaps } = message;

				var texture;

        switch(config.format) {
          case THREE.BasisTextureLoader.BASIS_FORMAT.cTFASTC_4x4:
            texture = new THREE.CompressedTexture( mipmaps, width, height, THREE.BasisTextureLoader.COMPRESSED_RGBA_ASTC_4x4_KHR );
            break;
          case THREE.BasisTextureLoader.BASIS_FORMAT.cTFBC1:
          case THREE.BasisTextureLoader.BASIS_FORMAT.cTFBC3:
            texture = new THREE.CompressedTexture( mipmaps, width, height, THREE.BasisTextureLoader.DXT_FORMAT_MAP[ config.format ], THREE.UnsignedByteType );
            break;
          case THREE.BasisTextureLoader.BASIS_FORMAT.cTFETC1:
            texture = new THREE.CompressedTexture( mipmaps, width, height, THREE.RGB_ETC1_Format );
            break;
          case THREE.BasisTextureLoader.BASIS_FORMAT.cTFPVRTC1_4_RGB:
            texture = new THREE.CompressedTexture( mipmaps, width, height, THREE.RGB_PVRTC_4BPPV1_Format );
            break;
          case THREE.BasisTextureLoader.BASIS_FORMAT.cTFPVRTC1_4_RGBA:
            texture = new THREE.CompressedTexture( mipmaps, width, height, THREE.RGBA_PVRTC_4BPPV1_Format );
            break;
          default:
              throw new Error( 'THREE.BasisTextureLoader: No supported format available.' );
        }

				texture.minFilter = mipmaps.length === 1 ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
				texture.magFilter = THREE.LinearFilter;
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
			var jsLoader = new THREE.FileLoader( this.manager );
			jsLoader.setPath( this.transcoderPath );
			var jsContent = new Promise( ( resolve, reject ) => {

				jsLoader.load( 'basis_transcoder.js', resolve, undefined, reject );

			} );

			// Load transcoder WASM binary.
			var binaryLoader = new THREE.FileLoader( this.manager );
			binaryLoader.setPath( this.transcoderPath );
			binaryLoader.setResponseType( 'arraybuffer' );
			var binaryContent = new Promise( ( resolve, reject ) => {

				binaryLoader.load( 'basis_transcoder.wasm', resolve, undefined, reject );

			} );

			this.transcoderPending = Promise.all( [ jsContent, binaryContent ] )
				.then( ( [ jsContent, binaryContent ] ) => {

					var fn = THREE.BasisTextureLoader.BasisWorker.toString();

					var body = [
						'/* basis_transcoder.js */',
						jsContent,
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

        this.workerConfig.useAlpha = this.useAlpha;
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

} );

/* CONSTANTS */

THREE.BasisTextureLoader.BASIS_FORMAT = {
	cTFETC1: 0,
	cTFETC2: 1,
	cTFBC1: 2,
	cTFBC3: 3,
	cTFBC4: 4,
	cTFBC5: 5,
	cTFBC7_M6_OPAQUE_ONLY: 6,
  cTFBC7_M5: 7,
  cTFPVRTC1_4_RGB: 8,
  cTFPVRTC1_4_RGBA: 9,
  cTFASTC_4x4: 10,
  cTFATC_RGB: 11,
  cTFATC_RGBA_INTERPOLATED_ALPHA: 12,
  cTFRGBA32: 13,
  cTFRGB565: 14,
  cTFBGR565: 15,
  cTFRGBA4444: 16,
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

// ASTC formats, from:
// https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_astc/
THREE.BasisTextureLoader.COMPRESSED_RGBA_ASTC_4x4_KHR = 0x93B0;

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

					try {

						var { width, height, hasAlpha, mipmaps } = transcode( message.buffer );

						var buffers = [];

						for ( var i = 0; i < mipmaps.length; ++ i ) {

							buffers.push( mipmaps[ i ].data.buffer );

						}

						self.postMessage( { type: 'transcode', id: message.id, width, height, hasAlpha, mipmaps }, buffers );

					} catch ( error ) {

						console.error( error );

						self.postMessage( { type: 'error', id: message.id, error: error.message } );

					}

				} );
				break;

		}

	};

	function init( wasmBinary ) {

    var m;
    transcoderPending = new Promise( ( resolve ) => {

      m = { wasmBinary, onRuntimeInitialized: resolve };
			BASIS(m);

		} ).then( () => {

      var { BasisFile, initializeBasis } = m;

			_BasisFile = BasisFile;

			initializeBasis();

		} );

	}

	function transcode( buffer ) {

		var basisFile = new _BasisFile( new Uint8Array( buffer ) );

		var width = basisFile.getImageWidth( 0, 0 );
		var height = basisFile.getImageHeight( 0, 0 );
    var levels = basisFile.getNumLevels( 0 );
    var hasAlpha = basisFile.getHasAlpha();

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
        config.useAlpha,
				0
			);

			if ( ! status ) {

				cleanup();
				throw new Error( 'THREE.BasisTextureLoader: .transcodeImage failed.' );

			}

			mipmaps.push( { data: dst, width: mipWidth, height: mipHeight } );

		}

		cleanup();

		return { width, height, hasAlpha, mipmaps };

	}

};