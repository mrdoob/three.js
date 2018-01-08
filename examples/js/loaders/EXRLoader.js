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

	const USHORT_RANGE = (1 << 16);
	const BITMAP_SIZE = (USHORT_RANGE >> 3);

	const HUF_ENCBITS = 16;  // literal (value) bit length
	const HUF_DECBITS = 14;  // decoding bit size (>= 8)

	const HUF_ENCSIZE = (1 << HUF_ENCBITS) + 1;  // encoding table size
	const HUF_DECSIZE = 1 << HUF_DECBITS;        // decoding table size
	const HUF_DECMASK = HUF_DECSIZE - 1;

	const SHORT_ZEROCODE_RUN = 59;
	const LONG_ZEROCODE_RUN = 63;
	const SHORTEST_LONG_RUN = 2 + LONG_ZEROCODE_RUN - SHORT_ZEROCODE_RUN;
	const LONGEST_LONG_RUN = 255 + SHORTEST_LONG_RUN;

	function reverseLutFromBitmap(bitmap, lut) {
		var k = 0;

	  for (var i = 0; i < USHORT_RANGE; ++i) {
	    if ((i == 0) || (bitmap[i >> 3] & (1 << (i & 7)))) {
				lut[k++] = i;
			}
	  }

	  var n = k - 1;

	  while (k < USHORT_RANGE) lut[k++] = 0;

	  return n;
	}

	function hufClearDecTable(hdec) {
		for (var i = 0; i < HUF_DECSIZE; i++) {
			hdec[i] = {}
			hdec[i].len = 0;
			hdec[i].lit = 0;
			hdec[i].p = null;
		}
	}

	function getBits(nBits, c, lc, inBuffer, inOffset) {
	  while (lc < nBits) {
	    c = (c << 8) | parseUint8(inBuffer, inOffset);
	    lc += 8;
	  }

	  lc -= nBits;

	  // console.log('nBits: ' + nBits + ' c: ' + c + ' lc: ' + lc);

	  return { l: (c >> lc) & ((1 << nBits) - 1), c: c, lc: lc };
	}

	function hufCanonicalCodeTable(hcode) {
	  var n = new Array(59);

	  //
	  // For each i from 0 through 58, count the
	  // number of different codes of length i, and
	  // store the count in n[i].
	  //

	  for (var i = 0; i <= 58; ++i) n[i] = 0;

	  for (var i = 0; i < HUF_ENCSIZE; ++i) n[hcode[i]] += 1;

	  //
	  // For each i from 58 through 1, compute the
	  // numerically lowest code with length i, and
	  // store that code in n[i].
	  //

	  var c = 0;

	  for (var i = 58; i > 0; --i) {
	    var nc = ((c + n[i]) >> 1);
	    n[i] = c;
	    c = nc;
	  }

	  //
	  // hcode[i] contains the length, l, of the
	  // code for symbol i.  Assign the next available
	  // code of length l to the symbol and store both
	  // l and the code in hcode[i].
	  //

	  for (var i = 0; i < HUF_ENCSIZE; ++i) {
	    var l = hcode[i];

	    if (l > 0) hcode[i] = l | (n[l]++ << 6);
	  }
	}

	function hufUnpackEncTable(inBuffer, inOffset, ni, im, iM, hcode) {
		var p = inOffset;
		var c = 0;
	  var lc = 0;

	  for (; im <= iM; im++) {
	    if (p.value - inOffset.value > ni) {
	      return false;
	    }


	    var bits = getBits(6, c, lc, inBuffer, p);  // code length
	    var l = bits.l;
	    c = bits.c;
	    lc = bits.lc;
	    hcode[im] = l;

	    // console.log('l: ' + l);

	    if (l == LONG_ZEROCODE_RUN) {
	      if (p.value - inOffset.value > ni) {
	        throw 'Something wrong with hufUnpackEncTable';
	      }

	      var bits = getBits(8, c, lc, inBuffer, p);
	      var zerun = bits.l + SHORTEST_LONG_RUN;
	      c = bits.c;
	    	lc = bits.lc;

	      // console.log('zerunA: ' + zerun);

	      if (im + zerun > iM + 1) {
	        throw 'Something wrong with hufUnpackEncTable';
	      }

	      while (zerun--) hcode[im++] = 0;

	      im--;
	    } else if (l >= SHORT_ZEROCODE_RUN) {
	      var zerun = l - SHORT_ZEROCODE_RUN + 2;

	      // console.log('zerunB: ' + zerun);

	      if (im + zerun > iM + 1) {
	        throw 'Something wrong with hufUnpackEncTable';
	      }

	      while (zerun--) hcode[im++] = 0;

	      im--;
	    }
	  }

	  hufCanonicalCodeTable(hcode);

	  console.log('hcode[13]: ' + hcode[13]);
	}

	function hufLength(code) { return code & 63; }

	function hufCode(code) { return code >> 6; }

	function hufBuildDecTable(hcode, im, iM, hdecod) {
	  //
	  // Init hashtable & loop on all codes.
	  // Assumes that hufClearDecTable(hdecod) has already been called.
	  //

	  var stop = 0;

	  for (; im <= iM; im++) {
	    var c = hufCode(hcode[im]);
	    var l = hufLength(hcode[im]);

	    if (c >> l) {
	      throw 'Invalid table entry';
	    }

	    if (stop % 100 == 0) {
	    	console.log(stop + ' c: ' + c + ' l: ' + l);
	    }

	    if (l > HUF_DECBITS) {
	      //
	      // Long code: add a secondary entry
	      //

	      var pl = hdecod[(c >> (l - HUF_DECBITS))];

	      if (pl.len) {
	        throw 'Invalid table entry';
	      }

	      pl.lit++;

	      if (pl.p) {
	        var p = pl.p;
	        pl.p = new Array(pl.lit);

	        for (var i = 0; i < pl.lit - 1; ++i) {
	        	pl.p[i] = p[i];
	        	//console.log('pl.p[i]: ' + pl.p[i]);
	        }

	        //exit(0);

	      } else {
	        pl.p = new Array(1);
	      }

	      pl.p[pl.lit - 1] = im;
	    } else if (l) {
	      //
	      // Short code: init all primary entries
	      //

	      var plOffset = 0;

	      for (var i = 1 << (HUF_DECBITS - l); i > 0; i--) {
	      	var pl = hdecod[(c << (HUF_DECBITS - l)) + plOffset];

	        if (pl.len || pl.p) {
	          throw 'Invalid table entry';
	        }

	        pl.len = l;
	        pl.lit = im;

	        plOffset++;
	      }
	    }

	    stop++;
	    // if (stop > 100) {
	    //   exit(0);
	    // }
	  }

	  return true;
	}

	function getChar(c, lc, inBuffer, inOffset) {
    c = (c << 8) | parseUint8(inBuffer, inOffset);
    lc += 8;

	  return { c: c, lc: lc };
	}

	function getCode(po, rlc, c, lc, inBuffer, inOffset, outBuffer, outBufferOffset, outBufferEndOffset) {
    if (po == rlc) {
      if (lc < 8) {
      	var temp = getChar(c, lc, inBuffer, inOffset);
		    c = temp.c;
		    lc = temp.lc;
      }

      lc -= 8;

      var cs = (c >> lc);

      if (out + cs > oe) {
      	throw 'Issue with getCode';
      }

      var s = out[-1];

      while (cs-- > 0) {
      	outBuffer[outBufferOffset.value++] = s;
      }
    } else if (outBufferOffset.value < outBufferEndOffset) {
      outBuffer[outBufferOffset.value++] = po;
    } else {
      throw 'Issue with getCode';
    }

    return { c: c, lc: lc };
  }

	function hufDecode(encodingTable, decodingTable, inBuffer, inOffset, ni, rlc, no, outBuffer, outOffset) {
	  var c = 0;
	  var lc = 0;
	  // unsigned short *outb = out;
	  // unsigned short *oe = out + no;
	  var outBufferEndOffset = no;
	  var inOffsetEnd = parseInt(inOffset.value + (ni + 7) / 8);  // input byte size

	  var stop = 0;

	  console.log('inOffset: ' + inOffset.value + ' inOffsetEnd: ' + inOffsetEnd + ' delta: ' + (inOffsetEnd - inOffset.value));

	  while (inOffset.value < inOffsetEnd) {
	    var temp = getChar(c, lc, inBuffer, inOffset);
	    c = temp.c;
	    lc = temp.lc;

	    while (lc >= HUF_DECBITS) {
	    	// console.log('c: ' + c + ' lc: ' + lc);

	    	var index = (c >> (lc - HUF_DECBITS)) & HUF_DECMASK;
	    	if (stop % 100 == 0) {
	    		console.log(stop + ' lc: ' + lc + ' index: ' + index);
	    	}
	      var pl = decodingTable[index];

	      // console.log('pl.len: ' + pl.len + ' pl.lit: ' + pl.lit);

	      // exit(0);

	      if (pl.len) {
	      	// console.log('pl.len');

	        lc -= pl.len;
	        var temp = getCode(pl.lit, rlc, c, lc, inBuffer, inOffset, outBuffer, outOffset, outBufferEndOffset);
	        c = temp.c;
	    		lc = temp.lc;
	      } else {
	      	// console.log('else');

	        if (!pl.p) {
	          throw 'hufDecode issues';
	        }

	        var j;

	        for (j = 0; j < pl.lit; j++) {
	          var l = hufLength(encodingTable[pl.p[j]]);

	          while (lc < l && inOffset.value < inOffsetEnd) {  // get more bits
	            var temp = getChar(c, lc, inBuffer, inOffset);
							c = temp.c;
							lc = temp.lc;
						}

	          if (lc >= l) {
	            if (hufCode(encodingTable[pl.p[j]]) ==
	                ((c >> (lc - l)) & ((1 << l) - 1))) {

	              lc -= l;
	              var temp = getCode(pl.lit, rlc, c, lc, inBuffer, inOffset, outBuffer, outOffset, outBufferEndOffset);
	              c = temp.c;
								lc = temp.lc;
	              break;
	            }
	          }
	        }

	        if (j == pl.lit) {
	          throw 'hufDecode issues';
	        }
	      }
	    }

	    stop++;
	  }

	  //
	  // Get remaining (short) codes
	  //

	  var i = (8 - ni) & 7;
	  c >>= i;
	  lc -= i;

	  while (lc > 0) {
	    var pl = decodingTable[(c << (HUF_DECBITS - lc)) & HUF_DECMASK];

	    if (pl.len) {
	      lc -= pl.len;
	      var temp = getCode(pl.lit, rlc, c, lc, inBuffer, inOffset, outBuffer, outOffset, outBufferEndOffset);
        c = temp.c;
				lc = temp.lc;
	    } else {
	      throw 'hufDecode issues';
	    }
	  }

	  // TODO: MAKE THIS CHECK ON OFFSET MOVING FORWARD ENOUGH
	  // if (out - outb != no) {
	  //   throw 'hufDecode issues';
	  // }
	  // notEnoughData ();

	  return true;
	}

	function hufUncompress(inBuffer, inOffset, nCompressed, outBuffer, outOffset, nRaw) {
		console.log('nCompressed: ' + nCompressed);
		console.log('nRaw: ' + nRaw);

		var initialInOffset = inOffset.value;

		var im = parseUint32(inBuffer, inOffset);
		var iM = parseUint32(inBuffer, inOffset);
		inOffset.value += 4;
		var nBits = parseUint32(inBuffer, inOffset);
		inOffset.value += 4;

		if (im < 0 || im >= HUF_ENCSIZE || iM < 0 || iM >= HUF_ENCSIZE) {
			throw 'Something wrong with HUF_ENCSIZE';
		}

		console.log('im: ' + im);
		console.log('iM: ' + iM);
		console.log('nBits: ' + nBits);

		var freq = new Array(HUF_ENCSIZE);
		var hdec = new Array(HUF_DECSIZE);

		hufClearDecTable(hdec);

		var ni = nCompressed - (inOffset.value - initialInOffset);

		console.log('ni: ' + ni);

		hufUnpackEncTable(inBuffer, inOffset, ni, im, iM, freq);

		if (nBits > 8 * (nCompressed - (inOffset.value - initialInOffset))) {
      throw 'Something wrong with hufUncompress';
    }

    for (var print = 0; print < 10; print++) {
    	console.log('freq: ' + freq[print]);
    }

    hufBuildDecTable(freq, im, iM, hdec);

    console.log('hdec[12203].len: ' + hdec[12203].len + ' hdec[12203].lit: ' + hdec[12203].lit + ' hdec[12203].p: ' + hdec[12203].p);
    console.log('hdec[12204].len: ' + hdec[12204].len + ' hdec[12204].lit: ' + hdec[12204].lit + ' hdec[12204].p: ' + hdec[12204].p);

    hufDecode(freq, hdec, inBuffer, inOffset, nBits, iM, nRaw, outBuffer, outOffset);
	}

	function decompressPIZ(inBuffer, offset, tmpBufSize) {
		var bitmap = new Uint8Array(BITMAP_SIZE);

  	var minNonZero = parseUint16(inBuffer, offset);
  	var maxNonZero = parseUint16(inBuffer, offset);

  	console.log('minNonZero: ' + minNonZero);
  	console.log('maxNonZero: ' + maxNonZero);

  	if (maxNonZero >= BITMAP_SIZE) {
	  	throw 'Something is wrong with PIZ_COMPRESSION BITMAP_SIZE'
	  }

	  if (minNonZero <= maxNonZero) {
	  	for (var i = 0; i < maxNonZero - minNonZero + 1; i++) {
				bitmap[i + minNonZero] = parseUint8(inBuffer, offset);
			}
	  }

	  var checksum = 0;
	  for (var i = 0; i < BITMAP_SIZE; i++) {
	    checksum += bitmap[i];
	  }
	  console.log('checksum: ' + checksum);

	  var lut = new Uint16Array(USHORT_RANGE);
	  var maxValue = reverseLutFromBitmap(bitmap, lut);

	  console.log('maxValue: ' + maxValue);

	  //
	  // Huffman decoding
	  //

	  var length = parseUint32(inBuffer, offset);

		console.log('length: ' + length);

	  var tmpBuffer = new Uint16Array(tmpBufSize);
	  var tmpOffset = { value: 0 }
	  hufUncompress(inBuffer, offset, length, tmpBuffer, tmpOffset, tmpBufSize);

	  //
	  // Wavelet decoding
	  //



		exit(0);

		return true;
	}

	function parseNullTerminatedString( buffer, offset ) {

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

	function parseFixedLengthString( buffer, offset, size ) {

		var stringValue = new TextDecoder().decode(
			new Uint8Array( buffer ).slice( offset.value, offset.value + size )
		);

		offset.value = offset.value + size;

		return stringValue;

	}

	function parseUlong( buffer, offset ) {

		var uLong = new DataView( buffer.slice( offset.value, offset.value + 4 ) ).getUint32( 0, true );

		offset.value = offset.value + 8;

		return uLong;

	}

	function parseUint32( buffer, offset ) {

		var Uint32 = new DataView( buffer.slice( offset.value, offset.value + 4 ) ).getUint32( 0, true );

		offset.value = offset.value + 4;

		return Uint32;

	}

	function parseUint8( buffer, offset ) {

		var Uint8 = new DataView( buffer.slice( offset.value, offset.value + 1 ) ).getUint8( 0, true );

		offset.value = offset.value + 1;

		return Uint8;

	}

	function parseFloat32( buffer, offset ) {

		var float = new DataView( buffer.slice( offset.value, offset.value + 4 ) ).getFloat32( 0, true );

		offset.value += 4;

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

	function parseUint16( buffer, offset ) {

		var Uint16 = new DataView( buffer.slice( offset.value, offset.value + 2 ) ).getUint16( 0, true );

		offset.value += 2;

		return Uint16;

	}

	function parseFloat16( buffer, offset ) {

		return decodeFloat16( parseUint16( buffer, offset) );

	}

	function parseChlist( buffer, offset, size ) {

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

	function parseChromaticities( buffer, offset ) {

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

	function parseCompression( buffer, offset ) {

		var compressionCodes = [
			'NO_COMPRESSION',
			'RLE_COMPRESSION',
			'ZIPS_COMPRESSION',
			'ZIP_COMPRESSION',
			'PIZ_COMPRESSION'
		];

		var compression = parseUint8( buffer, offset );

		return compressionCodes[ compression ];

	}

	function parseBox2i( buffer, offset ) {

		var xMin = parseUint32( buffer, offset );
		var yMin = parseUint32( buffer, offset );
		var xMax = parseUint32( buffer, offset );
		var yMax = parseUint32( buffer, offset );

		return { xMin: xMin, yMin: yMin, xMax: xMax, yMax: yMax };

	}

	function parseLineOrder( buffer, offset ) {

		var lineOrders = [
			'INCREASING_Y'
		];

		var lineOrder = parseUint8( buffer, offset );

		return lineOrders[ lineOrder ];

	}

	function parseV2f( buffer, offset ) {

		var x = parseFloat32( buffer, offset );
		var y = parseFloat32( buffer, offset );

		return [ x, y ];

	}

	function parseValue( buffer, offset, type, size ) {

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
	var scanlineBlockSize = 1; // 1 for NO_COMPRESSION
	if (EXRHeader.compression == 'PIZ_COMPRESSION') {
		scanlineBlockSize = 32;
	}
	var numBlocks = dataWindowHeight / scanlineBlockSize;

	console.log('numBlocks:' + numBlocks);

	for ( var i = 0; i < numBlocks; i ++ ) {

		var scanlineOffset = parseUlong( buffer, offset );

	}

	// we should be passed the scanline offset table, start reading pixel data

	var width = EXRHeader.dataWindow.xMax - EXRHeader.dataWindow.xMin + 1;
	var height = EXRHeader.dataWindow.yMax - EXRHeader.dataWindow.yMin + 1;
	var numChannels = EXRHeader.channels.length;

	var byteArray = new Float32Array( width * height * numChannels );

	var channelOffsets = {
		R: 0,
		G: 1,
		B: 2,
		A: 3
	};

	if (EXRHeader.compression == 'NO_COMPRESSION') {

		for ( var y = 0; y < height; y ++ ) {

			var y_scanline = parseUint32( buffer, offset );
			var dataSize = parseUint32( buffer, offset );

			for ( var channelID = 0; channelID < EXRHeader.channels.length; channelID ++ ) {

				if ( EXRHeader.channels[ channelID ].pixelType == 1 ) {

					// HALF
					for ( var x = 0; x < width; x ++ ) {

						var val = parseFloat16( buffer, offset );
						var cOff = channelOffsets[ EXRHeader.channels[ channelID ].name ];

						byteArray[ ( ( ( width - y_scanline ) * ( height * numChannels ) ) + ( x * numChannels ) ) + cOff ] = val;

					}

				} else {

					throw 'Only supported pixel format is HALF';

				}

			}

		}

	} else if (EXRHeader.compression == 'PIZ_COMPRESSION') {

		for ( var y = 0; y < height; y ++ ) {

			var line_no = parseUint32( buffer, offset );
			var data_len = parseUint32( buffer, offset );

			console.log('line_no: ' + line_no);
			console.log('data_len: ' + data_len);

			var width = 1024;
			var num_lines = 32;
			var pixel_data_size = 6;

			var tmpBufSize = width * num_lines * pixel_data_size;

			var tmpBuffer = decompressPIZ(buffer, offset, tmpBufSize);
			var tmpBufferOffset = {value: 0};

			for ( var y = 0; y < height; y ++ ) {

				var y_scanline = parseUint32( tmpBuffer, tmpBufferOffset );
				var dataSize = parseUint32( tmpBuffer, tmpBufferOffset );

				for ( var channelID = 0; channelID < EXRHeader.channels.length; channelID ++ ) {

					if ( EXRHeader.channels[ channelID ].pixelType == 1 ) {

						// HALF
						for ( var x = 0; x < width; x ++ ) {

							var val = parseFloat16( tmpBuffer, tmpBufferOffset );
							var cOff = channelOffsets[ EXRHeader.channels[ channelID ].name ];

							byteArray[ ( ( ( width - y_scanline ) * ( height * numChannels ) ) + ( x * numChannels ) ) + cOff ] = val;

						}

					} else {

						throw 'Only supported pixel format is HALF';

					}

				}

			}

		}

	} else {

		throw 'Cannot decompress unsupported compression';

	}

	return {
		header: EXRHeader,
		width: width,
		height: height,
		data: byteArray,
		format: THREE.RGBAFormat,
		type: THREE.FloatType
	};

};
