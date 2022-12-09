import Node from './Node.js';
import { NodeShaderStage } from './constants.js';

class VaryingNode extends Node {

	constructor( node, name = null ) {

		super();

		this.node = node;
		this.name = name;

	}

	isGlobal() {

		return true;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	getNodeType( builder ) {

		// VaryingNode is auto type

		return this.node.getNodeType( builder );

	}

	generate( builder ) {

		const { name, node } = this;
		const type = this.getNodeType( builder );

		const nodeVarying = builder.getVaryingFromNode( this, type );

		// this property can be used to check if the varying can be optimized for a var
		nodeVarying.needsInterpolation ||= builder.shaderStage === 'fragment';

		if ( name !== null ) {

			nodeVarying.name = name;

		}

		const propertyName = builder.getPropertyName( nodeVarying, NodeShaderStage.VERTEX );

		// force node run in vertex stage
		builder.flowNodeFromShaderStage( NodeShaderStage.VERTEX, node, type, propertyName );

		return builder.getPropertyName( nodeVarying );

	}

}

export default VaryingNode;
