import Node, { addNodeClass } from '../core/Node.js';
import { maxMipLevel } from './MaxMipLevelNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';

class SpecularMIPLevelNode extends Node {

	constructor( textureNode, roughnessNode = null ) {

		super( 'float' );

		this.textureNode = textureNode;
		this.roughnessNode = roughnessNode;

	}

	setup() {

		const { textureNode, roughnessNode } = this;

		// taken from here: http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html

		const maxMIPLevelScalar = maxMipLevel( textureNode );

		const sigma = roughnessNode.mul( roughnessNode ).mul( Math.PI ).div( roughnessNode.add( 1.0 ) );
		const desiredMIPLevel = maxMIPLevelScalar.add( sigma.log2() );

		return desiredMIPLevel.clamp( 0.0, maxMIPLevelScalar );

	}

}

export default SpecularMIPLevelNode;

export const specularMIPLevel = nodeProxy( SpecularMIPLevelNode );

addNodeClass( 'SpecularMIPLevelNode', SpecularMIPLevelNode );
