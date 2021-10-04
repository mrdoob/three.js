import Node from './Node.js';
import VaryNode from './VaryNode.js';

class AttributeNode extends Node {

	constructor( attributeName, nodeType ) {

		super( nodeType );

		this._attributeName = attributeName;

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

			const nodeVary = new VaryNode( this );

			return nodeVary.build( builder, attribute.type );

		}

	}

}

export default AttributeNode;
