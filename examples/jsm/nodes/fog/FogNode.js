import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { mix } from '../math/MathNode.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class FogNode extends TempNode {

	constructor( colorNode, factorNode ) {

		super( 'float' );

		this.isFogNode = true;

		this.colorNode = colorNode;
		this.factorNode = factorNode;

	}

	mix( outputNode ) {

		return mix( outputNode, this.colorNode, this );

	}

	setup( builder ) {

		super.setup( builder );
		return this.factorNode;

	}

}

export default FogNode;

export const fog = nodeProxy( FogNode );

addNodeElement( 'fog', fog );

addNodeClass( 'FogNode', FogNode );
