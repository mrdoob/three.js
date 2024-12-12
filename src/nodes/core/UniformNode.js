import InputNode from './InputNode.js';
import { objectGroup } from './UniformGroupNode.js';
import { nodeObject, getConstNodeType } from '../tsl/TSLCore.js';

/** @module UniformNode **/

/**
 * Class for representing a uniform.
 *
 * @augments InputNode
 */
class UniformNode extends InputNode {

	static get type() {

		return 'UniformNode';

	}

	/**
	 * Constructs a new uniform node.
	 *
	 * @param {Any} value - The value of this node. Usually a JS primitive or three.js object (vector, matrix, color, texture).
	 * @param {String?} nodeType - The node type. If no explicit type is defined, the node tries to derive the type from its value.
	 */
	constructor( value, nodeType = null ) {

		super( value, nodeType );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isUniformNode = true;

		/**
		 * The name or label of the uniform.
		 *
		 * @type {String}
		 * @default ''
		 */
		this.name = '';

		/**
		 * The uniform group of this uniform. By default, uniforms are
		 * managed per object but they might belong to a shared group
		 * which is updated per frame or render call.
		 *
		 * @type {UniformGroupNode}
		 */
		this.groupNode = objectGroup;

	}

	/**
	 * Sets the {@link UniformNode#name} property.
	 *
	 * @param {String} name - The name of the uniform.
	 * @return {UniformNode} A reference to this node.
	 */
	label( name ) {

		this.name = name;

		return this;

	}

	/**
	 * Sets the {@link UniformNode#groupNode} property.
	 *
	 * @param {UniformGroupNode} group - The uniform group.
	 * @return {UniformNode} A reference to this node.
	 */
	setGroup( group ) {

		this.groupNode = group;

		return this;

	}

	/**
	 * Returns the {@link UniformNode#groupNode}.
	 *
	 * @return {UniformGroupNode} The uniform group.
	 */
	getGroup() {

		return this.groupNode;

	}

	/**
	 * By default, this method returns the result of {@link Node#getHash} but derived
	 * classes might overwrite this method with a different implementation.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The uniform hash.
	 */
	getUniformHash( builder ) {

		return this.getHash( builder );

	}

	onUpdate( callback, updateType ) {

		const self = this.getSelf();

		callback = callback.bind( self );

		return super.onUpdate( ( frame ) => {

			const value = callback( frame, self );

			if ( value !== undefined ) {

				this.value = value;

			}

	 	}, updateType );

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );

		const hash = this.getUniformHash( builder );

		let sharedNode = builder.getNodeFromHash( hash );

		if ( sharedNode === undefined ) {

			builder.setHashNode( this, hash );

			sharedNode = this;

		}

		const sharedNodeType = sharedNode.getInputType( builder );

		const nodeUniform = builder.getUniformFromNode( sharedNode, sharedNodeType, builder.shaderStage, this.name || builder.context.label );
		const propertyName = builder.getPropertyName( nodeUniform );

		if ( builder.context.label !== undefined ) delete builder.context.label;

		return builder.format( propertyName, type, output );

	}

}

export default UniformNode;

/**
 * TSL function for creating a uniform node.
 *
 * @function
 * @param {Any} arg1 - The value of this node. Usually a JS primitive or three.js object (vector, matrix, color, texture).
 * @param {String?} arg2 - The node type. If no explicit type is defined, the node tries to derive the type from its value.
 * @returns {UniformNode}
 */
export const uniform = ( arg1, arg2 ) => {

	const nodeType = getConstNodeType( arg2 || arg1 );

	// @TODO: get ConstNode from .traverse() in the future
	const value = ( arg1 && arg1.isNode === true ) ? ( arg1.node && arg1.node.value ) || arg1.value : arg1;

	return nodeObject( new UniformNode( value, nodeType ) );

};
