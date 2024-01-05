import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { maxMipLevel } from './MaxMipLevelNode.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class SpecularMipLevelNode extends TempNode {

	constructor( textureNode, roughnessNode = null ) {

		super( 'float' );

		this.textureNode = textureNode;
		this.roughnessNode = roughnessNode;

	}

	setup() {

		const { textureNode, roughnessNode } = this;

		// taken from here: http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html

		const maxMipLevelScalar = maxMipLevel( textureNode );

		const sigma = roughnessNode.mul( roughnessNode ).mul( Math.PI ).div( roughnessNode.add( 1.0 ) );
		const desiredMipLevel = maxMipLevelScalar.add( sigma.log2() );

		return desiredMipLevel.clamp( 0.0, maxMipLevelScalar );

	}

}

export default SpecularMipLevelNode;

export const specularMipLevel = nodeProxy( SpecularMipLevelNode );

addNodeElement( 'specularMipLevel', specularMipLevel );

addNodeClass( 'SpecularMipLevelNode', SpecularMipLevelNode );
