import TempNode from '../core/Node.js';
import { mul, floor, reciprocal } from '../shadernode/ShaderNodeBaseElements.js';

class PosterizeNode extends TempNode {

	constructor( sourceNode, stepsNode ) {

		super();

		this.sourceNode = sourceNode;
		this.stepsNode = stepsNode;

	}

	construct() {

		const { sourceNode, stepsNode } = this;

		return mul( floor( mul( sourceNode, stepsNode ) ), reciprocal( stepsNode ) );

	}

}

export default PosterizeNode;
