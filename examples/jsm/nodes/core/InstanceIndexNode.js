import Node from './Node.js';

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
