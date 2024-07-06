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

// UltraHDR Image Format - https://developer.android.com/media/platform/hdr-image-format#signal_of_the_format
// Originally propsed as gainmap-js using a WASM dependency - https://gainmap-creator.monogrid.com/

/**
 *
 * Short format brief:
 *
 *  [JPEG Headers]
 *  [XMP metadata describing the UltraHDR container and *both* SDR and HDR images]
 *  [Optional metadata] [EXIF] [ICC Profile]
 *  [SDR Image]
 *  [XMP metadata describing only the HDR image]
 *
 * Each section is separated by a 0xFF byte followed by a descriptor byte (0xE0, 0xE1, 0xE2.)
 * Binary image storage is separated with a unique 0xFFD8 16-bit descriptor.
 */

/**
 * Current feature set:
 * - JPEG headers (required)
 * - XMP metadata (required)
 *  - XMP validation (not implemented)
 * - EXIF profile (not implemented)
 * - ICC profile (not implemented)
 * - Binary storage for SDR & HDR images (required)
 * - Gainmap metadata (required)
 * - Non-JPEG image formats (not implemented)
 * - Primary image as an HDR image (not implemented)
 */

/* Calculating this SRGB powers is extremely slow for 4K images and can be sufficiently precalculated for a 3-4x speed boost */
const SRGB_TO_LINEAR = Array( 1024 ).fill( 0 ).map( ( _, value ) => Math.pow( value / 255 * 0.9478672986 + 0.0521327014, 2.4 ) );

class UltraHDRLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	parse( buffer, onLoad ) {

		const xmpMetadata = {
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

		const data = new DataView( buffer );
		const dataAsString = textDecoder.decode( data );

		/* Minimal sufficient validation - https://developer.android.com/media/platform/hdr-image-format#signal_of_the_format */
		if ( ! dataAsString.includes( 'hdrgm:Version="1.0"' ) ) {

			throw new Error( 'THREE.UltraHDRLoader: Not a valid UltraHDR image' );

		}

		let byteOffset = 0;
		const sections = [];

		while ( byteOffset < data.byteLength ) {

			const byte = data.getUint8( byteOffset, false );

			if ( byte === 0xff ) {

				const leadingByte = data.getUint8( byteOffset + 1, false );

				if (
					[
						/* Valid section headers */
						0xd8, // SOI
						0xe0, // APP0
						0xe1, // APP1
						0xe2, // APP2
					].includes( leadingByte )
				) {

					sections.push( {
						sectionType: leadingByte,
						section: [ byte, leadingByte ],
						sectionOffset: byteOffset + 2,
					} );

					byteOffset += 2;

				} else {

					sections[ sections.length - 1 ].section.push( byte );

					byteOffset ++;

				}

			} else {

				sections[ sections.length - 1 ].section.push( byte );

				byteOffset ++;

			}

		}

		for ( let i = 0; i < sections.length; i ++ ) {

			const { sectionType, section, sectionOffset } = sections[ i ];

			if ( sectionType === 0xe0 ) {

				/* JPEG Header - no useful information */

			} else if ( sectionType === 0xe1 ) {

				/* XMP Metadata */

				this._parseXMPMetadata(
					textDecoder.decode( new Uint8Array( section ) ),
					xmpMetadata
				);

			} else if ( sectionType === 0xe2 ) {

				/* Data Sections - MPF / EXIF / ICC Profile */

				const sectionData = new DataView(
					new Uint8Array( section.slice( 2 ) ).buffer
				);
				const sectionHeader = sectionData.getUint32( 2, false );

				if ( sectionHeader === 0x4d504600 ) {

					/* MPF Section */

					/* Section contains a list of static bytes and ends with offsets indicating location of SDR and Gainmap images */
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

					/* SDR size includes the XMP metadata length, SDR offset is always 0 */

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

					const primaryImage = new Uint8Array(
						data.buffer,
						primaryImageOffset,
						primaryImageSize
					);
					const gainmapImage = new Uint8Array(
						data.buffer,
						gainmapImageOffset,
						gainmapImageSize
					);

					this._applyGainmapToSDR( xmpMetadata, primaryImage, gainmapImage, ( hdrBuffer, width, height ) => {

						onLoad( {
							width,
							height,
							data: hdrBuffer,
							format: RGBAFormat,
							type: HalfFloatType,
						} );

					}, ( error ) => {

						throw new Error( error );

					} );

				}

			}

		}

		return {
			width: 0,
			height: 0,
			data: new Uint16Array(),
			format: RGBAFormat,
			type: HalfFloatType,
		};

	}

	load( url, onLoad, onError ) {

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

						const texture = new DataTexture(
							texData.data,
							texData.width,
							texData.height,
							RGBAFormat,
							HalfFloatType,
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
						texture.needsUpdate = true;

						if ( onLoad ) onLoad( texture, texData );

					},
					onError
				);

			} catch ( error ) {

				if ( onError ) onError( error );

				console.error( error );

			}

		} );

	}

	_parseXMPMetadata( xmpDataString, xmpMetadata ) {

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

			xmpMetadata.version = gainmapNode.getAttribute( 'hdrgm:Version' ) || '1.0';
			xmpMetadata.baseRenditionIsHDR =
        gainmapNode.getAttribute( 'hdrgm:BaseRenditionIsHDR' ) === 'True';
			xmpMetadata.gainMapMin = parseFloat(
				gainmapNode.getAttribute( 'hdrgm:GainMapMin' ) || 0.0
			);
			xmpMetadata.gainMapMax = parseFloat(
				gainmapNode.getAttribute( 'hdrgm:GainMapMax' ) || 1.0
			);
			xmpMetadata.gamma = parseFloat(
				gainmapNode.getAttribute( 'hdrgm:Gamma' ) || 1.0
			);
			xmpMetadata.offsetSDR = parseFloat(
				gainmapNode.getAttribute( 'hdrgm:OffsetSDR' ) / ( 1 / 64 )
			);
			xmpMetadata.offsetHDR = parseFloat(
				gainmapNode.getAttribute( 'hdrgm:OffsetHDR' ) / ( 1 / 64 )
			);
			xmpMetadata.hdrCapacityMin = parseFloat(
				gainmapNode.getAttribute( 'hdrgm:HDRCapacityMin' ) || 0.0
			);
			xmpMetadata.hdrCapacityMax = parseFloat(
				gainmapNode.getAttribute( 'hdrgm:HDRCapacityMax' ) || 1.0
			);

		}

	}

	_srgbToLinear( value ) {

		if ( value / 255 < 0.04045 ) {

			return value / 255 * 0.0773993808;

		}

		if ( value < 512 ) {

			return SRGB_TO_LINEAR[ ~ ~ value ];

		}

		return Math.pow( value / 255 * 0.9478672986 + 0.0521327014, 2.4 );

	}

	_clamp( value, min, max ) {

		return Math.min( Math.max( value, min ), max );

	}

	_applyGainmapToSDR( xmpMetadata, sdrBuffer, gainmapBuffer, onSuccess, onError ) {

		const getImageDataFromBuffer = ( buffer ) => new Promise( ( resolve, reject ) => {

			const imageLoader = document.createElement( 'img' );

			imageLoader.onload = () => {

				const image = {
					width: imageLoader.naturalWidth,
					height: imageLoader.naturalHeight,
					source: imageLoader,
				};

				URL.revokeObjectURL( imageLoader.src );

				resolve( image );

			};

			imageLoader.onerror = () => {

				URL.revokeObjectURL( imageLoader.src );

				reject();

			};

			imageLoader.src = URL.createObjectURL( new Blob( [ buffer ], { type: 'image/jpeg' } ) );

		} );

		Promise.all( [
			getImageDataFromBuffer( sdrBuffer ),
			getImageDataFromBuffer( gainmapBuffer ),
		] )
			.then( ( [ sdrImage, gainmapImage ] ) => {

				const sdrImageAspect = sdrImage.width / sdrImage.height;
				const gainmapImageAspect = gainmapImage.width / gainmapImage.height;

				if ( sdrImageAspect !== gainmapImageAspect ) {

					onError( 'THREE.UltraHDRLoader Error: Aspect ratio mismatch between SDR and Gainmap images' );

					return;

				}

				const canvas = document.createElement( 'canvas' );
				const ctx = canvas.getContext( '2d', { willReadFrequently: false, colorSpace: 'srgb' } );

				canvas.width = sdrImage.width;
				canvas.height = sdrImage.height;

				/* Use out-of-the-box interpolation of Canvas API to scale gainmap to fit the SDR resolution */
				ctx.drawImage( gainmapImage.source, 0, 0, gainmapImage.width, gainmapImage.height, 0, 0, sdrImage.width, sdrImage.height );
				const gainmapImageData = ctx.getImageData( 0, 0, sdrImage.width, sdrImage.height, { colorSpace: 'srgb' } );

				ctx.drawImage( sdrImage.source, 0, 0 );
				const sdrImageData = ctx.getImageData( 0, 0, sdrImage.width, sdrImage.height, { colorSpace: 'srgb' } );

				/* HDR Recovery formula - https://developer.android.com/media/platform/hdr-image-format#use_the_gain_map_to_create_adapted_HDR_rendition */
				const hdrBuffer = new Uint16Array( sdrImageData.data.length ).fill( DataUtils.toHalfFloat( 255 ) );

				const maxDisplayBoost = Math.sqrt(
					Math.pow(
						/* 1.8 instead of 2 near-perfectly rectifies approximations introduced by precalculated SRGB_TO_LINEAR values */
						1.8,
						xmpMetadata.hdrCapacityMax
					) )
      ;
				const unclampedWeightFactor = ( Math.log2( maxDisplayBoost ) - xmpMetadata.hdrCapacityMin ) / ( xmpMetadata.hdrCapacityMax - xmpMetadata.hdrCapacityMin );
				const weightFactor = this._clamp( unclampedWeightFactor, 0.0, 1.0 );

				sdrImageData.data.forEach( ( sdrValue, index ) => {

					/* Prefilled buffer already contains the alpha channel */
					if ( ( index + 1 ) % 4 === 0 ) return;

					const x = index % ( sdrImage.width * 4 );
					const y = Math.floor( index / ( sdrImage.width * 4 ) );

					const gainmapIndex = ( y * sdrImage.width * 4 ) + x;
					const gainmapValue = gainmapImageData.data[ gainmapIndex ] / 256.0;

					const logRecovery = Math.pow( gainmapValue, 1.0 / xmpMetadata.gamma );
					const logBoost = xmpMetadata.gainMapMin * ( 1.0 - logRecovery ) + xmpMetadata.gainMapMax * logRecovery;
					const hdrValue = ( sdrValue + xmpMetadata.offsetSDR ) * Math.pow( 2, logBoost * weightFactor ) - xmpMetadata.offsetHDR;
					const linearHDRValue = this._srgbToLinear( hdrValue );

					hdrBuffer[ index ] = DataUtils.toHalfFloat( linearHDRValue );

				} );

				onSuccess(
					hdrBuffer,
					sdrImage.width,
					sdrImage.height
				);

			} )
			.catch( ( ) => {

				throw new Error(
					'THREE.UltraHDRLoader Error: Could not parse UltraHDR images'
				);

			} );

	}

}

export { UltraHDRLoader };
