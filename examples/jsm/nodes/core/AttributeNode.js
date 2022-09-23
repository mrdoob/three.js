import Node from './Node.js';
import VaryingNode from './VaryingNode.js';

class AttributeNode extends Node {

	constructor( attributeName, nodeType = null ) {

		super( nodeType );

		this._attributeName = attributeName;

	}

	getHash( builder ) {

		return this.getAttributeName( builder );

	}

	getNodeType( builder ) {

		const attributeName = this.getAttributeName( builder );

		let nodeType = super.getNodeType( builder );

		if ( nodeType === null ) {

			if ( builder.hasGeometryAttribute( attributeName ) ) {

				const attribute = builder.geometry.getAttribute( attributeName );

				nodeType = builder.getTypeFromLength( attribute.itemSize );

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

			const nodeAttribute = builder.getAttribute( attributeName, nodeType );

			if ( builder.isShaderStage( 'vertex' ) ) {

				return nodeAttribute.name;

			} else {

				const nodeVarying = new VaryingNode( this );

				return nodeVarying.build( builder, nodeAttribute.type );

			}

		} else {

			console.warn( `Attribute "${ attributeName }" not found.` );

			return builder.getConst( nodeType );

		}

	}

}

export default AttributeNode;
