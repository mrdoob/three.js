import { BufferGeometry } from './BufferGeometry';

/**
 * @see {@link https://github.com/mrdoob/three.js/blob/master/src/core/InstancedBufferGeometry.js|src/core/InstancedBufferGeometry.js}
 */
export class InstancedBufferGeometry extends BufferGeometry {

	constructor();

	groups: { start: number; count: number; instances: number }[];
	instanceCount: number;

	addGroup( start: number, count: number, instances: number ): void;

}
