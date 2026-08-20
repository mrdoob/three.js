import TempNode from '../core/TempNode.js';
import { nodeProxyIntent } from '../tsl/TSLCore.js';

/**
 * This node represents an operation that unpacks values from a 32-bit unsigned integer, reinterpreting the results as a floating-point vector
 *
 * @augments TempNode
 */
class UnpackFloatNode extends TempNode {

	static get type() {

		return 'UnpackFloatNode';

	}

	/**
	 *
	 * @param {'snorm' | 'unorm' | 'float16'} encoding - The numeric encoding that describes how the integer values are mapped to the float range
	 * @param {Node} uintNode - The uint node to be unpacked
	 */
	constructor( encoding, uintNode ) {

		super();

		/**
		 * The unsigned integer to be unpacked.
		 *
		 * @type {Node}
		 */
		this.uintNode = uintNode;

		/**
		 * The numeric encoding.
		 *
		 * @type {string}
		 */
		this.encoding = encoding;

		/**
		 * The component layout of the packed integer.
		 *
		 * @type {'2x16' | '4x8'}
		 * @default '2x16'
		 */
		this.layout = '2x16';

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isUnpackFloatNode = true;

	}

	generateNodeType() {

		return this.layout === '4x8' ? 'vec4' : 'vec2';

	}

	generate( builder ) {

		const inputType = this.uintNode.getNodeType( builder );
		return `${ builder.getFloatUnpackingMethod( this.encoding, this.layout ) }(${ this.uintNode.build( builder, inputType )})`;

	}

}

export default UnpackFloatNode;

/**
 * Unpacks a 32-bit unsigned integer into two 16-bit values, interpreted as normalized signed integers. Returns a vec2 with both values.
 *
 * @tsl
 * @function
 * @param {Node<uint>} value - The unsigned integer to be unpacked
 * @returns {Node}
 */
export const unpackSnorm2x16 = /*@__PURE__*/ nodeProxyIntent( UnpackFloatNode, 'snorm' ).setParameterLength( 1 );

/**
 * Unpacks a 32-bit unsigned integer into two 16-bit values, interpreted as normalized unsigned integers. Returns a vec2 with both values.
 *
 * @tsl
 * @function
 * @param {Node<uint>} value - The unsigned integer to be unpacked
 * @returns {Node}
 */
export const unpackUnorm2x16 = /*@__PURE__*/ nodeProxyIntent( UnpackFloatNode, 'unorm' ).setParameterLength( 1 );

/**
 * Unpacks a 32-bit unsigned integer into two 16-bit values, interpreted as 16-bit floating-point numbers. Returns a vec2 with both values.
 *
 * @tsl
 * @function
 * @param {Node<uint>} value - The unsigned integer to be unpacked
 * @returns {Node}
 */
export const unpackHalf2x16 = /*@__PURE__*/ nodeProxyIntent( UnpackFloatNode, 'float16' ).setParameterLength( 1 );

/**
 * Unpacks a 32-bit unsigned integer into four 8-bit values, interpreted as normalized signed integers. Returns a vec4 with all values.
 *
 * @tsl
 * @function
 * @param {Node<uint>} value - The unsigned integer to be unpacked
 * @returns {Node}
 */
export const unpackSnorm4x8 = /*@__PURE__*/ nodeProxyIntent( UnpackFloatNode, 'snorm', null, { layout: '4x8' } ).setParameterLength( 1 );

/**
 * Unpacks a 32-bit unsigned integer into four 8-bit values, interpreted as normalized unsigned integers. Returns a vec4 with all values.
 *
 * @tsl
 * @function
 * @param {Node<uint>} value - The unsigned integer to be unpacked
 * @returns {Node}
 */
export const unpackUnorm4x8 = /*@__PURE__*/ nodeProxyIntent( UnpackFloatNode, 'unorm', null, { layout: '4x8' } ).setParameterLength( 1 );
