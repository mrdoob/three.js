import { GPUChunkSize } from './constants.js';

class WebGPUBufferUtils {

	static getFloatLength( floatLength ) {

		// ensure chunk size alignment (STD140 layout)

		return floatLength + ( ( GPUChunkSize - ( floatLength % GPUChunkSize ) ) % GPUChunkSize );

	}

}

export default WebGPUBufferUtils;
