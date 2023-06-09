import {
	CompressedTextureLoader,
	RGBAFormat,
	RGBA_S3TC_DXT3_Format,
	RGBA_S3TC_DXT5_Format,
	RGB_ETC1_Format,
	RGB_S3TC_DXT1_Format
} from 'three';

class DDSLoader extends CompressedTextureLoader {

	constructor( manager ) {

		super( manager );

	}

	parse( buffer, loadMipmaps ) {

		const dds = { mipmaps: [], width: 0, height: 0, format: null, mipmapCount: 1 };

		// Adapted from @toji's DDS utils
		// https://github.com/toji/webgl-texture-utils/blob/master/texture-util/dds.js

		// All values and structures referenced from:
		// http://msdn.microsoft.com/en-us/library/bb943991.aspx/

		const DDS_MAGIC = 0x20534444;

		// const DDSD_CAPS = 0x1;
		// const DDSD_HEIGHT = 0x2;
		// const DDSD_WIDTH = 0x4;
		// const DDSD_PITCH = 0x8;
		// const DDSD_PIXELFORMAT = 0x1000;
		const DDSD_MIPMAPCOUNT = 0x20000;
		// const DDSD_LINEARSIZE = 0x80000;
		// const DDSD_DEPTH = 0x800000;

		// const DDSCAPS_COMPLEX = 0x8;
		// const DDSCAPS_MIPMAP = 0x400000;
		// const DDSCAPS_TEXTURE = 0x1000;

		const DDSCAPS2_CUBEMAP = 0x200;
		const DDSCAPS2_CUBEMAP_POSITIVEX = 0x400;
		const DDSCAPS2_CUBEMAP_NEGATIVEX = 0x800;
		const DDSCAPS2_CUBEMAP_POSITIVEY = 0x1000;
		const DDSCAPS2_CUBEMAP_NEGATIVEY = 0x2000;
		const DDSCAPS2_CUBEMAP_POSITIVEZ = 0x4000;
		const DDSCAPS2_CUBEMAP_NEGATIVEZ = 0x8000;
		// const DDSCAPS2_VOLUME = 0x200000;

		// const DDPF_ALPHAPIXELS = 0x1;
		// const DDPF_ALPHA = 0x2;
		// const DDPF_FOURCC = 0x4;
		// const DDPF_RGB = 0x40;
		// const DDPF_YUV = 0x200;
		// const DDPF_LUMINANCE = 0x20000;

		function fourCCToInt32( value ) {

			return value.charCodeAt( 0 ) +
				( value.charCodeAt( 1 ) << 8 ) +
				( value.charCodeAt( 2 ) << 16 ) +
				( value.charCodeAt( 3 ) << 24 );

		}

		function int32ToFourCC( value ) {

			return String.fromCharCode(
				value & 0xff,
				( value >> 8 ) & 0xff,
				( value >> 16 ) & 0xff,
				( value >> 24 ) & 0xff
			);

		}

		function loadARGBMip( buffer, dataOffset, width, height ) {

			const dataLength = width * height * 4;
			const srcBuffer = new Uint8Array( buffer, dataOffset, dataLength );
			const byteArray = new Uint8Array( dataLength );
			let dst = 0;
			let src = 0;
			for ( let y = 0; y < height; y ++ ) {

				for ( let x = 0; x < width; x ++ ) {

					const b = srcBuffer[ src ]; src ++;
					const g = srcBuffer[ src ]; src ++;
					const r = srcBuffer[ src ]; src ++;
					const a = srcBuffer[ src ]; src ++;
					byteArray[ dst ] = r; dst ++;	//r
					byteArray[ dst ] = g; dst ++;	//g
					byteArray[ dst ] = b; dst ++;	//b
					byteArray[ dst ] = a; dst ++;	//a

				}

			}

			return byteArray;

		}

		const FOURCC_DXT1 = fourCCToInt32( 'DXT1' );
		const FOURCC_DXT3 = fourCCToInt32( 'DXT3' );
		const FOURCC_DXT5 = fourCCToInt32( 'DXT5' );
		const FOURCC_ETC1 = fourCCToInt32( 'ETC1' );

		const headerLengthInt = 31; // The header length in 32 bit ints

		// Offsets into the header array

		const off_magic = 0;

		const off_size = 1;
		const off_flags = 2;
		const off_height = 3;
		const off_width = 4;

		const off_mipmapCount = 7;

		// const off_pfFlags = 20;
		const off_pfFourCC = 21;
		const off_RGBBitCount = 22;
		const off_RBitMask = 23;
		const off_GBitMask = 24;
		const off_BBitMask = 25;
		const off_ABitMask = 26;

		// const off_caps = 27;
		const off_caps2 = 28;
		// const off_caps3 = 29;
		// const off_caps4 = 30;

		// Parse header

		const header = new Int32Array( buffer, 0, headerLengthInt );

		if ( header[ off_magic ] !== DDS_MAGIC ) {

			console.error( 'THREE.DDSLoader.parse: Invalid magic number in DDS header.' );
			return dds;

		}

		let blockBytes;

		const fourCC = header[ off_pfFourCC ];

		let isRGBAUncompressed = false;

		switch ( fourCC ) {

			case FOURCC_DXT1:

				blockBytes = 8;
				dds.format = RGB_S3TC_DXT1_Format;
				break;

			case FOURCC_DXT3:

				blockBytes = 16;
				dds.format = RGBA_S3TC_DXT3_Format;
				break;

			case FOURCC_DXT5:

				blockBytes = 16;
				dds.format = RGBA_S3TC_DXT5_Format;
				break;

			case FOURCC_ETC1:

				blockBytes = 8;
				dds.format = RGB_ETC1_Format;
				break;

			default:

				if ( header[ off_RGBBitCount ] === 32
					&& header[ off_RBitMask ] & 0xff0000
					&& header[ off_GBitMask ] & 0xff00
					&& header[ off_BBitMask ] & 0xff
					&& header[ off_ABitMask ] & 0xff000000 ) {

					isRGBAUncompressed = true;
					blockBytes = 64;
					dds.format = RGBAFormat;

				} else {

					console.error( 'THREE.DDSLoader.parse: Unsupported FourCC code ', int32ToFourCC( fourCC ) );
					return dds;

				}

		}

		dds.mipmapCount = 1;

		if ( header[ off_flags ] & DDSD_MIPMAPCOUNT && loadMipmaps !== false ) {

			dds.mipmapCount = Math.max( 1, header[ off_mipmapCount ] );

		}

		const caps2 = header[ off_caps2 ];
		dds.isCubemap = caps2 & DDSCAPS2_CUBEMAP ? true : false;
		if ( dds.isCubemap && (
			! ( caps2 & DDSCAPS2_CUBEMAP_POSITIVEX ) ||
			! ( caps2 & DDSCAPS2_CUBEMAP_NEGATIVEX ) ||
			! ( caps2 & DDSCAPS2_CUBEMAP_POSITIVEY ) ||
			! ( caps2 & DDSCAPS2_CUBEMAP_NEGATIVEY ) ||
			! ( caps2 & DDSCAPS2_CUBEMAP_POSITIVEZ ) ||
			! ( caps2 & DDSCAPS2_CUBEMAP_NEGATIVEZ )
		) ) {

			console.error( 'THREE.DDSLoader.parse: Incomplete cubemap faces' );
			return dds;

		}

		dds.width = header[ off_width ];
		dds.height = header[ off_height ];

		let dataOffset = header[ off_size ] + 4;

		// Extract mipmaps buffers

		const faces = dds.isCubemap ? 6 : 1;

		for ( let face = 0; face < faces; face ++ ) {

			let width = dds.width;
			let height = dds.height;

			for ( let i = 0; i < dds.mipmapCount; i ++ ) {

				let byteArray, dataLength;

				if ( isRGBAUncompressed ) {

					byteArray = loadARGBMip( buffer, dataOffset, width, height );
					dataLength = byteArray.length;

				} else {

					dataLength = Math.max( 4, width ) / 4 * Math.max( 4, height ) / 4 * blockBytes;
					byteArray = new Uint8Array( buffer, dataOffset, dataLength );

				}

				const mipmap = { 'data': byteArray, 'width': width, 'height': height };
				dds.mipmaps.push( mipmap );

				dataOffset += dataLength;

				width = Math.max( width >> 1, 1 );
				height = Math.max( height >> 1, 1 );

			}

		}

		return dds;

	}

}

export { DDSLoader };
