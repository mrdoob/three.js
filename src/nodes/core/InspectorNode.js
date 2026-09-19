import Node from './Node.js';
import InspectorBase from '../../renderers/common/InspectorBase.js';
import { addMethodChaining, nodeObject } from '../tsl/TSLCore.js';
import { context } from './ContextNode.js';
import { rtt } from '../utils/RTTNode.js';
import { NodeUpdateType } from './constants.js';
import { warnOnce } from '../../utils.js';

/**
 * InspectorNode is a wrapper node that allows inspection of node values during rendering.
 * It can be used to debug or analyze node outputs in the rendering pipeline.
 *
 * The inspector expects a texture to display. Texture and pass nodes are presented as they are,
 * any other node is automatically rendered into a texture via {@link RTTNode} when the inspector
 * builds the node, so `rtt()` does not have to be used manually.
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

		/**
		 * The RTT node used to render a non-texture node into a texture for the inspector.
		 * It is created on demand when the inspector builds the node.
		 *
		 * @type {?RTTNode}
		 * @default null
		 */
		this.rttNode = null;

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
	 * Returns the type of the wrapped node. When the node is built by the inspector,
	 * the type of the node presented to the inspector is returned.
	 *
	 * @param {NodeBuilder} builder - The node builder.
	 * @param {?string} [output=null] - The output of the node.
	 * @returns {string}
	 */
	generateNodeType( builder, output = null ) {

		const nodeProperties = builder.getNodeProperties( this );

		if ( nodeProperties.outputNode ) {

			return nodeProperties.outputNode.getNodeType( builder, output );

		}

		return this.node.getNodeType( builder, output );

	}

	/**
	 * Returns the node presented to the inspector. Texture and pass nodes are returned as they are,
	 * any other node is wrapped in a {@link RTTNode} so the inspector always receives a texture.
	 *
	 * @private
	 * @param {Node} node - The node to present to the inspector.
	 * @returns {Node} The node presented to the inspector.
	 */
	_getInspectorNode( node ) {

		if ( node.isTextureNode === true || node.isPassNode === true ) return node;

		if ( this.rttNode === null ) {

			const rttNode = rtt( node );
			rttNode.name = this.getName();

			// Let the inspector define the UV, e.g. for aspect ratio correction.
			rttNode.uvNode = null;

			this.rttNode = rttNode;

		}

		return this.rttNode;

	}

	/**
	 * Sets up the inspector node.
	 *
	 * @param {NodeBuilder} builder - The node builder.
	 * @returns {Node} The setup node.
	 */
	setup( builder ) {

		let node = this.node;

		if ( builder.context.inspector === true ) {

			if ( this.callback !== null ) {

				node = this.callback( node );

			}

			node = this._getInspectorNode( node );

			// Disable the inspector context for the presented node, so nested
			// inspector nodes are not processed while building it.

			node = context( node, { inspector: false } );

		}

		if ( builder.renderer.backend.isWebGPUBackend !== true && builder.renderer.inspector.constructor !== InspectorBase ) {

			warnOnce( 'TSL: ".toInspector()" is only available with WebGPU.' );

		}

		return node;

	}

	/**
	 * Generates the code of the node presented to the inspector.
	 *
	 * @param {NodeBuilder} builder - The node builder.
	 * @param {?string} output - The output type.
	 * @returns {string} The generated code snippet.
	 */
	generate( builder, output ) {

		const nodeData = builder.getDataFromNode( this );

		if ( nodeData.generating === true ) {

			// The node presented to the inspector uses the inspected node (e.g. the inspector samples
			// the texture with `screenUV` while `screenUV` is inspected), so this node is built
			// again as "before" node of the inspected node. Only the inspected node is generated then.

			return this.node.build( builder, output );

		}

		nodeData.generating = true;

		const snippet = super.generate( builder, output );

		nodeData.generating = false;

		return snippet;

	}

	/**
	 * Frees internal resources. Should be called when the node is no longer in use.
	 */
	dispose() {

		if ( this.rttNode !== null ) {

			this.rttNode.dispose();
			this.rttNode = null;

		}

		super.dispose();

	}

}

export default InspectorNode;

/**
 * Creates an inspector node to wrap around a given node for inspection purposes.
 *
 * Texture and pass nodes are presented to the inspector as they are, any other node
 * is automatically rendered into a texture via `rtt()` when the inspector builds it.
 *
 * @tsl
 * @param {Node} node - The node to inspect.
 * @param {string} [name=''] - Optional name for the inspector node.
 * @param {Function|null} [callback=null] - Optional callback to modify the node during setup.
 * @returns {Node} The inspector node.
 */
export function inspect( node, name = '', callback = null ) {

	node = nodeObject( node );

	return node.before( new InspectorNode( node, name, callback ) );

}

addMethodChaining( 'toInspector', inspect );
