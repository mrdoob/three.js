import InstanceNode from './InstanceNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';

class InstancedMeshNode extends InstanceNode {

	static get type() {

		return 'InstancedMeshNode';

	}

	constructor( instanceMesh ) {

		const { count, instanceMatrix, instanceColor } = instanceMesh;

		super( count, instanceMatrix, instanceColor );

		this.instanceMesh = instanceMesh;

	}

}

export default InstancedMeshNode;

export const instancedMesh = /*@__PURE__*/ nodeProxy( InstancedMeshNode );
