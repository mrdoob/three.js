import TempNode from '../core/TempNode.js';
import { nodeProxyIntent } from '../tsl/TSLCore.js';
/**
 * This node represents an operation that reinterprets the bit representation of a value
 * in one type as a value in another type.
 *
 * @augments TempNode
 */
class BitcastNode extends TempNode {

	static get type() {

		return 'BitcastNode';

	}

	/**
	 * Constructs a new bitcast node.
	 *
	 * @param {Node} valueNode - The value to convert.
	 * @param {string} conversionType - The type to convert to.
	 */
	constructor( valueNode, conversionType ) {

		super();

		/**
		 * The data to bitcast to a new type.
		 *
		 * @type {Node}
		 */
		this.valueNode = valueNode;

		/**
		 * The type the value will be converted to.
		 *
		 * @type {string}
		 * @default null
		 */
		this.conversionType = conversionType;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isBitcastNode = true;

	}

	/**
	 * The node's type is defined by the conversion type.
	 *
	 * @return {string} The node type.
	 */
	getNodeType() {

		return this.conversionType;

	}


	generate( builder ) {

		const type = this.getNodeType( builder );
		const inputType = this.valueNode.getNodeType( builder );

		const params = [];

		params.push(
			this.valueNode.build( builder, inputType ),
		);

		return `bitcast<${ builder.getType( type ) }>( ${ params.join( ', ' ) } )`;


	}

}

export default BitcastNode;

/**
 * Reinterpret the bit representation of a value in one type as a value in another type.
 *
 * @tsl
 * @function
 * @param {Node | number} x - The parameter.
 * @param {string} y - The new type.
 * @returns {Node}
 */
export const bitcast = /*@__PURE__*/ nodeProxyIntent( BitcastNode ).setParameterLength( 2 );
