import Node, { registerNode } from './Node.js';
import { NodeShaderStage } from './constants.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';

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

	analyze( builder ) {

		this.setupVarying( builder );

		return this.node.analyze( builder );

	}

	generate( builder ) {

		const properties = builder.getNodeProperties( this );
		const varying = this.setupVarying( builder );

		if ( properties.propertyName === undefined ) {

			const type = this.getNodeType( builder );
			const propertyName = builder.getPropertyName( varying, NodeShaderStage.VERTEX );

			// force node run in vertex stage
			builder.flowNodeFromShaderStage( NodeShaderStage.VERTEX, this.node, type, propertyName );

			properties.propertyName = propertyName;

		}

		return builder.getPropertyName( varying );

	}

}

export default VaryingNode;

VaryingNode.type = /*@__PURE__*/ registerNode( 'Varying', VaryingNode );

export const varying = /*@__PURE__*/ nodeProxy( VaryingNode );

addMethodChaining( 'varying', varying );
