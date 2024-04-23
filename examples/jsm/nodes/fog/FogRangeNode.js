import FogNode from './FogNode.js';
import { smoothstep } from '../math/MathNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class FogRangeNode extends FogNode {

	constructor( colorNode, nearNode, farNode ) {

		super( colorNode );

		this.isFogRangeNode = true;

		this.nearNode = nearNode;
		this.farNode = farNode;

	}

	setup( builder ) {

		const viewZ = this.getViewZNode( builder );

		return smoothstep( this.nearNode, this.farNode, viewZ );

	}

}

export default FogRangeNode;

export const rangeFog = nodeProxy( FogRangeNode );

addNodeElement( 'rangeFog', rangeFog );

addNodeClass( 'FogRangeNode', FogRangeNode );
