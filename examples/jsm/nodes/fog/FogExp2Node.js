import FogNode from './FogNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class FogExp2Node extends FogNode {

	constructor( colorNode, densityNode ) {

		super( colorNode );

		this.isFogExp2Node = true;

		this.densityNode = densityNode;

	}

	setup( builder ) {

		const viewZ = this.getViewZNode( builder );
		const density = this.densityNode;

		return density.mul( density, viewZ, viewZ ).negate().exp().oneMinus();

	}

}

export default FogExp2Node;

export const densityFog = nodeProxy( FogExp2Node );

addNodeElement( 'densityFog', densityFog );

addNodeClass( 'FogExp2Node', FogExp2Node );
