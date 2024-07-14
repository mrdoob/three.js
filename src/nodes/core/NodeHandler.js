let _id = 0;

class NodeHandler {

	constructor() {

		this.id = _id ++;
		this.handlers = [];

	}

	onHandle( name, callback ) {

		this.handlers[ name ] = callback;

		return this;

	}

	handle( name, node, builder ) {

		const callback = this.handlers[ name ];

		if ( callback !== undefined ) {

			node = callback( node, builder );

		}

		return node || null;

	}

}

export default NodeHandler;
