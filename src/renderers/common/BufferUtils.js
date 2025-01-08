import { GPU_CHUNK_BYTES } from './Constants.js';

/** @module BufferUtils **/

/**
 * This function is usually called with the length in bytes of an array buffer.
 * It returns an padded value which ensure chunk size alignment according to STD140 layout.
 *
 * @function
 * @param {Number} floatLength - The buffer length.
 * @return {Number} The padded length.
 */
function getFloatLength( floatLength ) {

	// ensure chunk size alignment (STD140 layout)

	return floatLength + ( ( GPU_CHUNK_BYTES - ( floatLength % GPU_CHUNK_BYTES ) ) % GPU_CHUNK_BYTES );

}

/**
 * Given the count of vectors and their vector length, this function computes
 * a total length in bytes with buffer alignment according to STD140 layout.
 *
 * @function
 * @param {Number} count - The number of vectors.
 * @param {Number} [vectorLength=4] - The vector length.
 * @return {Number} The padded length.
 */
function getVectorLength( count, vectorLength = 4 ) {

	const strideLength = getStrideLength( vectorLength );

	const floatLength = strideLength * count;

	return getFloatLength( floatLength );

}

/**
 * This function is called with a vector length and ensure the computed length
 * matches a predefined stride (in this case `4`).
 *
 * @function
 * @param {Number} vectorLength - The vector length.
 * @return {Number} The padded length.
 */
function getStrideLength( vectorLength ) {

	const strideLength = 4;

	return vectorLength + ( ( strideLength - ( vectorLength % strideLength ) ) % strideLength );

}

export {
	getFloatLength,
	getVectorLength,
	getStrideLength
};
