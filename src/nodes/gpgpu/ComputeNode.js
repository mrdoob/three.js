import Node from '../core/Node.js';
import StackTrace from '../core/StackTrace.js';
import { NodeUpdateType } from '../core/constants.js';
import { addMethodChaining, nodeObject } from '../tsl/TSLCore.js';
import { warn, error } from '../../utils.js';

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
	 * @param {Array<number>} workgroupSize - TODO.
	 */
	constructor( computeNode, workgroupSize ) {

		super( 'void' );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
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
		 * @type {Array<number>}
		 * @default [ 64 ]
		 */
		this.workgroupSize = workgroupSize;

		/**
		 * TODO
		 *
		 * @type {number|Array<number>}
		 */
		this.count = null;

		/**
		 * TODO
		 *
		 * @type {number}
		 */
		this.version = 1;

		/**
		 * The name or label of the uniform.
		 *
		 * @type {string}
		 * @default ''
		 */
		this.name = '';

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.OBJECT` since {@link ComputeNode#updateBefore}
		 * is executed once per object by default.
		 *
		 * @type {string}
		 * @default 'object'
		 */
		this.updateBeforeType = NodeUpdateType.OBJECT;

		/**
		 * TODO
		 *
		 * @type {?Function}
		 */
		this.onInitFunction = null;

	}

	/**
	 * TODO
	 *
	 * @param {number|Array<number>} count - Array with [ x, y, z ] values for dispatch or a single number for the count
	 * @return {ComputeNode}
	 */
	setCount( count ) {

		this.count = count;

		return this;

	}

	/**
	 * TODO
	 *
	 * @return {number|Array<number>}
	 */
	getCount() {

		return this.count;

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
	 * @param {string} name - The name of the uniform.
	 * @return {ComputeNode} A reference to this node.
	 */
	setName( name ) {

		this.name = name;

		return this;

	}

	/**
	 * Sets the {@link ComputeNode#name} property.
	 *
	 * @deprecated
	 * @param {string} name - The name of the uniform.
	 * @return {ComputeNode} A reference to this node.
	 */
	label( name ) {

		warn( 'TSL: "label()" has been deprecated. Use "setName()" instead.', new StackTrace() ); // @deprecated r179

		return this.setName( name );

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

	setup( builder ) {

		const result = this.computeNode.build( builder );

		if ( result ) {

			const properties = builder.getNodeProperties( this );
			properties.outputComputeNode = result.outputNode;

			result.outputNode = null;

		}

		return result;

	}

	generate( builder, output ) {

		const { shaderStage } = builder;

		if ( shaderStage === 'compute' ) {

			const snippet = this.computeNode.build( builder, 'void' );

			if ( snippet !== '' ) {

				builder.addLineFlowCode( snippet, this );

			}

		} else {

			const properties = builder.getNodeProperties( this );
			const outputComputeNode = properties.outputComputeNode;

			if ( outputComputeNode ) {

				return outputComputeNode.build( builder, output );

			}

		}

	}

}

export default ComputeNode;

/**
 * TSL function for creating a compute kernel node.
 *
 * @tsl
 * @function
 * @param {Node} node - TODO
 * @param {Array<number>} [workgroupSize=[64]] - TODO.
 * @returns {AtomicFunctionNode}
 */
export const computeKernel = ( node, workgroupSize = [ 64 ] ) => {

	if ( workgroupSize.length === 0 || workgroupSize.length > 3 ) {

		error( 'TSL: compute() workgroupSize must have 1, 2, or 3 elements', new StackTrace() );

	}

	for ( let i = 0; i < workgroupSize.length; i ++ ) {

		const val = workgroupSize[ i ];

		if ( typeof val !== 'number' || val <= 0 || ! Number.isInteger( val ) ) {

			error( `TSL: compute() workgroupSize element at index [ ${ i } ] must be a positive integer`, new StackTrace() );

		}

	}

	// Implicit fill-up to [ x, y, z ] with 1s, just like WGSL treats @workgroup_size when fewer dimensions are specified

	while ( workgroupSize.length < 3 ) workgroupSize.push( 1 );

	//

	return new ComputeNode( nodeObject( node ), workgroupSize );

};

/**
 * TSL function for creating a compute node.
 *
 * @tsl
 * @function
 * @param {Node} node - TODO
 * @param {number|Array<number>} count - TODO.
 * @param {Array<number>} [workgroupSize=[64]] - TODO.
 * @returns {AtomicFunctionNode}
 */
export const compute = ( node, count, workgroupSize ) => computeKernel( node, workgroupSize ).setCount( count );

addMethodChaining( 'compute', compute );
addMethodChaining( 'computeKernel', computeKernel );
