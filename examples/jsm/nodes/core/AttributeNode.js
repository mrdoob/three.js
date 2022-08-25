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

		let nodeType = super.getNodeType( builder );

		if ( nodeType === null ) {

			const attributeName = this.getAttributeName( builder );
			const attribute = builder.geometry.getAttribute( attributeName );

			nodeType = builder.getTypeFromLength( attribute.itemSize );

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

		const attribute = builder.getAttribute( this.getAttributeName( builder ), this.getNodeType( builder ) );

		if ( builder.isShaderStage( 'vertex' ) ) {

			return attribute.name;

		} else {

			const nodeVarying = new VaryingNode( this );

			return nodeVarying.build( builder, attribute.type );

		}

	}

}

export default AttributeNode;
