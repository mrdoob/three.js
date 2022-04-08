import Node from './Node.js';

class InstanceIndexNode extends Node {

	constructor() {

		super( 'uint' );

	}

	generate( builder ) {

		return builder.getInstanceIndex();

	}

}

InstanceIndexNode.prototype.isInstanceIndexNode = true;

export default InstanceIndexNode;
