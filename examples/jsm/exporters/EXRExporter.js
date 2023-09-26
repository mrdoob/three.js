/**
 * @author sciecode / https://github.com/sciecode
 *
 * EXR format references:
 * 	https://www.openexr.com/documentation/openexrfilelayout.pdf
 */

import {
	FloatType,
	HalfFloatType,
	RGBAFormat,
	DataUtils,
} from 'three';
import * as fflate from '../libs/fflate.module.js';

const textEncoder = new TextEncoder();

const NO_COMPRESSION = 0;
const ZIPS_COMPRESSION = 2;
const ZIP_COMPRESSION = 3;

class EXRExporter {

	parse( arg1, arg2, arg3 ) {

		if ( ! arg1 || ! ( arg1.isWebGLRenderer || arg1.isDataTexture ) ) {

			throw new Error( 'EXRExporter.parse: Unsupported first parameter, expected instance of WebGLRenderer or DataTexture.' );

		}

		let dataBuffer, texture, options;

		if ( arg1.isWebGLRenderer ) {

			const renderer = arg1, renderTarget = arg2;
			options = arg3;

			supportedRTT( renderTarget );

			options.width = renderTarget.width;
			options.height = renderTarget.height;

			texture = renderTarget.texture;
			dataBuffer = getPixelData( renderer, renderTarget );

		} else if ( arg1.isDataTexture ) {

			texture = arg1;
			options = arg2;

			supportedDT( texture );

			dataBuffer = texture.image.data;

		}

		const info = buildInfo( texture, options );
		const rawContentBuffer = reorganizeDataBuffer( dataBuffer, info );
		const chunks = compressData( rawContentBuffer, info );

		return fillData( chunks, info );

	}

}

function supportedRTT( renderTarget ) {

	if ( ! renderTarget || ! renderTarget.isWebGLRenderTarget || renderTarget.isWebGLCubeRenderTarget
	    || renderTarget.isWebGL3DRenderTarget || renderTarget.isWebGLArrayRenderTarget ) {

		throw new Error( 'EXRExporter.parse: Unsupported render target type, expected instance of WebGLRenderTarget.' );

	}

	if ( renderTarget.texture.type !== FloatType && renderTarget.texture.type !== HalfFloatType ) {

		throw new Error( 'EXRExporter.parse: Unsupported WebGLRenderTarget texture type, expected FloatType or HalfFloatType.' );

	}

	if ( renderTarget.texture.format !== RGBAFormat ) {

		throw new Error( 'EXRExporter.parse: Unsupported WebGLRenderTarget texture format, expected RGBAFormat.' );

	}

}

function supportedDT( texture ) {

	if ( texture.type !== FloatType && texture.type !== HalfFloatType ) {

		throw new Error( 'EXRExporter.parse: Unsupported DataTexture texture type, expected FloatType or HalfFloatType.' );

	}

	if ( texture.format !== RGBAFormat ) {

		throw new Error( 'EXRExporter.parse: Unsupported DataTexture texture format, expected RGBAFormat.' );

	}

	if ( ! texture.image.data ) {

		throw new Error( 'EXRExporter.parse: Missing DataTexture image data.' );

	}

	if ( texture.type === FloatType && texture.image.data.constructor.name !== 'Float32Array' ) {

		throw new Error( 'EXRExporter.parse: DataTexture image data doesn\'t match FloatType type, expected \'Float32Array\'.' );

	}

	if ( texture.type === HalfFloatType && texture.image.data.constructor.name !== 'Uint16Array' ) {

		throw new Error( 'EXRExporter.parse: DataTexture image data doesn\'t match HalfFloatType type, expected \'Uint16Array\'.' );

	}

}

function buildInfo( texture, options = {} ) {

	const compressionSizes = {
		0: 1,
		2: 1,
		3: 16
	};

	const width = options.width !== undefined ? options.width : texture.image.width;
	const height = options.height !== undefined ? options.height : texture.image.height;

	const compression = options.compression !== undefined ? options.compression : ZIP_COMPRESSION;
	const exporterType = options.type !== undefined ? options.type : HalfFloatType;
	const outType = exporterType === FloatType ? 2 : 1;
	const compressionSize = compressionSizes[ compression ];

	return {
		width,
		height,
		type: texture.type,
		format: texture.format,
		compression,
		blockLines: compressionSize,
		dataType: outType,
		dataSize: 2 * outType,
		numBlocks: Math.ceil( height / compressionSize ),
		numInputChannels: 4,
		numOutputChannels: 4
	};

}

function getPixelData( renderer, rtt ) {

	let dataBuffer;

	if ( rtt.texture.type === FloatType ) {

		dataBuffer = new Float32Array( 4 * rtt.width * rtt.height );

	} else {

		dataBuffer = new Uint16Array( 4 * rtt.width * rtt.height );

	}

	renderer.readRenderTargetPixels( rtt, 0, 0, rtt.width, rtt.height, dataBuffer );

	return dataBuffer;

}

function reorganizeDataBuffer( inBuffer, info ) {

	const w = info.width, h = info.height;

	const inHalfFloat = info.type === HalfFloatType, outHalfFloat = info.dataType === 1;

	const outBuffer = new Uint8Array( info.width * info.height * info.numOutputChannels * info.dataSize );

	const inWriter = new Writer( inBuffer );
	const outWriter = new Writer( outBuffer );

	for ( let y = 0; y < h; y ++ ) {

		for ( let x = 0; x < w; x ++ ) {

			const r = inWriter.getFloat( inHalfFloat );
			const g = inWriter.getFloat( inHalfFloat );
			const b = inWriter.getFloat( inHalfFloat );
			const a = inWriter.getFloat( inHalfFloat );

			outWriter.offset = ( ( h - y - 1 ) * w * info.numOutputChannels + x ) * info.dataSize;

			if ( info.numOutputChannels === 4 ) outWriter.setFloat( a, outHalfFloat );
			outWriter.setFloat( b, outHalfFloat );
			outWriter.setFloat( g, outHalfFloat );
			outWriter.setFloat( r, outHalfFloat );

		}

	}

	return outBuffer;

}

function compressData( inBuffer, info ) {

	let tmpBuffer, sum = 0;

	const chunks = { data: [], totalSize: 0 },
		size = info.width * info.numOutputChannels * info.blockLines * info.dataSize;

	if ( info.compression !== 0 ) {

		tmpBuffer = new Uint8Array( size );

	}

	for ( let i = 0; i < info.numBlocks; ++ i ) {

		const arr = inBuffer.subarray( size * i, size * ( i + 1 ) );

		const block = info.compression === 0 ? arr : compressZIP( arr, tmpBuffer );

		sum += block.length;

		chunks.data.push( { dataChunk: block, size: block.length } );

	}

	chunks.totalSize = sum;

	return chunks;

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

	const deflate = fflate.zlibSync( tmpBuffer );

	return deflate;

}

function fillHeader( outBuffer, chunks, info ) {

	const writer = new Writer( outBuffer );

	writer.setUint32( 20000630 ); // magic
	writer.setUint32( 2 ); // mask

	// = HEADER =

	writer.setString( 'compression' );
	writer.setString( 'compression' );
	writer.setUint32( 1 );
	writer.setUint8( info.compression );

	writer.setString( 'screenWindowCenter' );
	writer.setString( 'v2f' );
	writer.setUint32( 8 );
	writer.setUint32( 0 );
	writer.setUint32( 0 );

	writer.setString( 'screenWindowWidth' );
	writer.setString( 'float' );
	writer.setUint32( 4 );
	writer.setFloat32( 1.0 );

	writer.setString( 'pixelAspectRatio' );
	writer.setString( 'float' );
	writer.setUint32( 4 );
	writer.setFloat32( 1.0 );

	writer.setString( 'lineOrder' );
	writer.setString( 'lineOrder' );
	writer.setUint32( 1 );
	writer.setUint8( 0 );

	writer.setString( 'dataWindow' );
	writer.setString( 'box2i' );
	writer.setUint32( 16 );
	writer.setUint32( 0 );
	writer.setUint32( 0 );
	writer.setUint32( info.width - 1 );
	writer.setUint32( info.height - 1 );

	writer.setString( 'displayWindow' );
	writer.setString( 'box2i' );
	writer.setUint32( 16 );
	writer.setUint32( 0 );
	writer.setUint32( 0 );
	writer.setUint32( info.width - 1 );
	writer.setUint32( info.height - 1 );

	writer.setString( 'channels' );
	writer.setString( 'chlist' );
	writer.setUint32( info.numOutputChannels * 18 + 1 );

	writer.setString( 'A' );
	writer.setUint32( info.dataType );
	writer.setUint32( 0 );
	writer.setUint32( 1 );
	writer.setUint32( 1 );

	writer.setString( 'B' );
	writer.setUint32( info.dataType );
	writer.setUint32( 0 );
	writer.setUint32( 1 );
	writer.setUint32( 1 );

	writer.setString( 'G' );
	writer.setUint32( info.dataType );
	writer.setUint32( 0 );
	writer.setUint32( 1 );
	writer.setUint32( 1 );

	writer.setString( 'R' );
	writer.setUint32( info.dataType );
	writer.setUint32( 0 );
	writer.setUint32( 1 );
	writer.setUint32( 1 );

	writer.setUint8( 0 );

	// null-byte
	writer.setUint8( 0 );

	// = OFFSET TABLE =

	let sum = BigInt( offset.value + info.numBlocks * 8 );

	for ( let i = 0; i < chunks.data.length; ++ i ) {

		writer.setUint64( sum );

		sum += BigInt( chunks.data[ i ].size + 8 );

	}

}

function fillData( chunks, info ) {

	const headerPlusTable = 259 + info.numOutputChannels * 18 + info.numBlocks * 8;

	const outBuffer = new Uint8Array( headerPlusTable + chunks.totalSize + info.numBlocks * 8 );
	fillHeader( outBuffer, chunks, info );

	const writer = new Writer( outBuffer );
	writer.offset = headerPlusTable;

	for ( let i = 0; i < chunks.data.length; ++ i ) {

		const { dataChunk: data, size } = chunks.data[ i ];

		writer.setUint32( i * info.blockLines );
		writer.setUint32( size );

		outBuffer.set( data, offset.value );
		writer.offset += size;

	}

	return outBuffer;

}

class Writer {

	constructor( buffer ) {

		this.dv = buffer.buffer;
		this.offset = 0;

	}

	setUint8( value ) {

		this.dv.setUint8( this.offset, value );
		this.offset += 1;

	}

	setUint32( value ) {

		this.dv.setUint32( this.offset, value );
		this.offset += 4;

	}

	setUint64( value ) {

		this.dv.setBigUint64( this.offset, value );
		this.offset += 8;

	}

	setFloat16( value ) {

		this.dv.setUint16( this.offset, DataUtils.toHalfFloat( value ), true );
		this.offset += 2;

	}

	setFloat32( value ) {

		this.dv.setFloat32( this.offset, value, true );
		this.offset += 4;

	}

	setString( string ) {

		textEncoder.encode( string + '\0' ).forEach( v => this.setUint8( v ) );

	}

	getFloat( isHalfFloat ) {

		const value = isHalfFloat ? DataUtils.fromHalfFloat( this.dv.getUint16( this.offset, true ) ) : this.dv.getFloat32( this.offset );
		this.offset += isHalfFloat ? 2 : 4;
		return value;

	}

	setFloat( value, isHalfFloat ) {

		if ( isHalfFloat ) {

			this.setFloat16( value );

		} else {

			this.setFloat32( value );

		}

	}

}

export { EXRExporter, NO_COMPRESSION, ZIP_COMPRESSION, ZIPS_COMPRESSION };
