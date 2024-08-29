import Node, { registerNode } from './Node.js';
import { nodeObject, varying } from '../tsl/TSLBase.js';

class AttributeNode extends Node {

	constructor( attributeName, nodeType = null ) {

		super( nodeType );

		this.global = true;

		this._attributeName = attributeName;

	}

	getHash( builder ) {

		return this.getAttributeName( builder );

	}

	getNodeType( builder ) {

		let nodeType = this.nodeType;

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

			console.warn( `AttributeNode: Vertex attribute "${ attributeName }" not found on geometry.` );

			return builder.generateConst( nodeType );

		}

	}

	serialize( data ) {

		super.serialize( data );

		data.global = this.global;
		data._attributeName = this._attributeName;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.global = data.global;
		this._attributeName = data._attributeName;

	}

}

export default AttributeNode;

AttributeNode.type = /*@__PURE__*/ registerNode( 'Attribute', AttributeNode );

export const attribute = ( name, nodeType ) => nodeObject( new AttributeNode( name, nodeType ) );
