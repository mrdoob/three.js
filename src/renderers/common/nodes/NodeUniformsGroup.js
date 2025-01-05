import UniformsGroup from '../UniformsGroup.js';

let _id = 0;

/**
 * A special form of uniforms group that represents
 * the individual uniforms as node-based uniforms.
 *
 * @private
 * @augments UniformsGroup
 */
class NodeUniformsGroup extends UniformsGroup {

	/**
	 * Constructs a new node-based uniforms group.
	 *
	 * @param {String} name - The group's name.
	 * @param {UniformGroupNode} groupNode - The uniform group node.
	 */
	constructor( name, groupNode ) {

		super( name );

		/**
		 * The group's ID.
		 *
		 * @type {Number}
		 */
		this.id = _id ++;

		/**
		 * The uniform group node.
		 *
		 * @type {UniformGroupNode}
		 */
		this.groupNode = groupNode;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isNodeUniformsGroup = true;

	}

}

export default NodeUniformsGroup;
