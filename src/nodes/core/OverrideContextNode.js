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
	 * @param {?string} [shaderStage=null] - The shader stage the overrides apply to, all stages by default.
	 */
	constructor( overrideNodes, flowNode = null, shaderStage = null ) {

		const value = { overrideNodes };

		// the surface is replaced per fragment, the varyings are evaluated in the fragment stage as well

		if ( shaderStage === 'fragment' ) value.inlineVaryings = true;

		super( flowNode, value );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isOverrideContextNode = true;

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
 * @param {?string} [shaderStage=null] - The shader stage the overrides apply to, all stages by default. With fragment overrides,
 * all varyings of the context are evaluated in the fragment stage, e.g. if the surface is reconstructed per fragment.
 * @return {OverrideContextNode} The created override context node.
 */
export function overrideNodes( overrides, flowNode = null, shaderStage = null ) {

	const overrideNodesMap = new Map();

	for ( const [ node, value ] of overrides ) {

		let callback = null;

		if ( value !== null ) {

			callback = typeof value === 'function' ? value : () => value;

			if ( shaderStage !== null ) callback = getStageCallback( node, callback, shaderStage );

		}

		overrideNodesMap.set( node, callback );

	}

	return new OverrideContextNode( overrideNodesMap, flowNode, shaderStage );

}

addMethodChaining( 'overrideNodes', ( flowNode, overrides, shaderStage ) => overrideNodes( overrides, flowNode, shaderStage ) );

/**
 * Returns an override callback which only overrides the node in the given shader stage.
 *
 * @private
 * @param {Node} node - The target node.
 * @param {Function} callback - The override callback.
 * @param {string} shaderStage - The shader stage.
 * @return {Function} The override callback of the shader stage.
 */
function getStageCallback( node, callback, shaderStage ) {

	return ( builder ) => builder.shaderStage === shaderStage ? callback( builder ) : node;

}
