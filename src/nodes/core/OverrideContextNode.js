import ContextNode from './ContextNode.js';
import { addMethodChaining } from '../tsl/TSLCore.js';

/**
 * A context node that overrides a target node within another node using a callback function.
 *
 * ```js
 * node.overrideNode( positionLocal, () => positionLocal.add( vec3( 1, 0, 0 ) ) );
 * // or
 * material.contextNode = overrideNode( positionLocal, () => positionLocal.add( vec3( 1, 0, 0 ) ) );
 * ```
 *
 * @augments ContextNode
 */
class OverrideContextNode extends ContextNode {

	static get type() {

		return 'OverrideContextNode';

	}

	/**
	 * Constructs a new override context node.
	 *
	 * @param {Map<Node, Function>} overrideNodes - A map containing target nodes to override and their respective override callback functions.
	 * @param {Node} [flowNode=null] - The node whose context should be modified.
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
	 * Gathers the context data from all parent context nodes.
	 *
	 * @return {Object} The gathered context data.
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
 * Creates an OverrideContextNode that overrides a target node within a callback function.
 *
 * ```js
 * material.contextNode = overrideNode( positionLocal, () => positionLocal.add( vec3( 1, 0, 0 ) ) );
 * ```
 *
 * @tsl
 * @function
 * @param {Node} targetNode - The target node to override.
 * @param {Function|Node} [callback=null] - A callback function that returns the overriding node, or the overriding node itself.
 * @param {Node} [flowNode=null] - An optional flow node.
 * @return {OverrideContextNode} The created OverrideContextNode.
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
 * Creates an OverrideContextNode that overrides multiple target nodes.
 *
 * ```js
 * material.contextNode = overrideNodes( [
 * 	[ positionView, customPositionView ],
 * 	[ positionViewDirection, customPositionViewDirection ]
 * ] );
 * ```
 *
 * @tsl
 * @function
 * @param {Map|Array} overrides - The overrides mapping target nodes to callback functions or overriding nodes.
 * @param {Node} [flowNode=null] - An optional flow node.
 * @return {OverrideContextNode} The created OverrideContextNode.
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
