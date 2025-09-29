import Node from './Node.js';
import { addMethodChaining, nodeObject } from '../tsl/TSLCore.js';
import { warn } from '../../utils.js';

/**
 * This node can be used as a cache management component for another node.
 * Caching is in general used by default in {@link NodeBuilder} but this node
 * allows the usage of a shared parent cache during the build process.
 *
 * @augments Node
 */
class IsolateNode extends Node {

	static get type() {

		return 'IsolateNode';

	}

	/**
	 * Constructs a new cache node.
	 *
	 * @param {Node} node - The node that should be cached.
	 * @param {Node} [scope=null] - The scope node that defines the cache context.
	 */
	constructor( node, scope = null ) {

		super();

		/**
		 * The node that should be cached.
		 *
		 * @type {Node}
		 */
		this.node = node;


		/**
		 * The scope node that defines the cache context.
		 *
		 * @type {Node}
		 * @default null
		 */
		this.scope = scope;

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
		this.isIsolateNode = true;

	}

	getNodeCache( builder ) {

		return builder.getCacheFromNode( this, this.parent );

	}

	getNodeType( builder ) {

		let previousCache = null;

		if ( this.scope ) {

			previousCache = this.scope.getNodeCache( builder );

			builder.setCache( previousCache );

		} else {

			previousCache = builder.getCache();

		}

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

export default IsolateNode;

/**
 * TSL function for creating a cache node.
 *
 * @tsl
 * @function
 * @param {Node} node - The node that should be cached.
 * @param {Node} [scope=null] - The scope node that defines the cache context.
 * @returns {IsolateNode}
 */
export const isolate = ( node, scope = null ) => new IsolateNode( nodeObject( node ), scope );


/**
 * TSL function for creating a cache node.
 *
 * @tsl
 * @function
 * @deprecated
 * @param {Node} node - The node that should be cached.
 * @returns {IsolateNode}
 */
export function cache( node ) {

	warn( 'TSL: "cache()" has been deprecated. Use "isolate()" instead.' ); // @deprecated r181

	return isolate( node );

}

addMethodChaining( 'cache', cache );
addMethodChaining( 'isolate', isolate );
