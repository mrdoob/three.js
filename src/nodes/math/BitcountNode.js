import { addMethodChaining, Fn, nodeProxyIntent, uint } from '../tsl/TSLCore.js';
import { bitcast } from './BitcastNode.js';
import MathNode from './MathNode.js';

const registeredBitcountFunctions = {};

/**
 * This node represents an operation that reinterprets the bit representation of a value
 * in one type as a value in another type.
 *
 * @augments TempNode
 */
class BitcountNode extends MathNode {

	static get type() {

		return 'BitcountNode';

	}

	/**
	 * Constructs a new math node.
	 *
	 * @param {string} method - The method name.
	 * @param {Node} aNode - The first input.
	 */
	constructor( method, aNode ) {

		super( method, aNode );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isBitcountNode = true;

	}

	getNodeType( /*builder*/ ) {

		return 'uint';

	}

	/**
	 * Constructs a new math node.
	 *
	 * @param {NodeBuilder} builder - The method name.
	 * @return {?Node} The output node.
	 */
	setup( builder ) {

		const { method, aNode } = this;

		const { renderer } = builder;

		if ( renderer.backend.isWebGPUBackend ) {

			return super.setup( builder );

		}

		const inputType = this.getInputType( builder );
		const elementType = builder.getElementType( inputType );

		const typeLength = builder.getTypeLength( inputType );

		if ( method === BitcountNode.COUNT_LEADING_ZEROS ) {




		} else if ( method === BitcountNode.COUNT_TRAILING_ZEROS ) {



		} else if ( method === BitcountNode.COUNT_ONE_BITS ) {

			const bitcountBaseMethod = `bitcount_base_${elementType}`;

			let bitCountBaseFn = registeredBitcountFunctions[ bitcountBaseMethod ];

			if ( bitCountBaseFn === undefined ) {

				bitCountBaseFn = Fn( ( [ value ] ) => {

					const v = uint( 0.0 );

					if ( elementType === 'int' ) {

						v.assign( bitcast( value, 'uint' ) );

					} else {

						v.assign( value );

					}

					v.assign( v.sub( v.shiftRight( uint( 1 ) ).bitAnd( uint( 0x55555555 ) ) ) );
					v.assign( v.bitAnd( uint( 0x33333333 ) ).add( v.shiftRight( uint( 2 ) ).bitAnd( uint( 0x33333333 ) ) ) );

					return v.add( v.shiftRight( uint( 4 ) ) ).bitAnd( uint( 0xF0F0F0F ) ).mul( uint( 0x1010101 ) ).shiftRight( uint( 24 ) );

				} ).setLayout( {
					name: bitcountBaseMethod,
					type: 'uint',
					inputs: [
						{ name: 'value', type: elementType }
					]
				} );


				registeredBitcountFunctions[ bitcountBaseMethod ] = bitCountBaseFn;

			}

			const bitCountMethod = `bitcount_${inputType}`;

			let bitCountFn = registeredBitcountFunctions[ bitCountMethod ];

			if ( bitCountFn === undefined ) {

				bitCountFn = Fn( ( [ value ] ) => {

					const v = uint( 0.0 );

					if ( typeLength === 1 ) {

						v.addAssign( bitCountBaseFn( value ) );

					} else {

						const components = [ 'x', 'y', 'z', 'w' ];

						for ( let i = 0; i < typeLength; i ++ ) {

							const component = components[ i ];

							v.addAssign( bitCountBaseFn( value[ component ] ) );

						}

					}

					return v;

				} ).setLayout( {
					name: bitCountMethod,
					type: 'uint',
					inputs: [
						{ name: 'value', type: inputType }
					]
				} );

				registeredBitcountFunctions[ bitCountMethod ] = bitCountFn;


			}

			const methodFn = Fn( () => {

				return bitCountFn(
					aNode,
				);

			} );

			return methodFn();

		}

	}

}

export default BitcountNode;

BitcountNode.COUNT_TRAILING_ZEROS = 'countTrailingZeros';
BitcountNode.COUNT_LEADING_ZEROS = 'countLeadingZeros';
BitcountNode.COUNT_ONE_BITS = 'countOneBits';

/**
 * Finds the number of consecutive 0 bits from the least significant bit of the input value,
 * which is also the index of the least significant bit of the input value.
 *
 * Can only be used with {@link WebGPURenderer} and a WebGPU backend.
 *
 * @tsl
 * @function
 * @param {Node | number} x - The input value.
 * @returns {Node}
 */
export const countTrailingZeros = /*@__PURE__*/ nodeProxyIntent( BitcountNode, BitcountNode.COUNT_TRAILING_ZEROS ).setParameterLength( 1 );

/**
 * Finds the number of consecutive 0 bits starting from the most significant bit of the input value.
 *
 * Can only be used with {@link WebGPURenderer} and a WebGPU backend.
 *
 * @tsl
 * @function
 * @param {Node | number} x - The input value.
 * @returns {Node}
 */
export const countLeadingZeros = /*@__PURE__*/ nodeProxyIntent( BitcountNode, BitcountNode.COUNT_LEADING_ZEROS ).setParameterLength( 1 );

/**
 * Finds the number of '1' bits set in the input value
 *
 * Can only be used with {@link WebGPURenderer} and a WebGPU backend.
 *
 * @tsl
 * @function
 * @returns {Node}
 */
export const countOneBits = /*@__PURE__*/ nodeProxyIntent( BitcountNode, BitcountNode.COUNT_ONE_BITS ).setParameterLength( 1 );

// GLSL alias function

export const findLSB = countTrailingZeros;
export const findMSB = countLeadingZeros;
export const bitCount = countOneBits;

addMethodChaining( 'countTrailingZeros', countTrailingZeros );
addMethodChaining( 'countLeadingZeros', countLeadingZeros );
addMethodChaining( 'countOneBits', countOneBits );
