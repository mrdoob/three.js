import { DataUtils } from 'three';

// Shared base64/half-float/uint8 codec used by the `.ntc` binary manifest
// format (see NTCManifest.js). Keeps the "flat float array <-> compact
// base64 blob" plumbing in one place so encode and decode always agree on
// byte layout.

const CHUNK_SIZE = 8192;

/**
 * Base64-encodes raw bytes, chunked through `String.fromCharCode.apply` to
 * avoid blowing the call stack on large arrays (spreading a 10MB+ typed
 * array as individual arguments in one call throws "Maximum call stack size
 * exceeded" in every JS engine).
 */
function base64FromBytes( bytes ) {

	if ( typeof Buffer !== 'undefined' ) {

		return Buffer.from( bytes.buffer, bytes.byteOffset, bytes.byteLength ).toString( 'base64' );

	}

	let binary = '';

	for ( let i = 0; i < bytes.length; i += CHUNK_SIZE ) {

		const chunk = bytes.subarray( i, i + CHUNK_SIZE );
		binary += String.fromCharCode.apply( null, chunk );

	}

	return btoa( binary );

}

/**
 * Decodes a base64 string back to raw bytes - the inverse of
 * `base64FromBytes`.
 */
function bytesFromBase64( str ) {

	if ( typeof Buffer !== 'undefined' ) {

		const buffer = Buffer.from( str, 'base64' );
		return new Uint8Array( buffer.buffer, buffer.byteOffset, buffer.byteLength ).slice();

	}

	const binary = atob( str );
	const bytes = new Uint8Array( binary.length );

	for ( let i = 0; i < binary.length; i ++ ) {

		bytes[ i ] = binary.charCodeAt( i );

	}

	return bytes;

}

/**
 * Packs a Float32Array into a base64 string of little-endian Float16 bytes
 * (2 bytes/value) - used for MLP weight/bias blobs.
 */
function encodeFloat16Base64( data ) {

	const bytes = new Uint8Array( data.length * 2 );
	const view = new DataView( bytes.buffer );

	for ( let i = 0; i < data.length; i ++ ) {

		view.setUint16( i * 2, DataUtils.toHalfFloat( data[ i ] ), true );

	}

	return base64FromBytes( bytes );

}

/**
 * Decodes a base64 Float16 blob (as produced by `encodeFloat16Base64`) back
 * into a Float32Array of `length` values.
 */
function decodeFloat16Base64( str, length ) {

	const bytes = bytesFromBase64( str );
	const view = new DataView( bytes.buffer, bytes.byteOffset, bytes.byteLength );
	const out = new Float32Array( length );

	for ( let i = 0; i < length; i ++ ) {

		out[ i ] = DataUtils.fromHalfFloat( view.getUint16( i * 2, true ) );

	}

	return out;

}

/**
 * Quantizes a Float32Array to a base64 string of Uint8 bytes: per-element
 * `clamp((x - min) / (max - min), 0, 1)`, rounded to the nearest of 256
 * discrete levels - used for latent-grid blobs. `min === max` (a constant
 * grid) is handled by treating every value as level 0, rather than dividing
 * by zero.
 */
function encodeUint8Base64( data, min, max ) {

	const bytes = new Uint8Array( data.length );
	const range = max - min;

	for ( let i = 0; i < data.length; i ++ ) {

		const t = range !== 0 ? Math.min( 1, Math.max( 0, ( data[ i ] - min ) / range ) ) : 0;
		bytes[ i ] = Math.round( t * 255 );

	}

	return base64FromBytes( bytes );

}

/**
 * Decodes a base64 Uint8 blob (as produced by `encodeUint8Base64`) back into
 * a Float32Array of `length` values, using the same `min`/`max` range.
 */
function decodeUint8Base64( str, min, max, length ) {

	const bytes = bytesFromBase64( str );
	const out = new Float32Array( length );
	const range = max - min;

	for ( let i = 0; i < length; i ++ ) {

		out[ i ] = min + ( bytes[ i ] / 255 ) * range;

	}

	return out;

}

/**
 * Flattens an array of MLP layers (`{ inputSize, outputSize, activation,
 * weights, biases }`) into a single `{ dtype: 'float16', layout,
 * dataBase64 }` block: one `dataBase64` blob holding every layer's weights
 * immediately followed by its biases, in layer order, and a `layout` array
 * describing how to slice that flat blob back apart - one `{ rows, cols,
 * kind: 'weight' }` entry immediately followed by one `{ rows: 1, cols,
 * kind: 'bias' }` entry, per layer. `activation` is carried on the weight
 * entry for convenience on the decode side.
 */
function encodeMLPLayersBase64( layers ) {

	const layout = [];
	let totalLength = 0;

	for ( const layer of layers ) {

		totalLength += layer.inputSize * layer.outputSize + layer.outputSize;

	}

	const flat = new Float32Array( totalLength );
	let cursor = 0;

	for ( const layer of layers ) {

		layout.push( { rows: layer.inputSize, cols: layer.outputSize, kind: 'weight', activation: layer.activation || 'linear' } );

		for ( let i = 0; i < layer.weights.length; i ++ ) flat[ cursor ++ ] = layer.weights[ i ];

		layout.push( { rows: 1, cols: layer.outputSize, kind: 'bias' } );

		for ( let i = 0; i < layer.biases.length; i ++ ) flat[ cursor ++ ] = layer.biases[ i ];

	}

	return { dtype: 'float16', layout, dataBase64: encodeFloat16Base64( flat ) };

}

/**
 * Inverse of `encodeMLPLayersBase64` - reconstructs an array of MLP layers
 * (`{ inputSize, outputSize, activation, weights, biases }`, `weights`/
 * `biases` as `Float32Array`s) from a `{ dtype, layout, dataBase64 }` block.
 */
function decodeMLPLayersBase64( mlp ) {

	let totalLength = 0;
	for ( const entry of mlp.layout ) totalLength += entry.rows * entry.cols;

	const flat = decodeFloat16Base64( mlp.dataBase64, totalLength );
	const layers = [];
	let cursor = 0;

	for ( let i = 0; i < mlp.layout.length; i += 2 ) {

		const weightEntry = mlp.layout[ i ];
		const biasEntry = mlp.layout[ i + 1 ];
		const inputSize = weightEntry.rows;
		const outputSize = weightEntry.cols;
		const weightsCount = inputSize * outputSize;

		const weights = flat.slice( cursor, cursor + weightsCount ); cursor += weightsCount;
		const biases = flat.slice( cursor, cursor + biasEntry.cols ); cursor += biasEntry.cols;

		layers.push( { inputSize, outputSize, activation: weightEntry.activation || 'linear', weights, biases } );

	}

	return layers;

}

export {
	base64FromBytes,
	bytesFromBase64,
	encodeFloat16Base64,
	decodeFloat16Base64,
	encodeUint8Base64,
	decodeUint8Base64,
	encodeMLPLayersBase64,
	decodeMLPLayersBase64
};
