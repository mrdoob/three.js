import Node from '../core/Node.js';

class FogNode extends Node {

	constructor( colorNode, factorNode ) {

		super( 'float' );

		this.colorNode = colorNode;
		this.factorNode = factorNode;

	}

	generate( builder ) {

		return this.factorNode.build( builder, 'float' );

	}

}

FogNode.prototype.isFogNode = true;

export default FogNode;
