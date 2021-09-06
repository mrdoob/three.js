import Node from './Node.js';
import VaryNode from './VaryNode.js';

class AttributeNode extends Node {

	constructor( attributeName, type ) {

		super( type );

		this._attributeName = attributeName;

	}

	setAttributeName( attributeName ) {

		this._attributeName = attributeName;

		return this;

	}

	getAttributeName( /*builder*/ ) {

		return this._attributeName;

	}

	generate( builder, output ) {

		const attributeName = this.getAttributeName( builder );
		const attributeType = this.getType( builder );

		const attribute = builder.getAttribute( attributeName, attributeType );

		if ( builder.isShaderStage( 'vertex' ) ) {

			return builder.format( attribute.name, attribute.type, output );

		} else {

			const nodeData = builder.getDataFromNode( this, builder.shaderStage );

			let nodeVary = nodeData.varyNode;

			if ( nodeVary === undefined ) {

				nodeVary = new VaryNode( this );

				nodeData.nodeVary = nodeVary;

			}

			return nodeVary.build( builder, output );

		}

	}

}

export default AttributeNode;
