import TempNode from '../core/Node.js';
import { mul, div, floor, reciprocal } from '../shadernode/ShaderNodeBaseElements.js';

class PosterizeNode extends TempNode {

	constructor( sourceNode, stepsNode ) {

		super();

		this.sourceNode = sourceNode;
		this.stepsNode = stepsNode;

	}

	construct() {

		const { sourceNode, stepsNode } = this;

		const reciprocalSteps = reciprocal( stepsNode );

		return mul( floor( div( sourceNode, reciprocalSteps ) ), reciprocalSteps );

	}

}

export default PosterizeNode;
