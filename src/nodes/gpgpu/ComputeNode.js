import Node from '../core/Node.js';
import { instanceIndex } from '../core/IndexNode.js';
import StackTrace from '../core/StackTrace.js';
import { uniform } from '../core/UniformNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { addMethodChaining, nodeObject } from '../tsl/TSLCore.js';
import { warn, error } from '../../utils.js';

/**
 * Represents a compute shader node.
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
	 * @param {Node} computeNode - The node that defines the compute shader logic.
	 * @param {Array<number>} workgroupSize - An array defining the X, Y, and Z dimensions of the workgroup for compute shader execution.
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
		 * The node that defines the compute shader logic.
		 *
		 * @type {Node}
		 */
		this.computeNode = computeNode;

		/**
		 * An array defining the X, Y, and Z dimensions of the workgroup for compute shader execution.
		 *
		 * @type {Array<number>}
		 * @default [ 64 ]
		 */
		this.workgroupSize = workgroupSize;

		/**
		 * The total number of threads (invocations) to execute. If it is a number, it will be used
		 * to automatically generate bounds checking against `instanceIndex`.
		 *
		 * @type {number|Array<number>}
		 */
		this.count = null;

		/**
		 * The dispatch size for workgroups on X, Y, and Z axes.
		 * Used directly if `count` is not provided.
		 *
		 * @type {number|Array<number>}
		 */
		this.dispatchSize = null;

		/**
		 * The version of the node.
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
		 * A callback executed when the compute node finishes initialization.
		 *
		 * @type {?Function}
		 */
		this.onInitFunction = null;

		/**
		 * A uniform node holding the dispatch count for bounds checking.
		 * Created automatically when `count` is a number.
		 *
		 * @type {?UniformNode}
		 */
		this.countNode = null;

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
	 * Sets the callback to run during initialization.
	 *
	 * @param {Function} callback - The callback function.
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

		if ( this.count !== null && this.countNode === null ) {

			this.countNode = uniform( this.count, 'uint' ).onObjectUpdate( () => this.count );

		}

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

			if ( this.count !== null && builder.allowEarlyReturns === true ) {

				const countSnippet = this.countNode.build( builder, 'uint' );
				const indexSnippet = instanceIndex.build( builder, 'uint' );

				builder.flow.code = `${ builder.tab }if ( ${ indexSnippet } >= ${ countSnippet } ) { return; }\n\n${ builder.flow.code }`;

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
 * @param {Node} node - The TSL logic for the compute shader.
 * @param {Array<number>} [workgroupSize=[64]] - The workgroup size.
 * @returns {ComputeNode}
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
 * @param {Node} node - The TSL logic for the compute shader.
 * @param {number|Array<number>} count - The compute count or dispatch size.
 * @param {Array<number>} [workgroupSize=[64]] - The workgroup size.
 * @returns {ComputeNode}
,  */
export const compute = ( node, count, workgroupSize ) => {

	const computeNode = computeKernel( node, workgroupSize );

	if ( typeof count === 'number' ) {

		computeNode.count = count;

	} else {

		computeNode.dispatchSize = count;

	}

	return computeNode;

};

addMethodChaining( 'compute', compute );
addMethodChaining( 'computeKernel', computeKernel );
