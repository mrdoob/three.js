import { InterleavedBuffer } from './InterleavedBuffer';

/**
 * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/core/InstancedInterleavedBuffer.js">src/core/InstancedInterleavedBuffer.js</a>
 */
export class InstancedInterleavedBuffer extends InterleavedBuffer {

	constructor(
		array: ArrayLike<number>,
		stride: number,
		meshPerAttribute?: number
	);

	meshPerAttribute: number;

}
