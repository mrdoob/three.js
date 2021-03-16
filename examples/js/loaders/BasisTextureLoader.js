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

	this.transcoderPath = '';
	this.transcoderBinary = null;
	this.transcoderPending = null;

	this.workerLimit = 4;
	this.workerPool = [];
	this.workerNextTaskID = 1;
	this.workerSourceURL = '';
	this.workerConfig = null;

};

THREE.BasisTextureLoader.taskCache = new WeakMap();

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

		this.workerConfig = {
			astcSupported: renderer.extensions.has( 'WEBGL_compressed_texture_astc' ),
			etc1Supported: renderer.extensions.has( 'WEBGL_compressed_texture_etc1' ),
			etc2Supported: renderer.extensions.has( 'WEBGL_compressed_texture_etc' ),
			dxtSupported: renderer.extensions.has( 'WEBGL_compressed_texture_s3tc' ),
			bptcSupported: renderer.extensions.has( 'EXT_texture_compression_bptc' ),
			pvrtcSupported: renderer.extensions.has( 'WEBGL_compressed_texture_pvrtc' )
				|| renderer.extensions.has( 'WEBKIT_WEBGL_compressed_texture_pvrtc' )
		};

		return this;

	},

	load: function ( url, onLoad, onProgress, onError ) {

		var loader = new THREE.FileLoader( this.manager );

		loader.setResponseType( 'arraybuffer' );
		loader.setWithCredentials( this.withCredentials );

		var texture = new THREE.CompressedTexture();

		loader.load( url, ( buffer ) => {

			// Check for an existing task using this buffer. A transferred buffer cannot be transferred
			// again from this thread.
			if ( THREE.BasisTextureLoader.taskCache.has( buffer ) ) {

				var cachedTask = THREE.BasisTextureLoader.taskCache.get( buffer );

				return cachedTask.promise.then( onLoad ).catch( onError );

			}

			this._createTexture( [ buffer ] )
				.then( function ( _texture ) {

					texture.copy( _texture );
					texture.needsUpdate = true;

					if ( onLoad ) onLoad( texture );

				} )
				.catch( onError );

		}, onProgress, onError );

		return texture;

	},

	/** Low-level transcoding API, exposed for use by THREE.KTX2Loader. */
	parseInternalAsync: function ( options ) {

		var { levels } = options;

		var buffers = new Set();

		for ( var i = 0; i < levels.length; i ++ ) {

			buffers.add( levels[ i ].data.buffer );

		}

		return this._createTexture( Array.from( buffers ), { ...options, lowLevel: true } );

	},

	/**
	 * @param {ArrayBuffer[]} buffers
	 * @param {object?} config
	 * @return {Promise<THREE.CompressedTexture>}
	 */
	_createTexture: function ( buffers, config ) {

		var worker;
		var taskID;

		var taskConfig = config || {};
		var taskCost = 0;

		for ( var i = 0; i < buffers.length; i ++ ) {

			taskCost += buffers[ i ].byteLength;

		}

		var texturePending = this._allocateWorker( taskCost )
			.then( ( _worker ) => {

				worker = _worker;
				taskID = this.workerNextTaskID ++;

				return new Promise( ( resolve, reject ) => {

					worker._callbacks[ taskID ] = { resolve, reject };

					worker.postMessage( { type: 'transcode', id: taskID, buffers: buffers, taskConfig: taskConfig }, buffers );

				} );

			} )
			.then( ( message ) => {

				var { mipmaps, width, height, format } = message;

				var texture = new THREE.CompressedTexture( mipmaps, width, height, format, THREE.UnsignedByteType );
				texture.minFilter = mipmaps.length === 1 ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
				texture.magFilter = THREE.LinearFilter;
				texture.generateMipmaps = false;
				texture.needsUpdate = true;

				return texture;

			} );

		// Note: replaced '.finally()' with '.catch().then()' block - iOS 11 support (#19416)
		texturePending
			.catch( () => true )
			.then( () => {

				if ( worker && taskID ) {

					worker._taskLoad -= taskCost;
					delete worker._callbacks[ taskID ];

				}

			} );

		// Cache the task result.
		THREE.BasisTextureLoader.taskCache.set( buffers[ 0 ], { promise: texturePending } );

		return texturePending;

	},

	_initTranscoder: function () {

		if ( ! this.transcoderPending ) {

			// Load transcoder wrapper.
			var jsLoader = new THREE.FileLoader( this.manager );
			jsLoader.setPath( this.transcoderPath );
			jsLoader.setWithCredentials( this.withCredentials );
			var jsContent = new Promise( ( resolve, reject ) => {

				jsLoader.load( 'basis_transcoder.js', resolve, undefined, reject );

			} );

			// Load transcoder WASM binary.
			var binaryLoader = new THREE.FileLoader( this.manager );
			binaryLoader.setPath( this.transcoderPath );
			binaryLoader.setResponseType( 'arraybuffer' );
			binaryLoader.setWithCredentials( this.withCredentials );
			var binaryContent = new Promise( ( resolve, reject ) => {

				binaryLoader.load( 'basis_transcoder.wasm', resolve, undefined, reject );

			} );

			this.transcoderPending = Promise.all( [ jsContent, binaryContent ] )
				.then( ( [ jsContent, binaryContent ] ) => {

					var fn = THREE.BasisTextureLoader.BasisWorker.toString();

					var body = [
						'/* constants */',
						'var _EngineFormat = ' + JSON.stringify( THREE.BasisTextureLoader.EngineFormat ),
						'var _TranscoderFormat = ' + JSON.stringify( THREE.BasisTextureLoader.TranscoderFormat ),
						'var _BasisFormat = ' + JSON.stringify( THREE.BasisTextureLoader.BasisFormat ),
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

	_allocateWorker: function ( taskCost ) {

		return this._initTranscoder().then( () => {

			if ( this.workerPool.length < this.workerLimit ) {

				var worker = new Worker( this.workerSourceURL );

				worker._callbacks = {};
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

			var worker = this.workerPool[ this.workerPool.length - 1 ];

			worker._taskLoad += taskCost;

			return worker;

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

THREE.BasisTextureLoader.BasisFormat = {
	ETC1S: 0,
	UASTC_4x4: 1,
};

THREE.BasisTextureLoader.TranscoderFormat = {
	ETC1: 0,
	ETC2: 1,
	BC1: 2,
	BC3: 3,
	BC4: 4,
	BC5: 5,
	BC7_M6_OPAQUE_ONLY: 6,
	BC7_M5: 7,
	PVRTC1_4_RGB: 8,
	PVRTC1_4_RGBA: 9,
	ASTC_4x4: 10,
	ATC_RGB: 11,
	ATC_RGBA_INTERPOLATED_ALPHA: 12,
	RGBA32: 13,
	RGB565: 14,
	BGR565: 15,
	RGBA4444: 16,
};

THREE.BasisTextureLoader.EngineFormat = {
	RGBAFormat: THREE.RGBAFormat,
	RGBA_ASTC_4x4_Format: THREE.RGBA_ASTC_4x4_Format,
	RGBA_BPTC_Format: THREE.RGBA_BPTC_Format,
	RGBA_ETC2_EAC_Format: THREE.RGBA_ETC2_EAC_Format,
	RGBA_PVRTC_4BPPV1_Format: THREE.RGBA_PVRTC_4BPPV1_Format,
	RGBA_S3TC_DXT5_Format: THREE.RGBA_S3TC_DXT5_Format,
	RGB_ETC1_Format: THREE.RGB_ETC1_Format,
	RGB_ETC2_Format: THREE.RGB_ETC2_Format,
	RGB_PVRTC_4BPPV1_Format: THREE.RGB_PVRTC_4BPPV1_Format,
	RGB_S3TC_DXT1_Format: THREE.RGB_S3TC_DXT1_Format,
};


/* WEB WORKER */

THREE.BasisTextureLoader.BasisWorker = function () {

	var config;
	var transcoderPending;
	var BasisModule;

	var EngineFormat = _EngineFormat; // eslint-disable-line no-undef
	var TranscoderFormat = _TranscoderFormat; // eslint-disable-line no-undef
	var BasisFormat = _BasisFormat; // eslint-disable-line no-undef

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

						var { width, height, hasAlpha, mipmaps, format } = message.taskConfig.lowLevel
							? transcodeLowLevel( message.taskConfig )
							: transcode( message.buffers[ 0 ] );

						var buffers = [];

						for ( var i = 0; i < mipmaps.length; ++ i ) {

							buffers.push( mipmaps[ i ].data.buffer );

						}

						self.postMessage( { type: 'transcode', id: message.id, width, height, hasAlpha, mipmaps, format }, buffers );

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

			BasisModule = { wasmBinary, onRuntimeInitialized: resolve };
			BASIS( BasisModule ); // eslint-disable-line no-undef

		} ).then( () => {

			BasisModule.initializeBasis();

		} );

	}

	function transcodeLowLevel( taskConfig ) {

		var { basisFormat, width, height, hasAlpha } = taskConfig;

		var { transcoderFormat, engineFormat } = getTranscoderFormat( basisFormat, width, height, hasAlpha );

		var blockByteLength = BasisModule.getBytesPerBlockOrPixel( transcoderFormat );

		assert( BasisModule.isFormatSupported( transcoderFormat ), 'THREE.BasisTextureLoader: Unsupported format.' );

		var mipmaps = [];

		if ( basisFormat === BasisFormat.ETC1S ) {

			var transcoder = new BasisModule.LowLevelETC1SImageTranscoder();

			var { endpointCount, endpointsData, selectorCount, selectorsData, tablesData } = taskConfig.globalData;

			try {

				var ok;

				ok = transcoder.decodePalettes( endpointCount, endpointsData, selectorCount, selectorsData );

				assert( ok, 'THREE.BasisTextureLoader: decodePalettes() failed.' );

				ok = transcoder.decodeTables( tablesData );

				assert( ok, 'THREE.BasisTextureLoader: decodeTables() failed.' );

				for ( var i = 0; i < taskConfig.levels.length; i ++ ) {

					var level = taskConfig.levels[ i ];
					var imageDesc = taskConfig.globalData.imageDescs[ i ];

					var dstByteLength = getTranscodedImageByteLength( transcoderFormat, level.width, level.height );
					var dst = new Uint8Array( dstByteLength );

					ok = transcoder.transcodeImage(
						transcoderFormat,
						dst, dstByteLength / blockByteLength,
						level.data,
						getWidthInBlocks( transcoderFormat, level.width ),
						getHeightInBlocks( transcoderFormat, level.height ),
						level.width, level.height, level.index,
						imageDesc.rgbSliceByteOffset, imageDesc.rgbSliceByteLength,
						imageDesc.alphaSliceByteOffset, imageDesc.alphaSliceByteLength,
						imageDesc.imageFlags,
						hasAlpha,
						false,
						0, 0
					);

					assert( ok, 'THREE.BasisTextureLoader: transcodeImage() failed for level ' + level.index + '.' );

					mipmaps.push( { data: dst, width: level.width, height: level.height } );

				}

			} finally {

				transcoder.delete();

			}

		} else {

			for ( var i = 0; i < taskConfig.levels.length; i ++ ) {

				var level = taskConfig.levels[ i ];

				var dstByteLength = getTranscodedImageByteLength( transcoderFormat, level.width, level.height );
				var dst = new Uint8Array( dstByteLength );

				var ok = BasisModule.transcodeUASTCImage(
					transcoderFormat,
					dst, dstByteLength / blockByteLength,
					level.data,
					getWidthInBlocks( transcoderFormat, level.width ),
					getHeightInBlocks( transcoderFormat, level.height ),
					level.width, level.height, level.index,
					0,
					level.data.byteLength,
					0,
					hasAlpha,
					false,
					0, 0,
					- 1, - 1
				);

				assert( ok, 'THREE.BasisTextureLoader: transcodeUASTCImage() failed for level ' + level.index + '.' );

				mipmaps.push( { data: dst, width: level.width, height: level.height } );

			}

		}

		return { width, height, hasAlpha, mipmaps, format: engineFormat };

	}

	function transcode( buffer ) {

		var basisFile = new BasisModule.BasisFile( new Uint8Array( buffer ) );

		var basisFormat = basisFile.isUASTC() ? BasisFormat.UASTC_4x4 : BasisFormat.ETC1S;
		var width = basisFile.getImageWidth( 0, 0 );
		var height = basisFile.getImageHeight( 0, 0 );
		var levels = basisFile.getNumLevels( 0 );
		var hasAlpha = basisFile.getHasAlpha();

		function cleanup() {

			basisFile.close();
			basisFile.delete();

		}

		var { transcoderFormat, engineFormat } = getTranscoderFormat( basisFormat, width, height, hasAlpha );

		if ( ! width || ! height || ! levels ) {

			cleanup();
			throw new Error( 'THREE.BasisTextureLoader:	Invalid texture' );

		}

		if ( ! basisFile.startTranscoding() ) {

			cleanup();
			throw new Error( 'THREE.BasisTextureLoader: .startTranscoding failed' );

		}

		var mipmaps = [];

		for ( var mip = 0; mip < levels; mip ++ ) {

			var mipWidth = basisFile.getImageWidth( 0, mip );
			var mipHeight = basisFile.getImageHeight( 0, mip );
			var dst = new Uint8Array( basisFile.getImageTranscodedSizeInBytes( 0, mip, transcoderFormat ) );

			var status = basisFile.transcodeImage(
				dst,
				0,
				mip,
				transcoderFormat,
				0,
				hasAlpha
			);

			if ( ! status ) {

				cleanup();
				throw new Error( 'THREE.BasisTextureLoader: .transcodeImage failed.' );

			}

			mipmaps.push( { data: dst, width: mipWidth, height: mipHeight } );

		}

		cleanup();

		return { width, height, hasAlpha, mipmaps, format: engineFormat };

	}

	//

	// Optimal choice of a transcoder target format depends on the Basis format (ETC1S or UASTC),
	// device capabilities, and texture dimensions. The list below ranks the formats separately
	// for ETC1S and UASTC.
	//
	// In some cases, transcoding UASTC to RGBA32 might be preferred for higher quality (at
	// significant memory cost) compared to ETC1/2, BC1/3, and PVRTC. The transcoder currently
	// chooses RGBA32 only as a last resort and does not expose that option to the caller.
	var FORMAT_OPTIONS = [
		{
			if: 'astcSupported',
			basisFormat: [ BasisFormat.UASTC_4x4 ],
			transcoderFormat: [ TranscoderFormat.ASTC_4x4, TranscoderFormat.ASTC_4x4 ],
			engineFormat: [ EngineFormat.RGBA_ASTC_4x4_Format, EngineFormat.RGBA_ASTC_4x4_Format ],
			priorityETC1S: Infinity,
			priorityUASTC: 1,
			needsPowerOfTwo: false,
		},
		{
			if: 'bptcSupported',
			basisFormat: [ BasisFormat.ETC1S, BasisFormat.UASTC_4x4 ],
			transcoderFormat: [ TranscoderFormat.BC7_M5, TranscoderFormat.BC7_M5 ],
			engineFormat: [ EngineFormat.RGBA_BPTC_Format, EngineFormat.RGBA_BPTC_Format ],
			priorityETC1S: 3,
			priorityUASTC: 2,
			needsPowerOfTwo: false,
		},
		{
			if: 'dxtSupported',
			basisFormat: [ BasisFormat.ETC1S, BasisFormat.UASTC_4x4 ],
			transcoderFormat: [ TranscoderFormat.BC1, TranscoderFormat.BC3 ],
			engineFormat: [ EngineFormat.RGB_S3TC_DXT1_Format, EngineFormat.RGBA_S3TC_DXT5_Format ],
			priorityETC1S: 4,
			priorityUASTC: 5,
			needsPowerOfTwo: false,
		},
		{
			if: 'etc2Supported',
			basisFormat: [ BasisFormat.ETC1S, BasisFormat.UASTC_4x4 ],
			transcoderFormat: [ TranscoderFormat.ETC1, TranscoderFormat.ETC2 ],
			engineFormat: [ EngineFormat.RGB_ETC2_Format, EngineFormat.RGBA_ETC2_EAC_Format ],
			priorityETC1S: 1,
			priorityUASTC: 3,
			needsPowerOfTwo: false,
		},
		{
			if: 'etc1Supported',
			basisFormat: [ BasisFormat.ETC1S, BasisFormat.UASTC_4x4 ],
			transcoderFormat: [ TranscoderFormat.ETC1, TranscoderFormat.ETC1 ],
			engineFormat: [ EngineFormat.RGB_ETC1_Format, EngineFormat.RGB_ETC1_Format ],
			priorityETC1S: 2,
			priorityUASTC: 4,
			needsPowerOfTwo: false,
		},
		{
			if: 'pvrtcSupported',
			basisFormat: [ BasisFormat.ETC1S, BasisFormat.UASTC_4x4 ],
			transcoderFormat: [ TranscoderFormat.PVRTC1_4_RGB, TranscoderFormat.PVRTC1_4_RGBA ],
			engineFormat: [ EngineFormat.RGB_PVRTC_4BPPV1_Format, EngineFormat.RGBA_PVRTC_4BPPV1_Format ],
			priorityETC1S: 5,
			priorityUASTC: 6,
			needsPowerOfTwo: true,
		},
	];

	var ETC1S_OPTIONS = FORMAT_OPTIONS.sort( function ( a, b ) {

		return a.priorityETC1S - b.priorityETC1S;

	} );
	var UASTC_OPTIONS = FORMAT_OPTIONS.sort( function ( a, b ) {

		return a.priorityUASTC - b.priorityUASTC;

	} );

	function getTranscoderFormat( basisFormat, width, height, hasAlpha ) {

		var transcoderFormat;
		var engineFormat;

		var options = basisFormat === BasisFormat.ETC1S ? ETC1S_OPTIONS : UASTC_OPTIONS;

		for ( var i = 0; i < options.length; i ++ ) {

			var opt = options[ i ];

			if ( ! config[ opt.if ] ) continue;
			if ( ! opt.basisFormat.includes( basisFormat ) ) continue;
			if ( opt.needsPowerOfTwo && ! ( isPowerOfTwo( width ) && isPowerOfTwo( height ) ) ) continue;

			transcoderFormat = opt.transcoderFormat[ hasAlpha ? 1 : 0 ];
			engineFormat = opt.engineFormat[ hasAlpha ? 1 : 0 ];

			return { transcoderFormat, engineFormat };

		}

		console.warn( 'THREE.BasisTextureLoader: No suitable compressed texture format found. Decoding to RGBA32.' );

		transcoderFormat = TranscoderFormat.RGBA32;
		engineFormat = EngineFormat.RGBAFormat;

		return { transcoderFormat, engineFormat };

	}

	function assert( ok, message ) {

		if ( ! ok ) throw new Error( message );

	}

	function getWidthInBlocks( transcoderFormat, width ) {

		return Math.ceil( width / BasisModule.getFormatBlockWidth( transcoderFormat ) );

	}

	function getHeightInBlocks( transcoderFormat, height ) {

		return Math.ceil( height / BasisModule.getFormatBlockHeight( transcoderFormat ) );

	}

	function getTranscodedImageByteLength( transcoderFormat, width, height ) {

		var blockByteLength = BasisModule.getBytesPerBlockOrPixel( transcoderFormat );

		if ( BasisModule.formatIsUncompressed( transcoderFormat ) ) {

			return width * height * blockByteLength;

		}

		if ( transcoderFormat === TranscoderFormat.PVRTC1_4_RGB
				|| transcoderFormat === TranscoderFormat.PVRTC1_4_RGBA ) {

			// GL requires extra padding for very small textures:
			// https://www.khronos.org/registry/OpenGL/extensions/IMG/IMG_texture_compression_pvrtc.txt
			var paddedWidth = ( width + 3 ) & ~ 3;
			var paddedHeight = ( height + 3 ) & ~ 3;

			return ( Math.max( 8, paddedWidth ) * Math.max( 8, paddedHeight ) * 4 + 7 ) / 8;

		}

		return ( getWidthInBlocks( transcoderFormat, width )
			* getHeightInBlocks( transcoderFormat, height )
			* blockByteLength );

	}

	function isPowerOfTwo( value ) {

		if ( value <= 2 ) return true;

		return ( value & ( value - 1 ) ) === 0 && value !== 0;

	}

};
