import Node from './Node.js';
import { addMethodChaining, nodeObject } from '../tsl/TSLCore.js';

/**
 * This node can be used as a cache management component for another node.
 * Caching is in general used by default in {@link NodeBuilder} but this node
 * allows the usage of a shared parent cache during the build process.
 *
 * @augments Node
 */
class CacheNode extends Node {

	static get type() {

		return 'CacheNode';

	}

	/**
	 * Constructs a new cache node.
	 *
	 * @param {Node} node - The node that should be cached.
	 * @param {boolean} [parent=true] - Whether this node refers to a shared parent cache or not.
	 */
	constructor( node, parent = true ) {

		super();

		/**
		 * The node that should be cached.
		 *
		 * @type {Node}
		 */
		this.node = node;

		/**
		 * Whether this node refers to a shared parent cache or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.parent = parent;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCacheNode = true;

	}

	getNodeType( builder ) {

		const previousCache = builder.getCache();
		const cache = builder.getCacheFromNode( this, this.parent );

		builder.setCache( cache );

		const nodeType = this.node.getNodeType( builder );

		builder.setCache( previousCache );

		return nodeType;

	}

	build( builder, ...params ) {

		const previousCache = builder.getCache();
		const cache = builder.getCacheFromNode( this, this.parent );

		builder.setCache( cache );

		const data = this.node.build( builder, ...params );

		builder.setCache( previousCache );

		return data;

	}

}

export default CacheNode;

/**
 * TSL function for creating a cache node.
 *
 * @tsl
 * @function
 * @param {Node} node - The node that should be cached.
 * @param {boolean} [parent] - Whether this node refers to a shared parent cache or not.
 * @returns {CacheNode}
 */
export const cache = ( node, parent ) => nodeObject( new CacheNode( nodeObject( node ), parent ) );

/**
 * Assigns a namespace to the given node by updating its context.
 *
 * Important for TSL functions that use `.once( namespace )` to ensure that the namespace will run twice,
 * once when the node is build in the specific namespace and once when the node is built in the others namespace.
 *
 * This is useful for nodes like `positionWorld` that need to be re-updated if used in `material.positionNode` and outside of it in the same material.
 *
 * @param {Object} node - The node to which the namespace will be assigned.
 * @param {string} namespace - The namespace to be assigned to the node.
 * @returns {Object} The updated node with the new namespace in its context.
 */
export const namespace = ( node, namespace ) => node.context( { namespace } );

addMethodChaining( 'cache', cache );
