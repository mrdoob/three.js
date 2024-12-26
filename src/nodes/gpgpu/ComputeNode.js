import Node from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { addMethodChaining, nodeObject } from '../tsl/TSLCore.js';

/** @module ComputeNode **/

/**
 * TODO
 *
 * @augments Node
 */
class ComputeNode extends Node {

	static get type() {

		return 'ComputeNode';

	}

	/**
	 * Constructs a new compute node.
	 *
	 * @param {Node} computeNode - TODO
	 * @param {Number} count - TODO.
	 * @param {Array<Number>} [workgroupSize=[64]] - TODO.
	 */
	constructor( computeNode, count, workgroupSize = [ 64 ] ) {

		super( 'void' );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isComputeNode = true;

		/**
		 * TODO
		 *
		 * @type {Node}
		 */
		this.computeNode = computeNode;

		/**
		 * TODO
		 *
		 * @type {Number}
		 */
		this.count = count;

		/**
		 * TODO
		 *
		 * @type {Array<Number>}
		 * @default [64]
		 */
		this.workgroupSize = workgroupSize;

		/**
		 * TODO
		 *
		 * @type {Number}
		 */
		this.dispatchCount = 0;

		/**
		 * TODO
		 *
		 * @type {Number}
		 */
		this.version = 1;

		/**
		 * The name or label of the uniform.
		 *
		 * @type {String}
		 * @default ''
		 */
		this.name = '';

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.OBJECT` since {@link ComputeNode#updateBefore}
		 * is executed once per object by default.
		 *
		 * @type {String}
		 * @default 'object'
		 */
		this.updateBeforeType = NodeUpdateType.OBJECT;

		/**
		 * TODO
		 *
		 * @type {Function}
		 */
		this.onInitFunction = null;

		this.updateDispatchCount();

	}

	/**
	 * Executes the `dispose` event for this node.
	 */
	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

	/**
	 * Sets the {@link ComputeNode#name} property.
	 *
	 * @param {String} name - The name of the uniform.
	 * @return {ComputeNode} A reference to this node.
	 */
	label( name ) {

		this.name = name;

		return this;

	}

	/**
	 * TODO
	 */
	updateDispatchCount() {

		const { count, workgroupSize } = this;

		let size = workgroupSize[ 0 ];

		for ( let i = 1; i < workgroupSize.length; i ++ )
			size *= workgroupSize[ i ];

		this.dispatchCount = Math.ceil( count / size );

	}

	/**
	 * TODO
	 *
	 * @param {Function} callback - TODO.
	 * @return {ComputeNode} A reference to this node.
	 */
	onInit( callback ) {

		this.onInitFunction = callback;

		return this;

	}

	/**
	 * The method execute the compute for this node.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	updateBefore( { renderer } ) {

		renderer.compute( this );

	}

	generate( builder ) {

		const { shaderStage } = builder;

		if ( shaderStage === 'compute' ) {

			const snippet = this.computeNode.build( builder, 'void' );

			if ( snippet !== '' ) {

				builder.addLineFlowCode( snippet, this );

			}

		}

	}

}

export default ComputeNode;

/**
 * TSL function for creating a compute node.
 *
 * @function
 * @param {Node} node - TODO
 * @param {Number} count - TODO.
 * @param {Array<Number>} [workgroupSize=[64]] - TODO.
 * @returns {AtomicFunctionNode}
 */
export const compute = ( node, count, workgroupSize ) => nodeObject( new ComputeNode( nodeObject( node ), count, workgroupSize ) );

addMethodChaining( 'compute', compute );
