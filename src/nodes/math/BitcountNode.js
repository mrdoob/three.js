import { addMethodChaining, float, Fn, If, nodeProxyIntent, uint } from '../tsl/TSLCore.js';
import { bitcast, floatBitsToUint } from './BitcastNode.js';
import MathNode, { negate } from './MathNode.js';

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
	 * @param {'countTrailingZeros'|'countLeadingZeros'|'countOneBits'} method - The method name.
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
	 * Casts the input value of the function to an integer if necessary.
	 *
	 * @param {Node<uint>|Node<int>} inputNode - The input value.
	 * @param {Node<uint>} outputNode - The output value.
	 * @param {string} elementType - The type of the input value.
	 */
	_resolveElementType( inputNode, outputNode, elementType ) {

		if ( elementType === 'int' ) {

			outputNode.assign( bitcast( inputNode, 'uint' ) );

		} else {

			outputNode.assign( inputNode );

		}

	}

	_createTrailingZerosBaseLayout( method, elementType ) {

		const fnDef = Fn( ( [ value ] ) => {

			const v = uint( 0.0 );

			this._resolveElementType( value, v, elementType );

			const f = float( v.bitAnd( negate( v ) ) );
			const uintBits = floatBitsToUint( f );

			return ( uintBits.shiftRight( 23 ) ).sub( 127 );

		} ).setLayout( {
			name: method,
			type: 'uint',
			inputs: [
				{ name: 'value', type: elementType }
			]
		} );

		return fnDef;

	}

	_createTrailingZerosMainLayout( method, inputType, typeLength, baseFn ) {

		const fnDef = Fn( ( [ value ] ) => {

			const v = uint( 0.0 );

			if ( typeLength === 1 ) {

				v.addAssign( baseFn( value ) );

			} else {

				const components = [ 'x', 'y', 'z', 'w' ];
				for ( let i = 0; i < typeLength; i ++ ) {

					const component = components[ i ];

					v.addAssign( baseFn( value[ component ] ) );

					// Continue loop only if it's not the maximumn number
					If( v.equal( 32 * i ), () => {

						return v;

					} );

				}

			}

			return v;

		} ).setLayout( {
			name: method,
			type: 'uint',
			inputs: [
				{ name: 'value', type: inputType }
			]
		} );

		return fnDef;

	}

	_createLeadingZerosBaseLayout( method, elementType ) {

		const fnDef = Fn( ( [ value ] ) => {

			If( value.equal( uint( 0 ) ), () => {

				return uint( 32 );

			} );

			const v = uint( 0 );
			const n = uint( 0 );
			this._resolveElementType( value, v, elementType );

			If( v.shiftRight( 16 ).equal( 0 ), () => {

				n.addAssign( 16 );
				v.shiftLeftAssign( 16 );

			} );

			If( v.shiftRight( 24 ).equal( 0 ), () => {

				n.addAssign( 8 );
				v.shiftLeftAssign( 8 );

			} );

			If( v.shiftRight( 28 ).equal( 0 ), () => {

				n.addAssign( 4 );
				v.shiftLeftAssign( 4 );

			} );

			If( v.shiftRight( 30 ).equal( 0 ), () => {

				n.addAssign( 2 );
				v.shiftLeftAssign( 2 );

			} );

			If( v.shiftRight( 31 ).equal( 0 ), () => {

				n.addAssign( 1 );

			} );

			return n;

		} ).setLayout( {
			name: method,
			type: 'uint',
			inputs: [
				{ name: 'value', type: elementType }
			]
		} );

		return fnDef;

	}

	_createLeadingZerosMainLayout( method, inputType, typeLength, baseFn ) {

		const fnDef = Fn( ( [ value ] ) => {

			const v = uint( 0.0 );

			if ( typeLength === 1 ) {

				v.addAssign( baseFn( value ) );

			} else {

				const components = [ 'w', 'z', 'y', 'x' ];
				for ( let i = 0; i < typeLength; i ++ ) {

					const component = components[ i ];

					v.addAssign( baseFn( value[ component ] ) );

					If( v.notEqual( 32 * i ), () => {

						return v;

					} );

				}

			}

			return v;

		} ).setLayout( {
			name: method,
			type: 'uint',
			inputs: [
				{ name: 'value', type: inputType }
			]
		} );

		return fnDef;


	}

	_createOneBitsBaseLayout( method, elementType ) {

		const fnDef = Fn( ( [ value ] ) => {

			const v = uint( 0.0 );

			this._resolveElementType( value, v, elementType );

			v.assign( v.sub( v.shiftRight( uint( 1 ) ).bitAnd( uint( 0x55555555 ) ) ) );
			v.assign( v.bitAnd( uint( 0x33333333 ) ).add( v.shiftRight( uint( 2 ) ).bitAnd( uint( 0x33333333 ) ) ) );

			return v.add( v.shiftRight( uint( 4 ) ) ).bitAnd( uint( 0xF0F0F0F ) ).mul( uint( 0x1010101 ) ).shiftRight( uint( 24 ) );

		} ).setLayout( {
			name: method,
			type: 'uint',
			inputs: [
				{ name: 'value', type: elementType }
			]
		} );

		return fnDef;

	}

	_createOneBitsMainLayout( method, inputType, typeLength, baseFn ) {

		const fnDef = Fn( ( [ value ] ) => {

			const v = uint( 0.0 );

			if ( typeLength === 1 ) {

				v.addAssign( baseFn( value ) );

			} else {

				const components = [ 'x', 'y', 'z', 'w' ];

				for ( let i = 0; i < typeLength; i ++ ) {

					const component = components[ i ];

					v.addAssign( baseFn( value[ component ] ) );

				}

			}

			return v;

		} ).setLayout( {
			name: method,
			type: 'uint',
			inputs: [
				{ name: 'value', type: inputType }
			]
		} );

		return fnDef;


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

		const baseMethod = `${method}_base_${elementType}`;
		const newMethod = `${method}_${inputType}`;

		let baseFn = registeredBitcountFunctions[ baseMethod ];

		if ( baseFn === undefined ) {

			switch ( method ) {

				case BitcountNode.COUNT_LEADING_ZEROS: {

					baseFn = this._createLeadingZerosBaseLayout( baseMethod, elementType );
					break;

				}

				case BitcountNode.COUNT_TRAILING_ZEROS: {

					baseFn = this._createTrailingZerosBaseLayout( baseMethod, elementType );
					break;

				}

				case BitcountNode.COUNT_ONE_BITS: {

					baseFn = this._createOneBitsBaseLayout( baseMethod, elementType );
					break;

				}

			}

			registeredBitcountFunctions[ baseMethod ] = baseFn;

		}

		let fn = registeredBitcountFunctions[ newMethod ];

		if ( fn === undefined ) {

			switch ( method ) {

				case BitcountNode.COUNT_LEADING_ZEROS: {

					fn = this._createLeadingZerosMainLayout( newMethod, inputType, typeLength, baseFn );
					break;

				}

				case BitcountNode.COUNT_TRAILING_ZEROS: {

					fn = this._createTrailingZerosMainLayout( newMethod, inputType, typeLength, baseFn );
					break;

				}

				case BitcountNode.COUNT_ONE_BITS: {

					fn = this._createOneBitsMainLayout( newMethod, inputType, typeLength, baseFn );
					break;

				}

			}

			registeredBitcountFunctions[ newMethod ] = fn;

		}

		const output = Fn( () => {

			return fn(
				aNode,
			);

		} );

		return output();

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
