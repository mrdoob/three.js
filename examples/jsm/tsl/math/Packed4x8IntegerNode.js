import { TempNode } from 'three/webgpu';
import { nodeProxyIntent, Fn, uint, int, ivec4, uvec4, clamp } from 'three/tsl';

/**
 * The name of the WGSL language feature that provides hardware-accelerated
 * implementations of the eight built-ins below.
 *
 * @type {string}
 */
const WGSL_LANGUAGE_FEATURE = 'packed_4x8_integer_dot_product';

/**
 * Whether the current renderer can use the native WGSL built-ins directly,
 * i.e. it targets the WebGPU backend and the browser's WebGPU implementation
 * advertises the `packed_4x8_integer_dot_product` language feature.
 *
 * When this is `false` (WebGL backend, or a WebGPU backend/browser that
 * doesn't support the language feature yet) every function below falls back
 * to a plain integer bit-operation emulation instead of throwing, since all
 * eight built-ins are emulatable in both GLSL and WGSL - only hardware
 * acceleration is lost.
 *
 * @param {Renderer} renderer - The renderer.
 * @returns {boolean} Whether the native built-ins can be used.
 */
function hasNativeSupport( renderer ) {

	if ( renderer.backend.isWebGPUBackend !== true ) return false;

	if ( typeof navigator === 'undefined' || navigator.gpu === undefined ) return false;

	const languageFeatures = navigator.gpu.wgslLanguageFeatures;

	return languageFeatures !== undefined && languageFeatures.has( WGSL_LANGUAGE_FEATURE );

}

// Emulation, used whenever `hasNativeSupport()` is `false` - see the
// per-function comments below for the bit tricks involved. Registered once
// as reusable `Fn()` definitions (rather than inlined per call site) so the
// generated shader gets a single function declaration no matter how many
// times a given built-in is used.

/**
 * Packs the low byte of each `uvec4` component into a `uint`, in the same
 * `x -> bits 0..7`, `y -> bits 8..15`, `z -> bits 16..23`, `w -> bits 24..31`
 * layout as WGSL's `pack4xU8`/`pack4xI8`.
 */
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

/**
 * `pack4xI8` reuses `emulatedPack4xU8` by reinterpreting the signed
 * components as unsigned - the low 8 bits of a two's-complement signed
 * integer are identical to the low 8 bits of its unsigned reinterpretation.
 * `uvec4( v )` is a bit-preserving reinterpretation here rather than a
 * numeric conversion: both GLSL and WGSL define int<->uint conversion
 * (scalar, or component-wise on a vector) as reusing the same 32-bit
 * pattern, not clamping/truncating the value.
 */
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

/**
 * Zero-extends each of the four packed bytes back into a `uvec4`.
 */
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

/**
 * Sign-extends one packed byte: shifting it up so it occupies the top byte
 * of the word moves the byte's own sign bit into bit 31, then an arithmetic
 * (sign-propagating) right shift back down by the same amount replicates
 * that bit across the vacated high bits - the standard bit trick for
 * sign-extending an 8-bit value out of a 32-bit word.
 *
 * @param {Node<uint>} v - The packed value.
 * @param {number} byteShift - The bit offset of the byte to extract (0, 8, 16 or 24).
 * @returns {Node<int>} The sign-extended byte.
 */
function signExtendByte( v, byteShift ) {

	return int( v.shiftLeft( uint( 24 - byteShift ) ) ).shiftRight( int( 24 ) );

}

/**
 * Sign-extends each of the four packed bytes back into an `ivec4`.
 */
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

/**
 * Unpacks both operands into unsigned lanes and multiply-adds them.
 */
const emulatedDot4U8Packed = /*@__PURE__*/ Fn( ( [ a, b ] ) => {

	const ua = emulatedUnpack4xU8( a );
	const ub = emulatedUnpack4xU8( b );

	return ua.x.mul( ub.x ).add( ua.y.mul( ub.y ) ).add( ua.z.mul( ub.z ) ).add( ua.w.mul( ub.w ) );

} ).setLayout( {
	name: 'tsl_packed4x8_dot4U8Packed',
	type: 'uint',
	inputs: [ { name: 'a', type: 'uint' }, { name: 'b', type: 'uint' } ]
} );

/**
 * Unpacks both operands into signed lanes and multiply-adds them.
 */
const emulatedDot4I8Packed = /*@__PURE__*/ Fn( ( [ a, b ] ) => {

	const ia = emulatedUnpack4xI8( a );
	const ib = emulatedUnpack4xI8( b );

	return ia.x.mul( ib.x ).add( ia.y.mul( ib.y ) ).add( ia.z.mul( ib.z ) ).add( ia.w.mul( ib.w ) );

} ).setLayout( {
	name: 'tsl_packed4x8_dot4I8Packed',
	type: 'int',
	inputs: [ { name: 'a', type: 'uint' }, { name: 'b', type: 'uint' } ]
} );

/**
 * Represents one of the built-in functions provided by WGSL's
 * `packed_4x8_integer_dot_product` language extension.
 *
 * On the WebGPU backend, when the browser's WebGPU implementation advertises
 * the `packed_4x8_integer_dot_product` WGSL language feature, these map
 * directly onto the corresponding hardware-accelerated WGSL built-ins.
 * Otherwise - on the WebGL backend, or on a WebGPU backend/browser without
 * the language feature - they fall back to an emulation built from plain
 * integer bit operations, which is supported everywhere TSL integers are.
 *
 * @augments TempNode
 * @three_import import { dot4I8Packed, dot4U8Packed, pack4xI8, pack4xI8Clamp, pack4xU8, pack4xU8Clamp, unpack4xI8, unpack4xU8 } from 'three/addons/tsl/math/Packed4x8IntegerNode.js';
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

		if ( hasNativeSupport( builder.renderer ) ) {

			// use the hardware-accelerated WGSL built-in

			return super.setup( builder );

		}

		// emulate with plain integer bit operations

		const { aNode, bNode } = this;
		const fn = this._getEmulatedFn();

		return bNode !== null ? fn( aNode, bNode ) : fn( aNode );

	}

	generate( builder, output ) {

		const properties = builder.getNodeProperties( this );

		if ( properties.outputNode ) {

			// setup() substituted the emulated node graph - build that instead

			return super.generate( builder, output );

		}

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
