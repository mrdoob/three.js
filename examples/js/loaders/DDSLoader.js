/*
 * @author mrdoob / http://mrdoob.com/
 */

THREE.DDSLoader = function () {
	this._parser = THREE.DDSLoader.parse;
};

THREE.DDSLoader.prototype = Object.create( THREE.CompressedTextureLoader.prototype );
THREE.DDSLoader.prototype.constructor = THREE.DDSLoader;

THREE.DDSLoader.parse = function ( buffer, loadMipmaps ) {

	var dds = { mipmaps: [], width: 0, height: 0, format: null, mipmapCount: 1 };

	// Adapted from @toji's DDS utils
	//	https://github.com/toji/webgl-texture-utils/blob/master/texture-util/dds.js

	// All values and structures referenced from:
	// http://msdn.microsoft.com/en-us/library/bb943991.aspx/

	var DDS_MAGIC = 0x20534444;

	var DDSD_CAPS = 0x1,
		DDSD_HEIGHT = 0x2,
		DDSD_WIDTH = 0x4,
		DDSD_PITCH = 0x8,
		DDSD_PIXELFORMAT = 0x1000,
		DDSD_MIPMAPCOUNT = 0x20000,
		DDSD_LINEARSIZE = 0x80000,
		DDSD_DEPTH = 0x800000;

	var DDSCAPS_COMPLEX = 0x8,
		DDSCAPS_MIPMAP = 0x400000,
		DDSCAPS_TEXTURE = 0x1000;

	var DDSCAPS2_CUBEMAP = 0x200,
		DDSCAPS2_CUBEMAP_POSITIVEX = 0x400,
		DDSCAPS2_CUBEMAP_NEGATIVEX = 0x800,
		DDSCAPS2_CUBEMAP_POSITIVEY = 0x1000,
		DDSCAPS2_CUBEMAP_NEGATIVEY = 0x2000,
		DDSCAPS2_CUBEMAP_POSITIVEZ = 0x4000,
		DDSCAPS2_CUBEMAP_NEGATIVEZ = 0x8000,
		DDSCAPS2_VOLUME = 0x200000;

	var DDPF_ALPHAPIXELS = 0x1,
		DDPF_ALPHA = 0x2,
		DDPF_FOURCC = 0x4,
		DDPF_RGB = 0x40,
		DDPF_YUV = 0x200,
		DDPF_LUMINANCE = 0x20000;

	function fourCCToInt32( value ) {

		return value.charCodeAt(0) +
			(value.charCodeAt(1) << 8) +
			(value.charCodeAt(2) << 16) +
			(value.charCodeAt(3) << 24);

	}

	function int32ToFourCC( value ) {

		return String.fromCharCode(
			value & 0xff,
			(value >> 8) & 0xff,
			(value >> 16) & 0xff,
			(value >> 24) & 0xff
		);
	}

	function loadARGBMip( buffer, dataOffset, width, height ) {
		var dataLength = width * height * 4;
		var srcBuffer = new Uint8Array( buffer, dataOffset, dataLength );
		var byteArray = new Uint8Array( dataLength );
		var dst = 0;
		var src = 0;
		for ( var y = 0; y < height; y ++ ) {
			for ( var x = 0; x < width; x ++ ) {
				var b = srcBuffer[src]; src ++;
				var g = srcBuffer[src]; src ++;
				var r = srcBuffer[src]; src ++;
				var a = srcBuffer[src]; src ++;
				byteArray[dst] = r; dst ++;	//r
				byteArray[dst] = g; dst ++;	//g
				byteArray[dst] = b; dst ++;	//b
				byteArray[dst] = a; dst ++;	//a
			}
		}
		return byteArray;
	}

	var FOURCC_DXT1 = fourCCToInt32("DXT1");
	var FOURCC_DXT3 = fourCCToInt32("DXT3");
	var FOURCC_DXT5 = fourCCToInt32("DXT5");

	var headerLengthInt = 31; // The header length in 32 bit ints

	// Offsets into the header array

	var off_magic = 0;

	var off_size = 1;
	var off_flags = 2;
	var off_height = 3;
	var off_width = 4;

	var off_mipmapCount = 7;

	var off_pfFlags = 20;
	var off_pfFourCC = 21;
	var off_RGBBitCount = 22;
	var off_RBitMask = 23;
	var off_GBitMask = 24;
	var off_BBitMask = 25;
	var off_ABitMask = 26;

	var off_caps = 27;
	var off_caps2 = 28;
	var off_caps3 = 29;
	var off_caps4 = 30;

	// Parse header

	var header = new Int32Array( buffer, 0, headerLengthInt );

	if ( header[ off_magic ] !== DDS_MAGIC ) {

		console.error( 'THREE.DDSLoader.parse: Invalid magic number in DDS header.' );
		return dds;

	}

	if ( ! header[ off_pfFlags ] & DDPF_FOURCC ) {

		console.error( 'THREE.DDSLoader.parse: Unsupported format, must contain a FourCC code.' );
		return dds;

	}

	var blockBytes;

	var fourCC = header[ off_pfFourCC ];

	var isRGBAUncompressed = false;

	switch ( fourCC ) {

		case FOURCC_DXT1:

			blockBytes = 8;
			dds.format = THREE.RGB_S3TC_DXT1_Format;
			break;

		case FOURCC_DXT3:

			blockBytes = 16;
			dds.format = THREE.RGBA_S3TC_DXT3_Format;
			break;

		case FOURCC_DXT5:

			blockBytes = 16;
			dds.format = THREE.RGBA_S3TC_DXT5_Format;
			break;

		default:

			if ( header[off_RGBBitCount] == 32 
				&& header[off_RBitMask]&0xff0000
				&& header[off_GBitMask]&0xff00 
				&& header[off_BBitMask]&0xff
				&& header[off_ABitMask]&0xff000000  ) {
				isRGBAUncompressed = true;
				blockBytes = 64;
				dds.format = THREE.RGBAFormat;
			} else {
				console.error( 'THREE.DDSLoader.parse: Unsupported FourCC code ', int32ToFourCC( fourCC ) );
				return dds;
			}
	}

	dds.mipmapCount = 1;

	if ( header[ off_flags ] & DDSD_MIPMAPCOUNT && loadMipmaps !== false ) {

		dds.mipmapCount = Math.max( 1, header[ off_mipmapCount ] );

	}

	//TODO: Verify that all faces of the cubemap are present with DDSCAPS2_CUBEMAP_POSITIVEX, etc.

	dds.isCubemap = header[ off_caps2 ] & DDSCAPS2_CUBEMAP ? true : false;

	dds.width = header[ off_width ];
	dds.height = header[ off_height ];

	var dataOffset = header[ off_size ] + 4;

	// Extract mipmaps buffers

	var width = dds.width;
	var height = dds.height;

	var faces = dds.isCubemap ? 6 : 1;

	for ( var face = 0; face < faces; face ++ ) {

		for ( var i = 0; i < dds.mipmapCount; i ++ ) {

			if ( isRGBAUncompressed ) {
				var byteArray = loadARGBMip( buffer, dataOffset, width, height );
				var dataLength = byteArray.length;
			} else {
				var dataLength = Math.max( 4, width ) / 4 * Math.max( 4, height ) / 4 * blockBytes;
				var byteArray = new Uint8Array( buffer, dataOffset, dataLength );
			}
			
			var mipmap = { "data": byteArray, "width": width, "height": height };
			dds.mipmaps.push( mipmap );

			dataOffset += dataLength;

			width = Math.max( width * 0.5, 1 );
			height = Math.max( height * 0.5, 1 );

		}

		width = dds.width;
		height = dds.height;

	}

	return dds;

};

