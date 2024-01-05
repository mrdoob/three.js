import Node, { addNodeClass } from './Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class VaryingNode extends Node {

	constructor( node, name = null ) {

		super();

		this.node = node;
		this.name = name;

		this.isVaryingNode = true;

		this.needsInterpolation = false;

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

	setup( builder ) {

		const shaderStage = builder.getShaderStage();

		// force node run in vertex stage

		builder.setShaderStage( 'vertex' );
		super.setup( builder );
		this.node.build( builder );
		builder.setShaderStage( shaderStage );

	}

	analyze( builder ) {

		const shaderStage = builder.getShaderStage();

		if ( shaderStage === 'vertex' ) return super.analyze( builder );

		// this property can be used to check if the varying can be optimized for a var
		this.needsInterpolation = true;

		// do a run in the current stage that doesn't act on children

		const original = builder.getNodeProperties( this );
		const properties = { ...original };

		for ( const prop in properties ) delete original[ prop ];
		super.analyze( builder );
		for ( const prop in properties ) original[ prop ] = properties[ prop ];

		// force node run in vertex stage

		builder.setShaderStage( 'vertex' );
		super.analyze( builder );
		builder.setShaderStage( shaderStage );

	}

	generate( builder ) {

		const generated = builder.getNodeData( this, 'any' ).varying !== undefined;

		const nodeVarying = builder.getVaryingFromNode( this, this.name, this.needsInterpolation );

		if ( generated === false ) {

			// force node run in vertex stage

			const shaderStage = builder.getShaderStage();
			builder.setShaderStage( 'vertex' );

			const propertyName = builder.getPropertyName( nodeVarying );
			const snippet = this.node.build( builder );
			builder.addLineFlowCode( builder.formatOperation( '=', propertyName, snippet ) );

			builder.setShaderStage( shaderStage );

		}

		return builder.getPropertyName( nodeVarying );

	}

	build( builder, output ) {

		if ( builder.getBuildStage() === 'setup' ) {

			const properties = builder.getNodeProperties( this, builder.getShaderStage() );
			const cacheKey = this.getCacheKey();

			if ( properties.cacheKey !== cacheKey ) {

				properties.cacheKey = cacheKey;

				this.setup( builder );

			}

			return;

		}

		return super.build( builder, output );

	}

}

export default VaryingNode;

export const varying = nodeProxy( VaryingNode );

addNodeElement( 'varying', varying );

addNodeClass( 'VaryingNode', VaryingNode );
