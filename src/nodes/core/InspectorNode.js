import Node from './Node.js';
import InspectorBase from '../../renderers/common/InspectorBase.js';
import { addMethodChaining, nodeObject } from '../tsl/TSLCore.js';
import { NodeUpdateType } from './constants.js';
import { warnOnce } from '../../utils.js';

/**
 * InspectorNode is a wrapper node that allows inspection of node values during rendering.
 * It can be used to debug or analyze node outputs in the rendering pipeline.
 *
 * @augments Node
 */
class InspectorNode extends Node {

	/**
	 * Returns the type of the node.
	 *
	 * @returns {string}
	 */
	static get type() {

		return 'InspectorNode';

	}

	/**
	 * Creates an InspectorNode.
	 *
	 * @param {Node} node - The node to inspect.
	 * @param {string} [name=''] - Optional name for the inspector node.
	 * @param {Function|null} [callback=null] - Optional callback to modify the node during setup.
	 */
	constructor( node, name = '', callback = null ) {

		super();

		this.node = node;
		this.name = name;
		this.callback = callback;

		this.updateType = NodeUpdateType.FRAME;

		this.isInspectorNode = true;

	}

	/**
	 * Returns the name of the inspector node.
	 *
	 * @returns {string}
	 */
	getName() {

		return this.name || this.node.name;

	}

	/**
	 * Updates the inspector node, allowing inspection of the wrapped node.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	update( frame ) {

		frame.renderer.inspector.inspect( this );

	}

	/**
	 * Returns the type of the wrapped node.
	 *
	 * @param {NodeBuilder} builder - The node builder.
	 * @returns {string}
	 */
	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	/**
	 * Sets up the inspector node.
	 *
	 * @param {NodeBuilder} builder - The node builder.
	 * @returns {Node} The setup node.
	 */
	setup( builder ) {

		let node = this.node;

		if ( builder.context.inspector === true && this.callback !== null ) {

			node = this.callback( node );

		}

		if ( builder.renderer.backend.isWebGPUBackend !== true && builder.renderer.inspector.constructor !== InspectorBase ) {

			warnOnce( 'TSL: ".toInspector()" is only available with WebGPU.' );

		}

		return node;

	}

}

export default InspectorNode;

/**
 * Creates an inspector node to wrap around a given node for inspection purposes.
 *
 * @tsl
 * @param {Node} node - The node to inspect.
 * @param {string} [name=''] - Optional name for the inspector node.
 * @param {Function|null} [callback=null] - Optional callback to modify the node during setup.
 * @returns {Node} The inspector node.
 */
export function inspector( node, name = '', callback = null ) {

	node = nodeObject( node );

	return node.before( new InspectorNode( node, name, callback ) );

}

addMethodChaining( 'toInspector', inspector );
