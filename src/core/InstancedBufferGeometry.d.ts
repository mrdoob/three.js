import { BufferGeometry } from './BufferGeometry';

/**
 * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/core/InstancedBufferGeometry.js">src/core/InstancedBufferGeometry.js</a>
 */
export class InstancedBufferGeometry extends BufferGeometry {

	constructor();

  groups: { start: number; count: number; instances: number }[];
  maxInstancedCount: number;

  addGroup( start: number, count: number, instances: number ): void;

}
