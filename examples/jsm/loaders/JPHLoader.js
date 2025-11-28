import {
	DataTexture,
	FileLoader,
	FloatType,
	HalfFloatType,
	LinearFilter,
	LinearSRGBColorSpace,
	Loader
} from 'three';
import OpenJPHModule from '../libs/openjph/openjph.module.js';

let _openjph;

/**
 * Loader for JPEG 2000 codestreams using OpenJPH (High-Throughput JPEG 2000).
 * 
 * This loader wraps the OpenJPH WebAssembly module to decode HTJ2K (High Throughput JPEG 2000)
 * compressed image data. HTJ2K is defined in ISO/IEC 15444-15 / ITU-T T.814.
 * 
 * Features:
 * - Supports lossless and lossy JPEG 2000 compression
 * - Handles 8-bit, 16-bit, and 32-bit data
 * - Multiple component/channel support
 * - Optional resolution reduction for faster decoding
 * 
 * Usage:
 * ```javascript
 * import { JPHLoader } from 'three/examples/jsm/loaders/JPHLoader.js';
 * 
 * // Initialize with OpenJPH WASM module
 * const loader = new JPHLoader();
 * 
 * // Load WASM module first (required)
 * await loader.setWASMModule(openjphModule);
 * 
 * // Load a J2K/JP2 file
 * loader.load('texture.j2k', (texture) => {
 *   // Use texture
 * });
 * 
 * // Or decode from buffer directly
 * const texture = loader.parse(arrayBuffer);
 * ```
 * 
 * OpenJPH WASM Module:
 * The OpenJPH library must be compiled to WebAssembly using Emscripten.
 * See: https://github.com/aous72/OpenJPH/tree/main/subprojects/js
 * 
 * Build instructions:
 * ```bash
 * git clone https://github.com/aous72/OpenJPH.git
 * cd OpenJPH
 * mkdir build && cd build
 * emcmake cmake -DCMAKE_BUILD_TYPE=Release ..
 * emmake make
 * ```
 * 
 * @author mrdoob / http://mrdoob.com/
 */

class JPHLoader extends Loader {

	constructor( manager ) {

		super( manager );

		this.type = FloatType;

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );

		loader.load( url, function ( buffer ) {

			try {

				onLoad( scope.parse( buffer ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	/**
	 * Parses JPEG 2000 codestream data and returns a DataTexture.
	 * 
	 * @param {ArrayBuffer} buffer - The J2K/JP2 file data
	 * @param {Object} options - Decoding options
	 * @param {number} options.skipResolutionsRead - Number of resolutions to skip during read (default: 0)
	 * @param {number} options.skipResolutionsRecon - Number of resolutions to skip during reconstruction (default: 0)
	 * @returns {DataTexture} The decoded texture
	 */
	async parse( buffer, options = {} ) {

		// Lazy initialization of OpenJPH WASM module
		let openjph;

		if ( ! _openjph ) {

			_openjph = new Promise( async ( resolve ) => {

				const openjph = await OpenJPHModule();
				resolve( openjph );

			} );

		}

		openjph = await _openjph;

		const {
			skipResolutionsRead = 0,
			skipResolutionsRecon = 0
		} = options;

		const wasm = openjph;

		// Create J2K data structure
		const j2kData = wasm._create_j2c_data();

		if ( ! j2kData ) {

			throw new Error( 'THREE.JPHLoader: Failed to create J2K data structure.' );

		}

		try {

			// Allocate memory for input data
			const dataPtr = wasm._malloc( buffer.byteLength );
			wasm.HEAPU8.set( new Uint8Array( buffer ), dataPtr );

			// Initialize codestream
			wasm._init_j2c_data( j2kData, dataPtr, buffer.byteLength );

			// Free input data
			wasm._free( dataPtr );

			// Get codestream info
			const width = wasm._get_width( j2kData );
			const height = wasm._get_height( j2kData );
			const numComponents = wasm._get_num_components( j2kData );
			const bitDepth = wasm._get_bit_depth( j2kData, 0 );
			const isSigned = wasm._is_signed( j2kData, 0 );

			// Apply resolution reduction if requested
			if ( skipResolutionsRead > 0 || skipResolutionsRecon > 0 ) {

				wasm._restrict_input_resolution( j2kData, skipResolutionsRead, skipResolutionsRecon );

			}

			// Parse and prepare for decoding
			wasm._parse_j2c_data( j2kData );

			// Determine output data type
			let outputData;
			let textureType;

			if ( bitDepth <= 8 ) {

				// 8-bit output
				outputData = new Uint8Array( width * height * numComponents );
				textureType = this.type; // Use default type

			} else if ( bitDepth <= 16 ) {

				// 16-bit output - use Half or Float
				outputData = new Uint16Array( width * height * numComponents );
				textureType = HalfFloatType;

			} else {

				// 32-bit float output
				outputData = new Float32Array( width * height * numComponents );
				textureType = FloatType;

			}

			// Decode scanlines
			let offset = 0;

			for ( let y = 0; y < height; y ++ ) {

				for ( let c = 0; c < numComponents; c ++ ) {

					const linePtr = wasm._pull_j2c_line( j2kData );

					if ( ! linePtr ) {

						throw new Error( `THREE.JPHLoader: Failed to decode line ${y}, component ${c}.` );

					}

					// Copy line data
					for ( let x = 0; x < width; x ++ ) {

						const value = wasm.HEAP32[ ( linePtr >> 2 ) + x ];

						// Convert signed to unsigned if needed
						if ( isSigned ) {

							outputData[ offset ++ ] = value + ( 1 << ( bitDepth - 1 ) );

						} else {

							outputData[ offset ++ ] = value;

						}

					}

				}

			}

			// Release J2K data
			wasm._release_j2c_data( j2kData );

			// Create and configure texture
			const texture = new DataTexture( outputData, width, height );
			texture.type = textureType;
			texture.minFilter = LinearFilter;
			texture.magFilter = LinearFilter;
			texture.generateMipmaps = false;
			texture.needsUpdate = true;

			// Set color space based on number of components
			if ( numComponents >= 3 ) {

				texture.colorSpace = LinearSRGBColorSpace;

			}

			return texture;

		} catch ( error ) {

			// Clean up on error
			if ( j2kData ) {

				wasm._release_j2c_data( j2kData );

			}

			throw error;

		}

	}

	setDataType( value ) {

		this.type = value;
		return this;

	}

}

export { JPHLoader };
