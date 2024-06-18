let id = 0;

class NodeCache {

	constructor( parent = null ) {

		this.id = id ++;
		this.nodesData = new WeakMap();

		this.parent = parent;

	}

	getData( node ) {

		let data = this.nodesData.get( node );

		if ( data === undefined && this.parent !== null ) {

			data = this.parent.getData( node );

		}

		return data;

	}

	setData( node, data ) {

		this.nodesData.set( node, data );

	}

}

export default NodeCache;
