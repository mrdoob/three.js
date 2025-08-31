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
	 * @param {?string} [inputType = null] - The expected input data type of the bitcast operation.
	 */
	constructor( valueNode, conversionType, inputType = null ) {

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
		 */
		this.conversionType = conversionType;


		/**
		 * The expected input data type of the bitcast operation.
		 *
		 *
		 * @type {string}
		 * @default null
		 */
		this.inputType = inputType;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isBitcastNode = true;

	}

	getNodeType( builder ) {

		// GLSL aliasing
		if ( this.inputType !== null ) {

			const valueType = this.valueNode.getNodeType( builder );
			const valueLength = builder.getTypeLength( valueType );

			return builder.getTypeFromLength( valueLength, this.conversionType );

		}

		return this.conversionType;

	}


	generate( builder ) {

		const type = this.getNodeType( builder );
		let inputType = '';

		if ( this.inputType !== null ) {

			const valueType = this.valueNode.getNodeType( builder );
			const valueTypeLength = builder.getTypeLength( valueType );

			inputType = valueTypeLength === 1 ? this.inputType : builder.changeComponentType( valueType, this.inputType );

		} else {

			inputType = this.valueNode.getNodeType( builder );

		}

		return `${ builder.getBitcastMethod( type, inputType ) }( ${ this.valueNode.build( builder, inputType ) } )`;


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

export const floatBitsToInt = ( value ) => new BitcastNode( value, 'int', 'float' );
export const floatBitsToUint = ( value ) => new BitcastNode( value, 'uint', 'float' );
export const intBitsToFloat = ( value ) => new BitcastNode( value, 'float', 'int' );
export const uintBitsToFloat = ( value ) => new BitcastNode( value, 'float', 'uint' );
