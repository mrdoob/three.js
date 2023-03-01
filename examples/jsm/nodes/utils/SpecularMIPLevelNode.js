import Node from '../core/Node.js';
import { add, mul, div, log2, clamp, maxMipLevel } from '../shadernode/ShaderNodeBaseElements.js';

class SpecularMIPLevelNode extends Node {

	constructor( textureNode, roughnessNode = null ) {

		super( 'float' );

		this.textureNode = textureNode;
		this.roughnessNode = roughnessNode;

	}

	construct() {

		const { textureNode, roughnessNode } = this;

		// taken from here: http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html

		const maxMIPLevelScalar = maxMipLevel( textureNode );

		const sigma = div( mul( Math.PI, mul( roughnessNode, roughnessNode ) ), add( 1.0, roughnessNode ) );
		const desiredMIPLevel = add( maxMIPLevelScalar, log2( sigma ) );

		return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );

	}

}

export default SpecularMIPLevelNode;
