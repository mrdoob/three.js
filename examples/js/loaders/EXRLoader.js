/**
 * @author Richard M. / https://github.com/richardmonette
 */

// https://github.com/mrdoob/three.js/issues/10652
// https://en.wikipedia.org/wiki/OpenEXR

THREE.EXRLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.EXRLoader.prototype = Object.create( THREE.DataTextureLoader.prototype );

THREE.EXRLoader.prototype._parser = function ( buffer ) {

	var parseNullTerminatedString = function( buffer, offset ) {

		var uintBuffer = new Uint8Array( buffer );
		var endOffset = 0;

		while ( uintBuffer[ offset.value + endOffset ] != 0 ) {

			endOffset += 1;

		}

		var stringValue = new TextDecoder().decode(
			new Uint8Array( buffer ).slice( offset.value, offset.value + endOffset )
		);

		offset.value = offset.value + endOffset + 1;

		return stringValue;

	}

	var parseFixedLengthString = function( buffer, offset, size ) {

		var stringValue = new TextDecoder().decode(
			new Uint8Array( buffer ).slice( offset.value, offset.value + size )
		);

		offset.value = offset.value + size;

		return stringValue;

	}

	var parseUlong = function( buffer, offset ) {

		var uLong = new DataView( buffer.slice( offset.value, offset.value + 4 ) ).getUint32( 0, true );

		offset.value = offset.value + 8;

		return uLong;

	}

	var parseUint32 = function( buffer, offset ) {

		var Uint32 = new DataView( buffer.slice( offset.value, offset.value + 4 ) ).getUint32( 0, true );

		offset.value = offset.value + 4;

		return Uint32;

	}

	var parseUint8 = function( buffer, offset ) {

		var Uint8 = new DataView( buffer.slice( offset.value, offset.value + 1 ) ).getUint8( 0, true );

		offset.value = offset.value + 1;

		return Uint8;

	}

	var parseFloat32 = function( buffer, offset ) {

		var float = new DataView( buffer.slice( offset.value, offset.value + 4 ) ).getFloat32( 0, true );

		offset.value += 4;

		return float;

	}

	// https://stackoverflow.com/questions/5678432/decompressing-half-precision-floats-in-javascript
	var decodeFloat16 = function( binary ) {

		var exponent = ( binary & 0x7C00 ) >> 10,
		fraction = binary & 0x03FF;

		return ( binary >> 15 ? - 1 : 1 ) * (
				exponent ?
				(
						exponent === 0x1F ?
						fraction ? NaN : Infinity :
						Math.pow( 2, exponent - 15 ) * ( 1 + fraction / 0x400 )
				) :
				6.103515625e-5 * ( fraction / 0x400 )
		);

	}

	var parseFloat16 = function( buffer, offset ) {

		var float = new DataView( buffer.slice( offset.value, offset.value + 2 ) ).getUint16( 0, true );

		offset.value += 2;

		return decodeFloat16( float );

	}

	var parseChlist = function( buffer, offset, size ) {

		var startOffset = offset.value;
		var channels = [];

		while ( offset.value < ( startOffset + size - 1 ) ) {

			var name = parseNullTerminatedString( buffer, offset );
			var pixelType = parseUint32( buffer, offset ); // TODO: Cast this to UINT, HALF or FLOAT
			var pLinear = parseUint8( buffer, offset );
			offset.value += 3; // reserved, three chars
			var xSampling = parseUint32( buffer, offset );
			var ySampling = parseUint32( buffer, offset );

			channels.push( {
				name: name,
				pixelType: pixelType,
				pLinear: pLinear,
				xSampling: xSampling,
				ySampling: ySampling
			} );

		}

		offset.value += 1;

		return channels;

	}

	var parseChromaticities = function( buffer, offset ) {

		var redX = parseFloat32( buffer, offset );
		var redY = parseFloat32( buffer, offset );
		var greenX = parseFloat32( buffer, offset );
		var greenY = parseFloat32( buffer, offset );
		var blueX = parseFloat32( buffer, offset );
		var blueY = parseFloat32( buffer, offset );
		var whiteX = parseFloat32( buffer, offset );
		var whiteY = parseFloat32( buffer, offset );

		return { redX: redX, redY: redY, greenX, greenY, blueX, blueY, whiteX, whiteY };

	}

	var parseCompression = function( buffer, offset ) {

		var compressionCodes = [
			'NO_COMPRESSION',
			'PIZ_COMPRESSION'
		];

		var compression = parseUint8( buffer, offset );

		return compressionCodes[ compression ];

	}

	var parseBox2i = function( buffer, offset ) {

		var xMin = parseUint32( buffer, offset );
		var yMin = parseUint32( buffer, offset );
		var xMax = parseUint32( buffer, offset );
		var yMax = parseUint32( buffer, offset );

		return { xMin: xMin, yMin: yMin, xMax: xMax, yMax: yMax };

	}

	var parseLineOrder = function( buffer, offset ) {

		var lineOrders = [
			'INCREASING_Y'
		];

		var lineOrder = parseUint8( buffer, offset );

		return lineOrders[ lineOrder ];

	}

	var parseV2f = function( buffer, offset ) {

		var x = parseFloat32( buffer, offset );
		var y = parseFloat32( buffer, offset );

		return [ x, y ];

	}

	var parseValue = function( buffer, offset, type, size ) {

		if ( type == 'string' || type == 'iccProfile' ) {

			return parseFixedLengthString( buffer, offset, size );

		} else if ( type == 'chlist' ) {

			return parseChlist( buffer, offset, size );

		} else if ( type == 'chromaticities' ) {

			return parseChromaticities( buffer, offset );

		} else if ( type == 'compression' ) {

			return parseCompression( buffer, offset );

		} else if ( type == 'box2i' ) {

			return parseBox2i( buffer, offset );

		} else if ( type == 'lineOrder' ) {

			return parseLineOrder( buffer, offset );

		} else if ( type == 'float' ) {

			return parseFloat32( buffer, offset );

		} else if ( type == 'v2f' ) {

			return parseV2f( buffer, offset );

		} else {

			throw 'Cannot parse value for unsupported type: ' + type;

		}

	}

	var EXRHeader = {};

	var magic = new DataView( buffer ).getUint32( 0, true );
	var versionByteZero = new DataView( buffer ).getUint8( 4, true );
	var fullMask = new DataView( buffer ).getUint8( 5, true );

	// start of header

	var offset = { value: 8 }; // start at 8, after magic stuff

	var keepReading = true;

	while ( keepReading ) {

		var attributeName = parseNullTerminatedString( buffer, offset );

		if ( attributeName == 0 ) {

			keepReading = false;

		} else {

			var attributeType = parseNullTerminatedString( buffer, offset );
			var attributeSize = parseUint32( buffer, offset );
			var attributeValue = parseValue( buffer, offset, attributeType, attributeSize );

			EXRHeader[ attributeName ] = attributeValue;

		}

	}

	// offsets

	var dataWindowHeight = EXRHeader.dataWindow.yMax + 1;
	var scanlineBlockSize = 1; // 1 for no compression, 32 for PIZ
	var numBlocks = dataWindowHeight / scanlineBlockSize;

	for ( var i = 0; i < numBlocks; i ++ ) {

		var scanlineOffset = parseUlong( buffer, offset );

	}

	// we should be passed the scanline offset table, start reading pixel data

	var byteArray = new Float32Array( EXRHeader.dataWindow.xMax * EXRHeader.dataWindow.yMax * 4 );

	var channelOffsets = {
		R: 0,
		G: 1,
		B: 2,
		A: 3
	};

	for ( var y = 0; y < EXRHeader.dataWindow.yMax + 1; y ++ ) {

		var y_scanline = parseUint32( buffer, offset );
		var dataSize = parseUint32( buffer, offset );

		for ( var channelID = 0; channelID < EXRHeader.channels.length; channelID ++ ) {
			if ( EXRHeader.channels[ channelID ].pixelType == 1 ) {
			 // HALF
				for ( var x = 0; x < EXRHeader.dataWindow.xMax + 1; x ++ ) {

					var val = parseFloat16( buffer, offset );
					var cOff = channelOffsets[ EXRHeader.channels[ channelID ].name ];

					byteArray[ ( ( ( EXRHeader.dataWindow.yMax - y_scanline ) * ( EXRHeader.dataWindow.xMax * 4 ) ) + ( x * 4 ) ) + cOff ] = val;

				}

			} else {

				throw 'Only supported pixel format is HALF';

			}

		}

	}

	return {
		header: EXRHeader,
		width: EXRHeader.dataWindow.xMax,
		height: EXRHeader.dataWindow.yMax,
		data: byteArray,
		format: THREE.RGBAFormat,
		type: THREE.FloatType
	};

};
