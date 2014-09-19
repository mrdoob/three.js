/*    
 *	 PVRLoader
 *   Author: pierre lepers
 *   Date: 17/09/2014 11:09
 *
 *	 PVR v2 (legacy) parser
 *   TODO : Add Support for PVR v3 format
 */


THREE.PVRLoader = function () {
	this._parser = THREE.PVRLoader.parse;
};

THREE.PVRLoader.prototype = Object.create( THREE.CompressedTextureLoader.prototype );


THREE.PVRLoader.parse = function ( buffer, loadMipmaps ) {
	
	var pvr = { mipmaps: [], width: 0, height: 0, format: null, mipmapCount: 1, isCubemap : false };


	var headerLengthInt = 13;

	var header = new Uint32Array( buffer, 0, headerLengthInt );


	// texturetool format
	var headerLength  =  header[0],
		height        =  header[1],
		width         =  header[2],
		numMipmaps    =  header[3],
		flags         =  header[4],
		dataLength    =  header[5],
		bpp           =  header[6],
		bitmaskRed    =  header[7],
		bitmaskGreen  =  header[8],
		bitmaskBlue   =  header[9],
		bitmaskAlpha  =  header[10],
		pvrTag        =  header[11],
		numSurfs      =  header[12]



	var PVR_TEXTURE_FLAG_TYPE_MASK = 0xff
	var PVRTextureFlagTypePVRTC_2 = 24,
		PVRTextureFlagTypePVRTC_4 = 25

	var formatFlags = flags & PVR_TEXTURE_FLAG_TYPE_MASK;

	// console.log( "--------------------------" );

	// console.log( "headerLength ", headerLength);
	// console.log( "height       ", height      );
	// console.log( "width        ", width       );
	// console.log( "numMipmaps   ", numMipmaps  );
	// console.log( "flags        ", flags       );
	// console.log( "dataLength   ", dataLength  );
	// console.log( "bpp          ", bpp         );
	// console.log( "bitmaskRed   ", bitmaskRed  );
	// console.log( "bitmaskGreen ", bitmaskGreen);
	// console.log( "bitmaskBlue  ", bitmaskBlue );
	// console.log( "bitmaskAlpha ", bitmaskAlpha);
	// console.log( "pvrTag       ", pvrTag      );
	// console.log( "numSurfs     ", numSurfs    );


	if (formatFlags == PVRTextureFlagTypePVRTC_4 || formatFlags == PVRTextureFlagTypePVRTC_2)
	{

	  var _hasAlpha = bitmaskAlpha > 0;
	  // has alpha???

	  if (formatFlags == PVRTextureFlagTypePVRTC_4)
		pvr.format = _hasAlpha ? THREE.RGBA_PVRTC_4BPPV1_Format : THREE.RGB_PVRTC_4BPPV1_Format;
	  else if (formatFlags == PVRTextureFlagTypePVRTC_2)
		pvr.format = _hasAlpha ? THREE.RGBA_PVRTC_2BPPV1_Format : THREE.RGB_PVRTC_2BPPV1_Format;
	  else
		throw new Error( "pvrtc - unknown format "+formatFlags);

	  pvr.width  = width;
	  pvr.height = height;
	  pvr.isCubemap = (numSurfs === 6);


	  var dataOffset = headerLength,
		  dataSize = 0,
		  blockSize = 0,
		  widthBlocks = 0,
		  heightBlocks = 0,
		  bpp = 4;

	  dataLength += headerLength;

	  for ( var surfIndex = 0; surfIndex < numSurfs; surfIndex ++ ) {

		  var sWidth = width,
			  sHeight = height;

		  var mipLevel = 0;

		  while (mipLevel < numMipmaps + 1 ) {



			if (formatFlags == PVRTextureFlagTypePVRTC_4)
			{
			  blockSize = 4 * 4; // Pixel by pixel block size for 4bpp
			  widthBlocks = sWidth / 4;
			  heightBlocks = sHeight / 4;
			  bpp = 4;
			}
			else
			{
			  blockSize = 8 * 4; // Pixel by pixel block size for 2bpp
			  widthBlocks = sWidth / 8;
			  heightBlocks = sHeight / 4;
			  bpp = 2;
			}

			// Clamp to minimum number of blocks
			if (widthBlocks < 2)
			  widthBlocks = 2;
			if (heightBlocks < 2)
			  heightBlocks = 2;


			dataSize = widthBlocks * heightBlocks * ((blockSize  * bpp) / 8);

			var byteArray = new Uint8Array( buffer, dataOffset, dataSize );

			var mipmap = { "data": byteArray, "width": sWidth, "height": sHeight };
			pvr.mipmaps.push( mipmap );

			dataOffset += dataSize;

			sWidth = Math.max(sWidth >> 1, 1);
			sHeight = Math.max(sHeight >> 1, 1);

			mipLevel++;

		  }

	  }

	}

	// Assert file is fully parsed?
	//console.log( "data left : ", dataOffset - dataLength );
	//assert( dataOffset === dataLength );

	return pvr;
}