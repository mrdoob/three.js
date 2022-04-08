( function () {

	/**
 * @author sciecode / https://github.com/sciecode
 *
 * EXR format references:
 * 	https://www.openexr.com/documentation/openexrfilelayout.pdf
 */
	const textEncoder = new TextEncoder();
	const NO_COMPRESSION = 0;
	const ZIPS_COMPRESSION = 2;
	const ZIP_COMPRESSION = 3;

	class EXRExporter {

		parse( renderer, renderTarget, options ) {

			if ( ! supported( renderer, renderTarget ) ) return undefined;
			const info = buildInfo( renderTarget, options ),
				dataBuffer = getPixelData( renderer, renderTarget, info ),
				rawContentBuffer = reorganizeDataBuffer( dataBuffer, info ),
				chunks = compressData( rawContentBuffer, info );
			return fillData( chunks, info );

		}

	}

	function supported( renderer, renderTarget ) {

		if ( ! renderer || ! renderer.isWebGLRenderer ) {

			console.error( 'EXRExporter.parse: Unsupported first parameter, expected instance of WebGLRenderer.' );
			return false;

		}

		if ( ! renderTarget || ! renderTarget.isWebGLRenderTarget ) {

			console.error( 'EXRExporter.parse: Unsupported second parameter, expected instance of WebGLRenderTarget.' );
			return false;

		}

		if ( renderTarget.texture.type !== THREE.FloatType && renderTarget.texture.type !== THREE.HalfFloatType ) {

			console.error( 'EXRExporter.parse: Unsupported WebGLRenderTarget texture type.' );
			return false;

		}

		if ( renderTarget.texture.format !== THREE.RGBAFormat ) {

			console.error( 'EXRExporter.parse: Unsupported WebGLRenderTarget texture format, expected THREE.RGBAFormat.' );
			return false;

		}

		return true;

	}

	function buildInfo( renderTarget, options = {} ) {

		const compressionSizes = {
			0: 1,
			2: 1,
			3: 16
		};
		const WIDTH = renderTarget.width,
			HEIGHT = renderTarget.height,
			TYPE = renderTarget.texture.type,
			FORMAT = renderTarget.texture.format,
			ENCODING = renderTarget.texture.encoding,
			COMPRESSION = options.compression !== undefined ? options.compression : ZIP_COMPRESSION,
			EXPORTER_TYPE = options.type !== undefined ? options.type : THREE.HalfFloatType,
			OUT_TYPE = EXPORTER_TYPE === THREE.FloatType ? 2 : 1,
			COMPRESSION_SIZE = compressionSizes[ COMPRESSION ],
			NUM_CHANNELS = 4;
		return {
			width: WIDTH,
			height: HEIGHT,
			type: TYPE,
			format: FORMAT,
			encoding: ENCODING,
			compression: COMPRESSION,
			blockLines: COMPRESSION_SIZE,
			dataType: OUT_TYPE,
			dataSize: 2 * OUT_TYPE,
			numBlocks: Math.ceil( HEIGHT / COMPRESSION_SIZE ),
			numInputChannels: 4,
			numOutputChannels: NUM_CHANNELS
		};

	}

	function getPixelData( renderer, rtt, info ) {

		let dataBuffer;

		if ( info.type === THREE.FloatType ) {

			dataBuffer = new Float32Array( info.width * info.height * info.numInputChannels );

		} else {

			dataBuffer = new Uint16Array( info.width * info.height * info.numInputChannels );

		}

		renderer.readRenderTargetPixels( rtt, 0, 0, info.width, info.height, dataBuffer );
		return dataBuffer;

	}

	function reorganizeDataBuffer( inBuffer, info ) {

		const w = info.width,
			h = info.height,
			dec = {
				r: 0,
				g: 0,
				b: 0,
				a: 0
			},
			offset = {
				value: 0
			},
			cOffset = info.numOutputChannels == 4 ? 1 : 0,
			getValue = info.type == THREE.FloatType ? getFloat32 : getFloat16,
			setValue = info.dataType == 1 ? setFloat16 : setFloat32,
			outBuffer = new Uint8Array( info.width * info.height * info.numOutputChannels * info.dataSize ),
			dv = new DataView( outBuffer.buffer );

		for ( let y = 0; y < h; ++ y ) {

			for ( let x = 0; x < w; ++ x ) {

				const i = y * w * 4 + x * 4;
				const r = getValue( inBuffer, i );
				const g = getValue( inBuffer, i + 1 );
				const b = getValue( inBuffer, i + 2 );
				const a = getValue( inBuffer, i + 3 );
				const line = ( h - y - 1 ) * w * ( 3 + cOffset ) * info.dataSize;
				decodeLinear( dec, r, g, b, a );
				offset.value = line + x * info.dataSize;
				setValue( dv, dec.a, offset );
				offset.value = line + cOffset * w * info.dataSize + x * info.dataSize;
				setValue( dv, dec.b, offset );
				offset.value = line + ( 1 + cOffset ) * w * info.dataSize + x * info.dataSize;
				setValue( dv, dec.g, offset );
				offset.value = line + ( 2 + cOffset ) * w * info.dataSize + x * info.dataSize;
				setValue( dv, dec.r, offset );

			}

		}

		return outBuffer;

	}

	function compressData( inBuffer, info ) {

		let compress,
			tmpBuffer,
			sum = 0;
		const chunks = {
				data: new Array(),
				totalSize: 0
			},
			size = info.width * info.numOutputChannels * info.blockLines * info.dataSize;

		switch ( info.compression ) {

			case 0:
				compress = compressNONE;
				break;

			case 2:
			case 3:
				compress = compressZIP;
				break;

		}

		if ( info.compression !== 0 ) {

			tmpBuffer = new Uint8Array( size );

		}

		for ( let i = 0; i < info.numBlocks; ++ i ) {

			const arr = inBuffer.subarray( size * i, size * ( i + 1 ) );
			const block = compress( arr, tmpBuffer );
			sum += block.length;
			chunks.data.push( {
				dataChunk: block,
				size: block.length
			} );

		}

		chunks.totalSize = sum;
		return chunks;

	}

	function compressNONE( data ) {

		return data;

	}

	function compressZIP( data, tmpBuffer ) {

		//
		// Reorder the pixel data.
		//
		let t1 = 0,
			t2 = Math.floor( ( data.length + 1 ) / 2 ),
			s = 0;
		const stop = data.length - 1;

		while ( true ) {

			if ( s > stop ) break;
			tmpBuffer[ t1 ++ ] = data[ s ++ ];
			if ( s > stop ) break;
			tmpBuffer[ t2 ++ ] = data[ s ++ ];

		} //
		// Predictor.
		//


		let p = tmpBuffer[ 0 ];

		for ( let t = 1; t < tmpBuffer.length; t ++ ) {

			const d = tmpBuffer[ t ] - p + ( 128 + 256 );
			p = tmpBuffer[ t ];
			tmpBuffer[ t ] = d;

		}

		if ( typeof fflate === 'undefined' ) {

			console.error( 'THREE.EXRLoader: External \`fflate.module.js\` required' );

		}

		const deflate = fflate.zlibSync( tmpBuffer ); // eslint-disable-line no-undef

		return deflate;

	}

	function fillHeader( outBuffer, chunks, info ) {

		const offset = {
			value: 0
		};
		const dv = new DataView( outBuffer.buffer );
		setUint32( dv, 20000630, offset ); // magic

		setUint32( dv, 2, offset ); // mask
		// = HEADER =

		setString( dv, 'compression', offset );
		setString( dv, 'compression', offset );
		setUint32( dv, 1, offset );
		setUint8( dv, info.compression, offset );
		setString( dv, 'screenWindowCenter', offset );
		setString( dv, 'v2f', offset );
		setUint32( dv, 8, offset );
		setUint32( dv, 0, offset );
		setUint32( dv, 0, offset );
		setString( dv, 'screenWindowWidth', offset );
		setString( dv, 'float', offset );
		setUint32( dv, 4, offset );
		setFloat32( dv, 1.0, offset );
		setString( dv, 'pixelAspectRatio', offset );
		setString( dv, 'float', offset );
		setUint32( dv, 4, offset );
		setFloat32( dv, 1.0, offset );
		setString( dv, 'lineOrder', offset );
		setString( dv, 'lineOrder', offset );
		setUint32( dv, 1, offset );
		setUint8( dv, 0, offset );
		setString( dv, 'dataWindow', offset );
		setString( dv, 'box2i', offset );
		setUint32( dv, 16, offset );
		setUint32( dv, 0, offset );
		setUint32( dv, 0, offset );
		setUint32( dv, info.width - 1, offset );
		setUint32( dv, info.height - 1, offset );
		setString( dv, 'displayWindow', offset );
		setString( dv, 'box2i', offset );
		setUint32( dv, 16, offset );
		setUint32( dv, 0, offset );
		setUint32( dv, 0, offset );
		setUint32( dv, info.width - 1, offset );
		setUint32( dv, info.height - 1, offset );
		setString( dv, 'channels', offset );
		setString( dv, 'chlist', offset );
		setUint32( dv, info.numOutputChannels * 18 + 1, offset );
		setString( dv, 'A', offset );
		setUint32( dv, info.dataType, offset );
		offset.value += 4;
		setUint32( dv, 1, offset );
		setUint32( dv, 1, offset );
		setString( dv, 'B', offset );
		setUint32( dv, info.dataType, offset );
		offset.value += 4;
		setUint32( dv, 1, offset );
		setUint32( dv, 1, offset );
		setString( dv, 'G', offset );
		setUint32( dv, info.dataType, offset );
		offset.value += 4;
		setUint32( dv, 1, offset );
		setUint32( dv, 1, offset );
		setString( dv, 'R', offset );
		setUint32( dv, info.dataType, offset );
		offset.value += 4;
		setUint32( dv, 1, offset );
		setUint32( dv, 1, offset );
		setUint8( dv, 0, offset ); // null-byte

		setUint8( dv, 0, offset ); // = OFFSET TABLE =

		let sum = offset.value + info.numBlocks * 8;

		for ( let i = 0; i < chunks.data.length; ++ i ) {

			setUint64( dv, sum, offset );
			sum += chunks.data[ i ].size + 8;

		}

	}

	function fillData( chunks, info ) {

		const TableSize = info.numBlocks * 8,
			HeaderSize = 259 + 18 * info.numOutputChannels,
			// 259 + 18 * chlist
			offset = {
				value: HeaderSize + TableSize
			},
			outBuffer = new Uint8Array( HeaderSize + TableSize + chunks.totalSize + info.numBlocks * 8 ),
			dv = new DataView( outBuffer.buffer );
		fillHeader( outBuffer, chunks, info );

		for ( let i = 0; i < chunks.data.length; ++ i ) {

			const data = chunks.data[ i ].dataChunk;
			const size = chunks.data[ i ].size;
			setUint32( dv, i * info.blockLines, offset );
			setUint32( dv, size, offset );
			outBuffer.set( data, offset.value );
			offset.value += size;

		}

		return outBuffer;

	}

	function decodeLinear( dec, r, g, b, a ) {

		dec.r = r;
		dec.g = g;
		dec.b = b;
		dec.a = a;

	} // function decodeSRGB( dec, r, g, b, a ) {
	// 	dec.r = r > 0.04045 ? Math.pow( r * 0.9478672986 + 0.0521327014, 2.4 ) : r * 0.0773993808;
	// 	dec.g = g > 0.04045 ? Math.pow( g * 0.9478672986 + 0.0521327014, 2.4 ) : g * 0.0773993808;
	// 	dec.b = b > 0.04045 ? Math.pow( b * 0.9478672986 + 0.0521327014, 2.4 ) : b * 0.0773993808;
	// 	dec.a = a;
	// }


	function setUint8( dv, value, offset ) {

		dv.setUint8( offset.value, value );
		offset.value += 1;

	}

	function setUint32( dv, value, offset ) {

		dv.setUint32( offset.value, value, true );
		offset.value += 4;

	}

	function setFloat16( dv, value, offset ) {

		dv.setUint16( offset.value, THREE.DataUtils.toHalfFloat( value ), true );
		offset.value += 2;

	}

	function setFloat32( dv, value, offset ) {

		dv.setFloat32( offset.value, value, true );
		offset.value += 4;

	}

	function setUint64( dv, value, offset ) {

		dv.setBigUint64( offset.value, BigInt( value ), true );
		offset.value += 8;

	}

	function setString( dv, string, offset ) {

		const tmp = textEncoder.encode( string + '\0' );

		for ( let i = 0; i < tmp.length; ++ i ) {

			setUint8( dv, tmp[ i ], offset );

		}

	}

	function decodeFloat16( binary ) {

		const exponent = ( binary & 0x7C00 ) >> 10,
			fraction = binary & 0x03FF;
		return ( binary >> 15 ? - 1 : 1 ) * ( exponent ? exponent === 0x1F ? fraction ? NaN : Infinity : Math.pow( 2, exponent - 15 ) * ( 1 + fraction / 0x400 ) : 6.103515625e-5 * ( fraction / 0x400 ) );

	}

	function getFloat16( arr, i ) {

		return decodeFloat16( arr[ i ] );

	}

	function getFloat32( arr, i ) {

		return arr[ i ];

	}

	THREE.EXRExporter = EXRExporter;
	THREE.NO_COMPRESSION = NO_COMPRESSION;
	THREE.ZIPS_COMPRESSION = ZIPS_COMPRESSION;
	THREE.ZIP_COMPRESSION = ZIP_COMPRESSION;

} )();
