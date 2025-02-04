import InstanceNode from './InstanceNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';

/**
 * This is a special version of `InstanceNode` which requires the usage of {@link InstancedMesh}.
 * It allows an easier setup of the instance node.
 *
 * @augments InstanceNode
 */
class InstancedMeshNode extends InstanceNode {

	static get type() {

		return 'InstancedMeshNode';

	}

	/**
	 * Constructs a new instanced mesh node.
	 *
	 * @param {InstancedMesh} instancedMesh - The instanced mesh.
	 */
	constructor( instancedMesh ) {

		const { count, instanceMatrix, instanceColor } = instancedMesh;

		super( count, instanceMatrix, instanceColor );

		/**
		 * A reference to the instanced mesh.
		 *
		 * @type {InstancedMesh}
		 */
		this.instancedMesh = instancedMesh;

	}

}

export default InstancedMeshNode;

/**
 * TSL function for creating an instanced mesh node.
 *
 * @tsl
 * @function
 * @param {InstancedMesh} instancedMesh - The instancedMesh.
 * @returns {InstancedMeshNode}
 */
export const instancedMesh = /*@__PURE__*/ nodeProxy( InstancedMeshNode );
