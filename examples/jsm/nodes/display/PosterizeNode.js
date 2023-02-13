import TempNode from '../core/Node.js';
import { addNode, nodeProxy } from '../shadernode/ShaderNode.js';

class PosterizeNode extends TempNode {

	constructor( sourceNode, stepsNode ) {

		super();

		this.sourceNode = sourceNode;
		this.stepsNode = stepsNode;

	}

	construct() {

		const { sourceNode, stepsNode } = this;

		return sourceNode.mul( stepsNode ).floor().div( stepsNode );

	}

}

export default PosterizeNode;

export const posterize = nodeProxy( PosterizeNode );

addNode( 'posterize', posterize );
