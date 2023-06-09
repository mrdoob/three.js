import Node, { addNodeClass } from './Node.js';
import { varying } from '../core/VaryingNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

class InstanceIndexNode extends Node {

	constructor() {

		super( 'uint' );

		this.isInstanceIndexNode = true;

	}

	generate( builder ) {

		const nodeType = this.getNodeType( builder );

		const propertyName = builder.getInstanceIndex();

		let output = null;

		if ( builder.shaderStage === 'vertex' || builder.shaderStage === 'compute' ) {

			output = propertyName;

		} else {

			const nodeVarying = varying( this );

			output = nodeVarying.build( builder, nodeType );

		}

		return output;

	}

}

export default InstanceIndexNode;

export const instanceIndex = nodeImmutable( InstanceIndexNode );

addNodeClass( InstanceIndexNode );
