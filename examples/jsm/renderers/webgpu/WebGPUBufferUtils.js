import { GPUChunkSize } from './constants.js';
import { MathUtils } from 'three';

function getFloatLength( floatLength ) {

	// ensure chunk size alignment (STD140 layout)

	return floatLength + MathUtils.euclideanModulo( - floatLength, GPUChunkSize );

}

function getVectorLength( count, vectorLength = 4 ) {

	const strideLength = getStrideLength( vectorLength );

	const floatLength = strideLength * count;

	return getFloatLength( floatLength );

}

function getStrideLength( vectorLength ) {

	const strideLength = 4;

	return vectorLength + MathUtils.euclideanModulo( - vectorLength, strideLength );

}

export {
	getFloatLength,
	getVectorLength,
	getStrideLength
};
