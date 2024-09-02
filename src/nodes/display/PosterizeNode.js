import TempNode from '../core/TempNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';

class PosterizeNode extends TempNode {

	static get type() {

		return 'PosterizeNode';

	}

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

export const posterize = /*@__PURE__*/ nodeProxy( PosterizeNode );
