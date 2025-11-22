import TempNode from '../core/TempNode.js';
import { nodeProxyIntent } from '../tsl/TSLCore.js';

/**
 * This node represents an operation that packs floating-point values of a vector into an unsigned 32-bit integer
 *
 * @augments TempNode
 */
class PackFloatNode extends TempNode {

	static get type() {

		return 'PackFloatNode';

	}

	/**
	 *
	 * @param {'snorm' | 'unorm' | 'float16'} encoding - The numeric encoding that describes how the float values are mapped to the integer range.
	 * @param {Node} vectorNode - The vector node to be packed
	 */
	constructor( encoding, vectorNode ) {

		super();

		/**
		 * The vector to be packed.
		 *
		 * @type {Node}
		 */
		this.vectorNode = vectorNode;

		/**
		 * The numeric encoding.
		 *
		 * @type {string}
		 */
		this.encoding = encoding;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isPackFloatNode = true;

	}

	getNodeType() {

		return 'uint';

	}

	generate( builder ) {

		const inputType = this.vectorNode.getNodeType( builder );
		return `${ builder.getFloatPackingMethod( this.encoding ) }(${ this.vectorNode.build( builder, inputType )})`;

	}

}

export default PackFloatNode;

/**
 * Converts each component of the normalized float to 16-bit integer values. The results are packed into a single unsigned integer.
 * round(clamp(c, -1, +1) * 32767.0)
 *
 * @tsl
 * @function
 * @param {Node<vec2>} value - The 2-component vector to be packed
 * @returns {Node}
 */
export const packSnorm2x16 = /*@__PURE__*/ nodeProxyIntent( PackFloatNode, 'snorm' ).setParameterLength( 1 );

/**
 * Converts each component of the normalized float to 16-bit integer values. The results are packed into a single unsigned integer.
 * round(clamp(c, 0, +1) * 65535.0)
 *
 * @tsl
 * @function
 * @param {Node<vec2>} value - The 2-component vector to be packed
 * @returns {Node}
 */
export const packUnorm2x16 = /*@__PURE__*/ nodeProxyIntent( PackFloatNode, 'unorm' ).setParameterLength( 1 );

/**
 * Converts each component of the vec2 to 16-bit floating-point values. The results are packed into a single unsigned integer.
 *
 * @tsl
 * @function
 * @param {Node<vec2>} value - The 2-component vector to be packed
 * @returns {Node}
 */
export const packHalf2x16 = /*@__PURE__*/ nodeProxyIntent( PackFloatNode, 'float16' ).setParameterLength( 1 );
