import {
	NumberUniform, Vector2Uniform, Vector3Uniform, Vector4Uniform,
	ColorUniform, Matrix3Uniform, Matrix4Uniform
} from '../Uniform.js';

/**
 * A special form of Number uniform binding type.
 * It's value is managed by a node object.
 *
 * @private
 * @augments NumberUniform
 */
class NumberNodeUniform extends NumberUniform {

	/**
	 * Constructs a new node-based Number uniform.
	 *
	 * @param {NodeUniform} nodeUniform - The node uniform.
	 */
	constructor( nodeUniform ) {

		super( nodeUniform.name, nodeUniform.value );

		/**
		 * The node uniform.
		 *
		 * @type {NodeUniform}
		 */
		this.nodeUniform = nodeUniform;

	}

	/**
	 * Overwritten to return the value of the node uniform.
	 *
	 * @return {Number} The value.
	 */
	getValue() {

		return this.nodeUniform.value;

	}

	/**
	 * Returns the node uniform data type.
	 *
	 * @return {String} The data type.
	 */
	getType() {

		return this.nodeUniform.type;

	}

}

/**
 * A special form of Vector2 uniform binding type.
 * It's value is managed by a node object.
 *
 * @private
 * @augments Vector2Uniform
 */
class Vector2NodeUniform extends Vector2Uniform {

	/**
	 * Constructs a new node-based Vector2 uniform.
	 *
	 * @param {NodeUniform} nodeUniform - The node uniform.
	 */
	constructor( nodeUniform ) {

		super( nodeUniform.name, nodeUniform.value );

		/**
		 * The node uniform.
		 *
		 * @type {NodeUniform}
		 */
		this.nodeUniform = nodeUniform;

	}

	/**
	 * Overwritten to return the value of the node uniform.
	 *
	 * @return {Vector2} The value.
	 */
	getValue() {

		return this.nodeUniform.value;

	}

	/**
	 * Returns the node uniform data type.
	 *
	 * @return {String} The data type.
	 */
	getType() {

		return this.nodeUniform.type;

	}

}

/**
 * A special form of Vector3 uniform binding type.
 * It's value is managed by a node object.
 *
 * @private
 * @augments Vector3Uniform
 */
class Vector3NodeUniform extends Vector3Uniform {

	/**
	 * Constructs a new node-based Vector3 uniform.
	 *
	 * @param {NodeUniform} nodeUniform - The node uniform.
	 */
	constructor( nodeUniform ) {

		super( nodeUniform.name, nodeUniform.value );

		/**
		 * The node uniform.
		 *
		 * @type {NodeUniform}
		 */
		this.nodeUniform = nodeUniform;

	}

	/**
	 * Overwritten to return the value of the node uniform.
	 *
	 * @return {Vector3} The value.
	 */
	getValue() {

		return this.nodeUniform.value;

	}

	/**
	 * Returns the node uniform data type.
	 *
	 * @return {String} The data type.
	 */
	getType() {

		return this.nodeUniform.type;

	}

}

/**
 * A special form of Vector4 uniform binding type.
 * It's value is managed by a node object.
 *
 * @private
 * @augments Vector4Uniform
 */
class Vector4NodeUniform extends Vector4Uniform {

	/**
	 * Constructs a new node-based Vector4 uniform.
	 *
	 * @param {NodeUniform} nodeUniform - The node uniform.
	 */
	constructor( nodeUniform ) {

		super( nodeUniform.name, nodeUniform.value );

		/**
		 * The node uniform.
		 *
		 * @type {NodeUniform}
		 */
		this.nodeUniform = nodeUniform;

	}

	/**
	 * Overwritten to return the value of the node uniform.
	 *
	 * @return {Vector4} The value.
	 */
	getValue() {

		return this.nodeUniform.value;

	}

	/**
	 * Returns the node uniform data type.
	 *
	 * @return {String} The data type.
	 */
	getType() {

		return this.nodeUniform.type;

	}

}

/**
 * A special form of Color uniform binding type.
 * It's value is managed by a node object.
 *
 * @private
 * @augments ColorUniform
 */
class ColorNodeUniform extends ColorUniform {

	/**
	 * Constructs a new node-based Color uniform.
	 *
	 * @param {NodeUniform} nodeUniform - The node uniform.
	 */
	constructor( nodeUniform ) {

		super( nodeUniform.name, nodeUniform.value );

		/**
		 * The node uniform.
		 *
		 * @type {NodeUniform}
		 */
		this.nodeUniform = nodeUniform;

	}

	/**
	 * Overwritten to return the value of the node uniform.
	 *
	 * @return {Color} The value.
	 */
	getValue() {

		return this.nodeUniform.value;

	}

	/**
	 * Returns the node uniform data type.
	 *
	 * @return {String} The data type.
	 */
	getType() {

		return this.nodeUniform.type;

	}

}

/**
 * A special form of Matrix3 uniform binding type.
 * It's value is managed by a node object.
 *
 * @private
 * @augments Matrix3Uniform
 */
class Matrix3NodeUniform extends Matrix3Uniform {

	/**
	 * Constructs a new node-based Matrix3 uniform.
	 *
	 * @param {NodeUniform} nodeUniform - The node uniform.
	 */
	constructor( nodeUniform ) {

		super( nodeUniform.name, nodeUniform.value );

		/**
		 * The node uniform.
		 *
		 * @type {NodeUniform}
		 */
		this.nodeUniform = nodeUniform;

	}

	/**
	 * Overwritten to return the value of the node uniform.
	 *
	 * @return {Matrix3} The value.
	 */
	getValue() {

		return this.nodeUniform.value;

	}

	/**
	 * Returns the node uniform data type.
	 *
	 * @return {String} The data type.
	 */
	getType() {

		return this.nodeUniform.type;

	}

}

/**
 * A special form of Matrix4 uniform binding type.
 * It's value is managed by a node object.
 *
 * @private
 * @augments Matrix4Uniform
 */
class Matrix4NodeUniform extends Matrix4Uniform {

	/**
	 * Constructs a new node-based Matrix4 uniform.
	 *
	 * @param {NodeUniform} nodeUniform - The node uniform.
	 */
	constructor( nodeUniform ) {

		super( nodeUniform.name, nodeUniform.value );

		/**
		 * The node uniform.
		 *
		 * @type {NodeUniform}
		 */
		this.nodeUniform = nodeUniform;

	}

	/**
	 * Overwritten to return the value of the node uniform.
	 *
	 * @return {Matrix4} The value.
	 */
	getValue() {

		return this.nodeUniform.value;

	}

	/**
	 * Returns the node uniform data type.
	 *
	 * @return {String} The data type.
	 */
	getType() {

		return this.nodeUniform.type;

	}

}

export {
	NumberNodeUniform, Vector2NodeUniform, Vector3NodeUniform, Vector4NodeUniform,
	ColorNodeUniform, Matrix3NodeUniform, Matrix4NodeUniform
};
