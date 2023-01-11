import { float, int, uint, vec2, ivec2, uvec2, vec3, ivec3, uvec3, vec4, ivec4, uvec4 } from 'three/nodes';

export default class TypedBuffer {

	constructor( bufferAttribute ) {

		if ( ( bufferAttribute.array instanceof Float64Array ) || ( bufferAttribute.array instanceof BigInt64Array ) || ( bufferAttribute.array instanceof BigUint64Array ) ) {

			throw new Error( 'Float64Array, BigInt64Array, and BigUint64Array are not supported, because float64 and int64 are not supported either in WebGL or WebGPU' );

		}

		this._attribute = bufferAttribute;
		this._buffer = null;

	}

	get typedArray() {

		return this._attribute.array;

	}

	set typedArray( typedArray ) {

		this._attribute.array.set( new this._attribute.array.constructor( typedArray ) );

	}

	get buffer() {

		return this._buffer;

	}

	set buffer( value ) {

		throw new Error( 'GPU buffer of a TypedBuffer cannot be changed' );

	}

	get arrayLength() {

		return this._attribute.array.length;

	}

	get length() {

		return this._attribute.count;

	}

	getBufferElement( /* i */ ) {

		console.warn( 'Abstract function.' );

	}

	setBufferElement( /* i, value */ ) {

		console.warn( 'Abstract function.' );

	}

	set needsUpdate( value ) {

		this._buffer.needsUpdate = value;

	}

	dispose() {

		this._buffer.dispose();

	}

}

export function getFunction( bufferAttribute ) {

	const array = bufferAttribute.array;

	let functionType;

	if ( ( array instanceof Int8Array ) || ( array instanceof Int16Array ) || ( array instanceof Int32Array ) ) {

		functionType = 'int';

	} else if ( ( array instanceof Uint8Array ) || ( array instanceof Uint8ClampedArray ) || ( array instanceof Uint16Array ) || ( array instanceof Uint32Array ) ) {

		functionType = 'uint';

	} else if ( array instanceof Float32Array ) {

		functionType = 'float';

	}

	switch ( bufferAttribute.itemSize ) {

		case 1:
			return ( functionType === 'uint' ) ? uint : ( functionType === 'int' ) ? int : float;

		case 2:
			return ( functionType === 'uint' ) ? uvec2 : ( functionType === 'int' ) ? ivec2 : vec2;

		case 3:
			return ( functionType === 'uint' ) ? uvec3 : ( functionType === 'int' ) ? ivec3 : vec3;

		case 4:
			return ( functionType === 'uint' ) ? uvec4 : ( functionType === 'int' ) ? ivec4 : vec4;

	}

}

export function getFloatFunction( bufferAttribute ) {

	switch ( bufferAttribute.itemSize ) {

		case 1:
			return float;

		case 2:
			return vec2;

		case 3:
			return vec3;

		case 4:
			return vec4;

	}

}