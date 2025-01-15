import Node from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { texture } from './TextureNode.js';
import { cubeTexture } from './CubeTextureNode.js';
import { buffer } from './BufferNode.js';
import { nodeObject } from '../tsl/TSLBase.js';
import { uniformArray } from './UniformArrayNode.js';
import ArrayElementNode from '../utils/ArrayElementNode.js';

// TODO: Avoid duplicated code and ues only ReferenceBaseNode or ReferenceNode

/** @module ReferenceNode **/

/**
 * This class is only relevant if the referenced property is array-like.
 * In this case, `ReferenceElementNode` allows to refer to a specific
 * element inside the data structure via an index.
 *
 * @augments ArrayElementNode
 */
class ReferenceElementNode extends ArrayElementNode {

	static get type() {

		return 'ReferenceElementNode';

	}

	/**
	 * Constructs a new reference element node.
	 *
	 * @param {ReferenceNode?} referenceNode - The reference node.
	 * @param {Node} indexNode - The index node that defines the element access.
	 */
	constructor( referenceNode, indexNode ) {

		super( referenceNode, indexNode );

		/**
		 * Similar to {@link module:ReferenceNode~ReferenceNode#reference}, an additional
		 * property references to the current node.
		 *
		 * @type {ReferenceNode?}
		 * @default null
		 */
		this.referenceNode = referenceNode;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isReferenceElementNode = true;

	}

	/**
	 * This method is overwritten since the node type is inferred from
	 * the uniform type of the reference node.
	 *
	 * @return {String} The node type.
	 */
	getNodeType() {

		return this.referenceNode.uniformType;

	}

	generate( builder ) {

		const snippet = super.generate( builder );
		const arrayType = this.referenceNode.getNodeType();
		const elementType = this.getNodeType();

		return builder.format( snippet, arrayType, elementType );

	}

}

/**
 * This type of node establishes a reference to a property of another object.
 * In this way, the value of the node is automatically linked to the value of
 * referenced object. Reference nodes internally represent the linked value
 * as a uniform.
 *
 * @augments Node
 */
class ReferenceNode extends Node {

	static get type() {

		return 'ReferenceNode';

	}

	/**
	 * Constructs a new reference node.
	 *
	 * @param {String} property - The name of the property the node refers to.
	 * @param {String} uniformType - The uniform type that should be used to represent the property value.
	 * @param {Object?} [object=null] - The object the property belongs to.
	 * @param {Number?} [count=null] - When the linked property is an array-like, this parameter defines its length.
	 */
	constructor( property, uniformType, object = null, count = null ) {

		super();

		/**
		 * The name of the property the node refers to.
		 *
		 * @type {String}
		 */
		this.property = property;

		/**
		 * The uniform type that should be used to represent the property value.
		 *
		 * @type {String}
		 */
		this.uniformType = uniformType;

		/**
		 * The object the property belongs to.
		 *
		 * @type {Object?}
		 * @default null
		 */
		this.object = object;

		/**
		 * When the linked property is an array, this parameter defines its length.
		 *
		 * @type {Number?}
		 * @default null
		 */
		this.count = count;

		/**
		 * The property name might have dots so nested properties can be referred.
		 * The hierarchy of the names is stored inside this array.
		 *
		 * @type {Array<String>}
		 */
		this.properties = property.split( '.' );

		/**
		 * Points to the current referred object. This property exists next to {@link module:ReferenceNode~ReferenceNode#object}
		 * since the final reference might be updated from calling code.
		 *
		 * @type {Object?}
		 * @default null
		 */
		this.reference = object;

		/**
		 * The uniform node that holds the value of the reference node.
		 *
		 * @type {UniformNode}
		 * @default null
		 */
		this.node = null;

		/**
		 * The uniform group of the internal uniform.
		 *
		 * @type {UniformGroupNode}
		 * @default null
		 */
		this.group = null;

		/**
		 * An optional label of the internal uniform node.
		 *
		 * @type {String?}
		 * @default null
		 */
		this.name = null;

		/**
		 * Overwritten since reference nodes are updated per object.
		 *
		 * @type {String}
		 * @default 'object'
		 */
		this.updateType = NodeUpdateType.OBJECT;

	}

	/**
	 * When the referred property is array-like, this method can be used
	 * to access elements via an index node.
	 *
	 * @param {IndexNode} indexNode - indexNode.
	 * @return {ReferenceElementNode} A reference to an element.
	 */
	element( indexNode ) {

		return nodeObject( new ReferenceElementNode( this, nodeObject( indexNode ) ) );

	}

	/**
	 * Sets the uniform group for this reference node.
	 *
	 * @param {UniformGroupNode} group - The uniform group to set.
	 * @return {ReferenceNode} A reference to this node.
	 */
	setGroup( group ) {

		this.group = group;

		return this;

	}

	/**
	 * Sets the label for the internal uniform.
	 *
	 * @param {String} name - The label to set.
	 * @return {ReferenceNode} A reference to this node.
	 */
	label( name ) {

		this.name = name;

		return this;

	}

	/**
	 * Sets the node type which automatically defines the internal
	 * uniform type.
	 *
	 * @param {String} uniformType - The type to set.
	 */
	setNodeType( uniformType ) {

		let node = null;

		if ( this.count !== null ) {

			node = buffer( null, uniformType, this.count );

		} else if ( Array.isArray( this.getValueFromReference() ) ) {

			node = uniformArray( null, uniformType );

		} else if ( uniformType === 'texture' ) {

			node = texture( null );

		} else if ( uniformType === 'cubeTexture' ) {

			node = cubeTexture( null );

		} else {

			node = uniform( null, uniformType );

		}

		if ( this.group !== null ) {

			node.setGroup( this.group );

		}

		if ( this.name !== null ) node.label( this.name );

		this.node = node.getSelf();

	}

	/**
	 * This method is overwritten since the node type is inferred from
	 * the type of the reference node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The node type.
	 */
	getNodeType( builder ) {

		if ( this.node === null ) {

			this.updateReference( builder );
			this.updateValue();

		}

		return this.node.getNodeType( builder );

	}

	/**
	 * Returns the property value from the given referred object.
	 *
	 * @param {Object} [object=this.reference] - The object to retrieve the property value from.
	 * @return {Any} The value.
	 */
	getValueFromReference( object = this.reference ) {

		const { properties } = this;

		let value = object[ properties[ 0 ] ];

		for ( let i = 1; i < properties.length; i ++ ) {

			value = value[ properties[ i ] ];

		}

		return value;

	}

	/**
	 * Allows to update the reference based on the given state. The state is only
	 * evaluated {@link module:ReferenceNode~ReferenceNode#object} is not set.
	 *
	 * @param {(NodeFrame|NodeBuilder)} state - The current state.
	 * @return {Object} The updated reference.
	 */
	updateReference( state ) {

		this.reference = this.object !== null ? this.object : state.object;

		return this.reference;

	}

	/**
	 * The output of the reference node is the internal uniform node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {UniformNode} The output node.
	 */
	setup( /* builder */ ) {

		this.updateValue();

		return this.node;

	}

	/**
	 * Overwritten to to update the internal uniform value.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	update( /*frame*/ ) {

		this.updateValue();

	}

	/**
	 * Retrieves the value from the referred object property and uses it
	 * to updated the internal uniform.
	 */
	updateValue() {

		if ( this.node === null ) this.setNodeType( this.uniformType );

		const value = this.getValueFromReference();

		if ( Array.isArray( value ) ) {

			this.node.array = value;

		} else {

			this.node.value = value;

		}

	}

}

export default ReferenceNode;

/**
 * TSL function for creating a reference node.
 *
 * @function
 * @param {String} name - The name of the property the node refers to.
 * @param {String} type - The uniform type that should be used to represent the property value.
 * @param {Object} object - The object the property belongs to.
 * @returns {ReferenceNode}
 */
export const reference = ( name, type, object ) => nodeObject( new ReferenceNode( name, type, object ) );

/**
 * TSL function for creating a reference node. Use this function if you want need a reference
 * to an array-like property that should be represented as a uniform buffer.
 *
 * @function
 * @param {String} name - The name of the property the node refers to.
 * @param {String} type - The uniform type that should be used to represent the property value.
 * @param {Number} count - The number of value inside the array-like object.
 * @param {Object} object - An array-like object the property belongs to.
 * @returns {ReferenceNode}
 */
export const referenceBuffer = ( name, type, count, object ) => nodeObject( new ReferenceNode( name, type, object, count ) );
