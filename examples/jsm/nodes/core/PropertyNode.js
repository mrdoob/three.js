import Node from './Node.js';

class PropertyNode extends Node {

	constructor( name = null, nodeType = 'vec4' ) {

		super( nodeType );

		this.name = name;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	generate( builder ) {

		const nodeVary = builder.getVarFromNode( this, this.getNodeType( builder ) );
		const name = this.name;

		if ( name !== null ) {

			nodeVary.name = name;

		}

		return builder.getPropertyName( nodeVary );

	}

}

export default PropertyNode;
