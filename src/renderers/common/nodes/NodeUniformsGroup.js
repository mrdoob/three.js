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
	 * @param {string} name - The group's name.
	 * @param {UniformGroupNode} groupNode - The uniform group node.
	 */
	constructor( name, groupNode ) {

		super( name );

		/**
		 * The group's ID.
		 *
		 * @type {number}
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
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isNodeUniformsGroup = true;

		/**
		 * The version of the uniform group node the uniforms have been updated for last.
		 * See {@link NodeManager#updateGroup}.
		 *
		 * @type {number}
		 * @default -1
		 */
		this.groupVersion = - 1;

	}

	/**
	 * Clones this uniforms group. The clone has not been updated yet.
	 *
	 * @return {NodeUniformsGroup} The cloned uniforms group.
	 */
	clone() {

		const clone = super.clone();

		clone.groupVersion = - 1;

		return clone;

	}

}

export default NodeUniformsGroup;
