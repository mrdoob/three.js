import Node, { addNodeClass } from './Node.js';
import { NodeShaderStage } from './constants.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class VaryingNode extends Node {

	constructor( node, name = null ) {

		super();

		this.node = node;
		this.name = name;

		this.isVaryingNode = true;

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

	setupVarying( builder ) {

		const properties = builder.getNodeProperties( this );

		let varying = properties.varying;

		if ( varying === undefined ) {

			const name = this.name;
			const type = this.getNodeType( builder );

			properties.varying = varying = builder.getVaryingFromNode( this, name, type );
			properties.node = this.node;

		}

		// this property can be used to check if the varying can be optimized for a variable
		varying.needsInterpolation || ( varying.needsInterpolation = ( builder.shaderStage === 'fragment' ) );

		return varying;

	}

	setup( builder ) {

		this.setupVarying( builder );

	}

	generate( builder ) {

		const type = this.getNodeType( builder );
		const varying = this.setupVarying( builder );

		const propertyName = builder.getPropertyName( varying, NodeShaderStage.VERTEX );

		// force node run in vertex stage
		builder.flowNodeFromShaderStage( NodeShaderStage.VERTEX, this.node, type, propertyName );

		return builder.getPropertyName( varying );

	}

}

export default VaryingNode;

export const varying = nodeProxy( VaryingNode );

addNodeElement( 'varying', varying );

addNodeClass( 'VaryingNode', VaryingNode );
