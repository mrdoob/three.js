import Node, { registerNode } from '../core/Node.js';
import { positionView } from '../accessors/Position.js';
import { nodeProxy } from '../tsl/TSLBase.js';

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

FogNode.type = /*@__PURE__*/ registerNode( 'Fog', FogNode );

export const fog = /*@__PURE__*/ nodeProxy( FogNode );
