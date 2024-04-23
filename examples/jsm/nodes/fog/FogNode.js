import Node, { addNodeClass } from '../core/Node.js';
import { positionView } from '../accessors/PositionNode.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class FogNode extends Node {

	constructor( colorNode, factorNode ) {

		super( 'float' );

		this.isFogNode = true;

		this.colorNode = colorNode;
		this.factorNode = factorNode;

	}

	getViewZNode( builder ) {

		let viewZ;

		const getViewZ = builder.context.getViewZ;

		if ( getViewZ !== undefined ) {

			viewZ = getViewZ( this );

		}

		return ( viewZ || positionView.z ).negate();

	}

	setup() {

		return this.factorNode;

	}

}

export default FogNode;

export const fog = nodeProxy( FogNode );

addNodeElement( 'fog', fog );

addNodeClass( 'FogNode', FogNode );
