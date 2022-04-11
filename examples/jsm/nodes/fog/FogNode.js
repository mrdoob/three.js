import Node from '../core/Node.js';
import MathNode from '../math/MathNode.js';

class FogNode extends Node {

	constructor( colorNode, factorNode ) {

		super( 'float' );

		this.colorNode = colorNode;
		this.factorNode = factorNode;

	}

	mix( outputNode ) {

		return new MathNode( MathNode.MIX, outputNode, this.colorNode, this );

	}

	generate( builder ) {

		return this.factorNode.build( builder, 'float' );

	}

}

FogNode.prototype.isFogNode = true;

export default FogNode;
