import {
	ClampToEdgeWrapping,
	DataTexture,
	DataUtils,
	FileLoader,
	HalfFloatType,
	LinearFilter,
	LinearMipMapLinearFilter,
	LinearSRGBColorSpace,
	Loader,
	RGBAFormat,
	UVMapping,
} from 'three';

/**
 * UltraHDR Image Format - https://developer.android.com/media/platform/hdr-image-format
 *
 * Short format brief:
 *
 *  [JPEG headers]
 *  [Metadata describing the MPF container and both SDR and gainmap images]
 *    - XMP metadata (legacy format)
 *    - ISO 21496-1 metadata (current standard)
 *  [Optional metadata] [EXIF] [ICC Profile]
 *  [SDR image]
 *  [Gainmap image with metadata]
 *
 * Each section is separated by a 0xFFXX byte followed by a descriptor byte (0xFFE0, 0xFFE1, 0xFFE2.)
 * Binary image storages are prefixed with a unique 0xFFD8 16-bit descriptor.
 */


// Pre-calculated sRGB to linear lookup table for values 0-1023
const SRGB_TO_LINEAR = new Float64Array( 1024 );
for ( let i = 0; i < 1024; i ++ ) {

	// (1/255) * 0.9478672986 = 0.003717127
	SRGB_TO_LINEAR[ i ] = Math.pow( i * 0.003717127 + 0.0521327014, 2.4 );

}

/**
 * A loader for the Ultra HDR Image Format.
 *
 * Existing HDR or EXR textures can be converted to Ultra HDR with this [tool](https://gainmap-creator.monogrid.com/).
 *
 * Current feature set:
 * - JPEG headers (required)
 * - XMP metadata (legacy format, supported)
 * - ISO 21496-1 metadata (current standard, supported)
 * - XMP validation (not implemented)
 * - EXIF profile (not implemented)
 * - ICC profile (not implemented)
 * - Binary storage for SDR & HDR images (required)
 * - Gainmap metadata (required)
 * - Non-JPEG image formats (not implemented)
 * - Primary image as an HDR image (not implemented)
 *
 * ```js
 * const loader = new UltraHDRLoader();
 * const texture = await loader.loadAsync( 'textures/equirectangular/ice_planet_close.jpg' );
 * texture.mapping = THREE.EquirectangularReflectionMapping;
 *
 * scene.background = texture;
 * scene.environment = texture;
 * ```
 *
 * @augments Loader
 * @three_import import { UltraHDRLoader } from 'three/addons/loaders/UltraHDRLoader.js';
 */
class UltraHDRLoader extends Loader {

	/**
	 * Constructs a new Ultra HDR loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

		/**
		 * The texture type.
		 *
		 * @type {(HalfFloatType|FloatType)}
		 * @default HalfFloatType
		 */
		this.type = HalfFloatType;

	}

	/**
	 * Sets the texture type.
	 *
	 * @param {(HalfFloatType|FloatType)} value - The texture type to set.
	 * @return {UltraHDRLoader} A reference to this loader.
	 */
	setDataType( value ) {

		this.type = value;

		return this;

	}

	/**
	 * Parses the given Ultra HDR texture data.
	 *
	 * @param {ArrayBuffer} buffer - The raw texture data.
	 * @param {Function} onLoad - The `onLoad` callback.
	 */
	parse( buffer, onLoad ) {

		const metadata = {
			version: null,
			baseRenditionIsHDR: null,
			gainMapMin: null,
			gainMapMax: null,
			gamma: null,
			offsetSDR: null,
			offsetHDR: null,
			hdrCapacityMin: null,
			hdrCapacityMax: null,
		};
		const textDecoder = new TextDecoder();

		const bytes = new Uint8Array( buffer );

		const sections = [];

		// JPEG segment-aware scanner using length headers
		let offset = 0;

		while ( offset < bytes.length - 1 ) {

			// Find marker prefix
			if ( bytes[ offset ] !== 0xff ) {

				offset ++;
				continue;

			}

			const markerType = bytes[ offset + 1 ];

			// SOI (0xD8) - Start of Image, no length field
			if ( markerType === 0xd8 ) {

				sections.push( {
					sectionType: markerType,
					section: bytes.subarray( offset, offset + 2 ),
					sectionOffset: offset + 2,
				} );

				offset += 2;
				continue;

			}

			// APP0-APP2 segments have length headers
			if ( markerType === 0xe0 || markerType === 0xe1 || markerType === 0xe2 ) {

				// Length is stored as big-endian 16-bit value (includes length bytes, excludes marker)
				const segmentLength = ( bytes[ offset + 2 ] << 8 ) | bytes[ offset + 3 ];
				const segmentEnd = offset + 2 + segmentLength;

				sections.push( {
					sectionType: markerType,
					section: bytes.subarray( offset, segmentEnd ),
					sectionOffset: offset + 2,
				} );

				offset = segmentEnd;
				continue;

			}

			// Skip other markers with length fields (0xC0-0xFE range, except RST and EOI)
			if ( markerType >= 0xc0 && markerType <= 0xfe && markerType !== 0xd9 && ( markerType < 0xd0 || markerType > 0xd7 ) ) {

				const segmentLength = ( bytes[ offset + 2 ] << 8 ) | bytes[ offset + 3 ];
				offset += 2 + segmentLength;
				continue;

			}

			// EOI (0xD9) or RST markers (0xD0-0xD7) - no length field
			offset += 2;

		}

		let primaryImage, gainmapImage;

		for ( let i = 0; i < sections.length; i ++ ) {

			const { sectionType, section, sectionOffset } = sections[ i ];

			if ( sectionType === 0xe0 ) {
				/* JPEG Header - no useful information */
			} else if ( sectionType === 0xe1 ) {

				/* APP1: XMP Metadata */

				this._parseXMPMetadata(
					textDecoder.decode( new Uint8Array( section ) ),
					metadata
				);

			} else if ( sectionType === 0xe2 ) {

				/* APP2: Data Sections - MPF / ICC Profile / ISO 21496-1 Metadata */

				const sectionData = new DataView( section.buffer, section.byteOffset + 2, section.byteLength - 2 );

				// Check for ISO 21496-1 namespace: "urn:iso:std:iso:ts:21496:-1\0"
				const isoNameSpace = 'urn:iso:std:iso:ts:21496:-1\0';
				if ( section.byteLength >= isoNameSpace.length + 2 ) {

					let isISO = true;
					for ( let j = 0; j < isoNameSpace.length; j ++ ) {

						if ( section[ 2 + j ] !== isoNameSpace.charCodeAt( j ) ) {

							isISO = false;
							break;

						}

					}

					if ( isISO ) {

						// Parse ISO 21496-1 metadata
						const isoData = section.subarray( 2 + isoNameSpace.length );
						this._parseISOMetadata( isoData, metadata );
						continue;

					}

				}

				// Check for MPF
				const sectionHeader = sectionData.getUint32( 2, false );

				if ( sectionHeader === 0x4d504600 ) {

					/* MPF Section */

					/* Section contains a list of static bytes and ends with offsets indicating location of SDR and gainmap images */
					/* First bytes after header indicate little / big endian ordering (0x49492A00 - LE / 0x4D4D002A - BE) */
					/*
					... 60 bytes indicating tags, versions, etc. ...

					bytes | bits | description

					4       32     primary image size
					4       32     primary image offset
					2       16     0x0000
					2       16     0x0000

					4       32     0x00000000
					4       32     gainmap image size
					4       32     gainmap image offset
					2       16     0x0000
					2       16     0x0000
					*/

					const mpfLittleEndian = sectionData.getUint32( 6 ) === 0x49492a00;
					const mpfBytesOffset = 60;

					/* SDR size includes the metadata length, SDR offset is always 0 */

					const primaryImageSize = sectionData.getUint32(
						mpfBytesOffset,
						mpfLittleEndian
					);
					const primaryImageOffset = sectionData.getUint32(
						mpfBytesOffset + 4,
						mpfLittleEndian
					);

					/* Gainmap size is an absolute value starting from its offset, gainmap offset needs 6 bytes padding to take into account 0x00 bytes at the end of XMP */
					const gainmapImageSize = sectionData.getUint32(
						mpfBytesOffset + 16,
						mpfLittleEndian
					);
					const gainmapImageOffset =
						sectionData.getUint32( mpfBytesOffset + 20, mpfLittleEndian ) +
						sectionOffset +
						6;

					primaryImage = new Uint8Array(
						buffer,
						primaryImageOffset,
						primaryImageSize
					);

					gainmapImage = new Uint8Array(
						buffer,
						gainmapImageOffset,
						gainmapImageSize
					);

				}

			}

		}

		/* Minimal sufficient validation - https://developer.android.com/media/platform/hdr-image-format#signal_of_the_format */
		// Version can come from either XMP or ISO metadata
		if ( ! metadata.version ) {

			throw new Error( 'THREE.UltraHDRLoader: Not a valid UltraHDR image' );

		}

		if ( primaryImage && gainmapImage ) {

			this._applyGainmapToSDR(
				metadata,
				primaryImage,
				gainmapImage,
				( hdrBuffer, width, height ) => {

					onLoad( {
						width,
						height,
						data: hdrBuffer,
						format: RGBAFormat,
						type: this.type,
					} );

				},
				( error ) => {

					throw new Error( error );

				}
			);

		} else {

			throw new Error( 'THREE.UltraHDRLoader: Could not parse UltraHDR images' );

		}

	}

	/**
	 * Parses ISO 21496-1 gainmap metadata from binary data.
	 *
	 * @private
	 * @param {Uint8Array} data - The binary ISO metadata.
	 * @param {Object} metadata - The metadata object to populate.
	 */
	_parseISOMetadata( data, metadata ) {

		const view = new DataView( data.buffer, data.byteOffset, data.byteLength );

		// Skip minimum version (2 bytes) and writer version (2 bytes)
		let offset = 4;

		// Read flags (1 byte)
		const flags = view.getUint8( offset );
		offset += 1;

		const backwardDirection = ( flags & 0x4 ) !== 0;
		const useCommonDenominator = ( flags & 0x8 ) !== 0;

		let gainMapMin, gainMapMax, gamma, offsetSDR, offsetHDR, hdrCapacityMin, hdrCapacityMax;

		if ( useCommonDenominator ) {

			// Read common denominator (4 bytes, unsigned)
			const commonDenominator = view.getUint32( offset, false );
			offset += 4;

			// Read baseHdrHeadroom (4 bytes, unsigned)
			const baseHdrHeadroomN = view.getUint32( offset, false );
			offset += 4;
			hdrCapacityMin = Math.log2( baseHdrHeadroomN / commonDenominator );

			// Read alternateHdrHeadroom (4 bytes, unsigned)
			const alternateHdrHeadroomN = view.getUint32( offset, false );
			offset += 4;
			hdrCapacityMax = Math.log2( alternateHdrHeadroomN / commonDenominator );

			// Read first channel (or only channel) parameters
			const gainMapMinN = view.getInt32( offset, false );
			offset += 4;
			gainMapMin = gainMapMinN / commonDenominator;

			const gainMapMaxN = view.getInt32( offset, false );
			offset += 4;
			gainMapMax = gainMapMaxN / commonDenominator;

			const gammaN = view.getUint32( offset, false );
			offset += 4;
			gamma = gammaN / commonDenominator;

			const offsetSDRN = view.getInt32( offset, false );
			offset += 4;
			offsetSDR = ( offsetSDRN / commonDenominator ) * 255.0;

			const offsetHDRN = view.getInt32( offset, false );
			offsetHDR = ( offsetHDRN / commonDenominator ) * 255.0;

		} else {

			// Read baseHdrHeadroom numerator and denominator
			const baseHdrHeadroomN = view.getUint32( offset, false );
			offset += 4;
			const baseHdrHeadroomD = view.getUint32( offset, false );
			offset += 4;
			hdrCapacityMin = Math.log2( baseHdrHeadroomN / baseHdrHeadroomD );

			// Read alternateHdrHeadroom numerator and denominator
			const alternateHdrHeadroomN = view.getUint32( offset, false );
			offset += 4;
			const alternateHdrHeadroomD = view.getUint32( offset, false );
			offset += 4;
			hdrCapacityMax = Math.log2( alternateHdrHeadroomN / alternateHdrHeadroomD );

			// Read first channel parameters
			const gainMapMinN = view.getInt32( offset, false );
			offset += 4;
			const gainMapMinD = view.getUint32( offset, false );
			offset += 4;
			gainMapMin = gainMapMinN / gainMapMinD;

			const gainMapMaxN = view.getInt32( offset, false );
			offset += 4;
			const gainMapMaxD = view.getUint32( offset, false );
			offset += 4;
			gainMapMax = gainMapMaxN / gainMapMaxD;

			const gammaN = view.getUint32( offset, false );
			offset += 4;
			const gammaD = view.getUint32( offset, false );
			offset += 4;
			gamma = gammaN / gammaD;

			const offsetSDRN = view.getInt32( offset, false );
			offset += 4;
			const offsetSDRD = view.getUint32( offset, false );
			offset += 4;
			offsetSDR = ( offsetSDRN / offsetSDRD ) * 255.0;

			const offsetHDRN = view.getInt32( offset, false );
			offset += 4;
			const offsetHDRD = view.getUint32( offset, false );
			offsetHDR = ( offsetHDRN / offsetHDRD ) * 255.0;

		}

		// Convert log2 values to linear
		metadata.version = '1.0'; // ISO standard doesn't encode version string, use default
		metadata.baseRenditionIsHDR = backwardDirection;
		metadata.gainMapMin = gainMapMin;
		metadata.gainMapMax = gainMapMax;
		metadata.gamma = gamma;
		metadata.offsetSDR = offsetSDR;
		metadata.offsetHDR = offsetHDR;
		metadata.hdrCapacityMin = hdrCapacityMin;
		metadata.hdrCapacityMax = hdrCapacityMax;

	}

	/**
	 * Starts loading from the given URL and passes the loaded Ultra HDR texture
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the files to be loaded. This can also be a data URI.
	 * @param {function(DataTexture, Object)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 * @return {DataTexture} The Ultra HDR texture.
	 */
	load( url, onLoad, onProgress, onError ) {

		const texture = new DataTexture(
			this.type === HalfFloatType ? new Uint16Array() : new Float32Array(),
			0,
			0,
			RGBAFormat,
			this.type,
			UVMapping,
			ClampToEdgeWrapping,
			ClampToEdgeWrapping,
			LinearFilter,
			LinearMipMapLinearFilter,
			1,
			LinearSRGBColorSpace
		);
		texture.generateMipmaps = true;
		texture.flipY = true;

		const loader = new FileLoader( this.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setPath( this.path );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, ( buffer ) => {

			try {

				this.parse(
					buffer,
					( texData ) => {

						texture.image = {
							data: texData.data,
							width: texData.width,
							height: texData.height,
						};
						texture.needsUpdate = true;

						if ( onLoad ) onLoad( texture, texData );

					}
				);

			} catch ( error ) {

				if ( onError ) onError( error );

				console.error( error );

			}

		}, onProgress, onError );

		return texture;

	}

	_parseXMPMetadata( xmpDataString, metadata ) {

		const domParser = new DOMParser();

		const xmpXml = domParser.parseFromString(
			xmpDataString.substring(
				xmpDataString.indexOf( '<' ),
				xmpDataString.lastIndexOf( '>' ) + 1
			),
			'text/xml'
		);

		/* Determine if given XMP metadata is the primary GContainer descriptor or a gainmap descriptor */
		const [ hasHDRContainerDescriptor ] = xmpXml.getElementsByTagName(
			'Container:Directory'
		);

		if ( hasHDRContainerDescriptor ) {
			/* There's not much useful information in the container descriptor besides memory-validation */
		} else {

			/* Gainmap descriptor - defaults from https://developer.android.com/media/platform/hdr-image-format#HDR_gain_map_metadata */

			const [ gainmapNode ] = xmpXml.getElementsByTagName( 'rdf:Description' );

			metadata.version = gainmapNode.getAttribute( 'hdrgm:Version' );
			metadata.baseRenditionIsHDR =
				gainmapNode.getAttribute( 'hdrgm:BaseRenditionIsHDR' ) === 'True';
			metadata.gainMapMin = parseFloat(
				gainmapNode.getAttribute( 'hdrgm:GainMapMin' ) || 0.0
			);
			metadata.gainMapMax = parseFloat(
				gainmapNode.getAttribute( 'hdrgm:GainMapMax' ) || 1.0
			);
			metadata.gamma = parseFloat(
				gainmapNode.getAttribute( 'hdrgm:Gamma' ) || 1.0
			);
			metadata.offsetSDR = parseFloat(
				gainmapNode.getAttribute( 'hdrgm:OffsetSDR' ) / ( 1 / 64 )
			);
			metadata.offsetHDR = parseFloat(
				gainmapNode.getAttribute( 'hdrgm:OffsetHDR' ) / ( 1 / 64 )
			);
			metadata.hdrCapacityMin = parseFloat(
				gainmapNode.getAttribute( 'hdrgm:HDRCapacityMin' ) || 0.0
			);
			metadata.hdrCapacityMax = parseFloat(
				gainmapNode.getAttribute( 'hdrgm:HDRCapacityMax' ) || 1.0
			);

		}

	}

	_srgbToLinear( value ) {

		// 0.04045 * 255 = 10.31475
		if ( value < 10.31475 ) {

			// (1/255) * 0.0773993808
			return value * 0.000303527;

		}

		if ( value < 1024 ) {

			return SRGB_TO_LINEAR[ value | 0 ];

		}

		// (1/255) * 0.9478672986 = 0.003717127
		return Math.pow( value * 0.003717127 + 0.0521327014, 2.4 );

	}

	_applyGainmapToSDR(
		metadata,
		sdrBuffer,
		gainmapBuffer,
		onSuccess,
		onError
	) {

		const decodeImage = ( data ) => createImageBitmap( new Blob( [ data ], { type: 'image/jpeg' } ) );

		Promise.all( [ decodeImage( sdrBuffer ), decodeImage( gainmapBuffer ) ] )
			.then( ( [ sdrImage, gainmapImage ] ) => {

				const sdrWidth = sdrImage.width;
				const sdrHeight = sdrImage.height;
				const sdrImageAspect = sdrWidth / sdrHeight;
				const gainmapImageAspect = gainmapImage.width / gainmapImage.height;

				if ( sdrImageAspect !== gainmapImageAspect ) {

					onError(
						'THREE.UltraHDRLoader Error: Aspect ratio mismatch between SDR and Gainmap images'
					);

					return;

				}

				const canvas = document.createElement( 'canvas' );
				const ctx = canvas.getContext( '2d', {
					willReadFrequently: true,
					colorSpace: 'srgb',
				} );

				canvas.width = sdrWidth;
				canvas.height = sdrHeight;

				/* Use out-of-the-box interpolation of Canvas API to scale gainmap to fit the SDR resolution */
				ctx.drawImage(
					gainmapImage,
					0,
					0,
					gainmapImage.width,
					gainmapImage.height,
					0,
					0,
					sdrWidth,
					sdrHeight
				);
				const gainmapImageData = ctx.getImageData(
					0,
					0,
					sdrWidth,
					sdrHeight,
					{ colorSpace: 'srgb' }
				);

				ctx.drawImage( sdrImage, 0, 0 );
				const sdrImageData = ctx.getImageData(
					0,
					0,
					sdrWidth,
					sdrHeight,
					{ colorSpace: 'srgb' }
				);

				/* HDR Recovery formula - https://developer.android.com/media/platform/hdr-image-format#use_the_gain_map_to_create_adapted_HDR_rendition */

				/* 1.8 instead of 2 near-perfectly rectifies approximations introduced by precalculated SRGB_TO_LINEAR values */
				const maxDisplayBoost = 1.8 ** ( metadata.hdrCapacityMax * 0.5 );
				const unclampedWeightFactor =
					( Math.log2( maxDisplayBoost ) - metadata.hdrCapacityMin ) /
					( metadata.hdrCapacityMax - metadata.hdrCapacityMin );
				const weightFactor = Math.min(
					Math.max( unclampedWeightFactor, 0.0 ),
					1.0
				);

				const sdrData = sdrImageData.data;
				const gainmapData = gainmapImageData.data;
				const dataLength = sdrData.length;
				const gainMapMin = metadata.gainMapMin;
				const gainMapMax = metadata.gainMapMax;
				const offsetSDR = metadata.offsetSDR;
				const offsetHDR = metadata.offsetHDR;
				const invGamma = 1.0 / metadata.gamma;
				const useGammaOne = metadata.gamma === 1.0;
				const isHalfFloat = this.type === HalfFloatType;
				const toHalfFloat = DataUtils.toHalfFloat;
				const srgbToLinear = this._srgbToLinear;

				const hdrBuffer = isHalfFloat
					? new Uint16Array( dataLength ).fill( 15360 )
					: new Float32Array( dataLength ).fill( 1.0 );

				for ( let i = 0; i < dataLength; i += 4 ) {

					for ( let c = 0; c < 3; c ++ ) {

						const idx = i + c;
						const sdrValue = sdrData[ idx ];
						const gainmapValue = gainmapData[ idx ] * 0.00392156862745098; // 1/255

						const logRecovery = useGammaOne
							? gainmapValue
							: Math.pow( gainmapValue, invGamma );

						const logBoost = gainMapMin + ( gainMapMax - gainMapMin ) * logRecovery;

						const hdrValue =
							( sdrValue + offsetSDR ) *
								( logBoost * weightFactor === 0.0
									? 1.0
									: Math.pow( 2, logBoost * weightFactor ) ) -
							offsetHDR;

						const linearHDRValue = Math.min(
							Math.max( srgbToLinear( hdrValue ), 0 ),
							65504
						);

						hdrBuffer[ idx ] = isHalfFloat
							? toHalfFloat( linearHDRValue )
							: linearHDRValue;

					}

				}

				onSuccess( hdrBuffer, sdrWidth, sdrHeight );

			} )
			.catch( ( e ) => {

				onError( e );

			} );

	}

}

export { UltraHDRLoader };
