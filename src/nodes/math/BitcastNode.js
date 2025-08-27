import TempNode from '../core/TempNode.js';
import { nodeProxy } from '../tsl/TSLCore.js';
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
	 * The input type is inferred from the node types of the input node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The input type.
	 */
	getInputType( builder ) {

		return this.valueNode.getNodeType( builder );

	}

	/**
	 * The node's type is defined by the conversion type.
	 *
	 * @return {string} The node type.
	 */
	getNodeType() {

		return this.conversionType;

	}


	setup( builder ) {

		return super.setup( builder );

	}


	generate( builder, output ) {

		const properties = builder.getNodeProperties( this );

		if ( properties.outputNode ) {

			return super.generate( builder, output );

		}

		const type = this.getNodeType( builder );
		const inputType = this.getInputType( builder );

		const params = [];

		params.push(
			this.valueNode.build( builder, inputType ),
		);

		return builder.format( `bitcast<${ builder.getType( type ) }>( ${ params.join( ', ' ) } )`, inputType, output );



	}

	serialize( data ) {

		super.serialize( data );

		data.method = this.method;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.method = data.method;

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
export const bitcast = /*@__PURE__*/ nodeProxy( BitcastNode ).setParameterLength( 2 );
