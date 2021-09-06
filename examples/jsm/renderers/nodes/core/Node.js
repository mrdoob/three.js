import { NodeUpdateType } from './constants.js';

class Node {

	constructor( type = null ) {

		this.type = type;

		this.updateType = NodeUpdateType.None;

	}

	getUpdateType( /*builder*/ ) {

		return this.updateType;

	}

	getType( /*builder*/ ) {

		return this.type;

	}

	getTypeLength( builder ) {

		return builder.getTypeLength( this.getType( builder ) );

	}

	update( /*frame*/ ) {

		console.warn( 'Abstract function.' );

	}

	generate( /*builder, output*/ ) {

		console.warn( 'Abstract function.' );

	}

	build( builder, output = null ) {

		builder.addNode( this );

		return this.generate( builder, output );

	}

}

Node.prototype.isNode = true;

export default Node;
