import {
	BufferAttribute,
	Matrix3,
	Matrix4,
	Vector3
} from 'three';

/** @module GeometryCompressionUtils */

// Octahedron and Quantization encodings based on work by: https://github.com/tsherif/mesh-quantization-example

/**
 * Compressed the given geometry's `normal` attribute by the selected encode method.
 *
 * @param {BufferGeometry} geometry - The geometry whose normals should be compressed.
 * @param {('DEFAULT'|'OCT1Byte'|'OCT2Byte'|'ANGLES')} encodeMethod - The compression method.
 */
function compressNormals( geometry, encodeMethod ) {

	const normal = geometry.attributes.normal;

	if ( ! normal ) {

		console.error( 'THREE.GeometryCompressionUtils.compressNormals(): Geometry must contain normal attribute.' );

	}

	if ( normal.isPacked ) return;

	if ( normal.itemSize != 3 ) {

		console.error( 'THREE.GeometryCompressionUtils.compressNormals(): normal.itemSize is not 3, which cannot be encoded.' );

	}

	const array = normal.array;
	const count = normal.count;

	let result;
	if ( encodeMethod == 'DEFAULT' ) {

		// TODO: Add 1 byte to the result, making the encoded length to be 4 bytes.
		result = new Uint8Array( count * 3 );

		for ( let idx = 0; idx < array.length; idx += 3 ) {

			const encoded = defaultEncode( array[ idx ], array[ idx + 1 ], array[ idx + 2 ], 1 );

			result[ idx + 0 ] = encoded[ 0 ];
			result[ idx + 1 ] = encoded[ 1 ];
			result[ idx + 2 ] = encoded[ 2 ];

		}

		geometry.setAttribute( 'normal', new BufferAttribute( result, 3, true ) );
		geometry.attributes.normal.bytes = result.length * 1;

	} else if ( encodeMethod == 'OCT1Byte' ) {


		// It is not recommended to use 1-byte octahedron normals encoding unless you want to extremely reduce the memory usage
		// As it makes vertex data not aligned to a 4 byte boundary which may harm some WebGL implementations and sometimes the normal distortion is visible
		// Please refer to @zeux 's comments in https://github.com/mrdoob/three.js/pull/18208

		result = new Int8Array( count * 2 );

		for ( let idx = 0; idx < array.length; idx += 3 ) {

			const encoded = octEncodeBest( array[ idx ], array[ idx + 1 ], array[ idx + 2 ], 1 );

			result[ idx / 3 * 2 + 0 ] = encoded[ 0 ];
			result[ idx / 3 * 2 + 1 ] = encoded[ 1 ];

		}

		geometry.setAttribute( 'normal', new BufferAttribute( result, 2, true ) );
		geometry.attributes.normal.bytes = result.length * 1;

	} else if ( encodeMethod == 'OCT2Byte' ) {

		result = new Int16Array( count * 2 );

		for ( let idx = 0; idx < array.length; idx += 3 ) {

			const encoded = octEncodeBest( array[ idx ], array[ idx + 1 ], array[ idx + 2 ], 2 );

			result[ idx / 3 * 2 + 0 ] = encoded[ 0 ];
			result[ idx / 3 * 2 + 1 ] = encoded[ 1 ];

		}

		geometry.setAttribute( 'normal', new BufferAttribute( result, 2, true ) );
		geometry.attributes.normal.bytes = result.length * 2;

	} else if ( encodeMethod == 'ANGLES' ) {

		result = new Uint16Array( count * 2 );

		for ( let idx = 0; idx < array.length; idx += 3 ) {

			const encoded = anglesEncode( array[ idx ], array[ idx + 1 ], array[ idx + 2 ] );

			result[ idx / 3 * 2 + 0 ] = encoded[ 0 ];
			result[ idx / 3 * 2 + 1 ] = encoded[ 1 ];

		}

		geometry.setAttribute( 'normal', new BufferAttribute( result, 2, true ) );
		geometry.attributes.normal.bytes = result.length * 2;

	} else {

		console.error( 'Unrecognized encoding method, should be `DEFAULT` or `ANGLES` or `OCT`. ' );

	}

	geometry.attributes.normal.needsUpdate = true;
	geometry.attributes.normal.isPacked = true;
	geometry.attributes.normal.packingMethod = encodeMethod;

}

/**
 * Compressed the given geometry's `position` attribute.
 *
 * @param {BufferGeometry} geometry - The geometry whose position values should be compressed.
 */
function compressPositions( geometry ) {

	const position = geometry.attributes.position;

	if ( ! position ) {

		console.error( 'THREE.GeometryCompressionUtils.compressPositions(): Geometry must contain position attribute.' );

	}

	if ( position.isPacked ) return;

	if ( position.itemSize != 3 ) {

		console.error( 'THREE.GeometryCompressionUtils.compressPositions(): position.itemSize is not 3, which cannot be packed.' );

	}

	const array = position.array;
	const encodingBytes = 2;

	const result = quantizedEncode( array, encodingBytes );

	const quantized = result.quantized;

	// IMPORTANT: calculate original geometry bounding info first, before updating packed positions
	if ( geometry.boundingBox == null ) geometry.computeBoundingBox();
	if ( geometry.boundingSphere == null ) geometry.computeBoundingSphere();

	geometry.setAttribute( 'position', new BufferAttribute( quantized, 3 ) );
	geometry.attributes.position.isPacked = true;
	geometry.attributes.position.needsUpdate = true;
	geometry.attributes.position.bytes = quantized.length * encodingBytes;

}

/**
 * Compressed the given geometry's `uv` attribute.
 *
 * @param {BufferGeometry} geometry - The geometry whose texture coordinates should be compressed.
 */
function compressUvs( geometry ) {

	const uvs = geometry.attributes.uv;

	if ( ! uvs ) {

		console.error( 'THREE.GeometryCompressionUtils.compressUvs(): Geometry must contain uv attribute.' );

	}

	if ( uvs.isPacked ) return;

	const range = { min: Infinity, max: - Infinity };

	const array = uvs.array;

	for ( let i = 0; i < array.length; i ++ ) {

		range.min = Math.min( range.min, array[ i ] );
		range.max = Math.max( range.max, array[ i ] );

	}

	let result;

	if ( range.min >= - 1.0 && range.max <= 1.0 ) {

		// use default encoding method
		result = new Uint16Array( array.length );

		for ( let i = 0; i < array.length; i += 2 ) {

			const encoded = defaultEncode( array[ i ], array[ i + 1 ], 0, 2 );

			result[ i ] = encoded[ 0 ];
			result[ i + 1 ] = encoded[ 1 ];

		}

		geometry.setAttribute( 'uv', new BufferAttribute( result, 2, true ) );
		geometry.attributes.uv.isPacked = true;
		geometry.attributes.uv.needsUpdate = true;
		geometry.attributes.uv.bytes = result.length * 2;

	} else {

		// use quantized encoding method
		result = quantizedEncodeUV( array, 2 );

		geometry.setAttribute( 'uv', new BufferAttribute( result.quantized, 2 ) );
		geometry.attributes.uv.isPacked = true;
		geometry.attributes.uv.needsUpdate = true;
		geometry.attributes.uv.bytes = result.quantized.length * 2;

	}

}


// Encoding functions

function defaultEncode( x, y, z, bytes ) {

	if ( bytes == 1 ) {

		const tmpx = Math.round( ( x + 1 ) * 0.5 * 255 );
		const tmpy = Math.round( ( y + 1 ) * 0.5 * 255 );
		const tmpz = Math.round( ( z + 1 ) * 0.5 * 255 );
		return new Uint8Array( [ tmpx, tmpy, tmpz ] );

	} else if ( bytes == 2 ) {

		const tmpx = Math.round( ( x + 1 ) * 0.5 * 65535 );
		const tmpy = Math.round( ( y + 1 ) * 0.5 * 65535 );
		const tmpz = Math.round( ( z + 1 ) * 0.5 * 65535 );
		return new Uint16Array( [ tmpx, tmpy, tmpz ] );

	} else {

		console.error( 'number of bytes must be 1 or 2' );

	}

}

// for `Angles` encoding
function anglesEncode( x, y, z ) {

	const normal0 = parseInt( 0.5 * ( 1.0 + Math.atan2( y, x ) / Math.PI ) * 65535 );
	const normal1 = parseInt( 0.5 * ( 1.0 + z ) * 65535 );
	return new Uint16Array( [ normal0, normal1 ] );

}

// for `Octahedron` encoding
function octEncodeBest( x, y, z, bytes ) {

	let oct, dec, best, currentCos, bestCos;

	// Test various combinations of ceil and floor
	// to minimize rounding errors
	best = oct = octEncodeVec3( x, y, z, 'floor', 'floor' );
	dec = octDecodeVec2( oct );
	bestCos = dot( x, y, z, dec );

	oct = octEncodeVec3( x, y, z, 'ceil', 'floor' );
	dec = octDecodeVec2( oct );
	currentCos = dot( x, y, z, dec );

	if ( currentCos > bestCos ) {

		best = oct;
		bestCos = currentCos;

	}

	oct = octEncodeVec3( x, y, z, 'floor', 'ceil' );
	dec = octDecodeVec2( oct );
	currentCos = dot( x, y, z, dec );

	if ( currentCos > bestCos ) {

		best = oct;
		bestCos = currentCos;

	}

	oct = octEncodeVec3( x, y, z, 'ceil', 'ceil' );
	dec = octDecodeVec2( oct );
	currentCos = dot( x, y, z, dec );

	if ( currentCos > bestCos ) {

		best = oct;

	}

	return best;

	function octEncodeVec3( x0, y0, z0, xfunc, yfunc ) {

		let x = x0 / ( Math.abs( x0 ) + Math.abs( y0 ) + Math.abs( z0 ) );
		let y = y0 / ( Math.abs( x0 ) + Math.abs( y0 ) + Math.abs( z0 ) );

		if ( z < 0 ) {

			const tempx = ( 1 - Math.abs( y ) ) * ( x >= 0 ? 1 : - 1 );
			const tempy = ( 1 - Math.abs( x ) ) * ( y >= 0 ? 1 : - 1 );

			x = tempx;
			y = tempy;

			let diff = 1 - Math.abs( x ) - Math.abs( y );
			if ( diff > 0 ) {

				diff += 0.001;
				x += x > 0 ? diff / 2 : - diff / 2;
				y += y > 0 ? diff / 2 : - diff / 2;

			}

		}

		if ( bytes == 1 ) {

			return new Int8Array( [
				Math[ xfunc ]( x * 127.5 + ( x < 0 ? 1 : 0 ) ),
				Math[ yfunc ]( y * 127.5 + ( y < 0 ? 1 : 0 ) )
			] );

		}

		if ( bytes == 2 ) {

			return new Int16Array( [
				Math[ xfunc ]( x * 32767.5 + ( x < 0 ? 1 : 0 ) ),
				Math[ yfunc ]( y * 32767.5 + ( y < 0 ? 1 : 0 ) )
			] );

		}


	}

	function octDecodeVec2( oct ) {

		let x = oct[ 0 ];
		let y = oct[ 1 ];

		if ( bytes == 1 ) {

			x /= x < 0 ? 127 : 128;
			y /= y < 0 ? 127 : 128;

		} else if ( bytes == 2 ) {

			x /= x < 0 ? 32767 : 32768;
			y /= y < 0 ? 32767 : 32768;

		}


		const z = 1 - Math.abs( x ) - Math.abs( y );

		if ( z < 0 ) {

			const tmpx = x;
			x = ( 1 - Math.abs( y ) ) * ( x >= 0 ? 1 : - 1 );
			y = ( 1 - Math.abs( tmpx ) ) * ( y >= 0 ? 1 : - 1 );

		}

		const length = Math.sqrt( x * x + y * y + z * z );

		return [
			x / length,
			y / length,
			z / length
		];

	}

	function dot( x, y, z, vec3 ) {

		return x * vec3[ 0 ] + y * vec3[ 1 ] + z * vec3[ 2 ];

	}

}

function quantizedEncode( array, bytes ) {

	let quantized, segments;

	if ( bytes == 1 ) {

		quantized = new Uint8Array( array.length );
		segments = 255;

	} else if ( bytes == 2 ) {

		quantized = new Uint16Array( array.length );
		segments = 65535;

	} else {

		console.error( 'number of bytes error! ' );

	}

	const decodeMat = new Matrix4();

	const min = new Float32Array( 3 );
	const max = new Float32Array( 3 );

	min[ 0 ] = min[ 1 ] = min[ 2 ] = Number.MAX_VALUE;
	max[ 0 ] = max[ 1 ] = max[ 2 ] = - Number.MAX_VALUE;

	for ( let i = 0; i < array.length; i += 3 ) {

		min[ 0 ] = Math.min( min[ 0 ], array[ i + 0 ] );
		min[ 1 ] = Math.min( min[ 1 ], array[ i + 1 ] );
		min[ 2 ] = Math.min( min[ 2 ], array[ i + 2 ] );
		max[ 0 ] = Math.max( max[ 0 ], array[ i + 0 ] );
		max[ 1 ] = Math.max( max[ 1 ], array[ i + 1 ] );
		max[ 2 ] = Math.max( max[ 2 ], array[ i + 2 ] );

	}

	decodeMat.scale( new Vector3(
		( max[ 0 ] - min[ 0 ] ) / segments,
		( max[ 1 ] - min[ 1 ] ) / segments,
		( max[ 2 ] - min[ 2 ] ) / segments
	) );

	decodeMat.elements[ 12 ] = min[ 0 ];
	decodeMat.elements[ 13 ] = min[ 1 ];
	decodeMat.elements[ 14 ] = min[ 2 ];

	decodeMat.transpose();


	const multiplier = new Float32Array( [
		max[ 0 ] !== min[ 0 ] ? segments / ( max[ 0 ] - min[ 0 ] ) : 0,
		max[ 1 ] !== min[ 1 ] ? segments / ( max[ 1 ] - min[ 1 ] ) : 0,
		max[ 2 ] !== min[ 2 ] ? segments / ( max[ 2 ] - min[ 2 ] ) : 0
	] );

	for ( let i = 0; i < array.length; i += 3 ) {

		quantized[ i + 0 ] = Math.floor( ( array[ i + 0 ] - min[ 0 ] ) * multiplier[ 0 ] );
		quantized[ i + 1 ] = Math.floor( ( array[ i + 1 ] - min[ 1 ] ) * multiplier[ 1 ] );
		quantized[ i + 2 ] = Math.floor( ( array[ i + 2 ] - min[ 2 ] ) * multiplier[ 2 ] );

	}

	return {
		quantized: quantized,
		decodeMat: decodeMat
	};

}

function quantizedEncodeUV( array, bytes ) {

	let quantized, segments;

	if ( bytes == 1 ) {

		quantized = new Uint8Array( array.length );
		segments = 255;

	} else if ( bytes == 2 ) {

		quantized = new Uint16Array( array.length );
		segments = 65535;

	} else {

		console.error( 'number of bytes error! ' );

	}

	const decodeMat = new Matrix3();

	const min = new Float32Array( 2 );
	const max = new Float32Array( 2 );

	min[ 0 ] = min[ 1 ] = Number.MAX_VALUE;
	max[ 0 ] = max[ 1 ] = - Number.MAX_VALUE;

	for ( let i = 0; i < array.length; i += 2 ) {

		min[ 0 ] = Math.min( min[ 0 ], array[ i + 0 ] );
		min[ 1 ] = Math.min( min[ 1 ], array[ i + 1 ] );
		max[ 0 ] = Math.max( max[ 0 ], array[ i + 0 ] );
		max[ 1 ] = Math.max( max[ 1 ], array[ i + 1 ] );

	}

	decodeMat.scale(
		( max[ 0 ] - min[ 0 ] ) / segments,
		( max[ 1 ] - min[ 1 ] ) / segments
	);

	decodeMat.elements[ 6 ] = min[ 0 ];
	decodeMat.elements[ 7 ] = min[ 1 ];

	decodeMat.transpose();

	const multiplier = new Float32Array( [
		max[ 0 ] !== min[ 0 ] ? segments / ( max[ 0 ] - min[ 0 ] ) : 0,
		max[ 1 ] !== min[ 1 ] ? segments / ( max[ 1 ] - min[ 1 ] ) : 0
	] );

	for ( let i = 0; i < array.length; i += 2 ) {

		quantized[ i + 0 ] = Math.floor( ( array[ i + 0 ] - min[ 0 ] ) * multiplier[ 0 ] );
		quantized[ i + 1 ] = Math.floor( ( array[ i + 1 ] - min[ 1 ] ) * multiplier[ 1 ] );

	}

	return {
		quantized: quantized,
		decodeMat: decodeMat
	};

}



export {
	compressNormals,
	compressPositions,
	compressUvs,
};
