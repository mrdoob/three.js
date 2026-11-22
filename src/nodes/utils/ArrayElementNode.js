import Node from '../core/Node.js';

/**
 * Whether the given node is an array-like node with its own element access,
 * e.g. a storage buffer read from a PBO in WebGL or a uniform array with padded elements.
 *
 * @private
 * @param {Node} node - The node to check.
 * @return {boolean} Whether the node is a buffer-like array.
 */
const isBufferArray = ( node ) => node.isBufferNode === true || node.isWorkgroupInfoNode === true;

/**
 * Represents the element access on array-like nodes, e.g. vectors, matrices,
 * arrays, uniform arrays, storage buffers and workgroup arrays.
 *
 * @augments Node
 */
class ArrayElementNode extends Node {

	static get type() {

		return 'ArrayElementNode';

	}

	/**
	 * Constructs an array element node.
	 *
	 * @param {Node} node - The array-like node.
	 * @param {Node} indexNode - The index node that defines the element access.
	 */
	constructor( node, indexNode ) {

		super();

		/**
		 * The array-like node.
		 *
		 * @type {Node}
		 */
		this.node = node;

		/**
		 * The index node that defines the element access.
		 *
		 * @type {Node}
		 */
		this.indexNode = indexNode;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isArrayElementNode = true;

	}

	isCacheable( /*builder*/ ) {

		return false;

	}

	/**
	 * This method is overwritten since the node type is inferred from the array-like node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
	 */
	generateNodeType( builder ) {

		const outputNode = this.getOutputNode( builder );

		if ( outputNode !== null ) return outputNode.getNodeType( builder );

		return this.node.getElementType( builder );

	}

	/**
	 * This method is overwritten since the member type is inferred from the array-like node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {string} name - The member name.
	 * @return {string} The member type.
	 */
	getMemberType( builder, name ) {

		const outputNode = this.getOutputNode( builder );

		if ( outputNode !== null ) return outputNode.getMemberType( builder, name );

		return this.node.getMemberType( builder, name );

	}

	/**
	 * A buffer-like array can be known only in the build, e.g. a storage buffer returned by a function
	 * or the buffer of a reference node. The access is then redirected to an element of that array.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {?Node} The redirected element, or `null` if the access is not redirected.
	 */
	getOutputNode( builder ) {

		const properties = builder.getNodeProperties( this );

		if ( properties.redirectedNode === undefined ) {

			// the array is resolved with its setup output, so an element created later is not redirected

			if ( builder.getBuildStage() !== 'setup' ) return null;

			let redirectedNode = null;

			if ( isBufferArray( this.node ) === false ) {

				// find the buffer in the setup output of the array node and access its element instead

				const createElement = ( bufferNode ) => new ArrayElementNode( bufferNode, this.indexNode );

				redirectedNode = builder.resolveNode( this.node, isBufferArray, createElement );

			}

			properties.redirectedNode = redirectedNode;

		}

		return properties.redirectedNode;

	}

	setup( builder ) {

		const outputNode = this.getOutputNode( builder );

		if ( outputNode !== null ) return outputNode;

		const arrayNode = this.node;

		if ( arrayNode.isStorageBufferNode === true && arrayNode.isPBO === true && builder.isAvailable( 'storageBuffer' ) === false ) {

			builder.setupPBO( arrayNode );

		}

		return super.setup( builder );

	}

	/**
	 * Generates the element access with an index, e.g. `array[ index ]`.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The generated code snippet.
	 */
	generateAccess( builder ) {

		const indexType = this.indexNode.getNodeType( builder );

		const nodeSnippet = this.node.build( builder );
		const indexSnippet = this.indexNode.build( builder, ! builder.isVector( indexType ) && builder.isInteger( indexType ) ? indexType : 'uint' );

		return `${ nodeSnippet }[ ${ indexSnippet } ]`;

	}

	/**
	 * Generates the element access of a uniform array, whose elements are stored with a padded type.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The generated code snippet.
	 */
	generateUniformArrayAccess( builder ) {

		return builder.format( this.generateAccess( builder ), this.node.getPaddedType( builder ), this.getNodeType( builder ) );

	}

	/**
	 * Generates the element access of a storage buffer without storage buffer support (WebGL).
	 * The element is read from a PBO, otherwise the attribute of the buffer is used.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The generated code snippet.
	 */
	generateStorageAccess( builder ) {

		const storageNode = this.node;

		const isPBO = storageNode.isPBO === true && builder.isContextAssign() !== true && ( storageNode.value.isInstancedBufferAttribute || builder.shaderStage !== 'compute' );

		return isPBO ? builder.generatePBO( this ) : storageNode.build( builder );

	}

	generate( builder, output ) {

		const outputNode = this.getOutputNode( builder );

		if ( outputNode !== null ) return outputNode.build( builder, output );

		const arrayNode = this.node;
		const isAssignContext = builder.isContextAssign();

		let snippet;

		if ( arrayNode.isStorageBufferNode === true && builder.isAvailable( 'storageBuffer' ) === false ) {

			snippet = this.generateStorageAccess( builder );

		} else if ( arrayNode.isArrayBufferNode === true ) {

			snippet = this.generateUniformArrayAccess( builder );

		} else {

			snippet = this.generateAccess( builder );

		}

		if ( isAssignContext === true ) return snippet;

		return builder.format( snippet, this.getNodeType( builder ), output );

	}

}

export default ArrayElementNode;
