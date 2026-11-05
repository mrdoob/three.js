import Node from './Node.js';
import InspectorBase from '../../renderers/common/InspectorBase.js';
import { addMethodChaining, nodeObject } from '../tsl/TSLCore.js';
import { NodeUpdateType } from './constants.js';
import { warnOnce } from '../../utils.js';

/**
 * InspectorNode is a wrapper node that allows inspection of node values during rendering.
 * It can be used to debug or analyze node outputs in the rendering pipeline.
 *
 * The inspector node is registered by the inspected node when it is built, see {@link Node#_setupInspector}.
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
	 * @param {Function|null} [callback=null] - Optional callback to modify the node presented by the inspector.
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

		const { renderer } = frame;

		if ( renderer.backend.isWebGPUBackend !== true && renderer.inspector.constructor !== InspectorBase ) {

			warnOnce( 'TSL: ".toInspector()" is only available with WebGPU.' );

		}

		renderer.inspector.inspect( this );

	}

	/**
	 * Returns the type of the wrapped node.
	 *
	 * @param {NodeBuilder} builder - The node builder.
	 * @returns {string}
	 */
	generateNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

}

export default InspectorNode;

/**
 * Creates an inspector node to wrap around a given node for inspection purposes.
 *
 * @tsl
 * @param {Node} node - The node to inspect.
 * @param {string} [name=''] - Optional name for the inspector node.
 * @param {Function|null} [callback=null] - Optional callback to modify the node presented by the inspector.
 * @returns {Node} The inspected node.
 */
export function inspect( node, name = '', callback = null ) {

	node = nodeObject( node );

	node._inspectorNode = new InspectorNode( node, name, callback );

	return node;

}

addMethodChaining( 'toInspector', inspect );
