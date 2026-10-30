import {
	FloatType,
	HalfFloatType,
	RGBAFormat,
	DataUtils,
} from 'three';
import * as fflate from '../libs/fflate.module.js';

const textEncoder = new TextEncoder();

const NO_COMPRESSION = 0;
const RLE_COMPRESSION = 1;
const ZIPS_COMPRESSION = 2;
const ZIP_COMPRESSION = 3;
const PIZ_COMPRESSION = 4;

const USHORT_RANGE = 1 << 16;
const BITMAP_SIZE = USHORT_RANGE >> 3;
const A_OFFSET = 1 << 15;
const M_OFFSET = 1 << 15;
const MOD_MASK = ( 1 << 16 ) - 1;
const HUF_ENCSIZE = ( 1 << 16 ) + 1;
const SHORT_ZEROCODE_RUN = 59;
const LONG_ZEROCODE_RUN = 63;
const SHORTEST_LONG_RUN = 2 + LONG_ZEROCODE_RUN - SHORT_ZEROCODE_RUN;
const LONGEST_LONG_RUN = 255 + SHORTEST_LONG_RUN;

/**
 * An exporter for EXR.
 *
 * EXR ( Extended Dynamic Range) is an [open format specification](https://github.com/AcademySoftwareFoundation/openexr)
 * for professional-grade image storage format of the motion picture industry. The purpose of
 * format is to accurately and efficiently represent high-dynamic-range scene-linear image data
 * and associated metadata. The library is widely used in host application software where accuracy
 * is critical, such as photorealistic rendering, texture access, image compositing, deep compositing,
 * and DI.
 *
 * ```js
 * const exporter = new EXRExporter();
 * const result = await exporter.parse( renderer, options );
 * ```
 *
 * @three_import import { EXRExporter } from 'three/addons/exporters/EXRExporter.js';
 */
class EXRExporter {

	/**
	 * This method has two variants.
	 *
	 * - When exporting a data texture, it receives two parameters. The texture and the exporter options.
	 * - When exporting a render target, it receives three parameters. The renderer, the
	 * render target and the exporter options.
	 *
	 * @async
	 * @param {(DataTexture|WebGPURenderer|WebGLRenderer)} arg1 - The data texture to export or a renderer.
	 * @param {(EXRExporter~Options|RenderTarget)} arg2 - The exporter options or a render target.
	 * @param {EXRExporter~Options} [arg3] - The exporter options.
	 * @return {Promise<Uint8Array>} A Promise that resolves with the exported EXR.
	 */
	async parse( arg1, arg2, arg3 ) {

		if ( ! arg1 || ! ( arg1.isWebGLRenderer || arg1.isWebGPURenderer || arg1.isDataTexture ) ) {

			throw Error( 'EXRExporter.parse: Unsupported first parameter, expected instance of WebGLRenderer, WebGPURenderer or DataTexture.' );

		} else if ( arg1.isWebGLRenderer || arg1.isWebGPURenderer ) {

			const renderer = arg1, renderTarget = arg2, options = arg3;

			supportedRTT( renderTarget, options );

			const info = buildInfoRTT( renderTarget, options ),
				dataBuffer = await getPixelData( renderer, renderTarget, info ),
				rawContentBuffer = reorganizeDataBuffer( dataBuffer, info ),
				chunks = compressData( rawContentBuffer, info );

			return fillData( chunks, info );

		} else if ( arg1.isDataTexture ) {

			const texture = arg1, options = arg2;

			supportedDT( texture );

			const info = buildInfoDT( texture, options ),
				dataBuffer = texture.image.data,
				rawContentBuffer = reorganizeDataBuffer( dataBuffer, info ),
				chunks = compressData( rawContentBuffer, info );

			return fillData( chunks, info );

		}

	}

}

function supportedRTT( renderTarget, options = {} ) {

	if ( ! renderTarget || ! renderTarget.isRenderTarget ) {

		throw Error( 'EXRExporter.parse: Unsupported second parameter, expected instance of WebGLRenderTarget.' );

	}

	const textureIndex = ( options.textureIndex !== undefined ) ? options.textureIndex : 0;
	const texture = renderTarget.textures[ textureIndex ];

	if ( texture === undefined ) {

		throw Error( 'EXRExporter.parse: Invalid textureIndex, the render target has ' + renderTarget.textures.length + ' texture(s).' );

	}

	if ( renderTarget.isCubeRenderTarget || renderTarget.isWebGLCubeRenderTarget || renderTarget.isWebGL3DRenderTarget || renderTarget.isWebGLArrayRenderTarget ) {

		throw Error( 'EXRExporter.parse: Unsupported render target type, expected instance of WebGLRenderTarget.' );

	}

	if ( texture.type !== FloatType && texture.type !== HalfFloatType ) {

		throw Error( 'EXRExporter.parse: Unsupported WebGLRenderTarget texture type.' );

	}

	if ( texture.format !== RGBAFormat ) {

		throw Error( 'EXRExporter.parse: Unsupported WebGLRenderTarget texture format, expected RGBAFormat.' );

	}

}

function supportedDT( texture ) {

	if ( texture.type !== FloatType && texture.type !== HalfFloatType ) {

		throw Error( 'EXRExporter.parse: Unsupported DataTexture texture type.' );

	}

	if ( texture.format !== RGBAFormat ) {

		throw Error( 'EXRExporter.parse: Unsupported DataTexture texture format, expected RGBAFormat.' );

	}

	if ( ! texture.image.data ) {

		throw Error( 'EXRExporter.parse: Invalid DataTexture image data.' );

	}

	if ( texture.type === FloatType && texture.image.data.constructor.name !== 'Float32Array' ) {

		throw Error( 'EXRExporter.parse: DataTexture image data doesn\'t match type, expected \'Float32Array\'.' );

	}

	if ( texture.type === HalfFloatType && texture.image.data.constructor.name !== 'Uint16Array' ) {

		throw Error( 'EXRExporter.parse: DataTexture image data doesn\'t match type, expected \'Uint16Array\'.' );

	}

}

function buildInfoRTT( renderTarget, options = {} ) {

	const compressionSizes = {
		0: 1,
		1: 1,
		2: 1,
		3: 16,
		4: 32
	};

	const TEXTURE_INDEX = ( options.textureIndex !== undefined ) ? options.textureIndex : 0,
		TEXTURE = renderTarget.textures[ TEXTURE_INDEX ],
		WIDTH = renderTarget.width,
		HEIGHT = renderTarget.height,
		TYPE = TEXTURE.type,
		FORMAT = TEXTURE.format,
		COMPRESSION = ( options.compression !== undefined ) ? options.compression : ZIP_COMPRESSION,
		EXPORTER_TYPE = ( options.type !== undefined ) ? options.type : HalfFloatType,
		OUT_TYPE = ( EXPORTER_TYPE === FloatType ) ? 2 : 1,
		COMPRESSION_SIZE = compressionSizes[ COMPRESSION ],
		NUM_CHANNELS = 4;

	return {
		width: WIDTH,
		height: HEIGHT,
		type: TYPE,
		format: FORMAT,
		compression: COMPRESSION,
		blockLines: COMPRESSION_SIZE,
		dataType: OUT_TYPE,
		dataSize: 2 * OUT_TYPE,
		numBlocks: Math.ceil( HEIGHT / COMPRESSION_SIZE ),
		numInputChannels: 4,
		numOutputChannels: NUM_CHANNELS,
		textureIndex: TEXTURE_INDEX,
	};

}

function buildInfoDT( texture, options = {} ) {

	const compressionSizes = {
		0: 1,
		1: 1,
		2: 1,
		3: 16,
		4: 32
	};

	const WIDTH = texture.image.width,
		HEIGHT = texture.image.height,
		TYPE = texture.type,
		FORMAT = texture.format,
		COMPRESSION = ( options.compression !== undefined ) ? options.compression : ZIP_COMPRESSION,
		EXPORTER_TYPE = ( options.type !== undefined ) ? options.type : HalfFloatType,
		OUT_TYPE = ( EXPORTER_TYPE === FloatType ) ? 2 : 1,
		COMPRESSION_SIZE = compressionSizes[ COMPRESSION ],
		NUM_CHANNELS = 4;

	return {
		width: WIDTH,
		height: HEIGHT,
		type: TYPE,
		format: FORMAT,
		compression: COMPRESSION,
		blockLines: COMPRESSION_SIZE,
		dataType: OUT_TYPE,
		dataSize: 2 * OUT_TYPE,
		numBlocks: Math.ceil( HEIGHT / COMPRESSION_SIZE ),
		numInputChannels: 4,
		numOutputChannels: NUM_CHANNELS,
	};

}

async function getPixelData( renderer, rtt, info ) {

	let dataBuffer;

	if ( renderer.isWebGLRenderer ) {

		if ( info.type === FloatType ) {

			dataBuffer = new Float32Array( info.width * info.height * info.numInputChannels );

		} else {

			dataBuffer = new Uint16Array( info.width * info.height * info.numInputChannels );

		}

		await renderer.readRenderTargetPixelsAsync( rtt, 0, 0, info.width, info.height, dataBuffer, undefined, info.textureIndex );

	} else {

		dataBuffer = await renderer.readRenderTargetPixelsAsync( rtt, 0, 0, info.width, info.height, info.textureIndex );

	}

	return dataBuffer;

}

function reorganizeDataBuffer( inBuffer, info ) {

	const w = info.width,
		h = info.height,
		dec = { r: 0, g: 0, b: 0, a: 0 },
		offset = { value: 0 },
		cOffset = ( info.numOutputChannels == 4 ) ? 1 : 0,
		getValue = ( info.type == FloatType ) ? getFloat32 : getFloat16,
		setValue = ( info.dataType == 1 ) ? setFloat16 : setFloat32,
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

			offset.value = line + ( cOffset ) * w * info.dataSize + x * info.dataSize;
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

	const chunks = { data: new Array(), totalSize: 0 },
		size = info.width * info.numOutputChannels * info.blockLines * info.dataSize;

	switch ( info.compression ) {

		case 0:
			compress = compressNONE;
			break;

		case 1:
			compress = compressRLE;
			break;

		case 2:
		case 3:
			compress = compressZIP;
			break;

		case 4:
			compress = compressPIZ;
			break;

	}

	if ( info.compression !== 0 ) {

		tmpBuffer = new Uint8Array( size );

	}

	for ( let i = 0; i < info.numBlocks; ++ i ) {

		const arr = inBuffer.subarray( size * i, size * ( i + 1 ) );

		let block = compress( arr, tmpBuffer, info );

		if ( block.length >= arr.length ) block = arr;

		sum += block.length;

		chunks.data.push( { dataChunk: block, size: block.length } );

	}

	chunks.totalSize = sum;

	return chunks;

}

function compressNONE( data ) {

	return data;

}

function reorderAndPredict( data, tmpBuffer ) {

	tmpBuffer = tmpBuffer.subarray( 0, data.length );

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

	}

	//
	// Predictor.
	//

	let p = tmpBuffer[ 0 ];

	for ( let t = 1; t < tmpBuffer.length; t ++ ) {

		const d = tmpBuffer[ t ] - p + ( 128 + 256 );
		p = tmpBuffer[ t ];
		tmpBuffer[ t ] = d;

	}

	return tmpBuffer;

}

function compressRLE( data, tmpBuffer ) {

	tmpBuffer = reorderAndPredict( data, tmpBuffer );

	const out = new Uint8Array( tmpBuffer.length * 2 );
	const end = tmpBuffer.length;

	let runs = 0, rune = 1, o = 0;

	while ( runs < end ) {

		let count = 0;

		while ( rune < end && tmpBuffer[ runs ] === tmpBuffer[ rune ] && count < 127 ) {

			rune ++;
			count ++;

		}

		if ( count >= 2 ) {

			out[ o ++ ] = count;
			out[ o ++ ] = tmpBuffer[ runs ];

			runs = rune;

		} else {

			count ++;

			while ( rune < end &&
				( ( rune + 1 >= end || tmpBuffer[ rune ] !== tmpBuffer[ rune + 1 ] ) ||
				( rune + 2 >= end || tmpBuffer[ rune + 1 ] !== tmpBuffer[ rune + 2 ] ) ) &&
				count < 127 ) {

				count ++;
				rune ++;

			}

			out[ o ++ ] = - count;

			while ( runs < rune ) out[ o ++ ] = tmpBuffer[ runs ++ ];

		}

		rune ++;

	}

	return out.slice( 0, o );

}

function compressZIP( data, tmpBuffer ) {

	tmpBuffer = reorderAndPredict( data, tmpBuffer );

	const deflate = fflate.zlibSync( tmpBuffer );

	return deflate;

}

function compressPIZ( data, tmpBuffer, info ) {

	const channels = info.numOutputChannels;
	const wcount = info.dataSize / 2;
	const nx = info.width;
	const bpl = nx * info.dataSize;
	const ny = data.length / ( bpl * channels );
	const ndata = data.length / 2;

	const buffer = new Uint16Array( ndata );

	for ( let y = 0; y < ny; y ++ ) {

		for ( let c = 0; c < channels; c ++ ) {

			const src = ( y * channels + c ) * bpl;
			const dst = ( c * ny + y ) * bpl / 2;

			for ( let i = 0; i < bpl / 2; i ++ ) {

				buffer[ dst + i ] = data[ src + 2 * i ] | ( data[ src + 2 * i + 1 ] << 8 );

			}

		}

	}

	const bitmap = new Uint8Array( BITMAP_SIZE );

	for ( let i = 0; i < ndata; i ++ ) {

		bitmap[ buffer[ i ] >> 3 ] |= 1 << ( buffer[ i ] & 7 );

	}

	bitmap[ 0 ] &= ~ 1;

	let minNonZero = BITMAP_SIZE - 1;
	let maxNonZero = 0;

	for ( let i = 0; i < BITMAP_SIZE; i ++ ) {

		if ( bitmap[ i ] ) {

			if ( minNonZero > i ) minNonZero = i;
			if ( maxNonZero < i ) maxNonZero = i;

		}

	}

	const lut = new Uint16Array( USHORT_RANGE );
	let k = 0;

	for ( let i = 0; i < USHORT_RANGE; i ++ ) {

		if ( i === 0 || ( bitmap[ i >> 3 ] & ( 1 << ( i & 7 ) ) ) ) lut[ i ] = k ++;

	}

	const maxValue = k - 1;

	for ( let i = 0; i < ndata; i ++ ) {

		buffer[ i ] = lut[ buffer[ i ] ];

	}

	for ( let c = 0; c < channels; c ++ ) {

		for ( let j = 0; j < wcount; j ++ ) {

			wav2Encode( buffer, c * nx * ny * wcount + j, nx, wcount, ny, wcount * nx, maxValue );

		}

	}

	const bitmapLength = ( minNonZero <= maxNonZero ) ? maxNonZero - minNonZero + 1 : 0;

	const huf = hufCompress( buffer, data.length );

	if ( huf === null ) return data;

	const out = new Uint8Array( 8 + bitmapLength + huf.length );
	const dv = new DataView( out.buffer );

	dv.setUint16( 0, minNonZero, true );
	dv.setUint16( 2, maxNonZero, true );
	out.set( bitmap.subarray( minNonZero, minNonZero + bitmapLength ), 4 );
	dv.setUint32( 4 + bitmapLength, huf.length, true );
	out.set( huf, 8 + bitmapLength );

	return out;

}

const _wenc = { l: 0, h: 0 };

function wenc14( a, b, out ) {

	const as = ( a << 16 ) >> 16;
	const bs = ( b << 16 ) >> 16;

	out.l = ( ( as + bs ) >> 1 ) & 0xffff;
	out.h = ( as - bs ) & 0xffff;

}

function wenc16( a, b, out ) {

	const ao = ( a + A_OFFSET ) & MOD_MASK;
	let m = ( ao + b ) >> 1;
	const d = ao - b;

	if ( d < 0 ) m = ( m + M_OFFSET ) & MOD_MASK;

	out.l = m;
	out.h = d & MOD_MASK;

}

function wav2Encode( buffer, j, nx, ox, ny, oy, mx ) {

	const wenc = ( mx < ( 1 << 14 ) ) ? wenc14 : wenc16;
	const n = ( nx > ny ) ? ny : nx;

	let p = 1;
	let p2 = 2;

	while ( p2 <= n ) {

		let py = j;
		const ey = j + oy * ( ny - p2 );
		const oy1 = oy * p;
		const oy2 = oy * p2;
		const ox1 = ox * p;
		const ox2 = ox * p2;

		for ( ; py <= ey; py += oy2 ) {

			let px = py;
			const ex = py + ox * ( nx - p2 );

			for ( ; px <= ex; px += ox2 ) {

				const p01 = px + ox1;
				const p10 = px + oy1;
				const p11 = p10 + ox1;

				wenc( buffer[ px ], buffer[ p01 ], _wenc );
				const i00 = _wenc.l, i01 = _wenc.h;

				wenc( buffer[ p10 ], buffer[ p11 ], _wenc );
				const i10 = _wenc.l, i11 = _wenc.h;

				wenc( i00, i10, _wenc );
				buffer[ px ] = _wenc.l;
				buffer[ p10 ] = _wenc.h;

				wenc( i01, i11, _wenc );
				buffer[ p01 ] = _wenc.l;
				buffer[ p11 ] = _wenc.h;

			}

			if ( nx & p ) {

				const p10 = px + oy1;

				wenc( buffer[ px ], buffer[ p10 ], _wenc );
				buffer[ px ] = _wenc.l;
				buffer[ p10 ] = _wenc.h;

			}

		}

		if ( ny & p ) {

			let px = py;
			const ex = py + ox * ( nx - p2 );

			for ( ; px <= ex; px += ox2 ) {

				const p01 = px + ox1;

				wenc( buffer[ px ], buffer[ p01 ], _wenc );
				buffer[ px ] = _wenc.l;
				buffer[ p01 ] = _wenc.h;

			}

		}

		p = p2;
		p2 <<= 1;

	}

}

function hufCompress( raw, maxLength ) {

	const freq = new Float64Array( HUF_ENCSIZE );

	for ( let i = 0; i < raw.length; i ++ ) freq[ raw[ i ] ] ++;

	const table = hufBuildEncTable( freq );

	const out = new Uint8Array( maxLength );
	const writer = { out, offset: 20, c: 0, lc: 0, overflow: false };

	hufPackEncTable( table, writer );

	const tableLength = writer.offset - 20;
	const dataStart = writer.offset;

	writer.c = 0;
	writer.lc = 0;

	hufEncode( table, raw, writer );

	const nBits = ( writer.offset - dataStart ) * 8 + writer.lc;
	const length = dataStart + Math.ceil( nBits / 8 );

	if ( writer.overflow || length >= maxLength ) return null;

	const dv = new DataView( out.buffer );

	dv.setUint32( 0, table.im, true );
	dv.setUint32( 4, table.iM, true );
	dv.setUint32( 8, tableLength, true );
	dv.setUint32( 12, nBits, true );
	dv.setUint32( 16, 0, true );

	return out.subarray( 0, length );

}

function hufBuildEncTable( frq ) {

	const hlink = new Uint32Array( HUF_ENCSIZE );
	const heap = [];

	let im = 0;
	let iM = 0;

	while ( ! frq[ im ] ) im ++;

	for ( let i = im; i < HUF_ENCSIZE; i ++ ) {

		hlink[ i ] = i;

		if ( frq[ i ] ) {

			heap.push( i );
			iM = i;

		}

	}

	iM ++;
	frq[ iM ] = 1;
	heap.push( iM );

	let nf = heap.length;

	const greater = ( a, b ) => frq[ a ] > frq[ b ] || ( frq[ a ] === frq[ b ] && a > b );

	makeHeap( heap, nf, greater );

	const lengths = new Uint8Array( HUF_ENCSIZE );

	while ( nf > 1 ) {

		const mm = heap[ 0 ];
		popHeap( heap, nf, greater );
		nf --;

		const m = heap[ 0 ];
		popHeap( heap, nf, greater );

		frq[ m ] += frq[ mm ];
		pushHeap( heap, nf, greater );

		for ( let j = m; ; j = hlink[ j ] ) {

			lengths[ j ] ++;

			if ( hlink[ j ] === j ) {

				hlink[ j ] = mm;
				break;

			}

		}

		for ( let j = mm; ; j = hlink[ j ] ) {

			lengths[ j ] ++;

			if ( hlink[ j ] === j ) break;

		}

	}

	const n = new Float64Array( 59 );

	for ( let i = 0; i < HUF_ENCSIZE; i ++ ) n[ lengths[ i ] ] ++;

	let c = 0;

	for ( let i = 58; i > 0; i -- ) {

		const nc = Math.floor( ( c + n[ i ] ) / 2 );
		n[ i ] = c;
		c = nc;

	}

	const codes = new Float64Array( HUF_ENCSIZE );

	for ( let i = 0; i < HUF_ENCSIZE; i ++ ) {

		if ( lengths[ i ] > 0 ) codes[ i ] = n[ lengths[ i ] ] ++;

	}

	return { codes, lengths, im, iM };

}

function pushHeapHole( heap, holeIndex, topIndex, value, greater ) {

	let parent = Math.floor( ( holeIndex - 1 ) / 2 );

	while ( holeIndex > topIndex && greater( heap[ parent ], value ) ) {

		heap[ holeIndex ] = heap[ parent ];
		holeIndex = parent;
		parent = Math.floor( ( holeIndex - 1 ) / 2 );

	}

	heap[ holeIndex ] = value;

}

function adjustHeap( heap, holeIndex, len, value, greater ) {

	const topIndex = holeIndex;
	let secondChild = holeIndex;

	while ( secondChild < Math.floor( ( len - 1 ) / 2 ) ) {

		secondChild = 2 * ( secondChild + 1 );

		if ( greater( heap[ secondChild ], heap[ secondChild - 1 ] ) ) secondChild --;

		heap[ holeIndex ] = heap[ secondChild ];
		holeIndex = secondChild;

	}

	if ( ( len & 1 ) === 0 && secondChild === ( len - 2 ) / 2 ) {

		secondChild = 2 * ( secondChild + 1 );
		heap[ holeIndex ] = heap[ secondChild - 1 ];
		holeIndex = secondChild - 1;

	}

	pushHeapHole( heap, holeIndex, topIndex, value, greater );

}

function makeHeap( heap, len, greater ) {

	if ( len < 2 ) return;

	for ( let parent = Math.floor( ( len - 2 ) / 2 ); parent >= 0; parent -- ) {

		adjustHeap( heap, parent, len, heap[ parent ], greater );

	}

}

function pushHeap( heap, len, greater ) {

	pushHeapHole( heap, len - 1, 0, heap[ len - 1 ], greater );

}

function popHeap( heap, len, greater ) {

	if ( len > 1 ) {

		const last = len - 1;
		const value = heap[ last ];

		heap[ last ] = heap[ 0 ];
		adjustHeap( heap, 0, last, value, greater );

	}

}

function outputBits( writer, nBits, bits ) {

	while ( nBits > 0 ) {

		const k = Math.min( nBits, 16 );
		nBits -= k;

		writer.c = ( writer.c << k ) | ( Math.floor( bits / 2 ** nBits ) % ( 1 << k ) );
		writer.lc += k;

		while ( writer.lc >= 8 ) {

			writer.lc -= 8;

			if ( writer.offset < writer.out.length ) {

				writer.out[ writer.offset ++ ] = writer.c >> writer.lc;

			} else {

				writer.overflow = true;

			}

		}

		writer.c &= ( 1 << writer.lc ) - 1;

	}

}

function hufPackEncTable( table, writer ) {

	const { lengths, iM } = table;

	for ( let im = table.im; im <= iM; im ++ ) {

		const l = lengths[ im ];

		if ( l === 0 ) {

			let zerun = 1;

			while ( im < iM && zerun < LONGEST_LONG_RUN ) {

				if ( lengths[ im + 1 ] > 0 ) break;

				im ++;
				zerun ++;

			}

			if ( zerun >= 2 ) {

				if ( zerun >= SHORTEST_LONG_RUN ) {

					outputBits( writer, 6, LONG_ZEROCODE_RUN );
					outputBits( writer, 8, zerun - SHORTEST_LONG_RUN );

				} else {

					outputBits( writer, 6, SHORT_ZEROCODE_RUN + zerun - 2 );

				}

				continue;

			}

		}

		outputBits( writer, 6, l );

	}

	if ( writer.lc > 0 ) outputBits( writer, 8 - writer.lc, 0 );

}

function hufEncode( table, raw, writer ) {

	const { codes, lengths, iM: rlc } = table;

	const sendCode = ( s, runCount ) => {

		if ( lengths[ s ] + lengths[ rlc ] + 8 < lengths[ s ] * runCount ) {

			outputBits( writer, lengths[ s ], codes[ s ] );
			outputBits( writer, lengths[ rlc ], codes[ rlc ] );
			outputBits( writer, 8, runCount );

		} else {

			while ( runCount -- >= 0 ) outputBits( writer, lengths[ s ], codes[ s ] );

		}

	};

	let s = raw[ 0 ];
	let cs = 0;

	for ( let i = 1; i < raw.length; i ++ ) {

		const ns = raw[ i ];

		if ( cs === 255 || s !== ns ) {

			sendCode( s, cs );
			cs = 0;
			s = ns;

		} else {

			cs ++;

		}

	}

	sendCode( s, cs );

	if ( writer.lc > 0 ) {

		if ( writer.offset < writer.out.length ) {

			writer.out[ writer.offset ] = ( writer.c << ( 8 - writer.lc ) ) & 0xff;

		} else {

			writer.overflow = true;

		}

	}

}

function fillHeader( outBuffer, chunks, info ) {

	const offset = { value: 0 };
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

	setUint8( dv, 0, offset );

	// null-byte
	setUint8( dv, 0, offset );

	// = OFFSET TABLE =

	let sum = offset.value + info.numBlocks * 8;

	for ( let i = 0; i < chunks.data.length; ++ i ) {

		setUint64( dv, sum, offset );

		sum += chunks.data[ i ].size + 8;

	}

}

function fillData( chunks, info ) {

	const TableSize = info.numBlocks * 8,
		HeaderSize = 259 + ( 18 * info.numOutputChannels ), // 259 + 18 * chlist
		offset = { value: HeaderSize + TableSize },
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

}

// function decodeSRGB( dec, r, g, b, a ) {

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

	dv.setUint16( offset.value, DataUtils.toHalfFloat( value ), true );

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

function getFloat16( arr, i ) {

	return decodeFloat16( arr[ i ] );

}

function getFloat32( arr, i ) {

	return arr[ i ];

}

/**
 * Export options of `EXRExporter`.
 *
 * @typedef {Object} EXRExporter~Options
 * @property {(HalfFloatType|FloatType)} [type=HalfFloatType] - Output data type.
 * @property {(NO_COMPRESSION|RLE_COMPRESSION|ZIP_COMPRESSION|ZIPS_COMPRESSION|PIZ_COMPRESSION)} [compression=ZIP_COMPRESSION] - The compression algorithm.
 * @property {number} [textureIndex=0] - When exporting a render target with multiple textures (MRT), the index of the texture to export.
 **/

export { EXRExporter, NO_COMPRESSION, RLE_COMPRESSION, ZIP_COMPRESSION, ZIPS_COMPRESSION, PIZ_COMPRESSION };
