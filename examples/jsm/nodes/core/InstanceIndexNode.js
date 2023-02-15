import Node, { addNodeClass } from './Node.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

class InstanceIndexNode extends Node {

	constructor() {

		super( 'uint' );

		this.isInstanceIndexNode = true;

	}

	generate( builder ) {

		return builder.getInstanceIndex();

	}

}

export default InstanceIndexNode;

export const instanceIndex = nodeImmutable( InstanceIndexNode );

addNodeClass( InstanceIndexNode );
