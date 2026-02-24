import { Color } from '../../math/Color.js';
import { Matrix2 } from '../../math/Matrix2.js';
import { Matrix3 } from '../../math/Matrix3.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { Vector2 } from '../../math/Vector2.js';
import { Vector3 } from '../../math/Vector3.js';
import { Vector4 } from '../../math/Vector4.js';

import { error } from '../../utils.js';
import StackTrace from '../core/StackTrace.js';

// cyrb53 (c) 2018 bryc (github.com/bryc). License: Public domain. Attribution appreciated.
// A fast and simple 64-bit (or 53-bit) string hash function with decent collision resistance.
// Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
// See https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/52171480#52171480
// https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
function cyrb53( value, seed = 0 ) {

	let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;

	if ( value instanceof Array ) {

		for ( let i = 0, val; i < value.length; i ++ ) {

			val = value[ i ];
			h1 = Math.imul( h1 ^ val, 2654435761 );
			h2 = Math.imul( h2 ^ val, 1597334677 );

		}

	} else {

		for ( let i = 0, ch; i < value.length; i ++ ) {

			ch = value.charCodeAt( i );
			h1 = Math.imul( h1 ^ ch, 2654435761 );
			h2 = Math.imul( h2 ^ ch, 1597334677 );

		}

	}

	h1 = Math.imul( h1 ^ ( h1 >>> 16 ), 2246822507 );
	h1 ^= Math.imul( h2 ^ ( h2 >>> 13 ), 3266489909 );
	h2 = Math.imul( h2 ^ ( h2 >>> 16 ), 2246822507 );
	h2 ^= Math.imul( h1 ^ ( h1 >>> 13 ), 3266489909 );

	return 4294967296 * ( 2097151 & h2 ) + ( h1 >>> 0 );

}

/**
 * Computes a hash for the given string.
 *
 * @private
 * @method
 * @param {string} str - The string to be hashed.
 * @return {number} The hash.
 */
export const hashString = ( str ) => cyrb53( str );

/**
 * Computes a hash for the given array.
 *
 * @private
 * @method
 * @param {Array<number>} array - The array to be hashed.
 * @return {number} The hash.
 */
export const hashArray = ( array ) => cyrb53( array );

/**
 * Computes a hash for the given list of parameters.
 *
 * @private
 * @method
 * @param {...number} params - A list of parameters.
 * @return {number} The hash.
 */
export const hash = ( ...params ) => cyrb53( params );

const typeFromLength = /*@__PURE__*/ new Map( [
	[ 1, 'float' ],
	[ 2, 'vec2' ],
	[ 3, 'vec3' ],
	[ 4, 'vec4' ],
	[ 9, 'mat3' ],
	[ 16, 'mat4' ]
] );

const dataFromObject = /*@__PURE__*/ new WeakMap();

/**
 * Returns the data type for the given the length.
 *
 * @private
 * @method
 * @param {number} length - The length.
 * @return {string} The data type.
 */
export function getTypeFromLength( length ) {

	return typeFromLength.get( length );

}

/**
 * Returns the typed array for the given data type.
 *
 * @private
 * @method
 * @param {string} type - The data type.
 * @return {TypedArray} The typed array.
 */
export function getTypedArrayFromType( type ) {

	// Handle component type for vectors and matrices
	if ( /[iu]?vec\d/.test( type ) ) {

		// Handle int vectors
		if ( type.startsWith( 'ivec' ) ) return Int32Array;
		// Handle uint vectors
		if ( type.startsWith( 'uvec' ) ) return Uint32Array;
		// Default to float vectors
		return Float32Array;

	}

	// Handle matrices (always float)
	if ( /mat\d/.test( type ) ) return Float32Array;

	// Basic types
	if ( /float/.test( type ) ) return Float32Array;
	if ( /uint/.test( type ) ) return Uint32Array;
	if ( /int/.test( type ) ) return Int32Array;

	throw new Error( `THREE.NodeUtils: Unsupported type: ${type}` );

}

/**
 * Returns the length for the given data type.
 *
 * @private
 * @method
 * @param {string} type - The data type.
 * @return {number} The length.
 */
export function getLengthFromType( type ) {

	if ( /float|int|uint/.test( type ) ) return 1;
	if ( /vec2/.test( type ) ) return 2;
	if ( /vec3/.test( type ) ) return 3;
	if ( /vec4/.test( type ) ) return 4;
	if ( /mat2/.test( type ) ) return 4;
	if ( /mat3/.test( type ) ) return 9;
	if ( /mat4/.test( type ) ) return 16;

	error( `TSL: Unsupported type: ${ type }`, new StackTrace() );

}

/**
 * Returns the gpu memory length for the given data type.
 *
 * @private
 * @method
 * @param {string} type - The data type.
 * @return {number} The length.
 */
export function getMemoryLengthFromType( type ) {

	if ( /float|int|uint/.test( type ) ) return 1;
	if ( /vec2/.test( type ) ) return 2;
	if ( /vec3/.test( type ) ) return 3;
	if ( /vec4/.test( type ) ) return 4;
	if ( /mat2/.test( type ) ) return 4;
	if ( /mat3/.test( type ) ) return 12;
	if ( /mat4/.test( type ) ) return 16;

	error( `TSL: Unsupported type: ${ type }`, new StackTrace() );

}

/**
 * Returns the alignment requirement for the given data type.
 *
 * @private
 * @method
 * @param {string} type - The data type.
 * @return {number} The alignment requirement in bytes.
 */
export function getAlignmentFromType( type ) {

	if ( /float|int|uint/.test( type ) ) return 4;
	if ( /vec2/.test( type ) ) return 8;
	if ( /vec3/.test( type ) ) return 16;
	if ( /vec4/.test( type ) ) return 16;
	if ( /mat2/.test( type ) ) return 8;
	if ( /mat3/.test( type ) ) return 16;
	if ( /mat4/.test( type ) ) return 16;

	error( `TSL: Unsupported type: ${ type }`, new StackTrace() );

}

/**
 * Returns the data type for the given value.
 *
 * @private
 * @method
 * @param {any} value - The value.
 * @return {?string} The data type.
 */
export function getValueType( value ) {

	if ( value === undefined || value === null ) return null;

	const typeOf = typeof value;

	if ( value.isNode === true ) {

		return 'node';

	} else if ( typeOf === 'number' ) {

		return 'float';

	} else if ( typeOf === 'boolean' ) {

		return 'bool';

	} else if ( typeOf === 'string' ) {

		return 'string';

	} else if ( typeOf === 'function' ) {

		return 'shader';

	} else if ( value.isVector2 === true ) {

		return 'vec2';

	} else if ( value.isVector3 === true ) {

		return 'vec3';

	} else if ( value.isVector4 === true ) {

		return 'vec4';

	} else if ( value.isMatrix2 === true ) {

		return 'mat2';

	} else if ( value.isMatrix3 === true ) {

		return 'mat3';

	} else if ( value.isMatrix4 === true ) {

		return 'mat4';

	} else if ( value.isColor === true ) {

		return 'color';

	} else if ( value instanceof ArrayBuffer ) {

		return 'ArrayBuffer';

	}

	return null;

}

/**
 * Returns the value/object for the given data type and parameters.
 *
 * @private
 * @method
 * @param {string} type - The given type.
 * @param {...any} params - A parameter list.
 * @return {any} The value/object.
 */
export function getValueFromType( type, ...params ) {

	const last4 = type ? type.slice( - 4 ) : undefined;

	if ( params.length === 1 ) { // ensure same behaviour as in NodeBuilder.format()

		if ( last4 === 'vec2' ) params = [ params[ 0 ], params[ 0 ] ];
		else if ( last4 === 'vec3' ) params = [ params[ 0 ], params[ 0 ], params[ 0 ] ];
		else if ( last4 === 'vec4' ) params = [ params[ 0 ], params[ 0 ], params[ 0 ], params[ 0 ] ];

	}

	if ( type === 'color' ) {

		return new Color( ...params );

	} else if ( last4 === 'vec2' ) {

		return new Vector2( ...params );

	} else if ( last4 === 'vec3' ) {

		return new Vector3( ...params );

	} else if ( last4 === 'vec4' ) {

		return new Vector4( ...params );

	} else if ( last4 === 'mat2' ) {

		return new Matrix2( ...params );

	} else if ( last4 === 'mat3' ) {

		return new Matrix3( ...params );

	} else if ( last4 === 'mat4' ) {

		return new Matrix4( ...params );

	} else if ( type === 'bool' ) {

		return params[ 0 ] || false;

	} else if ( ( type === 'float' ) || ( type === 'int' ) || ( type === 'uint' ) ) {

		return params[ 0 ] || 0;

	} else if ( type === 'string' ) {

		return params[ 0 ] || '';

	} else if ( type === 'ArrayBuffer' ) {

		return base64ToArrayBuffer( params[ 0 ] );

	}

	return null;

}

/**
 * Gets the object data that can be shared between different rendering steps.
 *
 * @private
 * @param {Object} object - The object to get the data for.
 * @return {Object} The object data.
 */
export function getDataFromObject( object ) {

	let data = dataFromObject.get( object );

	if ( data === undefined ) {

		data = {};
		dataFromObject.set( object, data );

	}

	return data;

}

/**
 * Converts the given array buffer to a Base64 string.
 *
 * @private
 * @method
 * @param {ArrayBuffer} arrayBuffer - The array buffer.
 * @return {string} The Base64 string.
 */
export function arrayBufferToBase64( arrayBuffer ) {

	let chars = '';

	const array = new Uint8Array( arrayBuffer );

	for ( let i = 0; i < array.length; i ++ ) {

		chars += String.fromCharCode( array[ i ] );

	}

	return btoa( chars );

}

/**
 * Converts the given Base64 string to an array buffer.
 *
 * @private
 * @method
 * @param {string} base64 - The Base64 string.
 * @return {ArrayBuffer} The array buffer.
 */
export function base64ToArrayBuffer( base64 ) {

	return Uint8Array.from( atob( base64 ), c => c.charCodeAt( 0 ) ).buffer;

}
