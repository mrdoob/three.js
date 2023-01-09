import { float, int, uint, vec2, ivec2, uvec2, vec3, ivec3, uvec3, vec4, ivec4, uvec4 } from 'three/nodes';

export default class TypedBuffer {

	constructor( typedArray, elementSize = 1 ) {

		if ( ( elementSize !== 1 ) && ( elementSize !== 2 ) && ( elementSize !== 3 ) && ( elementSize !== 4 ) ) {

			throw new Error( 'Element size can be only 1, 2, 3, or 4' );

		}

		if ( ( typedArray instanceof Float64Array ) || ( typedArray instanceof BigInt64Array ) || ( typedArray instanceof BigUint64Array ) ) {

			throw new Error( 'Float64Array, BigInt64Array, and BigUint64Array are not supported, because float64 and int64 are not supported either in WebGL or WebGPU' );

		} else if ( ! ArrayBuffer.isView( typedArray ) || ( typedArray instanceof DataView ) ) {

			throw new Error( 'First argument must be a typed array' );

		}

		this.elementSize = elementSize;

		this._typedArray = typedArray;
		this._buffer = null;

	}

	get typedArray() {

		return this._typedArray;

	}

	set typedArray( typedArray ) {

		this._typedArray.set( typedArray );

	}

	get buffer() {

		return this._buffer;

	}

	set buffer( value ) {

		throw new Error( 'GPU buffer of a TypedBuffer cannot be changed' );

	}

	get arrayLength() {

		return this._typedArray.length;

	}

	get length() {

		return this._typedArray.length / this.elementSize;

	}

	getBufferElement( i ) {

		console.warn( 'Abstract function.' );

	}

	setBufferElement( i, value ) {

		console.warn( 'Abstract function.' );

	}

	set needsUpdate( value ) {

		this._buffer.needsUpdate = value;

	}

	dispose() {

		this._buffer.dispose();

	}

}

export function getFunction( typedArray, elementSize ) {

	let functionType;

	if ( ( typedArray instanceof Int8Array ) || ( typedArray instanceof Int16Array ) || ( typedArray instanceof Int32Array ) ) {

		functionType = 'int';

	} else if ( ( typedArray instanceof Uint8Array ) || ( typedArray instanceof Uint8ClampedArray ) || ( typedArray instanceof Uint16Array ) || ( typedArray instanceof Uint32Array ) ) {

		functionType = 'uint';

	} else if ( typedArray instanceof Float32Array ) {

		functionType = 'float';

	}

	switch ( elementSize ) {

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

export function getFloatFunction( elementSize ) {

	switch ( elementSize ) {

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