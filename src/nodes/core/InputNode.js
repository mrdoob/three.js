import Node from './Node.js';
import { getValueType, getValueFromType, arrayBufferToBase64 } from './NodeUtils.js';

/**
 * Base class for representing data input nodes.
 *
 * @augments Node
 */
class InputNode extends Node {

	static get type() {

		return 'InputNode';

	}

	/**
	 * Constructs a new input node.
	 *
	 * @param {any} value - The value of this node. This can be any JS primitive, functions, array buffers or even three.js objects (vector, matrices, colors).
	 * @param {?string} nodeType - The node type. If no explicit type is defined, the node tries to derive the type from its value.
	 */
	constructor( value, nodeType = null ) {

		super( nodeType );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isInputNode = true;

		/**
		 * The value of this node. This can be any JS primitive, functions, array buffers or even three.js objects (vector, matrices, colors).
		 *
		 * @type {any}
		 */
		this.value = value;

		/**
		 * The precision of the value in the shader.
		 *
		 * @type {?('low'|'medium'|'high')}
		 * @default null
		 */
		this.precision = null;

	}

	getNodeType( /*builder*/ ) {

		if ( this.nodeType === null ) {

			return getValueType( this.value );

		}

		return this.nodeType;

	}

	/**
	 * Returns the input type of the node which is by default the node type. Derived modules
	 * might overwrite this method and use a fixed type or compute one analytically.
	 *
	 * A typical example for different input and node types are textures. The input type of a
	 * normal RGBA texture is `texture` whereas its node type is `vec4`.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The input type.
	 */
	getInputType( builder ) {

		return this.getNodeType( builder );

	}

	/**
	 * Sets the precision to the given value. The method can be
	 * overwritten in derived classes if the final precision must be computed
	 * analytically.
	 *
	 * @param {('low'|'medium'|'high')} precision - The precision of the input value in the shader.
	 * @return {InputNode} A reference to this node.
	 */
	setPrecision( precision ) {

		this.precision = precision;

		return this;

	}

	serialize( data ) {

		super.serialize( data );

		data.value = this.value;

		if ( this.value && this.value.toArray ) data.value = this.value.toArray();

		data.valueType = getValueType( this.value );
		data.nodeType = this.nodeType;

		if ( data.valueType === 'ArrayBuffer' ) data.value = arrayBufferToBase64( data.value );

		data.precision = this.precision;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.nodeType = data.nodeType;
		this.value = Array.isArray( data.value ) ? getValueFromType( data.valueType, ...data.value ) : data.value;

		this.precision = data.precision || null;

		if ( this.value && this.value.fromArray ) this.value = this.value.fromArray( data.value );

	}

	generate( /*builder, output*/ ) {

		console.warn( 'Abstract function.' );

	}

}

export default InputNode;
