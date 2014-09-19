/*    
 *	 PVRLoader
 *   Author: pierre lepers
 *   Date: 17/09/2014 11:09
 *
 *	 PVR v2 (legacy) parser
 *   TODO : Add Support for PVR v3 format
 *   TODO : implement loadMipmaps option
 */


THREE.PVRLoader = function () {
	this._parser = THREE.PVRLoader.parse;
};

THREE.PVRLoader.prototype = Object.create( THREE.CompressedTextureLoader.prototype );


THREE.PVRLoader.parse = function ( buffer, loadMipmaps ) {
	var headerLengthInt = 13;
	var header = new Uint32Array( buffer, 0, headerLengthInt );

	var pvrDatas = {
		buffer: buffer,
		header : header,
		loadMipmaps : loadMipmaps
	};

	if( header[0] === 0x03525650 ) {
		// PVR v3
		return THREE.PVRLoader._parseV3( pvrDatas );
	} else if( header[11] === 0x21525650) {
		// PVR v2
		return THREE.PVRLoader._parseV2( pvrDatas );

	} else {
		throw new Error( "[THREE.PVRLoader] Unknown PVR format" );
	}

};

THREE.PVRLoader._parseV3 = function ( pvrDatas ) {
	
	var buffer = pvrDatas.buffer;
	var header = pvrDatas.header;
};

THREE.PVRLoader._parseV2 = function ( pvrDatas ) {

	var buffer = pvrDatas.buffer;
	var header = pvrDatas.header;

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
		numSurfs      =  header[12];


	var TYPE_MASK = 0xff
	var PVRTC_2 = 24,
		PVRTC_4 = 25

	var formatFlags = flags & TYPE_MASK;



	var bpp, format;
	var _hasAlpha = bitmaskAlpha > 0;

	if (formatFlags == PVRTC_4 ) {
		format = _hasAlpha ? THREE.RGBA_PVRTC_4BPPV1_Format : THREE.RGB_PVRTC_4BPPV1_Format;
		bpp = 4;
	}
	else if( formatFlags == PVRTC_2) {
		format = _hasAlpha ? THREE.RGBA_PVRTC_4BPPV1_Format : THREE.RGB_PVRTC_4BPPV1_Format;
		bpp = 2;
	}
	else
		throw new Error( "pvrtc - unknown format "+formatFlags);
	


	pvrDatas.dataPtr 	= headerLength;
  	pvrDatas.bpp 		= bpp;
  	pvrDatas.format 	= format;
  	pvrDatas.width 		= width;
  	pvrDatas.height 	= height;
  	pvrDatas.numSurfaces = numSurfs;
  	pvrDatas.numMipmaps 	= numMipmaps;

  	// guess cubemap type seems tricky in v2
  	// it juste a pvr containing 6 surface (no explicit cubemap type)
  	pvrDatas.isCubemap 	= (numSurfs === 6);

  	return THREE.PVRLoader._extract( pvrDatas );

};

THREE.PVRLoader._extract = function ( pvrDatas ) {
	
	var pvr = { mipmaps: [], width: pvrDatas.width, height: pvrDatas.height, format: pvrDatas.format, mipmapCount: pvrDatas.numMipmaps+1, isCubemap : pvrDatas.isCubemap };

	var buffer = pvrDatas.buffer;



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




	var dataOffset = pvrDatas.dataPtr,
		bpp = pvrDatas.bpp,
		numSurfs = pvrDatas.numSurfaces,
		dataSize = 0,
		blockSize = 0,
		blockWidth = 0,
		blockHeight = 0,
		widthBlocks = 0,
		heightBlocks = 0;



	if( bpp === 2 ){
		blockWidth = 8;
		blockHeight = 4;
	} else {
		blockWidth = 4;
		blockHeight = 4;
	}

	blockSize = blockWidth * blockHeight;



	for ( var surfIndex = 0; surfIndex < numSurfs; surfIndex ++ ) {

		var sWidth = pvrDatas.width,
			sHeight = pvrDatas.height;

		var mipLevel = 0;

		while (mipLevel < pvrDatas.numMipmaps + 1 ) {



			widthBlocks = sWidth / blockWidth;
			heightBlocks = sHeight / blockHeight;

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


	return pvr;
}