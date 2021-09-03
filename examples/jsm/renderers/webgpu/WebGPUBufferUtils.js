import { GPUChunkSize } from './constants.js';

function getFloatLength( floatLength ) {

	// ensure chunk size alignment (STD140 layout)

	return floatLength + ( ( GPUChunkSize - ( floatLength % GPUChunkSize ) ) % GPUChunkSize );

}

function getVectorLength( count, vectorLength ) {

	const strideLength = 4;

	vectorLength = vectorLength + ( ( strideLength - ( vectorLength % strideLength ) ) % strideLength );

	const floatLength = vectorLength * count;

	return getFloatLength( floatLength );

}

export {
	getFloatLength,
	getVectorLength
};
