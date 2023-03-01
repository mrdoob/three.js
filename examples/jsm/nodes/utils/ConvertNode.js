import Node, { addNodeClass } from '../core/Node.js';

class ConvertNode extends Node {

	constructor( node, convertTo ) {

		super();

		this.node = node;
		this.convertTo = convertTo;

	}

	getNodeType( builder ) {

		const requestType = this.node.getNodeType( builder );

		let convertTo = null;

		for ( const overloadingType of this.convertTo.split( '|' ) ) {

			if ( convertTo === null || builder.getTypeLength( requestType ) === builder.getTypeLength( overloadingType ) ) {

				convertTo = overloadingType;

			}

		}

		return convertTo;

	}

	generate( builder, output ) {

		const node = this.node;
		const type = this.getNodeType( builder );

		const snippet = node.build( builder, type );

		return builder.format( snippet, type, output );

	}

}

export default ConvertNode;

addNodeClass( ConvertNode );
