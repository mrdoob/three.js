import ArrayElementNode from '../utils/ArrayElementNode.js';
import { nodeObject } from '../tsl/TSLCore.js';
import Node from '../core/Node.js';

/** @module WorkgroupInfoNode **/

/**
 * TODO
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
		 * @type {Boolean}
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
 * TODO
 *
 * @augments Node
 */
class WorkgroupInfoNode extends Node {

	/**
	 * Constructs a new workgroup info node.
	 *
	 * @param {String} scope - TODO.
	 * @param {String} bufferType - The buffer type.
	 * @param {Number} [bufferCount=0] - The buffer count.
	 */
	constructor( scope, bufferType, bufferCount = 0 ) {

		super( bufferType );

		/**
		 * The buffer type.
		 *
		 * @type {String}
		 */
		this.bufferType = bufferType;

		/**
		 * The buffer count.
		 *
		 * @type {Number}
		 * @default 0
		 */
		this.bufferCount = bufferCount;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isWorkgroupInfoNode = true;

		/**
		 * TODO.
		 *
		 * @type {String}
		 */
		this.scope = scope;

	}

	/**
	 * Sets the name/label of this node.
	 *
	 * @param {String} name - The name to set.
	 * @return {WorkgroupInfoNode} A reference to this node.
	 */
	label( name ) {

		this.name = name;

		return this;

	}

	/**
	 * Sets the scope of this node.
	 *
	 * @param {String} scope - The scope to set.
	 * @return {WorkgroupInfoNode} A reference to this node.
	 */
	setScope( scope ) {

		this.scope = scope;

		return this;

	}

	/**
	 * Overwrites the default implementation since the input type
	 * is inferred from the scope.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The input type.
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

		return nodeObject( new WorkgroupInfoElementNode( this, indexNode ) );

	}

	generate( builder ) {

		return builder.getScopedArray( this.name || `${this.scope}Array_${this.id}`, this.scope.toLowerCase(), this.bufferType, this.bufferCount );

	}

}

export default WorkgroupInfoNode;

/**
 * TSL function for creating a workgroup info node.
 *
 * @function
 * @param {String} type - The buffer type.
 * @param {Number} [count=0] - The buffer count.
 * @returns {WorkgroupInfoNode}
 */
export const workgroupArray = ( type, count ) => nodeObject( new WorkgroupInfoNode( 'Workgroup', type, count ) );


