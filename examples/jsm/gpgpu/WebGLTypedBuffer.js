import {
	DataTexture,

	UnsignedByteType,
	ByteType,
	ShortType,
	UnsignedShortType,
	IntType,
	UnsignedIntType,
	FloatType,

	RedFormat,
	RGFormat,
	RGBAFormat
} from 'three';
import { texture, add, div, remainder, floor, vec2, mul, float, int } from 'three/nodes';
import TypedBuffer, { getFunction, getFloatFunction } from './TypedBuffer.js';

function getTextureElement( dataTexture, i, width, height ) {

	const x = div( add( 0.5, remainder( i, width ) ), width );
	const y = div( add( 0.5,       div( i, width ) ), height );

	return texture( dataTexture, vec2( x, y ) );

}

export function getTextureType( typedArray ) {

	let textureType;

	if ( typedArray instanceof Int8Array ) {

		textureType = ByteType;

	} else if ( ( typedArray instanceof Uint8Array ) || ( typedArray instanceof Uint8ClampedArray ) ) {

		textureType = UnsignedByteType;

	} else if ( typedArray instanceof Int16Array ) {

		textureType = ShortType;

	} else if ( typedArray instanceof Uint16Array ) {

		textureType = UnsignedShortType;

	} else if ( typedArray instanceof Int32Array ) {

		textureType = IntType;

	} else if ( typedArray instanceof Uint32Array ) {

		textureType = UnsignedIntType;

	} else if ( typedArray instanceof Float32Array ) {

		textureType = FloatType;

	}

	return textureType;

}

export function getTextureFormat( elementSize ) { // @TODO: possibly support impossible type-format combinations by using padding

	switch ( elementSize ) {

		case 1:
			return RedFormat;

		case 2:
			return RGFormat;

		case 3:
			return null;

		case 4:
			return RGBAFormat;

	}

}

export function calculateWidthHeight( length ) {

	let width; // @TODO: maybe just set width and height to Math.sqrt( length ) and pad the texture with zeroes?
	for ( width = Math.floor( Math.sqrt( length ) ); width > 0; width ++ ) {

		if ( length % width === 0 ) break;

	}
	const height = length / width;

	return { width, height };

}

export default class WebGLTypedBuffer extends TypedBuffer {

	constructor( typedArray, elementSize = 1 ) {

		// @TODO: add support for UBOs

		super( typedArray, elementSize );

		const { width, height } = calculateWidthHeight( this.length );
		this.width = width;
		this.height = height;

		const buffer = this._buffer = new DataTexture( typedArray, width, height, getTextureFormat( elementSize ), getTextureType( typedArray ) );
		buffer.needsUpdate = true;

		this._function = getFunction( typedArray, elementSize );
		this._floatFunction = getFloatFunction( elementSize );

	}

	getBufferElement( i ) {

		const gpuBuffer = this._buffer;
		const textureElement = getTextureElement( gpuBuffer, int( i ), gpuBuffer.image.width, gpuBuffer.image.height );
		return this._function( mul( textureElement, 255 ) );

	}

	setBufferElement( i, value ) {

		return div( this._floatFunction( value ), 255 );

	}

}