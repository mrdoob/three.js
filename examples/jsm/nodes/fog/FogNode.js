import Node from '../core/Node.js';
import { addNode, nodeProxy } from '../shadernode/ShaderNode.js';

class FogNode extends Node {

	constructor( colorNode, factorNode ) {

		super( 'float' );

		this.isFogNode = true;

		this.colorNode = colorNode;
		this.factorNode = factorNode;

	}

	mix( outputNode ) {

		return outputNode.mix( this.colorNode, this );

	}

	generate( builder ) {

		return this.factorNode.build( builder, 'float' );

	}

}

export default FogNode;

export const fog = nodeProxy( FogNode );

addNode( 'fog', fog );
