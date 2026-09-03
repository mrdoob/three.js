import TempNode from '../core/TempNode.js';
import { nodeProxyIntent, Fn, uint, int, ivec4, uvec4 } from '../tsl/TSLCore.js';
import { clamp } from './MathNode.js';

/**
 * Represents one of the built-in functions of WGSL's `packed_4x8_integer_dot_product`
 * language extension. If the extension is not available, the node falls back to an
 * emulation with plain integer bit operations.
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

	/**
	 * Returns the reusable `Fn()` definition that emulates this node's method.
	 *
	 * @private
	 * @returns {Function} The emulation function.
	 */
	_getEmulatedFn() {

		switch ( this.method ) {

			case Packed4x8IntegerNode.DOT4_U8_PACKED: return emulatedDot4U8Packed;
			case Packed4x8IntegerNode.DOT4_I8_PACKED: return emulatedDot4I8Packed;
			case Packed4x8IntegerNode.PACK4X_I8: return emulatedPack4xI8;
			case Packed4x8IntegerNode.PACK4X_U8: return emulatedPack4xU8;
			case Packed4x8IntegerNode.PACK4X_I8_CLAMP: return emulatedPack4xI8Clamp;
			case Packed4x8IntegerNode.PACK4X_U8_CLAMP: return emulatedPack4xU8Clamp;
			case Packed4x8IntegerNode.UNPACK4X_I8: return emulatedUnpack4xI8;
			case Packed4x8IntegerNode.UNPACK4X_U8: return emulatedUnpack4xU8;

		}

	}

	setup( builder ) {

		// check for native language support

		if ( builder.renderer.backend.isWebGPUBackend === true &&
			typeof navigator !== 'undefined' && navigator.gpu !== undefined &&
			navigator.gpu.wgslLanguageFeatures !== undefined && navigator.gpu.wgslLanguageFeatures.has( 'packed_4x8_integer_dot_product' )
		) {

			return super.setup( builder );

		}

		// emulation

		const { aNode, bNode } = this;
		const fn = this._getEmulatedFn();

		return bNode !== null ? fn( aNode, bNode ) : fn( aNode );

	}

	generate( builder, output ) {

		const properties = builder.getNodeProperties( this );

		if ( properties.outputNode ) {

			return super.generate( builder, output );

		}

		// generate native WGSL call

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

// emulations

const emulatedPack4xU8 = /*@__PURE__*/ Fn( ( [ v ] ) => {

	const x = v.x.bitAnd( uint( 0xff ) );
	const y = v.y.bitAnd( uint( 0xff ) );
	const z = v.z.bitAnd( uint( 0xff ) );
	const w = v.w.bitAnd( uint( 0xff ) );

	return x.bitOr( y.shiftLeft( uint( 8 ) ) ).bitOr( z.shiftLeft( uint( 16 ) ) ).bitOr( w.shiftLeft( uint( 24 ) ) );

} ).setLayout( {
	name: 'tsl_packed4x8_pack4xU8',
	type: 'uint',
	inputs: [ { name: 'v', type: 'uvec4' } ]
} );

const emulatedPack4xI8 = /*@__PURE__*/ Fn( ( [ v ] ) => {

	return emulatedPack4xU8( uvec4( v ) );

} ).setLayout( {
	name: 'tsl_packed4x8_pack4xI8',
	type: 'uint',
	inputs: [ { name: 'v', type: 'ivec4' } ]
} );

const emulatedPack4xU8Clamp = /*@__PURE__*/ Fn( ( [ v ] ) => {

	return emulatedPack4xU8( clamp( v, uvec4( 0 ), uvec4( 255 ) ) );

} ).setLayout( {
	name: 'tsl_packed4x8_pack4xU8Clamp',
	type: 'uint',
	inputs: [ { name: 'v', type: 'uvec4' } ]
} );

const emulatedPack4xI8Clamp = /*@__PURE__*/ Fn( ( [ v ] ) => {

	return emulatedPack4xI8( clamp( v, ivec4( - 128 ), ivec4( 127 ) ) );

} ).setLayout( {
	name: 'tsl_packed4x8_pack4xI8Clamp',
	type: 'uint',
	inputs: [ { name: 'v', type: 'ivec4' } ]
} );

const emulatedUnpack4xU8 = /*@__PURE__*/ Fn( ( [ v ] ) => {

	return uvec4(
		v.bitAnd( uint( 0xff ) ),
		v.shiftRight( uint( 8 ) ).bitAnd( uint( 0xff ) ),
		v.shiftRight( uint( 16 ) ).bitAnd( uint( 0xff ) ),
		v.shiftRight( uint( 24 ) ).bitAnd( uint( 0xff ) )
	);

} ).setLayout( {
	name: 'tsl_packed4x8_unpack4xU8',
	type: 'uvec4',
	inputs: [ { name: 'v', type: 'uint' } ]
} );

function signExtendByte( v, byteShift ) {

	return int( v.shiftLeft( uint( 24 - byteShift ) ) ).shiftRight( int( 24 ) );

}

const emulatedUnpack4xI8 = /*@__PURE__*/ Fn( ( [ v ] ) => {

	return ivec4(
		signExtendByte( v, 0 ),
		signExtendByte( v, 8 ),
		signExtendByte( v, 16 ),
		signExtendByte( v, 24 )
	);

} ).setLayout( {
	name: 'tsl_packed4x8_unpack4xI8',
	type: 'ivec4',
	inputs: [ { name: 'v', type: 'uint' } ]
} );

const emulatedDot4U8Packed = /*@__PURE__*/ Fn( ( [ a, b ] ) => {

	const ua = emulatedUnpack4xU8( a );
	const ub = emulatedUnpack4xU8( b );

	return ua.x.mul( ub.x ).add( ua.y.mul( ub.y ) ).add( ua.z.mul( ub.z ) ).add( ua.w.mul( ub.w ) );

} ).setLayout( {
	name: 'tsl_packed4x8_dot4U8Packed',
	type: 'uint',
	inputs: [ { name: 'a', type: 'uint' }, { name: 'b', type: 'uint' } ]
} );

const emulatedDot4I8Packed = /*@__PURE__*/ Fn( ( [ a, b ] ) => {

	const ia = emulatedUnpack4xI8( a );
	const ib = emulatedUnpack4xI8( b );

	return ia.x.mul( ib.x ).add( ia.y.mul( ib.y ) ).add( ia.z.mul( ib.z ) ).add( ia.w.mul( ib.w ) );

} ).setLayout( {
	name: 'tsl_packed4x8_dot4I8Packed',
	type: 'int',
	inputs: [ { name: 'a', type: 'uint' }, { name: 'b', type: 'uint' } ]
} );

// exports

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
