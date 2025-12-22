import ArrayElementNode from '../utils/ArrayElementNode.js';
import Node from '../core/Node.js';
import { warn } from '../../utils.js';

/**
 * Represents an element of a 'workgroup' scoped buffer.
 *
 * @augments ArrayElementNode
 */
class WorkgroupInfoElementNode extends ArrayElementNode {

	/**
	 * Constructs a new workgroup info element node.
	 *
	 * @param {Node} workgroupInfoNode - The workgroup info node.
	 * @param {Node} indexNode - The index node that defines the element access.
	 */
	constructor( workgroupInfoNode, indexNode ) {

		super( workgroupInfoNode, indexNode );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isWorkgroupInfoElementNode = true;

	}

	generate( builder, output ) {

		let snippet;

		const isAssignContext = builder.context.assign;
		snippet = super.generate( builder );

		if ( isAssignContext !== true ) {

			const type = this.getNodeType( builder );

			snippet = builder.format( snippet, type, output );

		}

		// TODO: Possibly activate clip distance index on index access rather than from clipping context

		return snippet;

	}

}

/**
 * A node allowing the user to create a 'workgroup' scoped buffer within the
 * context of a compute shader. Typically, workgroup scoped buffers are
 * created to hold data that is transferred from a global storage scope into
 * a local workgroup scope. For invocations within a workgroup, data
 * access speeds on 'workgroup' scoped buffers can be significantly faster
 * than similar access operations on globally accessible storage buffers.
 *
 * This node can only be used with a WebGPU backend.
 *
 * @augments Node
 */
class WorkgroupInfoNode extends Node {

	/**
	 * Constructs a new buffer scoped to type scope.
	 *
	 * @param {string} scope - TODO.
	 * @param {string} bufferType - The data type of a 'workgroup' scoped buffer element.
	 * @param {number} [bufferCount=0] - The number of elements in the buffer.
	 */
	constructor( scope, bufferType, bufferCount = 0 ) {

		super( bufferType );

		/**
		 * The buffer type.
		 *
		 * @type {string}
		 */
		this.bufferType = bufferType;

		/**
		 * The buffer count.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.bufferCount = bufferCount;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isWorkgroupInfoNode = true;

		/**
		 * The data type of the array buffer.
		 *
		 * @type {string}
		 */
		this.elementType = bufferType;

		/**
		 * TODO.
		 *
		 * @type {string}
		 */
		this.scope = scope;

		/**
		 * The name of the workgroup scoped buffer.
		 *
		 * @type {string}
		 * @default ''
		 */
		this.name = '';

	}

	/**
	 * Sets the name of this node.
	 *
	 * @param {string} name - The name to set.
	 * @return {WorkgroupInfoNode} A reference to this node.
	 */
	setName( name ) {

		this.name = name;

		return this;

	}

	/**
	 * Sets the name/label of this node.
	 *
	 * @deprecated
	 * @param {string} name - The name to set.
	 * @return {WorkgroupInfoNode} A reference to this node.
	 */
	label( name ) {

		warn( 'TSL: "label()" has been deprecated. Use "setName()" instead.' ); // @deprecated r179

		return this.setName( name );

	}

	/**
	 * Sets the scope of this node.
	 *
	 * @param {string} scope - The scope to set.
	 * @return {WorkgroupInfoNode} A reference to this node.
	 */
	setScope( scope ) {

		this.scope = scope;

		return this;

	}


	/**
	 * The data type of the array buffer.
	 *
	 * @return {string} The element type.
	 */
	getElementType() {

		return this.elementType;

	}

	/**
	 * Overwrites the default implementation since the input type
	 * is inferred from the scope.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The input type.
	 */
	getInputType( /*builder*/ ) {

		return `${this.scope}Array`;

	}

	/**
	 * This method can be used to access elements via an index node.
	 *
	 * @param {IndexNode} indexNode - indexNode.
	 * @return {WorkgroupInfoElementNode} A reference to an element.
	 */
	element( indexNode ) {

		return new WorkgroupInfoElementNode( this, indexNode );

	}

	generate( builder ) {

		const name = ( this.name !== '' ) ? this.name : `${this.scope}Array_${this.id}`;

		return builder.getScopedArray( name, this.scope.toLowerCase(), this.bufferType, this.bufferCount );

	}

}

export default WorkgroupInfoNode;

/**
 * TSL function for creating a workgroup info node.
 * Creates a new 'workgroup' scoped array buffer.
 *
 * @tsl
 * @function
 * @param {string} type - The data type of a 'workgroup' scoped buffer element.
 * @param {number} [count=0] - The number of elements in the buffer.
 * @returns {WorkgroupInfoNode}
 */
export const workgroupArray = ( type, count ) => new WorkgroupInfoNode( 'Workgroup', type, count );


