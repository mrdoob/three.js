let _id = 0;

/**
 * This utility class is used in {@link NodeBuilder} as an internal
 * cache data structure for node data.
 */
class NodeCache {

	/**
	 * Constructs a new node cache.
	 *
	 * @param {NodeCache?} parent - A reference to a parent cache.
	 */
	constructor( parent = null ) {

		/**
		 * The id of the cache.
		 *
		 * @type {Number}
		 * @readonly
		 */
		this.id = _id ++;

		/**
		 * A weak map for managing node data.
		 *
		 * @type {WeakMap<Node, Object>}
		 */
		this.nodesData = new WeakMap();

		/**
		 * Reference to a parent node cache.
		 *
		 * @type {NodeCache?}
		 * @default null
		 */
		this.parent = parent;

	}

	/**
	 * Returns the data for the given node.
	 *
	 * @param {Node} node - The node.
	 * @return {Object?} The data for the node.
	 */
	getData( node ) {

		let data = this.nodesData.get( node );

		if ( data === undefined && this.parent !== null ) {

			data = this.parent.getData( node );

		}

		return data;

	}

	/**
	 * Sets the data for a given node.
	 *
	 * @param {Node} node - The node.
	 * @param {Object} data - The data that should be cached.
	 */
	setData( node, data ) {

		this.nodesData.set( node, data );

	}

}

export default NodeCache;
