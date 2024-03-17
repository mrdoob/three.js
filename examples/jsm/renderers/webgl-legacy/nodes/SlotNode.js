import { Node } from '../../../nodes/Nodes.js';

class SlotNode extends Node {

	constructor( params ) {

		super( params.nodeType );

		this.node = null;
		this.source = null;
		this.target = null;
		this.inclusionType = 'replace';

		Object.assign( this, params );

	}

	generate( builder ) {

		return this.node.build( builder, this.getNodeType( builder ) );

	}

}

export default SlotNode;
