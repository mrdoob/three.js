import Node, { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

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

addNodeElement( 'fog', fog );

addNodeClass( FogNode );
