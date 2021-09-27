import { NodeUpdateType } from './constants.js';

class Node {

	constructor( nodeType = null ) {

		this.nodeType = nodeType;

		this.updateType = NodeUpdateType.None;

	}

	get type() {

		return this.constructor.name;

	}

	getUpdateType( /*builder*/ ) {

		return this.updateType;

	}

	getNodeType( /*builder*/ ) {

		return this.nodeType;

	}

	getTypeLength( builder ) {

		return builder.getTypeLength( this.getNodeType( builder ) );

	}

	update( /*frame*/ ) {

		console.warn( 'Abstract function.' );

	}

	generate( /*builder, output*/ ) {

		console.warn( 'Abstract function.' );

	}

	build( builder, output = null ) {

		builder.addNode( this );

		const isGenerateOnce = this.generate.length === 1;

		if ( isGenerateOnce ) {

			const type = this.getNodeType( builder );
			const nodeData = builder.getDataFromNode( this );

			let snippet = nodeData.snippet;

			if ( snippet === undefined ) {

				snippet = this.generate( builder );

				nodeData.snippet = snippet;

			}

			return builder.format( snippet, type, output );

		}

		return this.generate( builder, output );

	}

}

Node.prototype.isNode = true;

export default Node;
