import ContextNode from './ContextNode.js';
import { addMethodChaining } from '../tsl/TSLCore.js';

/**
 * A specialized context node designed to override specific target nodes within a
 * node sub-graph or flow. This allows replacing specific inputs (e.g., normal
 * and position vectors) dynamically during compilation for a specific flow node,
 * without having to reconstruct or duplicate the source nodes.
 *
 * ```js
 * // Method chaining example:
 * node.overrideNode( positionLocal, () => positionLocal.add( vec3( 1, 0, 0 ) ) );
 *
 * // Context assignment example:
 * material.contextNode = overrideNode( positionLocal, () => positionLocal.add( vec3( 1, 0, 0 ) ) );
 * ```
 *
 * @augments ContextNode
 */
class OverrideContextNode extends ContextNode {

	/**
	 * Returns the type of the node.
	 *
	 * @type {string}
	 * @readonly
	 * @static
	 */
	static get type() {

		return 'OverrideContextNode';

	}

	/**
	 * Constructs a new override context node.
	 *
	 * @param {Map<Node, Function>} overrideNodes - A map mapping target nodes to their respective override callback functions.
	 * @param {Node|null} [flowNode=null] - The node whose context should be modified.
	 */
	constructor( overrideNodes, flowNode = null ) {

		super( flowNode, {
			overrideNodes
		} );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isOverrideContextNode = true;

	}

	/**
	 * Gathers the context data from all parent context nodes by traversing the hierarchy,
	 * merging the `overrideNodes` maps from all encountered `OverrideContextNode` instances.
	 *
	 * @return {Object} The gathered context data, containing the merged `overrideNodes` map.
	 */
	getFlowContextData() {

		const children = [];

		this.traverse( ( node ) => {

			if ( node.isOverrideContextNode === true ) {

				children.push( node.value.overrideNodes );

			}

		} );

		const overrideNodes = new Map( children.flatMap( ( map ) => Array.from( map.entries() ) ) );

		const data = super.getFlowContextData();
		data.overrideNodes = overrideNodes;

		return data;

	}

}

export default OverrideContextNode;

/**
 * TSL function for creating an `OverrideContextNode` to override a single target node.
 *
 * ```js
 * material.contextNode = overrideNode( positionLocal, ( builder ) => positionLocal.add( vec3( 1, 0, 0 ) ) );
 * ```
 *
 * @tsl
 * @function
 * @param {Node} targetNode - The target node that should be overridden.
 * @param {Function|Node|null} [callback=null] - A callback function returning the overriding node (which receives the builder as its argument), or the overriding node itself.
 * @param {Node|null} [flowNode=null] - The node whose context should be modified.
 * @return {OverrideContextNode} The created override context node.
 */
export function overrideNode( targetNode, callback = null, flowNode = null ) {

	if ( callback && callback.isNode ) {

		const node = callback;

		callback = () => node;

	}

	return new OverrideContextNode( new Map( [[ targetNode, callback ]] ), flowNode );

}

addMethodChaining( 'overrideNode', ( flowNode, node, callback ) => overrideNode( node, callback, flowNode ) );

/**
 * TSL function for creating an `OverrideContextNode` to override multiple target nodes.
 *
 * ```js
 * material.contextNode = overrideNodes( [
 * 	[ positionView, customPositionView ],
 * 	[ positionViewDirection, ( builder ) => customPositionViewDirection ]
 * ] );
 * ```
 *
 * @tsl
 * @function
 * @param {Map<Node, (Function|Node)>|Array<Array<Node|Function|Node>>} overrides - The overrides mapping target nodes to callback functions or overriding nodes.
 * @param {Node|null} [flowNode=null] - The node whose context should be modified.
 * @return {OverrideContextNode} The created override context node.
 */
export function overrideNodes( overrides, flowNode = null ) {

	const overrideNodesMap = new Map();

	for ( const [ node, value ] of overrides ) {

		const callback = value !== null ? typeof value === 'function' ? value : () => value : null;

		overrideNodesMap.set( node, callback );

	}

	return new OverrideContextNode( overrideNodesMap, flowNode );

}

addMethodChaining( 'overrideNodes', ( flowNode, overrides ) => overrideNodes( overrides, flowNode ) );
