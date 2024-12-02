/**
 * {@link NodeBuilder} is going to create instances of this class during the build process
 * of nodes. They represent the final shader uniforms that are going to be generated
 * by the builder. A dictionary of node uniforms is maintained in {@link NodeBuilder#uniforms}
 * for this purpose.
 */
class NodeUniform {

	/**
	 * Constructs a new node uniform.
	 *
	 * @param {String} name - The name of the uniform.
	 * @param {String} type - The type of the uniform.
	 * @param {UniformNode} node - An reference to the node.
	 */
	constructor( name, type, node ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isNodeUniform = true;

		/**
		 * The name of the uniform.
		 *
		 * @type {String}
		 */
		this.name = name;

		/**
		 * The type of the uniform.
		 *
		 * @type {String}
		 */
		this.type = type;

		/**
		 * An reference to the node.
		 *
		 * @type {UniformNode}
		 */
		this.node = node.getSelf();

	}

	/**
	 * The value of the uniform node.
	 *
	 * @type {Any}
	 */
	get value() {

		return this.node.value;

	}

	set value( val ) {

		this.node.value = val;

	}

	/**
	 * The id of the uniform node.
	 *
	 * @type {Number}
	 */
	get id() {

		return this.node.id;

	}

	/**
	 * The uniform node's group.
	 *
	 * @type {UniformGroupNode}
	 */
	get groupNode() {

		return this.node.groupNode;

	}

}

export default NodeUniform;
