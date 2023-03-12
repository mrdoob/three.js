import { GPUChunkSize } from './constants.js';

function getFloatLength( floatLength ) {

	// ensure chunk size alignment (STD140 layout)

	return floatLength + ( - floatLength ) % GPUChunkSize;

}

function getVectorLength( count, vectorLength = 4 ) {

	const strideLength = getStrideLength( vectorLength );

	const floatLength = strideLength * count;

	return getFloatLength( floatLength );

}

function getStrideLength( vectorLength ) {

	const strideLength = 4;

	return vectorLength + ( - vectorLength ) % strideLength;

}

export {
	getFloatLength,
	getVectorLength,
	getStrideLength
};
