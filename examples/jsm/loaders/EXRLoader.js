/**
 * @author Richard M. / https://github.com/richardmonette
 *
 * OpenEXR loader which, currently, supports reading 16 bit half data, in either
 * uncompressed or PIZ wavelet compressed form.
 *
 * Referred to the original Industrial Light & Magic OpenEXR implementation and the TinyEXR / Syoyo Fujita
 * implementation, so I have preserved their copyright notices.
 */

import {
	DataTextureLoader,
	DefaultLoadingManager,
	FloatType,
	HalfFloatType,
	RGBAFormat,
	RGBFormat
} from "../../../build/three.module.js";

// /*
// Copyright (c) 2014 - 2017, Syoyo Fujita
// All rights reserved.

// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Syoyo Fujita nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// */

// // TinyEXR contains some OpenEXR code, which is licensed under ------------

// ///////////////////////////////////////////////////////////////////////////
// //
// // Copyright (c) 2002, Industrial Light & Magic, a division of Lucas
// // Digital Ltd. LLC
// //
// // All rights reserved.
// //
// // Redistribution and use in source and binary forms, with or without
// // modification, are permitted provided that the following conditions are
// // met:
// // *       Redistributions of source code must retain the above copyright
// // notice, this list of conditions and the following disclaimer.
// // *       Redistributions in binary form must reproduce the above
// // copyright notice, this list of conditions and the following disclaimer
// // in the documentation and/or other materials provided with the
// // distribution.
// // *       Neither the name of Industrial Light & Magic nor the names of
// // its contributors may be used to endorse or promote products derived
// // from this software without specific prior written permission.
// //
// // THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// // "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// // LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// // A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// // OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// // SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// // LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// // DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// // THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// // (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// // OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// //
// ///////////////////////////////////////////////////////////////////////////

// // End of OpenEXR license -------------------------------------------------

var EXRLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;
	this.type = FloatType;

};

EXRLoader.prototype = Object.create( DataTextureLoader.prototype );

EXRLoader.prototype.setDataType = function ( value ) {

	this.type = value;
	return this;

};

EXRLoader.prototype.setType = function ( value ) {

	console.warn( 'THREE.EXRLoader: .setType() has been renamed to .setDataType().' );

	return this.setDataType( value );

};

EXRLoader.prototype._parser = function ( buffer ) {

	const USHORT_RANGE = ( 1 << 16 );
	const BITMAP_SIZE = ( USHORT_RANGE >> 3 );

	const HUF_ENCBITS = 16; // literal (value) bit length
	const HUF_DECBITS = 14; // decoding bit size (>= 8)

	const HUF_ENCSIZE = ( 1 << HUF_ENCBITS ) + 1; // encoding table size
	const HUF_DECSIZE = 1 << HUF_DECBITS; // decoding table size
	const HUF_DECMASK = HUF_DECSIZE - 1;

	const SHORT_ZEROCODE_RUN = 59;
	const LONG_ZEROCODE_RUN = 63;
	const SHORTEST_LONG_RUN = 2 + LONG_ZEROCODE_RUN - SHORT_ZEROCODE_RUN;

	const BYTES_PER_HALF = 2;

	const ULONG_SIZE = 8;
	const FLOAT32_SIZE = 4;
	const INT32_SIZE = 4;
	const INT16_SIZE = 2;
	const INT8_SIZE = 1;

	function reverseLutFromBitmap( bitmap, lut ) {

		var k = 0;

		for ( var i = 0; i < USHORT_RANGE; ++ i ) {

			if ( ( i == 0 ) || ( bitmap[ i >> 3 ] & ( 1 << ( i & 7 ) ) ) ) {

				lut[ k ++ ] = i;

			}

		}

		var n = k - 1;

		while ( k < USHORT_RANGE ) lut[ k ++ ] = 0;

		return n;

	}

	function hufClearDecTable( hdec ) {

		for ( var i = 0; i < HUF_DECSIZE; i ++ ) {

			hdec[ i ] = {};
			hdec[ i ].len = 0;
			hdec[ i ].lit = 0;
			hdec[ i ].p = null;

		}

	}

	const getBitsReturn = { l: 0, c: 0, lc: 0 };

	function getBits( nBits, c, lc, uInt8Array, inOffset ) {

		while ( lc < nBits ) {

			c = ( c << 8 ) | parseUint8Array( uInt8Array, inOffset );
			lc += 8;

		}

		lc -= nBits;

		getBitsReturn.l = ( c >> lc ) & ( ( 1 << nBits ) - 1 );
		getBitsReturn.c = c;
		getBitsReturn.lc = lc;

	}

	const hufTableBuffer = new Array( 59 );

	function hufCanonicalCodeTable( hcode ) {

		for ( var i = 0; i <= 58; ++ i ) hufTableBuffer[ i ] = 0;
		for ( var i = 0; i < HUF_ENCSIZE; ++ i ) hufTableBuffer[ hcode[ i ] ] += 1;

		var c = 0;

		for ( var i = 58; i > 0; -- i ) {

			var nc = ( ( c + hufTableBuffer[ i ] ) >> 1 );
			hufTableBuffer[ i ] = c;
			c = nc;

		}

		for ( var i = 0; i < HUF_ENCSIZE; ++ i ) {

			var l = hcode[ i ];
			if ( l > 0 ) hcode[ i ] = l | ( hufTableBuffer[ l ] ++ << 6 );

		}

	}

	function hufUnpackEncTable( uInt8Array, inDataView, inOffset, ni, im, iM, hcode ) {

		var p = inOffset;
		var c = 0;
		var lc = 0;

		for ( ; im <= iM; im ++ ) {

			if ( p.value - inOffset.value > ni ) return false;

			getBits( 6, c, lc, uInt8Array, p );

			var l = getBitsReturn.l;
			c = getBitsReturn.c;
			lc = getBitsReturn.lc;

			hcode[ im ] = l;

			if ( l == LONG_ZEROCODE_RUN ) {

				if ( p.value - inOffset.value > ni ) {

					throw 'Something wrong with hufUnpackEncTable';

				}

				getBits( 8, c, lc, uInt8Array, p );

				var zerun = getBitsReturn.l + SHORTEST_LONG_RUN;
				c = getBitsReturn.c;
				lc = getBitsReturn.lc;

				if ( im + zerun > iM + 1 ) {

					throw 'Something wrong with hufUnpackEncTable';

				}

				while ( zerun -- ) hcode[ im ++ ] = 0;

				im --;

			} else if ( l >= SHORT_ZEROCODE_RUN ) {

				var zerun = l - SHORT_ZEROCODE_RUN + 2;

				if ( im + zerun > iM + 1 ) {

					throw 'Something wrong with hufUnpackEncTable';

				}

				while ( zerun -- ) hcode[ im ++ ] = 0;

				im --;

			}

		}

		hufCanonicalCodeTable( hcode );

	}

	function hufLength( code ) {

		return code & 63;

	}

	function hufCode( code ) {

		return code >> 6;

	}

	function hufBuildDecTable( hcode, im, iM, hdecod ) {

		for ( ; im <= iM; im ++ ) {

			var c = hufCode( hcode[ im ] );
			var l = hufLength( hcode[ im ] );

			if ( c >> l ) {

				throw 'Invalid table entry';

			}

			if ( l > HUF_DECBITS ) {

				var pl = hdecod[ ( c >> ( l - HUF_DECBITS ) ) ];

				if ( pl.len ) {

					throw 'Invalid table entry';

				}

				pl.lit ++;

				if ( pl.p ) {

					var p = pl.p;
					pl.p = new Array( pl.lit );

					for ( var i = 0; i < pl.lit - 1; ++ i ) {

						pl.p[ i ] = p[ i ];

					}

				} else {

					pl.p = new Array( 1 );

				}

				pl.p[ pl.lit - 1 ] = im;

			} else if ( l ) {

				var plOffset = 0;

				for ( var i = 1 << ( HUF_DECBITS - l ); i > 0; i -- ) {

					var pl = hdecod[ ( c << ( HUF_DECBITS - l ) ) + plOffset ];

					if ( pl.len || pl.p ) {

						throw 'Invalid table entry';

					}

					pl.len = l;
					pl.lit = im;

					plOffset ++;

				}

			}

		}

		return true;

	}

	const getCharReturn = { c: 0, lc: 0 };

	function getChar( c, lc, uInt8Array, inOffset ) {

		c = ( c << 8 ) | parseUint8Array( uInt8Array, inOffset );
		lc += 8;

		getCharReturn.c = c;
		getCharReturn.lc = lc;

	}

	const getCodeReturn = { c: 0, lc: 0 };

	function getCode( po, rlc, c, lc, uInt8Array, inDataView, inOffset, outBuffer, outBufferOffset, outBufferEndOffset ) {

		if ( po == rlc ) {

			if ( lc < 8 ) {

				getChar( c, lc, uInt8Array, inOffset );
				c = getCharReturn.c;
				lc = getCharReturn.lc;

			}

			lc -= 8;

			var cs = ( c >> lc );
			var cs = new Uint8Array( [ cs ] )[ 0 ];

			if ( outBufferOffset.value + cs > outBufferEndOffset ) {

				return false;

			}

			var s = outBuffer[ outBufferOffset.value - 1 ];

			while ( cs -- > 0 ) {

				outBuffer[ outBufferOffset.value ++ ] = s;

			}

		} else if ( outBufferOffset.value < outBufferEndOffset ) {

			outBuffer[ outBufferOffset.value ++ ] = po;

		} else {

			return false;

		}

		getCodeReturn.c = c;
		getCodeReturn.lc = lc;

	}

	function UInt16( value ) {

		return ( value & 0xFFFF );

	}

	function Int16( value ) {

		var ref = UInt16( value );
		return ( ref > 0x7FFF ) ? ref - 0x10000 : ref;

	}

	const wdec14Return = { a: 0, b: 0 };

	function wdec14( l, h ) {

		var ls = Int16( l );
		var hs = Int16( h );

		var hi = hs;
		var ai = ls + ( hi & 1 ) + ( hi >> 1 );

		var as = ai;
		var bs = ai - hi;

		wdec14Return.a = as;
		wdec14Return.b = bs;

	}

	function wav2Decode( j, buffer, nx, ox, ny, oy ) {

		var n = ( nx > ny ) ? ny : nx;
		var p = 1;
		var p2;

		while ( p <= n ) p <<= 1;

		p >>= 1;
		p2 = p;
		p >>= 1;

		while ( p >= 1 ) {

			var py = 0;
			var ey = py + oy * ( ny - p2 );
			var oy1 = oy * p;
			var oy2 = oy * p2;
			var ox1 = ox * p;
			var ox2 = ox * p2;
			var i00, i01, i10, i11;

			for ( ; py <= ey; py += oy2 ) {

				var px = py;
				var ex = py + ox * ( nx - p2 );

				for ( ; px <= ex; px += ox2 ) {

					var p01 = px + ox1;
					var p10 = px + oy1;
					var p11 = p10 + ox1;

					wdec14( buffer[ px + j ], buffer[ p10 + j ] );

					i00 = wdec14Return.a;
					i10 = wdec14Return.b;

					wdec14( buffer[ p01 + j ], buffer[ p11 + j ] );

					i01 = wdec14Return.a;
					i11 = wdec14Return.b;

					wdec14( i00, i01 );

					buffer[ px + j ] = wdec14Return.a;
					buffer[ p01 + j ] = wdec14Return.b;

					wdec14( i10, i11 );

					buffer[ p10 + j ] = wdec14Return.a;
					buffer[ p11 + j ] = wdec14Return.b;

				}

				if ( nx & p ) {

					var p10 = px + oy1;

					wdec14( buffer[ px + j ], buffer[ p10 + j ] );

					i00 = wdec14Return.a;
					buffer[ p10 + j ] = wdec14Return.b;

					buffer[ px + j ] = i00;

				}

			}

			if ( ny & p ) {

				var px = py;
				var ex = py + ox * ( nx - p2 );

				for ( ; px <= ex; px += ox2 ) {

					var p01 = px + ox1;

					wdec14( buffer[ px + j ], buffer[ p01 + j ] );

					i00 = wdec14Return.a;
					buffer[ p01 + j ] = wdec14Return.b;

					buffer[ px + j ] = i00;

				}

			}

			p2 = p;
			p >>= 1;

		}

		return py;

	}

	function hufDecode( encodingTable, decodingTable, uInt8Array, inDataView, inOffset, ni, rlc, no, outBuffer, outOffset ) {

		var c = 0;
		var lc = 0;
		var outBufferEndOffset = no;
		var inOffsetEnd = Math.trunc( inOffset.value + ( ni + 7 ) / 8 );

		while ( inOffset.value < inOffsetEnd ) {

			getChar( c, lc, uInt8Array, inOffset );

			c = getCharReturn.c;
			lc = getCharReturn.lc;

			while ( lc >= HUF_DECBITS ) {

				var index = ( c >> ( lc - HUF_DECBITS ) ) & HUF_DECMASK;
				var pl = decodingTable[ index ];

				if ( pl.len ) {

					lc -= pl.len;

					getCode( pl.lit, rlc, c, lc, uInt8Array, inDataView, inOffset, outBuffer, outOffset, outBufferEndOffset );

					c = getCodeReturn.c;
					lc = getCodeReturn.lc;

				} else {

					if ( ! pl.p ) {

						throw 'hufDecode issues';

					}

					var j;

					for ( j = 0; j < pl.lit; j ++ ) {

						var l = hufLength( encodingTable[ pl.p[ j ] ] );

						while ( lc < l && inOffset.value < inOffsetEnd ) {

							getChar( c, lc, uInt8Array, inOffset );

							c = getCharReturn.c;
							lc = getCharReturn.lc;

						}

						if ( lc >= l ) {

							if ( hufCode( encodingTable[ pl.p[ j ] ] ) == ( ( c >> ( lc - l ) ) & ( ( 1 << l ) - 1 ) ) ) {

								lc -= l;

								getCode( pl.p[ j ], rlc, c, lc, uInt8Array, inDataView, inOffset, outBuffer, outOffset, outBufferEndOffset );

								c = getCodeReturn.c;
								lc = getCodeReturn.lc;

								break;

							}

						}

					}

					if ( j == pl.lit ) {

						throw 'hufDecode issues';

					}

				}

			}

		}

		var i = ( 8 - ni ) & 7;

		c >>= i;
		lc -= i;

		while ( lc > 0 ) {

			var pl = decodingTable[ ( c << ( HUF_DECBITS - lc ) ) & HUF_DECMASK ];

			if ( pl.len ) {

				lc -= pl.len;

				getCode( pl.lit, rlc, c, lc, uInt8Array, inDataView, inOffset, outBuffer, outOffset, outBufferEndOffset );

				c = getCodeReturn.c;
				lc = getCodeReturn.lc;

			} else {

				throw 'hufDecode issues';

			}

		}

		return true;

	}

	function hufUncompress( uInt8Array, inDataView, inOffset, nCompressed, outBuffer, outOffset, nRaw ) {

		var initialInOffset = inOffset.value;

		var im = parseUint32( inDataView, inOffset );
		var iM = parseUint32( inDataView, inOffset );

		inOffset.value += 4;

		var nBits = parseUint32( inDataView, inOffset );

		inOffset.value += 4;

		if ( im < 0 || im >= HUF_ENCSIZE || iM < 0 || iM >= HUF_ENCSIZE ) {

			throw 'Something wrong with HUF_ENCSIZE';

		}

		var freq = new Array( HUF_ENCSIZE );
		var hdec = new Array( HUF_DECSIZE );

		hufClearDecTable( hdec );

		var ni = nCompressed - ( inOffset.value - initialInOffset );

		hufUnpackEncTable( uInt8Array, inDataView, inOffset, ni, im, iM, freq );

		if ( nBits > 8 * ( nCompressed - ( inOffset.value - initialInOffset ) ) ) {

			throw 'Something wrong with hufUncompress';

		}

		hufBuildDecTable( freq, im, iM, hdec );

		hufDecode( freq, hdec, uInt8Array, inDataView, inOffset, nBits, iM, nRaw, outBuffer, outOffset );

	}

	function applyLut( lut, data, nData ) {

		for ( var i = 0; i < nData; ++ i ) {

			data[ i ] = lut[ data[ i ] ];

		}

	}

	function decompressPIZ( outBuffer, outOffset, uInt8Array, inDataView, inOffset, tmpBufSize, num_channels, exrChannelInfos, dataWidth, num_lines ) {

		var bitmap = new Uint8Array( BITMAP_SIZE );

		var minNonZero = parseUint16( inDataView, inOffset );
		var maxNonZero = parseUint16( inDataView, inOffset );

		if ( maxNonZero >= BITMAP_SIZE ) {

			throw 'Something is wrong with PIZ_COMPRESSION BITMAP_SIZE';

		}

		if ( minNonZero <= maxNonZero ) {

			for ( var i = 0; i < maxNonZero - minNonZero + 1; i ++ ) {

				bitmap[ i + minNonZero ] = parseUint8( inDataView, inOffset );

			}

		}

		var lut = new Uint16Array( USHORT_RANGE );
		reverseLutFromBitmap( bitmap, lut );

		var length = parseUint32( inDataView, inOffset );

		hufUncompress( uInt8Array, inDataView, inOffset, length, outBuffer, outOffset, tmpBufSize );

		var pizChannelData = new Array( num_channels );

		var outBufferEnd = 0;

		for ( var i = 0; i < num_channels; i ++ ) {

			pizChannelData[ i ] = {};
			pizChannelData[ i ][ 'start' ] = outBufferEnd;
			pizChannelData[ i ][ 'end' ] = pizChannelData[ i ][ 'start' ];
			pizChannelData[ i ][ 'nx' ] = dataWidth;
			pizChannelData[ i ][ 'ny' ] = num_lines;
			pizChannelData[ i ][ 'size' ] = 1;

			outBufferEnd += pizChannelData[ i ].nx * pizChannelData[ i ].ny * pizChannelData[ i ].size;

		}

		var fooOffset = 0;

		for ( var i = 0; i < num_channels; i ++ ) {

			for ( var j = 0; j < pizChannelData[ i ].size; ++ j ) {

				fooOffset += wav2Decode(
					j + fooOffset,
					outBuffer,
					pizChannelData[ i ].nx,
					pizChannelData[ i ].size,
					pizChannelData[ i ].ny,
					pizChannelData[ i ].nx * pizChannelData[ i ].size
				);

			}

		}

		applyLut( lut, outBuffer, outBufferEnd );

		return true;

	}

	function parseNullTerminatedString( buffer, offset ) {

		var uintBuffer = new Uint8Array( buffer );
		var endOffset = 0;

		while ( uintBuffer[ offset.value + endOffset ] != 0 ) {

			endOffset += 1;

		}

		var stringValue = new TextDecoder().decode(
			uintBuffer.slice( offset.value, offset.value + endOffset )
		);

		offset.value = offset.value + endOffset + 1;

		return stringValue;

	}

	function parseFixedLengthString( buffer, offset, size ) {

		var stringValue = new TextDecoder().decode(
			new Uint8Array( buffer ).slice( offset.value, offset.value + size )
		);

		offset.value = offset.value + size;

		return stringValue;

	}

	function parseUlong( dataView, offset ) {

		var uLong = dataView.getUint32( 0, true );

		offset.value = offset.value + ULONG_SIZE;

		return uLong;

	}

	function parseUint32( dataView, offset ) {

		var Uint32 = dataView.getUint32( offset.value, true );

		offset.value = offset.value + INT32_SIZE;

		return Uint32;

	}

	function parseUint8Array( uInt8Array, offset ) {

		var Uint8 = uInt8Array[ offset.value ];

		offset.value = offset.value + INT8_SIZE;

		return Uint8;

	}

	function parseUint8( dataView, offset ) {

		var Uint8 = dataView.getUint8( offset.value );

		offset.value = offset.value + INT8_SIZE;

		return Uint8;

	}

	function parseFloat32( dataView, offset ) {

		var float = dataView.getFloat32( offset.value, true );

		offset.value += FLOAT32_SIZE;

		return float;

	}

	// https://stackoverflow.com/questions/5678432/decompressing-half-precision-floats-in-javascript
	function decodeFloat16( binary ) {

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

	function parseUint16( dataView, offset ) {

		var Uint16 = dataView.getUint16( offset.value, true );

		offset.value += INT16_SIZE;

		return Uint16;

	}

	function parseFloat16( buffer, offset ) {

		return decodeFloat16( parseUint16( buffer, offset ) );

	}

	function parseChlist( dataView, buffer, offset, size ) {

		var startOffset = offset.value;
		var channels = [];

		while ( offset.value < ( startOffset + size - 1 ) ) {

			var name = parseNullTerminatedString( buffer, offset );
			var pixelType = parseUint32( dataView, offset ); // TODO: Cast this to UINT, HALF or FLOAT
			var pLinear = parseUint8( dataView, offset );
			offset.value += 3; // reserved, three chars
			var xSampling = parseUint32( dataView, offset );
			var ySampling = parseUint32( dataView, offset );

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

	function parseChromaticities( dataView, offset ) {

		var redX = parseFloat32( dataView, offset );
		var redY = parseFloat32( dataView, offset );
		var greenX = parseFloat32( dataView, offset );
		var greenY = parseFloat32( dataView, offset );
		var blueX = parseFloat32( dataView, offset );
		var blueY = parseFloat32( dataView, offset );
		var whiteX = parseFloat32( dataView, offset );
		var whiteY = parseFloat32( dataView, offset );

		return { redX: redX, redY: redY, greenX: greenX, greenY: greenY, blueX: blueX, blueY: blueY, whiteX: whiteX, whiteY: whiteY };

	}

	function parseCompression( dataView, offset ) {

		var compressionCodes = [
			'NO_COMPRESSION',
			'RLE_COMPRESSION',
			'ZIPS_COMPRESSION',
			'ZIP_COMPRESSION',
			'PIZ_COMPRESSION',
			'PXR24_COMPRESSION',
			'B44_COMPRESSION',
			'B44A_COMPRESSION',
			'DWAA_COMPRESSION',
			'DWAB_COMPRESSION'
		];

		var compression = parseUint8( dataView, offset );

		return compressionCodes[ compression ];

	}

	function parseBox2i( dataView, offset ) {

		var xMin = parseUint32( dataView, offset );
		var yMin = parseUint32( dataView, offset );
		var xMax = parseUint32( dataView, offset );
		var yMax = parseUint32( dataView, offset );

		return { xMin: xMin, yMin: yMin, xMax: xMax, yMax: yMax };

	}

	function parseLineOrder( dataView, offset ) {

		var lineOrders = [
			'INCREASING_Y'
		];

		var lineOrder = parseUint8( dataView, offset );

		return lineOrders[ lineOrder ];

	}

	function parseV2f( dataView, offset ) {

		var x = parseFloat32( dataView, offset );
		var y = parseFloat32( dataView, offset );

		return [ x, y ];

	}

	function parseValue( dataView, buffer, offset, type, size ) {

		if ( type === 'string' || type === 'iccProfile' ) {

			return parseFixedLengthString( buffer, offset, size );

		} else if ( type === 'chlist' ) {

			return parseChlist( dataView, buffer, offset, size );

		} else if ( type === 'chromaticities' ) {

			return parseChromaticities( dataView, offset );

		} else if ( type === 'compression' ) {

			return parseCompression( dataView, offset );

		} else if ( type === 'box2i' ) {

			return parseBox2i( dataView, offset );

		} else if ( type === 'lineOrder' ) {

			return parseLineOrder( dataView, offset );

		} else if ( type === 'float' ) {

			return parseFloat32( dataView, offset );

		} else if ( type === 'v2f' ) {

			return parseV2f( dataView, offset );

		} else if ( type === 'int' ) {

			return parseUint32( dataView, offset );

		} else {

			throw 'Cannot parse value for unsupported type: ' + type;

		}

	}

	var bufferDataView = new DataView( buffer );
	var uInt8Array = new Uint8Array( buffer );

	var EXRHeader = {};

	bufferDataView.getUint32( 0, true ); // magic
	bufferDataView.getUint8( 4, true ); // versionByteZero
	bufferDataView.getUint8( 5, true ); // fullMask

	// start of header

	var offset = { value: 8 }; // start at 8, after magic stuff

	var keepReading = true;

	while ( keepReading ) {

		var attributeName = parseNullTerminatedString( buffer, offset );

		if ( attributeName == 0 ) {

			keepReading = false;

		} else {

			var attributeType = parseNullTerminatedString( buffer, offset );
			var attributeSize = parseUint32( bufferDataView, offset );
			var attributeValue = parseValue( bufferDataView, buffer, offset, attributeType, attributeSize );

			EXRHeader[ attributeName ] = attributeValue;

		}

	}

	// offsets

	var dataWindowHeight = EXRHeader.dataWindow.yMax + 1;
	var scanlineBlockSize = 1; // 1 for NO_COMPRESSION

	if ( EXRHeader.compression === 'PIZ_COMPRESSION' ) {

		scanlineBlockSize = 32;

	}

	var numBlocks = dataWindowHeight / scanlineBlockSize;

	for ( var i = 0; i < numBlocks; i ++ ) {

		parseUlong( bufferDataView, offset ); // scanlineOffset

	}

	// we should be passed the scanline offset table, start reading pixel data

	var width = EXRHeader.dataWindow.xMax - EXRHeader.dataWindow.xMin + 1;
	var height = EXRHeader.dataWindow.yMax - EXRHeader.dataWindow.yMin + 1;
	var numChannels = EXRHeader.channels.length;

	switch ( this.type ) {

		case FloatType:

			var byteArray = new Float32Array( width * height * numChannels );
			break;

		case HalfFloatType:

			var byteArray = new Uint16Array( width * height * numChannels );
			break;

		default:

			console.error( 'THREE.EXRLoader: unsupported type: ', this.type );
			break;

	}

	var channelOffsets = {
		R: 0,
		G: 1,
		B: 2,
		A: 3
	};

	if ( EXRHeader.compression === 'NO_COMPRESSION' ) {

		for ( var y = 0; y < height; y ++ ) {

			var y_scanline = parseUint32( bufferDataView, offset );
			parseUint32( bufferDataView, offset ); // dataSize

			for ( var channelID = 0; channelID < EXRHeader.channels.length; channelID ++ ) {

				var cOff = channelOffsets[ EXRHeader.channels[ channelID ].name ];

				if ( EXRHeader.channels[ channelID ].pixelType === 1 ) { // half

					for ( var x = 0; x < width; x ++ ) {

						switch ( this.type ) {

							case FloatType:

								var val = parseFloat16( bufferDataView, offset );
								break;

							case HalfFloatType:

								var val = parseUint16( bufferDataView, offset );
								break;

						}

						byteArray[ ( ( ( height - y_scanline ) * ( width * numChannels ) ) + ( x * numChannels ) ) + cOff ] = val;

					}

				} else {

					throw 'EXRLoader._parser: unsupported pixelType ' + EXRHeader.channels[ channelID ].pixelType + '. Only pixelType is 1 (HALF) is supported.';

				}

			}

		}

	} else if ( EXRHeader.compression === 'PIZ_COMPRESSION' ) {

		for ( var scanlineBlockIdx = 0; scanlineBlockIdx < height / scanlineBlockSize; scanlineBlockIdx ++ ) {

			parseUint32( bufferDataView, offset ); // line_no
			parseUint32( bufferDataView, offset ); // data_len

			var tmpBufferSize = width * scanlineBlockSize * ( EXRHeader.channels.length * BYTES_PER_HALF );
			var tmpBuffer = new Uint16Array( tmpBufferSize );
			var tmpOffset = { value: 0 };

			decompressPIZ( tmpBuffer, tmpOffset, uInt8Array, bufferDataView, offset, tmpBufferSize, numChannels, EXRHeader.channels, width, scanlineBlockSize );

			for ( var line_y = 0; line_y < scanlineBlockSize; line_y ++ ) {

				for ( var channelID = 0; channelID < EXRHeader.channels.length; channelID ++ ) {

					var cOff = channelOffsets[ EXRHeader.channels[ channelID ].name ];

					if ( EXRHeader.channels[ channelID ].pixelType === 1 ) { // half

						for ( var x = 0; x < width; x ++ ) {

							var idx = ( channelID * ( scanlineBlockSize * width ) ) + ( line_y * width ) + x;

							switch ( this.type ) {

								case FloatType:

									var val = decodeFloat16( tmpBuffer[ idx ] );
									break;

								case HalfFloatType:

									var val = tmpBuffer[ idx ];
									break;

							}

							var true_y = line_y + ( scanlineBlockIdx * scanlineBlockSize );

							byteArray[ ( ( ( height - true_y ) * ( width * numChannels ) ) + ( x * numChannels ) ) + cOff ] = val;

						}

					} else {

						throw 'EXRLoader._parser: unsupported pixelType ' + EXRHeader.channels[ channelID ].pixelType + '. Only pixelType is 1 (HALF) is supported.';

					}

				}

			}

		}

	} else {

		throw 'EXRLoader._parser: ' + EXRHeader.compression + ' is unsupported';

	}

	return {
		header: EXRHeader,
		width: width,
		height: height,
		data: byteArray,
		format: EXRHeader.channels.length == 4 ? RGBAFormat : RGBFormat,
		type: this.type
	};

};

export { EXRLoader };
