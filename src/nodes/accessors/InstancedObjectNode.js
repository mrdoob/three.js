import InstanceNode from './InstanceNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';

class InstancedObjectNode extends InstanceNode {

	static get type() {

		return 'InstancedObjectNode';

	}

	constructor( instanceMesh ) {

		const { count, instanceMatrix, instanceColor } = instanceMesh;

		super( count, instanceMatrix, instanceColor );

		this.instanceMesh = instanceMesh;

	}

}

export default InstancedObjectNode;

export const instancedObject = /*@__PURE__*/ nodeProxy( InstancedObjectNode );
