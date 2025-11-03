import { float, Fn, If, nodeProxyIntent, uint, int, uvec2, uvec3, uvec4, ivec2, ivec3, ivec4 } from '../tsl/TSLCore.js';
import { bitcast, floatBitsToUint } from './BitcastNode.js';
import MathNode, { negate } from './MathNode.js';

const registeredBitcountFunctions = {};

/**
 * This node represents an operation that counts the bits of a piece of shader data.
 *
 * @augments MathNode
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

	/**
	 * Casts the input value of the function to an integer if necessary.
	 *
	 * @private
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

	_returnDataNode( inputType ) {

		switch ( inputType ) {

			case 'uint': {

				return uint;

			}

			case 'int': {

				return int;

			}

			case 'uvec2': {

				return uvec2;

			}

			case 'uvec3': {

				return uvec3;

			}

			case 'uvec4': {

				return uvec4;

			}

			case 'ivec2': {

				return ivec2;

			}

			case 'ivec3': {

				return ivec3;

			}

			case 'ivec4': {

				return ivec4;

			}

		}

	}

	/**
	 * Creates and registers a reusable GLSL function that emulates the behavior of countTrailingZeros.
	 *
	 * @private
	 * @param {string} method - The name of the function to create.
	 * @param {string} elementType - The type of the input value.
	 * @returns {Function} - The generated function
	 */
	_createTrailingZerosBaseLayout( method, elementType ) {

		const outputConvertNode = this._returnDataNode( elementType );

		const fnDef = Fn( ( [ value ] ) => {

			const v = uint( 0.0 );

			this._resolveElementType( value, v, elementType );

			const f = float( v.bitAnd( negate( v ) ) );
			const uintBits = floatBitsToUint( f );

			const numTrailingZeros = ( uintBits.shiftRight( 23 ) ).sub( 127 );

			return outputConvertNode( numTrailingZeros );

		} ).setLayout( {
			name: method,
			type: elementType,
			inputs: [
				{ name: 'value', type: elementType }
			]
		} );

		return fnDef;

	}

	/**
	 * Creates and registers a reusable GLSL function that emulates the behavior of countLeadingZeros.
	 *
	 * @private
	 * @param {string} method - The name of the function to create.
	 * @param {string} elementType - The type of the input value.
	 * @returns {Function} - The generated function
	 */
	_createLeadingZerosBaseLayout( method, elementType ) {

		const outputConvertNode = this._returnDataNode( elementType );

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

			return outputConvertNode( n );

		} ).setLayout( {
			name: method,
			type: elementType,
			inputs: [
				{ name: 'value', type: elementType }
			]
		} );

		return fnDef;

	}

	/**
	 * Creates and registers a reusable GLSL function that emulates the behavior of countOneBits.
	 *
	 * @private
	 * @param {string} method - The name of the function to create.
	 * @param {string} elementType - The type of the input value.
	 * @returns {Function} - The generated function
	 */
	_createOneBitsBaseLayout( method, elementType ) {

		const outputConvertNode = this._returnDataNode( elementType );

		const fnDef = Fn( ( [ value ] ) => {

			const v = uint( 0.0 );

			this._resolveElementType( value, v, elementType );

			v.assign( v.sub( v.shiftRight( uint( 1 ) ).bitAnd( uint( 0x55555555 ) ) ) );
			v.assign( v.bitAnd( uint( 0x33333333 ) ).add( v.shiftRight( uint( 2 ) ).bitAnd( uint( 0x33333333 ) ) ) );

			const numBits = v.add( v.shiftRight( uint( 4 ) ) ).bitAnd( uint( 0xF0F0F0F ) ).mul( uint( 0x1010101 ) ).shiftRight( uint( 24 ) );

			return outputConvertNode( numBits );

		} ).setLayout( {
			name: method,
			type: elementType,
			inputs: [
				{ name: 'value', type: elementType }
			]
		} );

		return fnDef;

	}

	/**
	 * Creates and registers a reusable GLSL function that emulates the behavior of the specified bitcount function.
	 * including considerations for component-wise bitcounts on vector type inputs.
	 *
	 * @private
	 * @param {string} method - The name of the function to create.
	 * @param {string} inputType - The type of the input value.
	 * @param {number} typeLength - The vec length of the input value.
	 * @param {Function} baseFn - The base function that operates on an individual component of the vector.
	 * @returns {Function} - The alias function for the specified bitcount method.
	 */
	_createMainLayout( method, inputType, typeLength, baseFn ) {

		const outputConvertNode = this._returnDataNode( inputType );

		const fnDef = Fn( ( [ value ] ) => {

			if ( typeLength === 1 ) {

				return outputConvertNode( baseFn( value ) );

			} else {

				const vec = outputConvertNode( 0 );

				const components = [ 'x', 'y', 'z', 'w' ];
				for ( let i = 0; i < typeLength; i ++ ) {

					const component = components[ i ];

					vec[ component ].assign( baseFn( value[ component ] ) );

				}

				return vec;

			}

		} ).setLayout( {
			name: method,
			type: inputType,
			inputs: [
				{ name: 'value', type: inputType }
			]
		} );

		return fnDef;

	}

	setup( builder ) {

		const { method, aNode } = this;

		const { renderer } = builder;

		if ( renderer.backend.isWebGPUBackend ) {

			// use built-in WGSL functions for WebGPU

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

			fn = this._createMainLayout( newMethod, inputType, typeLength, baseFn );
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
