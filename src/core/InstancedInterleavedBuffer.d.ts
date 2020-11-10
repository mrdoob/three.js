import { InterleavedBuffer } from './InterleavedBuffer';

/**
 * @see {@link https://github.com/mrdoob/three.js/blob/master/src/core/InstancedInterleavedBuffer.js|src/core/InstancedInterleavedBuffer.js}
 */
export class InstancedInterleavedBuffer extends InterleavedBuffer {

	constructor(
		array: ArrayLike<number>,
		stride: number,
		meshPerAttribute?: number
	);

	/**
	 * @default 1
	 */
	meshPerAttribute: number;

}
