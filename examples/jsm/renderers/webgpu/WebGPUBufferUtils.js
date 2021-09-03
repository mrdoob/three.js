import { GPUChunkSize } from './constants.js';

function getFloatLength( floatLength ) {

    // ensure chunk size alignment (STD140 layout)

    return floatLength + ( ( GPUChunkSize - ( floatLength % GPUChunkSize ) ) % GPUChunkSize );

}

export {
    getFloatLength
};
