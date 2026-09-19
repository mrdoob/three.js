import Node from './Node.js';
import { warn } from '../../utils.js';

/**
 * This module uses cache management to create temporary variables
 * if the node is used more than once to prevent duplicate calculations.
 *
 * The class acts as a base class for many other nodes types.
 *
 * @deprecated Extend Node and override isAllowedCache() instead.
 * @augments Node
 */
class TempNode extends Node {

	static get type() {

		return 'TempNode';

	}

	/**
	 * Constructs a temp node.
	 *
	 * @param {?string} nodeType - The node type.
	 */
	constructor( nodeType = null ) {

		super( nodeType );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isTempNode = true;

		warn( 'TempNode: This module has been deprecated. Extend Node and override "isAllowedCache( builder )" instead.' );

	}

	isAllowedCache( builder ) {

		return this.hasDependencies( builder );

	}

	/**
	 * Whether this node is used more than once in context of other nodes.
	 *
	 * @param {NodeBuilder} builder - The node builder.
	 * @return {boolean} A flag that indicates if there is more than one dependency to other nodes.
	 */
	hasDependencies( builder ) {

		return builder.getDataFromNode( this ).usageCount > 1;

	}

}

export default TempNode;
