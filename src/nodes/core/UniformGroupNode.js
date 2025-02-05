import Node from './Node.js';

/**
 * This node can be used to group single instances of {@link UniformNode}
 * and manage them as a uniform buffer.
 *
 * In most cases, the predefined nodes `objectGroup`, `renderGroup` and `frameGroup`
 * will be used when defining the {@link UniformNode#groupNode} property.
 *
 * - `objectGroup`: Uniform buffer per object.
 * - `renderGroup`: Shared uniform buffer, updated once per render call.
 * - `frameGroup`: Shared uniform buffer, updated once per frame.
 *
 * @augments Node
 */
class UniformGroupNode extends Node {

	static get type() {

		return 'UniformGroupNode';

	}

	/**
	 * Constructs a new uniform group node.
	 *
	 * @param {string} name - The name of the uniform group node.
	 * @param {boolean} [shared=false] - Whether this uniform group node is shared or not.
	 * @param {number} [order=1] - Influences the internal sorting.
	 */
	constructor( name, shared = false, order = 1 ) {

		super( 'string' );

		/**
		 * The name of the uniform group node.
		 *
		 * @type {string}
		 */
		this.name = name;

		/**
		 * Whether this uniform group node is shared or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.shared = shared;

		/**
		 * Influences the internal sorting.
		 * TODO: Add details when this property should be changed.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.order = order;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isUniformGroup = true;

	}

	serialize( data ) {

		super.serialize( data );

		data.name = this.name;
		data.version = this.version;
		data.shared = this.shared;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.name = data.name;
		this.version = data.version;
		this.shared = data.shared;

	}

}

export default UniformGroupNode;

/**
 * TSL function for creating a uniform group node with the given name.
 *
 * @tsl
 * @function
 * @param {string} name - The name of the uniform group node.
 * @returns {UniformGroupNode}
 */
export const uniformGroup = ( name ) => new UniformGroupNode( name );

/**
 * TSL function for creating a shared uniform group node with the given name and order.
 *
 * @tsl
 * @function
 * @param {string} name - The name of the uniform group node.
 * @param {number} [order=0] - Influences the internal sorting.
 * @returns {UniformGroupNode}
 */
export const sharedUniformGroup = ( name, order = 0 ) => new UniformGroupNode( name, true, order );

/**
 * TSL object that represents a shared uniform group node which is updated once per frame.
 *
 * @tsl
 * @type {UniformGroupNode}
 */
export const frameGroup = /*@__PURE__*/ sharedUniformGroup( 'frame' );

/**
 * TSL object that represents a shared uniform group node which is updated once per render.
 *
 * @tsl
 * @type {UniformGroupNode}
 */
export const renderGroup = /*@__PURE__*/ sharedUniformGroup( 'render' );

/**
 * TSL object that represents a uniform group node which is updated once per object.
 *
 * @tsl
 * @type {UniformGroupNode}
 */
export const objectGroup = /*@__PURE__*/ uniformGroup( 'object' );
