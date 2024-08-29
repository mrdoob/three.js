import { registerNode } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';

class PosterizeNode extends TempNode {

	constructor( sourceNode, stepsNode ) {

		super();

		this.sourceNode = sourceNode;
		this.stepsNode = stepsNode;

	}

	setup() {

		const { sourceNode, stepsNode } = this;

		return sourceNode.mul( stepsNode ).floor().div( stepsNode );

	}

}

export default PosterizeNode;

PosterizeNode.type = /*@__PURE__*/ registerNode( 'Posterize', PosterizeNode );

export const posterize = /*@__PURE__*/ nodeProxy( PosterizeNode );
