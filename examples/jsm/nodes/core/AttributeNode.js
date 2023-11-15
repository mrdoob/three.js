import Node, { addNodeClass } from './Node.js';
import { varying } from './VaryingNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';

class AttributeNode extends Node {

	constructor( attributeName, nodeType = null ) {

		super( nodeType );

		this._attributeName = attributeName;

	}

	getHash( builder ) {

		return this.getAttributeName( builder );

	}

	getNodeType( builder ) {

		let nodeType = super.getNodeType( builder );

		if ( nodeType === null ) {

			const attributeName = this.getAttributeName( builder );

			if ( builder.hasGeometryAttribute( attributeName ) ) {

				const attribute = builder.geometry.getAttribute( attributeName );

				nodeType = builder.getTypeFromAttribute( attribute );

			} else {

				nodeType = 'float';

			}

		}

		return nodeType;

	}

	setAttributeName( attributeName ) {

		this._attributeName = attributeName;

		return this;

	}

	getAttributeName( /*builder*/ ) {

		return this._attributeName;

	}

	generate( builder ) {

		const attributeName = this.getAttributeName( builder );
		const nodeType = this.getNodeType( builder );
		const geometryAttribute = builder.hasGeometryAttribute( attributeName );

		if ( geometryAttribute === true ) {

			const attribute = builder.geometry.getAttribute( attributeName );
			const attributeType = builder.getTypeFromAttribute( attribute );

			const nodeAttribute = builder.getAttribute( attributeName, attributeType );

			if ( builder.shaderStage === 'vertex' ) {

				return builder.format( nodeAttribute.name, attributeType, nodeType );

			} else {

				const nodeVarying = varying( this );

				return nodeVarying.build( builder, nodeType );

			}

		} else {

			console.warn( `AttributeNode: Attribute "${ attributeName }" not found.` );

			return builder.generateConst( nodeType );

		}

	}

}

export default AttributeNode;

export const attribute = ( name, nodeType ) => nodeObject( new AttributeNode( name, nodeType ) );

addNodeClass( 'AttributeNode', AttributeNode );
