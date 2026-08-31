import TempNode from '../core/TempNode.js';
import { nodeProxyIntent } from '../tsl/TSLCore.js';

/**
 * Represents one of the built-in functions provided by WGSL's
 * `packed_4x8_integer_dot_product` language extension.
 *
 * @augments TempNode
 */
class Packed4x8IntegerNode extends TempNode {

	static get type() {

		return 'Packed4x8IntegerNode';

	}

	/**
	 * Constructs a packed 4x8 integer function node.
	 *
	 * @param {string} method - The WGSL built-in function name.
	 * @param {Node} aNode - The first argument.
	 * @param {?Node} [bNode=null] - The optional second argument.
	 */
	constructor( method, aNode, bNode = null ) {

		super();

		/**
		 * The WGSL built-in function name.
		 *
		 * @type {string}
		 */
		this.method = method;

		/**
		 * The first argument.
		 *
		 * @type {Node}
		 */
		this.aNode = aNode;

		/**
		 * The optional second argument.
		 *
		 * @type {?Node}
		 */
		this.bNode = bNode;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isPacked4x8IntegerNode = true;

	}

	getInputType() {

		const method = this.method;

		if ( method === Packed4x8IntegerNode.PACK4X_I8 || method === Packed4x8IntegerNode.PACK4X_I8_CLAMP ) {

			return 'ivec4';

		} else if ( method === Packed4x8IntegerNode.PACK4X_U8 || method === Packed4x8IntegerNode.PACK4X_U8_CLAMP ) {

			return 'uvec4';

		}

		return 'uint';

	}

	generateNodeType() {

		const method = this.method;

		if ( method === Packed4x8IntegerNode.DOT4_I8_PACKED ) {

			return 'int';

		} else if ( method === Packed4x8IntegerNode.UNPACK4X_I8 ) {

			return 'ivec4';

		} else if ( method === Packed4x8IntegerNode.UNPACK4X_U8 ) {

			return 'uvec4';

		}

		return 'uint';

	}

	generate( builder, output ) {

		if ( builder.renderer.backend.isWebGPUBackend !== true ) {

			throw new Error( `THREE.TSL: "${this.method}" is only supported by the WebGPU backend.` );

		}

		const type = this.getNodeType( builder );
		const inputType = this.getInputType();
		const params = [ this.aNode.build( builder, inputType ) ];

		if ( this.bNode !== null ) params.push( this.bNode.build( builder, inputType ) );

		return builder.format( `${this.method}( ${params.join( ', ' )} )`, type, output );

	}

	serialize( data ) {

		super.serialize( data );

		data.method = this.method;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.method = data.method;

	}

	static get DOT4_U8_PACKED() {

		return 'dot4U8Packed';

	}

	static get DOT4_I8_PACKED() {

		return 'dot4I8Packed';

	}

	static get PACK4X_I8() {

		return 'pack4xI8';

	}

	static get PACK4X_U8() {

		return 'pack4xU8';

	}

	static get PACK4X_I8_CLAMP() {

		return 'pack4xI8Clamp';

	}

	static get PACK4X_U8_CLAMP() {

		return 'pack4xU8Clamp';

	}

	static get UNPACK4X_I8() {

		return 'unpack4xI8';

	}

	static get UNPACK4X_U8() {

		return 'unpack4xU8';

	}

}

export default Packed4x8IntegerNode;

/**
 * Computes the dot product of four unsigned 8-bit integer components packed
 * into each input.
 *
 * @tsl
 * @function
 * @param {Node<uint>} a - The first packed unsigned integer vector.
 * @param {Node<uint>} b - The second packed unsigned integer vector.
 * @returns {Node<uint>} The dot product.
 */
export const dot4U8Packed = /*@__PURE__*/ nodeProxyIntent( Packed4x8IntegerNode, Packed4x8IntegerNode.DOT4_U8_PACKED ).setParameterLength( 2 );

/**
 * Computes the dot product of four signed 8-bit integer components packed
 * into each input.
 *
 * @tsl
 * @function
 * @param {Node<uint>} a - The first packed signed integer vector.
 * @param {Node<uint>} b - The second packed signed integer vector.
 * @returns {Node<int>} The dot product.
 */
export const dot4I8Packed = /*@__PURE__*/ nodeProxyIntent( Packed4x8IntegerNode, Packed4x8IntegerNode.DOT4_I8_PACKED ).setParameterLength( 2 );

/**
 * Packs the least significant 8 bits of four signed integers into a `uint`.
 *
 * @tsl
 * @function
 * @param {Node<ivec4>} value - The signed integer vector to pack.
 * @returns {Node<uint>} The packed value.
 */
export const pack4xI8 = /*@__PURE__*/ nodeProxyIntent( Packed4x8IntegerNode, Packed4x8IntegerNode.PACK4X_I8 ).setParameterLength( 1 );

/**
 * Packs the least significant 8 bits of four unsigned integers into a `uint`.
 *
 * @tsl
 * @function
 * @param {Node<uvec4>} value - The unsigned integer vector to pack.
 * @returns {Node<uint>} The packed value.
 */
export const pack4xU8 = /*@__PURE__*/ nodeProxyIntent( Packed4x8IntegerNode, Packed4x8IntegerNode.PACK4X_U8 ).setParameterLength( 1 );

/**
 * Clamps four signed integers to the signed 8-bit range and packs them into a
 * `uint`.
 *
 * @tsl
 * @function
 * @param {Node<ivec4>} value - The signed integer vector to clamp and pack.
 * @returns {Node<uint>} The packed value.
 */
export const pack4xI8Clamp = /*@__PURE__*/ nodeProxyIntent( Packed4x8IntegerNode, Packed4x8IntegerNode.PACK4X_I8_CLAMP ).setParameterLength( 1 );

/**
 * Clamps four unsigned integers to the unsigned 8-bit range and packs them
 * into a `uint`.
 *
 * @tsl
 * @function
 * @param {Node<uvec4>} value - The unsigned integer vector to clamp and pack.
 * @returns {Node<uint>} The packed value.
 */
export const pack4xU8Clamp = /*@__PURE__*/ nodeProxyIntent( Packed4x8IntegerNode, Packed4x8IntegerNode.PACK4X_U8_CLAMP ).setParameterLength( 1 );

/**
 * Unpacks a `uint` into four sign-extended signed 8-bit integer components.
 *
 * @tsl
 * @function
 * @param {Node<uint>} value - The packed value.
 * @returns {Node<ivec4>} The unpacked signed integer vector.
 */
export const unpack4xI8 = /*@__PURE__*/ nodeProxyIntent( Packed4x8IntegerNode, Packed4x8IntegerNode.UNPACK4X_I8 ).setParameterLength( 1 );

/**
 * Unpacks a `uint` into four zero-extended unsigned 8-bit integer components.
 *
 * @tsl
 * @function
 * @param {Node<uint>} value - The packed value.
 * @returns {Node<uvec4>} The unpacked unsigned integer vector.
 */
export const unpack4xU8 = /*@__PURE__*/ nodeProxyIntent( Packed4x8IntegerNode, Packed4x8IntegerNode.UNPACK4X_U8 ).setParameterLength( 1 );
