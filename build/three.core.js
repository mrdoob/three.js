/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
const REVISION = '172';

const MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 2, ROTATE: 0, DOLLY: 1, PAN: 2 };
const TOUCH = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 };
const CullFaceNone = 0;
const CullFaceBack = 1;
const CullFaceFront = 2;
const CullFaceFrontBack = 3;
const BasicShadowMap = 0;
const PCFShadowMap = 1;
const PCFSoftShadowMap = 2;
const VSMShadowMap = 3;
const FrontSide = 0;
const BackSide = 1;
const DoubleSide = 2;
const NoBlending = 0;
const NormalBlending = 1;
const AdditiveBlending = 2;
const SubtractiveBlending = 3;
const MultiplyBlending = 4;
const CustomBlending = 5;
const AddEquation = 100;
const SubtractEquation = 101;
const ReverseSubtractEquation = 102;
const MinEquation = 103;
const MaxEquation = 104;
const ZeroFactor = 200;
const OneFactor = 201;
const SrcColorFactor = 202;
const OneMinusSrcColorFactor = 203;
const SrcAlphaFactor = 204;
const OneMinusSrcAlphaFactor = 205;
const DstAlphaFactor = 206;
const OneMinusDstAlphaFactor = 207;
const DstColorFactor = 208;
const OneMinusDstColorFactor = 209;
const SrcAlphaSaturateFactor = 210;
const ConstantColorFactor = 211;
const OneMinusConstantColorFactor = 212;
const ConstantAlphaFactor = 213;
const OneMinusConstantAlphaFactor = 214;
const NeverDepth = 0;
const AlwaysDepth = 1;
const LessDepth = 2;
const LessEqualDepth = 3;
const EqualDepth = 4;
const GreaterEqualDepth = 5;
const GreaterDepth = 6;
const NotEqualDepth = 7;
const MultiplyOperation = 0;
const MixOperation = 1;
const AddOperation = 2;
const NoToneMapping = 0;
const LinearToneMapping = 1;
const ReinhardToneMapping = 2;
const CineonToneMapping = 3;
const ACESFilmicToneMapping = 4;
const CustomToneMapping = 5;
const AgXToneMapping = 6;
const NeutralToneMapping = 7;
const AttachedBindMode = 'attached';
const DetachedBindMode = 'detached';

const UVMapping = 300;
const CubeReflectionMapping = 301;
const CubeRefractionMapping = 302;
const EquirectangularReflectionMapping = 303;
const EquirectangularRefractionMapping = 304;
const CubeUVReflectionMapping = 306;
const RepeatWrapping = 1000;
const ClampToEdgeWrapping = 1001;
const MirroredRepeatWrapping = 1002;
const NearestFilter = 1003;
const NearestMipmapNearestFilter = 1004;
const NearestMipMapNearestFilter = 1004;
const NearestMipmapLinearFilter = 1005;
const NearestMipMapLinearFilter = 1005;
const LinearFilter = 1006;
const LinearMipmapNearestFilter = 1007;
const LinearMipMapNearestFilter = 1007;
const LinearMipmapLinearFilter = 1008;
const LinearMipMapLinearFilter = 1008;
const UnsignedByteType = 1009;
const ByteType = 1010;
const ShortType = 1011;
const UnsignedShortType = 1012;
const IntType = 1013;
const UnsignedIntType = 1014;
const FloatType = 1015;
const HalfFloatType = 1016;
const UnsignedShort4444Type = 1017;
const UnsignedShort5551Type = 1018;
const UnsignedInt248Type = 1020;
const UnsignedInt5999Type = 35902;
const AlphaFormat = 1021;
const RGBFormat = 1022;
const RGBAFormat = 1023;
const LuminanceFormat = 1024;
const LuminanceAlphaFormat = 1025;
const DepthFormat = 1026;
const DepthStencilFormat = 1027;
const RedFormat = 1028;
const RedIntegerFormat = 1029;
const RGFormat = 1030;
const RGIntegerFormat = 1031;
const RGBIntegerFormat = 1032;
const RGBAIntegerFormat = 1033;

const RGB_S3TC_DXT1_Format = 33776;
const RGBA_S3TC_DXT1_Format = 33777;
const RGBA_S3TC_DXT3_Format = 33778;
const RGBA_S3TC_DXT5_Format = 33779;
const RGB_PVRTC_4BPPV1_Format = 35840;
const RGB_PVRTC_2BPPV1_Format = 35841;
const RGBA_PVRTC_4BPPV1_Format = 35842;
const RGBA_PVRTC_2BPPV1_Format = 35843;
const RGB_ETC1_Format = 36196;
const RGB_ETC2_Format = 37492;
const RGBA_ETC2_EAC_Format = 37496;
const RGBA_ASTC_4x4_Format = 37808;
const RGBA_ASTC_5x4_Format = 37809;
const RGBA_ASTC_5x5_Format = 37810;
const RGBA_ASTC_6x5_Format = 37811;
const RGBA_ASTC_6x6_Format = 37812;
const RGBA_ASTC_8x5_Format = 37813;
const RGBA_ASTC_8x6_Format = 37814;
const RGBA_ASTC_8x8_Format = 37815;
const RGBA_ASTC_10x5_Format = 37816;
const RGBA_ASTC_10x6_Format = 37817;
const RGBA_ASTC_10x8_Format = 37818;
const RGBA_ASTC_10x10_Format = 37819;
const RGBA_ASTC_12x10_Format = 37820;
const RGBA_ASTC_12x12_Format = 37821;
const RGBA_BPTC_Format = 36492;
const RGB_BPTC_SIGNED_Format = 36494;
const RGB_BPTC_UNSIGNED_Format = 36495;
const RED_RGTC1_Format = 36283;
const SIGNED_RED_RGTC1_Format = 36284;
const RED_GREEN_RGTC2_Format = 36285;
const SIGNED_RED_GREEN_RGTC2_Format = 36286;
const LoopOnce = 2200;
const LoopRepeat = 2201;
const LoopPingPong = 2202;
const InterpolateDiscrete = 2300;
const InterpolateLinear = 2301;
const InterpolateSmooth = 2302;
const ZeroCurvatureEnding = 2400;
const ZeroSlopeEnding = 2401;
const WrapAroundEnding = 2402;
const NormalAnimationBlendMode = 2500;
const AdditiveAnimationBlendMode = 2501;
const TrianglesDrawMode = 0;
const TriangleStripDrawMode = 1;
const TriangleFanDrawMode = 2;
const BasicDepthPacking = 3200;
const RGBADepthPacking = 3201;
const RGBDepthPacking = 3202;
const RGDepthPacking = 3203;
const TangentSpaceNormalMap = 0;
const ObjectSpaceNormalMap = 1;

// Color space string identifiers, matching CSS Color Module Level 4 and WebGPU names where available.
const NoColorSpace = '';
const SRGBColorSpace = 'srgb';
const LinearSRGBColorSpace = 'srgb-linear';

const LinearTransfer = 'linear';
const SRGBTransfer = 'srgb';

const ZeroStencilOp = 0;
const KeepStencilOp = 7680;
const ReplaceStencilOp = 7681;
const IncrementStencilOp = 7682;
const DecrementStencilOp = 7683;
const IncrementWrapStencilOp = 34055;
const DecrementWrapStencilOp = 34056;
const InvertStencilOp = 5386;

const NeverStencilFunc = 512;
const LessStencilFunc = 513;
const EqualStencilFunc = 514;
const LessEqualStencilFunc = 515;
const GreaterStencilFunc = 516;
const NotEqualStencilFunc = 517;
const GreaterEqualStencilFunc = 518;
const AlwaysStencilFunc = 519;

const NeverCompare = 512;
const LessCompare = 513;
const EqualCompare = 514;
const LessEqualCompare = 515;
const GreaterCompare = 516;
const NotEqualCompare = 517;
const GreaterEqualCompare = 518;
const AlwaysCompare = 519;

const StaticDrawUsage = 35044;
const DynamicDrawUsage = 35048;
const StreamDrawUsage = 35040;
const StaticReadUsage = 35045;
const DynamicReadUsage = 35049;
const StreamReadUsage = 35041;
const StaticCopyUsage = 35046;
const DynamicCopyUsage = 35050;
const StreamCopyUsage = 35042;

const GLSL1 = '100';
const GLSL3 = '300 es';

const WebGLCoordinateSystem = 2000;
const WebGPUCoordinateSystem = 2001;

/**
 * https://github.com/mrdoob/eventdispatcher.js/
 */

class EventDispatcher {

	addEventListener( type, listener ) {

		if ( this._listeners === undefined ) this._listeners = {};

		const listeners = this._listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	}

	hasEventListener( type, listener ) {

		if ( this._listeners === undefined ) return false;

		const listeners = this._listeners;

		return listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1;

	}

	removeEventListener( type, listener ) {

		if ( this._listeners === undefined ) return;

		const listeners = this._listeners;
		const listenerArray = listeners[ type ];

		if ( listenerArray !== undefined ) {

			const index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );

			}

		}

	}

	dispatchEvent( event ) {

		if ( this._listeners === undefined ) return;

		const listeners = this._listeners;
		const listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			event.target = this;

			// Make a copy, in case listeners are removed while iterating.
			const array = listenerArray.slice( 0 );

			for ( let i = 0, l = array.length; i < l; i ++ ) {

				array[ i ].call( this, event );

			}

			event.target = null;

		}

	}

}

const _lut = [ '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c', '0d', '0e', '0f', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1a', '1b', '1c', '1d', '1e', '1f', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2a', '2b', '2c', '2d', '2e', '2f', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3a', '3b', '3c', '3d', '3e', '3f', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d', '4e', '4f', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a', '5b', '5c', '5d', '5e', '5f', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6a', '6b', '6c', '6d', '6e', '6f', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7a', '7b', '7c', '7d', '7e', '7f', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e', '8f', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b', '9c', '9d', '9e', '9f', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc', 'dd', 'de', 'df', 'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff' ];

let _seed = 1234567;


const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
function generateUUID() {

	const d0 = Math.random() * 0xffffffff | 0;
	const d1 = Math.random() * 0xffffffff | 0;
	const d2 = Math.random() * 0xffffffff | 0;
	const d3 = Math.random() * 0xffffffff | 0;
	const uuid = _lut[ d0 & 0xff ] + _lut[ d0 >> 8 & 0xff ] + _lut[ d0 >> 16 & 0xff ] + _lut[ d0 >> 24 & 0xff ] + '-' +
			_lut[ d1 & 0xff ] + _lut[ d1 >> 8 & 0xff ] + '-' + _lut[ d1 >> 16 & 0x0f | 0x40 ] + _lut[ d1 >> 24 & 0xff ] + '-' +
			_lut[ d2 & 0x3f | 0x80 ] + _lut[ d2 >> 8 & 0xff ] + '-' + _lut[ d2 >> 16 & 0xff ] + _lut[ d2 >> 24 & 0xff ] +
			_lut[ d3 & 0xff ] + _lut[ d3 >> 8 & 0xff ] + _lut[ d3 >> 16 & 0xff ] + _lut[ d3 >> 24 & 0xff ];

	// .toLowerCase() here flattens concatenated strings to save heap memory space.
	return uuid.toLowerCase();

}

function clamp( value, min, max ) {

	return Math.max( min, Math.min( max, value ) );

}

// compute euclidean modulo of m % n
// https://en.wikipedia.org/wiki/Modulo_operation
function euclideanModulo( n, m ) {

	return ( ( n % m ) + m ) % m;

}

// Linear mapping from range <a1, a2> to range <b1, b2>
function mapLinear( x, a1, a2, b1, b2 ) {

	return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );

}

// https://www.gamedev.net/tutorials/programming/general-and-gameplay-programming/inverse-lerp-a-super-useful-yet-often-overlooked-function-r5230/
function inverseLerp( x, y, value ) {

	if ( x !== y ) {

		return ( value - x ) / ( y - x );

	} else {

		return 0;

	}

}

// https://en.wikipedia.org/wiki/Linear_interpolation
function lerp( x, y, t ) {

	return ( 1 - t ) * x + t * y;

}

// http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/
function damp( x, y, lambda, dt ) {

	return lerp( x, y, 1 - Math.exp( - lambda * dt ) );

}

// https://www.desmos.com/calculator/vcsjnyz7x4
function pingpong( x, length = 1 ) {

	return length - Math.abs( euclideanModulo( x, length * 2 ) - length );

}

// http://en.wikipedia.org/wiki/Smoothstep
function smoothstep( x, min, max ) {

	if ( x <= min ) return 0;
	if ( x >= max ) return 1;

	x = ( x - min ) / ( max - min );

	return x * x * ( 3 - 2 * x );

}

function smootherstep( x, min, max ) {

	if ( x <= min ) return 0;
	if ( x >= max ) return 1;

	x = ( x - min ) / ( max - min );

	return x * x * x * ( x * ( x * 6 - 15 ) + 10 );

}

// Random integer from <low, high> interval
function randInt( low, high ) {

	return low + Math.floor( Math.random() * ( high - low + 1 ) );

}

// Random float from <low, high> interval
function randFloat( low, high ) {

	return low + Math.random() * ( high - low );

}

// Random float from <-range/2, range/2> interval
function randFloatSpread( range ) {

	return range * ( 0.5 - Math.random() );

}

// Deterministic pseudo-random float in the interval [ 0, 1 ]
function seededRandom( s ) {

	if ( s !== undefined ) _seed = s;

	// Mulberry32 generator

	let t = _seed += 0x6D2B79F5;

	t = Math.imul( t ^ t >>> 15, t | 1 );

	t ^= t + Math.imul( t ^ t >>> 7, t | 61 );

	return ( ( t ^ t >>> 14 ) >>> 0 ) / 4294967296;

}

function degToRad( degrees ) {

	return degrees * DEG2RAD;

}

function radToDeg( radians ) {

	return radians * RAD2DEG;

}

function isPowerOfTwo( value ) {

	return ( value & ( value - 1 ) ) === 0 && value !== 0;

}

function ceilPowerOfTwo( value ) {

	return Math.pow( 2, Math.ceil( Math.log( value ) / Math.LN2 ) );

}

function floorPowerOfTwo( value ) {

	return Math.pow( 2, Math.floor( Math.log( value ) / Math.LN2 ) );

}

function setQuaternionFromProperEuler( q, a, b, c, order ) {

	// Intrinsic Proper Euler Angles - see https://en.wikipedia.org/wiki/Euler_angles

	// rotations are applied to the axes in the order specified by 'order'
	// rotation by angle 'a' is applied first, then by angle 'b', then by angle 'c'
	// angles are in radians

	const cos = Math.cos;
	const sin = Math.sin;

	const c2 = cos( b / 2 );
	const s2 = sin( b / 2 );

	const c13 = cos( ( a + c ) / 2 );
	const s13 = sin( ( a + c ) / 2 );

	const c1_3 = cos( ( a - c ) / 2 );
	const s1_3 = sin( ( a - c ) / 2 );

	const c3_1 = cos( ( c - a ) / 2 );
	const s3_1 = sin( ( c - a ) / 2 );

	switch ( order ) {

		case 'XYX':
			q.set( c2 * s13, s2 * c1_3, s2 * s1_3, c2 * c13 );
			break;

		case 'YZY':
			q.set( s2 * s1_3, c2 * s13, s2 * c1_3, c2 * c13 );
			break;

		case 'ZXZ':
			q.set( s2 * c1_3, s2 * s1_3, c2 * s13, c2 * c13 );
			break;

		case 'XZX':
			q.set( c2 * s13, s2 * s3_1, s2 * c3_1, c2 * c13 );
			break;

		case 'YXY':
			q.set( s2 * c3_1, c2 * s13, s2 * s3_1, c2 * c13 );
			break;

		case 'ZYZ':
			q.set( s2 * s3_1, s2 * c3_1, c2 * s13, c2 * c13 );
			break;

		default:
			console.warn( 'THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: ' + order );

	}

}

function denormalize( value, array ) {

	switch ( array.constructor ) {

		case Float32Array:

			return value;

		case Uint32Array:

			return value / 4294967295.0;

		case Uint16Array:

			return value / 65535.0;

		case Uint8Array:

			return value / 255.0;

		case Int32Array:

			return Math.max( value / 2147483647.0, - 1.0 );

		case Int16Array:

			return Math.max( value / 32767.0, - 1.0 );

		case Int8Array:

			return Math.max( value / 127.0, - 1.0 );

		default:

			throw new Error( 'Invalid component type.' );

	}

}

function normalize( value, array ) {

	switch ( array.constructor ) {

		case Float32Array:

			return value;

		case Uint32Array:

			return Math.round( value * 4294967295.0 );

		case Uint16Array:

			return Math.round( value * 65535.0 );

		case Uint8Array:

			return Math.round( value * 255.0 );

		case Int32Array:

			return Math.round( value * 2147483647.0 );

		case Int16Array:

			return Math.round( value * 32767.0 );

		case Int8Array:

			return Math.round( value * 127.0 );

		default:

			throw new Error( 'Invalid component type.' );

	}

}

const MathUtils = {
	DEG2RAD: DEG2RAD,
	RAD2DEG: RAD2DEG,
	generateUUID: generateUUID,
	clamp: clamp,
	euclideanModulo: euclideanModulo,
	mapLinear: mapLinear,
	inverseLerp: inverseLerp,
	lerp: lerp,
	damp: damp,
	pingpong: pingpong,
	smoothstep: smoothstep,
	smootherstep: smootherstep,
	randInt: randInt,
	randFloat: randFloat,
	randFloatSpread: randFloatSpread,
	seededRandom: seededRandom,
	degToRad: degToRad,
	radToDeg: radToDeg,
	isPowerOfTwo: isPowerOfTwo,
	ceilPowerOfTwo: ceilPowerOfTwo,
	floorPowerOfTwo: floorPowerOfTwo,
	setQuaternionFromProperEuler: setQuaternionFromProperEuler,
	normalize: normalize,
	denormalize: denormalize
};

class Vector2 {

	constructor( x = 0, y = 0 ) {

		Vector2.prototype.isVector2 = true;

		this.x = x;
		this.y = y;

	}

	get width() {

		return this.x;

	}

	set width( value ) {

		this.x = value;

	}

	get height() {

		return this.y;

	}

	set height( value ) {

		this.y = value;

	}

	set( x, y ) {

		this.x = x;
		this.y = y;

		return this;

	}

	setScalar( scalar ) {

		this.x = scalar;
		this.y = scalar;

		return this;

	}

	setX( x ) {

		this.x = x;

		return this;

	}

	setY( y ) {

		this.y = y;

		return this;

	}

	setComponent( index, value ) {

		switch ( index ) {

			case 0: this.x = value; break;
			case 1: this.y = value; break;
			default: throw new Error( 'index is out of range: ' + index );

		}

		return this;

	}

	getComponent( index ) {

		switch ( index ) {

			case 0: return this.x;
			case 1: return this.y;
			default: throw new Error( 'index is out of range: ' + index );

		}

	}

	clone() {

		return new this.constructor( this.x, this.y );

	}

	copy( v ) {

		this.x = v.x;
		this.y = v.y;

		return this;

	}

	add( v ) {

		this.x += v.x;
		this.y += v.y;

		return this;

	}

	addScalar( s ) {

		this.x += s;
		this.y += s;

		return this;

	}

	addVectors( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;

		return this;

	}

	addScaledVector( v, s ) {

		this.x += v.x * s;
		this.y += v.y * s;

		return this;

	}

	sub( v ) {

		this.x -= v.x;
		this.y -= v.y;

		return this;

	}

	subScalar( s ) {

		this.x -= s;
		this.y -= s;

		return this;

	}

	subVectors( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;

		return this;

	}

	multiply( v ) {

		this.x *= v.x;
		this.y *= v.y;

		return this;

	}

	multiplyScalar( scalar ) {

		this.x *= scalar;
		this.y *= scalar;

		return this;

	}

	divide( v ) {

		this.x /= v.x;
		this.y /= v.y;

		return this;

	}

	divideScalar( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	}

	applyMatrix3( m ) {

		const x = this.x, y = this.y;
		const e = m.elements;

		this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ];
		this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ];

		return this;

	}

	min( v ) {

		this.x = Math.min( this.x, v.x );
		this.y = Math.min( this.y, v.y );

		return this;

	}

	max( v ) {

		this.x = Math.max( this.x, v.x );
		this.y = Math.max( this.y, v.y );

		return this;

	}

	clamp( min, max ) {

		// assumes min < max, componentwise

		this.x = clamp( this.x, min.x, max.x );
		this.y = clamp( this.y, min.y, max.y );

		return this;

	}

	clampScalar( minVal, maxVal ) {

		this.x = clamp( this.x, minVal, maxVal );
		this.y = clamp( this.y, minVal, maxVal );

		return this;

	}

	clampLength( min, max ) {

		const length = this.length();

		return this.divideScalar( length || 1 ).multiplyScalar( clamp( length, min, max ) );

	}

	floor() {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );

		return this;

	}

	ceil() {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );

		return this;

	}

	round() {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );

		return this;

	}

	roundToZero() {

		this.x = Math.trunc( this.x );
		this.y = Math.trunc( this.y );

		return this;

	}

	negate() {

		this.x = - this.x;
		this.y = - this.y;

		return this;

	}

	dot( v ) {

		return this.x * v.x + this.y * v.y;

	}

	cross( v ) {

		return this.x * v.y - this.y * v.x;

	}

	lengthSq() {

		return this.x * this.x + this.y * this.y;

	}

	length() {

		return Math.sqrt( this.x * this.x + this.y * this.y );

	}

	manhattanLength() {

		return Math.abs( this.x ) + Math.abs( this.y );

	}

	normalize() {

		return this.divideScalar( this.length() || 1 );

	}

	angle() {

		// computes the angle in radians with respect to the positive x-axis

		const angle = Math.atan2( - this.y, - this.x ) + Math.PI;

		return angle;

	}

	angleTo( v ) {

		const denominator = Math.sqrt( this.lengthSq() * v.lengthSq() );

		if ( denominator === 0 ) return Math.PI / 2;

		const theta = this.dot( v ) / denominator;

		// clamp, to handle numerical problems

		return Math.acos( clamp( theta, - 1, 1 ) );

	}

	distanceTo( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	}

	distanceToSquared( v ) {

		const dx = this.x - v.x, dy = this.y - v.y;
		return dx * dx + dy * dy;

	}

	manhattanDistanceTo( v ) {

		return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y );

	}

	setLength( length ) {

		return this.normalize().multiplyScalar( length );

	}

	lerp( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;

		return this;

	}

	lerpVectors( v1, v2, alpha ) {

		this.x = v1.x + ( v2.x - v1.x ) * alpha;
		this.y = v1.y + ( v2.y - v1.y ) * alpha;

		return this;

	}

	equals( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) );

	}

	fromArray( array, offset = 0 ) {

		this.x = array[ offset ];
		this.y = array[ offset + 1 ];

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;

		return array;

	}

	fromBufferAttribute( attribute, index ) {

		this.x = attribute.getX( index );
		this.y = attribute.getY( index );

		return this;

	}

	rotateAround( center, angle ) {

		const c = Math.cos( angle ), s = Math.sin( angle );

		const x = this.x - center.x;
		const y = this.y - center.y;

		this.x = x * c - y * s + center.x;
		this.y = x * s + y * c + center.y;

		return this;

	}

	random() {

		this.x = Math.random();
		this.y = Math.random();

		return this;

	}

	*[ Symbol.iterator ]() {

		yield this.x;
		yield this.y;

	}

}

class Matrix3 {

	constructor( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {

		Matrix3.prototype.isMatrix3 = true;

		this.elements = [

			1, 0, 0,
			0, 1, 0,
			0, 0, 1

		];

		if ( n11 !== undefined ) {

			this.set( n11, n12, n13, n21, n22, n23, n31, n32, n33 );

		}

	}

	set( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {

		const te = this.elements;

		te[ 0 ] = n11; te[ 1 ] = n21; te[ 2 ] = n31;
		te[ 3 ] = n12; te[ 4 ] = n22; te[ 5 ] = n32;
		te[ 6 ] = n13; te[ 7 ] = n23; te[ 8 ] = n33;

		return this;

	}

	identity() {

		this.set(

			1, 0, 0,
			0, 1, 0,
			0, 0, 1

		);

		return this;

	}

	copy( m ) {

		const te = this.elements;
		const me = m.elements;

		te[ 0 ] = me[ 0 ]; te[ 1 ] = me[ 1 ]; te[ 2 ] = me[ 2 ];
		te[ 3 ] = me[ 3 ]; te[ 4 ] = me[ 4 ]; te[ 5 ] = me[ 5 ];
		te[ 6 ] = me[ 6 ]; te[ 7 ] = me[ 7 ]; te[ 8 ] = me[ 8 ];

		return this;

	}

	extractBasis( xAxis, yAxis, zAxis ) {

		xAxis.setFromMatrix3Column( this, 0 );
		yAxis.setFromMatrix3Column( this, 1 );
		zAxis.setFromMatrix3Column( this, 2 );

		return this;

	}

	setFromMatrix4( m ) {

		const me = m.elements;

		this.set(

			me[ 0 ], me[ 4 ], me[ 8 ],
			me[ 1 ], me[ 5 ], me[ 9 ],
			me[ 2 ], me[ 6 ], me[ 10 ]

		);

		return this;

	}

	multiply( m ) {

		return this.multiplyMatrices( this, m );

	}

	premultiply( m ) {

		return this.multiplyMatrices( m, this );

	}

	multiplyMatrices( a, b ) {

		const ae = a.elements;
		const be = b.elements;
		const te = this.elements;

		const a11 = ae[ 0 ], a12 = ae[ 3 ], a13 = ae[ 6 ];
		const a21 = ae[ 1 ], a22 = ae[ 4 ], a23 = ae[ 7 ];
		const a31 = ae[ 2 ], a32 = ae[ 5 ], a33 = ae[ 8 ];

		const b11 = be[ 0 ], b12 = be[ 3 ], b13 = be[ 6 ];
		const b21 = be[ 1 ], b22 = be[ 4 ], b23 = be[ 7 ];
		const b31 = be[ 2 ], b32 = be[ 5 ], b33 = be[ 8 ];

		te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31;
		te[ 3 ] = a11 * b12 + a12 * b22 + a13 * b32;
		te[ 6 ] = a11 * b13 + a12 * b23 + a13 * b33;

		te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31;
		te[ 4 ] = a21 * b12 + a22 * b22 + a23 * b32;
		te[ 7 ] = a21 * b13 + a22 * b23 + a23 * b33;

		te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31;
		te[ 5 ] = a31 * b12 + a32 * b22 + a33 * b32;
		te[ 8 ] = a31 * b13 + a32 * b23 + a33 * b33;

		return this;

	}

	multiplyScalar( s ) {

		const te = this.elements;

		te[ 0 ] *= s; te[ 3 ] *= s; te[ 6 ] *= s;
		te[ 1 ] *= s; te[ 4 ] *= s; te[ 7 ] *= s;
		te[ 2 ] *= s; te[ 5 ] *= s; te[ 8 ] *= s;

		return this;

	}

	determinant() {

		const te = this.elements;

		const a = te[ 0 ], b = te[ 1 ], c = te[ 2 ],
			d = te[ 3 ], e = te[ 4 ], f = te[ 5 ],
			g = te[ 6 ], h = te[ 7 ], i = te[ 8 ];

		return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;

	}

	invert() {

		const te = this.elements,

			n11 = te[ 0 ], n21 = te[ 1 ], n31 = te[ 2 ],
			n12 = te[ 3 ], n22 = te[ 4 ], n32 = te[ 5 ],
			n13 = te[ 6 ], n23 = te[ 7 ], n33 = te[ 8 ],

			t11 = n33 * n22 - n32 * n23,
			t12 = n32 * n13 - n33 * n12,
			t13 = n23 * n12 - n22 * n13,

			det = n11 * t11 + n21 * t12 + n31 * t13;

		if ( det === 0 ) return this.set( 0, 0, 0, 0, 0, 0, 0, 0, 0 );

		const detInv = 1 / det;

		te[ 0 ] = t11 * detInv;
		te[ 1 ] = ( n31 * n23 - n33 * n21 ) * detInv;
		te[ 2 ] = ( n32 * n21 - n31 * n22 ) * detInv;

		te[ 3 ] = t12 * detInv;
		te[ 4 ] = ( n33 * n11 - n31 * n13 ) * detInv;
		te[ 5 ] = ( n31 * n12 - n32 * n11 ) * detInv;

		te[ 6 ] = t13 * detInv;
		te[ 7 ] = ( n21 * n13 - n23 * n11 ) * detInv;
		te[ 8 ] = ( n22 * n11 - n21 * n12 ) * detInv;

		return this;

	}

	transpose() {

		let tmp;
		const m = this.elements;

		tmp = m[ 1 ]; m[ 1 ] = m[ 3 ]; m[ 3 ] = tmp;
		tmp = m[ 2 ]; m[ 2 ] = m[ 6 ]; m[ 6 ] = tmp;
		tmp = m[ 5 ]; m[ 5 ] = m[ 7 ]; m[ 7 ] = tmp;

		return this;

	}

	getNormalMatrix( matrix4 ) {

		return this.setFromMatrix4( matrix4 ).invert().transpose();

	}

	transposeIntoArray( r ) {

		const m = this.elements;

		r[ 0 ] = m[ 0 ];
		r[ 1 ] = m[ 3 ];
		r[ 2 ] = m[ 6 ];
		r[ 3 ] = m[ 1 ];
		r[ 4 ] = m[ 4 ];
		r[ 5 ] = m[ 7 ];
		r[ 6 ] = m[ 2 ];
		r[ 7 ] = m[ 5 ];
		r[ 8 ] = m[ 8 ];

		return this;

	}

	setUvTransform( tx, ty, sx, sy, rotation, cx, cy ) {

		const c = Math.cos( rotation );
		const s = Math.sin( rotation );

		this.set(
			sx * c, sx * s, - sx * ( c * cx + s * cy ) + cx + tx,
			- sy * s, sy * c, - sy * ( - s * cx + c * cy ) + cy + ty,
			0, 0, 1
		);

		return this;

	}

	//

	scale( sx, sy ) {

		this.premultiply( _m3.makeScale( sx, sy ) );

		return this;

	}

	rotate( theta ) {

		this.premultiply( _m3.makeRotation( - theta ) );

		return this;

	}

	translate( tx, ty ) {

		this.premultiply( _m3.makeTranslation( tx, ty ) );

		return this;

	}

	// for 2D Transforms

	makeTranslation( x, y ) {

		if ( x.isVector2 ) {

			this.set(

				1, 0, x.x,
				0, 1, x.y,
				0, 0, 1

			);

		} else {

			this.set(

				1, 0, x,
				0, 1, y,
				0, 0, 1

			);

		}

		return this;

	}

	makeRotation( theta ) {

		// counterclockwise

		const c = Math.cos( theta );
		const s = Math.sin( theta );

		this.set(

			c, - s, 0,
			s, c, 0,
			0, 0, 1

		);

		return this;

	}

	makeScale( x, y ) {

		this.set(

			x, 0, 0,
			0, y, 0,
			0, 0, 1

		);

		return this;

	}

	//

	equals( matrix ) {

		const te = this.elements;
		const me = matrix.elements;

		for ( let i = 0; i < 9; i ++ ) {

			if ( te[ i ] !== me[ i ] ) return false;

		}

		return true;

	}

	fromArray( array, offset = 0 ) {

		for ( let i = 0; i < 9; i ++ ) {

			this.elements[ i ] = array[ i + offset ];

		}

		return this;

	}

	toArray( array = [], offset = 0 ) {

		const te = this.elements;

		array[ offset ] = te[ 0 ];
		array[ offset + 1 ] = te[ 1 ];
		array[ offset + 2 ] = te[ 2 ];

		array[ offset + 3 ] = te[ 3 ];
		array[ offset + 4 ] = te[ 4 ];
		array[ offset + 5 ] = te[ 5 ];

		array[ offset + 6 ] = te[ 6 ];
		array[ offset + 7 ] = te[ 7 ];
		array[ offset + 8 ] = te[ 8 ];

		return array;

	}

	clone() {

		return new this.constructor().fromArray( this.elements );

	}

}

const _m3 = /*@__PURE__*/ new Matrix3();

function arrayNeedsUint32( array ) {

	// assumes larger values usually on last

	for ( let i = array.length - 1; i >= 0; -- i ) {

		if ( array[ i ] >= 65535 ) return true; // account for PRIMITIVE_RESTART_FIXED_INDEX, #24565

	}

	return false;

}

const TYPED_ARRAYS = {
	Int8Array: Int8Array,
	Uint8Array: Uint8Array,
	Uint8ClampedArray: Uint8ClampedArray,
	Int16Array: Int16Array,
	Uint16Array: Uint16Array,
	Int32Array: Int32Array,
	Uint32Array: Uint32Array,
	Float32Array: Float32Array,
	Float64Array: Float64Array
};

function getTypedArray( type, buffer ) {

	return new TYPED_ARRAYS[ type ]( buffer );

}

function createElementNS( name ) {

	return document.createElementNS( 'http://www.w3.org/1999/xhtml', name );

}

function createCanvasElement() {

	const canvas = createElementNS( 'canvas' );
	canvas.style.display = 'block';
	return canvas;

}

const _cache = {};

function warnOnce( message ) {

	if ( message in _cache ) return;

	_cache[ message ] = true;

	console.warn( message );

}

function probeAsync( gl, sync, interval ) {

	return new Promise( function ( resolve, reject ) {

		function probe() {

			switch ( gl.clientWaitSync( sync, gl.SYNC_FLUSH_COMMANDS_BIT, 0 ) ) {

				case gl.WAIT_FAILED:
					reject();
					break;

				case gl.TIMEOUT_EXPIRED:
					setTimeout( probe, interval );
					break;

				default:
					resolve();

			}

		}

		setTimeout( probe, interval );

	} );

}

function toNormalizedProjectionMatrix( projectionMatrix ) {

	const m = projectionMatrix.elements;

	// Convert [-1, 1] to [0, 1] projection matrix
	m[ 2 ] = 0.5 * m[ 2 ] + 0.5 * m[ 3 ];
	m[ 6 ] = 0.5 * m[ 6 ] + 0.5 * m[ 7 ];
	m[ 10 ] = 0.5 * m[ 10 ] + 0.5 * m[ 11 ];
	m[ 14 ] = 0.5 * m[ 14 ] + 0.5 * m[ 15 ];

}

function toReversedProjectionMatrix( projectionMatrix ) {

	const m = projectionMatrix.elements;
	const isPerspectiveMatrix = m[ 11 ] === - 1;

	// Reverse [0, 1] projection matrix
	if ( isPerspectiveMatrix ) {

		m[ 10 ] = - m[ 10 ] - 1;
		m[ 14 ] = - m[ 14 ];

	} else {

		m[ 10 ] = - m[ 10 ];
		m[ 14 ] = - m[ 14 ] + 1;

	}

}

const LINEAR_REC709_TO_XYZ = /*@__PURE__*/ new Matrix3().set(
	0.4123908, 0.3575843, 0.1804808,
	0.2126390, 0.7151687, 0.0721923,
	0.0193308, 0.1191948, 0.9505322
);

const XYZ_TO_LINEAR_REC709 = /*@__PURE__*/ new Matrix3().set(
	3.2409699, - 1.5373832, - 0.4986108,
	- 0.9692436, 1.8759675, 0.0415551,
	0.0556301, - 0.2039770, 1.0569715
);

function createColorManagement() {

	const ColorManagement = {

		enabled: true,

		workingColorSpace: LinearSRGBColorSpace,

		/**
		 * Implementations of supported color spaces.
		 *
		 * Required:
		 *	- primaries: chromaticity coordinates [ rx ry gx gy bx by ]
		 *	- whitePoint: reference white [ x y ]
		 *	- transfer: transfer function (pre-defined)
		 *	- toXYZ: Matrix3 RGB to XYZ transform
		 *	- fromXYZ: Matrix3 XYZ to RGB transform
		 *	- luminanceCoefficients: RGB luminance coefficients
		 *
		 * Optional:
		 *  - outputColorSpaceConfig: { drawingBufferColorSpace: ColorSpace }
		 *  - workingColorSpaceConfig: { unpackColorSpace: ColorSpace }
		 *
		 * Reference:
		 * - https://www.russellcottrell.com/photo/matrixCalculator.htm
		 */
		spaces: {},

		convert: function ( color, sourceColorSpace, targetColorSpace ) {

			if ( this.enabled === false || sourceColorSpace === targetColorSpace || ! sourceColorSpace || ! targetColorSpace ) {

				return color;

			}

			if ( this.spaces[ sourceColorSpace ].transfer === SRGBTransfer ) {

				color.r = SRGBToLinear( color.r );
				color.g = SRGBToLinear( color.g );
				color.b = SRGBToLinear( color.b );

			}

			if ( this.spaces[ sourceColorSpace ].primaries !== this.spaces[ targetColorSpace ].primaries ) {

				color.applyMatrix3( this.spaces[ sourceColorSpace ].toXYZ );
				color.applyMatrix3( this.spaces[ targetColorSpace ].fromXYZ );

			}

			if ( this.spaces[ targetColorSpace ].transfer === SRGBTransfer ) {

				color.r = LinearToSRGB( color.r );
				color.g = LinearToSRGB( color.g );
				color.b = LinearToSRGB( color.b );

			}

			return color;

		},

		fromWorkingColorSpace: function ( color, targetColorSpace ) {

			return this.convert( color, this.workingColorSpace, targetColorSpace );

		},

		toWorkingColorSpace: function ( color, sourceColorSpace ) {

			return this.convert( color, sourceColorSpace, this.workingColorSpace );

		},

		getPrimaries: function ( colorSpace ) {

			return this.spaces[ colorSpace ].primaries;

		},

		getTransfer: function ( colorSpace ) {

			if ( colorSpace === NoColorSpace ) return LinearTransfer;

			return this.spaces[ colorSpace ].transfer;

		},

		getLuminanceCoefficients: function ( target, colorSpace = this.workingColorSpace ) {

			return target.fromArray( this.spaces[ colorSpace ].luminanceCoefficients );

		},

		define: function ( colorSpaces ) {

			Object.assign( this.spaces, colorSpaces );

		},

		// Internal APIs

		_getMatrix: function ( targetMatrix, sourceColorSpace, targetColorSpace ) {

			return targetMatrix
				.copy( this.spaces[ sourceColorSpace ].toXYZ )
				.multiply( this.spaces[ targetColorSpace ].fromXYZ );

		},

		_getDrawingBufferColorSpace: function ( colorSpace ) {

			return this.spaces[ colorSpace ].outputColorSpaceConfig.drawingBufferColorSpace;

		},

		_getUnpackColorSpace: function ( colorSpace = this.workingColorSpace ) {

			return this.spaces[ colorSpace ].workingColorSpaceConfig.unpackColorSpace;

		}

	};

	/******************************************************************************
	 * sRGB definitions
	 */

	const REC709_PRIMARIES = [ 0.640, 0.330, 0.300, 0.600, 0.150, 0.060 ];
	const REC709_LUMINANCE_COEFFICIENTS = [ 0.2126, 0.7152, 0.0722 ];
	const D65 = [ 0.3127, 0.3290 ];

	ColorManagement.define( {

		[ LinearSRGBColorSpace ]: {
			primaries: REC709_PRIMARIES,
			whitePoint: D65,
			transfer: LinearTransfer,
			toXYZ: LINEAR_REC709_TO_XYZ,
			fromXYZ: XYZ_TO_LINEAR_REC709,
			luminanceCoefficients: REC709_LUMINANCE_COEFFICIENTS,
			workingColorSpaceConfig: { unpackColorSpace: SRGBColorSpace },
			outputColorSpaceConfig: { drawingBufferColorSpace: SRGBColorSpace }
		},

		[ SRGBColorSpace ]: {
			primaries: REC709_PRIMARIES,
			whitePoint: D65,
			transfer: SRGBTransfer,
			toXYZ: LINEAR_REC709_TO_XYZ,
			fromXYZ: XYZ_TO_LINEAR_REC709,
			luminanceCoefficients: REC709_LUMINANCE_COEFFICIENTS,
			outputColorSpaceConfig: { drawingBufferColorSpace: SRGBColorSpace }
		},

	} );

	return ColorManagement;

}

const ColorManagement = /*@__PURE__*/ createColorManagement();

function SRGBToLinear( c ) {

	return ( c < 0.04045 ) ? c * 0.0773993808 : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 );

}

function LinearToSRGB( c ) {

	return ( c < 0.0031308 ) ? c * 12.92 : 1.055 * ( Math.pow( c, 0.41666 ) ) - 0.055;

}

let _canvas;

class ImageUtils {

	static getDataURL( image ) {

		if ( /^data:/i.test( image.src ) ) {

			return image.src;

		}

		if ( typeof HTMLCanvasElement === 'undefined' ) {

			return image.src;

		}

		let canvas;

		if ( image instanceof HTMLCanvasElement ) {

			canvas = image;

		} else {

			if ( _canvas === undefined ) _canvas = createElementNS( 'canvas' );

			_canvas.width = image.width;
			_canvas.height = image.height;

			const context = _canvas.getContext( '2d' );

			if ( image instanceof ImageData ) {

				context.putImageData( image, 0, 0 );

			} else {

				context.drawImage( image, 0, 0, image.width, image.height );

			}

			canvas = _canvas;

		}

		if ( canvas.width > 2048 || canvas.height > 2048 ) {

			console.warn( 'THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons', image );

			return canvas.toDataURL( 'image/jpeg', 0.6 );

		} else {

			return canvas.toDataURL( 'image/png' );

		}

	}

	static sRGBToLinear( image ) {

		if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
			( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ||
			( typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap ) ) {

			const canvas = createElementNS( 'canvas' );

			canvas.width = image.width;
			canvas.height = image.height;

			const context = canvas.getContext( '2d' );
			context.drawImage( image, 0, 0, image.width, image.height );

			const imageData = context.getImageData( 0, 0, image.width, image.height );
			const data = imageData.data;

			for ( let i = 0; i < data.length; i ++ ) {

				data[ i ] = SRGBToLinear( data[ i ] / 255 ) * 255;

			}

			context.putImageData( imageData, 0, 0 );

			return canvas;

		} else if ( image.data ) {

			const data = image.data.slice( 0 );

			for ( let i = 0; i < data.length; i ++ ) {

				if ( data instanceof Uint8Array || data instanceof Uint8ClampedArray ) {

					data[ i ] = Math.floor( SRGBToLinear( data[ i ] / 255 ) * 255 );

				} else {

					// assuming float

					data[ i ] = SRGBToLinear( data[ i ] );

				}

			}

			return {
				data: data,
				width: image.width,
				height: image.height
			};

		} else {

			console.warn( 'THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.' );
			return image;

		}

	}

}

let _sourceId = 0;

class Source {

	constructor( data = null ) {

		this.isSource = true;

		Object.defineProperty( this, 'id', { value: _sourceId ++ } );

		this.uuid = generateUUID();

		this.data = data;
		this.dataReady = true;

		this.version = 0;

	}

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

	toJSON( meta ) {

		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		if ( ! isRootObject && meta.images[ this.uuid ] !== undefined ) {

			return meta.images[ this.uuid ];

		}

		const output = {
			uuid: this.uuid,
			url: ''
		};

		const data = this.data;

		if ( data !== null ) {

			let url;

			if ( Array.isArray( data ) ) {

				// cube texture

				url = [];

				for ( let i = 0, l = data.length; i < l; i ++ ) {

					if ( data[ i ].isDataTexture ) {

						url.push( serializeImage( data[ i ].image ) );

					} else {

						url.push( serializeImage( data[ i ] ) );

					}

				}

			} else {

				// texture

				url = serializeImage( data );

			}

			output.url = url;

		}

		if ( ! isRootObject ) {

			meta.images[ this.uuid ] = output;

		}

		return output;

	}

}

function serializeImage( image ) {

	if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
		( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ||
		( typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap ) ) {

		// default images

		return ImageUtils.getDataURL( image );

	} else {

		if ( image.data ) {

			// images of DataTexture

			return {
				data: Array.from( image.data ),
				width: image.width,
				height: image.height,
				type: image.data.constructor.name
			};

		} else {

			console.warn( 'THREE.Texture: Unable to serialize Texture.' );
			return {};

		}

	}

}

let _textureId = 0;

class Texture extends EventDispatcher {

	constructor( image = Texture.DEFAULT_IMAGE, mapping = Texture.DEFAULT_MAPPING, wrapS = ClampToEdgeWrapping, wrapT = ClampToEdgeWrapping, magFilter = LinearFilter, minFilter = LinearMipmapLinearFilter, format = RGBAFormat, type = UnsignedByteType, anisotropy = Texture.DEFAULT_ANISOTROPY, colorSpace = NoColorSpace ) {

		super();

		this.isTexture = true;

		Object.defineProperty( this, 'id', { value: _textureId ++ } );

		this.uuid = generateUUID();

		this.name = '';

		this.source = new Source( image );
		this.mipmaps = [];

		this.mapping = mapping;
		this.channel = 0;

		this.wrapS = wrapS;
		this.wrapT = wrapT;

		this.magFilter = magFilter;
		this.minFilter = minFilter;

		this.anisotropy = anisotropy;

		this.format = format;
		this.internalFormat = null;
		this.type = type;

		this.offset = new Vector2( 0, 0 );
		this.repeat = new Vector2( 1, 1 );
		this.center = new Vector2( 0, 0 );
		this.rotation = 0;

		this.matrixAutoUpdate = true;
		this.matrix = new Matrix3();

		this.generateMipmaps = true;
		this.premultiplyAlpha = false;
		this.flipY = true;
		this.unpackAlignment = 4;	// valid values: 1, 2, 4, 8 (see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)

		this.colorSpace = colorSpace;

		this.userData = {};

		this.version = 0;
		this.onUpdate = null;

		this.renderTarget = null; // assign texture to a render target
		this.isRenderTargetTexture = false; // indicates whether a texture belongs to a render target or not
		this.pmremVersion = 0; // indicates whether this texture should be processed by PMREMGenerator or not (only relevant for render target textures)

	}

	get image() {

		return this.source.data;

	}

	set image( value = null ) {

		this.source.data = value;

	}

	updateMatrix() {

		this.matrix.setUvTransform( this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y );

	}

	clone() {

		return new this.constructor().copy( this );

	}

	copy( source ) {

		this.name = source.name;

		this.source = source.source;
		this.mipmaps = source.mipmaps.slice( 0 );

		this.mapping = source.mapping;
		this.channel = source.channel;

		this.wrapS = source.wrapS;
		this.wrapT = source.wrapT;

		this.magFilter = source.magFilter;
		this.minFilter = source.minFilter;

		this.anisotropy = source.anisotropy;

		this.format = source.format;
		this.internalFormat = source.internalFormat;
		this.type = source.type;

		this.offset.copy( source.offset );
		this.repeat.copy( source.repeat );
		this.center.copy( source.center );
		this.rotation = source.rotation;

		this.matrixAutoUpdate = source.matrixAutoUpdate;
		this.matrix.copy( source.matrix );

		this.generateMipmaps = source.generateMipmaps;
		this.premultiplyAlpha = source.premultiplyAlpha;
		this.flipY = source.flipY;
		this.unpackAlignment = source.unpackAlignment;
		this.colorSpace = source.colorSpace;

		this.renderTarget = source.renderTarget;
		this.isRenderTargetTexture = source.isRenderTargetTexture;

		this.userData = JSON.parse( JSON.stringify( source.userData ) );

		this.needsUpdate = true;

		return this;

	}

	toJSON( meta ) {

		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		if ( ! isRootObject && meta.textures[ this.uuid ] !== undefined ) {

			return meta.textures[ this.uuid ];

		}

		const output = {

			metadata: {
				version: 4.6,
				type: 'Texture',
				generator: 'Texture.toJSON'
			},

			uuid: this.uuid,
			name: this.name,

			image: this.source.toJSON( meta ).uuid,

			mapping: this.mapping,
			channel: this.channel,

			repeat: [ this.repeat.x, this.repeat.y ],
			offset: [ this.offset.x, this.offset.y ],
			center: [ this.center.x, this.center.y ],
			rotation: this.rotation,

			wrap: [ this.wrapS, this.wrapT ],

			format: this.format,
			internalFormat: this.internalFormat,
			type: this.type,
			colorSpace: this.colorSpace,

			minFilter: this.minFilter,
			magFilter: this.magFilter,
			anisotropy: this.anisotropy,

			flipY: this.flipY,

			generateMipmaps: this.generateMipmaps,
			premultiplyAlpha: this.premultiplyAlpha,
			unpackAlignment: this.unpackAlignment

		};

		if ( Object.keys( this.userData ).length > 0 ) output.userData = this.userData;

		if ( ! isRootObject ) {

			meta.textures[ this.uuid ] = output;

		}

		return output;

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

	transformUv( uv ) {

		if ( this.mapping !== UVMapping ) return uv;

		uv.applyMatrix3( this.matrix );

		if ( uv.x < 0 || uv.x > 1 ) {

			switch ( this.wrapS ) {

				case RepeatWrapping:

					uv.x = uv.x - Math.floor( uv.x );
					break;

				case ClampToEdgeWrapping:

					uv.x = uv.x < 0 ? 0 : 1;
					break;

				case MirroredRepeatWrapping:

					if ( Math.abs( Math.floor( uv.x ) % 2 ) === 1 ) {

						uv.x = Math.ceil( uv.x ) - uv.x;

					} else {

						uv.x = uv.x - Math.floor( uv.x );

					}

					break;

			}

		}

		if ( uv.y < 0 || uv.y > 1 ) {

			switch ( this.wrapT ) {

				case RepeatWrapping:

					uv.y = uv.y - Math.floor( uv.y );
					break;

				case ClampToEdgeWrapping:

					uv.y = uv.y < 0 ? 0 : 1;
					break;

				case MirroredRepeatWrapping:

					if ( Math.abs( Math.floor( uv.y ) % 2 ) === 1 ) {

						uv.y = Math.ceil( uv.y ) - uv.y;

					} else {

						uv.y = uv.y - Math.floor( uv.y );

					}

					break;

			}

		}

		if ( this.flipY ) {

			uv.y = 1 - uv.y;

		}

		return uv;

	}

	set needsUpdate( value ) {

		if ( value === true ) {

			this.version ++;
			this.source.needsUpdate = true;

		}

	}

	set needsPMREMUpdate( value ) {

		if ( value === true ) {

			this.pmremVersion ++;

		}

	}

}

Texture.DEFAULT_IMAGE = null;
Texture.DEFAULT_MAPPING = UVMapping;
Texture.DEFAULT_ANISOTROPY = 1;

class Vector4 {

	constructor( x = 0, y = 0, z = 0, w = 1 ) {

		Vector4.prototype.isVector4 = true;

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

	}

	get width() {

		return this.z;

	}

	set width( value ) {

		this.z = value;

	}

	get height() {

		return this.w;

	}

	set height( value ) {

		this.w = value;

	}

	set( x, y, z, w ) {

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;

	}

	setScalar( scalar ) {

		this.x = scalar;
		this.y = scalar;
		this.z = scalar;
		this.w = scalar;

		return this;

	}

	setX( x ) {

		this.x = x;

		return this;

	}

	setY( y ) {

		this.y = y;

		return this;

	}

	setZ( z ) {

		this.z = z;

		return this;

	}

	setW( w ) {

		this.w = w;

		return this;

	}

	setComponent( index, value ) {

		switch ( index ) {

			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			case 3: this.w = value; break;
			default: throw new Error( 'index is out of range: ' + index );

		}

		return this;

	}

	getComponent( index ) {

		switch ( index ) {

			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			case 3: return this.w;
			default: throw new Error( 'index is out of range: ' + index );

		}

	}

	clone() {

		return new this.constructor( this.x, this.y, this.z, this.w );

	}

	copy( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		this.w = ( v.w !== undefined ) ? v.w : 1;

		return this;

	}

	add( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		this.w += v.w;

		return this;

	}

	addScalar( s ) {

		this.x += s;
		this.y += s;
		this.z += s;
		this.w += s;

		return this;

	}

	addVectors( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;
		this.w = a.w + b.w;

		return this;

	}

	addScaledVector( v, s ) {

		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;
		this.w += v.w * s;

		return this;

	}

	sub( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		this.w -= v.w;

		return this;

	}

	subScalar( s ) {

		this.x -= s;
		this.y -= s;
		this.z -= s;
		this.w -= s;

		return this;

	}

	subVectors( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;
		this.w = a.w - b.w;

		return this;

	}

	multiply( v ) {

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;
		this.w *= v.w;

		return this;

	}

	multiplyScalar( scalar ) {

		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		this.w *= scalar;

		return this;

	}

	applyMatrix4( m ) {

		const x = this.x, y = this.y, z = this.z, w = this.w;
		const e = m.elements;

		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] * w;
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] * w;
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] * w;
		this.w = e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] * w;

		return this;

	}

	divide( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;
		this.w /= v.w;

		return this;

	}

	divideScalar( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	}

	setAxisAngleFromQuaternion( q ) {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/index.htm

		// q is assumed to be normalized

		this.w = 2 * Math.acos( q.w );

		const s = Math.sqrt( 1 - q.w * q.w );

		if ( s < 0.0001 ) {

			this.x = 1;
			this.y = 0;
			this.z = 0;

		} else {

			this.x = q.x / s;
			this.y = q.y / s;
			this.z = q.z / s;

		}

		return this;

	}

	setAxisAngleFromRotationMatrix( m ) {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToAngle/index.htm

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		let angle, x, y, z; // variables for result
		const epsilon = 0.01,		// margin to allow for rounding errors
			epsilon2 = 0.1,		// margin to distinguish between 0 and 180 degrees

			te = m.elements,

			m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ],
			m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ],
			m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ];

		if ( ( Math.abs( m12 - m21 ) < epsilon ) &&
		     ( Math.abs( m13 - m31 ) < epsilon ) &&
		     ( Math.abs( m23 - m32 ) < epsilon ) ) {

			// singularity found
			// first check for identity matrix which must have +1 for all terms
			// in leading diagonal and zero in other terms

			if ( ( Math.abs( m12 + m21 ) < epsilon2 ) &&
			     ( Math.abs( m13 + m31 ) < epsilon2 ) &&
			     ( Math.abs( m23 + m32 ) < epsilon2 ) &&
			     ( Math.abs( m11 + m22 + m33 - 3 ) < epsilon2 ) ) {

				// this singularity is identity matrix so angle = 0

				this.set( 1, 0, 0, 0 );

				return this; // zero angle, arbitrary axis

			}

			// otherwise this singularity is angle = 180

			angle = Math.PI;

			const xx = ( m11 + 1 ) / 2;
			const yy = ( m22 + 1 ) / 2;
			const zz = ( m33 + 1 ) / 2;
			const xy = ( m12 + m21 ) / 4;
			const xz = ( m13 + m31 ) / 4;
			const yz = ( m23 + m32 ) / 4;

			if ( ( xx > yy ) && ( xx > zz ) ) {

				// m11 is the largest diagonal term

				if ( xx < epsilon ) {

					x = 0;
					y = 0.707106781;
					z = 0.707106781;

				} else {

					x = Math.sqrt( xx );
					y = xy / x;
					z = xz / x;

				}

			} else if ( yy > zz ) {

				// m22 is the largest diagonal term

				if ( yy < epsilon ) {

					x = 0.707106781;
					y = 0;
					z = 0.707106781;

				} else {

					y = Math.sqrt( yy );
					x = xy / y;
					z = yz / y;

				}

			} else {

				// m33 is the largest diagonal term so base result on this

				if ( zz < epsilon ) {

					x = 0.707106781;
					y = 0.707106781;
					z = 0;

				} else {

					z = Math.sqrt( zz );
					x = xz / z;
					y = yz / z;

				}

			}

			this.set( x, y, z, angle );

			return this; // return 180 deg rotation

		}

		// as we have reached here there are no singularities so we can handle normally

		let s = Math.sqrt( ( m32 - m23 ) * ( m32 - m23 ) +
			( m13 - m31 ) * ( m13 - m31 ) +
			( m21 - m12 ) * ( m21 - m12 ) ); // used to normalize

		if ( Math.abs( s ) < 0.001 ) s = 1;

		// prevent divide by zero, should not happen if matrix is orthogonal and should be
		// caught by singularity test above, but I've left it in just in case

		this.x = ( m32 - m23 ) / s;
		this.y = ( m13 - m31 ) / s;
		this.z = ( m21 - m12 ) / s;
		this.w = Math.acos( ( m11 + m22 + m33 - 1 ) / 2 );

		return this;

	}

	setFromMatrixPosition( m ) {

		const e = m.elements;

		this.x = e[ 12 ];
		this.y = e[ 13 ];
		this.z = e[ 14 ];
		this.w = e[ 15 ];

		return this;

	}

	min( v ) {

		this.x = Math.min( this.x, v.x );
		this.y = Math.min( this.y, v.y );
		this.z = Math.min( this.z, v.z );
		this.w = Math.min( this.w, v.w );

		return this;

	}

	max( v ) {

		this.x = Math.max( this.x, v.x );
		this.y = Math.max( this.y, v.y );
		this.z = Math.max( this.z, v.z );
		this.w = Math.max( this.w, v.w );

		return this;

	}

	clamp( min, max ) {

		// assumes min < max, componentwise

		this.x = clamp( this.x, min.x, max.x );
		this.y = clamp( this.y, min.y, max.y );
		this.z = clamp( this.z, min.z, max.z );
		this.w = clamp( this.w, min.w, max.w );

		return this;

	}

	clampScalar( minVal, maxVal ) {

		this.x = clamp( this.x, minVal, maxVal );
		this.y = clamp( this.y, minVal, maxVal );
		this.z = clamp( this.z, minVal, maxVal );
		this.w = clamp( this.w, minVal, maxVal );

		return this;

	}

	clampLength( min, max ) {

		const length = this.length();

		return this.divideScalar( length || 1 ).multiplyScalar( clamp( length, min, max ) );

	}

	floor() {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );
		this.z = Math.floor( this.z );
		this.w = Math.floor( this.w );

		return this;

	}

	ceil() {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );
		this.z = Math.ceil( this.z );
		this.w = Math.ceil( this.w );

		return this;

	}

	round() {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );
		this.z = Math.round( this.z );
		this.w = Math.round( this.w );

		return this;

	}

	roundToZero() {

		this.x = Math.trunc( this.x );
		this.y = Math.trunc( this.y );
		this.z = Math.trunc( this.z );
		this.w = Math.trunc( this.w );

		return this;

	}

	negate() {

		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;
		this.w = - this.w;

		return this;

	}

	dot( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;

	}

	lengthSq() {

		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;

	}

	length() {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w );

	}

	manhattanLength() {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z ) + Math.abs( this.w );

	}

	normalize() {

		return this.divideScalar( this.length() || 1 );

	}

	setLength( length ) {

		return this.normalize().multiplyScalar( length );

	}

	lerp( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;
		this.w += ( v.w - this.w ) * alpha;

		return this;

	}

	lerpVectors( v1, v2, alpha ) {

		this.x = v1.x + ( v2.x - v1.x ) * alpha;
		this.y = v1.y + ( v2.y - v1.y ) * alpha;
		this.z = v1.z + ( v2.z - v1.z ) * alpha;
		this.w = v1.w + ( v2.w - v1.w ) * alpha;

		return this;

	}

	equals( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) && ( v.w === this.w ) );

	}

	fromArray( array, offset = 0 ) {

		this.x = array[ offset ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];
		this.w = array[ offset + 3 ];

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;
		array[ offset + 3 ] = this.w;

		return array;

	}

	fromBufferAttribute( attribute, index ) {

		this.x = attribute.getX( index );
		this.y = attribute.getY( index );
		this.z = attribute.getZ( index );
		this.w = attribute.getW( index );

		return this;

	}

	random() {

		this.x = Math.random();
		this.y = Math.random();
		this.z = Math.random();
		this.w = Math.random();

		return this;

	}

	*[ Symbol.iterator ]() {

		yield this.x;
		yield this.y;
		yield this.z;
		yield this.w;

	}

}

/*
 In options, we can specify:
 * Texture parameters for an auto-generated target texture
 * depthBuffer/stencilBuffer: Booleans to indicate if we should generate these buffers
*/
class RenderTarget extends EventDispatcher {

	constructor( width = 1, height = 1, options = {} ) {

		super();

		this.isRenderTarget = true;

		this.width = width;
		this.height = height;
		this.depth = 1;

		this.scissor = new Vector4( 0, 0, width, height );
		this.scissorTest = false;

		this.viewport = new Vector4( 0, 0, width, height );

		const image = { width: width, height: height, depth: 1 };

		options = Object.assign( {
			generateMipmaps: false,
			internalFormat: null,
			minFilter: LinearFilter,
			depthBuffer: true,
			stencilBuffer: false,
			resolveDepthBuffer: true,
			resolveStencilBuffer: true,
			depthTexture: null,
			samples: 0,
			count: 1
		}, options );

		const texture = new Texture( image, options.mapping, options.wrapS, options.wrapT, options.magFilter, options.minFilter, options.format, options.type, options.anisotropy, options.colorSpace );

		texture.flipY = false;
		texture.generateMipmaps = options.generateMipmaps;
		texture.internalFormat = options.internalFormat;

		this.textures = [];

		const count = options.count;
		for ( let i = 0; i < count; i ++ ) {

			this.textures[ i ] = texture.clone();
			this.textures[ i ].isRenderTargetTexture = true;
			this.textures[ i ].renderTarget = this;

		}

		this.depthBuffer = options.depthBuffer;
		this.stencilBuffer = options.stencilBuffer;

		this.resolveDepthBuffer = options.resolveDepthBuffer;
		this.resolveStencilBuffer = options.resolveStencilBuffer;

		this._depthTexture = null;
		this.depthTexture = options.depthTexture;

		this.samples = options.samples;

	}

	get texture() {

		return this.textures[ 0 ];

	}

	set texture( value ) {

		this.textures[ 0 ] = value;

	}

	set depthTexture( current ) {

		if ( this._depthTexture !== null ) this._depthTexture.renderTarget = null;
		if ( current !== null ) current.renderTarget = this;

		this._depthTexture = current;

	}

	get depthTexture() {

		return this._depthTexture;

	}

	setSize( width, height, depth = 1 ) {

		if ( this.width !== width || this.height !== height || this.depth !== depth ) {

			this.width = width;
			this.height = height;
			this.depth = depth;

			for ( let i = 0, il = this.textures.length; i < il; i ++ ) {

				this.textures[ i ].image.width = width;
				this.textures[ i ].image.height = height;
				this.textures[ i ].image.depth = depth;

			}

			this.dispose();

		}

		this.viewport.set( 0, 0, width, height );
		this.scissor.set( 0, 0, width, height );

	}

	clone() {

		return new this.constructor().copy( this );

	}

	copy( source ) {

		this.width = source.width;
		this.height = source.height;
		this.depth = source.depth;

		this.scissor.copy( source.scissor );
		this.scissorTest = source.scissorTest;

		this.viewport.copy( source.viewport );

		this.textures.length = 0;

		for ( let i = 0, il = source.textures.length; i < il; i ++ ) {

			this.textures[ i ] = source.textures[ i ].clone();
			this.textures[ i ].isRenderTargetTexture = true;
			this.textures[ i ].renderTarget = this;

		}

		// ensure image object is not shared, see #20328

		const image = Object.assign( {}, source.texture.image );
		this.texture.source = new Source( image );

		this.depthBuffer = source.depthBuffer;
		this.stencilBuffer = source.stencilBuffer;

		this.resolveDepthBuffer = source.resolveDepthBuffer;
		this.resolveStencilBuffer = source.resolveStencilBuffer;

		if ( source.depthTexture !== null ) this.depthTexture = source.depthTexture.clone();

		this.samples = source.samples;

		return this;

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}

class WebGLRenderTarget extends RenderTarget {

	constructor( width = 1, height = 1, options = {} ) {

		super( width, height, options );

		this.isWebGLRenderTarget = true;

	}

}

class DataArrayTexture extends Texture {

	constructor( data = null, width = 1, height = 1, depth = 1 ) {

		super( null );

		this.isDataArrayTexture = true;

		this.image = { data, width, height, depth };

		this.magFilter = NearestFilter;
		this.minFilter = NearestFilter;

		this.wrapR = ClampToEdgeWrapping;

		this.generateMipmaps = false;
		this.flipY = false;
		this.unpackAlignment = 1;

		this.layerUpdates = new Set();

	}

	addLayerUpdate( layerIndex ) {

		this.layerUpdates.add( layerIndex );

	}

	clearLayerUpdates() {

		this.layerUpdates.clear();

	}

}

class WebGLArrayRenderTarget extends WebGLRenderTarget {

	constructor( width = 1, height = 1, depth = 1, options = {} ) {

		super( width, height, options );

		this.isWebGLArrayRenderTarget = true;

		this.depth = depth;

		this.texture = new DataArrayTexture( null, width, height, depth );

		this.texture.isRenderTargetTexture = true;

	}

}

class Data3DTexture extends Texture {

	constructor( data = null, width = 1, height = 1, depth = 1 ) {

		// We're going to add .setXXX() methods for setting properties later.
		// Users can still set in Data3DTexture directly.
		//
		//	const texture = new THREE.Data3DTexture( data, width, height, depth );
		// 	texture.anisotropy = 16;
		//
		// See #14839

		super( null );

		this.isData3DTexture = true;

		this.image = { data, width, height, depth };

		this.magFilter = NearestFilter;
		this.minFilter = NearestFilter;

		this.wrapR = ClampToEdgeWrapping;

		this.generateMipmaps = false;
		this.flipY = false;
		this.unpackAlignment = 1;

	}

}

class WebGL3DRenderTarget extends WebGLRenderTarget {

	constructor( width = 1, height = 1, depth = 1, options = {} ) {

		super( width, height, options );

		this.isWebGL3DRenderTarget = true;

		this.depth = depth;

		this.texture = new Data3DTexture( null, width, height, depth );

		this.texture.isRenderTargetTexture = true;

	}

}

class Quaternion {

	constructor( x = 0, y = 0, z = 0, w = 1 ) {

		this.isQuaternion = true;

		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;

	}

	static slerpFlat( dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t ) {

		// fuzz-free, array-based Quaternion SLERP operation

		let x0 = src0[ srcOffset0 + 0 ],
			y0 = src0[ srcOffset0 + 1 ],
			z0 = src0[ srcOffset0 + 2 ],
			w0 = src0[ srcOffset0 + 3 ];

		const x1 = src1[ srcOffset1 + 0 ],
			y1 = src1[ srcOffset1 + 1 ],
			z1 = src1[ srcOffset1 + 2 ],
			w1 = src1[ srcOffset1 + 3 ];

		if ( t === 0 ) {

			dst[ dstOffset + 0 ] = x0;
			dst[ dstOffset + 1 ] = y0;
			dst[ dstOffset + 2 ] = z0;
			dst[ dstOffset + 3 ] = w0;
			return;

		}

		if ( t === 1 ) {

			dst[ dstOffset + 0 ] = x1;
			dst[ dstOffset + 1 ] = y1;
			dst[ dstOffset + 2 ] = z1;
			dst[ dstOffset + 3 ] = w1;
			return;

		}

		if ( w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1 ) {

			let s = 1 - t;
			const cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,
				dir = ( cos >= 0 ? 1 : - 1 ),
				sqrSin = 1 - cos * cos;

			// Skip the Slerp for tiny steps to avoid numeric problems:
			if ( sqrSin > Number.EPSILON ) {

				const sin = Math.sqrt( sqrSin ),
					len = Math.atan2( sin, cos * dir );

				s = Math.sin( s * len ) / sin;
				t = Math.sin( t * len ) / sin;

			}

			const tDir = t * dir;

			x0 = x0 * s + x1 * tDir;
			y0 = y0 * s + y1 * tDir;
			z0 = z0 * s + z1 * tDir;
			w0 = w0 * s + w1 * tDir;

			// Normalize in case we just did a lerp:
			if ( s === 1 - t ) {

				const f = 1 / Math.sqrt( x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0 );

				x0 *= f;
				y0 *= f;
				z0 *= f;
				w0 *= f;

			}

		}

		dst[ dstOffset ] = x0;
		dst[ dstOffset + 1 ] = y0;
		dst[ dstOffset + 2 ] = z0;
		dst[ dstOffset + 3 ] = w0;

	}

	static multiplyQuaternionsFlat( dst, dstOffset, src0, srcOffset0, src1, srcOffset1 ) {

		const x0 = src0[ srcOffset0 ];
		const y0 = src0[ srcOffset0 + 1 ];
		const z0 = src0[ srcOffset0 + 2 ];
		const w0 = src0[ srcOffset0 + 3 ];

		const x1 = src1[ srcOffset1 ];
		const y1 = src1[ srcOffset1 + 1 ];
		const z1 = src1[ srcOffset1 + 2 ];
		const w1 = src1[ srcOffset1 + 3 ];

		dst[ dstOffset ] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1;
		dst[ dstOffset + 1 ] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1;
		dst[ dstOffset + 2 ] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1;
		dst[ dstOffset + 3 ] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;

		return dst;

	}

	get x() {

		return this._x;

	}

	set x( value ) {

		this._x = value;
		this._onChangeCallback();

	}

	get y() {

		return this._y;

	}

	set y( value ) {

		this._y = value;
		this._onChangeCallback();

	}

	get z() {

		return this._z;

	}

	set z( value ) {

		this._z = value;
		this._onChangeCallback();

	}

	get w() {

		return this._w;

	}

	set w( value ) {

		this._w = value;
		this._onChangeCallback();

	}

	set( x, y, z, w ) {

		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;

		this._onChangeCallback();

		return this;

	}

	clone() {

		return new this.constructor( this._x, this._y, this._z, this._w );

	}

	copy( quaternion ) {

		this._x = quaternion.x;
		this._y = quaternion.y;
		this._z = quaternion.z;
		this._w = quaternion.w;

		this._onChangeCallback();

		return this;

	}

	setFromEuler( euler, update = true ) {

		const x = euler._x, y = euler._y, z = euler._z, order = euler._order;

		// http://www.mathworks.com/matlabcentral/fileexchange/
		// 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
		//	content/SpinCalc.m

		const cos = Math.cos;
		const sin = Math.sin;

		const c1 = cos( x / 2 );
		const c2 = cos( y / 2 );
		const c3 = cos( z / 2 );

		const s1 = sin( x / 2 );
		const s2 = sin( y / 2 );
		const s3 = sin( z / 2 );

		switch ( order ) {

			case 'XYZ':
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case 'YXZ':
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;

			case 'ZXY':
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case 'ZYX':
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;

			case 'YZX':
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case 'XZY':
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;

			default:
				console.warn( 'THREE.Quaternion: .setFromEuler() encountered an unknown order: ' + order );

		}

		if ( update === true ) this._onChangeCallback();

		return this;

	}

	setFromAxisAngle( axis, angle ) {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

		// assumes axis is normalized

		const halfAngle = angle / 2, s = Math.sin( halfAngle );

		this._x = axis.x * s;
		this._y = axis.y * s;
		this._z = axis.z * s;
		this._w = Math.cos( halfAngle );

		this._onChangeCallback();

		return this;

	}

	setFromRotationMatrix( m ) {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		const te = m.elements,

			m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ],
			m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ],
			m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ],

			trace = m11 + m22 + m33;

		if ( trace > 0 ) {

			const s = 0.5 / Math.sqrt( trace + 1.0 );

			this._w = 0.25 / s;
			this._x = ( m32 - m23 ) * s;
			this._y = ( m13 - m31 ) * s;
			this._z = ( m21 - m12 ) * s;

		} else if ( m11 > m22 && m11 > m33 ) {

			const s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

			this._w = ( m32 - m23 ) / s;
			this._x = 0.25 * s;
			this._y = ( m12 + m21 ) / s;
			this._z = ( m13 + m31 ) / s;

		} else if ( m22 > m33 ) {

			const s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

			this._w = ( m13 - m31 ) / s;
			this._x = ( m12 + m21 ) / s;
			this._y = 0.25 * s;
			this._z = ( m23 + m32 ) / s;

		} else {

			const s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

			this._w = ( m21 - m12 ) / s;
			this._x = ( m13 + m31 ) / s;
			this._y = ( m23 + m32 ) / s;
			this._z = 0.25 * s;

		}

		this._onChangeCallback();

		return this;

	}

	setFromUnitVectors( vFrom, vTo ) {

		// assumes direction vectors vFrom and vTo are normalized

		let r = vFrom.dot( vTo ) + 1;

		if ( r < Number.EPSILON ) {

			// vFrom and vTo point in opposite directions

			r = 0;

			if ( Math.abs( vFrom.x ) > Math.abs( vFrom.z ) ) {

				this._x = - vFrom.y;
				this._y = vFrom.x;
				this._z = 0;
				this._w = r;

			} else {

				this._x = 0;
				this._y = - vFrom.z;
				this._z = vFrom.y;
				this._w = r;

			}

		} else {

			// crossVectors( vFrom, vTo ); // inlined to avoid cyclic dependency on Vector3

			this._x = vFrom.y * vTo.z - vFrom.z * vTo.y;
			this._y = vFrom.z * vTo.x - vFrom.x * vTo.z;
			this._z = vFrom.x * vTo.y - vFrom.y * vTo.x;
			this._w = r;

		}

		return this.normalize();

	}

	angleTo( q ) {

		return 2 * Math.acos( Math.abs( clamp( this.dot( q ), - 1, 1 ) ) );

	}

	rotateTowards( q, step ) {

		const angle = this.angleTo( q );

		if ( angle === 0 ) return this;

		const t = Math.min( 1, step / angle );

		this.slerp( q, t );

		return this;

	}

	identity() {

		return this.set( 0, 0, 0, 1 );

	}

	invert() {

		// quaternion is assumed to have unit length

		return this.conjugate();

	}

	conjugate() {

		this._x *= - 1;
		this._y *= - 1;
		this._z *= - 1;

		this._onChangeCallback();

		return this;

	}

	dot( v ) {

		return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;

	}

	lengthSq() {

		return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;

	}

	length() {

		return Math.sqrt( this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w );

	}

	normalize() {

		let l = this.length();

		if ( l === 0 ) {

			this._x = 0;
			this._y = 0;
			this._z = 0;
			this._w = 1;

		} else {

			l = 1 / l;

			this._x = this._x * l;
			this._y = this._y * l;
			this._z = this._z * l;
			this._w = this._w * l;

		}

		this._onChangeCallback();

		return this;

	}

	multiply( q ) {

		return this.multiplyQuaternions( this, q );

	}

	premultiply( q ) {

		return this.multiplyQuaternions( q, this );

	}

	multiplyQuaternions( a, b ) {

		// from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

		const qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
		const qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;

		this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

		this._onChangeCallback();

		return this;

	}

	slerp( qb, t ) {

		if ( t === 0 ) return this;
		if ( t === 1 ) return this.copy( qb );

		const x = this._x, y = this._y, z = this._z, w = this._w;

		// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

		let cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;

		if ( cosHalfTheta < 0 ) {

			this._w = - qb._w;
			this._x = - qb._x;
			this._y = - qb._y;
			this._z = - qb._z;

			cosHalfTheta = - cosHalfTheta;

		} else {

			this.copy( qb );

		}

		if ( cosHalfTheta >= 1.0 ) {

			this._w = w;
			this._x = x;
			this._y = y;
			this._z = z;

			return this;

		}

		const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;

		if ( sqrSinHalfTheta <= Number.EPSILON ) {

			const s = 1 - t;
			this._w = s * w + t * this._w;
			this._x = s * x + t * this._x;
			this._y = s * y + t * this._y;
			this._z = s * z + t * this._z;

			this.normalize(); // normalize calls _onChangeCallback()

			return this;

		}

		const sinHalfTheta = Math.sqrt( sqrSinHalfTheta );
		const halfTheta = Math.atan2( sinHalfTheta, cosHalfTheta );
		const ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta,
			ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;

		this._w = ( w * ratioA + this._w * ratioB );
		this._x = ( x * ratioA + this._x * ratioB );
		this._y = ( y * ratioA + this._y * ratioB );
		this._z = ( z * ratioA + this._z * ratioB );

		this._onChangeCallback();

		return this;

	}

	slerpQuaternions( qa, qb, t ) {

		return this.copy( qa ).slerp( qb, t );

	}

	random() {

		// sets this quaternion to a uniform random unit quaternnion

		// Ken Shoemake
		// Uniform random rotations
		// D. Kirk, editor, Graphics Gems III, pages 124-132. Academic Press, New York, 1992.

		const theta1 = 2 * Math.PI * Math.random();
		const theta2 = 2 * Math.PI * Math.random();

		const x0 = Math.random();
		const r1 = Math.sqrt( 1 - x0 );
		const r2 = Math.sqrt( x0 );

		return this.set(
			r1 * Math.sin( theta1 ),
			r1 * Math.cos( theta1 ),
			r2 * Math.sin( theta2 ),
			r2 * Math.cos( theta2 ),
		);

	}

	equals( quaternion ) {

		return ( quaternion._x === this._x ) && ( quaternion._y === this._y ) && ( quaternion._z === this._z ) && ( quaternion._w === this._w );

	}

	fromArray( array, offset = 0 ) {

		this._x = array[ offset ];
		this._y = array[ offset + 1 ];
		this._z = array[ offset + 2 ];
		this._w = array[ offset + 3 ];

		this._onChangeCallback();

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this._x;
		array[ offset + 1 ] = this._y;
		array[ offset + 2 ] = this._z;
		array[ offset + 3 ] = this._w;

		return array;

	}

	fromBufferAttribute( attribute, index ) {

		this._x = attribute.getX( index );
		this._y = attribute.getY( index );
		this._z = attribute.getZ( index );
		this._w = attribute.getW( index );

		this._onChangeCallback();

		return this;

	}

	toJSON() {

		return this.toArray();

	}

	_onChange( callback ) {

		this._onChangeCallback = callback;

		return this;

	}

	_onChangeCallback() {}

	*[ Symbol.iterator ]() {

		yield this._x;
		yield this._y;
		yield this._z;
		yield this._w;

	}

}

class Vector3 {

	constructor( x = 0, y = 0, z = 0 ) {

		Vector3.prototype.isVector3 = true;

		this.x = x;
		this.y = y;
		this.z = z;

	}

	set( x, y, z ) {

		if ( z === undefined ) z = this.z; // sprite.scale.set(x,y)

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	}

	setScalar( scalar ) {

		this.x = scalar;
		this.y = scalar;
		this.z = scalar;

		return this;

	}

	setX( x ) {

		this.x = x;

		return this;

	}

	setY( y ) {

		this.y = y;

		return this;

	}

	setZ( z ) {

		this.z = z;

		return this;

	}

	setComponent( index, value ) {

		switch ( index ) {

			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			default: throw new Error( 'index is out of range: ' + index );

		}

		return this;

	}

	getComponent( index ) {

		switch ( index ) {

			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			default: throw new Error( 'index is out of range: ' + index );

		}

	}

	clone() {

		return new this.constructor( this.x, this.y, this.z );

	}

	copy( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	}

	add( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	}

	addScalar( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	}

	addVectors( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	}

	addScaledVector( v, s ) {

		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;

		return this;

	}

	sub( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	}

	subScalar( s ) {

		this.x -= s;
		this.y -= s;
		this.z -= s;

		return this;

	}

	subVectors( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	}

	multiply( v ) {

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	}

	multiplyScalar( scalar ) {

		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;

	}

	multiplyVectors( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	}

	applyEuler( euler ) {

		return this.applyQuaternion( _quaternion$4.setFromEuler( euler ) );

	}

	applyAxisAngle( axis, angle ) {

		return this.applyQuaternion( _quaternion$4.setFromAxisAngle( axis, angle ) );

	}

	applyMatrix3( m ) {

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
		this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
		this.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

		return this;

	}

	applyNormalMatrix( m ) {

		return this.applyMatrix3( m ).normalize();

	}

	applyMatrix4( m ) {

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

		this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
		this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
		this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;

		return this;

	}

	applyQuaternion( q ) {

		// quaternion q is assumed to have unit length

		const vx = this.x, vy = this.y, vz = this.z;
		const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

		// t = 2 * cross( q.xyz, v );
		const tx = 2 * ( qy * vz - qz * vy );
		const ty = 2 * ( qz * vx - qx * vz );
		const tz = 2 * ( qx * vy - qy * vx );

		// v + q.w * t + cross( q.xyz, t );
		this.x = vx + qw * tx + qy * tz - qz * ty;
		this.y = vy + qw * ty + qz * tx - qx * tz;
		this.z = vz + qw * tz + qx * ty - qy * tx;

		return this;

	}

	project( camera ) {

		return this.applyMatrix4( camera.matrixWorldInverse ).applyMatrix4( camera.projectionMatrix );

	}

	unproject( camera ) {

		return this.applyMatrix4( camera.projectionMatrixInverse ).applyMatrix4( camera.matrixWorld );

	}

	transformDirection( m ) {

		// input: THREE.Matrix4 affine matrix
		// vector interpreted as a direction

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z;
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z;
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

		return this.normalize();

	}

	divide( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	}

	divideScalar( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	}

	min( v ) {

		this.x = Math.min( this.x, v.x );
		this.y = Math.min( this.y, v.y );
		this.z = Math.min( this.z, v.z );

		return this;

	}

	max( v ) {

		this.x = Math.max( this.x, v.x );
		this.y = Math.max( this.y, v.y );
		this.z = Math.max( this.z, v.z );

		return this;

	}

	clamp( min, max ) {

		// assumes min < max, componentwise

		this.x = clamp( this.x, min.x, max.x );
		this.y = clamp( this.y, min.y, max.y );
		this.z = clamp( this.z, min.z, max.z );

		return this;

	}

	clampScalar( minVal, maxVal ) {

		this.x = clamp( this.x, minVal, maxVal );
		this.y = clamp( this.y, minVal, maxVal );
		this.z = clamp( this.z, minVal, maxVal );

		return this;

	}

	clampLength( min, max ) {

		const length = this.length();

		return this.divideScalar( length || 1 ).multiplyScalar( clamp( length, min, max ) );

	}

	floor() {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );
		this.z = Math.floor( this.z );

		return this;

	}

	ceil() {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );
		this.z = Math.ceil( this.z );

		return this;

	}

	round() {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );
		this.z = Math.round( this.z );

		return this;

	}

	roundToZero() {

		this.x = Math.trunc( this.x );
		this.y = Math.trunc( this.y );
		this.z = Math.trunc( this.z );

		return this;

	}

	negate() {

		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;

		return this;

	}

	dot( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	}

	// TODO lengthSquared?

	lengthSq() {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	}

	length() {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

	}

	manhattanLength() {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

	}

	normalize() {

		return this.divideScalar( this.length() || 1 );

	}

	setLength( length ) {

		return this.normalize().multiplyScalar( length );

	}

	lerp( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;

		return this;

	}

	lerpVectors( v1, v2, alpha ) {

		this.x = v1.x + ( v2.x - v1.x ) * alpha;
		this.y = v1.y + ( v2.y - v1.y ) * alpha;
		this.z = v1.z + ( v2.z - v1.z ) * alpha;

		return this;

	}

	cross( v ) {

		return this.crossVectors( this, v );

	}

	crossVectors( a, b ) {

		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;

		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;

		return this;

	}

	projectOnVector( v ) {

		const denominator = v.lengthSq();

		if ( denominator === 0 ) return this.set( 0, 0, 0 );

		const scalar = v.dot( this ) / denominator;

		return this.copy( v ).multiplyScalar( scalar );

	}

	projectOnPlane( planeNormal ) {

		_vector$c.copy( this ).projectOnVector( planeNormal );

		return this.sub( _vector$c );

	}

	reflect( normal ) {

		// reflect incident vector off plane orthogonal to normal
		// normal is assumed to have unit length

		return this.sub( _vector$c.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

	}

	angleTo( v ) {

		const denominator = Math.sqrt( this.lengthSq() * v.lengthSq() );

		if ( denominator === 0 ) return Math.PI / 2;

		const theta = this.dot( v ) / denominator;

		// clamp, to handle numerical problems

		return Math.acos( clamp( theta, - 1, 1 ) );

	}

	distanceTo( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	}

	distanceToSquared( v ) {

		const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

		return dx * dx + dy * dy + dz * dz;

	}

	manhattanDistanceTo( v ) {

		return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y ) + Math.abs( this.z - v.z );

	}

	setFromSpherical( s ) {

		return this.setFromSphericalCoords( s.radius, s.phi, s.theta );

	}

	setFromSphericalCoords( radius, phi, theta ) {

		const sinPhiRadius = Math.sin( phi ) * radius;

		this.x = sinPhiRadius * Math.sin( theta );
		this.y = Math.cos( phi ) * radius;
		this.z = sinPhiRadius * Math.cos( theta );

		return this;

	}

	setFromCylindrical( c ) {

		return this.setFromCylindricalCoords( c.radius, c.theta, c.y );

	}

	setFromCylindricalCoords( radius, theta, y ) {

		this.x = radius * Math.sin( theta );
		this.y = y;
		this.z = radius * Math.cos( theta );

		return this;

	}

	setFromMatrixPosition( m ) {

		const e = m.elements;

		this.x = e[ 12 ];
		this.y = e[ 13 ];
		this.z = e[ 14 ];

		return this;

	}

	setFromMatrixScale( m ) {

		const sx = this.setFromMatrixColumn( m, 0 ).length();
		const sy = this.setFromMatrixColumn( m, 1 ).length();
		const sz = this.setFromMatrixColumn( m, 2 ).length();

		this.x = sx;
		this.y = sy;
		this.z = sz;

		return this;

	}

	setFromMatrixColumn( m, index ) {

		return this.fromArray( m.elements, index * 4 );

	}

	setFromMatrix3Column( m, index ) {

		return this.fromArray( m.elements, index * 3 );

	}

	setFromEuler( e ) {

		this.x = e._x;
		this.y = e._y;
		this.z = e._z;

		return this;

	}

	setFromColor( c ) {

		this.x = c.r;
		this.y = c.g;
		this.z = c.b;

		return this;

	}

	equals( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	}

	fromArray( array, offset = 0 ) {

		this.x = array[ offset ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;

		return array;

	}

	fromBufferAttribute( attribute, index ) {

		this.x = attribute.getX( index );
		this.y = attribute.getY( index );
		this.z = attribute.getZ( index );

		return this;

	}

	random() {

		this.x = Math.random();
		this.y = Math.random();
		this.z = Math.random();

		return this;

	}

	randomDirection() {

		// https://mathworld.wolfram.com/SpherePointPicking.html

		const theta = Math.random() * Math.PI * 2;
		const u = Math.random() * 2 - 1;
		const c = Math.sqrt( 1 - u * u );

		this.x = c * Math.cos( theta );
		this.y = u;
		this.z = c * Math.sin( theta );

		return this;

	}

	*[ Symbol.iterator ]() {

		yield this.x;
		yield this.y;
		yield this.z;

	}

}

const _vector$c = /*@__PURE__*/ new Vector3();
const _quaternion$4 = /*@__PURE__*/ new Quaternion();

class Box3 {

	constructor( min = new Vector3( + Infinity, + Infinity, + Infinity ), max = new Vector3( - Infinity, - Infinity, - Infinity ) ) {

		this.isBox3 = true;

		this.min = min;
		this.max = max;

	}

	set( min, max ) {

		this.min.copy( min );
		this.max.copy( max );

		return this;

	}

	setFromArray( array ) {

		this.makeEmpty();

		for ( let i = 0, il = array.length; i < il; i += 3 ) {

			this.expandByPoint( _vector$b.fromArray( array, i ) );

		}

		return this;

	}

	setFromBufferAttribute( attribute ) {

		this.makeEmpty();

		for ( let i = 0, il = attribute.count; i < il; i ++ ) {

			this.expandByPoint( _vector$b.fromBufferAttribute( attribute, i ) );

		}

		return this;

	}

	setFromPoints( points ) {

		this.makeEmpty();

		for ( let i = 0, il = points.length; i < il; i ++ ) {

			this.expandByPoint( points[ i ] );

		}

		return this;

	}

	setFromCenterAndSize( center, size ) {

		const halfSize = _vector$b.copy( size ).multiplyScalar( 0.5 );

		this.min.copy( center ).sub( halfSize );
		this.max.copy( center ).add( halfSize );

		return this;

	}

	setFromObject( object, precise = false ) {

		this.makeEmpty();

		return this.expandByObject( object, precise );

	}

	clone() {

		return new this.constructor().copy( this );

	}

	copy( box ) {

		this.min.copy( box.min );
		this.max.copy( box.max );

		return this;

	}

	makeEmpty() {

		this.min.x = this.min.y = this.min.z = + Infinity;
		this.max.x = this.max.y = this.max.z = - Infinity;

		return this;

	}

	isEmpty() {

		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

		return ( this.max.x < this.min.x ) || ( this.max.y < this.min.y ) || ( this.max.z < this.min.z );

	}

	getCenter( target ) {

		return this.isEmpty() ? target.set( 0, 0, 0 ) : target.addVectors( this.min, this.max ).multiplyScalar( 0.5 );

	}

	getSize( target ) {

		return this.isEmpty() ? target.set( 0, 0, 0 ) : target.subVectors( this.max, this.min );

	}

	expandByPoint( point ) {

		this.min.min( point );
		this.max.max( point );

		return this;

	}

	expandByVector( vector ) {

		this.min.sub( vector );
		this.max.add( vector );

		return this;

	}

	expandByScalar( scalar ) {

		this.min.addScalar( - scalar );
		this.max.addScalar( scalar );

		return this;

	}

	expandByObject( object, precise = false ) {

		// Computes the world-axis-aligned bounding box of an object (including its children),
		// accounting for both the object's, and children's, world transforms

		object.updateWorldMatrix( false, false );

		const geometry = object.geometry;

		if ( geometry !== undefined ) {

			const positionAttribute = geometry.getAttribute( 'position' );

			// precise AABB computation based on vertex data requires at least a position attribute.
			// instancing isn't supported so far and uses the normal (conservative) code path.

			if ( precise === true && positionAttribute !== undefined && object.isInstancedMesh !== true ) {

				for ( let i = 0, l = positionAttribute.count; i < l; i ++ ) {

					if ( object.isMesh === true ) {

						object.getVertexPosition( i, _vector$b );

					} else {

						_vector$b.fromBufferAttribute( positionAttribute, i );

					}

					_vector$b.applyMatrix4( object.matrixWorld );
					this.expandByPoint( _vector$b );

				}

			} else {

				if ( object.boundingBox !== undefined ) {

					// object-level bounding box

					if ( object.boundingBox === null ) {

						object.computeBoundingBox();

					}

					_box$4.copy( object.boundingBox );


				} else {

					// geometry-level bounding box

					if ( geometry.boundingBox === null ) {

						geometry.computeBoundingBox();

					}

					_box$4.copy( geometry.boundingBox );

				}

				_box$4.applyMatrix4( object.matrixWorld );

				this.union( _box$4 );

			}

		}

		const children = object.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			this.expandByObject( children[ i ], precise );

		}

		return this;

	}

	containsPoint( point ) {

		return point.x >= this.min.x && point.x <= this.max.x &&
			point.y >= this.min.y && point.y <= this.max.y &&
			point.z >= this.min.z && point.z <= this.max.z;

	}

	containsBox( box ) {

		return this.min.x <= box.min.x && box.max.x <= this.max.x &&
			this.min.y <= box.min.y && box.max.y <= this.max.y &&
			this.min.z <= box.min.z && box.max.z <= this.max.z;

	}

	getParameter( point, target ) {

		// This can potentially have a divide by zero if the box
		// has a size dimension of 0.

		return target.set(
			( point.x - this.min.x ) / ( this.max.x - this.min.x ),
			( point.y - this.min.y ) / ( this.max.y - this.min.y ),
			( point.z - this.min.z ) / ( this.max.z - this.min.z )
		);

	}

	intersectsBox( box ) {

		// using 6 splitting planes to rule out intersections.
		return box.max.x >= this.min.x && box.min.x <= this.max.x &&
			box.max.y >= this.min.y && box.min.y <= this.max.y &&
			box.max.z >= this.min.z && box.min.z <= this.max.z;

	}

	intersectsSphere( sphere ) {

		// Find the point on the AABB closest to the sphere center.
		this.clampPoint( sphere.center, _vector$b );

		// If that point is inside the sphere, the AABB and sphere intersect.
		return _vector$b.distanceToSquared( sphere.center ) <= ( sphere.radius * sphere.radius );

	}

	intersectsPlane( plane ) {

		// We compute the minimum and maximum dot product values. If those values
		// are on the same side (back or front) of the plane, then there is no intersection.

		let min, max;

		if ( plane.normal.x > 0 ) {

			min = plane.normal.x * this.min.x;
			max = plane.normal.x * this.max.x;

		} else {

			min = plane.normal.x * this.max.x;
			max = plane.normal.x * this.min.x;

		}

		if ( plane.normal.y > 0 ) {

			min += plane.normal.y * this.min.y;
			max += plane.normal.y * this.max.y;

		} else {

			min += plane.normal.y * this.max.y;
			max += plane.normal.y * this.min.y;

		}

		if ( plane.normal.z > 0 ) {

			min += plane.normal.z * this.min.z;
			max += plane.normal.z * this.max.z;

		} else {

			min += plane.normal.z * this.max.z;
			max += plane.normal.z * this.min.z;

		}

		return ( min <= - plane.constant && max >= - plane.constant );

	}

	intersectsTriangle( triangle ) {

		if ( this.isEmpty() ) {

			return false;

		}

		// compute box center and extents
		this.getCenter( _center );
		_extents.subVectors( this.max, _center );

		// translate triangle to aabb origin
		_v0$2.subVectors( triangle.a, _center );
		_v1$7.subVectors( triangle.b, _center );
		_v2$4.subVectors( triangle.c, _center );

		// compute edge vectors for triangle
		_f0.subVectors( _v1$7, _v0$2 );
		_f1.subVectors( _v2$4, _v1$7 );
		_f2.subVectors( _v0$2, _v2$4 );

		// test against axes that are given by cross product combinations of the edges of the triangle and the edges of the aabb
		// make an axis testing of each of the 3 sides of the aabb against each of the 3 sides of the triangle = 9 axis of separation
		// axis_ij = u_i x f_j (u0, u1, u2 = face normals of aabb = x,y,z axes vectors since aabb is axis aligned)
		let axes = [
			0, - _f0.z, _f0.y, 0, - _f1.z, _f1.y, 0, - _f2.z, _f2.y,
			_f0.z, 0, - _f0.x, _f1.z, 0, - _f1.x, _f2.z, 0, - _f2.x,
			- _f0.y, _f0.x, 0, - _f1.y, _f1.x, 0, - _f2.y, _f2.x, 0
		];
		if ( ! satForAxes( axes, _v0$2, _v1$7, _v2$4, _extents ) ) {

			return false;

		}

		// test 3 face normals from the aabb
		axes = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
		if ( ! satForAxes( axes, _v0$2, _v1$7, _v2$4, _extents ) ) {

			return false;

		}

		// finally testing the face normal of the triangle
		// use already existing triangle edge vectors here
		_triangleNormal.crossVectors( _f0, _f1 );
		axes = [ _triangleNormal.x, _triangleNormal.y, _triangleNormal.z ];

		return satForAxes( axes, _v0$2, _v1$7, _v2$4, _extents );

	}

	clampPoint( point, target ) {

		return target.copy( point ).clamp( this.min, this.max );

	}

	distanceToPoint( point ) {

		return this.clampPoint( point, _vector$b ).distanceTo( point );

	}

	getBoundingSphere( target ) {

		if ( this.isEmpty() ) {

			target.makeEmpty();

		} else {

			this.getCenter( target.center );

			target.radius = this.getSize( _vector$b ).length() * 0.5;

		}

		return target;

	}

	intersect( box ) {

		this.min.max( box.min );
		this.max.min( box.max );

		// ensure that if there is no overlap, the result is fully empty, not slightly empty with non-inf/+inf values that will cause subsequence intersects to erroneously return valid values.
		if ( this.isEmpty() ) this.makeEmpty();

		return this;

	}

	union( box ) {

		this.min.min( box.min );
		this.max.max( box.max );

		return this;

	}

	applyMatrix4( matrix ) {

		// transform of empty box is an empty box.
		if ( this.isEmpty() ) return this;

		// NOTE: I am using a binary pattern to specify all 2^3 combinations below
		_points[ 0 ].set( this.min.x, this.min.y, this.min.z ).applyMatrix4( matrix ); // 000
		_points[ 1 ].set( this.min.x, this.min.y, this.max.z ).applyMatrix4( matrix ); // 001
		_points[ 2 ].set( this.min.x, this.max.y, this.min.z ).applyMatrix4( matrix ); // 010
		_points[ 3 ].set( this.min.x, this.max.y, this.max.z ).applyMatrix4( matrix ); // 011
		_points[ 4 ].set( this.max.x, this.min.y, this.min.z ).applyMatrix4( matrix ); // 100
		_points[ 5 ].set( this.max.x, this.min.y, this.max.z ).applyMatrix4( matrix ); // 101
		_points[ 6 ].set( this.max.x, this.max.y, this.min.z ).applyMatrix4( matrix ); // 110
		_points[ 7 ].set( this.max.x, this.max.y, this.max.z ).applyMatrix4( matrix ); // 111

		this.setFromPoints( _points );

		return this;

	}

	translate( offset ) {

		this.min.add( offset );
		this.max.add( offset );

		return this;

	}

	equals( box ) {

		return box.min.equals( this.min ) && box.max.equals( this.max );

	}

}

const _points = [
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3()
];

const _vector$b = /*@__PURE__*/ new Vector3();

const _box$4 = /*@__PURE__*/ new Box3();

// triangle centered vertices

const _v0$2 = /*@__PURE__*/ new Vector3();
const _v1$7 = /*@__PURE__*/ new Vector3();
const _v2$4 = /*@__PURE__*/ new Vector3();

// triangle edge vectors

const _f0 = /*@__PURE__*/ new Vector3();
const _f1 = /*@__PURE__*/ new Vector3();
const _f2 = /*@__PURE__*/ new Vector3();

const _center = /*@__PURE__*/ new Vector3();
const _extents = /*@__PURE__*/ new Vector3();
const _triangleNormal = /*@__PURE__*/ new Vector3();
const _testAxis = /*@__PURE__*/ new Vector3();

function satForAxes( axes, v0, v1, v2, extents ) {

	for ( let i = 0, j = axes.length - 3; i <= j; i += 3 ) {

		_testAxis.fromArray( axes, i );
		// project the aabb onto the separating axis
		const r = extents.x * Math.abs( _testAxis.x ) + extents.y * Math.abs( _testAxis.y ) + extents.z * Math.abs( _testAxis.z );
		// project all 3 vertices of the triangle onto the separating axis
		const p0 = v0.dot( _testAxis );
		const p1 = v1.dot( _testAxis );
		const p2 = v2.dot( _testAxis );
		// actual test, basically see if either of the most extreme of the triangle points intersects r
		if ( Math.max( - Math.max( p0, p1, p2 ), Math.min( p0, p1, p2 ) ) > r ) {

			// points of the projected triangle are outside the projected half-length of the aabb
			// the axis is separating and we can exit
			return false;

		}

	}

	return true;

}

const _box$3 = /*@__PURE__*/ new Box3();
const _v1$6 = /*@__PURE__*/ new Vector3();
const _v2$3 = /*@__PURE__*/ new Vector3();

class Sphere {

	constructor( center = new Vector3(), radius = - 1 ) {

		this.isSphere = true;

		this.center = center;
		this.radius = radius;

	}

	set( center, radius ) {

		this.center.copy( center );
		this.radius = radius;

		return this;

	}

	setFromPoints( points, optionalCenter ) {

		const center = this.center;

		if ( optionalCenter !== undefined ) {

			center.copy( optionalCenter );

		} else {

			_box$3.setFromPoints( points ).getCenter( center );

		}

		let maxRadiusSq = 0;

		for ( let i = 0, il = points.length; i < il; i ++ ) {

			maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( points[ i ] ) );

		}

		this.radius = Math.sqrt( maxRadiusSq );

		return this;

	}

	copy( sphere ) {

		this.center.copy( sphere.center );
		this.radius = sphere.radius;

		return this;

	}

	isEmpty() {

		return ( this.radius < 0 );

	}

	makeEmpty() {

		this.center.set( 0, 0, 0 );
		this.radius = - 1;

		return this;

	}

	containsPoint( point ) {

		return ( point.distanceToSquared( this.center ) <= ( this.radius * this.radius ) );

	}

	distanceToPoint( point ) {

		return ( point.distanceTo( this.center ) - this.radius );

	}

	intersectsSphere( sphere ) {

		const radiusSum = this.radius + sphere.radius;

		return sphere.center.distanceToSquared( this.center ) <= ( radiusSum * radiusSum );

	}

	intersectsBox( box ) {

		return box.intersectsSphere( this );

	}

	intersectsPlane( plane ) {

		return Math.abs( plane.distanceToPoint( this.center ) ) <= this.radius;

	}

	clampPoint( point, target ) {

		const deltaLengthSq = this.center.distanceToSquared( point );

		target.copy( point );

		if ( deltaLengthSq > ( this.radius * this.radius ) ) {

			target.sub( this.center ).normalize();
			target.multiplyScalar( this.radius ).add( this.center );

		}

		return target;

	}

	getBoundingBox( target ) {

		if ( this.isEmpty() ) {

			// Empty sphere produces empty bounding box
			target.makeEmpty();
			return target;

		}

		target.set( this.center, this.center );
		target.expandByScalar( this.radius );

		return target;

	}

	applyMatrix4( matrix ) {

		this.center.applyMatrix4( matrix );
		this.radius = this.radius * matrix.getMaxScaleOnAxis();

		return this;

	}

	translate( offset ) {

		this.center.add( offset );

		return this;

	}

	expandByPoint( point ) {

		if ( this.isEmpty() ) {

			this.center.copy( point );

			this.radius = 0;

			return this;

		}

		_v1$6.subVectors( point, this.center );

		const lengthSq = _v1$6.lengthSq();

		if ( lengthSq > ( this.radius * this.radius ) ) {

			// calculate the minimal sphere

			const length = Math.sqrt( lengthSq );

			const delta = ( length - this.radius ) * 0.5;

			this.center.addScaledVector( _v1$6, delta / length );

			this.radius += delta;

		}

		return this;

	}

	union( sphere ) {

		if ( sphere.isEmpty() ) {

			return this;

		}

		if ( this.isEmpty() ) {

			this.copy( sphere );

			return this;

		}

		if ( this.center.equals( sphere.center ) === true ) {

			 this.radius = Math.max( this.radius, sphere.radius );

		} else {

			_v2$3.subVectors( sphere.center, this.center ).setLength( sphere.radius );

			this.expandByPoint( _v1$6.copy( sphere.center ).add( _v2$3 ) );

			this.expandByPoint( _v1$6.copy( sphere.center ).sub( _v2$3 ) );

		}

		return this;

	}

	equals( sphere ) {

		return sphere.center.equals( this.center ) && ( sphere.radius === this.radius );

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

const _vector$a = /*@__PURE__*/ new Vector3();
const _segCenter = /*@__PURE__*/ new Vector3();
const _segDir = /*@__PURE__*/ new Vector3();
const _diff = /*@__PURE__*/ new Vector3();

const _edge1 = /*@__PURE__*/ new Vector3();
const _edge2 = /*@__PURE__*/ new Vector3();
const _normal$1 = /*@__PURE__*/ new Vector3();

class Ray {

	constructor( origin = new Vector3(), direction = new Vector3( 0, 0, - 1 ) ) {

		this.origin = origin;
		this.direction = direction;

	}

	set( origin, direction ) {

		this.origin.copy( origin );
		this.direction.copy( direction );

		return this;

	}

	copy( ray ) {

		this.origin.copy( ray.origin );
		this.direction.copy( ray.direction );

		return this;

	}

	at( t, target ) {

		return target.copy( this.origin ).addScaledVector( this.direction, t );

	}

	lookAt( v ) {

		this.direction.copy( v ).sub( this.origin ).normalize();

		return this;

	}

	recast( t ) {

		this.origin.copy( this.at( t, _vector$a ) );

		return this;

	}

	closestPointToPoint( point, target ) {

		target.subVectors( point, this.origin );

		const directionDistance = target.dot( this.direction );

		if ( directionDistance < 0 ) {

			return target.copy( this.origin );

		}

		return target.copy( this.origin ).addScaledVector( this.direction, directionDistance );

	}

	distanceToPoint( point ) {

		return Math.sqrt( this.distanceSqToPoint( point ) );

	}

	distanceSqToPoint( point ) {

		const directionDistance = _vector$a.subVectors( point, this.origin ).dot( this.direction );

		// point behind the ray

		if ( directionDistance < 0 ) {

			return this.origin.distanceToSquared( point );

		}

		_vector$a.copy( this.origin ).addScaledVector( this.direction, directionDistance );

		return _vector$a.distanceToSquared( point );

	}

	distanceSqToSegment( v0, v1, optionalPointOnRay, optionalPointOnSegment ) {

		// from https://github.com/pmjoniak/GeometricTools/blob/master/GTEngine/Include/Mathematics/GteDistRaySegment.h
		// It returns the min distance between the ray and the segment
		// defined by v0 and v1
		// It can also set two optional targets :
		// - The closest point on the ray
		// - The closest point on the segment

		_segCenter.copy( v0 ).add( v1 ).multiplyScalar( 0.5 );
		_segDir.copy( v1 ).sub( v0 ).normalize();
		_diff.copy( this.origin ).sub( _segCenter );

		const segExtent = v0.distanceTo( v1 ) * 0.5;
		const a01 = - this.direction.dot( _segDir );
		const b0 = _diff.dot( this.direction );
		const b1 = - _diff.dot( _segDir );
		const c = _diff.lengthSq();
		const det = Math.abs( 1 - a01 * a01 );
		let s0, s1, sqrDist, extDet;

		if ( det > 0 ) {

			// The ray and segment are not parallel.

			s0 = a01 * b1 - b0;
			s1 = a01 * b0 - b1;
			extDet = segExtent * det;

			if ( s0 >= 0 ) {

				if ( s1 >= - extDet ) {

					if ( s1 <= extDet ) {

						// region 0
						// Minimum at interior points of ray and segment.

						const invDet = 1 / det;
						s0 *= invDet;
						s1 *= invDet;
						sqrDist = s0 * ( s0 + a01 * s1 + 2 * b0 ) + s1 * ( a01 * s0 + s1 + 2 * b1 ) + c;

					} else {

						// region 1

						s1 = segExtent;
						s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
						sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

					}

				} else {

					// region 5

					s1 = - segExtent;
					s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
					sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

				}

			} else {

				if ( s1 <= - extDet ) {

					// region 4

					s0 = Math.max( 0, - ( - a01 * segExtent + b0 ) );
					s1 = ( s0 > 0 ) ? - segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
					sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

				} else if ( s1 <= extDet ) {

					// region 3

					s0 = 0;
					s1 = Math.min( Math.max( - segExtent, - b1 ), segExtent );
					sqrDist = s1 * ( s1 + 2 * b1 ) + c;

				} else {

					// region 2

					s0 = Math.max( 0, - ( a01 * segExtent + b0 ) );
					s1 = ( s0 > 0 ) ? segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
					sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

				}

			}

		} else {

			// Ray and segment are parallel.

			s1 = ( a01 > 0 ) ? - segExtent : segExtent;
			s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
			sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

		}

		if ( optionalPointOnRay ) {

			optionalPointOnRay.copy( this.origin ).addScaledVector( this.direction, s0 );

		}

		if ( optionalPointOnSegment ) {

			optionalPointOnSegment.copy( _segCenter ).addScaledVector( _segDir, s1 );

		}

		return sqrDist;

	}

	intersectSphere( sphere, target ) {

		_vector$a.subVectors( sphere.center, this.origin );
		const tca = _vector$a.dot( this.direction );
		const d2 = _vector$a.dot( _vector$a ) - tca * tca;
		const radius2 = sphere.radius * sphere.radius;

		if ( d2 > radius2 ) return null;

		const thc = Math.sqrt( radius2 - d2 );

		// t0 = first intersect point - entrance on front of sphere
		const t0 = tca - thc;

		// t1 = second intersect point - exit point on back of sphere
		const t1 = tca + thc;

		// test to see if t1 is behind the ray - if so, return null
		if ( t1 < 0 ) return null;

		// test to see if t0 is behind the ray:
		// if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
		// in order to always return an intersect point that is in front of the ray.
		if ( t0 < 0 ) return this.at( t1, target );

		// else t0 is in front of the ray, so return the first collision point scaled by t0
		return this.at( t0, target );

	}

	intersectsSphere( sphere ) {

		return this.distanceSqToPoint( sphere.center ) <= ( sphere.radius * sphere.radius );

	}

	distanceToPlane( plane ) {

		const denominator = plane.normal.dot( this.direction );

		if ( denominator === 0 ) {

			// line is coplanar, return origin
			if ( plane.distanceToPoint( this.origin ) === 0 ) {

				return 0;

			}

			// Null is preferable to undefined since undefined means.... it is undefined

			return null;

		}

		const t = - ( this.origin.dot( plane.normal ) + plane.constant ) / denominator;

		// Return if the ray never intersects the plane

		return t >= 0 ? t : null;

	}

	intersectPlane( plane, target ) {

		const t = this.distanceToPlane( plane );

		if ( t === null ) {

			return null;

		}

		return this.at( t, target );

	}

	intersectsPlane( plane ) {

		// check if the ray lies on the plane first

		const distToPoint = plane.distanceToPoint( this.origin );

		if ( distToPoint === 0 ) {

			return true;

		}

		const denominator = plane.normal.dot( this.direction );

		if ( denominator * distToPoint < 0 ) {

			return true;

		}

		// ray origin is behind the plane (and is pointing behind it)

		return false;

	}

	intersectBox( box, target ) {

		let tmin, tmax, tymin, tymax, tzmin, tzmax;

		const invdirx = 1 / this.direction.x,
			invdiry = 1 / this.direction.y,
			invdirz = 1 / this.direction.z;

		const origin = this.origin;

		if ( invdirx >= 0 ) {

			tmin = ( box.min.x - origin.x ) * invdirx;
			tmax = ( box.max.x - origin.x ) * invdirx;

		} else {

			tmin = ( box.max.x - origin.x ) * invdirx;
			tmax = ( box.min.x - origin.x ) * invdirx;

		}

		if ( invdiry >= 0 ) {

			tymin = ( box.min.y - origin.y ) * invdiry;
			tymax = ( box.max.y - origin.y ) * invdiry;

		} else {

			tymin = ( box.max.y - origin.y ) * invdiry;
			tymax = ( box.min.y - origin.y ) * invdiry;

		}

		if ( ( tmin > tymax ) || ( tymin > tmax ) ) return null;

		if ( tymin > tmin || isNaN( tmin ) ) tmin = tymin;

		if ( tymax < tmax || isNaN( tmax ) ) tmax = tymax;

		if ( invdirz >= 0 ) {

			tzmin = ( box.min.z - origin.z ) * invdirz;
			tzmax = ( box.max.z - origin.z ) * invdirz;

		} else {

			tzmin = ( box.max.z - origin.z ) * invdirz;
			tzmax = ( box.min.z - origin.z ) * invdirz;

		}

		if ( ( tmin > tzmax ) || ( tzmin > tmax ) ) return null;

		if ( tzmin > tmin || tmin !== tmin ) tmin = tzmin;

		if ( tzmax < tmax || tmax !== tmax ) tmax = tzmax;

		//return point closest to the ray (positive side)

		if ( tmax < 0 ) return null;

		return this.at( tmin >= 0 ? tmin : tmax, target );

	}

	intersectsBox( box ) {

		return this.intersectBox( box, _vector$a ) !== null;

	}

	intersectTriangle( a, b, c, backfaceCulling, target ) {

		// Compute the offset origin, edges, and normal.

		// from https://github.com/pmjoniak/GeometricTools/blob/master/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h

		_edge1.subVectors( b, a );
		_edge2.subVectors( c, a );
		_normal$1.crossVectors( _edge1, _edge2 );

		// Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
		// E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
		//   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
		//   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
		//   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
		let DdN = this.direction.dot( _normal$1 );
		let sign;

		if ( DdN > 0 ) {

			if ( backfaceCulling ) return null;
			sign = 1;

		} else if ( DdN < 0 ) {

			sign = - 1;
			DdN = - DdN;

		} else {

			return null;

		}

		_diff.subVectors( this.origin, a );
		const DdQxE2 = sign * this.direction.dot( _edge2.crossVectors( _diff, _edge2 ) );

		// b1 < 0, no intersection
		if ( DdQxE2 < 0 ) {

			return null;

		}

		const DdE1xQ = sign * this.direction.dot( _edge1.cross( _diff ) );

		// b2 < 0, no intersection
		if ( DdE1xQ < 0 ) {

			return null;

		}

		// b1+b2 > 1, no intersection
		if ( DdQxE2 + DdE1xQ > DdN ) {

			return null;

		}

		// Line intersects triangle, check if ray does.
		const QdN = - sign * _diff.dot( _normal$1 );

		// t < 0, no intersection
		if ( QdN < 0 ) {

			return null;

		}

		// Ray intersects triangle.
		return this.at( QdN / DdN, target );

	}

	applyMatrix4( matrix4 ) {

		this.origin.applyMatrix4( matrix4 );
		this.direction.transformDirection( matrix4 );

		return this;

	}

	equals( ray ) {

		return ray.origin.equals( this.origin ) && ray.direction.equals( this.direction );

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

class Matrix4 {

	constructor( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

		Matrix4.prototype.isMatrix4 = true;

		this.elements = [

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		];

		if ( n11 !== undefined ) {

			this.set( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 );

		}

	}

	set( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

		const te = this.elements;

		te[ 0 ] = n11; te[ 4 ] = n12; te[ 8 ] = n13; te[ 12 ] = n14;
		te[ 1 ] = n21; te[ 5 ] = n22; te[ 9 ] = n23; te[ 13 ] = n24;
		te[ 2 ] = n31; te[ 6 ] = n32; te[ 10 ] = n33; te[ 14 ] = n34;
		te[ 3 ] = n41; te[ 7 ] = n42; te[ 11 ] = n43; te[ 15 ] = n44;

		return this;

	}

	identity() {

		this.set(

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		);

		return this;

	}

	clone() {

		return new Matrix4().fromArray( this.elements );

	}

	copy( m ) {

		const te = this.elements;
		const me = m.elements;

		te[ 0 ] = me[ 0 ]; te[ 1 ] = me[ 1 ]; te[ 2 ] = me[ 2 ]; te[ 3 ] = me[ 3 ];
		te[ 4 ] = me[ 4 ]; te[ 5 ] = me[ 5 ]; te[ 6 ] = me[ 6 ]; te[ 7 ] = me[ 7 ];
		te[ 8 ] = me[ 8 ]; te[ 9 ] = me[ 9 ]; te[ 10 ] = me[ 10 ]; te[ 11 ] = me[ 11 ];
		te[ 12 ] = me[ 12 ]; te[ 13 ] = me[ 13 ]; te[ 14 ] = me[ 14 ]; te[ 15 ] = me[ 15 ];

		return this;

	}

	copyPosition( m ) {

		const te = this.elements, me = m.elements;

		te[ 12 ] = me[ 12 ];
		te[ 13 ] = me[ 13 ];
		te[ 14 ] = me[ 14 ];

		return this;

	}

	setFromMatrix3( m ) {

		const me = m.elements;

		this.set(

			me[ 0 ], me[ 3 ], me[ 6 ], 0,
			me[ 1 ], me[ 4 ], me[ 7 ], 0,
			me[ 2 ], me[ 5 ], me[ 8 ], 0,
			0, 0, 0, 1

		);

		return this;

	}

	extractBasis( xAxis, yAxis, zAxis ) {

		xAxis.setFromMatrixColumn( this, 0 );
		yAxis.setFromMatrixColumn( this, 1 );
		zAxis.setFromMatrixColumn( this, 2 );

		return this;

	}

	makeBasis( xAxis, yAxis, zAxis ) {

		this.set(
			xAxis.x, yAxis.x, zAxis.x, 0,
			xAxis.y, yAxis.y, zAxis.y, 0,
			xAxis.z, yAxis.z, zAxis.z, 0,
			0, 0, 0, 1
		);

		return this;

	}

	extractRotation( m ) {

		// this method does not support reflection matrices

		const te = this.elements;
		const me = m.elements;

		const scaleX = 1 / _v1$5.setFromMatrixColumn( m, 0 ).length();
		const scaleY = 1 / _v1$5.setFromMatrixColumn( m, 1 ).length();
		const scaleZ = 1 / _v1$5.setFromMatrixColumn( m, 2 ).length();

		te[ 0 ] = me[ 0 ] * scaleX;
		te[ 1 ] = me[ 1 ] * scaleX;
		te[ 2 ] = me[ 2 ] * scaleX;
		te[ 3 ] = 0;

		te[ 4 ] = me[ 4 ] * scaleY;
		te[ 5 ] = me[ 5 ] * scaleY;
		te[ 6 ] = me[ 6 ] * scaleY;
		te[ 7 ] = 0;

		te[ 8 ] = me[ 8 ] * scaleZ;
		te[ 9 ] = me[ 9 ] * scaleZ;
		te[ 10 ] = me[ 10 ] * scaleZ;
		te[ 11 ] = 0;

		te[ 12 ] = 0;
		te[ 13 ] = 0;
		te[ 14 ] = 0;
		te[ 15 ] = 1;

		return this;

	}

	makeRotationFromEuler( euler ) {

		const te = this.elements;

		const x = euler.x, y = euler.y, z = euler.z;
		const a = Math.cos( x ), b = Math.sin( x );
		const c = Math.cos( y ), d = Math.sin( y );
		const e = Math.cos( z ), f = Math.sin( z );

		if ( euler.order === 'XYZ' ) {

			const ae = a * e, af = a * f, be = b * e, bf = b * f;

			te[ 0 ] = c * e;
			te[ 4 ] = - c * f;
			te[ 8 ] = d;

			te[ 1 ] = af + be * d;
			te[ 5 ] = ae - bf * d;
			te[ 9 ] = - b * c;

			te[ 2 ] = bf - ae * d;
			te[ 6 ] = be + af * d;
			te[ 10 ] = a * c;

		} else if ( euler.order === 'YXZ' ) {

			const ce = c * e, cf = c * f, de = d * e, df = d * f;

			te[ 0 ] = ce + df * b;
			te[ 4 ] = de * b - cf;
			te[ 8 ] = a * d;

			te[ 1 ] = a * f;
			te[ 5 ] = a * e;
			te[ 9 ] = - b;

			te[ 2 ] = cf * b - de;
			te[ 6 ] = df + ce * b;
			te[ 10 ] = a * c;

		} else if ( euler.order === 'ZXY' ) {

			const ce = c * e, cf = c * f, de = d * e, df = d * f;

			te[ 0 ] = ce - df * b;
			te[ 4 ] = - a * f;
			te[ 8 ] = de + cf * b;

			te[ 1 ] = cf + de * b;
			te[ 5 ] = a * e;
			te[ 9 ] = df - ce * b;

			te[ 2 ] = - a * d;
			te[ 6 ] = b;
			te[ 10 ] = a * c;

		} else if ( euler.order === 'ZYX' ) {

			const ae = a * e, af = a * f, be = b * e, bf = b * f;

			te[ 0 ] = c * e;
			te[ 4 ] = be * d - af;
			te[ 8 ] = ae * d + bf;

			te[ 1 ] = c * f;
			te[ 5 ] = bf * d + ae;
			te[ 9 ] = af * d - be;

			te[ 2 ] = - d;
			te[ 6 ] = b * c;
			te[ 10 ] = a * c;

		} else if ( euler.order === 'YZX' ) {

			const ac = a * c, ad = a * d, bc = b * c, bd = b * d;

			te[ 0 ] = c * e;
			te[ 4 ] = bd - ac * f;
			te[ 8 ] = bc * f + ad;

			te[ 1 ] = f;
			te[ 5 ] = a * e;
			te[ 9 ] = - b * e;

			te[ 2 ] = - d * e;
			te[ 6 ] = ad * f + bc;
			te[ 10 ] = ac - bd * f;

		} else if ( euler.order === 'XZY' ) {

			const ac = a * c, ad = a * d, bc = b * c, bd = b * d;

			te[ 0 ] = c * e;
			te[ 4 ] = - f;
			te[ 8 ] = d * e;

			te[ 1 ] = ac * f + bd;
			te[ 5 ] = a * e;
			te[ 9 ] = ad * f - bc;

			te[ 2 ] = bc * f - ad;
			te[ 6 ] = b * e;
			te[ 10 ] = bd * f + ac;

		}

		// bottom row
		te[ 3 ] = 0;
		te[ 7 ] = 0;
		te[ 11 ] = 0;

		// last column
		te[ 12 ] = 0;
		te[ 13 ] = 0;
		te[ 14 ] = 0;
		te[ 15 ] = 1;

		return this;

	}

	makeRotationFromQuaternion( q ) {

		return this.compose( _zero, q, _one );

	}

	lookAt( eye, target, up ) {

		const te = this.elements;

		_z.subVectors( eye, target );

		if ( _z.lengthSq() === 0 ) {

			// eye and target are in the same position

			_z.z = 1;

		}

		_z.normalize();
		_x.crossVectors( up, _z );

		if ( _x.lengthSq() === 0 ) {

			// up and z are parallel

			if ( Math.abs( up.z ) === 1 ) {

				_z.x += 0.0001;

			} else {

				_z.z += 0.0001;

			}

			_z.normalize();
			_x.crossVectors( up, _z );

		}

		_x.normalize();
		_y.crossVectors( _z, _x );

		te[ 0 ] = _x.x; te[ 4 ] = _y.x; te[ 8 ] = _z.x;
		te[ 1 ] = _x.y; te[ 5 ] = _y.y; te[ 9 ] = _z.y;
		te[ 2 ] = _x.z; te[ 6 ] = _y.z; te[ 10 ] = _z.z;

		return this;

	}

	multiply( m ) {

		return this.multiplyMatrices( this, m );

	}

	premultiply( m ) {

		return this.multiplyMatrices( m, this );

	}

	multiplyMatrices( a, b ) {

		const ae = a.elements;
		const be = b.elements;
		const te = this.elements;

		const a11 = ae[ 0 ], a12 = ae[ 4 ], a13 = ae[ 8 ], a14 = ae[ 12 ];
		const a21 = ae[ 1 ], a22 = ae[ 5 ], a23 = ae[ 9 ], a24 = ae[ 13 ];
		const a31 = ae[ 2 ], a32 = ae[ 6 ], a33 = ae[ 10 ], a34 = ae[ 14 ];
		const a41 = ae[ 3 ], a42 = ae[ 7 ], a43 = ae[ 11 ], a44 = ae[ 15 ];

		const b11 = be[ 0 ], b12 = be[ 4 ], b13 = be[ 8 ], b14 = be[ 12 ];
		const b21 = be[ 1 ], b22 = be[ 5 ], b23 = be[ 9 ], b24 = be[ 13 ];
		const b31 = be[ 2 ], b32 = be[ 6 ], b33 = be[ 10 ], b34 = be[ 14 ];
		const b41 = be[ 3 ], b42 = be[ 7 ], b43 = be[ 11 ], b44 = be[ 15 ];

		te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		te[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		te[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		te[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

		te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		te[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		te[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		te[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

		te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		te[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		te[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		te[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

		te[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		te[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		te[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		te[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

		return this;

	}

	multiplyScalar( s ) {

		const te = this.elements;

		te[ 0 ] *= s; te[ 4 ] *= s; te[ 8 ] *= s; te[ 12 ] *= s;
		te[ 1 ] *= s; te[ 5 ] *= s; te[ 9 ] *= s; te[ 13 ] *= s;
		te[ 2 ] *= s; te[ 6 ] *= s; te[ 10 ] *= s; te[ 14 ] *= s;
		te[ 3 ] *= s; te[ 7 ] *= s; te[ 11 ] *= s; te[ 15 ] *= s;

		return this;

	}

	determinant() {

		const te = this.elements;

		const n11 = te[ 0 ], n12 = te[ 4 ], n13 = te[ 8 ], n14 = te[ 12 ];
		const n21 = te[ 1 ], n22 = te[ 5 ], n23 = te[ 9 ], n24 = te[ 13 ];
		const n31 = te[ 2 ], n32 = te[ 6 ], n33 = te[ 10 ], n34 = te[ 14 ];
		const n41 = te[ 3 ], n42 = te[ 7 ], n43 = te[ 11 ], n44 = te[ 15 ];

		//TODO: make this more efficient
		//( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

		return (
			n41 * (
				+ n14 * n23 * n32
				 - n13 * n24 * n32
				 - n14 * n22 * n33
				 + n12 * n24 * n33
				 + n13 * n22 * n34
				 - n12 * n23 * n34
			) +
			n42 * (
				+ n11 * n23 * n34
				 - n11 * n24 * n33
				 + n14 * n21 * n33
				 - n13 * n21 * n34
				 + n13 * n24 * n31
				 - n14 * n23 * n31
			) +
			n43 * (
				+ n11 * n24 * n32
				 - n11 * n22 * n34
				 - n14 * n21 * n32
				 + n12 * n21 * n34
				 + n14 * n22 * n31
				 - n12 * n24 * n31
			) +
			n44 * (
				- n13 * n22 * n31
				 - n11 * n23 * n32
				 + n11 * n22 * n33
				 + n13 * n21 * n32
				 - n12 * n21 * n33
				 + n12 * n23 * n31
			)

		);

	}

	transpose() {

		const te = this.elements;
		let tmp;

		tmp = te[ 1 ]; te[ 1 ] = te[ 4 ]; te[ 4 ] = tmp;
		tmp = te[ 2 ]; te[ 2 ] = te[ 8 ]; te[ 8 ] = tmp;
		tmp = te[ 6 ]; te[ 6 ] = te[ 9 ]; te[ 9 ] = tmp;

		tmp = te[ 3 ]; te[ 3 ] = te[ 12 ]; te[ 12 ] = tmp;
		tmp = te[ 7 ]; te[ 7 ] = te[ 13 ]; te[ 13 ] = tmp;
		tmp = te[ 11 ]; te[ 11 ] = te[ 14 ]; te[ 14 ] = tmp;

		return this;

	}

	setPosition( x, y, z ) {

		const te = this.elements;

		if ( x.isVector3 ) {

			te[ 12 ] = x.x;
			te[ 13 ] = x.y;
			te[ 14 ] = x.z;

		} else {

			te[ 12 ] = x;
			te[ 13 ] = y;
			te[ 14 ] = z;

		}

		return this;

	}

	invert() {

		// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
		const te = this.elements,

			n11 = te[ 0 ], n21 = te[ 1 ], n31 = te[ 2 ], n41 = te[ 3 ],
			n12 = te[ 4 ], n22 = te[ 5 ], n32 = te[ 6 ], n42 = te[ 7 ],
			n13 = te[ 8 ], n23 = te[ 9 ], n33 = te[ 10 ], n43 = te[ 11 ],
			n14 = te[ 12 ], n24 = te[ 13 ], n34 = te[ 14 ], n44 = te[ 15 ],

			t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
			t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
			t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
			t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

		const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

		if ( det === 0 ) return this.set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );

		const detInv = 1 / det;

		te[ 0 ] = t11 * detInv;
		te[ 1 ] = ( n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44 ) * detInv;
		te[ 2 ] = ( n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44 ) * detInv;
		te[ 3 ] = ( n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43 ) * detInv;

		te[ 4 ] = t12 * detInv;
		te[ 5 ] = ( n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44 ) * detInv;
		te[ 6 ] = ( n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44 ) * detInv;
		te[ 7 ] = ( n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43 ) * detInv;

		te[ 8 ] = t13 * detInv;
		te[ 9 ] = ( n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44 ) * detInv;
		te[ 10 ] = ( n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44 ) * detInv;
		te[ 11 ] = ( n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43 ) * detInv;

		te[ 12 ] = t14 * detInv;
		te[ 13 ] = ( n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34 ) * detInv;
		te[ 14 ] = ( n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34 ) * detInv;
		te[ 15 ] = ( n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33 ) * detInv;

		return this;

	}

	scale( v ) {

		const te = this.elements;
		const x = v.x, y = v.y, z = v.z;

		te[ 0 ] *= x; te[ 4 ] *= y; te[ 8 ] *= z;
		te[ 1 ] *= x; te[ 5 ] *= y; te[ 9 ] *= z;
		te[ 2 ] *= x; te[ 6 ] *= y; te[ 10 ] *= z;
		te[ 3 ] *= x; te[ 7 ] *= y; te[ 11 ] *= z;

		return this;

	}

	getMaxScaleOnAxis() {

		const te = this.elements;

		const scaleXSq = te[ 0 ] * te[ 0 ] + te[ 1 ] * te[ 1 ] + te[ 2 ] * te[ 2 ];
		const scaleYSq = te[ 4 ] * te[ 4 ] + te[ 5 ] * te[ 5 ] + te[ 6 ] * te[ 6 ];
		const scaleZSq = te[ 8 ] * te[ 8 ] + te[ 9 ] * te[ 9 ] + te[ 10 ] * te[ 10 ];

		return Math.sqrt( Math.max( scaleXSq, scaleYSq, scaleZSq ) );

	}

	makeTranslation( x, y, z ) {

		if ( x.isVector3 ) {

			this.set(

				1, 0, 0, x.x,
				0, 1, 0, x.y,
				0, 0, 1, x.z,
				0, 0, 0, 1

			);

		} else {

			this.set(

				1, 0, 0, x,
				0, 1, 0, y,
				0, 0, 1, z,
				0, 0, 0, 1

			);

		}

		return this;

	}

	makeRotationX( theta ) {

		const c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			1, 0, 0, 0,
			0, c, - s, 0,
			0, s, c, 0,
			0, 0, 0, 1

		);

		return this;

	}

	makeRotationY( theta ) {

		const c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			 c, 0, s, 0,
			 0, 1, 0, 0,
			- s, 0, c, 0,
			 0, 0, 0, 1

		);

		return this;

	}

	makeRotationZ( theta ) {

		const c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			c, - s, 0, 0,
			s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		);

		return this;

	}

	makeRotationAxis( axis, angle ) {

		// Based on http://www.gamedev.net/reference/articles/article1199.asp

		const c = Math.cos( angle );
		const s = Math.sin( angle );
		const t = 1 - c;
		const x = axis.x, y = axis.y, z = axis.z;
		const tx = t * x, ty = t * y;

		this.set(

			tx * x + c, tx * y - s * z, tx * z + s * y, 0,
			tx * y + s * z, ty * y + c, ty * z - s * x, 0,
			tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
			0, 0, 0, 1

		);

		return this;

	}

	makeScale( x, y, z ) {

		this.set(

			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1

		);

		return this;

	}

	makeShear( xy, xz, yx, yz, zx, zy ) {

		this.set(

			1, yx, zx, 0,
			xy, 1, zy, 0,
			xz, yz, 1, 0,
			0, 0, 0, 1

		);

		return this;

	}

	compose( position, quaternion, scale ) {

		const te = this.elements;

		const x = quaternion._x, y = quaternion._y, z = quaternion._z, w = quaternion._w;
		const x2 = x + x,	y2 = y + y, z2 = z + z;
		const xx = x * x2, xy = x * y2, xz = x * z2;
		const yy = y * y2, yz = y * z2, zz = z * z2;
		const wx = w * x2, wy = w * y2, wz = w * z2;

		const sx = scale.x, sy = scale.y, sz = scale.z;

		te[ 0 ] = ( 1 - ( yy + zz ) ) * sx;
		te[ 1 ] = ( xy + wz ) * sx;
		te[ 2 ] = ( xz - wy ) * sx;
		te[ 3 ] = 0;

		te[ 4 ] = ( xy - wz ) * sy;
		te[ 5 ] = ( 1 - ( xx + zz ) ) * sy;
		te[ 6 ] = ( yz + wx ) * sy;
		te[ 7 ] = 0;

		te[ 8 ] = ( xz + wy ) * sz;
		te[ 9 ] = ( yz - wx ) * sz;
		te[ 10 ] = ( 1 - ( xx + yy ) ) * sz;
		te[ 11 ] = 0;

		te[ 12 ] = position.x;
		te[ 13 ] = position.y;
		te[ 14 ] = position.z;
		te[ 15 ] = 1;

		return this;

	}

	decompose( position, quaternion, scale ) {

		const te = this.elements;

		let sx = _v1$5.set( te[ 0 ], te[ 1 ], te[ 2 ] ).length();
		const sy = _v1$5.set( te[ 4 ], te[ 5 ], te[ 6 ] ).length();
		const sz = _v1$5.set( te[ 8 ], te[ 9 ], te[ 10 ] ).length();

		// if determine is negative, we need to invert one scale
		const det = this.determinant();
		if ( det < 0 ) sx = - sx;

		position.x = te[ 12 ];
		position.y = te[ 13 ];
		position.z = te[ 14 ];

		// scale the rotation part
		_m1$2.copy( this );

		const invSX = 1 / sx;
		const invSY = 1 / sy;
		const invSZ = 1 / sz;

		_m1$2.elements[ 0 ] *= invSX;
		_m1$2.elements[ 1 ] *= invSX;
		_m1$2.elements[ 2 ] *= invSX;

		_m1$2.elements[ 4 ] *= invSY;
		_m1$2.elements[ 5 ] *= invSY;
		_m1$2.elements[ 6 ] *= invSY;

		_m1$2.elements[ 8 ] *= invSZ;
		_m1$2.elements[ 9 ] *= invSZ;
		_m1$2.elements[ 10 ] *= invSZ;

		quaternion.setFromRotationMatrix( _m1$2 );

		scale.x = sx;
		scale.y = sy;
		scale.z = sz;

		return this;

	}

	makePerspective( left, right, top, bottom, near, far, coordinateSystem = WebGLCoordinateSystem ) {

		const te = this.elements;
		const x = 2 * near / ( right - left );
		const y = 2 * near / ( top - bottom );

		const a = ( right + left ) / ( right - left );
		const b = ( top + bottom ) / ( top - bottom );

		let c, d;

		if ( coordinateSystem === WebGLCoordinateSystem ) {

			c = - ( far + near ) / ( far - near );
			d = ( - 2 * far * near ) / ( far - near );

		} else if ( coordinateSystem === WebGPUCoordinateSystem ) {

			c = - far / ( far - near );
			d = ( - far * near ) / ( far - near );

		} else {

			throw new Error( 'THREE.Matrix4.makePerspective(): Invalid coordinate system: ' + coordinateSystem );

		}

		te[ 0 ] = x;	te[ 4 ] = 0;	te[ 8 ] = a; 	te[ 12 ] = 0;
		te[ 1 ] = 0;	te[ 5 ] = y;	te[ 9 ] = b; 	te[ 13 ] = 0;
		te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = c; 	te[ 14 ] = d;
		te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = - 1;	te[ 15 ] = 0;

		return this;

	}

	makeOrthographic( left, right, top, bottom, near, far, coordinateSystem = WebGLCoordinateSystem ) {

		const te = this.elements;
		const w = 1.0 / ( right - left );
		const h = 1.0 / ( top - bottom );
		const p = 1.0 / ( far - near );

		const x = ( right + left ) * w;
		const y = ( top + bottom ) * h;

		let z, zInv;

		if ( coordinateSystem === WebGLCoordinateSystem ) {

			z = ( far + near ) * p;
			zInv = - 2 * p;

		} else if ( coordinateSystem === WebGPUCoordinateSystem ) {

			z = near * p;
			zInv = - 1 * p;

		} else {

			throw new Error( 'THREE.Matrix4.makeOrthographic(): Invalid coordinate system: ' + coordinateSystem );

		}

		te[ 0 ] = 2 * w;	te[ 4 ] = 0;		te[ 8 ] = 0; 		te[ 12 ] = - x;
		te[ 1 ] = 0; 		te[ 5 ] = 2 * h;	te[ 9 ] = 0; 		te[ 13 ] = - y;
		te[ 2 ] = 0; 		te[ 6 ] = 0;		te[ 10 ] = zInv;	te[ 14 ] = - z;
		te[ 3 ] = 0; 		te[ 7 ] = 0;		te[ 11 ] = 0;		te[ 15 ] = 1;

		return this;

	}

	equals( matrix ) {

		const te = this.elements;
		const me = matrix.elements;

		for ( let i = 0; i < 16; i ++ ) {

			if ( te[ i ] !== me[ i ] ) return false;

		}

		return true;

	}

	fromArray( array, offset = 0 ) {

		for ( let i = 0; i < 16; i ++ ) {

			this.elements[ i ] = array[ i + offset ];

		}

		return this;

	}

	toArray( array = [], offset = 0 ) {

		const te = this.elements;

		array[ offset ] = te[ 0 ];
		array[ offset + 1 ] = te[ 1 ];
		array[ offset + 2 ] = te[ 2 ];
		array[ offset + 3 ] = te[ 3 ];

		array[ offset + 4 ] = te[ 4 ];
		array[ offset + 5 ] = te[ 5 ];
		array[ offset + 6 ] = te[ 6 ];
		array[ offset + 7 ] = te[ 7 ];

		array[ offset + 8 ] = te[ 8 ];
		array[ offset + 9 ] = te[ 9 ];
		array[ offset + 10 ] = te[ 10 ];
		array[ offset + 11 ] = te[ 11 ];

		array[ offset + 12 ] = te[ 12 ];
		array[ offset + 13 ] = te[ 13 ];
		array[ offset + 14 ] = te[ 14 ];
		array[ offset + 15 ] = te[ 15 ];

		return array;

	}

}

const _v1$5 = /*@__PURE__*/ new Vector3();
const _m1$2 = /*@__PURE__*/ new Matrix4();
const _zero = /*@__PURE__*/ new Vector3( 0, 0, 0 );
const _one = /*@__PURE__*/ new Vector3( 1, 1, 1 );
const _x = /*@__PURE__*/ new Vector3();
const _y = /*@__PURE__*/ new Vector3();
const _z = /*@__PURE__*/ new Vector3();

const _matrix$2 = /*@__PURE__*/ new Matrix4();
const _quaternion$3 = /*@__PURE__*/ new Quaternion();

class Euler {

	constructor( x = 0, y = 0, z = 0, order = Euler.DEFAULT_ORDER ) {

		this.isEuler = true;

		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order;

	}

	get x() {

		return this._x;

	}

	set x( value ) {

		this._x = value;
		this._onChangeCallback();

	}

	get y() {

		return this._y;

	}

	set y( value ) {

		this._y = value;
		this._onChangeCallback();

	}

	get z() {

		return this._z;

	}

	set z( value ) {

		this._z = value;
		this._onChangeCallback();

	}

	get order() {

		return this._order;

	}

	set order( value ) {

		this._order = value;
		this._onChangeCallback();

	}

	set( x, y, z, order = this._order ) {

		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order;

		this._onChangeCallback();

		return this;

	}

	clone() {

		return new this.constructor( this._x, this._y, this._z, this._order );

	}

	copy( euler ) {

		this._x = euler._x;
		this._y = euler._y;
		this._z = euler._z;
		this._order = euler._order;

		this._onChangeCallback();

		return this;

	}

	setFromRotationMatrix( m, order = this._order, update = true ) {

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		const te = m.elements;
		const m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ];
		const m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ];
		const m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ];

		switch ( order ) {

			case 'XYZ':

				this._y = Math.asin( clamp( m13, - 1, 1 ) );

				if ( Math.abs( m13 ) < 0.9999999 ) {

					this._x = Math.atan2( - m23, m33 );
					this._z = Math.atan2( - m12, m11 );

				} else {

					this._x = Math.atan2( m32, m22 );
					this._z = 0;

				}

				break;

			case 'YXZ':

				this._x = Math.asin( - clamp( m23, - 1, 1 ) );

				if ( Math.abs( m23 ) < 0.9999999 ) {

					this._y = Math.atan2( m13, m33 );
					this._z = Math.atan2( m21, m22 );

				} else {

					this._y = Math.atan2( - m31, m11 );
					this._z = 0;

				}

				break;

			case 'ZXY':

				this._x = Math.asin( clamp( m32, - 1, 1 ) );

				if ( Math.abs( m32 ) < 0.9999999 ) {

					this._y = Math.atan2( - m31, m33 );
					this._z = Math.atan2( - m12, m22 );

				} else {

					this._y = 0;
					this._z = Math.atan2( m21, m11 );

				}

				break;

			case 'ZYX':

				this._y = Math.asin( - clamp( m31, - 1, 1 ) );

				if ( Math.abs( m31 ) < 0.9999999 ) {

					this._x = Math.atan2( m32, m33 );
					this._z = Math.atan2( m21, m11 );

				} else {

					this._x = 0;
					this._z = Math.atan2( - m12, m22 );

				}

				break;

			case 'YZX':

				this._z = Math.asin( clamp( m21, - 1, 1 ) );

				if ( Math.abs( m21 ) < 0.9999999 ) {

					this._x = Math.atan2( - m23, m22 );
					this._y = Math.atan2( - m31, m11 );

				} else {

					this._x = 0;
					this._y = Math.atan2( m13, m33 );

				}

				break;

			case 'XZY':

				this._z = Math.asin( - clamp( m12, - 1, 1 ) );

				if ( Math.abs( m12 ) < 0.9999999 ) {

					this._x = Math.atan2( m32, m22 );
					this._y = Math.atan2( m13, m11 );

				} else {

					this._x = Math.atan2( - m23, m33 );
					this._y = 0;

				}

				break;

			default:

				console.warn( 'THREE.Euler: .setFromRotationMatrix() encountered an unknown order: ' + order );

		}

		this._order = order;

		if ( update === true ) this._onChangeCallback();

		return this;

	}

	setFromQuaternion( q, order, update ) {

		_matrix$2.makeRotationFromQuaternion( q );

		return this.setFromRotationMatrix( _matrix$2, order, update );

	}

	setFromVector3( v, order = this._order ) {

		return this.set( v.x, v.y, v.z, order );

	}

	reorder( newOrder ) {

		// WARNING: this discards revolution information -bhouston

		_quaternion$3.setFromEuler( this );

		return this.setFromQuaternion( _quaternion$3, newOrder );

	}

	equals( euler ) {

		return ( euler._x === this._x ) && ( euler._y === this._y ) && ( euler._z === this._z ) && ( euler._order === this._order );

	}

	fromArray( array ) {

		this._x = array[ 0 ];
		this._y = array[ 1 ];
		this._z = array[ 2 ];
		if ( array[ 3 ] !== undefined ) this._order = array[ 3 ];

		this._onChangeCallback();

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this._x;
		array[ offset + 1 ] = this._y;
		array[ offset + 2 ] = this._z;
		array[ offset + 3 ] = this._order;

		return array;

	}

	_onChange( callback ) {

		this._onChangeCallback = callback;

		return this;

	}

	_onChangeCallback() {}

	*[ Symbol.iterator ]() {

		yield this._x;
		yield this._y;
		yield this._z;
		yield this._order;

	}

}

Euler.DEFAULT_ORDER = 'XYZ';

class Layers {

	constructor() {

		this.mask = 1 | 0;

	}

	set( channel ) {

		this.mask = ( 1 << channel | 0 ) >>> 0;

	}

	enable( channel ) {

		this.mask |= 1 << channel | 0;

	}

	enableAll() {

		this.mask = 0xffffffff | 0;

	}

	toggle( channel ) {

		this.mask ^= 1 << channel | 0;

	}

	disable( channel ) {

		this.mask &= ~ ( 1 << channel | 0 );

	}

	disableAll() {

		this.mask = 0;

	}

	test( layers ) {

		return ( this.mask & layers.mask ) !== 0;

	}

	isEnabled( channel ) {

		return ( this.mask & ( 1 << channel | 0 ) ) !== 0;

	}

}

let _object3DId = 0;

const _v1$4 = /*@__PURE__*/ new Vector3();
const _q1 = /*@__PURE__*/ new Quaternion();
const _m1$1 = /*@__PURE__*/ new Matrix4();
const _target = /*@__PURE__*/ new Vector3();

const _position$3 = /*@__PURE__*/ new Vector3();
const _scale$2 = /*@__PURE__*/ new Vector3();
const _quaternion$2 = /*@__PURE__*/ new Quaternion();

const _xAxis = /*@__PURE__*/ new Vector3( 1, 0, 0 );
const _yAxis = /*@__PURE__*/ new Vector3( 0, 1, 0 );
const _zAxis = /*@__PURE__*/ new Vector3( 0, 0, 1 );

const _addedEvent = { type: 'added' };
const _removedEvent = { type: 'removed' };

const _childaddedEvent = { type: 'childadded', child: null };
const _childremovedEvent = { type: 'childremoved', child: null };

class Object3D extends EventDispatcher {

	constructor() {

		super();

		this.isObject3D = true;

		Object.defineProperty( this, 'id', { value: _object3DId ++ } );

		this.uuid = generateUUID();

		this.name = '';
		this.type = 'Object3D';

		this.parent = null;
		this.children = [];

		this.up = Object3D.DEFAULT_UP.clone();

		const position = new Vector3();
		const rotation = new Euler();
		const quaternion = new Quaternion();
		const scale = new Vector3( 1, 1, 1 );

		function onRotationChange() {

			quaternion.setFromEuler( rotation, false );

		}

		function onQuaternionChange() {

			rotation.setFromQuaternion( quaternion, undefined, false );

		}

		rotation._onChange( onRotationChange );
		quaternion._onChange( onQuaternionChange );

		Object.defineProperties( this, {
			position: {
				configurable: true,
				enumerable: true,
				value: position
			},
			rotation: {
				configurable: true,
				enumerable: true,
				value: rotation
			},
			quaternion: {
				configurable: true,
				enumerable: true,
				value: quaternion
			},
			scale: {
				configurable: true,
				enumerable: true,
				value: scale
			},
			modelViewMatrix: {
				value: new Matrix4()
			},
			normalMatrix: {
				value: new Matrix3()
			}
		} );

		this.matrix = new Matrix4();
		this.matrixWorld = new Matrix4();

		this.matrixAutoUpdate = Object3D.DEFAULT_MATRIX_AUTO_UPDATE;

		this.matrixWorldAutoUpdate = Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE; // checked by the renderer
		this.matrixWorldNeedsUpdate = false;

		this.layers = new Layers();
		this.visible = true;

		this.castShadow = false;
		this.receiveShadow = false;

		this.frustumCulled = true;
		this.renderOrder = 0;

		this.animations = [];

		this.userData = {};

	}

	onBeforeShadow( /* renderer, object, camera, shadowCamera, geometry, depthMaterial, group */ ) {}

	onAfterShadow( /* renderer, object, camera, shadowCamera, geometry, depthMaterial, group */ ) {}

	onBeforeRender( /* renderer, scene, camera, geometry, material, group */ ) {}

	onAfterRender( /* renderer, scene, camera, geometry, material, group */ ) {}

	applyMatrix4( matrix ) {

		if ( this.matrixAutoUpdate ) this.updateMatrix();

		this.matrix.premultiply( matrix );

		this.matrix.decompose( this.position, this.quaternion, this.scale );

	}

	applyQuaternion( q ) {

		this.quaternion.premultiply( q );

		return this;

	}

	setRotationFromAxisAngle( axis, angle ) {

		// assumes axis is normalized

		this.quaternion.setFromAxisAngle( axis, angle );

	}

	setRotationFromEuler( euler ) {

		this.quaternion.setFromEuler( euler, true );

	}

	setRotationFromMatrix( m ) {

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		this.quaternion.setFromRotationMatrix( m );

	}

	setRotationFromQuaternion( q ) {

		// assumes q is normalized

		this.quaternion.copy( q );

	}

	rotateOnAxis( axis, angle ) {

		// rotate object on axis in object space
		// axis is assumed to be normalized

		_q1.setFromAxisAngle( axis, angle );

		this.quaternion.multiply( _q1 );

		return this;

	}

	rotateOnWorldAxis( axis, angle ) {

		// rotate object on axis in world space
		// axis is assumed to be normalized
		// method assumes no rotated parent

		_q1.setFromAxisAngle( axis, angle );

		this.quaternion.premultiply( _q1 );

		return this;

	}

	rotateX( angle ) {

		return this.rotateOnAxis( _xAxis, angle );

	}

	rotateY( angle ) {

		return this.rotateOnAxis( _yAxis, angle );

	}

	rotateZ( angle ) {

		return this.rotateOnAxis( _zAxis, angle );

	}

	translateOnAxis( axis, distance ) {

		// translate object by distance along axis in object space
		// axis is assumed to be normalized

		_v1$4.copy( axis ).applyQuaternion( this.quaternion );

		this.position.add( _v1$4.multiplyScalar( distance ) );

		return this;

	}

	translateX( distance ) {

		return this.translateOnAxis( _xAxis, distance );

	}

	translateY( distance ) {

		return this.translateOnAxis( _yAxis, distance );

	}

	translateZ( distance ) {

		return this.translateOnAxis( _zAxis, distance );

	}

	localToWorld( vector ) {

		this.updateWorldMatrix( true, false );

		return vector.applyMatrix4( this.matrixWorld );

	}

	worldToLocal( vector ) {

		this.updateWorldMatrix( true, false );

		return vector.applyMatrix4( _m1$1.copy( this.matrixWorld ).invert() );

	}

	lookAt( x, y, z ) {

		// This method does not support objects having non-uniformly-scaled parent(s)

		if ( x.isVector3 ) {

			_target.copy( x );

		} else {

			_target.set( x, y, z );

		}

		const parent = this.parent;

		this.updateWorldMatrix( true, false );

		_position$3.setFromMatrixPosition( this.matrixWorld );

		if ( this.isCamera || this.isLight ) {

			_m1$1.lookAt( _position$3, _target, this.up );

		} else {

			_m1$1.lookAt( _target, _position$3, this.up );

		}

		this.quaternion.setFromRotationMatrix( _m1$1 );

		if ( parent ) {

			_m1$1.extractRotation( parent.matrixWorld );
			_q1.setFromRotationMatrix( _m1$1 );
			this.quaternion.premultiply( _q1.invert() );

		}

	}

	add( object ) {

		if ( arguments.length > 1 ) {

			for ( let i = 0; i < arguments.length; i ++ ) {

				this.add( arguments[ i ] );

			}

			return this;

		}

		if ( object === this ) {

			console.error( 'THREE.Object3D.add: object can\'t be added as a child of itself.', object );
			return this;

		}

		if ( object && object.isObject3D ) {

			object.removeFromParent();
			object.parent = this;
			this.children.push( object );

			object.dispatchEvent( _addedEvent );

			_childaddedEvent.child = object;
			this.dispatchEvent( _childaddedEvent );
			_childaddedEvent.child = null;

		} else {

			console.error( 'THREE.Object3D.add: object not an instance of THREE.Object3D.', object );

		}

		return this;

	}

	remove( object ) {

		if ( arguments.length > 1 ) {

			for ( let i = 0; i < arguments.length; i ++ ) {

				this.remove( arguments[ i ] );

			}

			return this;

		}

		const index = this.children.indexOf( object );

		if ( index !== - 1 ) {

			object.parent = null;
			this.children.splice( index, 1 );

			object.dispatchEvent( _removedEvent );

			_childremovedEvent.child = object;
			this.dispatchEvent( _childremovedEvent );
			_childremovedEvent.child = null;

		}

		return this;

	}

	removeFromParent() {

		const parent = this.parent;

		if ( parent !== null ) {

			parent.remove( this );

		}

		return this;

	}

	clear() {

		return this.remove( ... this.children );

	}

	attach( object ) {

		// adds object as a child of this, while maintaining the object's world transform

		// Note: This method does not support scene graphs having non-uniformly-scaled nodes(s)

		this.updateWorldMatrix( true, false );

		_m1$1.copy( this.matrixWorld ).invert();

		if ( object.parent !== null ) {

			object.parent.updateWorldMatrix( true, false );

			_m1$1.multiply( object.parent.matrixWorld );

		}

		object.applyMatrix4( _m1$1 );

		object.removeFromParent();
		object.parent = this;
		this.children.push( object );

		object.updateWorldMatrix( false, true );

		object.dispatchEvent( _addedEvent );

		_childaddedEvent.child = object;
		this.dispatchEvent( _childaddedEvent );
		_childaddedEvent.child = null;

		return this;

	}

	getObjectById( id ) {

		return this.getObjectByProperty( 'id', id );

	}

	getObjectByName( name ) {

		return this.getObjectByProperty( 'name', name );

	}

	getObjectByProperty( name, value ) {

		if ( this[ name ] === value ) return this;

		for ( let i = 0, l = this.children.length; i < l; i ++ ) {

			const child = this.children[ i ];
			const object = child.getObjectByProperty( name, value );

			if ( object !== undefined ) {

				return object;

			}

		}

		return undefined;

	}

	getObjectsByProperty( name, value, result = [] ) {

		if ( this[ name ] === value ) result.push( this );

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].getObjectsByProperty( name, value, result );

		}

		return result;

	}

	getWorldPosition( target ) {

		this.updateWorldMatrix( true, false );

		return target.setFromMatrixPosition( this.matrixWorld );

	}

	getWorldQuaternion( target ) {

		this.updateWorldMatrix( true, false );

		this.matrixWorld.decompose( _position$3, target, _scale$2 );

		return target;

	}

	getWorldScale( target ) {

		this.updateWorldMatrix( true, false );

		this.matrixWorld.decompose( _position$3, _quaternion$2, target );

		return target;

	}

	getWorldDirection( target ) {

		this.updateWorldMatrix( true, false );

		const e = this.matrixWorld.elements;

		return target.set( e[ 8 ], e[ 9 ], e[ 10 ] ).normalize();

	}

	raycast( /* raycaster, intersects */ ) {}

	traverse( callback ) {

		callback( this );

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].traverse( callback );

		}

	}

	traverseVisible( callback ) {

		if ( this.visible === false ) return;

		callback( this );

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].traverseVisible( callback );

		}

	}

	traverseAncestors( callback ) {

		const parent = this.parent;

		if ( parent !== null ) {

			callback( parent );

			parent.traverseAncestors( callback );

		}

	}

	updateMatrix() {

		this.matrix.compose( this.position, this.quaternion, this.scale );

		this.matrixWorldNeedsUpdate = true;

	}

	updateMatrixWorld( force ) {

		if ( this.matrixAutoUpdate ) this.updateMatrix();

		if ( this.matrixWorldNeedsUpdate || force ) {

			if ( this.matrixWorldAutoUpdate === true ) {

				if ( this.parent === null ) {

					this.matrixWorld.copy( this.matrix );

				} else {

					this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

				}

			}

			this.matrixWorldNeedsUpdate = false;

			force = true;

		}

		// make sure descendants are updated if required

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			const child = children[ i ];

			child.updateMatrixWorld( force );

		}

	}

	updateWorldMatrix( updateParents, updateChildren ) {

		const parent = this.parent;

		if ( updateParents === true && parent !== null ) {

			parent.updateWorldMatrix( true, false );

		}

		if ( this.matrixAutoUpdate ) this.updateMatrix();

		if ( this.matrixWorldAutoUpdate === true ) {

			if ( this.parent === null ) {

				this.matrixWorld.copy( this.matrix );

			} else {

				this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

			}

		}

		// make sure descendants are updated

		if ( updateChildren === true ) {

			const children = this.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {

				const child = children[ i ];

				child.updateWorldMatrix( false, true );

			}

		}

	}

	toJSON( meta ) {

		// meta is a string when called from JSON.stringify
		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		const output = {};

		// meta is a hash used to collect geometries, materials.
		// not providing it implies that this is the root object
		// being serialized.
		if ( isRootObject ) {

			// initialize meta obj
			meta = {
				geometries: {},
				materials: {},
				textures: {},
				images: {},
				shapes: {},
				skeletons: {},
				animations: {},
				nodes: {}
			};

			output.metadata = {
				version: 4.6,
				type: 'Object',
				generator: 'Object3D.toJSON'
			};

		}

		// standard Object3D serialization

		const object = {};

		object.uuid = this.uuid;
		object.type = this.type;

		if ( this.name !== '' ) object.name = this.name;
		if ( this.castShadow === true ) object.castShadow = true;
		if ( this.receiveShadow === true ) object.receiveShadow = true;
		if ( this.visible === false ) object.visible = false;
		if ( this.frustumCulled === false ) object.frustumCulled = false;
		if ( this.renderOrder !== 0 ) object.renderOrder = this.renderOrder;
		if ( Object.keys( this.userData ).length > 0 ) object.userData = this.userData;

		object.layers = this.layers.mask;
		object.matrix = this.matrix.toArray();
		object.up = this.up.toArray();

		if ( this.matrixAutoUpdate === false ) object.matrixAutoUpdate = false;

		// object specific properties

		if ( this.isInstancedMesh ) {

			object.type = 'InstancedMesh';
			object.count = this.count;
			object.instanceMatrix = this.instanceMatrix.toJSON();
			if ( this.instanceColor !== null ) object.instanceColor = this.instanceColor.toJSON();

		}

		if ( this.isBatchedMesh ) {

			object.type = 'BatchedMesh';
			object.perObjectFrustumCulled = this.perObjectFrustumCulled;
			object.sortObjects = this.sortObjects;

			object.drawRanges = this._drawRanges;
			object.reservedRanges = this._reservedRanges;

			object.visibility = this._visibility;
			object.active = this._active;
			object.bounds = this._bounds.map( bound => ( {
				boxInitialized: bound.boxInitialized,
				boxMin: bound.box.min.toArray(),
				boxMax: bound.box.max.toArray(),

				sphereInitialized: bound.sphereInitialized,
				sphereRadius: bound.sphere.radius,
				sphereCenter: bound.sphere.center.toArray()
			} ) );

			object.maxInstanceCount = this._maxInstanceCount;
			object.maxVertexCount = this._maxVertexCount;
			object.maxIndexCount = this._maxIndexCount;

			object.geometryInitialized = this._geometryInitialized;
			object.geometryCount = this._geometryCount;

			object.matricesTexture = this._matricesTexture.toJSON( meta );

			if ( this._colorsTexture !== null ) object.colorsTexture = this._colorsTexture.toJSON( meta );

			if ( this.boundingSphere !== null ) {

				object.boundingSphere = {
					center: object.boundingSphere.center.toArray(),
					radius: object.boundingSphere.radius
				};

			}

			if ( this.boundingBox !== null ) {

				object.boundingBox = {
					min: object.boundingBox.min.toArray(),
					max: object.boundingBox.max.toArray()
				};

			}

		}

		//

		function serialize( library, element ) {

			if ( library[ element.uuid ] === undefined ) {

				library[ element.uuid ] = element.toJSON( meta );

			}

			return element.uuid;

		}

		if ( this.isScene ) {

			if ( this.background ) {

				if ( this.background.isColor ) {

					object.background = this.background.toJSON();

				} else if ( this.background.isTexture ) {

					object.background = this.background.toJSON( meta ).uuid;

				}

			}

			if ( this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== true ) {

				object.environment = this.environment.toJSON( meta ).uuid;

			}

		} else if ( this.isMesh || this.isLine || this.isPoints ) {

			object.geometry = serialize( meta.geometries, this.geometry );

			const parameters = this.geometry.parameters;

			if ( parameters !== undefined && parameters.shapes !== undefined ) {

				const shapes = parameters.shapes;

				if ( Array.isArray( shapes ) ) {

					for ( let i = 0, l = shapes.length; i < l; i ++ ) {

						const shape = shapes[ i ];

						serialize( meta.shapes, shape );

					}

				} else {

					serialize( meta.shapes, shapes );

				}

			}

		}

		if ( this.isSkinnedMesh ) {

			object.bindMode = this.bindMode;
			object.bindMatrix = this.bindMatrix.toArray();

			if ( this.skeleton !== undefined ) {

				serialize( meta.skeletons, this.skeleton );

				object.skeleton = this.skeleton.uuid;

			}

		}

		if ( this.material !== undefined ) {

			if ( Array.isArray( this.material ) ) {

				const uuids = [];

				for ( let i = 0, l = this.material.length; i < l; i ++ ) {

					uuids.push( serialize( meta.materials, this.material[ i ] ) );

				}

				object.material = uuids;

			} else {

				object.material = serialize( meta.materials, this.material );

			}

		}

		//

		if ( this.children.length > 0 ) {

			object.children = [];

			for ( let i = 0; i < this.children.length; i ++ ) {

				object.children.push( this.children[ i ].toJSON( meta ).object );

			}

		}

		//

		if ( this.animations.length > 0 ) {

			object.animations = [];

			for ( let i = 0; i < this.animations.length; i ++ ) {

				const animation = this.animations[ i ];

				object.animations.push( serialize( meta.animations, animation ) );

			}

		}

		if ( isRootObject ) {

			const geometries = extractFromCache( meta.geometries );
			const materials = extractFromCache( meta.materials );
			const textures = extractFromCache( meta.textures );
			const images = extractFromCache( meta.images );
			const shapes = extractFromCache( meta.shapes );
			const skeletons = extractFromCache( meta.skeletons );
			const animations = extractFromCache( meta.animations );
			const nodes = extractFromCache( meta.nodes );

			if ( geometries.length > 0 ) output.geometries = geometries;
			if ( materials.length > 0 ) output.materials = materials;
			if ( textures.length > 0 ) output.textures = textures;
			if ( images.length > 0 ) output.images = images;
			if ( shapes.length > 0 ) output.shapes = shapes;
			if ( skeletons.length > 0 ) output.skeletons = skeletons;
			if ( animations.length > 0 ) output.animations = animations;
			if ( nodes.length > 0 ) output.nodes = nodes;

		}

		output.object = object;

		return output;

		// extract data from the cache hash
		// remove metadata on each item
		// and return as array
		function extractFromCache( cache ) {

			const values = [];
			for ( const key in cache ) {

				const data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}

			return values;

		}

	}

	clone( recursive ) {

		return new this.constructor().copy( this, recursive );

	}

	copy( source, recursive = true ) {

		this.name = source.name;

		this.up.copy( source.up );

		this.position.copy( source.position );
		this.rotation.order = source.rotation.order;
		this.quaternion.copy( source.quaternion );
		this.scale.copy( source.scale );

		this.matrix.copy( source.matrix );
		this.matrixWorld.copy( source.matrixWorld );

		this.matrixAutoUpdate = source.matrixAutoUpdate;

		this.matrixWorldAutoUpdate = source.matrixWorldAutoUpdate;
		this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

		this.layers.mask = source.layers.mask;
		this.visible = source.visible;

		this.castShadow = source.castShadow;
		this.receiveShadow = source.receiveShadow;

		this.frustumCulled = source.frustumCulled;
		this.renderOrder = source.renderOrder;

		this.animations = source.animations.slice();

		this.userData = JSON.parse( JSON.stringify( source.userData ) );

		if ( recursive === true ) {

			for ( let i = 0; i < source.children.length; i ++ ) {

				const child = source.children[ i ];
				this.add( child.clone() );

			}

		}

		return this;

	}

}

Object3D.DEFAULT_UP = /*@__PURE__*/ new Vector3( 0, 1, 0 );
Object3D.DEFAULT_MATRIX_AUTO_UPDATE = true;
Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = true;

const _v0$1 = /*@__PURE__*/ new Vector3();
const _v1$3 = /*@__PURE__*/ new Vector3();
const _v2$2 = /*@__PURE__*/ new Vector3();
const _v3$2 = /*@__PURE__*/ new Vector3();

const _vab = /*@__PURE__*/ new Vector3();
const _vac = /*@__PURE__*/ new Vector3();
const _vbc = /*@__PURE__*/ new Vector3();
const _vap = /*@__PURE__*/ new Vector3();
const _vbp = /*@__PURE__*/ new Vector3();
const _vcp = /*@__PURE__*/ new Vector3();

const _v40 = /*@__PURE__*/ new Vector4();
const _v41 = /*@__PURE__*/ new Vector4();
const _v42 = /*@__PURE__*/ new Vector4();

class Triangle {

	constructor( a = new Vector3(), b = new Vector3(), c = new Vector3() ) {

		this.a = a;
		this.b = b;
		this.c = c;

	}

	static getNormal( a, b, c, target ) {

		target.subVectors( c, b );
		_v0$1.subVectors( a, b );
		target.cross( _v0$1 );

		const targetLengthSq = target.lengthSq();
		if ( targetLengthSq > 0 ) {

			return target.multiplyScalar( 1 / Math.sqrt( targetLengthSq ) );

		}

		return target.set( 0, 0, 0 );

	}

	// static/instance method to calculate barycentric coordinates
	// based on: http://www.blackpawn.com/texts/pointinpoly/default.html
	static getBarycoord( point, a, b, c, target ) {

		_v0$1.subVectors( c, a );
		_v1$3.subVectors( b, a );
		_v2$2.subVectors( point, a );

		const dot00 = _v0$1.dot( _v0$1 );
		const dot01 = _v0$1.dot( _v1$3 );
		const dot02 = _v0$1.dot( _v2$2 );
		const dot11 = _v1$3.dot( _v1$3 );
		const dot12 = _v1$3.dot( _v2$2 );

		const denom = ( dot00 * dot11 - dot01 * dot01 );

		// collinear or singular triangle
		if ( denom === 0 ) {

			target.set( 0, 0, 0 );
			return null;

		}

		const invDenom = 1 / denom;
		const u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
		const v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

		// barycentric coordinates must always sum to 1
		return target.set( 1 - u - v, v, u );

	}

	static containsPoint( point, a, b, c ) {

		// if the triangle is degenerate then we can't contain a point
		if ( this.getBarycoord( point, a, b, c, _v3$2 ) === null ) {

			return false;

		}

		return ( _v3$2.x >= 0 ) && ( _v3$2.y >= 0 ) && ( ( _v3$2.x + _v3$2.y ) <= 1 );

	}

	static getInterpolation( point, p1, p2, p3, v1, v2, v3, target ) {

		if ( this.getBarycoord( point, p1, p2, p3, _v3$2 ) === null ) {

			target.x = 0;
			target.y = 0;
			if ( 'z' in target ) target.z = 0;
			if ( 'w' in target ) target.w = 0;
			return null;

		}

		target.setScalar( 0 );
		target.addScaledVector( v1, _v3$2.x );
		target.addScaledVector( v2, _v3$2.y );
		target.addScaledVector( v3, _v3$2.z );

		return target;

	}

	static getInterpolatedAttribute( attr, i1, i2, i3, barycoord, target ) {

		_v40.setScalar( 0 );
		_v41.setScalar( 0 );
		_v42.setScalar( 0 );

		_v40.fromBufferAttribute( attr, i1 );
		_v41.fromBufferAttribute( attr, i2 );
		_v42.fromBufferAttribute( attr, i3 );

		target.setScalar( 0 );
		target.addScaledVector( _v40, barycoord.x );
		target.addScaledVector( _v41, barycoord.y );
		target.addScaledVector( _v42, barycoord.z );

		return target;

	}

	static isFrontFacing( a, b, c, direction ) {

		_v0$1.subVectors( c, b );
		_v1$3.subVectors( a, b );

		// strictly front facing
		return ( _v0$1.cross( _v1$3 ).dot( direction ) < 0 ) ? true : false;

	}

	set( a, b, c ) {

		this.a.copy( a );
		this.b.copy( b );
		this.c.copy( c );

		return this;

	}

	setFromPointsAndIndices( points, i0, i1, i2 ) {

		this.a.copy( points[ i0 ] );
		this.b.copy( points[ i1 ] );
		this.c.copy( points[ i2 ] );

		return this;

	}

	setFromAttributeAndIndices( attribute, i0, i1, i2 ) {

		this.a.fromBufferAttribute( attribute, i0 );
		this.b.fromBufferAttribute( attribute, i1 );
		this.c.fromBufferAttribute( attribute, i2 );

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	copy( triangle ) {

		this.a.copy( triangle.a );
		this.b.copy( triangle.b );
		this.c.copy( triangle.c );

		return this;

	}

	getArea() {

		_v0$1.subVectors( this.c, this.b );
		_v1$3.subVectors( this.a, this.b );

		return _v0$1.cross( _v1$3 ).length() * 0.5;

	}

	getMidpoint( target ) {

		return target.addVectors( this.a, this.b ).add( this.c ).multiplyScalar( 1 / 3 );

	}

	getNormal( target ) {

		return Triangle.getNormal( this.a, this.b, this.c, target );

	}

	getPlane( target ) {

		return target.setFromCoplanarPoints( this.a, this.b, this.c );

	}

	getBarycoord( point, target ) {

		return Triangle.getBarycoord( point, this.a, this.b, this.c, target );

	}

	getInterpolation( point, v1, v2, v3, target ) {

		return Triangle.getInterpolation( point, this.a, this.b, this.c, v1, v2, v3, target );

	}

	containsPoint( point ) {

		return Triangle.containsPoint( point, this.a, this.b, this.c );

	}

	isFrontFacing( direction ) {

		return Triangle.isFrontFacing( this.a, this.b, this.c, direction );

	}

	intersectsBox( box ) {

		return box.intersectsTriangle( this );

	}

	closestPointToPoint( p, target ) {

		const a = this.a, b = this.b, c = this.c;
		let v, w;

		// algorithm thanks to Real-Time Collision Detection by Christer Ericson,
		// published by Morgan Kaufmann Publishers, (c) 2005 Elsevier Inc.,
		// under the accompanying license; see chapter 5.1.5 for detailed explanation.
		// basically, we're distinguishing which of the voronoi regions of the triangle
		// the point lies in with the minimum amount of redundant computation.

		_vab.subVectors( b, a );
		_vac.subVectors( c, a );
		_vap.subVectors( p, a );
		const d1 = _vab.dot( _vap );
		const d2 = _vac.dot( _vap );
		if ( d1 <= 0 && d2 <= 0 ) {

			// vertex region of A; barycentric coords (1, 0, 0)
			return target.copy( a );

		}

		_vbp.subVectors( p, b );
		const d3 = _vab.dot( _vbp );
		const d4 = _vac.dot( _vbp );
		if ( d3 >= 0 && d4 <= d3 ) {

			// vertex region of B; barycentric coords (0, 1, 0)
			return target.copy( b );

		}

		const vc = d1 * d4 - d3 * d2;
		if ( vc <= 0 && d1 >= 0 && d3 <= 0 ) {

			v = d1 / ( d1 - d3 );
			// edge region of AB; barycentric coords (1-v, v, 0)
			return target.copy( a ).addScaledVector( _vab, v );

		}

		_vcp.subVectors( p, c );
		const d5 = _vab.dot( _vcp );
		const d6 = _vac.dot( _vcp );
		if ( d6 >= 0 && d5 <= d6 ) {

			// vertex region of C; barycentric coords (0, 0, 1)
			return target.copy( c );

		}

		const vb = d5 * d2 - d1 * d6;
		if ( vb <= 0 && d2 >= 0 && d6 <= 0 ) {

			w = d2 / ( d2 - d6 );
			// edge region of AC; barycentric coords (1-w, 0, w)
			return target.copy( a ).addScaledVector( _vac, w );

		}

		const va = d3 * d6 - d5 * d4;
		if ( va <= 0 && ( d4 - d3 ) >= 0 && ( d5 - d6 ) >= 0 ) {

			_vbc.subVectors( c, b );
			w = ( d4 - d3 ) / ( ( d4 - d3 ) + ( d5 - d6 ) );
			// edge region of BC; barycentric coords (0, 1-w, w)
			return target.copy( b ).addScaledVector( _vbc, w ); // edge region of BC

		}

		// face region
		const denom = 1 / ( va + vb + vc );
		// u = va * denom
		v = vb * denom;
		w = vc * denom;

		return target.copy( a ).addScaledVector( _vab, v ).addScaledVector( _vac, w );

	}

	equals( triangle ) {

		return triangle.a.equals( this.a ) && triangle.b.equals( this.b ) && triangle.c.equals( this.c );

	}

}

const _colorKeywords = { 'aliceblue': 0xF0F8FF, 'antiquewhite': 0xFAEBD7, 'aqua': 0x00FFFF, 'aquamarine': 0x7FFFD4, 'azure': 0xF0FFFF,
	'beige': 0xF5F5DC, 'bisque': 0xFFE4C4, 'black': 0x000000, 'blanchedalmond': 0xFFEBCD, 'blue': 0x0000FF, 'blueviolet': 0x8A2BE2,
	'brown': 0xA52A2A, 'burlywood': 0xDEB887, 'cadetblue': 0x5F9EA0, 'chartreuse': 0x7FFF00, 'chocolate': 0xD2691E, 'coral': 0xFF7F50,
	'cornflowerblue': 0x6495ED, 'cornsilk': 0xFFF8DC, 'crimson': 0xDC143C, 'cyan': 0x00FFFF, 'darkblue': 0x00008B, 'darkcyan': 0x008B8B,
	'darkgoldenrod': 0xB8860B, 'darkgray': 0xA9A9A9, 'darkgreen': 0x006400, 'darkgrey': 0xA9A9A9, 'darkkhaki': 0xBDB76B, 'darkmagenta': 0x8B008B,
	'darkolivegreen': 0x556B2F, 'darkorange': 0xFF8C00, 'darkorchid': 0x9932CC, 'darkred': 0x8B0000, 'darksalmon': 0xE9967A, 'darkseagreen': 0x8FBC8F,
	'darkslateblue': 0x483D8B, 'darkslategray': 0x2F4F4F, 'darkslategrey': 0x2F4F4F, 'darkturquoise': 0x00CED1, 'darkviolet': 0x9400D3,
	'deeppink': 0xFF1493, 'deepskyblue': 0x00BFFF, 'dimgray': 0x696969, 'dimgrey': 0x696969, 'dodgerblue': 0x1E90FF, 'firebrick': 0xB22222,
	'floralwhite': 0xFFFAF0, 'forestgreen': 0x228B22, 'fuchsia': 0xFF00FF, 'gainsboro': 0xDCDCDC, 'ghostwhite': 0xF8F8FF, 'gold': 0xFFD700,
	'goldenrod': 0xDAA520, 'gray': 0x808080, 'green': 0x008000, 'greenyellow': 0xADFF2F, 'grey': 0x808080, 'honeydew': 0xF0FFF0, 'hotpink': 0xFF69B4,
	'indianred': 0xCD5C5C, 'indigo': 0x4B0082, 'ivory': 0xFFFFF0, 'khaki': 0xF0E68C, 'lavender': 0xE6E6FA, 'lavenderblush': 0xFFF0F5, 'lawngreen': 0x7CFC00,
	'lemonchiffon': 0xFFFACD, 'lightblue': 0xADD8E6, 'lightcoral': 0xF08080, 'lightcyan': 0xE0FFFF, 'lightgoldenrodyellow': 0xFAFAD2, 'lightgray': 0xD3D3D3,
	'lightgreen': 0x90EE90, 'lightgrey': 0xD3D3D3, 'lightpink': 0xFFB6C1, 'lightsalmon': 0xFFA07A, 'lightseagreen': 0x20B2AA, 'lightskyblue': 0x87CEFA,
	'lightslategray': 0x778899, 'lightslategrey': 0x778899, 'lightsteelblue': 0xB0C4DE, 'lightyellow': 0xFFFFE0, 'lime': 0x00FF00, 'limegreen': 0x32CD32,
	'linen': 0xFAF0E6, 'magenta': 0xFF00FF, 'maroon': 0x800000, 'mediumaquamarine': 0x66CDAA, 'mediumblue': 0x0000CD, 'mediumorchid': 0xBA55D3,
	'mediumpurple': 0x9370DB, 'mediumseagreen': 0x3CB371, 'mediumslateblue': 0x7B68EE, 'mediumspringgreen': 0x00FA9A, 'mediumturquoise': 0x48D1CC,
	'mediumvioletred': 0xC71585, 'midnightblue': 0x191970, 'mintcream': 0xF5FFFA, 'mistyrose': 0xFFE4E1, 'moccasin': 0xFFE4B5, 'navajowhite': 0xFFDEAD,
	'navy': 0x000080, 'oldlace': 0xFDF5E6, 'olive': 0x808000, 'olivedrab': 0x6B8E23, 'orange': 0xFFA500, 'orangered': 0xFF4500, 'orchid': 0xDA70D6,
	'palegoldenrod': 0xEEE8AA, 'palegreen': 0x98FB98, 'paleturquoise': 0xAFEEEE, 'palevioletred': 0xDB7093, 'papayawhip': 0xFFEFD5, 'peachpuff': 0xFFDAB9,
	'peru': 0xCD853F, 'pink': 0xFFC0CB, 'plum': 0xDDA0DD, 'powderblue': 0xB0E0E6, 'purple': 0x800080, 'rebeccapurple': 0x663399, 'red': 0xFF0000, 'rosybrown': 0xBC8F8F,
	'royalblue': 0x4169E1, 'saddlebrown': 0x8B4513, 'salmon': 0xFA8072, 'sandybrown': 0xF4A460, 'seagreen': 0x2E8B57, 'seashell': 0xFFF5EE,
	'sienna': 0xA0522D, 'silver': 0xC0C0C0, 'skyblue': 0x87CEEB, 'slateblue': 0x6A5ACD, 'slategray': 0x708090, 'slategrey': 0x708090, 'snow': 0xFFFAFA,
	'springgreen': 0x00FF7F, 'steelblue': 0x4682B4, 'tan': 0xD2B48C, 'teal': 0x008080, 'thistle': 0xD8BFD8, 'tomato': 0xFF6347, 'turquoise': 0x40E0D0,
	'violet': 0xEE82EE, 'wheat': 0xF5DEB3, 'white': 0xFFFFFF, 'whitesmoke': 0xF5F5F5, 'yellow': 0xFFFF00, 'yellowgreen': 0x9ACD32 };

const _hslA = { h: 0, s: 0, l: 0 };
const _hslB = { h: 0, s: 0, l: 0 };

function hue2rgb( p, q, t ) {

	if ( t < 0 ) t += 1;
	if ( t > 1 ) t -= 1;
	if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
	if ( t < 1 / 2 ) return q;
	if ( t < 2 / 3 ) return p + ( q - p ) * 6 * ( 2 / 3 - t );
	return p;

}

class Color {

	constructor( r, g, b ) {

		this.isColor = true;

		this.r = 1;
		this.g = 1;
		this.b = 1;

		return this.set( r, g, b );

	}

	set( r, g, b ) {

		if ( g === undefined && b === undefined ) {

			// r is THREE.Color, hex or string

			const value = r;

			if ( value && value.isColor ) {

				this.copy( value );

			} else if ( typeof value === 'number' ) {

				this.setHex( value );

			} else if ( typeof value === 'string' ) {

				this.setStyle( value );

			}

		} else {

			this.setRGB( r, g, b );

		}

		return this;

	}

	setScalar( scalar ) {

		this.r = scalar;
		this.g = scalar;
		this.b = scalar;

		return this;

	}

	setHex( hex, colorSpace = SRGBColorSpace ) {

		hex = Math.floor( hex );

		this.r = ( hex >> 16 & 255 ) / 255;
		this.g = ( hex >> 8 & 255 ) / 255;
		this.b = ( hex & 255 ) / 255;

		ColorManagement.toWorkingColorSpace( this, colorSpace );

		return this;

	}

	setRGB( r, g, b, colorSpace = ColorManagement.workingColorSpace ) {

		this.r = r;
		this.g = g;
		this.b = b;

		ColorManagement.toWorkingColorSpace( this, colorSpace );

		return this;

	}

	setHSL( h, s, l, colorSpace = ColorManagement.workingColorSpace ) {

		// h,s,l ranges are in 0.0 - 1.0
		h = euclideanModulo( h, 1 );
		s = clamp( s, 0, 1 );
		l = clamp( l, 0, 1 );

		if ( s === 0 ) {

			this.r = this.g = this.b = l;

		} else {

			const p = l <= 0.5 ? l * ( 1 + s ) : l + s - ( l * s );
			const q = ( 2 * l ) - p;

			this.r = hue2rgb( q, p, h + 1 / 3 );
			this.g = hue2rgb( q, p, h );
			this.b = hue2rgb( q, p, h - 1 / 3 );

		}

		ColorManagement.toWorkingColorSpace( this, colorSpace );

		return this;

	}

	setStyle( style, colorSpace = SRGBColorSpace ) {

		function handleAlpha( string ) {

			if ( string === undefined ) return;

			if ( parseFloat( string ) < 1 ) {

				console.warn( 'THREE.Color: Alpha component of ' + style + ' will be ignored.' );

			}

		}


		let m;

		if ( m = /^(\w+)\(([^\)]*)\)/.exec( style ) ) {

			// rgb / hsl

			let color;
			const name = m[ 1 ];
			const components = m[ 2 ];

			switch ( name ) {

				case 'rgb':
				case 'rgba':

					if ( color = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec( components ) ) {

						// rgb(255,0,0) rgba(255,0,0,0.5)

						handleAlpha( color[ 4 ] );

						return this.setRGB(
							Math.min( 255, parseInt( color[ 1 ], 10 ) ) / 255,
							Math.min( 255, parseInt( color[ 2 ], 10 ) ) / 255,
							Math.min( 255, parseInt( color[ 3 ], 10 ) ) / 255,
							colorSpace
						);

					}

					if ( color = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec( components ) ) {

						// rgb(100%,0%,0%) rgba(100%,0%,0%,0.5)

						handleAlpha( color[ 4 ] );

						return this.setRGB(
							Math.min( 100, parseInt( color[ 1 ], 10 ) ) / 100,
							Math.min( 100, parseInt( color[ 2 ], 10 ) ) / 100,
							Math.min( 100, parseInt( color[ 3 ], 10 ) ) / 100,
							colorSpace
						);

					}

					break;

				case 'hsl':
				case 'hsla':

					if ( color = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec( components ) ) {

						// hsl(120,50%,50%) hsla(120,50%,50%,0.5)

						handleAlpha( color[ 4 ] );

						return this.setHSL(
							parseFloat( color[ 1 ] ) / 360,
							parseFloat( color[ 2 ] ) / 100,
							parseFloat( color[ 3 ] ) / 100,
							colorSpace
						);

					}

					break;

				default:

					console.warn( 'THREE.Color: Unknown color model ' + style );

			}

		} else if ( m = /^\#([A-Fa-f\d]+)$/.exec( style ) ) {

			// hex color

			const hex = m[ 1 ];
			const size = hex.length;

			if ( size === 3 ) {

				// #ff0
				return this.setRGB(
					parseInt( hex.charAt( 0 ), 16 ) / 15,
					parseInt( hex.charAt( 1 ), 16 ) / 15,
					parseInt( hex.charAt( 2 ), 16 ) / 15,
					colorSpace
				);

			} else if ( size === 6 ) {

				// #ff0000
				return this.setHex( parseInt( hex, 16 ), colorSpace );

			} else {

				console.warn( 'THREE.Color: Invalid hex color ' + style );

			}

		} else if ( style && style.length > 0 ) {

			return this.setColorName( style, colorSpace );

		}

		return this;

	}

	setColorName( style, colorSpace = SRGBColorSpace ) {

		// color keywords
		const hex = _colorKeywords[ style.toLowerCase() ];

		if ( hex !== undefined ) {

			// red
			this.setHex( hex, colorSpace );

		} else {

			// unknown color
			console.warn( 'THREE.Color: Unknown color ' + style );

		}

		return this;

	}

	clone() {

		return new this.constructor( this.r, this.g, this.b );

	}

	copy( color ) {

		this.r = color.r;
		this.g = color.g;
		this.b = color.b;

		return this;

	}

	copySRGBToLinear( color ) {

		this.r = SRGBToLinear( color.r );
		this.g = SRGBToLinear( color.g );
		this.b = SRGBToLinear( color.b );

		return this;

	}

	copyLinearToSRGB( color ) {

		this.r = LinearToSRGB( color.r );
		this.g = LinearToSRGB( color.g );
		this.b = LinearToSRGB( color.b );

		return this;

	}

	convertSRGBToLinear() {

		this.copySRGBToLinear( this );

		return this;

	}

	convertLinearToSRGB() {

		this.copyLinearToSRGB( this );

		return this;

	}

	getHex( colorSpace = SRGBColorSpace ) {

		ColorManagement.fromWorkingColorSpace( _color.copy( this ), colorSpace );

		return Math.round( clamp( _color.r * 255, 0, 255 ) ) * 65536 + Math.round( clamp( _color.g * 255, 0, 255 ) ) * 256 + Math.round( clamp( _color.b * 255, 0, 255 ) );

	}

	getHexString( colorSpace = SRGBColorSpace ) {

		return ( '000000' + this.getHex( colorSpace ).toString( 16 ) ).slice( - 6 );

	}

	getHSL( target, colorSpace = ColorManagement.workingColorSpace ) {

		// h,s,l ranges are in 0.0 - 1.0

		ColorManagement.fromWorkingColorSpace( _color.copy( this ), colorSpace );

		const r = _color.r, g = _color.g, b = _color.b;

		const max = Math.max( r, g, b );
		const min = Math.min( r, g, b );

		let hue, saturation;
		const lightness = ( min + max ) / 2.0;

		if ( min === max ) {

			hue = 0;
			saturation = 0;

		} else {

			const delta = max - min;

			saturation = lightness <= 0.5 ? delta / ( max + min ) : delta / ( 2 - max - min );

			switch ( max ) {

				case r: hue = ( g - b ) / delta + ( g < b ? 6 : 0 ); break;
				case g: hue = ( b - r ) / delta + 2; break;
				case b: hue = ( r - g ) / delta + 4; break;

			}

			hue /= 6;

		}

		target.h = hue;
		target.s = saturation;
		target.l = lightness;

		return target;

	}

	getRGB( target, colorSpace = ColorManagement.workingColorSpace ) {

		ColorManagement.fromWorkingColorSpace( _color.copy( this ), colorSpace );

		target.r = _color.r;
		target.g = _color.g;
		target.b = _color.b;

		return target;

	}

	getStyle( colorSpace = SRGBColorSpace ) {

		ColorManagement.fromWorkingColorSpace( _color.copy( this ), colorSpace );

		const r = _color.r, g = _color.g, b = _color.b;

		if ( colorSpace !== SRGBColorSpace ) {

			// Requires CSS Color Module Level 4 (https://www.w3.org/TR/css-color-4/).
			return `color(${ colorSpace } ${ r.toFixed( 3 ) } ${ g.toFixed( 3 ) } ${ b.toFixed( 3 ) })`;

		}

		return `rgb(${ Math.round( r * 255 ) },${ Math.round( g * 255 ) },${ Math.round( b * 255 ) })`;

	}

	offsetHSL( h, s, l ) {

		this.getHSL( _hslA );

		return this.setHSL( _hslA.h + h, _hslA.s + s, _hslA.l + l );

	}

	add( color ) {

		this.r += color.r;
		this.g += color.g;
		this.b += color.b;

		return this;

	}

	addColors( color1, color2 ) {

		this.r = color1.r + color2.r;
		this.g = color1.g + color2.g;
		this.b = color1.b + color2.b;

		return this;

	}

	addScalar( s ) {

		this.r += s;
		this.g += s;
		this.b += s;

		return this;

	}

	sub( color ) {

		this.r = Math.max( 0, this.r - color.r );
		this.g = Math.max( 0, this.g - color.g );
		this.b = Math.max( 0, this.b - color.b );

		return this;

	}

	multiply( color ) {

		this.r *= color.r;
		this.g *= color.g;
		this.b *= color.b;

		return this;

	}

	multiplyScalar( s ) {

		this.r *= s;
		this.g *= s;
		this.b *= s;

		return this;

	}

	lerp( color, alpha ) {

		this.r += ( color.r - this.r ) * alpha;
		this.g += ( color.g - this.g ) * alpha;
		this.b += ( color.b - this.b ) * alpha;

		return this;

	}

	lerpColors( color1, color2, alpha ) {

		this.r = color1.r + ( color2.r - color1.r ) * alpha;
		this.g = color1.g + ( color2.g - color1.g ) * alpha;
		this.b = color1.b + ( color2.b - color1.b ) * alpha;

		return this;

	}

	lerpHSL( color, alpha ) {

		this.getHSL( _hslA );
		color.getHSL( _hslB );

		const h = lerp( _hslA.h, _hslB.h, alpha );
		const s = lerp( _hslA.s, _hslB.s, alpha );
		const l = lerp( _hslA.l, _hslB.l, alpha );

		this.setHSL( h, s, l );

		return this;

	}

	setFromVector3( v ) {

		this.r = v.x;
		this.g = v.y;
		this.b = v.z;

		return this;

	}

	applyMatrix3( m ) {

		const r = this.r, g = this.g, b = this.b;
		const e = m.elements;

		this.r = e[ 0 ] * r + e[ 3 ] * g + e[ 6 ] * b;
		this.g = e[ 1 ] * r + e[ 4 ] * g + e[ 7 ] * b;
		this.b = e[ 2 ] * r + e[ 5 ] * g + e[ 8 ] * b;

		return this;

	}

	equals( c ) {

		return ( c.r === this.r ) && ( c.g === this.g ) && ( c.b === this.b );

	}

	fromArray( array, offset = 0 ) {

		this.r = array[ offset ];
		this.g = array[ offset + 1 ];
		this.b = array[ offset + 2 ];

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this.r;
		array[ offset + 1 ] = this.g;
		array[ offset + 2 ] = this.b;

		return array;

	}

	fromBufferAttribute( attribute, index ) {

		this.r = attribute.getX( index );
		this.g = attribute.getY( index );
		this.b = attribute.getZ( index );

		return this;

	}

	toJSON() {

		return this.getHex();

	}

	*[ Symbol.iterator ]() {

		yield this.r;
		yield this.g;
		yield this.b;

	}

}

const _color = /*@__PURE__*/ new Color();

Color.NAMES = _colorKeywords;

let _materialId = 0;

class Material extends EventDispatcher {

	constructor() {

		super();

		this.isMaterial = true;

		Object.defineProperty( this, 'id', { value: _materialId ++ } );

		this.uuid = generateUUID();

		this.name = '';
		this.type = 'Material';

		this.blending = NormalBlending;
		this.side = FrontSide;
		this.vertexColors = false;

		this.opacity = 1;
		this.transparent = false;
		this.alphaHash = false;

		this.blendSrc = SrcAlphaFactor;
		this.blendDst = OneMinusSrcAlphaFactor;
		this.blendEquation = AddEquation;
		this.blendSrcAlpha = null;
		this.blendDstAlpha = null;
		this.blendEquationAlpha = null;
		this.blendColor = new Color( 0, 0, 0 );
		this.blendAlpha = 0;

		this.depthFunc = LessEqualDepth;
		this.depthTest = true;
		this.depthWrite = true;

		this.stencilWriteMask = 0xff;
		this.stencilFunc = AlwaysStencilFunc;
		this.stencilRef = 0;
		this.stencilFuncMask = 0xff;
		this.stencilFail = KeepStencilOp;
		this.stencilZFail = KeepStencilOp;
		this.stencilZPass = KeepStencilOp;
		this.stencilWrite = false;

		this.clippingPlanes = null;
		this.clipIntersection = false;
		this.clipShadows = false;

		this.shadowSide = null;

		this.colorWrite = true;

		this.precision = null; // override the renderer's default precision for this material

		this.polygonOffset = false;
		this.polygonOffsetFactor = 0;
		this.polygonOffsetUnits = 0;

		this.dithering = false;

		this.alphaToCoverage = false;
		this.premultipliedAlpha = false;
		this.forceSinglePass = false;

		this.visible = true;

		this.toneMapped = true;

		this.userData = {};

		this.version = 0;

		this._alphaTest = 0;

	}

	get alphaTest() {

		return this._alphaTest;

	}

	set alphaTest( value ) {

		if ( this._alphaTest > 0 !== value > 0 ) {

			this.version ++;

		}

		this._alphaTest = value;

	}

	// onBeforeRender and onBeforeCompile only supported in WebGLRenderer

	onBeforeRender( /* renderer, scene, camera, geometry, object, group */ ) {}

	onBeforeCompile( /* shaderobject, renderer */ ) {}

	customProgramCacheKey() {

		return this.onBeforeCompile.toString();

	}

	setValues( values ) {

		if ( values === undefined ) return;

		for ( const key in values ) {

			const newValue = values[ key ];

			if ( newValue === undefined ) {

				console.warn( `THREE.Material: parameter '${ key }' has value of undefined.` );
				continue;

			}

			const currentValue = this[ key ];

			if ( currentValue === undefined ) {

				console.warn( `THREE.Material: '${ key }' is not a property of THREE.${ this.type }.` );
				continue;

			}

			if ( currentValue && currentValue.isColor ) {

				currentValue.set( newValue );

			} else if ( ( currentValue && currentValue.isVector3 ) && ( newValue && newValue.isVector3 ) ) {

				currentValue.copy( newValue );

			} else {

				this[ key ] = newValue;

			}

		}

	}

	toJSON( meta ) {

		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		if ( isRootObject ) {

			meta = {
				textures: {},
				images: {}
			};

		}

		const data = {
			metadata: {
				version: 4.6,
				type: 'Material',
				generator: 'Material.toJSON'
			}
		};

		// standard Material serialization
		data.uuid = this.uuid;
		data.type = this.type;

		if ( this.name !== '' ) data.name = this.name;

		if ( this.color && this.color.isColor ) data.color = this.color.getHex();

		if ( this.roughness !== undefined ) data.roughness = this.roughness;
		if ( this.metalness !== undefined ) data.metalness = this.metalness;

		if ( this.sheen !== undefined ) data.sheen = this.sheen;
		if ( this.sheenColor && this.sheenColor.isColor ) data.sheenColor = this.sheenColor.getHex();
		if ( this.sheenRoughness !== undefined ) data.sheenRoughness = this.sheenRoughness;
		if ( this.emissive && this.emissive.isColor ) data.emissive = this.emissive.getHex();
		if ( this.emissiveIntensity !== undefined && this.emissiveIntensity !== 1 ) data.emissiveIntensity = this.emissiveIntensity;

		if ( this.specular && this.specular.isColor ) data.specular = this.specular.getHex();
		if ( this.specularIntensity !== undefined ) data.specularIntensity = this.specularIntensity;
		if ( this.specularColor && this.specularColor.isColor ) data.specularColor = this.specularColor.getHex();
		if ( this.shininess !== undefined ) data.shininess = this.shininess;
		if ( this.clearcoat !== undefined ) data.clearcoat = this.clearcoat;
		if ( this.clearcoatRoughness !== undefined ) data.clearcoatRoughness = this.clearcoatRoughness;

		if ( this.clearcoatMap && this.clearcoatMap.isTexture ) {

			data.clearcoatMap = this.clearcoatMap.toJSON( meta ).uuid;

		}

		if ( this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture ) {

			data.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON( meta ).uuid;

		}

		if ( this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture ) {

			data.clearcoatNormalMap = this.clearcoatNormalMap.toJSON( meta ).uuid;
			data.clearcoatNormalScale = this.clearcoatNormalScale.toArray();

		}

		if ( this.dispersion !== undefined ) data.dispersion = this.dispersion;

		if ( this.iridescence !== undefined ) data.iridescence = this.iridescence;
		if ( this.iridescenceIOR !== undefined ) data.iridescenceIOR = this.iridescenceIOR;
		if ( this.iridescenceThicknessRange !== undefined ) data.iridescenceThicknessRange = this.iridescenceThicknessRange;

		if ( this.iridescenceMap && this.iridescenceMap.isTexture ) {

			data.iridescenceMap = this.iridescenceMap.toJSON( meta ).uuid;

		}

		if ( this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture ) {

			data.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON( meta ).uuid;

		}

		if ( this.anisotropy !== undefined ) data.anisotropy = this.anisotropy;
		if ( this.anisotropyRotation !== undefined ) data.anisotropyRotation = this.anisotropyRotation;

		if ( this.anisotropyMap && this.anisotropyMap.isTexture ) {

			data.anisotropyMap = this.anisotropyMap.toJSON( meta ).uuid;

		}

		if ( this.map && this.map.isTexture ) data.map = this.map.toJSON( meta ).uuid;
		if ( this.matcap && this.matcap.isTexture ) data.matcap = this.matcap.toJSON( meta ).uuid;
		if ( this.alphaMap && this.alphaMap.isTexture ) data.alphaMap = this.alphaMap.toJSON( meta ).uuid;

		if ( this.lightMap && this.lightMap.isTexture ) {

			data.lightMap = this.lightMap.toJSON( meta ).uuid;
			data.lightMapIntensity = this.lightMapIntensity;

		}

		if ( this.aoMap && this.aoMap.isTexture ) {

			data.aoMap = this.aoMap.toJSON( meta ).uuid;
			data.aoMapIntensity = this.aoMapIntensity;

		}

		if ( this.bumpMap && this.bumpMap.isTexture ) {

			data.bumpMap = this.bumpMap.toJSON( meta ).uuid;
			data.bumpScale = this.bumpScale;

		}

		if ( this.normalMap && this.normalMap.isTexture ) {

			data.normalMap = this.normalMap.toJSON( meta ).uuid;
			data.normalMapType = this.normalMapType;
			data.normalScale = this.normalScale.toArray();

		}

		if ( this.displacementMap && this.displacementMap.isTexture ) {

			data.displacementMap = this.displacementMap.toJSON( meta ).uuid;
			data.displacementScale = this.displacementScale;
			data.displacementBias = this.displacementBias;

		}

		if ( this.roughnessMap && this.roughnessMap.isTexture ) data.roughnessMap = this.roughnessMap.toJSON( meta ).uuid;
		if ( this.metalnessMap && this.metalnessMap.isTexture ) data.metalnessMap = this.metalnessMap.toJSON( meta ).uuid;

		if ( this.emissiveMap && this.emissiveMap.isTexture ) data.emissiveMap = this.emissiveMap.toJSON( meta ).uuid;
		if ( this.specularMap && this.specularMap.isTexture ) data.specularMap = this.specularMap.toJSON( meta ).uuid;
		if ( this.specularIntensityMap && this.specularIntensityMap.isTexture ) data.specularIntensityMap = this.specularIntensityMap.toJSON( meta ).uuid;
		if ( this.specularColorMap && this.specularColorMap.isTexture ) data.specularColorMap = this.specularColorMap.toJSON( meta ).uuid;

		if ( this.envMap && this.envMap.isTexture ) {

			data.envMap = this.envMap.toJSON( meta ).uuid;

			if ( this.combine !== undefined ) data.combine = this.combine;

		}

		if ( this.envMapRotation !== undefined ) data.envMapRotation = this.envMapRotation.toArray();
		if ( this.envMapIntensity !== undefined ) data.envMapIntensity = this.envMapIntensity;
		if ( this.reflectivity !== undefined ) data.reflectivity = this.reflectivity;
		if ( this.refractionRatio !== undefined ) data.refractionRatio = this.refractionRatio;

		if ( this.gradientMap && this.gradientMap.isTexture ) {

			data.gradientMap = this.gradientMap.toJSON( meta ).uuid;

		}

		if ( this.transmission !== undefined ) data.transmission = this.transmission;
		if ( this.transmissionMap && this.transmissionMap.isTexture ) data.transmissionMap = this.transmissionMap.toJSON( meta ).uuid;
		if ( this.thickness !== undefined ) data.thickness = this.thickness;
		if ( this.thicknessMap && this.thicknessMap.isTexture ) data.thicknessMap = this.thicknessMap.toJSON( meta ).uuid;
		if ( this.attenuationDistance !== undefined && this.attenuationDistance !== Infinity ) data.attenuationDistance = this.attenuationDistance;
		if ( this.attenuationColor !== undefined ) data.attenuationColor = this.attenuationColor.getHex();

		if ( this.size !== undefined ) data.size = this.size;
		if ( this.shadowSide !== null ) data.shadowSide = this.shadowSide;
		if ( this.sizeAttenuation !== undefined ) data.sizeAttenuation = this.sizeAttenuation;

		if ( this.blending !== NormalBlending ) data.blending = this.blending;
		if ( this.side !== FrontSide ) data.side = this.side;
		if ( this.vertexColors === true ) data.vertexColors = true;

		if ( this.opacity < 1 ) data.opacity = this.opacity;
		if ( this.transparent === true ) data.transparent = true;

		if ( this.blendSrc !== SrcAlphaFactor ) data.blendSrc = this.blendSrc;
		if ( this.blendDst !== OneMinusSrcAlphaFactor ) data.blendDst = this.blendDst;
		if ( this.blendEquation !== AddEquation ) data.blendEquation = this.blendEquation;
		if ( this.blendSrcAlpha !== null ) data.blendSrcAlpha = this.blendSrcAlpha;
		if ( this.blendDstAlpha !== null ) data.blendDstAlpha = this.blendDstAlpha;
		if ( this.blendEquationAlpha !== null ) data.blendEquationAlpha = this.blendEquationAlpha;
		if ( this.blendColor && this.blendColor.isColor ) data.blendColor = this.blendColor.getHex();
		if ( this.blendAlpha !== 0 ) data.blendAlpha = this.blendAlpha;

		if ( this.depthFunc !== LessEqualDepth ) data.depthFunc = this.depthFunc;
		if ( this.depthTest === false ) data.depthTest = this.depthTest;
		if ( this.depthWrite === false ) data.depthWrite = this.depthWrite;
		if ( this.colorWrite === false ) data.colorWrite = this.colorWrite;

		if ( this.stencilWriteMask !== 0xff ) data.stencilWriteMask = this.stencilWriteMask;
		if ( this.stencilFunc !== AlwaysStencilFunc ) data.stencilFunc = this.stencilFunc;
		if ( this.stencilRef !== 0 ) data.stencilRef = this.stencilRef;
		if ( this.stencilFuncMask !== 0xff ) data.stencilFuncMask = this.stencilFuncMask;
		if ( this.stencilFail !== KeepStencilOp ) data.stencilFail = this.stencilFail;
		if ( this.stencilZFail !== KeepStencilOp ) data.stencilZFail = this.stencilZFail;
		if ( this.stencilZPass !== KeepStencilOp ) data.stencilZPass = this.stencilZPass;
		if ( this.stencilWrite === true ) data.stencilWrite = this.stencilWrite;

		// rotation (SpriteMaterial)
		if ( this.rotation !== undefined && this.rotation !== 0 ) data.rotation = this.rotation;

		if ( this.polygonOffset === true ) data.polygonOffset = true;
		if ( this.polygonOffsetFactor !== 0 ) data.polygonOffsetFactor = this.polygonOffsetFactor;
		if ( this.polygonOffsetUnits !== 0 ) data.polygonOffsetUnits = this.polygonOffsetUnits;

		if ( this.linewidth !== undefined && this.linewidth !== 1 ) data.linewidth = this.linewidth;
		if ( this.dashSize !== undefined ) data.dashSize = this.dashSize;
		if ( this.gapSize !== undefined ) data.gapSize = this.gapSize;
		if ( this.scale !== undefined ) data.scale = this.scale;

		if ( this.dithering === true ) data.dithering = true;

		if ( this.alphaTest > 0 ) data.alphaTest = this.alphaTest;
		if ( this.alphaHash === true ) data.alphaHash = true;
		if ( this.alphaToCoverage === true ) data.alphaToCoverage = true;
		if ( this.premultipliedAlpha === true ) data.premultipliedAlpha = true;
		if ( this.forceSinglePass === true ) data.forceSinglePass = true;

		if ( this.wireframe === true ) data.wireframe = true;
		if ( this.wireframeLinewidth > 1 ) data.wireframeLinewidth = this.wireframeLinewidth;
		if ( this.wireframeLinecap !== 'round' ) data.wireframeLinecap = this.wireframeLinecap;
		if ( this.wireframeLinejoin !== 'round' ) data.wireframeLinejoin = this.wireframeLinejoin;

		if ( this.flatShading === true ) data.flatShading = true;

		if ( this.visible === false ) data.visible = false;

		if ( this.toneMapped === false ) data.toneMapped = false;

		if ( this.fog === false ) data.fog = false;

		if ( Object.keys( this.userData ).length > 0 ) data.userData = this.userData;

		// TODO: Copied from Object3D.toJSON

		function extractFromCache( cache ) {

			const values = [];

			for ( const key in cache ) {

				const data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}

			return values;

		}

		if ( isRootObject ) {

			const textures = extractFromCache( meta.textures );
			const images = extractFromCache( meta.images );

			if ( textures.length > 0 ) data.textures = textures;
			if ( images.length > 0 ) data.images = images;

		}

		return data;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	copy( source ) {

		this.name = source.name;

		this.blending = source.blending;
		this.side = source.side;
		this.vertexColors = source.vertexColors;

		this.opacity = source.opacity;
		this.transparent = source.transparent;

		this.blendSrc = source.blendSrc;
		this.blendDst = source.blendDst;
		this.blendEquation = source.blendEquation;
		this.blendSrcAlpha = source.blendSrcAlpha;
		this.blendDstAlpha = source.blendDstAlpha;
		this.blendEquationAlpha = source.blendEquationAlpha;
		this.blendColor.copy( source.blendColor );
		this.blendAlpha = source.blendAlpha;

		this.depthFunc = source.depthFunc;
		this.depthTest = source.depthTest;
		this.depthWrite = source.depthWrite;

		this.stencilWriteMask = source.stencilWriteMask;
		this.stencilFunc = source.stencilFunc;
		this.stencilRef = source.stencilRef;
		this.stencilFuncMask = source.stencilFuncMask;
		this.stencilFail = source.stencilFail;
		this.stencilZFail = source.stencilZFail;
		this.stencilZPass = source.stencilZPass;
		this.stencilWrite = source.stencilWrite;

		const srcPlanes = source.clippingPlanes;
		let dstPlanes = null;

		if ( srcPlanes !== null ) {

			const n = srcPlanes.length;
			dstPlanes = new Array( n );

			for ( let i = 0; i !== n; ++ i ) {

				dstPlanes[ i ] = srcPlanes[ i ].clone();

			}

		}

		this.clippingPlanes = dstPlanes;
		this.clipIntersection = source.clipIntersection;
		this.clipShadows = source.clipShadows;

		this.shadowSide = source.shadowSide;

		this.colorWrite = source.colorWrite;

		this.precision = source.precision;

		this.polygonOffset = source.polygonOffset;
		this.polygonOffsetFactor = source.polygonOffsetFactor;
		this.polygonOffsetUnits = source.polygonOffsetUnits;

		this.dithering = source.dithering;

		this.alphaTest = source.alphaTest;
		this.alphaHash = source.alphaHash;
		this.alphaToCoverage = source.alphaToCoverage;
		this.premultipliedAlpha = source.premultipliedAlpha;
		this.forceSinglePass = source.forceSinglePass;

		this.visible = source.visible;

		this.toneMapped = source.toneMapped;

		this.userData = JSON.parse( JSON.stringify( source.userData ) );

		return this;

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

	onBuild( /* shaderobject, renderer */ ) {

		console.warn( 'Material: onBuild() has been removed.' ); // @deprecated, r166

	}

}

class MeshBasicMaterial extends Material {

	constructor( parameters ) {

		super();

		this.isMeshBasicMaterial = true;

		this.type = 'MeshBasicMaterial';

		this.color = new Color( 0xffffff ); // emissive

		this.map = null;

		this.lightMap = null;
		this.lightMapIntensity = 1.0;

		this.aoMap = null;
		this.aoMapIntensity = 1.0;

		this.specularMap = null;

		this.alphaMap = null;

		this.envMap = null;
		this.envMapRotation = new Euler();
		this.combine = MultiplyOperation;
		this.reflectivity = 1;
		this.refractionRatio = 0.98;

		this.wireframe = false;
		this.wireframeLinewidth = 1;
		this.wireframeLinecap = 'round';
		this.wireframeLinejoin = 'round';

		this.fog = true;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.color.copy( source.color );

		this.map = source.map;

		this.lightMap = source.lightMap;
		this.lightMapIntensity = source.lightMapIntensity;

		this.aoMap = source.aoMap;
		this.aoMapIntensity = source.aoMapIntensity;

		this.specularMap = source.specularMap;

		this.alphaMap = source.alphaMap;

		this.envMap = source.envMap;
		this.envMapRotation.copy( source.envMapRotation );
		this.combine = source.combine;
		this.reflectivity = source.reflectivity;
		this.refractionRatio = source.refractionRatio;

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;
		this.wireframeLinecap = source.wireframeLinecap;
		this.wireframeLinejoin = source.wireframeLinejoin;

		this.fog = source.fog;

		return this;

	}

}

// Fast Half Float Conversions, http://www.fox-toolkit.org/ftp/fasthalffloatconversion.pdf

const _tables = /*@__PURE__*/ _generateTables();

function _generateTables() {

	// float32 to float16 helpers

	const buffer = new ArrayBuffer( 4 );
	const floatView = new Float32Array( buffer );
	const uint32View = new Uint32Array( buffer );

	const baseTable = new Uint32Array( 512 );
	const shiftTable = new Uint32Array( 512 );

	for ( let i = 0; i < 256; ++ i ) {

		const e = i - 127;

		// very small number (0, -0)

		if ( e < - 27 ) {

			baseTable[ i ] = 0x0000;
			baseTable[ i | 0x100 ] = 0x8000;
			shiftTable[ i ] = 24;
			shiftTable[ i | 0x100 ] = 24;

			// small number (denorm)

		} else if ( e < - 14 ) {

			baseTable[ i ] = 0x0400 >> ( - e - 14 );
			baseTable[ i | 0x100 ] = ( 0x0400 >> ( - e - 14 ) ) | 0x8000;
			shiftTable[ i ] = - e - 1;
			shiftTable[ i | 0x100 ] = - e - 1;

			// normal number

		} else if ( e <= 15 ) {

			baseTable[ i ] = ( e + 15 ) << 10;
			baseTable[ i | 0x100 ] = ( ( e + 15 ) << 10 ) | 0x8000;
			shiftTable[ i ] = 13;
			shiftTable[ i | 0x100 ] = 13;

			// large number (Infinity, -Infinity)

		} else if ( e < 128 ) {

			baseTable[ i ] = 0x7c00;
			baseTable[ i | 0x100 ] = 0xfc00;
			shiftTable[ i ] = 24;
			shiftTable[ i | 0x100 ] = 24;

			// stay (NaN, Infinity, -Infinity)

		} else {

			baseTable[ i ] = 0x7c00;
			baseTable[ i | 0x100 ] = 0xfc00;
			shiftTable[ i ] = 13;
			shiftTable[ i | 0x100 ] = 13;

		}

	}

	// float16 to float32 helpers

	const mantissaTable = new Uint32Array( 2048 );
	const exponentTable = new Uint32Array( 64 );
	const offsetTable = new Uint32Array( 64 );

	for ( let i = 1; i < 1024; ++ i ) {

		let m = i << 13; // zero pad mantissa bits
		let e = 0; // zero exponent

		// normalized
		while ( ( m & 0x00800000 ) === 0 ) {

			m <<= 1;
			e -= 0x00800000; // decrement exponent

		}

		m &= ~ 0x00800000; // clear leading 1 bit
		e += 0x38800000; // adjust bias

		mantissaTable[ i ] = m | e;

	}

	for ( let i = 1024; i < 2048; ++ i ) {

		mantissaTable[ i ] = 0x38000000 + ( ( i - 1024 ) << 13 );

	}

	for ( let i = 1; i < 31; ++ i ) {

		exponentTable[ i ] = i << 23;

	}

	exponentTable[ 31 ] = 0x47800000;
	exponentTable[ 32 ] = 0x80000000;

	for ( let i = 33; i < 63; ++ i ) {

		exponentTable[ i ] = 0x80000000 + ( ( i - 32 ) << 23 );

	}

	exponentTable[ 63 ] = 0xc7800000;

	for ( let i = 1; i < 64; ++ i ) {

		if ( i !== 32 ) {

			offsetTable[ i ] = 1024;

		}

	}

	return {
		floatView: floatView,
		uint32View: uint32View,
		baseTable: baseTable,
		shiftTable: shiftTable,
		mantissaTable: mantissaTable,
		exponentTable: exponentTable,
		offsetTable: offsetTable
	};

}

// float32 to float16

function toHalfFloat( val ) {

	if ( Math.abs( val ) > 65504 ) console.warn( 'THREE.DataUtils.toHalfFloat(): Value out of range.' );

	val = clamp( val, - 65504, 65504 );

	_tables.floatView[ 0 ] = val;
	const f = _tables.uint32View[ 0 ];
	const e = ( f >> 23 ) & 0x1ff;
	return _tables.baseTable[ e ] + ( ( f & 0x007fffff ) >> _tables.shiftTable[ e ] );

}

// float16 to float32

function fromHalfFloat( val ) {

	const m = val >> 10;
	_tables.uint32View[ 0 ] = _tables.mantissaTable[ _tables.offsetTable[ m ] + ( val & 0x3ff ) ] + _tables.exponentTable[ m ];
	return _tables.floatView[ 0 ];

}

const DataUtils = {
	toHalfFloat: toHalfFloat,
	fromHalfFloat: fromHalfFloat,
};

const _vector$9 = /*@__PURE__*/ new Vector3();
const _vector2$1 = /*@__PURE__*/ new Vector2();

class BufferAttribute {

	constructor( array, itemSize, normalized = false ) {

		if ( Array.isArray( array ) ) {

			throw new TypeError( 'THREE.BufferAttribute: array should be a Typed Array.' );

		}

		this.isBufferAttribute = true;

		this.name = '';

		this.array = array;
		this.itemSize = itemSize;
		this.count = array !== undefined ? array.length / itemSize : 0;
		this.normalized = normalized;

		this.usage = StaticDrawUsage;
		this.updateRanges = [];
		this.gpuType = FloatType;

		this.version = 0;

	}

	onUploadCallback() {}

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

	setUsage( value ) {

		this.usage = value;

		return this;

	}

	addUpdateRange( start, count ) {

		this.updateRanges.push( { start, count } );

	}

	clearUpdateRanges() {

		this.updateRanges.length = 0;

	}

	copy( source ) {

		this.name = source.name;
		this.array = new source.array.constructor( source.array );
		this.itemSize = source.itemSize;
		this.count = source.count;
		this.normalized = source.normalized;

		this.usage = source.usage;
		this.gpuType = source.gpuType;

		return this;

	}

	copyAt( index1, attribute, index2 ) {

		index1 *= this.itemSize;
		index2 *= attribute.itemSize;

		for ( let i = 0, l = this.itemSize; i < l; i ++ ) {

			this.array[ index1 + i ] = attribute.array[ index2 + i ];

		}

		return this;

	}

	copyArray( array ) {

		this.array.set( array );

		return this;

	}

	applyMatrix3( m ) {

		if ( this.itemSize === 2 ) {

			for ( let i = 0, l = this.count; i < l; i ++ ) {

				_vector2$1.fromBufferAttribute( this, i );
				_vector2$1.applyMatrix3( m );

				this.setXY( i, _vector2$1.x, _vector2$1.y );

			}

		} else if ( this.itemSize === 3 ) {

			for ( let i = 0, l = this.count; i < l; i ++ ) {

				_vector$9.fromBufferAttribute( this, i );
				_vector$9.applyMatrix3( m );

				this.setXYZ( i, _vector$9.x, _vector$9.y, _vector$9.z );

			}

		}

		return this;

	}

	applyMatrix4( m ) {

		for ( let i = 0, l = this.count; i < l; i ++ ) {

			_vector$9.fromBufferAttribute( this, i );

			_vector$9.applyMatrix4( m );

			this.setXYZ( i, _vector$9.x, _vector$9.y, _vector$9.z );

		}

		return this;

	}

	applyNormalMatrix( m ) {

		for ( let i = 0, l = this.count; i < l; i ++ ) {

			_vector$9.fromBufferAttribute( this, i );

			_vector$9.applyNormalMatrix( m );

			this.setXYZ( i, _vector$9.x, _vector$9.y, _vector$9.z );

		}

		return this;

	}

	transformDirection( m ) {

		for ( let i = 0, l = this.count; i < l; i ++ ) {

			_vector$9.fromBufferAttribute( this, i );

			_vector$9.transformDirection( m );

			this.setXYZ( i, _vector$9.x, _vector$9.y, _vector$9.z );

		}

		return this;

	}

	set( value, offset = 0 ) {

		// Matching BufferAttribute constructor, do not normalize the array.
		this.array.set( value, offset );

		return this;

	}

	getComponent( index, component ) {

		let value = this.array[ index * this.itemSize + component ];

		if ( this.normalized ) value = denormalize( value, this.array );

		return value;

	}

	setComponent( index, component, value ) {

		if ( this.normalized ) value = normalize( value, this.array );

		this.array[ index * this.itemSize + component ] = value;

		return this;

	}

	getX( index ) {

		let x = this.array[ index * this.itemSize ];

		if ( this.normalized ) x = denormalize( x, this.array );

		return x;

	}

	setX( index, x ) {

		if ( this.normalized ) x = normalize( x, this.array );

		this.array[ index * this.itemSize ] = x;

		return this;

	}

	getY( index ) {

		let y = this.array[ index * this.itemSize + 1 ];

		if ( this.normalized ) y = denormalize( y, this.array );

		return y;

	}

	setY( index, y ) {

		if ( this.normalized ) y = normalize( y, this.array );

		this.array[ index * this.itemSize + 1 ] = y;

		return this;

	}

	getZ( index ) {

		let z = this.array[ index * this.itemSize + 2 ];

		if ( this.normalized ) z = denormalize( z, this.array );

		return z;

	}

	setZ( index, z ) {

		if ( this.normalized ) z = normalize( z, this.array );

		this.array[ index * this.itemSize + 2 ] = z;

		return this;

	}

	getW( index ) {

		let w = this.array[ index * this.itemSize + 3 ];

		if ( this.normalized ) w = denormalize( w, this.array );

		return w;

	}

	setW( index, w ) {

		if ( this.normalized ) w = normalize( w, this.array );

		this.array[ index * this.itemSize + 3 ] = w;

		return this;

	}

	setXY( index, x, y ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );

		}

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;

		return this;

	}

	setXYZ( index, x, y, z ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );

		}

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;

		return this;

	}

	setXYZW( index, x, y, z, w ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );
			w = normalize( w, this.array );

		}

		this.array[ index + 0 ] = x;
		this.array[ index + 1 ] = y;
		this.array[ index + 2 ] = z;
		this.array[ index + 3 ] = w;

		return this;

	}

	onUpload( callback ) {

		this.onUploadCallback = callback;

		return this;

	}

	clone() {

		return new this.constructor( this.array, this.itemSize ).copy( this );

	}

	toJSON() {

		const data = {
			itemSize: this.itemSize,
			type: this.array.constructor.name,
			array: Array.from( this.array ),
			normalized: this.normalized
		};

		if ( this.name !== '' ) data.name = this.name;
		if ( this.usage !== StaticDrawUsage ) data.usage = this.usage;

		return data;

	}

}

//

class Int8BufferAttribute extends BufferAttribute {

	constructor( array, itemSize, normalized ) {

		super( new Int8Array( array ), itemSize, normalized );

	}

}

class Uint8BufferAttribute extends BufferAttribute {

	constructor( array, itemSize, normalized ) {

		super( new Uint8Array( array ), itemSize, normalized );

	}

}

class Uint8ClampedBufferAttribute extends BufferAttribute {

	constructor( array, itemSize, normalized ) {

		super( new Uint8ClampedArray( array ), itemSize, normalized );

	}

}

class Int16BufferAttribute extends BufferAttribute {

	constructor( array, itemSize, normalized ) {

		super( new Int16Array( array ), itemSize, normalized );

	}

}

class Uint16BufferAttribute extends BufferAttribute {

	constructor( array, itemSize, normalized ) {

		super( new Uint16Array( array ), itemSize, normalized );

	}

}

class Int32BufferAttribute extends BufferAttribute {

	constructor( array, itemSize, normalized ) {

		super( new Int32Array( array ), itemSize, normalized );

	}

}

class Uint32BufferAttribute extends BufferAttribute {

	constructor( array, itemSize, normalized ) {

		super( new Uint32Array( array ), itemSize, normalized );

	}

}

class Float16BufferAttribute extends BufferAttribute {

	constructor( array, itemSize, normalized ) {

		super( new Uint16Array( array ), itemSize, normalized );

		this.isFloat16BufferAttribute = true;

	}

	getX( index ) {

		let x = fromHalfFloat( this.array[ index * this.itemSize ] );

		if ( this.normalized ) x = denormalize( x, this.array );

		return x;

	}

	setX( index, x ) {

		if ( this.normalized ) x = normalize( x, this.array );

		this.array[ index * this.itemSize ] = toHalfFloat( x );

		return this;

	}

	getY( index ) {

		let y = fromHalfFloat( this.array[ index * this.itemSize + 1 ] );

		if ( this.normalized ) y = denormalize( y, this.array );

		return y;

	}

	setY( index, y ) {

		if ( this.normalized ) y = normalize( y, this.array );

		this.array[ index * this.itemSize + 1 ] = toHalfFloat( y );

		return this;

	}

	getZ( index ) {

		let z = fromHalfFloat( this.array[ index * this.itemSize + 2 ] );

		if ( this.normalized ) z = denormalize( z, this.array );

		return z;

	}

	setZ( index, z ) {

		if ( this.normalized ) z = normalize( z, this.array );

		this.array[ index * this.itemSize + 2 ] = toHalfFloat( z );

		return this;

	}

	getW( index ) {

		let w = fromHalfFloat( this.array[ index * this.itemSize + 3 ] );

		if ( this.normalized ) w = denormalize( w, this.array );

		return w;

	}

	setW( index, w ) {

		if ( this.normalized ) w = normalize( w, this.array );

		this.array[ index * this.itemSize + 3 ] = toHalfFloat( w );

		return this;

	}

	setXY( index, x, y ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );

		}

		this.array[ index + 0 ] = toHalfFloat( x );
		this.array[ index + 1 ] = toHalfFloat( y );

		return this;

	}

	setXYZ( index, x, y, z ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );

		}

		this.array[ index + 0 ] = toHalfFloat( x );
		this.array[ index + 1 ] = toHalfFloat( y );
		this.array[ index + 2 ] = toHalfFloat( z );

		return this;

	}

	setXYZW( index, x, y, z, w ) {

		index *= this.itemSize;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );
			w = normalize( w, this.array );

		}

		this.array[ index + 0 ] = toHalfFloat( x );
		this.array[ index + 1 ] = toHalfFloat( y );
		this.array[ index + 2 ] = toHalfFloat( z );
		this.array[ index + 3 ] = toHalfFloat( w );

		return this;

	}

}


class Float32BufferAttribute extends BufferAttribute {

	constructor( array, itemSize, normalized ) {

		super( new Float32Array( array ), itemSize, normalized );

	}

}

let _id$1 = 0;

const _m1 = /*@__PURE__*/ new Matrix4();
const _obj = /*@__PURE__*/ new Object3D();
const _offset = /*@__PURE__*/ new Vector3();
const _box$2 = /*@__PURE__*/ new Box3();
const _boxMorphTargets = /*@__PURE__*/ new Box3();
const _vector$8 = /*@__PURE__*/ new Vector3();

class BufferGeometry extends EventDispatcher {

	constructor() {

		super();

		this.isBufferGeometry = true;

		Object.defineProperty( this, 'id', { value: _id$1 ++ } );

		this.uuid = generateUUID();

		this.name = '';
		this.type = 'BufferGeometry';

		this.index = null;
		this.indirect = null;
		this.attributes = {};

		this.morphAttributes = {};
		this.morphTargetsRelative = false;

		this.groups = [];

		this.boundingBox = null;
		this.boundingSphere = null;

		this.drawRange = { start: 0, count: Infinity };

		this.userData = {};

	}

	getIndex() {

		return this.index;

	}

	setIndex( index ) {

		if ( Array.isArray( index ) ) {

			this.index = new ( arrayNeedsUint32( index ) ? Uint32BufferAttribute : Uint16BufferAttribute )( index, 1 );

		} else {

			this.index = index;

		}

		return this;

	}

	setIndirect( indirect ) {

		this.indirect = indirect;

		return this;

	}

	getIndirect() {

		return this.indirect;

	}

	getAttribute( name ) {

		return this.attributes[ name ];

	}

	setAttribute( name, attribute ) {

		this.attributes[ name ] = attribute;

		return this;

	}

	deleteAttribute( name ) {

		delete this.attributes[ name ];

		return this;

	}

	hasAttribute( name ) {

		return this.attributes[ name ] !== undefined;

	}

	addGroup( start, count, materialIndex = 0 ) {

		this.groups.push( {

			start: start,
			count: count,
			materialIndex: materialIndex

		} );

	}

	clearGroups() {

		this.groups = [];

	}

	setDrawRange( start, count ) {

		this.drawRange.start = start;
		this.drawRange.count = count;

	}

	applyMatrix4( matrix ) {

		const position = this.attributes.position;

		if ( position !== undefined ) {

			position.applyMatrix4( matrix );

			position.needsUpdate = true;

		}

		const normal = this.attributes.normal;

		if ( normal !== undefined ) {

			const normalMatrix = new Matrix3().getNormalMatrix( matrix );

			normal.applyNormalMatrix( normalMatrix );

			normal.needsUpdate = true;

		}

		const tangent = this.attributes.tangent;

		if ( tangent !== undefined ) {

			tangent.transformDirection( matrix );

			tangent.needsUpdate = true;

		}

		if ( this.boundingBox !== null ) {

			this.computeBoundingBox();

		}

		if ( this.boundingSphere !== null ) {

			this.computeBoundingSphere();

		}

		return this;

	}

	applyQuaternion( q ) {

		_m1.makeRotationFromQuaternion( q );

		this.applyMatrix4( _m1 );

		return this;

	}

	rotateX( angle ) {

		// rotate geometry around world x-axis

		_m1.makeRotationX( angle );

		this.applyMatrix4( _m1 );

		return this;

	}

	rotateY( angle ) {

		// rotate geometry around world y-axis

		_m1.makeRotationY( angle );

		this.applyMatrix4( _m1 );

		return this;

	}

	rotateZ( angle ) {

		// rotate geometry around world z-axis

		_m1.makeRotationZ( angle );

		this.applyMatrix4( _m1 );

		return this;

	}

	translate( x, y, z ) {

		// translate geometry

		_m1.makeTranslation( x, y, z );

		this.applyMatrix4( _m1 );

		return this;

	}

	scale( x, y, z ) {

		// scale geometry

		_m1.makeScale( x, y, z );

		this.applyMatrix4( _m1 );

		return this;

	}

	lookAt( vector ) {

		_obj.lookAt( vector );

		_obj.updateMatrix();

		this.applyMatrix4( _obj.matrix );

		return this;

	}

	center() {

		this.computeBoundingBox();

		this.boundingBox.getCenter( _offset ).negate();

		this.translate( _offset.x, _offset.y, _offset.z );

		return this;

	}

	setFromPoints( points ) {

		const positionAttribute = this.getAttribute( 'position' );

		if ( positionAttribute === undefined ) {

			const position = [];

			for ( let i = 0, l = points.length; i < l; i ++ ) {

				const point = points[ i ];
				position.push( point.x, point.y, point.z || 0 );

			}

			this.setAttribute( 'position', new Float32BufferAttribute( position, 3 ) );

		} else {

			const l = Math.min( points.length, positionAttribute.count ); // make sure data do not exceed buffer size

			for ( let i = 0; i < l; i ++ ) {

				const point = points[ i ];
				positionAttribute.setXYZ( i, point.x, point.y, point.z || 0 );

			}

			if ( points.length > positionAttribute.count ) {

				console.warn( 'THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.' );

			}

			positionAttribute.needsUpdate = true;

		}

		return this;

	}

	computeBoundingBox() {

		if ( this.boundingBox === null ) {

			this.boundingBox = new Box3();

		}

		const position = this.attributes.position;
		const morphAttributesPosition = this.morphAttributes.position;

		if ( position && position.isGLBufferAttribute ) {

			console.error( 'THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.', this );

			this.boundingBox.set(
				new Vector3( - Infinity, - Infinity, - Infinity ),
				new Vector3( + Infinity, + Infinity, + Infinity )
			);

			return;

		}

		if ( position !== undefined ) {

			this.boundingBox.setFromBufferAttribute( position );

			// process morph attributes if present

			if ( morphAttributesPosition ) {

				for ( let i = 0, il = morphAttributesPosition.length; i < il; i ++ ) {

					const morphAttribute = morphAttributesPosition[ i ];
					_box$2.setFromBufferAttribute( morphAttribute );

					if ( this.morphTargetsRelative ) {

						_vector$8.addVectors( this.boundingBox.min, _box$2.min );
						this.boundingBox.expandByPoint( _vector$8 );

						_vector$8.addVectors( this.boundingBox.max, _box$2.max );
						this.boundingBox.expandByPoint( _vector$8 );

					} else {

						this.boundingBox.expandByPoint( _box$2.min );
						this.boundingBox.expandByPoint( _box$2.max );

					}

				}

			}

		} else {

			this.boundingBox.makeEmpty();

		}

		if ( isNaN( this.boundingBox.min.x ) || isNaN( this.boundingBox.min.y ) || isNaN( this.boundingBox.min.z ) ) {

			console.error( 'THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this );

		}

	}

	computeBoundingSphere() {

		if ( this.boundingSphere === null ) {

			this.boundingSphere = new Sphere();

		}

		const position = this.attributes.position;
		const morphAttributesPosition = this.morphAttributes.position;

		if ( position && position.isGLBufferAttribute ) {

			console.error( 'THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.', this );

			this.boundingSphere.set( new Vector3(), Infinity );

			return;

		}

		if ( position ) {

			// first, find the center of the bounding sphere

			const center = this.boundingSphere.center;

			_box$2.setFromBufferAttribute( position );

			// process morph attributes if present

			if ( morphAttributesPosition ) {

				for ( let i = 0, il = morphAttributesPosition.length; i < il; i ++ ) {

					const morphAttribute = morphAttributesPosition[ i ];
					_boxMorphTargets.setFromBufferAttribute( morphAttribute );

					if ( this.morphTargetsRelative ) {

						_vector$8.addVectors( _box$2.min, _boxMorphTargets.min );
						_box$2.expandByPoint( _vector$8 );

						_vector$8.addVectors( _box$2.max, _boxMorphTargets.max );
						_box$2.expandByPoint( _vector$8 );

					} else {

						_box$2.expandByPoint( _boxMorphTargets.min );
						_box$2.expandByPoint( _boxMorphTargets.max );

					}

				}

			}

			_box$2.getCenter( center );

			// second, try to find a boundingSphere with a radius smaller than the
			// boundingSphere of the boundingBox: sqrt(3) smaller in the best case

			let maxRadiusSq = 0;

			for ( let i = 0, il = position.count; i < il; i ++ ) {

				_vector$8.fromBufferAttribute( position, i );

				maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( _vector$8 ) );

			}

			// process morph attributes if present

			if ( morphAttributesPosition ) {

				for ( let i = 0, il = morphAttributesPosition.length; i < il; i ++ ) {

					const morphAttribute = morphAttributesPosition[ i ];
					const morphTargetsRelative = this.morphTargetsRelative;

					for ( let j = 0, jl = morphAttribute.count; j < jl; j ++ ) {

						_vector$8.fromBufferAttribute( morphAttribute, j );

						if ( morphTargetsRelative ) {

							_offset.fromBufferAttribute( position, j );
							_vector$8.add( _offset );

						}

						maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( _vector$8 ) );

					}

				}

			}

			this.boundingSphere.radius = Math.sqrt( maxRadiusSq );

			if ( isNaN( this.boundingSphere.radius ) ) {

				console.error( 'THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this );

			}

		}

	}

	computeTangents() {

		const index = this.index;
		const attributes = this.attributes;

		// based on http://www.terathon.com/code/tangent.html
		// (per vertex tangents)

		if ( index === null ||
			 attributes.position === undefined ||
			 attributes.normal === undefined ||
			 attributes.uv === undefined ) {

			console.error( 'THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)' );
			return;

		}

		const positionAttribute = attributes.position;
		const normalAttribute = attributes.normal;
		const uvAttribute = attributes.uv;

		if ( this.hasAttribute( 'tangent' ) === false ) {

			this.setAttribute( 'tangent', new BufferAttribute( new Float32Array( 4 * positionAttribute.count ), 4 ) );

		}

		const tangentAttribute = this.getAttribute( 'tangent' );

		const tan1 = [], tan2 = [];

		for ( let i = 0; i < positionAttribute.count; i ++ ) {

			tan1[ i ] = new Vector3();
			tan2[ i ] = new Vector3();

		}

		const vA = new Vector3(),
			vB = new Vector3(),
			vC = new Vector3(),

			uvA = new Vector2(),
			uvB = new Vector2(),
			uvC = new Vector2(),

			sdir = new Vector3(),
			tdir = new Vector3();

		function handleTriangle( a, b, c ) {

			vA.fromBufferAttribute( positionAttribute, a );
			vB.fromBufferAttribute( positionAttribute, b );
			vC.fromBufferAttribute( positionAttribute, c );

			uvA.fromBufferAttribute( uvAttribute, a );
			uvB.fromBufferAttribute( uvAttribute, b );
			uvC.fromBufferAttribute( uvAttribute, c );

			vB.sub( vA );
			vC.sub( vA );

			uvB.sub( uvA );
			uvC.sub( uvA );

			const r = 1.0 / ( uvB.x * uvC.y - uvC.x * uvB.y );

			// silently ignore degenerate uv triangles having coincident or colinear vertices

			if ( ! isFinite( r ) ) return;

			sdir.copy( vB ).multiplyScalar( uvC.y ).addScaledVector( vC, - uvB.y ).multiplyScalar( r );
			tdir.copy( vC ).multiplyScalar( uvB.x ).addScaledVector( vB, - uvC.x ).multiplyScalar( r );

			tan1[ a ].add( sdir );
			tan1[ b ].add( sdir );
			tan1[ c ].add( sdir );

			tan2[ a ].add( tdir );
			tan2[ b ].add( tdir );
			tan2[ c ].add( tdir );

		}

		let groups = this.groups;

		if ( groups.length === 0 ) {

			groups = [ {
				start: 0,
				count: index.count
			} ];

		}

		for ( let i = 0, il = groups.length; i < il; ++ i ) {

			const group = groups[ i ];

			const start = group.start;
			const count = group.count;

			for ( let j = start, jl = start + count; j < jl; j += 3 ) {

				handleTriangle(
					index.getX( j + 0 ),
					index.getX( j + 1 ),
					index.getX( j + 2 )
				);

			}

		}

		const tmp = new Vector3(), tmp2 = new Vector3();
		const n = new Vector3(), n2 = new Vector3();

		function handleVertex( v ) {

			n.fromBufferAttribute( normalAttribute, v );
			n2.copy( n );

			const t = tan1[ v ];

			// Gram-Schmidt orthogonalize

			tmp.copy( t );
			tmp.sub( n.multiplyScalar( n.dot( t ) ) ).normalize();

			// Calculate handedness

			tmp2.crossVectors( n2, t );
			const test = tmp2.dot( tan2[ v ] );
			const w = ( test < 0.0 ) ? - 1.0 : 1.0;

			tangentAttribute.setXYZW( v, tmp.x, tmp.y, tmp.z, w );

		}

		for ( let i = 0, il = groups.length; i < il; ++ i ) {

			const group = groups[ i ];

			const start = group.start;
			const count = group.count;

			for ( let j = start, jl = start + count; j < jl; j += 3 ) {

				handleVertex( index.getX( j + 0 ) );
				handleVertex( index.getX( j + 1 ) );
				handleVertex( index.getX( j + 2 ) );

			}

		}

	}

	computeVertexNormals() {

		const index = this.index;
		const positionAttribute = this.getAttribute( 'position' );

		if ( positionAttribute !== undefined ) {

			let normalAttribute = this.getAttribute( 'normal' );

			if ( normalAttribute === undefined ) {

				normalAttribute = new BufferAttribute( new Float32Array( positionAttribute.count * 3 ), 3 );
				this.setAttribute( 'normal', normalAttribute );

			} else {

				// reset existing normals to zero

				for ( let i = 0, il = normalAttribute.count; i < il; i ++ ) {

					normalAttribute.setXYZ( i, 0, 0, 0 );

				}

			}

			const pA = new Vector3(), pB = new Vector3(), pC = new Vector3();
			const nA = new Vector3(), nB = new Vector3(), nC = new Vector3();
			const cb = new Vector3(), ab = new Vector3();

			// indexed elements

			if ( index ) {

				for ( let i = 0, il = index.count; i < il; i += 3 ) {

					const vA = index.getX( i + 0 );
					const vB = index.getX( i + 1 );
					const vC = index.getX( i + 2 );

					pA.fromBufferAttribute( positionAttribute, vA );
					pB.fromBufferAttribute( positionAttribute, vB );
					pC.fromBufferAttribute( positionAttribute, vC );

					cb.subVectors( pC, pB );
					ab.subVectors( pA, pB );
					cb.cross( ab );

					nA.fromBufferAttribute( normalAttribute, vA );
					nB.fromBufferAttribute( normalAttribute, vB );
					nC.fromBufferAttribute( normalAttribute, vC );

					nA.add( cb );
					nB.add( cb );
					nC.add( cb );

					normalAttribute.setXYZ( vA, nA.x, nA.y, nA.z );
					normalAttribute.setXYZ( vB, nB.x, nB.y, nB.z );
					normalAttribute.setXYZ( vC, nC.x, nC.y, nC.z );

				}

			} else {

				// non-indexed elements (unconnected triangle soup)

				for ( let i = 0, il = positionAttribute.count; i < il; i += 3 ) {

					pA.fromBufferAttribute( positionAttribute, i + 0 );
					pB.fromBufferAttribute( positionAttribute, i + 1 );
					pC.fromBufferAttribute( positionAttribute, i + 2 );

					cb.subVectors( pC, pB );
					ab.subVectors( pA, pB );
					cb.cross( ab );

					normalAttribute.setXYZ( i + 0, cb.x, cb.y, cb.z );
					normalAttribute.setXYZ( i + 1, cb.x, cb.y, cb.z );
					normalAttribute.setXYZ( i + 2, cb.x, cb.y, cb.z );

				}

			}

			this.normalizeNormals();

			normalAttribute.needsUpdate = true;

		}

	}

	normalizeNormals() {

		const normals = this.attributes.normal;

		for ( let i = 0, il = normals.count; i < il; i ++ ) {

			_vector$8.fromBufferAttribute( normals, i );

			_vector$8.normalize();

			normals.setXYZ( i, _vector$8.x, _vector$8.y, _vector$8.z );

		}

	}

	toNonIndexed() {

		function convertBufferAttribute( attribute, indices ) {

			const array = attribute.array;
			const itemSize = attribute.itemSize;
			const normalized = attribute.normalized;

			const array2 = new array.constructor( indices.length * itemSize );

			let index = 0, index2 = 0;

			for ( let i = 0, l = indices.length; i < l; i ++ ) {

				if ( attribute.isInterleavedBufferAttribute ) {

					index = indices[ i ] * attribute.data.stride + attribute.offset;

				} else {

					index = indices[ i ] * itemSize;

				}

				for ( let j = 0; j < itemSize; j ++ ) {

					array2[ index2 ++ ] = array[ index ++ ];

				}

			}

			return new BufferAttribute( array2, itemSize, normalized );

		}

		//

		if ( this.index === null ) {

			console.warn( 'THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.' );
			return this;

		}

		const geometry2 = new BufferGeometry();

		const indices = this.index.array;
		const attributes = this.attributes;

		// attributes

		for ( const name in attributes ) {

			const attribute = attributes[ name ];

			const newAttribute = convertBufferAttribute( attribute, indices );

			geometry2.setAttribute( name, newAttribute );

		}

		// morph attributes

		const morphAttributes = this.morphAttributes;

		for ( const name in morphAttributes ) {

			const morphArray = [];
			const morphAttribute = morphAttributes[ name ]; // morphAttribute: array of Float32BufferAttributes

			for ( let i = 0, il = morphAttribute.length; i < il; i ++ ) {

				const attribute = morphAttribute[ i ];

				const newAttribute = convertBufferAttribute( attribute, indices );

				morphArray.push( newAttribute );

			}

			geometry2.morphAttributes[ name ] = morphArray;

		}

		geometry2.morphTargetsRelative = this.morphTargetsRelative;

		// groups

		const groups = this.groups;

		for ( let i = 0, l = groups.length; i < l; i ++ ) {

			const group = groups[ i ];
			geometry2.addGroup( group.start, group.count, group.materialIndex );

		}

		return geometry2;

	}

	toJSON() {

		const data = {
			metadata: {
				version: 4.6,
				type: 'BufferGeometry',
				generator: 'BufferGeometry.toJSON'
			}
		};

		// standard BufferGeometry serialization

		data.uuid = this.uuid;
		data.type = this.type;
		if ( this.name !== '' ) data.name = this.name;
		if ( Object.keys( this.userData ).length > 0 ) data.userData = this.userData;

		if ( this.parameters !== undefined ) {

			const parameters = this.parameters;

			for ( const key in parameters ) {

				if ( parameters[ key ] !== undefined ) data[ key ] = parameters[ key ];

			}

			return data;

		}

		// for simplicity the code assumes attributes are not shared across geometries, see #15811

		data.data = { attributes: {} };

		const index = this.index;

		if ( index !== null ) {

			data.data.index = {
				type: index.array.constructor.name,
				array: Array.prototype.slice.call( index.array )
			};

		}

		const attributes = this.attributes;

		for ( const key in attributes ) {

			const attribute = attributes[ key ];

			data.data.attributes[ key ] = attribute.toJSON( data.data );

		}

		const morphAttributes = {};
		let hasMorphAttributes = false;

		for ( const key in this.morphAttributes ) {

			const attributeArray = this.morphAttributes[ key ];

			const array = [];

			for ( let i = 0, il = attributeArray.length; i < il; i ++ ) {

				const attribute = attributeArray[ i ];

				array.push( attribute.toJSON( data.data ) );

			}

			if ( array.length > 0 ) {

				morphAttributes[ key ] = array;

				hasMorphAttributes = true;

			}

		}

		if ( hasMorphAttributes ) {

			data.data.morphAttributes = morphAttributes;
			data.data.morphTargetsRelative = this.morphTargetsRelative;

		}

		const groups = this.groups;

		if ( groups.length > 0 ) {

			data.data.groups = JSON.parse( JSON.stringify( groups ) );

		}

		const boundingSphere = this.boundingSphere;

		if ( boundingSphere !== null ) {

			data.data.boundingSphere = {
				center: boundingSphere.center.toArray(),
				radius: boundingSphere.radius
			};

		}

		return data;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	copy( source ) {

		// reset

		this.index = null;
		this.attributes = {};
		this.morphAttributes = {};
		this.groups = [];
		this.boundingBox = null;
		this.boundingSphere = null;

		// used for storing cloned, shared data

		const data = {};

		// name

		this.name = source.name;

		// index

		const index = source.index;

		if ( index !== null ) {

			this.setIndex( index.clone( data ) );

		}

		// attributes

		const attributes = source.attributes;

		for ( const name in attributes ) {

			const attribute = attributes[ name ];
			this.setAttribute( name, attribute.clone( data ) );

		}

		// morph attributes

		const morphAttributes = source.morphAttributes;

		for ( const name in morphAttributes ) {

			const array = [];
			const morphAttribute = morphAttributes[ name ]; // morphAttribute: array of Float32BufferAttributes

			for ( let i = 0, l = morphAttribute.length; i < l; i ++ ) {

				array.push( morphAttribute[ i ].clone( data ) );

			}

			this.morphAttributes[ name ] = array;

		}

		this.morphTargetsRelative = source.morphTargetsRelative;

		// groups

		const groups = source.groups;

		for ( let i = 0, l = groups.length; i < l; i ++ ) {

			const group = groups[ i ];
			this.addGroup( group.start, group.count, group.materialIndex );

		}

		// bounding box

		const boundingBox = source.boundingBox;

		if ( boundingBox !== null ) {

			this.boundingBox = boundingBox.clone();

		}

		// bounding sphere

		const boundingSphere = source.boundingSphere;

		if ( boundingSphere !== null ) {

			this.boundingSphere = boundingSphere.clone();

		}

		// draw range

		this.drawRange.start = source.drawRange.start;
		this.drawRange.count = source.drawRange.count;

		// user data

		this.userData = source.userData;

		return this;

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}

const _inverseMatrix$3 = /*@__PURE__*/ new Matrix4();
const _ray$3 = /*@__PURE__*/ new Ray();
const _sphere$6 = /*@__PURE__*/ new Sphere();
const _sphereHitAt = /*@__PURE__*/ new Vector3();

const _vA$1 = /*@__PURE__*/ new Vector3();
const _vB$1 = /*@__PURE__*/ new Vector3();
const _vC$1 = /*@__PURE__*/ new Vector3();

const _tempA = /*@__PURE__*/ new Vector3();
const _morphA = /*@__PURE__*/ new Vector3();

const _intersectionPoint = /*@__PURE__*/ new Vector3();
const _intersectionPointWorld = /*@__PURE__*/ new Vector3();

class Mesh extends Object3D {

	constructor( geometry = new BufferGeometry(), material = new MeshBasicMaterial() ) {

		super();

		this.isMesh = true;

		this.type = 'Mesh';

		this.geometry = geometry;
		this.material = material;

		this.updateMorphTargets();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		if ( source.morphTargetInfluences !== undefined ) {

			this.morphTargetInfluences = source.morphTargetInfluences.slice();

		}

		if ( source.morphTargetDictionary !== undefined ) {

			this.morphTargetDictionary = Object.assign( {}, source.morphTargetDictionary );

		}

		this.material = Array.isArray( source.material ) ? source.material.slice() : source.material;
		this.geometry = source.geometry;

		return this;

	}

	updateMorphTargets() {

		const geometry = this.geometry;

		const morphAttributes = geometry.morphAttributes;
		const keys = Object.keys( morphAttributes );

		if ( keys.length > 0 ) {

			const morphAttribute = morphAttributes[ keys[ 0 ] ];

			if ( morphAttribute !== undefined ) {

				this.morphTargetInfluences = [];
				this.morphTargetDictionary = {};

				for ( let m = 0, ml = morphAttribute.length; m < ml; m ++ ) {

					const name = morphAttribute[ m ].name || String( m );

					this.morphTargetInfluences.push( 0 );
					this.morphTargetDictionary[ name ] = m;

				}

			}

		}

	}

	getVertexPosition( index, target ) {

		const geometry = this.geometry;
		const position = geometry.attributes.position;
		const morphPosition = geometry.morphAttributes.position;
		const morphTargetsRelative = geometry.morphTargetsRelative;

		target.fromBufferAttribute( position, index );

		const morphInfluences = this.morphTargetInfluences;

		if ( morphPosition && morphInfluences ) {

			_morphA.set( 0, 0, 0 );

			for ( let i = 0, il = morphPosition.length; i < il; i ++ ) {

				const influence = morphInfluences[ i ];
				const morphAttribute = morphPosition[ i ];

				if ( influence === 0 ) continue;

				_tempA.fromBufferAttribute( morphAttribute, index );

				if ( morphTargetsRelative ) {

					_morphA.addScaledVector( _tempA, influence );

				} else {

					_morphA.addScaledVector( _tempA.sub( target ), influence );

				}

			}

			target.add( _morphA );

		}

		return target;

	}

	raycast( raycaster, intersects ) {

		const geometry = this.geometry;
		const material = this.material;
		const matrixWorld = this.matrixWorld;

		if ( material === undefined ) return;

		// test with bounding sphere in world space

		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		_sphere$6.copy( geometry.boundingSphere );
		_sphere$6.applyMatrix4( matrixWorld );

		// check distance from ray origin to bounding sphere

		_ray$3.copy( raycaster.ray ).recast( raycaster.near );

		if ( _sphere$6.containsPoint( _ray$3.origin ) === false ) {

			if ( _ray$3.intersectSphere( _sphere$6, _sphereHitAt ) === null ) return;

			if ( _ray$3.origin.distanceToSquared( _sphereHitAt ) > ( raycaster.far - raycaster.near ) ** 2 ) return;

		}

		// convert ray to local space of mesh

		_inverseMatrix$3.copy( matrixWorld ).invert();
		_ray$3.copy( raycaster.ray ).applyMatrix4( _inverseMatrix$3 );

		// test with bounding box in local space

		if ( geometry.boundingBox !== null ) {

			if ( _ray$3.intersectsBox( geometry.boundingBox ) === false ) return;

		}

		// test for intersections with geometry

		this._computeIntersections( raycaster, intersects, _ray$3 );

	}

	_computeIntersections( raycaster, intersects, rayLocalSpace ) {

		let intersection;

		const geometry = this.geometry;
		const material = this.material;

		const index = geometry.index;
		const position = geometry.attributes.position;
		const uv = geometry.attributes.uv;
		const uv1 = geometry.attributes.uv1;
		const normal = geometry.attributes.normal;
		const groups = geometry.groups;
		const drawRange = geometry.drawRange;

		if ( index !== null ) {

			// indexed buffer geometry

			if ( Array.isArray( material ) ) {

				for ( let i = 0, il = groups.length; i < il; i ++ ) {

					const group = groups[ i ];
					const groupMaterial = material[ group.materialIndex ];

					const start = Math.max( group.start, drawRange.start );
					const end = Math.min( index.count, Math.min( ( group.start + group.count ), ( drawRange.start + drawRange.count ) ) );

					for ( let j = start, jl = end; j < jl; j += 3 ) {

						const a = index.getX( j );
						const b = index.getX( j + 1 );
						const c = index.getX( j + 2 );

						intersection = checkGeometryIntersection( this, groupMaterial, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c );

						if ( intersection ) {

							intersection.faceIndex = Math.floor( j / 3 ); // triangle number in indexed buffer semantics
							intersection.face.materialIndex = group.materialIndex;
							intersects.push( intersection );

						}

					}

				}

			} else {

				const start = Math.max( 0, drawRange.start );
				const end = Math.min( index.count, ( drawRange.start + drawRange.count ) );

				for ( let i = start, il = end; i < il; i += 3 ) {

					const a = index.getX( i );
					const b = index.getX( i + 1 );
					const c = index.getX( i + 2 );

					intersection = checkGeometryIntersection( this, material, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c );

					if ( intersection ) {

						intersection.faceIndex = Math.floor( i / 3 ); // triangle number in indexed buffer semantics
						intersects.push( intersection );

					}

				}

			}

		} else if ( position !== undefined ) {

			// non-indexed buffer geometry

			if ( Array.isArray( material ) ) {

				for ( let i = 0, il = groups.length; i < il; i ++ ) {

					const group = groups[ i ];
					const groupMaterial = material[ group.materialIndex ];

					const start = Math.max( group.start, drawRange.start );
					const end = Math.min( position.count, Math.min( ( group.start + group.count ), ( drawRange.start + drawRange.count ) ) );

					for ( let j = start, jl = end; j < jl; j += 3 ) {

						const a = j;
						const b = j + 1;
						const c = j + 2;

						intersection = checkGeometryIntersection( this, groupMaterial, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c );

						if ( intersection ) {

							intersection.faceIndex = Math.floor( j / 3 ); // triangle number in non-indexed buffer semantics
							intersection.face.materialIndex = group.materialIndex;
							intersects.push( intersection );

						}

					}

				}

			} else {

				const start = Math.max( 0, drawRange.start );
				const end = Math.min( position.count, ( drawRange.start + drawRange.count ) );

				for ( let i = start, il = end; i < il; i += 3 ) {

					const a = i;
					const b = i + 1;
					const c = i + 2;

					intersection = checkGeometryIntersection( this, material, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c );

					if ( intersection ) {

						intersection.faceIndex = Math.floor( i / 3 ); // triangle number in non-indexed buffer semantics
						intersects.push( intersection );

					}

				}

			}

		}

	}

}

function checkIntersection$1( object, material, raycaster, ray, pA, pB, pC, point ) {

	let intersect;

	if ( material.side === BackSide ) {

		intersect = ray.intersectTriangle( pC, pB, pA, true, point );

	} else {

		intersect = ray.intersectTriangle( pA, pB, pC, ( material.side === FrontSide ), point );

	}

	if ( intersect === null ) return null;

	_intersectionPointWorld.copy( point );
	_intersectionPointWorld.applyMatrix4( object.matrixWorld );

	const distance = raycaster.ray.origin.distanceTo( _intersectionPointWorld );

	if ( distance < raycaster.near || distance > raycaster.far ) return null;

	return {
		distance: distance,
		point: _intersectionPointWorld.clone(),
		object: object
	};

}

function checkGeometryIntersection( object, material, raycaster, ray, uv, uv1, normal, a, b, c ) {

	object.getVertexPosition( a, _vA$1 );
	object.getVertexPosition( b, _vB$1 );
	object.getVertexPosition( c, _vC$1 );

	const intersection = checkIntersection$1( object, material, raycaster, ray, _vA$1, _vB$1, _vC$1, _intersectionPoint );

	if ( intersection ) {

		const barycoord = new Vector3();
		Triangle.getBarycoord( _intersectionPoint, _vA$1, _vB$1, _vC$1, barycoord );

		if ( uv ) {

			intersection.uv = Triangle.getInterpolatedAttribute( uv, a, b, c, barycoord, new Vector2() );

		}

		if ( uv1 ) {

			intersection.uv1 = Triangle.getInterpolatedAttribute( uv1, a, b, c, barycoord, new Vector2() );

		}

		if ( normal ) {

			intersection.normal = Triangle.getInterpolatedAttribute( normal, a, b, c, barycoord, new Vector3() );

			if ( intersection.normal.dot( ray.direction ) > 0 ) {

				intersection.normal.multiplyScalar( - 1 );

			}

		}

		const face = {
			a: a,
			b: b,
			c: c,
			normal: new Vector3(),
			materialIndex: 0
		};

		Triangle.getNormal( _vA$1, _vB$1, _vC$1, face.normal );

		intersection.face = face;
		intersection.barycoord = barycoord;

	}

	return intersection;

}

class BoxGeometry extends BufferGeometry {

	constructor( width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1 ) {

		super();

		this.type = 'BoxGeometry';

		this.parameters = {
			width: width,
			height: height,
			depth: depth,
			widthSegments: widthSegments,
			heightSegments: heightSegments,
			depthSegments: depthSegments
		};

		const scope = this;

		// segments

		widthSegments = Math.floor( widthSegments );
		heightSegments = Math.floor( heightSegments );
		depthSegments = Math.floor( depthSegments );

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// helper variables

		let numberOfVertices = 0;
		let groupStart = 0;

		// build each side of the box geometry

		buildPlane( 'z', 'y', 'x', - 1, - 1, depth, height, width, depthSegments, heightSegments, 0 ); // px
		buildPlane( 'z', 'y', 'x', 1, - 1, depth, height, - width, depthSegments, heightSegments, 1 ); // nx
		buildPlane( 'x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, 2 ); // py
		buildPlane( 'x', 'z', 'y', 1, - 1, width, depth, - height, widthSegments, depthSegments, 3 ); // ny
		buildPlane( 'x', 'y', 'z', 1, - 1, width, height, depth, widthSegments, heightSegments, 4 ); // pz
		buildPlane( 'x', 'y', 'z', - 1, - 1, width, height, - depth, widthSegments, heightSegments, 5 ); // nz

		// build geometry

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

		function buildPlane( u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex ) {

			const segmentWidth = width / gridX;
			const segmentHeight = height / gridY;

			const widthHalf = width / 2;
			const heightHalf = height / 2;
			const depthHalf = depth / 2;

			const gridX1 = gridX + 1;
			const gridY1 = gridY + 1;

			let vertexCounter = 0;
			let groupCount = 0;

			const vector = new Vector3();

			// generate vertices, normals and uvs

			for ( let iy = 0; iy < gridY1; iy ++ ) {

				const y = iy * segmentHeight - heightHalf;

				for ( let ix = 0; ix < gridX1; ix ++ ) {

					const x = ix * segmentWidth - widthHalf;

					// set values to correct vector component

					vector[ u ] = x * udir;
					vector[ v ] = y * vdir;
					vector[ w ] = depthHalf;

					// now apply vector to vertex buffer

					vertices.push( vector.x, vector.y, vector.z );

					// set values to correct vector component

					vector[ u ] = 0;
					vector[ v ] = 0;
					vector[ w ] = depth > 0 ? 1 : - 1;

					// now apply vector to normal buffer

					normals.push( vector.x, vector.y, vector.z );

					// uvs

					uvs.push( ix / gridX );
					uvs.push( 1 - ( iy / gridY ) );

					// counters

					vertexCounter += 1;

				}

			}

			// indices

			// 1. you need three indices to draw a single face
			// 2. a single segment consists of two faces
			// 3. so we need to generate six (2*3) indices per segment

			for ( let iy = 0; iy < gridY; iy ++ ) {

				for ( let ix = 0; ix < gridX; ix ++ ) {

					const a = numberOfVertices + ix + gridX1 * iy;
					const b = numberOfVertices + ix + gridX1 * ( iy + 1 );
					const c = numberOfVertices + ( ix + 1 ) + gridX1 * ( iy + 1 );
					const d = numberOfVertices + ( ix + 1 ) + gridX1 * iy;

					// faces

					indices.push( a, b, d );
					indices.push( b, c, d );

					// increase counter

					groupCount += 6;

				}

			}

			// add a group to the geometry. this will ensure multi material support

			scope.addGroup( groupStart, groupCount, materialIndex );

			// calculate new start value for groups

			groupStart += groupCount;

			// update total number of vertices

			numberOfVertices += vertexCounter;

		}

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	static fromJSON( data ) {

		return new BoxGeometry( data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments );

	}

}

/**
 * Uniform Utilities
 */

function cloneUniforms( src ) {

	const dst = {};

	for ( const u in src ) {

		dst[ u ] = {};

		for ( const p in src[ u ] ) {

			const property = src[ u ][ p ];

			if ( property && ( property.isColor ||
				property.isMatrix3 || property.isMatrix4 ||
				property.isVector2 || property.isVector3 || property.isVector4 ||
				property.isTexture || property.isQuaternion ) ) {

				if ( property.isRenderTargetTexture ) {

					console.warn( 'UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().' );
					dst[ u ][ p ] = null;

				} else {

					dst[ u ][ p ] = property.clone();

				}

			} else if ( Array.isArray( property ) ) {

				dst[ u ][ p ] = property.slice();

			} else {

				dst[ u ][ p ] = property;

			}

		}

	}

	return dst;

}

function mergeUniforms( uniforms ) {

	const merged = {};

	for ( let u = 0; u < uniforms.length; u ++ ) {

		const tmp = cloneUniforms( uniforms[ u ] );

		for ( const p in tmp ) {

			merged[ p ] = tmp[ p ];

		}

	}

	return merged;

}

function cloneUniformsGroups( src ) {

	const dst = [];

	for ( let u = 0; u < src.length; u ++ ) {

		dst.push( src[ u ].clone() );

	}

	return dst;

}

function getUnlitUniformColorSpace( renderer ) {

	const currentRenderTarget = renderer.getRenderTarget();

	if ( currentRenderTarget === null ) {

		// https://github.com/mrdoob/three.js/pull/23937#issuecomment-1111067398
		return renderer.outputColorSpace;

	}

	// https://github.com/mrdoob/three.js/issues/27868
	if ( currentRenderTarget.isXRRenderTarget === true ) {

		return currentRenderTarget.texture.colorSpace;

	}

	return ColorManagement.workingColorSpace;

}

// Legacy

const UniformsUtils = { clone: cloneUniforms, merge: mergeUniforms };

var default_vertex = "void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}";

var default_fragment = "void main() {\n\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}";

class ShaderMaterial extends Material {

	constructor( parameters ) {

		super();

		this.isShaderMaterial = true;

		this.type = 'ShaderMaterial';

		this.defines = {};
		this.uniforms = {};
		this.uniformsGroups = [];

		this.vertexShader = default_vertex;
		this.fragmentShader = default_fragment;

		this.linewidth = 1;

		this.wireframe = false;
		this.wireframeLinewidth = 1;

		this.fog = false; // set to use scene fog
		this.lights = false; // set to use scene lights
		this.clipping = false; // set to use user-defined clipping planes

		this.forceSinglePass = true;

		this.extensions = {
			clipCullDistance: false, // set to use vertex shader clipping
			multiDraw: false // set to use vertex shader multi_draw / enable gl_DrawID
		};

		// When rendered geometry doesn't include these attributes but the material does,
		// use these default values in WebGL. This avoids errors when buffer data is missing.
		this.defaultAttributeValues = {
			'color': [ 1, 1, 1 ],
			'uv': [ 0, 0 ],
			'uv1': [ 0, 0 ]
		};

		this.index0AttributeName = undefined;
		this.uniformsNeedUpdate = false;

		this.glslVersion = null;

		if ( parameters !== undefined ) {

			this.setValues( parameters );

		}

	}

	copy( source ) {

		super.copy( source );

		this.fragmentShader = source.fragmentShader;
		this.vertexShader = source.vertexShader;

		this.uniforms = cloneUniforms( source.uniforms );
		this.uniformsGroups = cloneUniformsGroups( source.uniformsGroups );

		this.defines = Object.assign( {}, source.defines );

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;

		this.fog = source.fog;
		this.lights = source.lights;
		this.clipping = source.clipping;

		this.extensions = Object.assign( {}, source.extensions );

		this.glslVersion = source.glslVersion;

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.glslVersion = this.glslVersion;
		data.uniforms = {};

		for ( const name in this.uniforms ) {

			const uniform = this.uniforms[ name ];
			const value = uniform.value;

			if ( value && value.isTexture ) {

				data.uniforms[ name ] = {
					type: 't',
					value: value.toJSON( meta ).uuid
				};

			} else if ( value && value.isColor ) {

				data.uniforms[ name ] = {
					type: 'c',
					value: value.getHex()
				};

			} else if ( value && value.isVector2 ) {

				data.uniforms[ name ] = {
					type: 'v2',
					value: value.toArray()
				};

			} else if ( value && value.isVector3 ) {

				data.uniforms[ name ] = {
					type: 'v3',
					value: value.toArray()
				};

			} else if ( value && value.isVector4 ) {

				data.uniforms[ name ] = {
					type: 'v4',
					value: value.toArray()
				};

			} else if ( value && value.isMatrix3 ) {

				data.uniforms[ name ] = {
					type: 'm3',
					value: value.toArray()
				};

			} else if ( value && value.isMatrix4 ) {

				data.uniforms[ name ] = {
					type: 'm4',
					value: value.toArray()
				};

			} else {

				data.uniforms[ name ] = {
					value: value
				};

				// note: the array variants v2v, v3v, v4v, m4v and tv are not supported so far

			}

		}

		if ( Object.keys( this.defines ).length > 0 ) data.defines = this.defines;

		data.vertexShader = this.vertexShader;
		data.fragmentShader = this.fragmentShader;

		data.lights = this.lights;
		data.clipping = this.clipping;

		const extensions = {};

		for ( const key in this.extensions ) {

			if ( this.extensions[ key ] === true ) extensions[ key ] = true;

		}

		if ( Object.keys( extensions ).length > 0 ) data.extensions = extensions;

		return data;

	}

}

class Camera extends Object3D {

	constructor() {

		super();

		this.isCamera = true;

		this.type = 'Camera';

		this.matrixWorldInverse = new Matrix4();

		this.projectionMatrix = new Matrix4();
		this.projectionMatrixInverse = new Matrix4();

		this.coordinateSystem = WebGLCoordinateSystem;

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.matrixWorldInverse.copy( source.matrixWorldInverse );

		this.projectionMatrix.copy( source.projectionMatrix );
		this.projectionMatrixInverse.copy( source.projectionMatrixInverse );

		this.coordinateSystem = source.coordinateSystem;

		return this;

	}

	getWorldDirection( target ) {

		return super.getWorldDirection( target ).negate();

	}

	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		this.matrixWorldInverse.copy( this.matrixWorld ).invert();

	}

	updateWorldMatrix( updateParents, updateChildren ) {

		super.updateWorldMatrix( updateParents, updateChildren );

		this.matrixWorldInverse.copy( this.matrixWorld ).invert();

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

const _v3$1 = /*@__PURE__*/ new Vector3();
const _minTarget = /*@__PURE__*/ new Vector2();
const _maxTarget = /*@__PURE__*/ new Vector2();


class PerspectiveCamera extends Camera {

	constructor( fov = 50, aspect = 1, near = 0.1, far = 2000 ) {

		super();

		this.isPerspectiveCamera = true;

		this.type = 'PerspectiveCamera';

		this.fov = fov;
		this.zoom = 1;

		this.near = near;
		this.far = far;
		this.focus = 10;

		this.aspect = aspect;
		this.view = null;

		this.filmGauge = 35;	// width of the film (default in millimeters)
		this.filmOffset = 0;	// horizontal film offset (same unit as gauge)

		this.updateProjectionMatrix();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.fov = source.fov;
		this.zoom = source.zoom;

		this.near = source.near;
		this.far = source.far;
		this.focus = source.focus;

		this.aspect = source.aspect;
		this.view = source.view === null ? null : Object.assign( {}, source.view );

		this.filmGauge = source.filmGauge;
		this.filmOffset = source.filmOffset;

		return this;

	}

	/**
	 * Sets the FOV by focal length in respect to the current .filmGauge.
	 *
	 * The default film gauge is 35, so that the focal length can be specified for
	 * a 35mm (full frame) camera.
	 *
	 * @param {number} focalLength - Values for focal length and film gauge must have the same unit.
	 */
	setFocalLength( focalLength ) {

		/** see {@link http://www.bobatkins.com/photography/technical/field_of_view.html} */
		const vExtentSlope = 0.5 * this.getFilmHeight() / focalLength;

		this.fov = RAD2DEG * 2 * Math.atan( vExtentSlope );
		this.updateProjectionMatrix();

	}

	/**
	 * Calculates the focal length from the current .fov and .filmGauge.
	 *
	 * @returns {number}
	 */
	getFocalLength() {

		const vExtentSlope = Math.tan( DEG2RAD * 0.5 * this.fov );

		return 0.5 * this.getFilmHeight() / vExtentSlope;

	}

	getEffectiveFOV() {

		return RAD2DEG * 2 * Math.atan(
			Math.tan( DEG2RAD * 0.5 * this.fov ) / this.zoom );

	}

	getFilmWidth() {

		// film not completely covered in portrait format (aspect < 1)
		return this.filmGauge * Math.min( this.aspect, 1 );

	}

	getFilmHeight() {

		// film not completely covered in landscape format (aspect > 1)
		return this.filmGauge / Math.max( this.aspect, 1 );

	}

	/**
	 * Computes the 2D bounds of the camera's viewable rectangle at a given distance along the viewing direction.
	 * Sets minTarget and maxTarget to the coordinates of the lower-left and upper-right corners of the view rectangle.
	 *
	 * @param {number} distance
	 * @param {Vector2} minTarget
	 * @param {Vector2} maxTarget
	 */
	getViewBounds( distance, minTarget, maxTarget ) {

		_v3$1.set( - 1, - 1, 0.5 ).applyMatrix4( this.projectionMatrixInverse );

		minTarget.set( _v3$1.x, _v3$1.y ).multiplyScalar( - distance / _v3$1.z );

		_v3$1.set( 1, 1, 0.5 ).applyMatrix4( this.projectionMatrixInverse );

		maxTarget.set( _v3$1.x, _v3$1.y ).multiplyScalar( - distance / _v3$1.z );

	}

	/**
	 * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
	 *
	 * @param {number} distance
	 * @param {Vector2} target - Vector2 target used to store result where x is width and y is height.
	 * @returns {Vector2}
	 */
	getViewSize( distance, target ) {

		this.getViewBounds( distance, _minTarget, _maxTarget );

		return target.subVectors( _maxTarget, _minTarget );

	}

	/**
	 * Sets an offset in a larger frustum. This is useful for multi-window or
	 * multi-monitor/multi-machine setups.
	 *
	 * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
	 * the monitors are in grid like this
	 *
	 *   +---+---+---+
	 *   | A | B | C |
	 *   +---+---+---+
	 *   | D | E | F |
	 *   +---+---+---+
	 *
	 * then for each monitor you would call it like this
	 *
	 *   const w = 1920;
	 *   const h = 1080;
	 *   const fullWidth = w * 3;
	 *   const fullHeight = h * 2;
	 *
	 *   --A--
	 *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
	 *   --B--
	 *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
	 *   --C--
	 *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
	 *   --D--
	 *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
	 *   --E--
	 *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
	 *   --F--
	 *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
	 *
	 *   Note there is no reason monitors have to be the same size or in a grid.
	 *
	 * @param {number} fullWidth
	 * @param {number} fullHeight
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 */
	setViewOffset( fullWidth, fullHeight, x, y, width, height ) {

		this.aspect = fullWidth / fullHeight;

		if ( this.view === null ) {

			this.view = {
				enabled: true,
				fullWidth: 1,
				fullHeight: 1,
				offsetX: 0,
				offsetY: 0,
				width: 1,
				height: 1
			};

		}

		this.view.enabled = true;
		this.view.fullWidth = fullWidth;
		this.view.fullHeight = fullHeight;
		this.view.offsetX = x;
		this.view.offsetY = y;
		this.view.width = width;
		this.view.height = height;

		this.updateProjectionMatrix();

	}

	clearViewOffset() {

		if ( this.view !== null ) {

			this.view.enabled = false;

		}

		this.updateProjectionMatrix();

	}

	updateProjectionMatrix() {

		const near = this.near;
		let top = near * Math.tan( DEG2RAD * 0.5 * this.fov ) / this.zoom;
		let height = 2 * top;
		let width = this.aspect * height;
		let left = - 0.5 * width;
		const view = this.view;

		if ( this.view !== null && this.view.enabled ) {

			const fullWidth = view.fullWidth,
				fullHeight = view.fullHeight;

			left += view.offsetX * width / fullWidth;
			top -= view.offsetY * height / fullHeight;
			width *= view.width / fullWidth;
			height *= view.height / fullHeight;

		}

		const skew = this.filmOffset;
		if ( skew !== 0 ) left += near * skew / this.getFilmWidth();

		this.projectionMatrix.makePerspective( left, left + width, top, top - height, near, this.far, this.coordinateSystem );

		this.projectionMatrixInverse.copy( this.projectionMatrix ).invert();

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.fov = this.fov;
		data.object.zoom = this.zoom;

		data.object.near = this.near;
		data.object.far = this.far;
		data.object.focus = this.focus;

		data.object.aspect = this.aspect;

		if ( this.view !== null ) data.object.view = Object.assign( {}, this.view );

		data.object.filmGauge = this.filmGauge;
		data.object.filmOffset = this.filmOffset;

		return data;

	}

}

const fov = - 90; // negative fov is not an error
const aspect = 1;

class CubeCamera extends Object3D {

	constructor( near, far, renderTarget ) {

		super();

		this.type = 'CubeCamera';

		this.renderTarget = renderTarget;
		this.coordinateSystem = null;
		this.activeMipmapLevel = 0;

		const cameraPX = new PerspectiveCamera( fov, aspect, near, far );
		cameraPX.layers = this.layers;
		this.add( cameraPX );

		const cameraNX = new PerspectiveCamera( fov, aspect, near, far );
		cameraNX.layers = this.layers;
		this.add( cameraNX );

		const cameraPY = new PerspectiveCamera( fov, aspect, near, far );
		cameraPY.layers = this.layers;
		this.add( cameraPY );

		const cameraNY = new PerspectiveCamera( fov, aspect, near, far );
		cameraNY.layers = this.layers;
		this.add( cameraNY );

		const cameraPZ = new PerspectiveCamera( fov, aspect, near, far );
		cameraPZ.layers = this.layers;
		this.add( cameraPZ );

		const cameraNZ = new PerspectiveCamera( fov, aspect, near, far );
		cameraNZ.layers = this.layers;
		this.add( cameraNZ );

	}

	updateCoordinateSystem() {

		const coordinateSystem = this.coordinateSystem;

		const cameras = this.children.concat();

		const [ cameraPX, cameraNX, cameraPY, cameraNY, cameraPZ, cameraNZ ] = cameras;

		for ( const camera of cameras ) this.remove( camera );

		if ( coordinateSystem === WebGLCoordinateSystem ) {

			cameraPX.up.set( 0, 1, 0 );
			cameraPX.lookAt( 1, 0, 0 );

			cameraNX.up.set( 0, 1, 0 );
			cameraNX.lookAt( - 1, 0, 0 );

			cameraPY.up.set( 0, 0, - 1 );
			cameraPY.lookAt( 0, 1, 0 );

			cameraNY.up.set( 0, 0, 1 );
			cameraNY.lookAt( 0, - 1, 0 );

			cameraPZ.up.set( 0, 1, 0 );
			cameraPZ.lookAt( 0, 0, 1 );

			cameraNZ.up.set( 0, 1, 0 );
			cameraNZ.lookAt( 0, 0, - 1 );

		} else if ( coordinateSystem === WebGPUCoordinateSystem ) {

			cameraPX.up.set( 0, - 1, 0 );
			cameraPX.lookAt( - 1, 0, 0 );

			cameraNX.up.set( 0, - 1, 0 );
			cameraNX.lookAt( 1, 0, 0 );

			cameraPY.up.set( 0, 0, 1 );
			cameraPY.lookAt( 0, 1, 0 );

			cameraNY.up.set( 0, 0, - 1 );
			cameraNY.lookAt( 0, - 1, 0 );

			cameraPZ.up.set( 0, - 1, 0 );
			cameraPZ.lookAt( 0, 0, 1 );

			cameraNZ.up.set( 0, - 1, 0 );
			cameraNZ.lookAt( 0, 0, - 1 );

		} else {

			throw new Error( 'THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: ' + coordinateSystem );

		}

		for ( const camera of cameras ) {

			this.add( camera );

			camera.updateMatrixWorld();

		}

	}

	update( renderer, scene ) {

		if ( this.parent === null ) this.updateMatrixWorld();

		const { renderTarget, activeMipmapLevel } = this;

		if ( this.coordinateSystem !== renderer.coordinateSystem ) {

			this.coordinateSystem = renderer.coordinateSystem;

			this.updateCoordinateSystem();

		}

		const [ cameraPX, cameraNX, cameraPY, cameraNY, cameraPZ, cameraNZ ] = this.children;

		const currentRenderTarget = renderer.getRenderTarget();
		const currentActiveCubeFace = renderer.getActiveCubeFace();
		const currentActiveMipmapLevel = renderer.getActiveMipmapLevel();

		const currentXrEnabled = renderer.xr.enabled;

		renderer.xr.enabled = false;

		const generateMipmaps = renderTarget.texture.generateMipmaps;

		renderTarget.texture.generateMipmaps = false;

		renderer.setRenderTarget( renderTarget, 0, activeMipmapLevel );
		renderer.render( scene, cameraPX );

		renderer.setRenderTarget( renderTarget, 1, activeMipmapLevel );
		renderer.render( scene, cameraNX );

		renderer.setRenderTarget( renderTarget, 2, activeMipmapLevel );
		renderer.render( scene, cameraPY );

		renderer.setRenderTarget( renderTarget, 3, activeMipmapLevel );
		renderer.render( scene, cameraNY );

		renderer.setRenderTarget( renderTarget, 4, activeMipmapLevel );
		renderer.render( scene, cameraPZ );

		// mipmaps are generated during the last call of render()
		// at this point, all sides of the cube render target are defined

		renderTarget.texture.generateMipmaps = generateMipmaps;

		renderer.setRenderTarget( renderTarget, 5, activeMipmapLevel );
		renderer.render( scene, cameraNZ );

		renderer.setRenderTarget( currentRenderTarget, currentActiveCubeFace, currentActiveMipmapLevel );

		renderer.xr.enabled = currentXrEnabled;

		renderTarget.texture.needsPMREMUpdate = true;

	}

}

class CubeTexture extends Texture {

	constructor( images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace ) {

		images = images !== undefined ? images : [];
		mapping = mapping !== undefined ? mapping : CubeReflectionMapping;

		super( images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace );

		this.isCubeTexture = true;

		this.flipY = false;

	}

	get images() {

		return this.image;

	}

	set images( value ) {

		this.image = value;

	}

}

class WebGLCubeRenderTarget extends WebGLRenderTarget {

	constructor( size = 1, options = {} ) {

		super( size, size, options );

		this.isWebGLCubeRenderTarget = true;

		const image = { width: size, height: size, depth: 1 };
		const images = [ image, image, image, image, image, image ];

		this.texture = new CubeTexture( images, options.mapping, options.wrapS, options.wrapT, options.magFilter, options.minFilter, options.format, options.type, options.anisotropy, options.colorSpace );

		// By convention -- likely based on the RenderMan spec from the 1990's -- cube maps are specified by WebGL (and three.js)
		// in a coordinate system in which positive-x is to the right when looking up the positive-z axis -- in other words,
		// in a left-handed coordinate system. By continuing this convention, preexisting cube maps continued to render correctly.

		// three.js uses a right-handed coordinate system. So environment maps used in three.js appear to have px and nx swapped
		// and the flag isRenderTargetTexture controls this conversion. The flip is not required when using WebGLCubeRenderTarget.texture
		// as a cube texture (this is detected when isRenderTargetTexture is set to true for cube textures).

		this.texture.isRenderTargetTexture = true;

		this.texture.generateMipmaps = options.generateMipmaps !== undefined ? options.generateMipmaps : false;
		this.texture.minFilter = options.minFilter !== undefined ? options.minFilter : LinearFilter;

	}

	fromEquirectangularTexture( renderer, texture ) {

		this.texture.type = texture.type;
		this.texture.colorSpace = texture.colorSpace;

		this.texture.generateMipmaps = texture.generateMipmaps;
		this.texture.minFilter = texture.minFilter;
		this.texture.magFilter = texture.magFilter;

		const shader = {

			uniforms: {
				tEquirect: { value: null },
			},

			vertexShader: /* glsl */`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,

			fragmentShader: /* glsl */`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
		};

		const geometry = new BoxGeometry( 5, 5, 5 );

		const material = new ShaderMaterial( {

			name: 'CubemapFromEquirect',

			uniforms: cloneUniforms( shader.uniforms ),
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			side: BackSide,
			blending: NoBlending

		} );

		material.uniforms.tEquirect.value = texture;

		const mesh = new Mesh( geometry, material );

		const currentMinFilter = texture.minFilter;

		// Avoid blurred poles
		if ( texture.minFilter === LinearMipmapLinearFilter ) texture.minFilter = LinearFilter;

		const camera = new CubeCamera( 1, 10, this );
		camera.update( renderer, mesh );

		texture.minFilter = currentMinFilter;

		mesh.geometry.dispose();
		mesh.material.dispose();

		return this;

	}

	clear( renderer, color, depth, stencil ) {

		const currentRenderTarget = renderer.getRenderTarget();

		for ( let i = 0; i < 6; i ++ ) {

			renderer.setRenderTarget( this, i );

			renderer.clear( color, depth, stencil );

		}

		renderer.setRenderTarget( currentRenderTarget );

	}

}

class FogExp2 {

	constructor( color, density = 0.00025 ) {

		this.isFogExp2 = true;

		this.name = '';

		this.color = new Color( color );
		this.density = density;

	}

	clone() {

		return new FogExp2( this.color, this.density );

	}

	toJSON( /* meta */ ) {

		return {
			type: 'FogExp2',
			name: this.name,
			color: this.color.getHex(),
			density: this.density
		};

	}

}

class Fog {

	constructor( color, near = 1, far = 1000 ) {

		this.isFog = true;

		this.name = '';

		this.color = new Color( color );

		this.near = near;
		this.far = far;

	}

	clone() {

		return new Fog( this.color, this.near, this.far );

	}

	toJSON( /* meta */ ) {

		return {
			type: 'Fog',
			name: this.name,
			color: this.color.getHex(),
			near: this.near,
			far: this.far
		};

	}

}

class Scene extends Object3D {

	constructor() {

		super();

		this.isScene = true;

		this.type = 'Scene';

		this.background = null;
		this.environment = null;
		this.fog = null;

		this.backgroundBlurriness = 0;
		this.backgroundIntensity = 1;
		this.backgroundRotation = new Euler();

		this.environmentIntensity = 1;
		this.environmentRotation = new Euler();

		this.overrideMaterial = null;

		if ( typeof __THREE_DEVTOOLS__ !== 'undefined' ) {

			__THREE_DEVTOOLS__.dispatchEvent( new CustomEvent( 'observe', { detail: this } ) );

		}

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		if ( source.background !== null ) this.background = source.background.clone();
		if ( source.environment !== null ) this.environment = source.environment.clone();
		if ( source.fog !== null ) this.fog = source.fog.clone();

		this.backgroundBlurriness = source.backgroundBlurriness;
		this.backgroundIntensity = source.backgroundIntensity;
		this.backgroundRotation.copy( source.backgroundRotation );

		this.environmentIntensity = source.environmentIntensity;
		this.environmentRotation.copy( source.environmentRotation );

		if ( source.overrideMaterial !== null ) this.overrideMaterial = source.overrideMaterial.clone();

		this.matrixAutoUpdate = source.matrixAutoUpdate;

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		if ( this.fog !== null ) data.object.fog = this.fog.toJSON();

		if ( this.backgroundBlurriness > 0 ) data.object.backgroundBlurriness = this.backgroundBlurriness;
		if ( this.backgroundIntensity !== 1 ) data.object.backgroundIntensity = this.backgroundIntensity;
		data.object.backgroundRotation = this.backgroundRotation.toArray();

		if ( this.environmentIntensity !== 1 ) data.object.environmentIntensity = this.environmentIntensity;
		data.object.environmentRotation = this.environmentRotation.toArray();

		return data;

	}

}

class InterleavedBuffer {

	constructor( array, stride ) {

		this.isInterleavedBuffer = true;

		this.array = array;
		this.stride = stride;
		this.count = array !== undefined ? array.length / stride : 0;

		this.usage = StaticDrawUsage;
		this.updateRanges = [];

		this.version = 0;

		this.uuid = generateUUID();

	}

	onUploadCallback() {}

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

	setUsage( value ) {

		this.usage = value;

		return this;

	}

	addUpdateRange( start, count ) {

		this.updateRanges.push( { start, count } );

	}

	clearUpdateRanges() {

		this.updateRanges.length = 0;

	}

	copy( source ) {

		this.array = new source.array.constructor( source.array );
		this.count = source.count;
		this.stride = source.stride;
		this.usage = source.usage;

		return this;

	}

	copyAt( index1, attribute, index2 ) {

		index1 *= this.stride;
		index2 *= attribute.stride;

		for ( let i = 0, l = this.stride; i < l; i ++ ) {

			this.array[ index1 + i ] = attribute.array[ index2 + i ];

		}

		return this;

	}

	set( value, offset = 0 ) {

		this.array.set( value, offset );

		return this;

	}

	clone( data ) {

		if ( data.arrayBuffers === undefined ) {

			data.arrayBuffers = {};

		}

		if ( this.array.buffer._uuid === undefined ) {

			this.array.buffer._uuid = generateUUID();

		}

		if ( data.arrayBuffers[ this.array.buffer._uuid ] === undefined ) {

			data.arrayBuffers[ this.array.buffer._uuid ] = this.array.slice( 0 ).buffer;

		}

		const array = new this.array.constructor( data.arrayBuffers[ this.array.buffer._uuid ] );

		const ib = new this.constructor( array, this.stride );
		ib.setUsage( this.usage );

		return ib;

	}

	onUpload( callback ) {

		this.onUploadCallback = callback;

		return this;

	}

	toJSON( data ) {

		if ( data.arrayBuffers === undefined ) {

			data.arrayBuffers = {};

		}

		// generate UUID for array buffer if necessary

		if ( this.array.buffer._uuid === undefined ) {

			this.array.buffer._uuid = generateUUID();

		}

		if ( data.arrayBuffers[ this.array.buffer._uuid ] === undefined ) {

			data.arrayBuffers[ this.array.buffer._uuid ] = Array.from( new Uint32Array( this.array.buffer ) );

		}

		//

		return {
			uuid: this.uuid,
			buffer: this.array.buffer._uuid,
			type: this.array.constructor.name,
			stride: this.stride
		};

	}

}

const _vector$7 = /*@__PURE__*/ new Vector3();

class InterleavedBufferAttribute {

	constructor( interleavedBuffer, itemSize, offset, normalized = false ) {

		this.isInterleavedBufferAttribute = true;

		this.name = '';

		this.data = interleavedBuffer;
		this.itemSize = itemSize;
		this.offset = offset;

		this.normalized = normalized;

	}

	get count() {

		return this.data.count;

	}

	get array() {

		return this.data.array;

	}

	set needsUpdate( value ) {

		this.data.needsUpdate = value;

	}

	applyMatrix4( m ) {

		for ( let i = 0, l = this.data.count; i < l; i ++ ) {

			_vector$7.fromBufferAttribute( this, i );

			_vector$7.applyMatrix4( m );

			this.setXYZ( i, _vector$7.x, _vector$7.y, _vector$7.z );

		}

		return this;

	}

	applyNormalMatrix( m ) {

		for ( let i = 0, l = this.count; i < l; i ++ ) {

			_vector$7.fromBufferAttribute( this, i );

			_vector$7.applyNormalMatrix( m );

			this.setXYZ( i, _vector$7.x, _vector$7.y, _vector$7.z );

		}

		return this;

	}

	transformDirection( m ) {

		for ( let i = 0, l = this.count; i < l; i ++ ) {

			_vector$7.fromBufferAttribute( this, i );

			_vector$7.transformDirection( m );

			this.setXYZ( i, _vector$7.x, _vector$7.y, _vector$7.z );

		}

		return this;

	}

	getComponent( index, component ) {

		let value = this.array[ index * this.data.stride + this.offset + component ];

		if ( this.normalized ) value = denormalize( value, this.array );

		return value;

	}

	setComponent( index, component, value ) {

		if ( this.normalized ) value = normalize( value, this.array );

		this.data.array[ index * this.data.stride + this.offset + component ] = value;

		return this;

	}

	setX( index, x ) {

		if ( this.normalized ) x = normalize( x, this.array );

		this.data.array[ index * this.data.stride + this.offset ] = x;

		return this;

	}

	setY( index, y ) {

		if ( this.normalized ) y = normalize( y, this.array );

		this.data.array[ index * this.data.stride + this.offset + 1 ] = y;

		return this;

	}

	setZ( index, z ) {

		if ( this.normalized ) z = normalize( z, this.array );

		this.data.array[ index * this.data.stride + this.offset + 2 ] = z;

		return this;

	}

	setW( index, w ) {

		if ( this.normalized ) w = normalize( w, this.array );

		this.data.array[ index * this.data.stride + this.offset + 3 ] = w;

		return this;

	}

	getX( index ) {

		let x = this.data.array[ index * this.data.stride + this.offset ];

		if ( this.normalized ) x = denormalize( x, this.array );

		return x;

	}

	getY( index ) {

		let y = this.data.array[ index * this.data.stride + this.offset + 1 ];

		if ( this.normalized ) y = denormalize( y, this.array );

		return y;

	}

	getZ( index ) {

		let z = this.data.array[ index * this.data.stride + this.offset + 2 ];

		if ( this.normalized ) z = denormalize( z, this.array );

		return z;

	}

	getW( index ) {

		let w = this.data.array[ index * this.data.stride + this.offset + 3 ];

		if ( this.normalized ) w = denormalize( w, this.array );

		return w;

	}

	setXY( index, x, y ) {

		index = index * this.data.stride + this.offset;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );

		}

		this.data.array[ index + 0 ] = x;
		this.data.array[ index + 1 ] = y;

		return this;

	}

	setXYZ( index, x, y, z ) {

		index = index * this.data.stride + this.offset;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );

		}

		this.data.array[ index + 0 ] = x;
		this.data.array[ index + 1 ] = y;
		this.data.array[ index + 2 ] = z;

		return this;

	}

	setXYZW( index, x, y, z, w ) {

		index = index * this.data.stride + this.offset;

		if ( this.normalized ) {

			x = normalize( x, this.array );
			y = normalize( y, this.array );
			z = normalize( z, this.array );
			w = normalize( w, this.array );

		}

		this.data.array[ index + 0 ] = x;
		this.data.array[ index + 1 ] = y;
		this.data.array[ index + 2 ] = z;
		this.data.array[ index + 3 ] = w;

		return this;

	}

	clone( data ) {

		if ( data === undefined ) {

			console.log( 'THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.' );

			const array = [];

			for ( let i = 0; i < this.count; i ++ ) {

				const index = i * this.data.stride + this.offset;

				for ( let j = 0; j < this.itemSize; j ++ ) {

					array.push( this.data.array[ index + j ] );

				}

			}

			return new BufferAttribute( new this.array.constructor( array ), this.itemSize, this.normalized );

		} else {

			if ( data.interleavedBuffers === undefined ) {

				data.interleavedBuffers = {};

			}

			if ( data.interleavedBuffers[ this.data.uuid ] === undefined ) {

				data.interleavedBuffers[ this.data.uuid ] = this.data.clone( data );

			}

			return new InterleavedBufferAttribute( data.interleavedBuffers[ this.data.uuid ], this.itemSize, this.offset, this.normalized );

		}

	}

	toJSON( data ) {

		if ( data === undefined ) {

			console.log( 'THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.' );

			const array = [];

			for ( let i = 0; i < this.count; i ++ ) {

				const index = i * this.data.stride + this.offset;

				for ( let j = 0; j < this.itemSize; j ++ ) {

					array.push( this.data.array[ index + j ] );

				}

			}

			// de-interleave data and save it as an ordinary buffer attribute for now

			return {
				itemSize: this.itemSize,
				type: this.array.constructor.name,
				array: array,
				normalized: this.normalized
			};

		} else {

			// save as true interleaved attribute

			if ( data.interleavedBuffers === undefined ) {

				data.interleavedBuffers = {};

			}

			if ( data.interleavedBuffers[ this.data.uuid ] === undefined ) {

				data.interleavedBuffers[ this.data.uuid ] = this.data.toJSON( data );

			}

			return {
				isInterleavedBufferAttribute: true,
				itemSize: this.itemSize,
				data: this.data.uuid,
				offset: this.offset,
				normalized: this.normalized
			};

		}

	}

}

class SpriteMaterial extends Material {

	constructor( parameters ) {

		super();

		this.isSpriteMaterial = true;

		this.type = 'SpriteMaterial';

		this.color = new Color( 0xffffff );

		this.map = null;

		this.alphaMap = null;

		this.rotation = 0;

		this.sizeAttenuation = true;

		this.transparent = true;

		this.fog = true;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.color.copy( source.color );

		this.map = source.map;

		this.alphaMap = source.alphaMap;

		this.rotation = source.rotation;

		this.sizeAttenuation = source.sizeAttenuation;

		this.fog = source.fog;

		return this;

	}

}

let _geometry;

const _intersectPoint = /*@__PURE__*/ new Vector3();
const _worldScale = /*@__PURE__*/ new Vector3();
const _mvPosition = /*@__PURE__*/ new Vector3();

const _alignedPosition = /*@__PURE__*/ new Vector2();
const _rotatedPosition = /*@__PURE__*/ new Vector2();
const _viewWorldMatrix = /*@__PURE__*/ new Matrix4();

const _vA = /*@__PURE__*/ new Vector3();
const _vB = /*@__PURE__*/ new Vector3();
const _vC = /*@__PURE__*/ new Vector3();

const _uvA = /*@__PURE__*/ new Vector2();
const _uvB = /*@__PURE__*/ new Vector2();
const _uvC = /*@__PURE__*/ new Vector2();

class Sprite extends Object3D {

	constructor( material = new SpriteMaterial() ) {

		super();

		this.isSprite = true;

		this.type = 'Sprite';

		if ( _geometry === undefined ) {

			_geometry = new BufferGeometry();

			const float32Array = new Float32Array( [
				- 0.5, - 0.5, 0, 0, 0,
				0.5, - 0.5, 0, 1, 0,
				0.5, 0.5, 0, 1, 1,
				- 0.5, 0.5, 0, 0, 1
			] );

			const interleavedBuffer = new InterleavedBuffer( float32Array, 5 );

			_geometry.setIndex( [ 0, 1, 2,	0, 2, 3 ] );
			_geometry.setAttribute( 'position', new InterleavedBufferAttribute( interleavedBuffer, 3, 0, false ) );
			_geometry.setAttribute( 'uv', new InterleavedBufferAttribute( interleavedBuffer, 2, 3, false ) );

		}

		this.geometry = _geometry;
		this.material = material;

		this.center = new Vector2( 0.5, 0.5 );

	}

	raycast( raycaster, intersects ) {

		if ( raycaster.camera === null ) {

			console.error( 'THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.' );

		}

		_worldScale.setFromMatrixScale( this.matrixWorld );

		_viewWorldMatrix.copy( raycaster.camera.matrixWorld );
		this.modelViewMatrix.multiplyMatrices( raycaster.camera.matrixWorldInverse, this.matrixWorld );

		_mvPosition.setFromMatrixPosition( this.modelViewMatrix );

		if ( raycaster.camera.isPerspectiveCamera && this.material.sizeAttenuation === false ) {

			_worldScale.multiplyScalar( - _mvPosition.z );

		}

		const rotation = this.material.rotation;
		let sin, cos;

		if ( rotation !== 0 ) {

			cos = Math.cos( rotation );
			sin = Math.sin( rotation );

		}

		const center = this.center;

		transformVertex( _vA.set( - 0.5, - 0.5, 0 ), _mvPosition, center, _worldScale, sin, cos );
		transformVertex( _vB.set( 0.5, - 0.5, 0 ), _mvPosition, center, _worldScale, sin, cos );
		transformVertex( _vC.set( 0.5, 0.5, 0 ), _mvPosition, center, _worldScale, sin, cos );

		_uvA.set( 0, 0 );
		_uvB.set( 1, 0 );
		_uvC.set( 1, 1 );

		// check first triangle
		let intersect = raycaster.ray.intersectTriangle( _vA, _vB, _vC, false, _intersectPoint );

		if ( intersect === null ) {

			// check second triangle
			transformVertex( _vB.set( - 0.5, 0.5, 0 ), _mvPosition, center, _worldScale, sin, cos );
			_uvB.set( 0, 1 );

			intersect = raycaster.ray.intersectTriangle( _vA, _vC, _vB, false, _intersectPoint );
			if ( intersect === null ) {

				return;

			}

		}

		const distance = raycaster.ray.origin.distanceTo( _intersectPoint );

		if ( distance < raycaster.near || distance > raycaster.far ) return;

		intersects.push( {

			distance: distance,
			point: _intersectPoint.clone(),
			uv: Triangle.getInterpolation( _intersectPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, new Vector2() ),
			face: null,
			object: this

		} );

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		if ( source.center !== undefined ) this.center.copy( source.center );

		this.material = source.material;

		return this;

	}

}

function transformVertex( vertexPosition, mvPosition, center, scale, sin, cos ) {

	// compute position in camera space
	_alignedPosition.subVectors( vertexPosition, center ).addScalar( 0.5 ).multiply( scale );

	// to check if rotation is not zero
	if ( sin !== undefined ) {

		_rotatedPosition.x = ( cos * _alignedPosition.x ) - ( sin * _alignedPosition.y );
		_rotatedPosition.y = ( sin * _alignedPosition.x ) + ( cos * _alignedPosition.y );

	} else {

		_rotatedPosition.copy( _alignedPosition );

	}


	vertexPosition.copy( mvPosition );
	vertexPosition.x += _rotatedPosition.x;
	vertexPosition.y += _rotatedPosition.y;

	// transform to world space
	vertexPosition.applyMatrix4( _viewWorldMatrix );

}

const _v1$2 = /*@__PURE__*/ new Vector3();
const _v2$1 = /*@__PURE__*/ new Vector3();

class LOD extends Object3D {

	constructor() {

		super();

		this._currentLevel = 0;

		this.type = 'LOD';

		Object.defineProperties( this, {
			levels: {
				enumerable: true,
				value: []
			},
			isLOD: {
				value: true,
			}
		} );

		this.autoUpdate = true;

	}

	copy( source ) {

		super.copy( source, false );

		const levels = source.levels;

		for ( let i = 0, l = levels.length; i < l; i ++ ) {

			const level = levels[ i ];

			this.addLevel( level.object.clone(), level.distance, level.hysteresis );

		}

		this.autoUpdate = source.autoUpdate;

		return this;

	}

	addLevel( object, distance = 0, hysteresis = 0 ) {

		distance = Math.abs( distance );

		const levels = this.levels;

		let l;

		for ( l = 0; l < levels.length; l ++ ) {

			if ( distance < levels[ l ].distance ) {

				break;

			}

		}

		levels.splice( l, 0, { distance: distance, hysteresis: hysteresis, object: object } );

		this.add( object );

		return this;

	}

	removeLevel( distance ) {

		const levels = this.levels;

		for ( let i = 0; i < levels.length; i ++ ) {

			if ( levels[ i ].distance === distance ) {

				const removedElements = levels.splice( i, 1 );
				this.remove( removedElements[ 0 ].object );

				return true;

			}

		}

		return false;

	}

	getCurrentLevel() {

		return this._currentLevel;

	}



	getObjectForDistance( distance ) {

		const levels = this.levels;

		if ( levels.length > 0 ) {

			let i, l;

			for ( i = 1, l = levels.length; i < l; i ++ ) {

				let levelDistance = levels[ i ].distance;

				if ( levels[ i ].object.visible ) {

					levelDistance -= levelDistance * levels[ i ].hysteresis;

				}

				if ( distance < levelDistance ) {

					break;

				}

			}

			return levels[ i - 1 ].object;

		}

		return null;

	}

	raycast( raycaster, intersects ) {

		const levels = this.levels;

		if ( levels.length > 0 ) {

			_v1$2.setFromMatrixPosition( this.matrixWorld );

			const distance = raycaster.ray.origin.distanceTo( _v1$2 );

			this.getObjectForDistance( distance ).raycast( raycaster, intersects );

		}

	}

	update( camera ) {

		const levels = this.levels;

		if ( levels.length > 1 ) {

			_v1$2.setFromMatrixPosition( camera.matrixWorld );
			_v2$1.setFromMatrixPosition( this.matrixWorld );

			const distance = _v1$2.distanceTo( _v2$1 ) / camera.zoom;

			levels[ 0 ].object.visible = true;

			let i, l;

			for ( i = 1, l = levels.length; i < l; i ++ ) {

				let levelDistance = levels[ i ].distance;

				if ( levels[ i ].object.visible ) {

					levelDistance -= levelDistance * levels[ i ].hysteresis;

				}

				if ( distance >= levelDistance ) {

					levels[ i - 1 ].object.visible = false;
					levels[ i ].object.visible = true;

				} else {

					break;

				}

			}

			this._currentLevel = i - 1;

			for ( ; i < l; i ++ ) {

				levels[ i ].object.visible = false;

			}

		}

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		if ( this.autoUpdate === false ) data.object.autoUpdate = false;

		data.object.levels = [];

		const levels = this.levels;

		for ( let i = 0, l = levels.length; i < l; i ++ ) {

			const level = levels[ i ];

			data.object.levels.push( {
				object: level.object.uuid,
				distance: level.distance,
				hysteresis: level.hysteresis
			} );

		}

		return data;

	}

}

const _basePosition = /*@__PURE__*/ new Vector3();

const _skinIndex = /*@__PURE__*/ new Vector4();
const _skinWeight = /*@__PURE__*/ new Vector4();

const _vector3 = /*@__PURE__*/ new Vector3();
const _matrix4 = /*@__PURE__*/ new Matrix4();
const _vertex = /*@__PURE__*/ new Vector3();

const _sphere$5 = /*@__PURE__*/ new Sphere();
const _inverseMatrix$2 = /*@__PURE__*/ new Matrix4();
const _ray$2 = /*@__PURE__*/ new Ray();

class SkinnedMesh extends Mesh {

	constructor( geometry, material ) {

		super( geometry, material );

		this.isSkinnedMesh = true;

		this.type = 'SkinnedMesh';

		this.bindMode = AttachedBindMode;
		this.bindMatrix = new Matrix4();
		this.bindMatrixInverse = new Matrix4();

		this.boundingBox = null;
		this.boundingSphere = null;

	}

	computeBoundingBox() {

		const geometry = this.geometry;

		if ( this.boundingBox === null ) {

			this.boundingBox = new Box3();

		}

		this.boundingBox.makeEmpty();

		const positionAttribute = geometry.getAttribute( 'position' );

		for ( let i = 0; i < positionAttribute.count; i ++ ) {

			this.getVertexPosition( i, _vertex );
			this.boundingBox.expandByPoint( _vertex );

		}

	}

	computeBoundingSphere() {

		const geometry = this.geometry;

		if ( this.boundingSphere === null ) {

			this.boundingSphere = new Sphere();

		}

		this.boundingSphere.makeEmpty();

		const positionAttribute = geometry.getAttribute( 'position' );

		for ( let i = 0; i < positionAttribute.count; i ++ ) {

			this.getVertexPosition( i, _vertex );
			this.boundingSphere.expandByPoint( _vertex );

		}

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.bindMode = source.bindMode;
		this.bindMatrix.copy( source.bindMatrix );
		this.bindMatrixInverse.copy( source.bindMatrixInverse );

		this.skeleton = source.skeleton;

		if ( source.boundingBox !== null ) this.boundingBox = source.boundingBox.clone();
		if ( source.boundingSphere !== null ) this.boundingSphere = source.boundingSphere.clone();

		return this;

	}

	raycast( raycaster, intersects ) {

		const material = this.material;
		const matrixWorld = this.matrixWorld;

		if ( material === undefined ) return;

		// test with bounding sphere in world space

		if ( this.boundingSphere === null ) this.computeBoundingSphere();

		_sphere$5.copy( this.boundingSphere );
		_sphere$5.applyMatrix4( matrixWorld );

		if ( raycaster.ray.intersectsSphere( _sphere$5 ) === false ) return;

		// convert ray to local space of skinned mesh

		_inverseMatrix$2.copy( matrixWorld ).invert();
		_ray$2.copy( raycaster.ray ).applyMatrix4( _inverseMatrix$2 );

		// test with bounding box in local space

		if ( this.boundingBox !== null ) {

			if ( _ray$2.intersectsBox( this.boundingBox ) === false ) return;

		}

		// test for intersections with geometry

		this._computeIntersections( raycaster, intersects, _ray$2 );

	}

	getVertexPosition( index, target ) {

		super.getVertexPosition( index, target );

		this.applyBoneTransform( index, target );

		return target;

	}

	bind( skeleton, bindMatrix ) {

		this.skeleton = skeleton;

		if ( bindMatrix === undefined ) {

			this.updateMatrixWorld( true );

			this.skeleton.calculateInverses();

			bindMatrix = this.matrixWorld;

		}

		this.bindMatrix.copy( bindMatrix );
		this.bindMatrixInverse.copy( bindMatrix ).invert();

	}

	pose() {

		this.skeleton.pose();

	}

	normalizeSkinWeights() {

		const vector = new Vector4();

		const skinWeight = this.geometry.attributes.skinWeight;

		for ( let i = 0, l = skinWeight.count; i < l; i ++ ) {

			vector.fromBufferAttribute( skinWeight, i );

			const scale = 1.0 / vector.manhattanLength();

			if ( scale !== Infinity ) {

				vector.multiplyScalar( scale );

			} else {

				vector.set( 1, 0, 0, 0 ); // do something reasonable

			}

			skinWeight.setXYZW( i, vector.x, vector.y, vector.z, vector.w );

		}

	}

	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		if ( this.bindMode === AttachedBindMode ) {

			this.bindMatrixInverse.copy( this.matrixWorld ).invert();

		} else if ( this.bindMode === DetachedBindMode ) {

			this.bindMatrixInverse.copy( this.bindMatrix ).invert();

		} else {

			console.warn( 'THREE.SkinnedMesh: Unrecognized bindMode: ' + this.bindMode );

		}

	}

	applyBoneTransform( index, vector ) {

		const skeleton = this.skeleton;
		const geometry = this.geometry;

		_skinIndex.fromBufferAttribute( geometry.attributes.skinIndex, index );
		_skinWeight.fromBufferAttribute( geometry.attributes.skinWeight, index );

		_basePosition.copy( vector ).applyMatrix4( this.bindMatrix );

		vector.set( 0, 0, 0 );

		for ( let i = 0; i < 4; i ++ ) {

			const weight = _skinWeight.getComponent( i );

			if ( weight !== 0 ) {

				const boneIndex = _skinIndex.getComponent( i );

				_matrix4.multiplyMatrices( skeleton.bones[ boneIndex ].matrixWorld, skeleton.boneInverses[ boneIndex ] );

				vector.addScaledVector( _vector3.copy( _basePosition ).applyMatrix4( _matrix4 ), weight );

			}

		}

		return vector.applyMatrix4( this.bindMatrixInverse );

	}

}

class Bone extends Object3D {

	constructor() {

		super();

		this.isBone = true;

		this.type = 'Bone';

	}

}

class DataTexture extends Texture {

	constructor( data = null, width = 1, height = 1, format, type, mapping, wrapS, wrapT, magFilter = NearestFilter, minFilter = NearestFilter, anisotropy, colorSpace ) {

		super( null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace );

		this.isDataTexture = true;

		this.image = { data: data, width: width, height: height };

		this.generateMipmaps = false;
		this.flipY = false;
		this.unpackAlignment = 1;

	}

}

const _offsetMatrix = /*@__PURE__*/ new Matrix4();
const _identityMatrix = /*@__PURE__*/ new Matrix4();

class Skeleton {

	constructor( bones = [], boneInverses = [] ) {

		this.uuid = generateUUID();

		this.bones = bones.slice( 0 );
		this.boneInverses = boneInverses;
		this.boneMatrices = null;

		this.boneTexture = null;

		this.init();

	}

	init() {

		const bones = this.bones;
		const boneInverses = this.boneInverses;

		this.boneMatrices = new Float32Array( bones.length * 16 );

		// calculate inverse bone matrices if necessary

		if ( boneInverses.length === 0 ) {

			this.calculateInverses();

		} else {

			// handle special case

			if ( bones.length !== boneInverses.length ) {

				console.warn( 'THREE.Skeleton: Number of inverse bone matrices does not match amount of bones.' );

				this.boneInverses = [];

				for ( let i = 0, il = this.bones.length; i < il; i ++ ) {

					this.boneInverses.push( new Matrix4() );

				}

			}

		}

	}

	calculateInverses() {

		this.boneInverses.length = 0;

		for ( let i = 0, il = this.bones.length; i < il; i ++ ) {

			const inverse = new Matrix4();

			if ( this.bones[ i ] ) {

				inverse.copy( this.bones[ i ].matrixWorld ).invert();

			}

			this.boneInverses.push( inverse );

		}

	}

	pose() {

		// recover the bind-time world matrices

		for ( let i = 0, il = this.bones.length; i < il; i ++ ) {

			const bone = this.bones[ i ];

			if ( bone ) {

				bone.matrixWorld.copy( this.boneInverses[ i ] ).invert();

			}

		}

		// compute the local matrices, positions, rotations and scales

		for ( let i = 0, il = this.bones.length; i < il; i ++ ) {

			const bone = this.bones[ i ];

			if ( bone ) {

				if ( bone.parent && bone.parent.isBone ) {

					bone.matrix.copy( bone.parent.matrixWorld ).invert();
					bone.matrix.multiply( bone.matrixWorld );

				} else {

					bone.matrix.copy( bone.matrixWorld );

				}

				bone.matrix.decompose( bone.position, bone.quaternion, bone.scale );

			}

		}

	}

	update() {

		const bones = this.bones;
		const boneInverses = this.boneInverses;
		const boneMatrices = this.boneMatrices;
		const boneTexture = this.boneTexture;

		// flatten bone matrices to array

		for ( let i = 0, il = bones.length; i < il; i ++ ) {

			// compute the offset between the current and the original transform

			const matrix = bones[ i ] ? bones[ i ].matrixWorld : _identityMatrix;

			_offsetMatrix.multiplyMatrices( matrix, boneInverses[ i ] );
			_offsetMatrix.toArray( boneMatrices, i * 16 );

		}

		if ( boneTexture !== null ) {

			boneTexture.needsUpdate = true;

		}

	}

	clone() {

		return new Skeleton( this.bones, this.boneInverses );

	}

	computeBoneTexture() {

		// layout (1 matrix = 4 pixels)
		//      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
		//  with  8x8  pixel texture max   16 bones * 4 pixels =  (8 * 8)
		//       16x16 pixel texture max   64 bones * 4 pixels = (16 * 16)
		//       32x32 pixel texture max  256 bones * 4 pixels = (32 * 32)
		//       64x64 pixel texture max 1024 bones * 4 pixels = (64 * 64)

		let size = Math.sqrt( this.bones.length * 4 ); // 4 pixels needed for 1 matrix
		size = Math.ceil( size / 4 ) * 4;
		size = Math.max( size, 4 );

		const boneMatrices = new Float32Array( size * size * 4 ); // 4 floats per RGBA pixel
		boneMatrices.set( this.boneMatrices ); // copy current values

		const boneTexture = new DataTexture( boneMatrices, size, size, RGBAFormat, FloatType );
		boneTexture.needsUpdate = true;

		this.boneMatrices = boneMatrices;
		this.boneTexture = boneTexture;

		return this;

	}

	getBoneByName( name ) {

		for ( let i = 0, il = this.bones.length; i < il; i ++ ) {

			const bone = this.bones[ i ];

			if ( bone.name === name ) {

				return bone;

			}

		}

		return undefined;

	}

	dispose( ) {

		if ( this.boneTexture !== null ) {

			this.boneTexture.dispose();

			this.boneTexture = null;

		}

	}

	fromJSON( json, bones ) {

		this.uuid = json.uuid;

		for ( let i = 0, l = json.bones.length; i < l; i ++ ) {

			const uuid = json.bones[ i ];
			let bone = bones[ uuid ];

			if ( bone === undefined ) {

				console.warn( 'THREE.Skeleton: No bone found with UUID:', uuid );
				bone = new Bone();

			}

			this.bones.push( bone );
			this.boneInverses.push( new Matrix4().fromArray( json.boneInverses[ i ] ) );

		}

		this.init();

		return this;

	}

	toJSON() {

		const data = {
			metadata: {
				version: 4.6,
				type: 'Skeleton',
				generator: 'Skeleton.toJSON'
			},
			bones: [],
			boneInverses: []
		};

		data.uuid = this.uuid;

		const bones = this.bones;
		const boneInverses = this.boneInverses;

		for ( let i = 0, l = bones.length; i < l; i ++ ) {

			const bone = bones[ i ];
			data.bones.push( bone.uuid );

			const boneInverse = boneInverses[ i ];
			data.boneInverses.push( boneInverse.toArray() );

		}

		return data;

	}

}

class InstancedBufferAttribute extends BufferAttribute {

	constructor( array, itemSize, normalized, meshPerAttribute = 1 ) {

		super( array, itemSize, normalized );

		this.isInstancedBufferAttribute = true;

		this.meshPerAttribute = meshPerAttribute;

	}

	copy( source ) {

		super.copy( source );

		this.meshPerAttribute = source.meshPerAttribute;

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.meshPerAttribute = this.meshPerAttribute;

		data.isInstancedBufferAttribute = true;

		return data;

	}

}

const _instanceLocalMatrix = /*@__PURE__*/ new Matrix4();
const _instanceWorldMatrix = /*@__PURE__*/ new Matrix4();

const _instanceIntersects = [];

const _box3 = /*@__PURE__*/ new Box3();
const _identity = /*@__PURE__*/ new Matrix4();
const _mesh$1 = /*@__PURE__*/ new Mesh();
const _sphere$4 = /*@__PURE__*/ new Sphere();

class InstancedMesh extends Mesh {

	constructor( geometry, material, count ) {

		super( geometry, material );

		this.isInstancedMesh = true;

		this.instanceMatrix = new InstancedBufferAttribute( new Float32Array( count * 16 ), 16 );
		this.instanceColor = null;
		this.morphTexture = null;

		this.count = count;

		this.boundingBox = null;
		this.boundingSphere = null;

		for ( let i = 0; i < count; i ++ ) {

			this.setMatrixAt( i, _identity );

		}

	}

	computeBoundingBox() {

		const geometry = this.geometry;
		const count = this.count;

		if ( this.boundingBox === null ) {

			this.boundingBox = new Box3();

		}

		if ( geometry.boundingBox === null ) {

			geometry.computeBoundingBox();

		}

		this.boundingBox.makeEmpty();

		for ( let i = 0; i < count; i ++ ) {

			this.getMatrixAt( i, _instanceLocalMatrix );

			_box3.copy( geometry.boundingBox ).applyMatrix4( _instanceLocalMatrix );

			this.boundingBox.union( _box3 );

		}

	}

	computeBoundingSphere() {

		const geometry = this.geometry;
		const count = this.count;

		if ( this.boundingSphere === null ) {

			this.boundingSphere = new Sphere();

		}

		if ( geometry.boundingSphere === null ) {

			geometry.computeBoundingSphere();

		}

		this.boundingSphere.makeEmpty();

		for ( let i = 0; i < count; i ++ ) {

			this.getMatrixAt( i, _instanceLocalMatrix );

			_sphere$4.copy( geometry.boundingSphere ).applyMatrix4( _instanceLocalMatrix );

			this.boundingSphere.union( _sphere$4 );

		}

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.instanceMatrix.copy( source.instanceMatrix );

		if ( source.morphTexture !== null ) this.morphTexture = source.morphTexture.clone();
		if ( source.instanceColor !== null ) this.instanceColor = source.instanceColor.clone();

		this.count = source.count;

		if ( source.boundingBox !== null ) this.boundingBox = source.boundingBox.clone();
		if ( source.boundingSphere !== null ) this.boundingSphere = source.boundingSphere.clone();

		return this;

	}

	getColorAt( index, color ) {

		color.fromArray( this.instanceColor.array, index * 3 );

	}

	getMatrixAt( index, matrix ) {

		matrix.fromArray( this.instanceMatrix.array, index * 16 );

	}

	getMorphAt( index, object ) {

		const objectInfluences = object.morphTargetInfluences;

		const array = this.morphTexture.source.data.data;

		const len = objectInfluences.length + 1; // All influences + the baseInfluenceSum

		const dataIndex = index * len + 1; // Skip the baseInfluenceSum at the beginning

		for ( let i = 0; i < objectInfluences.length; i ++ ) {

			objectInfluences[ i ] = array[ dataIndex + i ];

		}

	}

	raycast( raycaster, intersects ) {

		const matrixWorld = this.matrixWorld;
		const raycastTimes = this.count;

		_mesh$1.geometry = this.geometry;
		_mesh$1.material = this.material;

		if ( _mesh$1.material === undefined ) return;

		// test with bounding sphere first

		if ( this.boundingSphere === null ) this.computeBoundingSphere();

		_sphere$4.copy( this.boundingSphere );
		_sphere$4.applyMatrix4( matrixWorld );

		if ( raycaster.ray.intersectsSphere( _sphere$4 ) === false ) return;

		// now test each instance

		for ( let instanceId = 0; instanceId < raycastTimes; instanceId ++ ) {

			// calculate the world matrix for each instance

			this.getMatrixAt( instanceId, _instanceLocalMatrix );

			_instanceWorldMatrix.multiplyMatrices( matrixWorld, _instanceLocalMatrix );

			// the mesh represents this single instance

			_mesh$1.matrixWorld = _instanceWorldMatrix;

			_mesh$1.raycast( raycaster, _instanceIntersects );

			// process the result of raycast

			for ( let i = 0, l = _instanceIntersects.length; i < l; i ++ ) {

				const intersect = _instanceIntersects[ i ];
				intersect.instanceId = instanceId;
				intersect.object = this;
				intersects.push( intersect );

			}

			_instanceIntersects.length = 0;

		}

	}

	setColorAt( index, color ) {

		if ( this.instanceColor === null ) {

			this.instanceColor = new InstancedBufferAttribute( new Float32Array( this.instanceMatrix.count * 3 ).fill( 1 ), 3 );

		}

		color.toArray( this.instanceColor.array, index * 3 );

	}

	setMatrixAt( index, matrix ) {

		matrix.toArray( this.instanceMatrix.array, index * 16 );

	}

	setMorphAt( index, object ) {

		const objectInfluences = object.morphTargetInfluences;

		const len = objectInfluences.length + 1; // morphBaseInfluence + all influences

		if ( this.morphTexture === null ) {

			this.morphTexture = new DataTexture( new Float32Array( len * this.count ), len, this.count, RedFormat, FloatType );

		}

		const array = this.morphTexture.source.data.data;

		let morphInfluencesSum = 0;

		for ( let i = 0; i < objectInfluences.length; i ++ ) {

			morphInfluencesSum += objectInfluences[ i ];

		}

		const morphBaseInfluence = this.geometry.morphTargetsRelative ? 1 : 1 - morphInfluencesSum;

		const dataIndex = len * index;

		array[ dataIndex ] = morphBaseInfluence;

		array.set( objectInfluences, dataIndex + 1 );

	}

	updateMorphTargets() {

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

		if ( this.morphTexture !== null ) {

			this.morphTexture.dispose();
			this.morphTexture = null;

		}

		return this;

	}

}

const _vector1 = /*@__PURE__*/ new Vector3();
const _vector2 = /*@__PURE__*/ new Vector3();
const _normalMatrix = /*@__PURE__*/ new Matrix3();

class Plane {

	constructor( normal = new Vector3( 1, 0, 0 ), constant = 0 ) {

		this.isPlane = true;

		// normal is assumed to be normalized

		this.normal = normal;
		this.constant = constant;

	}

	set( normal, constant ) {

		this.normal.copy( normal );
		this.constant = constant;

		return this;

	}

	setComponents( x, y, z, w ) {

		this.normal.set( x, y, z );
		this.constant = w;

		return this;

	}

	setFromNormalAndCoplanarPoint( normal, point ) {

		this.normal.copy( normal );
		this.constant = - point.dot( this.normal );

		return this;

	}

	setFromCoplanarPoints( a, b, c ) {

		const normal = _vector1.subVectors( c, b ).cross( _vector2.subVectors( a, b ) ).normalize();

		// Q: should an error be thrown if normal is zero (e.g. degenerate plane)?

		this.setFromNormalAndCoplanarPoint( normal, a );

		return this;

	}

	copy( plane ) {

		this.normal.copy( plane.normal );
		this.constant = plane.constant;

		return this;

	}

	normalize() {

		// Note: will lead to a divide by zero if the plane is invalid.

		const inverseNormalLength = 1.0 / this.normal.length();
		this.normal.multiplyScalar( inverseNormalLength );
		this.constant *= inverseNormalLength;

		return this;

	}

	negate() {

		this.constant *= - 1;
		this.normal.negate();

		return this;

	}

	distanceToPoint( point ) {

		return this.normal.dot( point ) + this.constant;

	}

	distanceToSphere( sphere ) {

		return this.distanceToPoint( sphere.center ) - sphere.radius;

	}

	projectPoint( point, target ) {

		return target.copy( point ).addScaledVector( this.normal, - this.distanceToPoint( point ) );

	}

	intersectLine( line, target ) {

		const direction = line.delta( _vector1 );

		const denominator = this.normal.dot( direction );

		if ( denominator === 0 ) {

			// line is coplanar, return origin
			if ( this.distanceToPoint( line.start ) === 0 ) {

				return target.copy( line.start );

			}

			// Unsure if this is the correct method to handle this case.
			return null;

		}

		const t = - ( line.start.dot( this.normal ) + this.constant ) / denominator;

		if ( t < 0 || t > 1 ) {

			return null;

		}

		return target.copy( line.start ).addScaledVector( direction, t );

	}

	intersectsLine( line ) {

		// Note: this tests if a line intersects the plane, not whether it (or its end-points) are coplanar with it.

		const startSign = this.distanceToPoint( line.start );
		const endSign = this.distanceToPoint( line.end );

		return ( startSign < 0 && endSign > 0 ) || ( endSign < 0 && startSign > 0 );

	}

	intersectsBox( box ) {

		return box.intersectsPlane( this );

	}

	intersectsSphere( sphere ) {

		return sphere.intersectsPlane( this );

	}

	coplanarPoint( target ) {

		return target.copy( this.normal ).multiplyScalar( - this.constant );

	}

	applyMatrix4( matrix, optionalNormalMatrix ) {

		const normalMatrix = optionalNormalMatrix || _normalMatrix.getNormalMatrix( matrix );

		const referencePoint = this.coplanarPoint( _vector1 ).applyMatrix4( matrix );

		const normal = this.normal.applyMatrix3( normalMatrix ).normalize();

		this.constant = - referencePoint.dot( normal );

		return this;

	}

	translate( offset ) {

		this.constant -= offset.dot( this.normal );

		return this;

	}

	equals( plane ) {

		return plane.normal.equals( this.normal ) && ( plane.constant === this.constant );

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

const _sphere$3 = /*@__PURE__*/ new Sphere();
const _vector$6 = /*@__PURE__*/ new Vector3();

class Frustum {

	constructor( p0 = new Plane(), p1 = new Plane(), p2 = new Plane(), p3 = new Plane(), p4 = new Plane(), p5 = new Plane() ) {

		this.planes = [ p0, p1, p2, p3, p4, p5 ];

	}

	set( p0, p1, p2, p3, p4, p5 ) {

		const planes = this.planes;

		planes[ 0 ].copy( p0 );
		planes[ 1 ].copy( p1 );
		planes[ 2 ].copy( p2 );
		planes[ 3 ].copy( p3 );
		planes[ 4 ].copy( p4 );
		planes[ 5 ].copy( p5 );

		return this;

	}

	copy( frustum ) {

		const planes = this.planes;

		for ( let i = 0; i < 6; i ++ ) {

			planes[ i ].copy( frustum.planes[ i ] );

		}

		return this;

	}

	setFromProjectionMatrix( m, coordinateSystem = WebGLCoordinateSystem ) {

		const planes = this.planes;
		const me = m.elements;
		const me0 = me[ 0 ], me1 = me[ 1 ], me2 = me[ 2 ], me3 = me[ 3 ];
		const me4 = me[ 4 ], me5 = me[ 5 ], me6 = me[ 6 ], me7 = me[ 7 ];
		const me8 = me[ 8 ], me9 = me[ 9 ], me10 = me[ 10 ], me11 = me[ 11 ];
		const me12 = me[ 12 ], me13 = me[ 13 ], me14 = me[ 14 ], me15 = me[ 15 ];

		planes[ 0 ].setComponents( me3 - me0, me7 - me4, me11 - me8, me15 - me12 ).normalize();
		planes[ 1 ].setComponents( me3 + me0, me7 + me4, me11 + me8, me15 + me12 ).normalize();
		planes[ 2 ].setComponents( me3 + me1, me7 + me5, me11 + me9, me15 + me13 ).normalize();
		planes[ 3 ].setComponents( me3 - me1, me7 - me5, me11 - me9, me15 - me13 ).normalize();
		planes[ 4 ].setComponents( me3 - me2, me7 - me6, me11 - me10, me15 - me14 ).normalize();

		if ( coordinateSystem === WebGLCoordinateSystem ) {

			planes[ 5 ].setComponents( me3 + me2, me7 + me6, me11 + me10, me15 + me14 ).normalize();

		} else if ( coordinateSystem === WebGPUCoordinateSystem ) {

			planes[ 5 ].setComponents( me2, me6, me10, me14 ).normalize();

		} else {

			throw new Error( 'THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: ' + coordinateSystem );

		}

		return this;

	}

	intersectsObject( object ) {

		if ( object.boundingSphere !== undefined ) {

			if ( object.boundingSphere === null ) object.computeBoundingSphere();

			_sphere$3.copy( object.boundingSphere ).applyMatrix4( object.matrixWorld );

		} else {

			const geometry = object.geometry;

			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

			_sphere$3.copy( geometry.boundingSphere ).applyMatrix4( object.matrixWorld );

		}

		return this.intersectsSphere( _sphere$3 );

	}

	intersectsSprite( sprite ) {

		_sphere$3.center.set( 0, 0, 0 );
		_sphere$3.radius = 0.7071067811865476;
		_sphere$3.applyMatrix4( sprite.matrixWorld );

		return this.intersectsSphere( _sphere$3 );

	}

	intersectsSphere( sphere ) {

		const planes = this.planes;
		const center = sphere.center;
		const negRadius = - sphere.radius;

		for ( let i = 0; i < 6; i ++ ) {

			const distance = planes[ i ].distanceToPoint( center );

			if ( distance < negRadius ) {

				return false;

			}

		}

		return true;

	}

	intersectsBox( box ) {

		const planes = this.planes;

		for ( let i = 0; i < 6; i ++ ) {

			const plane = planes[ i ];

			// corner at max distance

			_vector$6.x = plane.normal.x > 0 ? box.max.x : box.min.x;
			_vector$6.y = plane.normal.y > 0 ? box.max.y : box.min.y;
			_vector$6.z = plane.normal.z > 0 ? box.max.z : box.min.z;

			if ( plane.distanceToPoint( _vector$6 ) < 0 ) {

				return false;

			}

		}

		return true;

	}

	containsPoint( point ) {

		const planes = this.planes;

		for ( let i = 0; i < 6; i ++ ) {

			if ( planes[ i ].distanceToPoint( point ) < 0 ) {

				return false;

			}

		}

		return true;

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

function ascIdSort( a, b ) {

	return a - b;

}

function sortOpaque( a, b ) {

	return a.z - b.z;

}

function sortTransparent( a, b ) {

	return b.z - a.z;

}

class MultiDrawRenderList {

	constructor() {

		this.index = 0;
		this.pool = [];
		this.list = [];

	}

	push( start, count, z, index ) {

		const pool = this.pool;
		const list = this.list;
		if ( this.index >= pool.length ) {

			pool.push( {

				start: - 1,
				count: - 1,
				z: - 1,
				index: - 1,

			} );

		}

		const item = pool[ this.index ];
		list.push( item );
		this.index ++;

		item.start = start;
		item.count = count;
		item.z = z;
		item.index = index;

	}

	reset() {

		this.list.length = 0;
		this.index = 0;

	}

}

const _matrix$1 = /*@__PURE__*/ new Matrix4();
const _whiteColor = /*@__PURE__*/ new Color( 1, 1, 1 );
const _frustum = /*@__PURE__*/ new Frustum();
const _box$1 = /*@__PURE__*/ new Box3();
const _sphere$2 = /*@__PURE__*/ new Sphere();
const _vector$5 = /*@__PURE__*/ new Vector3();
const _forward = /*@__PURE__*/ new Vector3();
const _temp = /*@__PURE__*/ new Vector3();
const _renderList = /*@__PURE__*/ new MultiDrawRenderList();
const _mesh = /*@__PURE__*/ new Mesh();
const _batchIntersects = [];

// copies data from attribute "src" into "target" starting at "targetOffset"
function copyAttributeData( src, target, targetOffset = 0 ) {

	const itemSize = target.itemSize;
	if ( src.isInterleavedBufferAttribute || src.array.constructor !== target.array.constructor ) {

		// use the component getters and setters if the array data cannot
		// be copied directly
		const vertexCount = src.count;
		for ( let i = 0; i < vertexCount; i ++ ) {

			for ( let c = 0; c < itemSize; c ++ ) {

				target.setComponent( i + targetOffset, c, src.getComponent( i, c ) );

			}

		}

	} else {

		// faster copy approach using typed array set function
		target.array.set( src.array, targetOffset * itemSize );

	}

	target.needsUpdate = true;

}

// safely copies array contents to a potentially smaller array
function copyArrayContents( src, target ) {

	if ( src.constructor !== target.constructor ) {

		// if arrays are of a different type (eg due to index size increasing) then data must be per-element copied
		const len = Math.min( src.length, target.length );
		for ( let i = 0; i < len; i ++ ) {

			target[ i ] = src[ i ];

		}

	} else {

		// if the arrays use the same data layout we can use a fast block copy
		const len = Math.min( src.length, target.length );
		target.set( new src.constructor( src.buffer, 0, len ) );

	}

}

class BatchedMesh extends Mesh {

	get maxInstanceCount() {

		return this._maxInstanceCount;

	}

	get instanceCount() {

		return this._instanceInfo.length - this._availableInstanceIds.length;

	}

	get unusedVertexCount() {

		return this._maxVertexCount - this._nextVertexStart;

	}

	get unusedIndexCount() {

		return this._maxIndexCount - this._nextIndexStart;

	}

	constructor( maxInstanceCount, maxVertexCount, maxIndexCount = maxVertexCount * 2, material ) {

		super( new BufferGeometry(), material );

		this.isBatchedMesh = true;
		this.perObjectFrustumCulled = true;
		this.sortObjects = true;
		this.boundingBox = null;
		this.boundingSphere = null;
		this.customSort = null;

		// stores visible, active, and geometry id per instance and reserved buffer ranges for geometries
		this._instanceInfo = [];
		this._geometryInfo = [];

		// instance, geometry ids that have been set as inactive, and are available to be overwritten
		this._availableInstanceIds = [];
		this._availableGeometryIds = [];

		// used to track where the next point is that geometry should be inserted
		this._nextIndexStart = 0;
		this._nextVertexStart = 0;
		this._geometryCount = 0;

		// flags
		this._visibilityChanged = true;
		this._geometryInitialized = false;

		// cached user options
		this._maxInstanceCount = maxInstanceCount;
		this._maxVertexCount = maxVertexCount;
		this._maxIndexCount = maxIndexCount;

		// buffers for multi draw
		this._multiDrawCounts = new Int32Array( maxInstanceCount );
		this._multiDrawStarts = new Int32Array( maxInstanceCount );
		this._multiDrawCount = 0;
		this._multiDrawInstances = null;

		// Local matrix per geometry by using data texture
		this._matricesTexture = null;
		this._indirectTexture = null;
		this._colorsTexture = null;

		this._initMatricesTexture();
		this._initIndirectTexture();

	}

	_initMatricesTexture() {

		// layout (1 matrix = 4 pixels)
		//      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
		//  with  8x8  pixel texture max   16 matrices * 4 pixels =  (8 * 8)
		//       16x16 pixel texture max   64 matrices * 4 pixels = (16 * 16)
		//       32x32 pixel texture max  256 matrices * 4 pixels = (32 * 32)
		//       64x64 pixel texture max 1024 matrices * 4 pixels = (64 * 64)

		let size = Math.sqrt( this._maxInstanceCount * 4 ); // 4 pixels needed for 1 matrix
		size = Math.ceil( size / 4 ) * 4;
		size = Math.max( size, 4 );

		const matricesArray = new Float32Array( size * size * 4 ); // 4 floats per RGBA pixel
		const matricesTexture = new DataTexture( matricesArray, size, size, RGBAFormat, FloatType );

		this._matricesTexture = matricesTexture;

	}

	_initIndirectTexture() {

		let size = Math.sqrt( this._maxInstanceCount );
		size = Math.ceil( size );

		const indirectArray = new Uint32Array( size * size );
		const indirectTexture = new DataTexture( indirectArray, size, size, RedIntegerFormat, UnsignedIntType );

		this._indirectTexture = indirectTexture;

	}

	_initColorsTexture() {

		let size = Math.sqrt( this._maxInstanceCount );
		size = Math.ceil( size );

		// 4 floats per RGBA pixel initialized to white
		const colorsArray = new Float32Array( size * size * 4 ).fill( 1 );
		const colorsTexture = new DataTexture( colorsArray, size, size, RGBAFormat, FloatType );
		colorsTexture.colorSpace = ColorManagement.workingColorSpace;

		this._colorsTexture = colorsTexture;

	}

	_initializeGeometry( reference ) {

		const geometry = this.geometry;
		const maxVertexCount = this._maxVertexCount;
		const maxIndexCount = this._maxIndexCount;
		if ( this._geometryInitialized === false ) {

			for ( const attributeName in reference.attributes ) {

				const srcAttribute = reference.getAttribute( attributeName );
				const { array, itemSize, normalized } = srcAttribute;

				const dstArray = new array.constructor( maxVertexCount * itemSize );
				const dstAttribute = new BufferAttribute( dstArray, itemSize, normalized );

				geometry.setAttribute( attributeName, dstAttribute );

			}

			if ( reference.getIndex() !== null ) {

				// Reserve last u16 index for primitive restart.
				const indexArray = maxVertexCount > 65535
					? new Uint32Array( maxIndexCount )
					: new Uint16Array( maxIndexCount );

				geometry.setIndex( new BufferAttribute( indexArray, 1 ) );

			}

			this._geometryInitialized = true;

		}

	}

	// Make sure the geometry is compatible with the existing combined geometry attributes
	_validateGeometry( geometry ) {

		// check to ensure the geometries are using consistent attributes and indices
		const batchGeometry = this.geometry;
		if ( Boolean( geometry.getIndex() ) !== Boolean( batchGeometry.getIndex() ) ) {

			throw new Error( 'THREE.BatchedMesh: All geometries must consistently have "index".' );

		}

		for ( const attributeName in batchGeometry.attributes ) {

			if ( ! geometry.hasAttribute( attributeName ) ) {

				throw new Error( `THREE.BatchedMesh: Added geometry missing "${ attributeName }". All geometries must have consistent attributes.` );

			}

			const srcAttribute = geometry.getAttribute( attributeName );
			const dstAttribute = batchGeometry.getAttribute( attributeName );
			if ( srcAttribute.itemSize !== dstAttribute.itemSize || srcAttribute.normalized !== dstAttribute.normalized ) {

				throw new Error( 'THREE.BatchedMesh: All attributes must have a consistent itemSize and normalized value.' );

			}

		}

	}

	validateInstanceId( instanceId ) {

		const instanceInfo = this._instanceInfo;
		if ( instanceId < 0 || instanceId >= instanceInfo.length || instanceInfo[ instanceId ].active === false ) {

			throw new Error( `THREE.BatchedMesh: Invalid instanceId ${instanceId}. Instance is either out of range or has been deleted.` );

		}

	}

	validateGeometryId( geometryId ) {

		const geometryInfoList = this._geometryInfo;
		if ( geometryId < 0 || geometryId >= geometryInfoList.length || geometryInfoList[ geometryId ].active === false ) {

			throw new Error( `THREE.BatchedMesh: Invalid geometryId ${geometryId}. Geometry is either out of range or has been deleted.` );

		}

	}


	setCustomSort( func ) {

		this.customSort = func;
		return this;

	}

	computeBoundingBox() {

		if ( this.boundingBox === null ) {

			this.boundingBox = new Box3();

		}

		const boundingBox = this.boundingBox;
		const instanceInfo = this._instanceInfo;

		boundingBox.makeEmpty();
		for ( let i = 0, l = instanceInfo.length; i < l; i ++ ) {

			if ( instanceInfo[ i ].active === false ) continue;

			const geometryId = instanceInfo[ i ].geometryIndex;
			this.getMatrixAt( i, _matrix$1 );
			this.getBoundingBoxAt( geometryId, _box$1 ).applyMatrix4( _matrix$1 );
			boundingBox.union( _box$1 );

		}

	}

	computeBoundingSphere() {

		if ( this.boundingSphere === null ) {

			this.boundingSphere = new Sphere();

		}

		const boundingSphere = this.boundingSphere;
		const instanceInfo = this._instanceInfo;

		boundingSphere.makeEmpty();
		for ( let i = 0, l = instanceInfo.length; i < l; i ++ ) {

			if ( instanceInfo[ i ].active === false ) continue;

			const geometryId = instanceInfo[ i ].geometryIndex;
			this.getMatrixAt( i, _matrix$1 );
			this.getBoundingSphereAt( geometryId, _sphere$2 ).applyMatrix4( _matrix$1 );
			boundingSphere.union( _sphere$2 );

		}

	}

	addInstance( geometryId ) {

		const atCapacity = this._instanceInfo.length >= this.maxInstanceCount;

		// ensure we're not over geometry
		if ( atCapacity && this._availableInstanceIds.length === 0 ) {

			throw new Error( 'THREE.BatchedMesh: Maximum item count reached.' );

		}

		const instanceInfo = {
			visible: true,
			active: true,
			geometryIndex: geometryId,
		};

		let drawId = null;

		// Prioritize using previously freed instance ids
		if ( this._availableInstanceIds.length > 0 ) {

			this._availableInstanceIds.sort( ascIdSort );

			drawId = this._availableInstanceIds.shift();
			this._instanceInfo[ drawId ] = instanceInfo;

		} else {

			drawId = this._instanceInfo.length;
			this._instanceInfo.push( instanceInfo );

		}

		const matricesTexture = this._matricesTexture;
		_matrix$1.identity().toArray( matricesTexture.image.data, drawId * 16 );
		matricesTexture.needsUpdate = true;

		const colorsTexture = this._colorsTexture;
		if ( colorsTexture ) {

			_whiteColor.toArray( colorsTexture.image.data, drawId * 4 );
			colorsTexture.needsUpdate = true;

		}

		this._visibilityChanged = true;
		return drawId;

	}

	addGeometry( geometry, reservedVertexCount = - 1, reservedIndexCount = - 1 ) {

		this._initializeGeometry( geometry );

		this._validateGeometry( geometry );

		const geometryInfo = {
			// geometry information
			vertexStart: - 1,
			vertexCount: - 1,
			reservedVertexCount: - 1,

			indexStart: - 1,
			indexCount: - 1,
			reservedIndexCount: - 1,

			// draw range information
			start: - 1,
			count: - 1,

			// state
			boundingBox: null,
			boundingSphere: null,
			active: true,
		};

		const geometryInfoList = this._geometryInfo;
		geometryInfo.vertexStart = this._nextVertexStart;
		geometryInfo.reservedVertexCount = reservedVertexCount === - 1 ? geometry.getAttribute( 'position' ).count : reservedVertexCount;

		const index = geometry.getIndex();
		const hasIndex = index !== null;
		if ( hasIndex ) {

			geometryInfo.indexStart = this._nextIndexStart;
			geometryInfo.reservedIndexCount = reservedIndexCount === - 1 ? index.count : reservedIndexCount;

		}

		if (
			geometryInfo.indexStart !== - 1 &&
			geometryInfo.indexStart + geometryInfo.reservedIndexCount > this._maxIndexCount ||
			geometryInfo.vertexStart + geometryInfo.reservedVertexCount > this._maxVertexCount
		) {

			throw new Error( 'THREE.BatchedMesh: Reserved space request exceeds the maximum buffer size.' );

		}

		// update id
		let geometryId;
		if ( this._availableGeometryIds.length > 0 ) {

			this._availableGeometryIds.sort( ascIdSort );

			geometryId = this._availableGeometryIds.shift();
			geometryInfoList[ geometryId ] = geometryInfo;


		} else {

			geometryId = this._geometryCount;
			this._geometryCount ++;
			geometryInfoList.push( geometryInfo );

		}

		// update the geometry
		this.setGeometryAt( geometryId, geometry );

		// increment the next geometry position
		this._nextIndexStart = geometryInfo.indexStart + geometryInfo.reservedIndexCount;
		this._nextVertexStart = geometryInfo.vertexStart + geometryInfo.reservedVertexCount;

		return geometryId;

	}

	setGeometryAt( geometryId, geometry ) {

		if ( geometryId >= this._geometryCount ) {

			throw new Error( 'THREE.BatchedMesh: Maximum geometry count reached.' );

		}

		this._validateGeometry( geometry );

		const batchGeometry = this.geometry;
		const hasIndex = batchGeometry.getIndex() !== null;
		const dstIndex = batchGeometry.getIndex();
		const srcIndex = geometry.getIndex();
		const geometryInfo = this._geometryInfo[ geometryId ];
		if (
			hasIndex &&
			srcIndex.count > geometryInfo.reservedIndexCount ||
			geometry.attributes.position.count > geometryInfo.reservedVertexCount
		) {

			throw new Error( 'THREE.BatchedMesh: Reserved space not large enough for provided geometry.' );

		}

		// copy geometry buffer data over
		const vertexStart = geometryInfo.vertexStart;
		const reservedVertexCount = geometryInfo.reservedVertexCount;
		geometryInfo.vertexCount = geometry.getAttribute( 'position' ).count;

		for ( const attributeName in batchGeometry.attributes ) {

			// copy attribute data
			const srcAttribute = geometry.getAttribute( attributeName );
			const dstAttribute = batchGeometry.getAttribute( attributeName );
			copyAttributeData( srcAttribute, dstAttribute, vertexStart );

			// fill the rest in with zeroes
			const itemSize = srcAttribute.itemSize;
			for ( let i = srcAttribute.count, l = reservedVertexCount; i < l; i ++ ) {

				const index = vertexStart + i;
				for ( let c = 0; c < itemSize; c ++ ) {

					dstAttribute.setComponent( index, c, 0 );

				}

			}

			dstAttribute.needsUpdate = true;
			dstAttribute.addUpdateRange( vertexStart * itemSize, reservedVertexCount * itemSize );

		}

		// copy index
		if ( hasIndex ) {

			const indexStart = geometryInfo.indexStart;
			const reservedIndexCount = geometryInfo.reservedIndexCount;
			geometryInfo.indexCount = geometry.getIndex().count;

			// copy index data over
			for ( let i = 0; i < srcIndex.count; i ++ ) {

				dstIndex.setX( indexStart + i, vertexStart + srcIndex.getX( i ) );

			}

			// fill the rest in with zeroes
			for ( let i = srcIndex.count, l = reservedIndexCount; i < l; i ++ ) {

				dstIndex.setX( indexStart + i, vertexStart );

			}

			dstIndex.needsUpdate = true;
			dstIndex.addUpdateRange( indexStart, geometryInfo.reservedIndexCount );

		}

		// update the draw range
		geometryInfo.start = hasIndex ? geometryInfo.indexStart : geometryInfo.vertexStart;
		geometryInfo.count = hasIndex ? geometryInfo.indexCount : geometryInfo.vertexCount;

		// store the bounding boxes
		geometryInfo.boundingBox = null;
		if ( geometry.boundingBox !== null ) {

			geometryInfo.boundingBox = geometry.boundingBox.clone();

		}

		geometryInfo.boundingSphere = null;
		if ( geometry.boundingSphere !== null ) {

			geometryInfo.boundingSphere = geometry.boundingSphere.clone();

		}

		this._visibilityChanged = true;
		return geometryId;

	}

	deleteGeometry( geometryId ) {

		const geometryInfoList = this._geometryInfo;
		if ( geometryId >= geometryInfoList.length || geometryInfoList[ geometryId ].active === false ) {

			return this;

		}

		// delete any instances associated with this geometry
		const instanceInfo = this._instanceInfo;
		for ( let i = 0, l = instanceInfo.length; i < l; i ++ ) {

			if ( instanceInfo[ i ].geometryIndex === geometryId ) {

				this.deleteInstance( i );

			}

		}

		geometryInfoList[ geometryId ].active = false;
		this._availableGeometryIds.push( geometryId );
		this._visibilityChanged = true;

		return this;

	}

	deleteInstance( instanceId ) {

		this.validateInstanceId( instanceId );

		this._instanceInfo[ instanceId ].active = false;
		this._availableInstanceIds.push( instanceId );
		this._visibilityChanged = true;

		return this;

	}

	optimize() {

		// track the next indices to copy data to
		let nextVertexStart = 0;
		let nextIndexStart = 0;

		// Iterate over all geometry ranges in order sorted from earliest in the geometry buffer to latest
		// in the geometry buffer. Because draw range objects can be reused there is no guarantee of their order.
		const geometryInfoList = this._geometryInfo;
		const indices = geometryInfoList
			.map( ( e, i ) => i )
			.sort( ( a, b ) => {

				return geometryInfoList[ a ].vertexStart - geometryInfoList[ b ].vertexStart;

			} );

		const geometry = this.geometry;
		for ( let i = 0, l = geometryInfoList.length; i < l; i ++ ) {

			// if a geometry range is inactive then don't copy anything
			const index = indices[ i ];
			const geometryInfo = geometryInfoList[ index ];
			if ( geometryInfo.active === false ) {

				continue;

			}

			// if a geometry contains an index buffer then shift it, as well
			if ( geometry.index !== null ) {

				if ( geometryInfo.indexStart !== nextIndexStart ) {

					const { indexStart, vertexStart, reservedIndexCount } = geometryInfo;
					const index = geometry.index;
					const array = index.array;

					// shift the index pointers based on how the vertex data will shift
					// adjusting the index must happen first so the original vertex start value is available
					const elementDelta = nextVertexStart - vertexStart;
					for ( let j = indexStart; j < indexStart + reservedIndexCount; j ++ ) {

						array[ j ] = array[ j ] + elementDelta;

					}

					index.array.copyWithin( nextIndexStart, indexStart, indexStart + reservedIndexCount );
					index.addUpdateRange( nextIndexStart, reservedIndexCount );

					geometryInfo.indexStart = nextIndexStart;

				}

				nextIndexStart += geometryInfo.reservedIndexCount;

			}

			// if a geometry needs to be moved then copy attribute data to overwrite unused space
			if ( geometryInfo.vertexStart !== nextVertexStart ) {

				const { vertexStart, reservedVertexCount } = geometryInfo;
				const attributes = geometry.attributes;
				for ( const key in attributes ) {

					const attribute = attributes[ key ];
					const { array, itemSize } = attribute;
					array.copyWithin( nextVertexStart * itemSize, vertexStart * itemSize, ( vertexStart + reservedVertexCount ) * itemSize );
					attribute.addUpdateRange( nextVertexStart * itemSize, reservedVertexCount * itemSize );

				}

				geometryInfo.vertexStart = nextVertexStart;

			}

			nextVertexStart += geometryInfo.reservedVertexCount;
			geometryInfo.start = geometry.index ? geometryInfo.indexStart : geometryInfo.vertexStart;

			// step the next geometry points to the shifted position
			this._nextIndexStart = geometry.index ? geometryInfo.indexStart + geometryInfo.reservedIndexCount : 0;
			this._nextVertexStart = geometryInfo.vertexStart + geometryInfo.reservedVertexCount;

		}

		return this;

	}

	// get bounding box and compute it if it doesn't exist
	getBoundingBoxAt( geometryId, target ) {

		if ( geometryId >= this._geometryCount ) {

			return null;

		}

		// compute bounding box
		const geometry = this.geometry;
		const geometryInfo = this._geometryInfo[ geometryId ];
		if ( geometryInfo.boundingBox === null ) {

			const box = new Box3();
			const index = geometry.index;
			const position = geometry.attributes.position;
			for ( let i = geometryInfo.start, l = geometryInfo.start + geometryInfo.count; i < l; i ++ ) {

				let iv = i;
				if ( index ) {

					iv = index.getX( iv );

				}

				box.expandByPoint( _vector$5.fromBufferAttribute( position, iv ) );

			}

			geometryInfo.boundingBox = box;

		}

		target.copy( geometryInfo.boundingBox );
		return target;

	}

	// get bounding sphere and compute it if it doesn't exist
	getBoundingSphereAt( geometryId, target ) {

		if ( geometryId >= this._geometryCount ) {

			return null;

		}

		// compute bounding sphere
		const geometry = this.geometry;
		const geometryInfo = this._geometryInfo[ geometryId ];
		if ( geometryInfo.boundingSphere === null ) {

			const sphere = new Sphere();
			this.getBoundingBoxAt( geometryId, _box$1 );
			_box$1.getCenter( sphere.center );

			const index = geometry.index;
			const position = geometry.attributes.position;

			let maxRadiusSq = 0;
			for ( let i = geometryInfo.start, l = geometryInfo.start + geometryInfo.count; i < l; i ++ ) {

				let iv = i;
				if ( index ) {

					iv = index.getX( iv );

				}

				_vector$5.fromBufferAttribute( position, iv );
				maxRadiusSq = Math.max( maxRadiusSq, sphere.center.distanceToSquared( _vector$5 ) );

			}

			sphere.radius = Math.sqrt( maxRadiusSq );
			geometryInfo.boundingSphere = sphere;

		}

		target.copy( geometryInfo.boundingSphere );
		return target;

	}

	setMatrixAt( instanceId, matrix ) {

		this.validateInstanceId( instanceId );

		const matricesTexture = this._matricesTexture;
		const matricesArray = this._matricesTexture.image.data;
		matrix.toArray( matricesArray, instanceId * 16 );
		matricesTexture.needsUpdate = true;

		return this;

	}

	getMatrixAt( instanceId, matrix ) {

		this.validateInstanceId( instanceId );
		return matrix.fromArray( this._matricesTexture.image.data, instanceId * 16 );

	}

	setColorAt( instanceId, color ) {

		this.validateInstanceId( instanceId );

		if ( this._colorsTexture === null ) {

			this._initColorsTexture();

		}

		color.toArray( this._colorsTexture.image.data, instanceId * 4 );
		this._colorsTexture.needsUpdate = true;

		return this;

	}

	getColorAt( instanceId, color ) {

		this.validateInstanceId( instanceId );
		return color.fromArray( this._colorsTexture.image.data, instanceId * 4 );

	}

	setVisibleAt( instanceId, value ) {

		this.validateInstanceId( instanceId );

		if ( this._instanceInfo[ instanceId ].visible === value ) {

			return this;

		}

		this._instanceInfo[ instanceId ].visible = value;
		this._visibilityChanged = true;

		return this;

	}

	getVisibleAt( instanceId ) {

		this.validateInstanceId( instanceId );

		return this._instanceInfo[ instanceId ].visible;

	}

	setGeometryIdAt( instanceId, geometryId ) {

		this.validateInstanceId( instanceId );
		this.validateGeometryId( geometryId );

		this._instanceInfo[ instanceId ].geometryIndex = geometryId;

		return this;

	}

	getGeometryIdAt( instanceId ) {

		this.validateInstanceId( instanceId );

		return this._instanceInfo[ instanceId ].geometryIndex;

	}

	getGeometryRangeAt( geometryId, target = {} ) {

		this.validateGeometryId( geometryId );

		const geometryInfo = this._geometryInfo[ geometryId ];
		target.vertexStart = geometryInfo.vertexStart;
		target.vertexCount = geometryInfo.vertexCount;
		target.reservedVertexCount = geometryInfo.reservedVertexCount;

		target.indexStart = geometryInfo.indexStart;
		target.indexCount = geometryInfo.indexCount;
		target.reservedIndexCount = geometryInfo.reservedIndexCount;

		target.start = geometryInfo.start;
		target.count = geometryInfo.count;

		return target;

	}

	setInstanceCount( maxInstanceCount ) {

		// shrink the available instances as much as possible
		const availableInstanceIds = this._availableInstanceIds;
		const instanceInfo = this._instanceInfo;
		availableInstanceIds.sort( ascIdSort );
		while ( availableInstanceIds[ availableInstanceIds.length - 1 ] === instanceInfo.length ) {

			instanceInfo.pop();
			availableInstanceIds.pop();

		}

		// throw an error if it can't be shrunk to the desired size
		if ( maxInstanceCount < instanceInfo.length ) {

			throw new Error( `BatchedMesh: Instance ids outside the range ${ maxInstanceCount } are being used. Cannot shrink instance count.` );

		}

		// copy the multi draw counts
		const multiDrawCounts = new Int32Array( maxInstanceCount );
		const multiDrawStarts = new Int32Array( maxInstanceCount );
		copyArrayContents( this._multiDrawCounts, multiDrawCounts );
		copyArrayContents( this._multiDrawStarts, multiDrawStarts );

		this._multiDrawCounts = multiDrawCounts;
		this._multiDrawStarts = multiDrawStarts;
		this._maxInstanceCount = maxInstanceCount;

		// update texture data for instance sampling
		const indirectTexture = this._indirectTexture;
		const matricesTexture = this._matricesTexture;
		const colorsTexture = this._colorsTexture;

		indirectTexture.dispose();
		this._initIndirectTexture();
		copyArrayContents( indirectTexture.image.data, this._indirectTexture.image.data );

		matricesTexture.dispose();
		this._initMatricesTexture();
		copyArrayContents( matricesTexture.image.data, this._matricesTexture.image.data );

		if ( colorsTexture ) {

			colorsTexture.dispose();
			this._initColorsTexture();
			copyArrayContents( colorsTexture.image.data, this._colorsTexture.image.data );

		}

	}

	setGeometrySize( maxVertexCount, maxIndexCount ) {

		// Check if we can shrink to the requested vertex attribute size
		const validRanges = [ ...this._geometryInfo ].filter( info => info.active );
		const requiredVertexLength = Math.max( ...validRanges.map( range => range.vertexStart + range.reservedVertexCount ) );
		if ( requiredVertexLength > maxVertexCount ) {

			throw new Error( `BatchedMesh: Geometry vertex values are being used outside the range ${ maxIndexCount }. Cannot shrink further.` );

		}

		// Check if we can shrink to the requested index attribute size
		if ( this.geometry.index ) {

			const requiredIndexLength = Math.max( ...validRanges.map( range => range.indexStart + range.reservedIndexCount ) );
			if ( requiredIndexLength > maxIndexCount ) {

				throw new Error( `BatchedMesh: Geometry index values are being used outside the range ${ maxIndexCount }. Cannot shrink further.` );

			}

		}

		//

		// dispose of the previous geometry
		const oldGeometry = this.geometry;
		oldGeometry.dispose();

		// recreate the geometry needed based on the previous variant
		this._maxVertexCount = maxVertexCount;
		this._maxIndexCount = maxIndexCount;

		if ( this._geometryInitialized ) {

			this._geometryInitialized = false;
			this.geometry = new BufferGeometry();
			this._initializeGeometry( oldGeometry );

		}

		// copy data from the previous geometry
		const geometry = this.geometry;
		if ( oldGeometry.index ) {

			copyArrayContents( oldGeometry.index.array, geometry.index.array );

		}

		for ( const key in oldGeometry.attributes ) {

			copyArrayContents( oldGeometry.attributes[ key ].array, geometry.attributes[ key ].array );

		}

	}

	raycast( raycaster, intersects ) {

		const instanceInfo = this._instanceInfo;
		const geometryInfoList = this._geometryInfo;
		const matrixWorld = this.matrixWorld;
		const batchGeometry = this.geometry;

		// iterate over each geometry
		_mesh.material = this.material;
		_mesh.geometry.index = batchGeometry.index;
		_mesh.geometry.attributes = batchGeometry.attributes;
		if ( _mesh.geometry.boundingBox === null ) {

			_mesh.geometry.boundingBox = new Box3();

		}

		if ( _mesh.geometry.boundingSphere === null ) {

			_mesh.geometry.boundingSphere = new Sphere();

		}

		for ( let i = 0, l = instanceInfo.length; i < l; i ++ ) {

			if ( ! instanceInfo[ i ].visible || ! instanceInfo[ i ].active ) {

				continue;

			}

			const geometryId = instanceInfo[ i ].geometryIndex;
			const geometryInfo = geometryInfoList[ geometryId ];
			_mesh.geometry.setDrawRange( geometryInfo.start, geometryInfo.count );

			// get the intersects
			this.getMatrixAt( i, _mesh.matrixWorld ).premultiply( matrixWorld );
			this.getBoundingBoxAt( geometryId, _mesh.geometry.boundingBox );
			this.getBoundingSphereAt( geometryId, _mesh.geometry.boundingSphere );
			_mesh.raycast( raycaster, _batchIntersects );

			// add batch id to the intersects
			for ( let j = 0, l = _batchIntersects.length; j < l; j ++ ) {

				const intersect = _batchIntersects[ j ];
				intersect.object = this;
				intersect.batchId = i;
				intersects.push( intersect );

			}

			_batchIntersects.length = 0;

		}

		_mesh.material = null;
		_mesh.geometry.index = null;
		_mesh.geometry.attributes = {};
		_mesh.geometry.setDrawRange( 0, Infinity );

	}

	copy( source ) {

		super.copy( source );

		this.geometry = source.geometry.clone();
		this.perObjectFrustumCulled = source.perObjectFrustumCulled;
		this.sortObjects = source.sortObjects;
		this.boundingBox = source.boundingBox !== null ? source.boundingBox.clone() : null;
		this.boundingSphere = source.boundingSphere !== null ? source.boundingSphere.clone() : null;

		this._geometryInfo = source._geometryInfo.map( info => ( {
			...info,

			boundingBox: info.boundingBox !== null ? info.boundingBox.clone() : null,
			boundingSphere: info.boundingSphere !== null ? info.boundingSphere.clone() : null,
		} ) );
		this._instanceInfo = source._instanceInfo.map( info => ( { ...info } ) );

		this._maxInstanceCount = source._maxInstanceCount;
		this._maxVertexCount = source._maxVertexCount;
		this._maxIndexCount = source._maxIndexCount;

		this._geometryInitialized = source._geometryInitialized;
		this._geometryCount = source._geometryCount;
		this._multiDrawCounts = source._multiDrawCounts.slice();
		this._multiDrawStarts = source._multiDrawStarts.slice();

		this._matricesTexture = source._matricesTexture.clone();
		this._matricesTexture.image.data = this._matricesTexture.image.data.slice();

		if ( this._colorsTexture !== null ) {

			this._colorsTexture = source._colorsTexture.clone();
			this._colorsTexture.image.data = this._colorsTexture.image.data.slice();

		}

		return this;

	}

	dispose() {

		// Assuming the geometry is not shared with other meshes
		this.geometry.dispose();

		this._matricesTexture.dispose();
		this._matricesTexture = null;

		this._indirectTexture.dispose();
		this._indirectTexture = null;

		if ( this._colorsTexture !== null ) {

			this._colorsTexture.dispose();
			this._colorsTexture = null;

		}

		return this;

	}

	onBeforeRender( renderer, scene, camera, geometry, material/*, _group*/ ) {

		// if visibility has not changed and frustum culling and object sorting is not required
		// then skip iterating over all items
		if ( ! this._visibilityChanged && ! this.perObjectFrustumCulled && ! this.sortObjects ) {

			return;

		}

		// the indexed version of the multi draw function requires specifying the start
		// offset in bytes.
		const index = geometry.getIndex();
		const bytesPerElement = index === null ? 1 : index.array.BYTES_PER_ELEMENT;

		const instanceInfo = this._instanceInfo;
		const multiDrawStarts = this._multiDrawStarts;
		const multiDrawCounts = this._multiDrawCounts;
		const geometryInfoList = this._geometryInfo;
		const perObjectFrustumCulled = this.perObjectFrustumCulled;
		const indirectTexture = this._indirectTexture;
		const indirectArray = indirectTexture.image.data;

		// prepare the frustum in the local frame
		if ( perObjectFrustumCulled ) {

			_matrix$1
				.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse )
				.multiply( this.matrixWorld );
			_frustum.setFromProjectionMatrix(
				_matrix$1,
				renderer.coordinateSystem
			);

		}

		let multiDrawCount = 0;
		if ( this.sortObjects ) {

			// get the camera position in the local frame
			_matrix$1.copy( this.matrixWorld ).invert();
			_vector$5.setFromMatrixPosition( camera.matrixWorld ).applyMatrix4( _matrix$1 );
			_forward.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld ).transformDirection( _matrix$1 );

			for ( let i = 0, l = instanceInfo.length; i < l; i ++ ) {

				if ( instanceInfo[ i ].visible && instanceInfo[ i ].active ) {

					const geometryId = instanceInfo[ i ].geometryIndex;

					// get the bounds in world space
					this.getMatrixAt( i, _matrix$1 );
					this.getBoundingSphereAt( geometryId, _sphere$2 ).applyMatrix4( _matrix$1 );

					// determine whether the batched geometry is within the frustum
					let culled = false;
					if ( perObjectFrustumCulled ) {

						culled = ! _frustum.intersectsSphere( _sphere$2 );

					}

					if ( ! culled ) {

						// get the distance from camera used for sorting
						const geometryInfo = geometryInfoList[ geometryId ];
						const z = _temp.subVectors( _sphere$2.center, _vector$5 ).dot( _forward );
						_renderList.push( geometryInfo.start, geometryInfo.count, z, i );

					}

				}

			}

			// Sort the draw ranges and prep for rendering
			const list = _renderList.list;
			const customSort = this.customSort;
			if ( customSort === null ) {

				list.sort( material.transparent ? sortTransparent : sortOpaque );

			} else {

				customSort.call( this, list, camera );

			}

			for ( let i = 0, l = list.length; i < l; i ++ ) {

				const item = list[ i ];
				multiDrawStarts[ multiDrawCount ] = item.start * bytesPerElement;
				multiDrawCounts[ multiDrawCount ] = item.count;
				indirectArray[ multiDrawCount ] = item.index;
				multiDrawCount ++;

			}

			_renderList.reset();

		} else {

			for ( let i = 0, l = instanceInfo.length; i < l; i ++ ) {

				if ( instanceInfo[ i ].visible && instanceInfo[ i ].active ) {

					const geometryId = instanceInfo[ i ].geometryIndex;

					// determine whether the batched geometry is within the frustum
					let culled = false;
					if ( perObjectFrustumCulled ) {

						// get the bounds in world space
						this.getMatrixAt( i, _matrix$1 );
						this.getBoundingSphereAt( geometryId, _sphere$2 ).applyMatrix4( _matrix$1 );
						culled = ! _frustum.intersectsSphere( _sphere$2 );

					}

					if ( ! culled ) {

						const geometryInfo = geometryInfoList[ geometryId ];
						multiDrawStarts[ multiDrawCount ] = geometryInfo.start * bytesPerElement;
						multiDrawCounts[ multiDrawCount ] = geometryInfo.count;
						indirectArray[ multiDrawCount ] = i;
						multiDrawCount ++;

					}

				}

			}

		}

		indirectTexture.needsUpdate = true;
		this._multiDrawCount = multiDrawCount;
		this._visibilityChanged = false;

	}

	onBeforeShadow( renderer, object, camera, shadowCamera, geometry, depthMaterial/* , group */ ) {

		this.onBeforeRender( renderer, null, shadowCamera, geometry, depthMaterial );

	}

}

class LineBasicMaterial extends Material {

	constructor( parameters ) {

		super();

		this.isLineBasicMaterial = true;

		this.type = 'LineBasicMaterial';

		this.color = new Color( 0xffffff );

		this.map = null;

		this.linewidth = 1;
		this.linecap = 'round';
		this.linejoin = 'round';

		this.fog = true;

		this.setValues( parameters );

	}


	copy( source ) {

		super.copy( source );

		this.color.copy( source.color );

		this.map = source.map;

		this.linewidth = source.linewidth;
		this.linecap = source.linecap;
		this.linejoin = source.linejoin;

		this.fog = source.fog;

		return this;

	}

}

const _vStart = /*@__PURE__*/ new Vector3();
const _vEnd = /*@__PURE__*/ new Vector3();

const _inverseMatrix$1 = /*@__PURE__*/ new Matrix4();
const _ray$1 = /*@__PURE__*/ new Ray();
const _sphere$1 = /*@__PURE__*/ new Sphere();

const _intersectPointOnRay = /*@__PURE__*/ new Vector3();
const _intersectPointOnSegment = /*@__PURE__*/ new Vector3();

class Line extends Object3D {

	constructor( geometry = new BufferGeometry(), material = new LineBasicMaterial() ) {

		super();

		this.isLine = true;

		this.type = 'Line';

		this.geometry = geometry;
		this.material = material;

		this.updateMorphTargets();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.material = Array.isArray( source.material ) ? source.material.slice() : source.material;
		this.geometry = source.geometry;

		return this;

	}

	computeLineDistances() {

		const geometry = this.geometry;

		// we assume non-indexed geometry

		if ( geometry.index === null ) {

			const positionAttribute = geometry.attributes.position;
			const lineDistances = [ 0 ];

			for ( let i = 1, l = positionAttribute.count; i < l; i ++ ) {

				_vStart.fromBufferAttribute( positionAttribute, i - 1 );
				_vEnd.fromBufferAttribute( positionAttribute, i );

				lineDistances[ i ] = lineDistances[ i - 1 ];
				lineDistances[ i ] += _vStart.distanceTo( _vEnd );

			}

			geometry.setAttribute( 'lineDistance', new Float32BufferAttribute( lineDistances, 1 ) );

		} else {

			console.warn( 'THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.' );

		}

		return this;

	}

	raycast( raycaster, intersects ) {

		const geometry = this.geometry;
		const matrixWorld = this.matrixWorld;
		const threshold = raycaster.params.Line.threshold;
		const drawRange = geometry.drawRange;

		// Checking boundingSphere distance to ray

		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		_sphere$1.copy( geometry.boundingSphere );
		_sphere$1.applyMatrix4( matrixWorld );
		_sphere$1.radius += threshold;

		if ( raycaster.ray.intersectsSphere( _sphere$1 ) === false ) return;

		//

		_inverseMatrix$1.copy( matrixWorld ).invert();
		_ray$1.copy( raycaster.ray ).applyMatrix4( _inverseMatrix$1 );

		const localThreshold = threshold / ( ( this.scale.x + this.scale.y + this.scale.z ) / 3 );
		const localThresholdSq = localThreshold * localThreshold;

		const step = this.isLineSegments ? 2 : 1;

		const index = geometry.index;
		const attributes = geometry.attributes;
		const positionAttribute = attributes.position;

		if ( index !== null ) {

			const start = Math.max( 0, drawRange.start );
			const end = Math.min( index.count, ( drawRange.start + drawRange.count ) );

			for ( let i = start, l = end - 1; i < l; i += step ) {

				const a = index.getX( i );
				const b = index.getX( i + 1 );

				const intersect = checkIntersection( this, raycaster, _ray$1, localThresholdSq, a, b );

				if ( intersect ) {

					intersects.push( intersect );

				}

			}

			if ( this.isLineLoop ) {

				const a = index.getX( end - 1 );
				const b = index.getX( start );

				const intersect = checkIntersection( this, raycaster, _ray$1, localThresholdSq, a, b );

				if ( intersect ) {

					intersects.push( intersect );

				}

			}

		} else {

			const start = Math.max( 0, drawRange.start );
			const end = Math.min( positionAttribute.count, ( drawRange.start + drawRange.count ) );

			for ( let i = start, l = end - 1; i < l; i += step ) {

				const intersect = checkIntersection( this, raycaster, _ray$1, localThresholdSq, i, i + 1 );

				if ( intersect ) {

					intersects.push( intersect );

				}

			}

			if ( this.isLineLoop ) {

				const intersect = checkIntersection( this, raycaster, _ray$1, localThresholdSq, end - 1, start );

				if ( intersect ) {

					intersects.push( intersect );

				}

			}

		}

	}

	updateMorphTargets() {

		const geometry = this.geometry;

		const morphAttributes = geometry.morphAttributes;
		const keys = Object.keys( morphAttributes );

		if ( keys.length > 0 ) {

			const morphAttribute = morphAttributes[ keys[ 0 ] ];

			if ( morphAttribute !== undefined ) {

				this.morphTargetInfluences = [];
				this.morphTargetDictionary = {};

				for ( let m = 0, ml = morphAttribute.length; m < ml; m ++ ) {

					const name = morphAttribute[ m ].name || String( m );

					this.morphTargetInfluences.push( 0 );
					this.morphTargetDictionary[ name ] = m;

				}

			}

		}

	}

}

function checkIntersection( object, raycaster, ray, thresholdSq, a, b ) {

	const positionAttribute = object.geometry.attributes.position;

	_vStart.fromBufferAttribute( positionAttribute, a );
	_vEnd.fromBufferAttribute( positionAttribute, b );

	const distSq = ray.distanceSqToSegment( _vStart, _vEnd, _intersectPointOnRay, _intersectPointOnSegment );

	if ( distSq > thresholdSq ) return;

	_intersectPointOnRay.applyMatrix4( object.matrixWorld ); // Move back to world space for distance calculation

	const distance = raycaster.ray.origin.distanceTo( _intersectPointOnRay );

	if ( distance < raycaster.near || distance > raycaster.far ) return;

	return {

		distance: distance,
		// What do we want? intersection point on the ray or on the segment??
		// point: raycaster.ray.at( distance ),
		point: _intersectPointOnSegment.clone().applyMatrix4( object.matrixWorld ),
		index: a,
		face: null,
		faceIndex: null,
		barycoord: null,
		object: object

	};

}

const _start = /*@__PURE__*/ new Vector3();
const _end = /*@__PURE__*/ new Vector3();

class LineSegments extends Line {

	constructor( geometry, material ) {

		super( geometry, material );

		this.isLineSegments = true;

		this.type = 'LineSegments';

	}

	computeLineDistances() {

		const geometry = this.geometry;

		// we assume non-indexed geometry

		if ( geometry.index === null ) {

			const positionAttribute = geometry.attributes.position;
			const lineDistances = [];

			for ( let i = 0, l = positionAttribute.count; i < l; i += 2 ) {

				_start.fromBufferAttribute( positionAttribute, i );
				_end.fromBufferAttribute( positionAttribute, i + 1 );

				lineDistances[ i ] = ( i === 0 ) ? 0 : lineDistances[ i - 1 ];
				lineDistances[ i + 1 ] = lineDistances[ i ] + _start.distanceTo( _end );

			}

			geometry.setAttribute( 'lineDistance', new Float32BufferAttribute( lineDistances, 1 ) );

		} else {

			console.warn( 'THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.' );

		}

		return this;

	}

}

class LineLoop extends Line {

	constructor( geometry, material ) {

		super( geometry, material );

		this.isLineLoop = true;

		this.type = 'LineLoop';

	}

}

class PointsMaterial extends Material {

	constructor( parameters ) {

		super();

		this.isPointsMaterial = true;

		this.type = 'PointsMaterial';

		this.color = new Color( 0xffffff );

		this.map = null;

		this.alphaMap = null;

		this.size = 1;
		this.sizeAttenuation = true;

		this.fog = true;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.color.copy( source.color );

		this.map = source.map;

		this.alphaMap = source.alphaMap;

		this.size = source.size;
		this.sizeAttenuation = source.sizeAttenuation;

		this.fog = source.fog;

		return this;

	}

}

const _inverseMatrix = /*@__PURE__*/ new Matrix4();
const _ray = /*@__PURE__*/ new Ray();
const _sphere = /*@__PURE__*/ new Sphere();
const _position$2 = /*@__PURE__*/ new Vector3();

class Points extends Object3D {

	constructor( geometry = new BufferGeometry(), material = new PointsMaterial() ) {

		super();

		this.isPoints = true;

		this.type = 'Points';

		this.geometry = geometry;
		this.material = material;

		this.updateMorphTargets();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.material = Array.isArray( source.material ) ? source.material.slice() : source.material;
		this.geometry = source.geometry;

		return this;

	}

	raycast( raycaster, intersects ) {

		const geometry = this.geometry;
		const matrixWorld = this.matrixWorld;
		const threshold = raycaster.params.Points.threshold;
		const drawRange = geometry.drawRange;

		// Checking boundingSphere distance to ray

		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		_sphere.copy( geometry.boundingSphere );
		_sphere.applyMatrix4( matrixWorld );
		_sphere.radius += threshold;

		if ( raycaster.ray.intersectsSphere( _sphere ) === false ) return;

		//

		_inverseMatrix.copy( matrixWorld ).invert();
		_ray.copy( raycaster.ray ).applyMatrix4( _inverseMatrix );

		const localThreshold = threshold / ( ( this.scale.x + this.scale.y + this.scale.z ) / 3 );
		const localThresholdSq = localThreshold * localThreshold;

		const index = geometry.index;
		const attributes = geometry.attributes;
		const positionAttribute = attributes.position;

		if ( index !== null ) {

			const start = Math.max( 0, drawRange.start );
			const end = Math.min( index.count, ( drawRange.start + drawRange.count ) );

			for ( let i = start, il = end; i < il; i ++ ) {

				const a = index.getX( i );

				_position$2.fromBufferAttribute( positionAttribute, a );

				testPoint( _position$2, a, localThresholdSq, matrixWorld, raycaster, intersects, this );

			}

		} else {

			const start = Math.max( 0, drawRange.start );
			const end = Math.min( positionAttribute.count, ( drawRange.start + drawRange.count ) );

			for ( let i = start, l = end; i < l; i ++ ) {

				_position$2.fromBufferAttribute( positionAttribute, i );

				testPoint( _position$2, i, localThresholdSq, matrixWorld, raycaster, intersects, this );

			}

		}

	}

	updateMorphTargets() {

		const geometry = this.geometry;

		const morphAttributes = geometry.morphAttributes;
		const keys = Object.keys( morphAttributes );

		if ( keys.length > 0 ) {

			const morphAttribute = morphAttributes[ keys[ 0 ] ];

			if ( morphAttribute !== undefined ) {

				this.morphTargetInfluences = [];
				this.morphTargetDictionary = {};

				for ( let m = 0, ml = morphAttribute.length; m < ml; m ++ ) {

					const name = morphAttribute[ m ].name || String( m );

					this.morphTargetInfluences.push( 0 );
					this.morphTargetDictionary[ name ] = m;

				}

			}

		}

	}

}

function testPoint( point, index, localThresholdSq, matrixWorld, raycaster, intersects, object ) {

	const rayPointDistanceSq = _ray.distanceSqToPoint( point );

	if ( rayPointDistanceSq < localThresholdSq ) {

		const intersectPoint = new Vector3();

		_ray.closestPointToPoint( point, intersectPoint );
		intersectPoint.applyMatrix4( matrixWorld );

		const distance = raycaster.ray.origin.distanceTo( intersectPoint );

		if ( distance < raycaster.near || distance > raycaster.far ) return;

		intersects.push( {

			distance: distance,
			distanceToRay: Math.sqrt( rayPointDistanceSq ),
			point: intersectPoint,
			index: index,
			face: null,
			faceIndex: null,
			barycoord: null,
			object: object

		} );

	}

}

class Group extends Object3D {

	constructor() {

		super();

		this.isGroup = true;

		this.type = 'Group';

	}

}

class VideoTexture extends Texture {

	constructor( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		super( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		this.isVideoTexture = true;

		this.minFilter = minFilter !== undefined ? minFilter : LinearFilter;
		this.magFilter = magFilter !== undefined ? magFilter : LinearFilter;

		this.generateMipmaps = false;

		const scope = this;

		function updateVideo() {

			scope.needsUpdate = true;
			video.requestVideoFrameCallback( updateVideo );

		}

		if ( 'requestVideoFrameCallback' in video ) {

			video.requestVideoFrameCallback( updateVideo );

		}

	}

	clone() {

		return new this.constructor( this.image ).copy( this );

	}

	update() {

		const video = this.image;
		const hasVideoFrameCallback = 'requestVideoFrameCallback' in video;

		if ( hasVideoFrameCallback === false && video.readyState >= video.HAVE_CURRENT_DATA ) {

			this.needsUpdate = true;

		}

	}

}

class FramebufferTexture extends Texture {

	constructor( width, height ) {

		super( { width, height } );

		this.isFramebufferTexture = true;

		this.magFilter = NearestFilter;
		this.minFilter = NearestFilter;

		this.generateMipmaps = false;

		this.needsUpdate = true;

	}

}

class CompressedTexture extends Texture {

	constructor( mipmaps, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, colorSpace ) {

		super( null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace );

		this.isCompressedTexture = true;

		this.image = { width: width, height: height };
		this.mipmaps = mipmaps;

		// no flipping for cube textures
		// (also flipping doesn't work for compressed textures )

		this.flipY = false;

		// can't generate mipmaps for compressed textures
		// mips must be embedded in DDS files

		this.generateMipmaps = false;

	}

}

class CompressedArrayTexture extends CompressedTexture {

	constructor( mipmaps, width, height, depth, format, type ) {

		super( mipmaps, width, height, format, type );

		this.isCompressedArrayTexture = true;
		this.image.depth = depth;
		this.wrapR = ClampToEdgeWrapping;

		this.layerUpdates = new Set();

	}

	addLayerUpdate( layerIndex ) {

		this.layerUpdates.add( layerIndex );

	}

	clearLayerUpdates() {

		this.layerUpdates.clear();

	}

}

class CompressedCubeTexture extends CompressedTexture {

	constructor( images, format, type ) {

		super( undefined, images[ 0 ].width, images[ 0 ].height, format, type, CubeReflectionMapping );

		this.isCompressedCubeTexture = true;
		this.isCubeTexture = true;

		this.image = images;

	}

}

class CanvasTexture extends Texture {

	constructor( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		super( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		this.isCanvasTexture = true;

		this.needsUpdate = true;

	}

}

class DepthTexture extends Texture {

	constructor( width, height, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, format = DepthFormat ) {

		if ( format !== DepthFormat && format !== DepthStencilFormat ) {

			throw new Error( 'DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat' );

		}

		if ( type === undefined && format === DepthFormat ) type = UnsignedIntType;
		if ( type === undefined && format === DepthStencilFormat ) type = UnsignedInt248Type;

		super( null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		this.isDepthTexture = true;

		this.image = { width: width, height: height };

		this.magFilter = magFilter !== undefined ? magFilter : NearestFilter;
		this.minFilter = minFilter !== undefined ? minFilter : NearestFilter;

		this.flipY = false;
		this.generateMipmaps = false;

		this.compareFunction = null;

	}


	copy( source ) {

		super.copy( source );

		this.compareFunction = source.compareFunction;

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		if ( this.compareFunction !== null ) data.compareFunction = this.compareFunction;

		return data;

	}

}

/**
 * Extensible curve object.
 *
 * Some common of curve methods:
 * .getPoint( t, optionalTarget ), .getTangent( t, optionalTarget )
 * .getPointAt( u, optionalTarget ), .getTangentAt( u, optionalTarget )
 * .getPoints(), .getSpacedPoints()
 * .getLength()
 * .updateArcLengths()
 *
 * This following curves inherit from THREE.Curve:
 *
 * -- 2D curves --
 * THREE.ArcCurve
 * THREE.CubicBezierCurve
 * THREE.EllipseCurve
 * THREE.LineCurve
 * THREE.QuadraticBezierCurve
 * THREE.SplineCurve
 *
 * -- 3D curves --
 * THREE.CatmullRomCurve3
 * THREE.CubicBezierCurve3
 * THREE.LineCurve3
 * THREE.QuadraticBezierCurve3
 *
 * A series of curves can be represented as a THREE.CurvePath.
 *
 **/

class Curve {

	constructor() {

		this.type = 'Curve';

		this.arcLengthDivisions = 200;

	}

	// Virtual base class method to overwrite and implement in subclasses
	//	- t [0 .. 1]

	getPoint( /* t, optionalTarget */ ) {

		console.warn( 'THREE.Curve: .getPoint() not implemented.' );
		return null;

	}

	// Get point at relative position in curve according to arc length
	// - u [0 .. 1]

	getPointAt( u, optionalTarget ) {

		const t = this.getUtoTmapping( u );
		return this.getPoint( t, optionalTarget );

	}

	// Get sequence of points using getPoint( t )

	getPoints( divisions = 5 ) {

		const points = [];

		for ( let d = 0; d <= divisions; d ++ ) {

			points.push( this.getPoint( d / divisions ) );

		}

		return points;

	}

	// Get sequence of points using getPointAt( u )

	getSpacedPoints( divisions = 5 ) {

		const points = [];

		for ( let d = 0; d <= divisions; d ++ ) {

			points.push( this.getPointAt( d / divisions ) );

		}

		return points;

	}

	// Get total curve arc length

	getLength() {

		const lengths = this.getLengths();
		return lengths[ lengths.length - 1 ];

	}

	// Get list of cumulative segment lengths

	getLengths( divisions = this.arcLengthDivisions ) {

		if ( this.cacheArcLengths &&
			( this.cacheArcLengths.length === divisions + 1 ) &&
			! this.needsUpdate ) {

			return this.cacheArcLengths;

		}

		this.needsUpdate = false;

		const cache = [];
		let current, last = this.getPoint( 0 );
		let sum = 0;

		cache.push( 0 );

		for ( let p = 1; p <= divisions; p ++ ) {

			current = this.getPoint( p / divisions );
			sum += current.distanceTo( last );
			cache.push( sum );
			last = current;

		}

		this.cacheArcLengths = cache;

		return cache; // { sums: cache, sum: sum }; Sum is in the last element.

	}

	updateArcLengths() {

		this.needsUpdate = true;
		this.getLengths();

	}

	// Given u ( 0 .. 1 ), get a t to find p. This gives you points which are equidistant

	getUtoTmapping( u, distance ) {

		const arcLengths = this.getLengths();

		let i = 0;
		const il = arcLengths.length;

		let targetArcLength; // The targeted u distance value to get

		if ( distance ) {

			targetArcLength = distance;

		} else {

			targetArcLength = u * arcLengths[ il - 1 ];

		}

		// binary search for the index with largest value smaller than target u distance

		let low = 0, high = il - 1, comparison;

		while ( low <= high ) {

			i = Math.floor( low + ( high - low ) / 2 ); // less likely to overflow, though probably not issue here, JS doesn't really have integers, all numbers are floats

			comparison = arcLengths[ i ] - targetArcLength;

			if ( comparison < 0 ) {

				low = i + 1;

			} else if ( comparison > 0 ) {

				high = i - 1;

			} else {

				high = i;
				break;

				// DONE

			}

		}

		i = high;

		if ( arcLengths[ i ] === targetArcLength ) {

			return i / ( il - 1 );

		}

		// we could get finer grain at lengths, or use simple interpolation between two points

		const lengthBefore = arcLengths[ i ];
		const lengthAfter = arcLengths[ i + 1 ];

		const segmentLength = lengthAfter - lengthBefore;

		// determine where we are between the 'before' and 'after' points

		const segmentFraction = ( targetArcLength - lengthBefore ) / segmentLength;

		// add that fractional amount to t

		const t = ( i + segmentFraction ) / ( il - 1 );

		return t;

	}

	// Returns a unit vector tangent at t
	// In case any sub curve does not implement its tangent derivation,
	// 2 points a small delta apart will be used to find its gradient
	// which seems to give a reasonable approximation

	getTangent( t, optionalTarget ) {

		const delta = 0.0001;
		let t1 = t - delta;
		let t2 = t + delta;

		// Capping in case of danger

		if ( t1 < 0 ) t1 = 0;
		if ( t2 > 1 ) t2 = 1;

		const pt1 = this.getPoint( t1 );
		const pt2 = this.getPoint( t2 );

		const tangent = optionalTarget || ( ( pt1.isVector2 ) ? new Vector2() : new Vector3() );

		tangent.copy( pt2 ).sub( pt1 ).normalize();

		return tangent;

	}

	getTangentAt( u, optionalTarget ) {

		const t = this.getUtoTmapping( u );
		return this.getTangent( t, optionalTarget );

	}

	computeFrenetFrames( segments, closed ) {

		// see http://www.cs.indiana.edu/pub/techreports/TR425.pdf

		const normal = new Vector3();

		const tangents = [];
		const normals = [];
		const binormals = [];

		const vec = new Vector3();
		const mat = new Matrix4();

		// compute the tangent vectors for each segment on the curve

		for ( let i = 0; i <= segments; i ++ ) {

			const u = i / segments;

			tangents[ i ] = this.getTangentAt( u, new Vector3() );

		}

		// select an initial normal vector perpendicular to the first tangent vector,
		// and in the direction of the minimum tangent xyz component

		normals[ 0 ] = new Vector3();
		binormals[ 0 ] = new Vector3();
		let min = Number.MAX_VALUE;
		const tx = Math.abs( tangents[ 0 ].x );
		const ty = Math.abs( tangents[ 0 ].y );
		const tz = Math.abs( tangents[ 0 ].z );

		if ( tx <= min ) {

			min = tx;
			normal.set( 1, 0, 0 );

		}

		if ( ty <= min ) {

			min = ty;
			normal.set( 0, 1, 0 );

		}

		if ( tz <= min ) {

			normal.set( 0, 0, 1 );

		}

		vec.crossVectors( tangents[ 0 ], normal ).normalize();

		normals[ 0 ].crossVectors( tangents[ 0 ], vec );
		binormals[ 0 ].crossVectors( tangents[ 0 ], normals[ 0 ] );


		// compute the slowly-varying normal and binormal vectors for each segment on the curve

		for ( let i = 1; i <= segments; i ++ ) {

			normals[ i ] = normals[ i - 1 ].clone();

			binormals[ i ] = binormals[ i - 1 ].clone();

			vec.crossVectors( tangents[ i - 1 ], tangents[ i ] );

			if ( vec.length() > Number.EPSILON ) {

				vec.normalize();

				const theta = Math.acos( clamp( tangents[ i - 1 ].dot( tangents[ i ] ), - 1, 1 ) ); // clamp for floating pt errors

				normals[ i ].applyMatrix4( mat.makeRotationAxis( vec, theta ) );

			}

			binormals[ i ].crossVectors( tangents[ i ], normals[ i ] );

		}

		// if the curve is closed, postprocess the vectors so the first and last normal vectors are the same

		if ( closed === true ) {

			let theta = Math.acos( clamp( normals[ 0 ].dot( normals[ segments ] ), - 1, 1 ) );
			theta /= segments;

			if ( tangents[ 0 ].dot( vec.crossVectors( normals[ 0 ], normals[ segments ] ) ) > 0 ) {

				theta = - theta;

			}

			for ( let i = 1; i <= segments; i ++ ) {

				// twist a little...
				normals[ i ].applyMatrix4( mat.makeRotationAxis( tangents[ i ], theta * i ) );
				binormals[ i ].crossVectors( tangents[ i ], normals[ i ] );

			}

		}

		return {
			tangents: tangents,
			normals: normals,
			binormals: binormals
		};

	}

	clone() {

		return new this.constructor().copy( this );

	}

	copy( source ) {

		this.arcLengthDivisions = source.arcLengthDivisions;

		return this;

	}

	toJSON() {

		const data = {
			metadata: {
				version: 4.6,
				type: 'Curve',
				generator: 'Curve.toJSON'
			}
		};

		data.arcLengthDivisions = this.arcLengthDivisions;
		data.type = this.type;

		return data;

	}

	fromJSON( json ) {

		this.arcLengthDivisions = json.arcLengthDivisions;

		return this;

	}

}

class EllipseCurve extends Curve {

	constructor( aX = 0, aY = 0, xRadius = 1, yRadius = 1, aStartAngle = 0, aEndAngle = Math.PI * 2, aClockwise = false, aRotation = 0 ) {

		super();

		this.isEllipseCurve = true;

		this.type = 'EllipseCurve';

		this.aX = aX;
		this.aY = aY;

		this.xRadius = xRadius;
		this.yRadius = yRadius;

		this.aStartAngle = aStartAngle;
		this.aEndAngle = aEndAngle;

		this.aClockwise = aClockwise;

		this.aRotation = aRotation;

	}

	getPoint( t, optionalTarget = new Vector2() ) {

		const point = optionalTarget;

		const twoPi = Math.PI * 2;
		let deltaAngle = this.aEndAngle - this.aStartAngle;
		const samePoints = Math.abs( deltaAngle ) < Number.EPSILON;

		// ensures that deltaAngle is 0 .. 2 PI
		while ( deltaAngle < 0 ) deltaAngle += twoPi;
		while ( deltaAngle > twoPi ) deltaAngle -= twoPi;

		if ( deltaAngle < Number.EPSILON ) {

			if ( samePoints ) {

				deltaAngle = 0;

			} else {

				deltaAngle = twoPi;

			}

		}

		if ( this.aClockwise === true && ! samePoints ) {

			if ( deltaAngle === twoPi ) {

				deltaAngle = - twoPi;

			} else {

				deltaAngle = deltaAngle - twoPi;

			}

		}

		const angle = this.aStartAngle + t * deltaAngle;
		let x = this.aX + this.xRadius * Math.cos( angle );
		let y = this.aY + this.yRadius * Math.sin( angle );

		if ( this.aRotation !== 0 ) {

			const cos = Math.cos( this.aRotation );
			const sin = Math.sin( this.aRotation );

			const tx = x - this.aX;
			const ty = y - this.aY;

			// Rotate the point about the center of the ellipse.
			x = tx * cos - ty * sin + this.aX;
			y = tx * sin + ty * cos + this.aY;

		}

		return point.set( x, y );

	}

	copy( source ) {

		super.copy( source );

		this.aX = source.aX;
		this.aY = source.aY;

		this.xRadius = source.xRadius;
		this.yRadius = source.yRadius;

		this.aStartAngle = source.aStartAngle;
		this.aEndAngle = source.aEndAngle;

		this.aClockwise = source.aClockwise;

		this.aRotation = source.aRotation;

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.aX = this.aX;
		data.aY = this.aY;

		data.xRadius = this.xRadius;
		data.yRadius = this.yRadius;

		data.aStartAngle = this.aStartAngle;
		data.aEndAngle = this.aEndAngle;

		data.aClockwise = this.aClockwise;

		data.aRotation = this.aRotation;

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.aX = json.aX;
		this.aY = json.aY;

		this.xRadius = json.xRadius;
		this.yRadius = json.yRadius;

		this.aStartAngle = json.aStartAngle;
		this.aEndAngle = json.aEndAngle;

		this.aClockwise = json.aClockwise;

		this.aRotation = json.aRotation;

		return this;

	}

}

class ArcCurve extends EllipseCurve {

	constructor( aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise ) {

		super( aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise );

		this.isArcCurve = true;

		this.type = 'ArcCurve';

	}

}

/**
 * Centripetal CatmullRom Curve - which is useful for avoiding
 * cusps and self-intersections in non-uniform catmull rom curves.
 * http://www.cemyuksel.com/research/catmullrom_param/catmullrom.pdf
 *
 * curve.type accepts centripetal(default), chordal and catmullrom
 * curve.tension is used for catmullrom which defaults to 0.5
 */


/*
Based on an optimized c++ solution in
 - http://stackoverflow.com/questions/9489736/catmull-rom-curve-with-no-cusps-and-no-self-intersections/
 - http://ideone.com/NoEbVM

This CubicPoly class could be used for reusing some variables and calculations,
but for three.js curve use, it could be possible inlined and flatten into a single function call
which can be placed in CurveUtils.
*/

function CubicPoly() {

	let c0 = 0, c1 = 0, c2 = 0, c3 = 0;

	/*
	 * Compute coefficients for a cubic polynomial
	 *   p(s) = c0 + c1*s + c2*s^2 + c3*s^3
	 * such that
	 *   p(0) = x0, p(1) = x1
	 *  and
	 *   p'(0) = t0, p'(1) = t1.
	 */
	function init( x0, x1, t0, t1 ) {

		c0 = x0;
		c1 = t0;
		c2 = - 3 * x0 + 3 * x1 - 2 * t0 - t1;
		c3 = 2 * x0 - 2 * x1 + t0 + t1;

	}

	return {

		initCatmullRom: function ( x0, x1, x2, x3, tension ) {

			init( x1, x2, tension * ( x2 - x0 ), tension * ( x3 - x1 ) );

		},

		initNonuniformCatmullRom: function ( x0, x1, x2, x3, dt0, dt1, dt2 ) {

			// compute tangents when parameterized in [t1,t2]
			let t1 = ( x1 - x0 ) / dt0 - ( x2 - x0 ) / ( dt0 + dt1 ) + ( x2 - x1 ) / dt1;
			let t2 = ( x2 - x1 ) / dt1 - ( x3 - x1 ) / ( dt1 + dt2 ) + ( x3 - x2 ) / dt2;

			// rescale tangents for parametrization in [0,1]
			t1 *= dt1;
			t2 *= dt1;

			init( x1, x2, t1, t2 );

		},

		calc: function ( t ) {

			const t2 = t * t;
			const t3 = t2 * t;
			return c0 + c1 * t + c2 * t2 + c3 * t3;

		}

	};

}

//

const tmp = /*@__PURE__*/ new Vector3();
const px = /*@__PURE__*/ new CubicPoly();
const py = /*@__PURE__*/ new CubicPoly();
const pz = /*@__PURE__*/ new CubicPoly();

class CatmullRomCurve3 extends Curve {

	constructor( points = [], closed = false, curveType = 'centripetal', tension = 0.5 ) {

		super();

		this.isCatmullRomCurve3 = true;

		this.type = 'CatmullRomCurve3';

		this.points = points;
		this.closed = closed;
		this.curveType = curveType;
		this.tension = tension;

	}

	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		const points = this.points;
		const l = points.length;

		const p = ( l - ( this.closed ? 0 : 1 ) ) * t;
		let intPoint = Math.floor( p );
		let weight = p - intPoint;

		if ( this.closed ) {

			intPoint += intPoint > 0 ? 0 : ( Math.floor( Math.abs( intPoint ) / l ) + 1 ) * l;

		} else if ( weight === 0 && intPoint === l - 1 ) {

			intPoint = l - 2;
			weight = 1;

		}

		let p0, p3; // 4 points (p1 & p2 defined below)

		if ( this.closed || intPoint > 0 ) {

			p0 = points[ ( intPoint - 1 ) % l ];

		} else {

			// extrapolate first point
			tmp.subVectors( points[ 0 ], points[ 1 ] ).add( points[ 0 ] );
			p0 = tmp;

		}

		const p1 = points[ intPoint % l ];
		const p2 = points[ ( intPoint + 1 ) % l ];

		if ( this.closed || intPoint + 2 < l ) {

			p3 = points[ ( intPoint + 2 ) % l ];

		} else {

			// extrapolate last point
			tmp.subVectors( points[ l - 1 ], points[ l - 2 ] ).add( points[ l - 1 ] );
			p3 = tmp;

		}

		if ( this.curveType === 'centripetal' || this.curveType === 'chordal' ) {

			// init Centripetal / Chordal Catmull-Rom
			const pow = this.curveType === 'chordal' ? 0.5 : 0.25;
			let dt0 = Math.pow( p0.distanceToSquared( p1 ), pow );
			let dt1 = Math.pow( p1.distanceToSquared( p2 ), pow );
			let dt2 = Math.pow( p2.distanceToSquared( p3 ), pow );

			// safety check for repeated points
			if ( dt1 < 1e-4 ) dt1 = 1.0;
			if ( dt0 < 1e-4 ) dt0 = dt1;
			if ( dt2 < 1e-4 ) dt2 = dt1;

			px.initNonuniformCatmullRom( p0.x, p1.x, p2.x, p3.x, dt0, dt1, dt2 );
			py.initNonuniformCatmullRom( p0.y, p1.y, p2.y, p3.y, dt0, dt1, dt2 );
			pz.initNonuniformCatmullRom( p0.z, p1.z, p2.z, p3.z, dt0, dt1, dt2 );

		} else if ( this.curveType === 'catmullrom' ) {

			px.initCatmullRom( p0.x, p1.x, p2.x, p3.x, this.tension );
			py.initCatmullRom( p0.y, p1.y, p2.y, p3.y, this.tension );
			pz.initCatmullRom( p0.z, p1.z, p2.z, p3.z, this.tension );

		}

		point.set(
			px.calc( weight ),
			py.calc( weight ),
			pz.calc( weight )
		);

		return point;

	}

	copy( source ) {

		super.copy( source );

		this.points = [];

		for ( let i = 0, l = source.points.length; i < l; i ++ ) {

			const point = source.points[ i ];

			this.points.push( point.clone() );

		}

		this.closed = source.closed;
		this.curveType = source.curveType;
		this.tension = source.tension;

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.points = [];

		for ( let i = 0, l = this.points.length; i < l; i ++ ) {

			const point = this.points[ i ];
			data.points.push( point.toArray() );

		}

		data.closed = this.closed;
		data.curveType = this.curveType;
		data.tension = this.tension;

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.points = [];

		for ( let i = 0, l = json.points.length; i < l; i ++ ) {

			const point = json.points[ i ];
			this.points.push( new Vector3().fromArray( point ) );

		}

		this.closed = json.closed;
		this.curveType = json.curveType;
		this.tension = json.tension;

		return this;

	}

}

/**
 * Bezier Curves formulas obtained from
 * https://en.wikipedia.org/wiki/B%C3%A9zier_curve
 */

function CatmullRom( t, p0, p1, p2, p3 ) {

	const v0 = ( p2 - p0 ) * 0.5;
	const v1 = ( p3 - p1 ) * 0.5;
	const t2 = t * t;
	const t3 = t * t2;
	return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

}

//

function QuadraticBezierP0( t, p ) {

	const k = 1 - t;
	return k * k * p;

}

function QuadraticBezierP1( t, p ) {

	return 2 * ( 1 - t ) * t * p;

}

function QuadraticBezierP2( t, p ) {

	return t * t * p;

}

function QuadraticBezier( t, p0, p1, p2 ) {

	return QuadraticBezierP0( t, p0 ) + QuadraticBezierP1( t, p1 ) +
		QuadraticBezierP2( t, p2 );

}

//

function CubicBezierP0( t, p ) {

	const k = 1 - t;
	return k * k * k * p;

}

function CubicBezierP1( t, p ) {

	const k = 1 - t;
	return 3 * k * k * t * p;

}

function CubicBezierP2( t, p ) {

	return 3 * ( 1 - t ) * t * t * p;

}

function CubicBezierP3( t, p ) {

	return t * t * t * p;

}

function CubicBezier( t, p0, p1, p2, p3 ) {

	return CubicBezierP0( t, p0 ) + CubicBezierP1( t, p1 ) + CubicBezierP2( t, p2 ) +
		CubicBezierP3( t, p3 );

}

class CubicBezierCurve extends Curve {

	constructor( v0 = new Vector2(), v1 = new Vector2(), v2 = new Vector2(), v3 = new Vector2() ) {

		super();

		this.isCubicBezierCurve = true;

		this.type = 'CubicBezierCurve';

		this.v0 = v0;
		this.v1 = v1;
		this.v2 = v2;
		this.v3 = v3;

	}

	getPoint( t, optionalTarget = new Vector2() ) {

		const point = optionalTarget;

		const v0 = this.v0, v1 = this.v1, v2 = this.v2, v3 = this.v3;

		point.set(
			CubicBezier( t, v0.x, v1.x, v2.x, v3.x ),
			CubicBezier( t, v0.y, v1.y, v2.y, v3.y )
		);

		return point;

	}

	copy( source ) {

		super.copy( source );

		this.v0.copy( source.v0 );
		this.v1.copy( source.v1 );
		this.v2.copy( source.v2 );
		this.v3.copy( source.v3 );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.v0 = this.v0.toArray();
		data.v1 = this.v1.toArray();
		data.v2 = this.v2.toArray();
		data.v3 = this.v3.toArray();

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.v0.fromArray( json.v0 );
		this.v1.fromArray( json.v1 );
		this.v2.fromArray( json.v2 );
		this.v3.fromArray( json.v3 );

		return this;

	}

}

class CubicBezierCurve3 extends Curve {

	constructor( v0 = new Vector3(), v1 = new Vector3(), v2 = new Vector3(), v3 = new Vector3() ) {

		super();

		this.isCubicBezierCurve3 = true;

		this.type = 'CubicBezierCurve3';

		this.v0 = v0;
		this.v1 = v1;
		this.v2 = v2;
		this.v3 = v3;

	}

	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		const v0 = this.v0, v1 = this.v1, v2 = this.v2, v3 = this.v3;

		point.set(
			CubicBezier( t, v0.x, v1.x, v2.x, v3.x ),
			CubicBezier( t, v0.y, v1.y, v2.y, v3.y ),
			CubicBezier( t, v0.z, v1.z, v2.z, v3.z )
		);

		return point;

	}

	copy( source ) {

		super.copy( source );

		this.v0.copy( source.v0 );
		this.v1.copy( source.v1 );
		this.v2.copy( source.v2 );
		this.v3.copy( source.v3 );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.v0 = this.v0.toArray();
		data.v1 = this.v1.toArray();
		data.v2 = this.v2.toArray();
		data.v3 = this.v3.toArray();

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.v0.fromArray( json.v0 );
		this.v1.fromArray( json.v1 );
		this.v2.fromArray( json.v2 );
		this.v3.fromArray( json.v3 );

		return this;

	}

}

class LineCurve extends Curve {

	constructor( v1 = new Vector2(), v2 = new Vector2() ) {

		super();

		this.isLineCurve = true;

		this.type = 'LineCurve';

		this.v1 = v1;
		this.v2 = v2;

	}

	getPoint( t, optionalTarget = new Vector2() ) {

		const point = optionalTarget;

		if ( t === 1 ) {

			point.copy( this.v2 );

		} else {

			point.copy( this.v2 ).sub( this.v1 );
			point.multiplyScalar( t ).add( this.v1 );

		}

		return point;

	}

	// Line curve is linear, so we can overwrite default getPointAt
	getPointAt( u, optionalTarget ) {

		return this.getPoint( u, optionalTarget );

	}

	getTangent( t, optionalTarget = new Vector2() ) {

		return optionalTarget.subVectors( this.v2, this.v1 ).normalize();

	}

	getTangentAt( u, optionalTarget ) {

		return this.getTangent( u, optionalTarget );

	}

	copy( source ) {

		super.copy( source );

		this.v1.copy( source.v1 );
		this.v2.copy( source.v2 );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.v1 = this.v1.toArray();
		data.v2 = this.v2.toArray();

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.v1.fromArray( json.v1 );
		this.v2.fromArray( json.v2 );

		return this;

	}

}

class LineCurve3 extends Curve {

	constructor( v1 = new Vector3(), v2 = new Vector3() ) {

		super();

		this.isLineCurve3 = true;

		this.type = 'LineCurve3';

		this.v1 = v1;
		this.v2 = v2;

	}

	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		if ( t === 1 ) {

			point.copy( this.v2 );

		} else {

			point.copy( this.v2 ).sub( this.v1 );
			point.multiplyScalar( t ).add( this.v1 );

		}

		return point;

	}

	// Line curve is linear, so we can overwrite default getPointAt
	getPointAt( u, optionalTarget ) {

		return this.getPoint( u, optionalTarget );

	}

	getTangent( t, optionalTarget = new Vector3() ) {

		return optionalTarget.subVectors( this.v2, this.v1 ).normalize();

	}

	getTangentAt( u, optionalTarget ) {

		return this.getTangent( u, optionalTarget );

	}

	copy( source ) {

		super.copy( source );

		this.v1.copy( source.v1 );
		this.v2.copy( source.v2 );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.v1 = this.v1.toArray();
		data.v2 = this.v2.toArray();

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.v1.fromArray( json.v1 );
		this.v2.fromArray( json.v2 );

		return this;

	}

}

class QuadraticBezierCurve extends Curve {

	constructor( v0 = new Vector2(), v1 = new Vector2(), v2 = new Vector2() ) {

		super();

		this.isQuadraticBezierCurve = true;

		this.type = 'QuadraticBezierCurve';

		this.v0 = v0;
		this.v1 = v1;
		this.v2 = v2;

	}

	getPoint( t, optionalTarget = new Vector2() ) {

		const point = optionalTarget;

		const v0 = this.v0, v1 = this.v1, v2 = this.v2;

		point.set(
			QuadraticBezier( t, v0.x, v1.x, v2.x ),
			QuadraticBezier( t, v0.y, v1.y, v2.y )
		);

		return point;

	}

	copy( source ) {

		super.copy( source );

		this.v0.copy( source.v0 );
		this.v1.copy( source.v1 );
		this.v2.copy( source.v2 );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.v0 = this.v0.toArray();
		data.v1 = this.v1.toArray();
		data.v2 = this.v2.toArray();

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.v0.fromArray( json.v0 );
		this.v1.fromArray( json.v1 );
		this.v2.fromArray( json.v2 );

		return this;

	}

}

class QuadraticBezierCurve3 extends Curve {

	constructor( v0 = new Vector3(), v1 = new Vector3(), v2 = new Vector3() ) {

		super();

		this.isQuadraticBezierCurve3 = true;

		this.type = 'QuadraticBezierCurve3';

		this.v0 = v0;
		this.v1 = v1;
		this.v2 = v2;

	}

	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		const v0 = this.v0, v1 = this.v1, v2 = this.v2;

		point.set(
			QuadraticBezier( t, v0.x, v1.x, v2.x ),
			QuadraticBezier( t, v0.y, v1.y, v2.y ),
			QuadraticBezier( t, v0.z, v1.z, v2.z )
		);

		return point;

	}

	copy( source ) {

		super.copy( source );

		this.v0.copy( source.v0 );
		this.v1.copy( source.v1 );
		this.v2.copy( source.v2 );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.v0 = this.v0.toArray();
		data.v1 = this.v1.toArray();
		data.v2 = this.v2.toArray();

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.v0.fromArray( json.v0 );
		this.v1.fromArray( json.v1 );
		this.v2.fromArray( json.v2 );

		return this;

	}

}

class SplineCurve extends Curve {

	constructor( points = [] ) {

		super();

		this.isSplineCurve = true;

		this.type = 'SplineCurve';

		this.points = points;

	}

	getPoint( t, optionalTarget = new Vector2() ) {

		const point = optionalTarget;

		const points = this.points;
		const p = ( points.length - 1 ) * t;

		const intPoint = Math.floor( p );
		const weight = p - intPoint;

		const p0 = points[ intPoint === 0 ? intPoint : intPoint - 1 ];
		const p1 = points[ intPoint ];
		const p2 = points[ intPoint > points.length - 2 ? points.length - 1 : intPoint + 1 ];
		const p3 = points[ intPoint > points.length - 3 ? points.length - 1 : intPoint + 2 ];

		point.set(
			CatmullRom( weight, p0.x, p1.x, p2.x, p3.x ),
			CatmullRom( weight, p0.y, p1.y, p2.y, p3.y )
		);

		return point;

	}

	copy( source ) {

		super.copy( source );

		this.points = [];

		for ( let i = 0, l = source.points.length; i < l; i ++ ) {

			const point = source.points[ i ];

			this.points.push( point.clone() );

		}

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.points = [];

		for ( let i = 0, l = this.points.length; i < l; i ++ ) {

			const point = this.points[ i ];
			data.points.push( point.toArray() );

		}

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.points = [];

		for ( let i = 0, l = json.points.length; i < l; i ++ ) {

			const point = json.points[ i ];
			this.points.push( new Vector2().fromArray( point ) );

		}

		return this;

	}

}

var Curves = /*#__PURE__*/Object.freeze({
	__proto__: null,
	ArcCurve: ArcCurve,
	CatmullRomCurve3: CatmullRomCurve3,
	CubicBezierCurve: CubicBezierCurve,
	CubicBezierCurve3: CubicBezierCurve3,
	EllipseCurve: EllipseCurve,
	LineCurve: LineCurve,
	LineCurve3: LineCurve3,
	QuadraticBezierCurve: QuadraticBezierCurve,
	QuadraticBezierCurve3: QuadraticBezierCurve3,
	SplineCurve: SplineCurve
});

/**************************************************************
 *	Curved Path - a curve path is simply a array of connected
 *  curves, but retains the api of a curve
 **************************************************************/

class CurvePath extends Curve {

	constructor() {

		super();

		this.type = 'CurvePath';

		this.curves = [];
		this.autoClose = false; // Automatically closes the path

	}

	add( curve ) {

		this.curves.push( curve );

	}

	closePath() {

		// Add a line curve if start and end of lines are not connected
		const startPoint = this.curves[ 0 ].getPoint( 0 );
		const endPoint = this.curves[ this.curves.length - 1 ].getPoint( 1 );

		if ( ! startPoint.equals( endPoint ) ) {

			const lineType = ( startPoint.isVector2 === true ) ? 'LineCurve' : 'LineCurve3';
			this.curves.push( new Curves[ lineType ]( endPoint, startPoint ) );

		}

		return this;

	}

	// To get accurate point with reference to
	// entire path distance at time t,
	// following has to be done:

	// 1. Length of each sub path have to be known
	// 2. Locate and identify type of curve
	// 3. Get t for the curve
	// 4. Return curve.getPointAt(t')

	getPoint( t, optionalTarget ) {

		const d = t * this.getLength();
		const curveLengths = this.getCurveLengths();
		let i = 0;

		// To think about boundaries points.

		while ( i < curveLengths.length ) {

			if ( curveLengths[ i ] >= d ) {

				const diff = curveLengths[ i ] - d;
				const curve = this.curves[ i ];

				const segmentLength = curve.getLength();
				const u = segmentLength === 0 ? 0 : 1 - diff / segmentLength;

				return curve.getPointAt( u, optionalTarget );

			}

			i ++;

		}

		return null;

		// loop where sum != 0, sum > d , sum+1 <d

	}

	// We cannot use the default THREE.Curve getPoint() with getLength() because in
	// THREE.Curve, getLength() depends on getPoint() but in THREE.CurvePath
	// getPoint() depends on getLength

	getLength() {

		const lens = this.getCurveLengths();
		return lens[ lens.length - 1 ];

	}

	// cacheLengths must be recalculated.
	updateArcLengths() {

		this.needsUpdate = true;
		this.cacheLengths = null;
		this.getCurveLengths();

	}

	// Compute lengths and cache them
	// We cannot overwrite getLengths() because UtoT mapping uses it.

	getCurveLengths() {

		// We use cache values if curves and cache array are same length

		if ( this.cacheLengths && this.cacheLengths.length === this.curves.length ) {

			return this.cacheLengths;

		}

		// Get length of sub-curve
		// Push sums into cached array

		const lengths = [];
		let sums = 0;

		for ( let i = 0, l = this.curves.length; i < l; i ++ ) {

			sums += this.curves[ i ].getLength();
			lengths.push( sums );

		}

		this.cacheLengths = lengths;

		return lengths;

	}

	getSpacedPoints( divisions = 40 ) {

		const points = [];

		for ( let i = 0; i <= divisions; i ++ ) {

			points.push( this.getPoint( i / divisions ) );

		}

		if ( this.autoClose ) {

			points.push( points[ 0 ] );

		}

		return points;

	}

	getPoints( divisions = 12 ) {

		const points = [];
		let last;

		for ( let i = 0, curves = this.curves; i < curves.length; i ++ ) {

			const curve = curves[ i ];
			const resolution = curve.isEllipseCurve ? divisions * 2
				: ( curve.isLineCurve || curve.isLineCurve3 ) ? 1
					: curve.isSplineCurve ? divisions * curve.points.length
						: divisions;

			const pts = curve.getPoints( resolution );

			for ( let j = 0; j < pts.length; j ++ ) {

				const point = pts[ j ];

				if ( last && last.equals( point ) ) continue; // ensures no consecutive points are duplicates

				points.push( point );
				last = point;

			}

		}

		if ( this.autoClose && points.length > 1 && ! points[ points.length - 1 ].equals( points[ 0 ] ) ) {

			points.push( points[ 0 ] );

		}

		return points;

	}

	copy( source ) {

		super.copy( source );

		this.curves = [];

		for ( let i = 0, l = source.curves.length; i < l; i ++ ) {

			const curve = source.curves[ i ];

			this.curves.push( curve.clone() );

		}

		this.autoClose = source.autoClose;

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.autoClose = this.autoClose;
		data.curves = [];

		for ( let i = 0, l = this.curves.length; i < l; i ++ ) {

			const curve = this.curves[ i ];
			data.curves.push( curve.toJSON() );

		}

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.autoClose = json.autoClose;
		this.curves = [];

		for ( let i = 0, l = json.curves.length; i < l; i ++ ) {

			const curve = json.curves[ i ];
			this.curves.push( new Curves[ curve.type ]().fromJSON( curve ) );

		}

		return this;

	}

}

class Path extends CurvePath {

	constructor( points ) {

		super();

		this.type = 'Path';

		this.currentPoint = new Vector2();

		if ( points ) {

			this.setFromPoints( points );

		}

	}

	setFromPoints( points ) {

		this.moveTo( points[ 0 ].x, points[ 0 ].y );

		for ( let i = 1, l = points.length; i < l; i ++ ) {

			this.lineTo( points[ i ].x, points[ i ].y );

		}

		return this;

	}

	moveTo( x, y ) {

		this.currentPoint.set( x, y ); // TODO consider referencing vectors instead of copying?

		return this;

	}

	lineTo( x, y ) {

		const curve = new LineCurve( this.currentPoint.clone(), new Vector2( x, y ) );
		this.curves.push( curve );

		this.currentPoint.set( x, y );

		return this;

	}

	quadraticCurveTo( aCPx, aCPy, aX, aY ) {

		const curve = new QuadraticBezierCurve(
			this.currentPoint.clone(),
			new Vector2( aCPx, aCPy ),
			new Vector2( aX, aY )
		);

		this.curves.push( curve );

		this.currentPoint.set( aX, aY );

		return this;

	}

	bezierCurveTo( aCP1x, aCP1y, aCP2x, aCP2y, aX, aY ) {

		const curve = new CubicBezierCurve(
			this.currentPoint.clone(),
			new Vector2( aCP1x, aCP1y ),
			new Vector2( aCP2x, aCP2y ),
			new Vector2( aX, aY )
		);

		this.curves.push( curve );

		this.currentPoint.set( aX, aY );

		return this;

	}

	splineThru( pts /*Array of Vector*/ ) {

		const npts = [ this.currentPoint.clone() ].concat( pts );

		const curve = new SplineCurve( npts );
		this.curves.push( curve );

		this.currentPoint.copy( pts[ pts.length - 1 ] );

		return this;

	}

	arc( aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise ) {

		const x0 = this.currentPoint.x;
		const y0 = this.currentPoint.y;

		this.absarc( aX + x0, aY + y0, aRadius,
			aStartAngle, aEndAngle, aClockwise );

		return this;

	}

	absarc( aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise ) {

		this.absellipse( aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise );

		return this;

	}

	ellipse( aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation ) {

		const x0 = this.currentPoint.x;
		const y0 = this.currentPoint.y;

		this.absellipse( aX + x0, aY + y0, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation );

		return this;

	}

	absellipse( aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation ) {

		const curve = new EllipseCurve( aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation );

		if ( this.curves.length > 0 ) {

			// if a previous curve is present, attempt to join
			const firstPoint = curve.getPoint( 0 );

			if ( ! firstPoint.equals( this.currentPoint ) ) {

				this.lineTo( firstPoint.x, firstPoint.y );

			}

		}

		this.curves.push( curve );

		const lastPoint = curve.getPoint( 1 );
		this.currentPoint.copy( lastPoint );

		return this;

	}

	copy( source ) {

		super.copy( source );

		this.currentPoint.copy( source.currentPoint );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.currentPoint = this.currentPoint.toArray();

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.currentPoint.fromArray( json.currentPoint );

		return this;

	}

}

class LatheGeometry extends BufferGeometry {

	constructor( points = [ new Vector2( 0, - 0.5 ), new Vector2( 0.5, 0 ), new Vector2( 0, 0.5 ) ], segments = 12, phiStart = 0, phiLength = Math.PI * 2 ) {

		super();

		this.type = 'LatheGeometry';

		this.parameters = {
			points: points,
			segments: segments,
			phiStart: phiStart,
			phiLength: phiLength
		};

		segments = Math.floor( segments );

		// clamp phiLength so it's in range of [ 0, 2PI ]

		phiLength = clamp( phiLength, 0, Math.PI * 2 );

		// buffers

		const indices = [];
		const vertices = [];
		const uvs = [];
		const initNormals = [];
		const normals = [];

		// helper variables

		const inverseSegments = 1.0 / segments;
		const vertex = new Vector3();
		const uv = new Vector2();
		const normal = new Vector3();
		const curNormal = new Vector3();
		const prevNormal = new Vector3();
		let dx = 0;
		let dy = 0;

		// pre-compute normals for initial "meridian"

		for ( let j = 0; j <= ( points.length - 1 ); j ++ ) {

			switch ( j ) {

				case 0:				// special handling for 1st vertex on path

					dx = points[ j + 1 ].x - points[ j ].x;
					dy = points[ j + 1 ].y - points[ j ].y;

					normal.x = dy * 1.0;
					normal.y = - dx;
					normal.z = dy * 0.0;

					prevNormal.copy( normal );

					normal.normalize();

					initNormals.push( normal.x, normal.y, normal.z );

					break;

				case ( points.length - 1 ):	// special handling for last Vertex on path

					initNormals.push( prevNormal.x, prevNormal.y, prevNormal.z );

					break;

				default:			// default handling for all vertices in between

					dx = points[ j + 1 ].x - points[ j ].x;
					dy = points[ j + 1 ].y - points[ j ].y;

					normal.x = dy * 1.0;
					normal.y = - dx;
					normal.z = dy * 0.0;

					curNormal.copy( normal );

					normal.x += prevNormal.x;
					normal.y += prevNormal.y;
					normal.z += prevNormal.z;

					normal.normalize();

					initNormals.push( normal.x, normal.y, normal.z );

					prevNormal.copy( curNormal );

			}

		}

		// generate vertices, uvs and normals

		for ( let i = 0; i <= segments; i ++ ) {

			const phi = phiStart + i * inverseSegments * phiLength;

			const sin = Math.sin( phi );
			const cos = Math.cos( phi );

			for ( let j = 0; j <= ( points.length - 1 ); j ++ ) {

				// vertex

				vertex.x = points[ j ].x * sin;
				vertex.y = points[ j ].y;
				vertex.z = points[ j ].x * cos;

				vertices.push( vertex.x, vertex.y, vertex.z );

				// uv

				uv.x = i / segments;
				uv.y = j / ( points.length - 1 );

				uvs.push( uv.x, uv.y );

				// normal

				const x = initNormals[ 3 * j + 0 ] * sin;
				const y = initNormals[ 3 * j + 1 ];
				const z = initNormals[ 3 * j + 0 ] * cos;

				normals.push( x, y, z );

			}

		}

		// indices

		for ( let i = 0; i < segments; i ++ ) {

			for ( let j = 0; j < ( points.length - 1 ); j ++ ) {

				const base = j + i * points.length;

				const a = base;
				const b = base + points.length;
				const c = base + points.length + 1;
				const d = base + 1;

				// faces

				indices.push( a, b, d );
				indices.push( c, d, b );

			}

		}

		// build geometry

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	static fromJSON( data ) {

		return new LatheGeometry( data.points, data.segments, data.phiStart, data.phiLength );

	}

}

class CapsuleGeometry extends LatheGeometry {

	constructor( radius = 1, length = 1, capSegments = 4, radialSegments = 8 ) {

		const path = new Path();
		path.absarc( 0, - length / 2, radius, Math.PI * 1.5, 0 );
		path.absarc( 0, length / 2, radius, 0, Math.PI * 0.5 );

		super( path.getPoints( capSegments ), radialSegments );

		this.type = 'CapsuleGeometry';

		this.parameters = {
			radius: radius,
			length: length,
			capSegments: capSegments,
			radialSegments: radialSegments,
		};

	}

	static fromJSON( data ) {

		return new CapsuleGeometry( data.radius, data.length, data.capSegments, data.radialSegments );

	}

}

class CircleGeometry extends BufferGeometry {

	constructor( radius = 1, segments = 32, thetaStart = 0, thetaLength = Math.PI * 2 ) {

		super();

		this.type = 'CircleGeometry';

		this.parameters = {
			radius: radius,
			segments: segments,
			thetaStart: thetaStart,
			thetaLength: thetaLength
		};

		segments = Math.max( 3, segments );

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// helper variables

		const vertex = new Vector3();
		const uv = new Vector2();

		// center point

		vertices.push( 0, 0, 0 );
		normals.push( 0, 0, 1 );
		uvs.push( 0.5, 0.5 );

		for ( let s = 0, i = 3; s <= segments; s ++, i += 3 ) {

			const segment = thetaStart + s / segments * thetaLength;

			// vertex

			vertex.x = radius * Math.cos( segment );
			vertex.y = radius * Math.sin( segment );

			vertices.push( vertex.x, vertex.y, vertex.z );

			// normal

			normals.push( 0, 0, 1 );

			// uvs

			uv.x = ( vertices[ i ] / radius + 1 ) / 2;
			uv.y = ( vertices[ i + 1 ] / radius + 1 ) / 2;

			uvs.push( uv.x, uv.y );

		}

		// indices

		for ( let i = 1; i <= segments; i ++ ) {

			indices.push( i, i + 1, 0 );

		}

		// build geometry

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	static fromJSON( data ) {

		return new CircleGeometry( data.radius, data.segments, data.thetaStart, data.thetaLength );

	}

}

class CylinderGeometry extends BufferGeometry {

	constructor( radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 32, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI * 2 ) {

		super();

		this.type = 'CylinderGeometry';

		this.parameters = {
			radiusTop: radiusTop,
			radiusBottom: radiusBottom,
			height: height,
			radialSegments: radialSegments,
			heightSegments: heightSegments,
			openEnded: openEnded,
			thetaStart: thetaStart,
			thetaLength: thetaLength
		};

		const scope = this;

		radialSegments = Math.floor( radialSegments );
		heightSegments = Math.floor( heightSegments );

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// helper variables

		let index = 0;
		const indexArray = [];
		const halfHeight = height / 2;
		let groupStart = 0;

		// generate geometry

		generateTorso();

		if ( openEnded === false ) {

			if ( radiusTop > 0 ) generateCap( true );
			if ( radiusBottom > 0 ) generateCap( false );

		}

		// build geometry

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

		function generateTorso() {

			const normal = new Vector3();
			const vertex = new Vector3();

			let groupCount = 0;

			// this will be used to calculate the normal
			const slope = ( radiusBottom - radiusTop ) / height;

			// generate vertices, normals and uvs

			for ( let y = 0; y <= heightSegments; y ++ ) {

				const indexRow = [];

				const v = y / heightSegments;

				// calculate the radius of the current row

				const radius = v * ( radiusBottom - radiusTop ) + radiusTop;

				for ( let x = 0; x <= radialSegments; x ++ ) {

					const u = x / radialSegments;

					const theta = u * thetaLength + thetaStart;

					const sinTheta = Math.sin( theta );
					const cosTheta = Math.cos( theta );

					// vertex

					vertex.x = radius * sinTheta;
					vertex.y = - v * height + halfHeight;
					vertex.z = radius * cosTheta;
					vertices.push( vertex.x, vertex.y, vertex.z );

					// normal

					normal.set( sinTheta, slope, cosTheta ).normalize();
					normals.push( normal.x, normal.y, normal.z );

					// uv

					uvs.push( u, 1 - v );

					// save index of vertex in respective row

					indexRow.push( index ++ );

				}

				// now save vertices of the row in our index array

				indexArray.push( indexRow );

			}

			// generate indices

			for ( let x = 0; x < radialSegments; x ++ ) {

				for ( let y = 0; y < heightSegments; y ++ ) {

					// we use the index array to access the correct indices

					const a = indexArray[ y ][ x ];
					const b = indexArray[ y + 1 ][ x ];
					const c = indexArray[ y + 1 ][ x + 1 ];
					const d = indexArray[ y ][ x + 1 ];

					// faces

					if ( radiusTop > 0 || y !== 0 ) {

						indices.push( a, b, d );
						groupCount += 3;

					}

					if ( radiusBottom > 0 || y !== heightSegments - 1 ) {

						indices.push( b, c, d );
						groupCount += 3;

					}

				}

			}

			// add a group to the geometry. this will ensure multi material support

			scope.addGroup( groupStart, groupCount, 0 );

			// calculate new start value for groups

			groupStart += groupCount;

		}

		function generateCap( top ) {

			// save the index of the first center vertex
			const centerIndexStart = index;

			const uv = new Vector2();
			const vertex = new Vector3();

			let groupCount = 0;

			const radius = ( top === true ) ? radiusTop : radiusBottom;
			const sign = ( top === true ) ? 1 : - 1;

			// first we generate the center vertex data of the cap.
			// because the geometry needs one set of uvs per face,
			// we must generate a center vertex per face/segment

			for ( let x = 1; x <= radialSegments; x ++ ) {

				// vertex

				vertices.push( 0, halfHeight * sign, 0 );

				// normal

				normals.push( 0, sign, 0 );

				// uv

				uvs.push( 0.5, 0.5 );

				// increase index

				index ++;

			}

			// save the index of the last center vertex
			const centerIndexEnd = index;

			// now we generate the surrounding vertices, normals and uvs

			for ( let x = 0; x <= radialSegments; x ++ ) {

				const u = x / radialSegments;
				const theta = u * thetaLength + thetaStart;

				const cosTheta = Math.cos( theta );
				const sinTheta = Math.sin( theta );

				// vertex

				vertex.x = radius * sinTheta;
				vertex.y = halfHeight * sign;
				vertex.z = radius * cosTheta;
				vertices.push( vertex.x, vertex.y, vertex.z );

				// normal

				normals.push( 0, sign, 0 );

				// uv

				uv.x = ( cosTheta * 0.5 ) + 0.5;
				uv.y = ( sinTheta * 0.5 * sign ) + 0.5;
				uvs.push( uv.x, uv.y );

				// increase index

				index ++;

			}

			// generate indices

			for ( let x = 0; x < radialSegments; x ++ ) {

				const c = centerIndexStart + x;
				const i = centerIndexEnd + x;

				if ( top === true ) {

					// face top

					indices.push( i, i + 1, c );

				} else {

					// face bottom

					indices.push( i + 1, i, c );

				}

				groupCount += 3;

			}

			// add a group to the geometry. this will ensure multi material support

			scope.addGroup( groupStart, groupCount, top === true ? 1 : 2 );

			// calculate new start value for groups

			groupStart += groupCount;

		}

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	static fromJSON( data ) {

		return new CylinderGeometry( data.radiusTop, data.radiusBottom, data.height, data.radialSegments, data.heightSegments, data.openEnded, data.thetaStart, data.thetaLength );

	}

}

class ConeGeometry extends CylinderGeometry {

	constructor( radius = 1, height = 1, radialSegments = 32, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI * 2 ) {

		super( 0, radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength );

		this.type = 'ConeGeometry';

		this.parameters = {
			radius: radius,
			height: height,
			radialSegments: radialSegments,
			heightSegments: heightSegments,
			openEnded: openEnded,
			thetaStart: thetaStart,
			thetaLength: thetaLength
		};

	}

	static fromJSON( data ) {

		return new ConeGeometry( data.radius, data.height, data.radialSegments, data.heightSegments, data.openEnded, data.thetaStart, data.thetaLength );

	}

}

class PolyhedronGeometry extends BufferGeometry {

	constructor( vertices = [], indices = [], radius = 1, detail = 0 ) {

		super();

		this.type = 'PolyhedronGeometry';

		this.parameters = {
			vertices: vertices,
			indices: indices,
			radius: radius,
			detail: detail
		};

		// default buffer data

		const vertexBuffer = [];
		const uvBuffer = [];

		// the subdivision creates the vertex buffer data

		subdivide( detail );

		// all vertices should lie on a conceptual sphere with a given radius

		applyRadius( radius );

		// finally, create the uv data

		generateUVs();

		// build non-indexed geometry

		this.setAttribute( 'position', new Float32BufferAttribute( vertexBuffer, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( vertexBuffer.slice(), 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvBuffer, 2 ) );

		if ( detail === 0 ) {

			this.computeVertexNormals(); // flat normals

		} else {

			this.normalizeNormals(); // smooth normals

		}

		// helper functions

		function subdivide( detail ) {

			const a = new Vector3();
			const b = new Vector3();
			const c = new Vector3();

			// iterate over all faces and apply a subdivision with the given detail value

			for ( let i = 0; i < indices.length; i += 3 ) {

				// get the vertices of the face

				getVertexByIndex( indices[ i + 0 ], a );
				getVertexByIndex( indices[ i + 1 ], b );
				getVertexByIndex( indices[ i + 2 ], c );

				// perform subdivision

				subdivideFace( a, b, c, detail );

			}

		}

		function subdivideFace( a, b, c, detail ) {

			const cols = detail + 1;

			// we use this multidimensional array as a data structure for creating the subdivision

			const v = [];

			// construct all of the vertices for this subdivision

			for ( let i = 0; i <= cols; i ++ ) {

				v[ i ] = [];

				const aj = a.clone().lerp( c, i / cols );
				const bj = b.clone().lerp( c, i / cols );

				const rows = cols - i;

				for ( let j = 0; j <= rows; j ++ ) {

					if ( j === 0 && i === cols ) {

						v[ i ][ j ] = aj;

					} else {

						v[ i ][ j ] = aj.clone().lerp( bj, j / rows );

					}

				}

			}

			// construct all of the faces

			for ( let i = 0; i < cols; i ++ ) {

				for ( let j = 0; j < 2 * ( cols - i ) - 1; j ++ ) {

					const k = Math.floor( j / 2 );

					if ( j % 2 === 0 ) {

						pushVertex( v[ i ][ k + 1 ] );
						pushVertex( v[ i + 1 ][ k ] );
						pushVertex( v[ i ][ k ] );

					} else {

						pushVertex( v[ i ][ k + 1 ] );
						pushVertex( v[ i + 1 ][ k + 1 ] );
						pushVertex( v[ i + 1 ][ k ] );

					}

				}

			}

		}

		function applyRadius( radius ) {

			const vertex = new Vector3();

			// iterate over the entire buffer and apply the radius to each vertex

			for ( let i = 0; i < vertexBuffer.length; i += 3 ) {

				vertex.x = vertexBuffer[ i + 0 ];
				vertex.y = vertexBuffer[ i + 1 ];
				vertex.z = vertexBuffer[ i + 2 ];

				vertex.normalize().multiplyScalar( radius );

				vertexBuffer[ i + 0 ] = vertex.x;
				vertexBuffer[ i + 1 ] = vertex.y;
				vertexBuffer[ i + 2 ] = vertex.z;

			}

		}

		function generateUVs() {

			const vertex = new Vector3();

			for ( let i = 0; i < vertexBuffer.length; i += 3 ) {

				vertex.x = vertexBuffer[ i + 0 ];
				vertex.y = vertexBuffer[ i + 1 ];
				vertex.z = vertexBuffer[ i + 2 ];

				const u = azimuth( vertex ) / 2 / Math.PI + 0.5;
				const v = inclination( vertex ) / Math.PI + 0.5;
				uvBuffer.push( u, 1 - v );

			}

			correctUVs();

			correctSeam();

		}

		function correctSeam() {

			// handle case when face straddles the seam, see #3269

			for ( let i = 0; i < uvBuffer.length; i += 6 ) {

				// uv data of a single face

				const x0 = uvBuffer[ i + 0 ];
				const x1 = uvBuffer[ i + 2 ];
				const x2 = uvBuffer[ i + 4 ];

				const max = Math.max( x0, x1, x2 );
				const min = Math.min( x0, x1, x2 );

				// 0.9 is somewhat arbitrary

				if ( max > 0.9 && min < 0.1 ) {

					if ( x0 < 0.2 ) uvBuffer[ i + 0 ] += 1;
					if ( x1 < 0.2 ) uvBuffer[ i + 2 ] += 1;
					if ( x2 < 0.2 ) uvBuffer[ i + 4 ] += 1;

				}

			}

		}

		function pushVertex( vertex ) {

			vertexBuffer.push( vertex.x, vertex.y, vertex.z );

		}

		function getVertexByIndex( index, vertex ) {

			const stride = index * 3;

			vertex.x = vertices[ stride + 0 ];
			vertex.y = vertices[ stride + 1 ];
			vertex.z = vertices[ stride + 2 ];

		}

		function correctUVs() {

			const a = new Vector3();
			const b = new Vector3();
			const c = new Vector3();

			const centroid = new Vector3();

			const uvA = new Vector2();
			const uvB = new Vector2();
			const uvC = new Vector2();

			for ( let i = 0, j = 0; i < vertexBuffer.length; i += 9, j += 6 ) {

				a.set( vertexBuffer[ i + 0 ], vertexBuffer[ i + 1 ], vertexBuffer[ i + 2 ] );
				b.set( vertexBuffer[ i + 3 ], vertexBuffer[ i + 4 ], vertexBuffer[ i + 5 ] );
				c.set( vertexBuffer[ i + 6 ], vertexBuffer[ i + 7 ], vertexBuffer[ i + 8 ] );

				uvA.set( uvBuffer[ j + 0 ], uvBuffer[ j + 1 ] );
				uvB.set( uvBuffer[ j + 2 ], uvBuffer[ j + 3 ] );
				uvC.set( uvBuffer[ j + 4 ], uvBuffer[ j + 5 ] );

				centroid.copy( a ).add( b ).add( c ).divideScalar( 3 );

				const azi = azimuth( centroid );

				correctUV( uvA, j + 0, a, azi );
				correctUV( uvB, j + 2, b, azi );
				correctUV( uvC, j + 4, c, azi );

			}

		}

		function correctUV( uv, stride, vector, azimuth ) {

			if ( ( azimuth < 0 ) && ( uv.x === 1 ) ) {

				uvBuffer[ stride ] = uv.x - 1;

			}

			if ( ( vector.x === 0 ) && ( vector.z === 0 ) ) {

				uvBuffer[ stride ] = azimuth / 2 / Math.PI + 0.5;

			}

		}

		// Angle around the Y axis, counter-clockwise when looking from above.

		function azimuth( vector ) {

			return Math.atan2( vector.z, - vector.x );

		}


		// Angle above the XZ plane.

		function inclination( vector ) {

			return Math.atan2( - vector.y, Math.sqrt( ( vector.x * vector.x ) + ( vector.z * vector.z ) ) );

		}

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	static fromJSON( data ) {

		return new PolyhedronGeometry( data.vertices, data.indices, data.radius, data.details );

	}

}

class DodecahedronGeometry extends PolyhedronGeometry {

	constructor( radius = 1, detail = 0 ) {

		const t = ( 1 + Math.sqrt( 5 ) ) / 2;
		const r = 1 / t;

		const vertices = [

			// (±1, ±1, ±1)
			- 1, - 1, - 1,	- 1, - 1, 1,
			- 1, 1, - 1, - 1, 1, 1,
			1, - 1, - 1, 1, - 1, 1,
			1, 1, - 1, 1, 1, 1,

			// (0, ±1/φ, ±φ)
			0, - r, - t, 0, - r, t,
			0, r, - t, 0, r, t,

			// (±1/φ, ±φ, 0)
			- r, - t, 0, - r, t, 0,
			r, - t, 0, r, t, 0,

			// (±φ, 0, ±1/φ)
			- t, 0, - r, t, 0, - r,
			- t, 0, r, t, 0, r
		];

		const indices = [
			3, 11, 7, 	3, 7, 15, 	3, 15, 13,
			7, 19, 17, 	7, 17, 6, 	7, 6, 15,
			17, 4, 8, 	17, 8, 10, 	17, 10, 6,
			8, 0, 16, 	8, 16, 2, 	8, 2, 10,
			0, 12, 1, 	0, 1, 18, 	0, 18, 16,
			6, 10, 2, 	6, 2, 13, 	6, 13, 15,
			2, 16, 18, 	2, 18, 3, 	2, 3, 13,
			18, 1, 9, 	18, 9, 11, 	18, 11, 3,
			4, 14, 12, 	4, 12, 0, 	4, 0, 8,
			11, 9, 5, 	11, 5, 19, 	11, 19, 7,
			19, 5, 14, 	19, 14, 4, 	19, 4, 17,
			1, 12, 14, 	1, 14, 5, 	1, 5, 9
		];

		super( vertices, indices, radius, detail );

		this.type = 'DodecahedronGeometry';

		this.parameters = {
			radius: radius,
			detail: detail
		};

	}

	static fromJSON( data ) {

		return new DodecahedronGeometry( data.radius, data.detail );

	}

}

const _v0 = /*@__PURE__*/ new Vector3();
const _v1$1 = /*@__PURE__*/ new Vector3();
const _normal = /*@__PURE__*/ new Vector3();
const _triangle = /*@__PURE__*/ new Triangle();

class EdgesGeometry extends BufferGeometry {

	constructor( geometry = null, thresholdAngle = 1 ) {

		super();

		this.type = 'EdgesGeometry';

		this.parameters = {
			geometry: geometry,
			thresholdAngle: thresholdAngle
		};

		if ( geometry !== null ) {

			const precisionPoints = 4;
			const precision = Math.pow( 10, precisionPoints );
			const thresholdDot = Math.cos( DEG2RAD * thresholdAngle );

			const indexAttr = geometry.getIndex();
			const positionAttr = geometry.getAttribute( 'position' );
			const indexCount = indexAttr ? indexAttr.count : positionAttr.count;

			const indexArr = [ 0, 0, 0 ];
			const vertKeys = [ 'a', 'b', 'c' ];
			const hashes = new Array( 3 );

			const edgeData = {};
			const vertices = [];
			for ( let i = 0; i < indexCount; i += 3 ) {

				if ( indexAttr ) {

					indexArr[ 0 ] = indexAttr.getX( i );
					indexArr[ 1 ] = indexAttr.getX( i + 1 );
					indexArr[ 2 ] = indexAttr.getX( i + 2 );

				} else {

					indexArr[ 0 ] = i;
					indexArr[ 1 ] = i + 1;
					indexArr[ 2 ] = i + 2;

				}

				const { a, b, c } = _triangle;
				a.fromBufferAttribute( positionAttr, indexArr[ 0 ] );
				b.fromBufferAttribute( positionAttr, indexArr[ 1 ] );
				c.fromBufferAttribute( positionAttr, indexArr[ 2 ] );
				_triangle.getNormal( _normal );

				// create hashes for the edge from the vertices
				hashes[ 0 ] = `${ Math.round( a.x * precision ) },${ Math.round( a.y * precision ) },${ Math.round( a.z * precision ) }`;
				hashes[ 1 ] = `${ Math.round( b.x * precision ) },${ Math.round( b.y * precision ) },${ Math.round( b.z * precision ) }`;
				hashes[ 2 ] = `${ Math.round( c.x * precision ) },${ Math.round( c.y * precision ) },${ Math.round( c.z * precision ) }`;

				// skip degenerate triangles
				if ( hashes[ 0 ] === hashes[ 1 ] || hashes[ 1 ] === hashes[ 2 ] || hashes[ 2 ] === hashes[ 0 ] ) {

					continue;

				}

				// iterate over every edge
				for ( let j = 0; j < 3; j ++ ) {

					// get the first and next vertex making up the edge
					const jNext = ( j + 1 ) % 3;
					const vecHash0 = hashes[ j ];
					const vecHash1 = hashes[ jNext ];
					const v0 = _triangle[ vertKeys[ j ] ];
					const v1 = _triangle[ vertKeys[ jNext ] ];

					const hash = `${ vecHash0 }_${ vecHash1 }`;
					const reverseHash = `${ vecHash1 }_${ vecHash0 }`;

					if ( reverseHash in edgeData && edgeData[ reverseHash ] ) {

						// if we found a sibling edge add it into the vertex array if
						// it meets the angle threshold and delete the edge from the map.
						if ( _normal.dot( edgeData[ reverseHash ].normal ) <= thresholdDot ) {

							vertices.push( v0.x, v0.y, v0.z );
							vertices.push( v1.x, v1.y, v1.z );

						}

						edgeData[ reverseHash ] = null;

					} else if ( ! ( hash in edgeData ) ) {

						// if we've already got an edge here then skip adding a new one
						edgeData[ hash ] = {

							index0: indexArr[ j ],
							index1: indexArr[ jNext ],
							normal: _normal.clone(),

						};

					}

				}

			}

			// iterate over all remaining, unmatched edges and add them to the vertex array
			for ( const key in edgeData ) {

				if ( edgeData[ key ] ) {

					const { index0, index1 } = edgeData[ key ];
					_v0.fromBufferAttribute( positionAttr, index0 );
					_v1$1.fromBufferAttribute( positionAttr, index1 );

					vertices.push( _v0.x, _v0.y, _v0.z );
					vertices.push( _v1$1.x, _v1$1.y, _v1$1.z );

				}

			}

			this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );

		}

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

}

class Shape extends Path {

	constructor( points ) {

		super( points );

		this.uuid = generateUUID();

		this.type = 'Shape';

		this.holes = [];

	}

	getPointsHoles( divisions ) {

		const holesPts = [];

		for ( let i = 0, l = this.holes.length; i < l; i ++ ) {

			holesPts[ i ] = this.holes[ i ].getPoints( divisions );

		}

		return holesPts;

	}

	// get points of shape and holes (keypoints based on segments parameter)

	extractPoints( divisions ) {

		return {

			shape: this.getPoints( divisions ),
			holes: this.getPointsHoles( divisions )

		};

	}

	copy( source ) {

		super.copy( source );

		this.holes = [];

		for ( let i = 0, l = source.holes.length; i < l; i ++ ) {

			const hole = source.holes[ i ];

			this.holes.push( hole.clone() );

		}

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.uuid = this.uuid;
		data.holes = [];

		for ( let i = 0, l = this.holes.length; i < l; i ++ ) {

			const hole = this.holes[ i ];
			data.holes.push( hole.toJSON() );

		}

		return data;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.uuid = json.uuid;
		this.holes = [];

		for ( let i = 0, l = json.holes.length; i < l; i ++ ) {

			const hole = json.holes[ i ];
			this.holes.push( new Path().fromJSON( hole ) );

		}

		return this;

	}

}

/**
 * Port from https://github.com/mapbox/earcut (v2.2.4)
 */

const Earcut = {

	triangulate: function ( data, holeIndices, dim = 2 ) {

		const hasHoles = holeIndices && holeIndices.length;
		const outerLen = hasHoles ? holeIndices[ 0 ] * dim : data.length;
		let outerNode = linkedList( data, 0, outerLen, dim, true );
		const triangles = [];

		if ( ! outerNode || outerNode.next === outerNode.prev ) return triangles;

		let minX, minY, maxX, maxY, x, y, invSize;

		if ( hasHoles ) outerNode = eliminateHoles( data, holeIndices, outerNode, dim );

		// if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
		if ( data.length > 80 * dim ) {

			minX = maxX = data[ 0 ];
			minY = maxY = data[ 1 ];

			for ( let i = dim; i < outerLen; i += dim ) {

				x = data[ i ];
				y = data[ i + 1 ];
				if ( x < minX ) minX = x;
				if ( y < minY ) minY = y;
				if ( x > maxX ) maxX = x;
				if ( y > maxY ) maxY = y;

			}

			// minX, minY and invSize are later used to transform coords into integers for z-order calculation
			invSize = Math.max( maxX - minX, maxY - minY );
			invSize = invSize !== 0 ? 32767 / invSize : 0;

		}

		earcutLinked( outerNode, triangles, dim, minX, minY, invSize, 0 );

		return triangles;

	}

};

// create a circular doubly linked list from polygon points in the specified winding order
function linkedList( data, start, end, dim, clockwise ) {

	let i, last;

	if ( clockwise === ( signedArea( data, start, end, dim ) > 0 ) ) {

		for ( i = start; i < end; i += dim ) last = insertNode( i, data[ i ], data[ i + 1 ], last );

	} else {

		for ( i = end - dim; i >= start; i -= dim ) last = insertNode( i, data[ i ], data[ i + 1 ], last );

	}

	if ( last && equals( last, last.next ) ) {

		removeNode( last );
		last = last.next;

	}

	return last;

}

// eliminate colinear or duplicate points
function filterPoints( start, end ) {

	if ( ! start ) return start;
	if ( ! end ) end = start;

	let p = start,
		again;
	do {

		again = false;

		if ( ! p.steiner && ( equals( p, p.next ) || area( p.prev, p, p.next ) === 0 ) ) {

			removeNode( p );
			p = end = p.prev;
			if ( p === p.next ) break;
			again = true;

		} else {

			p = p.next;

		}

	} while ( again || p !== end );

	return end;

}

// main ear slicing loop which triangulates a polygon (given as a linked list)
function earcutLinked( ear, triangles, dim, minX, minY, invSize, pass ) {

	if ( ! ear ) return;

	// interlink polygon nodes in z-order
	if ( ! pass && invSize ) indexCurve( ear, minX, minY, invSize );

	let stop = ear,
		prev, next;

	// iterate through ears, slicing them one by one
	while ( ear.prev !== ear.next ) {

		prev = ear.prev;
		next = ear.next;

		if ( invSize ? isEarHashed( ear, minX, minY, invSize ) : isEar( ear ) ) {

			// cut off the triangle
			triangles.push( prev.i / dim | 0 );
			triangles.push( ear.i / dim | 0 );
			triangles.push( next.i / dim | 0 );

			removeNode( ear );

			// skipping the next vertex leads to less sliver triangles
			ear = next.next;
			stop = next.next;

			continue;

		}

		ear = next;

		// if we looped through the whole remaining polygon and can't find any more ears
		if ( ear === stop ) {

			// try filtering points and slicing again
			if ( ! pass ) {

				earcutLinked( filterPoints( ear ), triangles, dim, minX, minY, invSize, 1 );

				// if this didn't work, try curing all small self-intersections locally

			} else if ( pass === 1 ) {

				ear = cureLocalIntersections( filterPoints( ear ), triangles, dim );
				earcutLinked( ear, triangles, dim, minX, minY, invSize, 2 );

				// as a last resort, try splitting the remaining polygon into two

			} else if ( pass === 2 ) {

				splitEarcut( ear, triangles, dim, minX, minY, invSize );

			}

			break;

		}

	}

}

// check whether a polygon node forms a valid ear with adjacent nodes
function isEar( ear ) {

	const a = ear.prev,
		b = ear,
		c = ear.next;

	if ( area( a, b, c ) >= 0 ) return false; // reflex, can't be an ear

	// now make sure we don't have other points inside the potential ear
	const ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;

	// triangle bbox; min & max are calculated like this for speed
	const x0 = ax < bx ? ( ax < cx ? ax : cx ) : ( bx < cx ? bx : cx ),
		y0 = ay < by ? ( ay < cy ? ay : cy ) : ( by < cy ? by : cy ),
		x1 = ax > bx ? ( ax > cx ? ax : cx ) : ( bx > cx ? bx : cx ),
		y1 = ay > by ? ( ay > cy ? ay : cy ) : ( by > cy ? by : cy );

	let p = c.next;
	while ( p !== a ) {

		if ( p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 &&
			pointInTriangle( ax, ay, bx, by, cx, cy, p.x, p.y ) &&
			area( p.prev, p, p.next ) >= 0 ) return false;
		p = p.next;

	}

	return true;

}

function isEarHashed( ear, minX, minY, invSize ) {

	const a = ear.prev,
		b = ear,
		c = ear.next;

	if ( area( a, b, c ) >= 0 ) return false; // reflex, can't be an ear

	const ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;

	// triangle bbox; min & max are calculated like this for speed
	const x0 = ax < bx ? ( ax < cx ? ax : cx ) : ( bx < cx ? bx : cx ),
		y0 = ay < by ? ( ay < cy ? ay : cy ) : ( by < cy ? by : cy ),
		x1 = ax > bx ? ( ax > cx ? ax : cx ) : ( bx > cx ? bx : cx ),
		y1 = ay > by ? ( ay > cy ? ay : cy ) : ( by > cy ? by : cy );

	// z-order range for the current triangle bbox;
	const minZ = zOrder( x0, y0, minX, minY, invSize ),
		maxZ = zOrder( x1, y1, minX, minY, invSize );

	let p = ear.prevZ,
		n = ear.nextZ;

	// look for points inside the triangle in both directions
	while ( p && p.z >= minZ && n && n.z <= maxZ ) {

		if ( p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c &&
			pointInTriangle( ax, ay, bx, by, cx, cy, p.x, p.y ) && area( p.prev, p, p.next ) >= 0 ) return false;
		p = p.prevZ;

		if ( n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c &&
			pointInTriangle( ax, ay, bx, by, cx, cy, n.x, n.y ) && area( n.prev, n, n.next ) >= 0 ) return false;
		n = n.nextZ;

	}

	// look for remaining points in decreasing z-order
	while ( p && p.z >= minZ ) {

		if ( p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c &&
			pointInTriangle( ax, ay, bx, by, cx, cy, p.x, p.y ) && area( p.prev, p, p.next ) >= 0 ) return false;
		p = p.prevZ;

	}

	// look for remaining points in increasing z-order
	while ( n && n.z <= maxZ ) {

		if ( n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c &&
			pointInTriangle( ax, ay, bx, by, cx, cy, n.x, n.y ) && area( n.prev, n, n.next ) >= 0 ) return false;
		n = n.nextZ;

	}

	return true;

}

// go through all polygon nodes and cure small local self-intersections
function cureLocalIntersections( start, triangles, dim ) {

	let p = start;
	do {

		const a = p.prev,
			b = p.next.next;

		if ( ! equals( a, b ) && intersects( a, p, p.next, b ) && locallyInside( a, b ) && locallyInside( b, a ) ) {

			triangles.push( a.i / dim | 0 );
			triangles.push( p.i / dim | 0 );
			triangles.push( b.i / dim | 0 );

			// remove two nodes involved
			removeNode( p );
			removeNode( p.next );

			p = start = b;

		}

		p = p.next;

	} while ( p !== start );

	return filterPoints( p );

}

// try splitting polygon into two and triangulate them independently
function splitEarcut( start, triangles, dim, minX, minY, invSize ) {

	// look for a valid diagonal that divides the polygon into two
	let a = start;
	do {

		let b = a.next.next;
		while ( b !== a.prev ) {

			if ( a.i !== b.i && isValidDiagonal( a, b ) ) {

				// split the polygon in two by the diagonal
				let c = splitPolygon( a, b );

				// filter colinear points around the cuts
				a = filterPoints( a, a.next );
				c = filterPoints( c, c.next );

				// run earcut on each half
				earcutLinked( a, triangles, dim, minX, minY, invSize, 0 );
				earcutLinked( c, triangles, dim, minX, minY, invSize, 0 );
				return;

			}

			b = b.next;

		}

		a = a.next;

	} while ( a !== start );

}

// link every hole into the outer loop, producing a single-ring polygon without holes
function eliminateHoles( data, holeIndices, outerNode, dim ) {

	const queue = [];
	let i, len, start, end, list;

	for ( i = 0, len = holeIndices.length; i < len; i ++ ) {

		start = holeIndices[ i ] * dim;
		end = i < len - 1 ? holeIndices[ i + 1 ] * dim : data.length;
		list = linkedList( data, start, end, dim, false );
		if ( list === list.next ) list.steiner = true;
		queue.push( getLeftmost( list ) );

	}

	queue.sort( compareX );

	// process holes from left to right
	for ( i = 0; i < queue.length; i ++ ) {

		outerNode = eliminateHole( queue[ i ], outerNode );

	}

	return outerNode;

}

function compareX( a, b ) {

	return a.x - b.x;

}

// find a bridge between vertices that connects hole with an outer ring and link it
function eliminateHole( hole, outerNode ) {

	const bridge = findHoleBridge( hole, outerNode );
	if ( ! bridge ) {

		return outerNode;

	}

	const bridgeReverse = splitPolygon( bridge, hole );

	// filter collinear points around the cuts
	filterPoints( bridgeReverse, bridgeReverse.next );
	return filterPoints( bridge, bridge.next );

}

// David Eberly's algorithm for finding a bridge between hole and outer polygon
function findHoleBridge( hole, outerNode ) {

	let p = outerNode,
		qx = - Infinity,
		m;

	const hx = hole.x, hy = hole.y;

	// find a segment intersected by a ray from the hole's leftmost point to the left;
	// segment's endpoint with lesser x will be potential connection point
	do {

		if ( hy <= p.y && hy >= p.next.y && p.next.y !== p.y ) {

			const x = p.x + ( hy - p.y ) * ( p.next.x - p.x ) / ( p.next.y - p.y );
			if ( x <= hx && x > qx ) {

				qx = x;
				m = p.x < p.next.x ? p : p.next;
				if ( x === hx ) return m; // hole touches outer segment; pick leftmost endpoint

			}

		}

		p = p.next;

	} while ( p !== outerNode );

	if ( ! m ) return null;

	// look for points inside the triangle of hole point, segment intersection and endpoint;
	// if there are no points found, we have a valid connection;
	// otherwise choose the point of the minimum angle with the ray as connection point

	const stop = m,
		mx = m.x,
		my = m.y;
	let tanMin = Infinity, tan;

	p = m;

	do {

		if ( hx >= p.x && p.x >= mx && hx !== p.x &&
				pointInTriangle( hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y ) ) {

			tan = Math.abs( hy - p.y ) / ( hx - p.x ); // tangential

			if ( locallyInside( p, hole ) && ( tan < tanMin || ( tan === tanMin && ( p.x > m.x || ( p.x === m.x && sectorContainsSector( m, p ) ) ) ) ) ) {

				m = p;
				tanMin = tan;

			}

		}

		p = p.next;

	} while ( p !== stop );

	return m;

}

// whether sector in vertex m contains sector in vertex p in the same coordinates
function sectorContainsSector( m, p ) {

	return area( m.prev, m, p.prev ) < 0 && area( p.next, m, m.next ) < 0;

}

// interlink polygon nodes in z-order
function indexCurve( start, minX, minY, invSize ) {

	let p = start;
	do {

		if ( p.z === 0 ) p.z = zOrder( p.x, p.y, minX, minY, invSize );
		p.prevZ = p.prev;
		p.nextZ = p.next;
		p = p.next;

	} while ( p !== start );

	p.prevZ.nextZ = null;
	p.prevZ = null;

	sortLinked( p );

}

// Simon Tatham's linked list merge sort algorithm
// http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
function sortLinked( list ) {

	let i, p, q, e, tail, numMerges, pSize, qSize,
		inSize = 1;

	do {

		p = list;
		list = null;
		tail = null;
		numMerges = 0;

		while ( p ) {

			numMerges ++;
			q = p;
			pSize = 0;
			for ( i = 0; i < inSize; i ++ ) {

				pSize ++;
				q = q.nextZ;
				if ( ! q ) break;

			}

			qSize = inSize;

			while ( pSize > 0 || ( qSize > 0 && q ) ) {

				if ( pSize !== 0 && ( qSize === 0 || ! q || p.z <= q.z ) ) {

					e = p;
					p = p.nextZ;
					pSize --;

				} else {

					e = q;
					q = q.nextZ;
					qSize --;

				}

				if ( tail ) tail.nextZ = e;
				else list = e;

				e.prevZ = tail;
				tail = e;

			}

			p = q;

		}

		tail.nextZ = null;
		inSize *= 2;

	} while ( numMerges > 1 );

	return list;

}

// z-order of a point given coords and inverse of the longer side of data bbox
function zOrder( x, y, minX, minY, invSize ) {

	// coords are transformed into non-negative 15-bit integer range
	x = ( x - minX ) * invSize | 0;
	y = ( y - minY ) * invSize | 0;

	x = ( x | ( x << 8 ) ) & 0x00FF00FF;
	x = ( x | ( x << 4 ) ) & 0x0F0F0F0F;
	x = ( x | ( x << 2 ) ) & 0x33333333;
	x = ( x | ( x << 1 ) ) & 0x55555555;

	y = ( y | ( y << 8 ) ) & 0x00FF00FF;
	y = ( y | ( y << 4 ) ) & 0x0F0F0F0F;
	y = ( y | ( y << 2 ) ) & 0x33333333;
	y = ( y | ( y << 1 ) ) & 0x55555555;

	return x | ( y << 1 );

}

// find the leftmost node of a polygon ring
function getLeftmost( start ) {

	let p = start,
		leftmost = start;
	do {

		if ( p.x < leftmost.x || ( p.x === leftmost.x && p.y < leftmost.y ) ) leftmost = p;
		p = p.next;

	} while ( p !== start );

	return leftmost;

}

// check if a point lies within a convex triangle
function pointInTriangle( ax, ay, bx, by, cx, cy, px, py ) {

	return ( cx - px ) * ( ay - py ) >= ( ax - px ) * ( cy - py ) &&
           ( ax - px ) * ( by - py ) >= ( bx - px ) * ( ay - py ) &&
           ( bx - px ) * ( cy - py ) >= ( cx - px ) * ( by - py );

}

// check if a diagonal between two polygon nodes is valid (lies in polygon interior)
function isValidDiagonal( a, b ) {

	return a.next.i !== b.i && a.prev.i !== b.i && ! intersectsPolygon( a, b ) && // doesn't intersect other edges
           ( locallyInside( a, b ) && locallyInside( b, a ) && middleInside( a, b ) && // locally visible
            ( area( a.prev, a, b.prev ) || area( a, b.prev, b ) ) || // does not create opposite-facing sectors
            equals( a, b ) && area( a.prev, a, a.next ) > 0 && area( b.prev, b, b.next ) > 0 ); // special zero-length case

}

// signed area of a triangle
function area( p, q, r ) {

	return ( q.y - p.y ) * ( r.x - q.x ) - ( q.x - p.x ) * ( r.y - q.y );

}

// check if two points are equal
function equals( p1, p2 ) {

	return p1.x === p2.x && p1.y === p2.y;

}

// check if two segments intersect
function intersects( p1, q1, p2, q2 ) {

	const o1 = sign( area( p1, q1, p2 ) );
	const o2 = sign( area( p1, q1, q2 ) );
	const o3 = sign( area( p2, q2, p1 ) );
	const o4 = sign( area( p2, q2, q1 ) );

	if ( o1 !== o2 && o3 !== o4 ) return true; // general case

	if ( o1 === 0 && onSegment( p1, p2, q1 ) ) return true; // p1, q1 and p2 are collinear and p2 lies on p1q1
	if ( o2 === 0 && onSegment( p1, q2, q1 ) ) return true; // p1, q1 and q2 are collinear and q2 lies on p1q1
	if ( o3 === 0 && onSegment( p2, p1, q2 ) ) return true; // p2, q2 and p1 are collinear and p1 lies on p2q2
	if ( o4 === 0 && onSegment( p2, q1, q2 ) ) return true; // p2, q2 and q1 are collinear and q1 lies on p2q2

	return false;

}

// for collinear points p, q, r, check if point q lies on segment pr
function onSegment( p, q, r ) {

	return q.x <= Math.max( p.x, r.x ) && q.x >= Math.min( p.x, r.x ) && q.y <= Math.max( p.y, r.y ) && q.y >= Math.min( p.y, r.y );

}

function sign( num ) {

	return num > 0 ? 1 : num < 0 ? - 1 : 0;

}

// check if a polygon diagonal intersects any polygon segments
function intersectsPolygon( a, b ) {

	let p = a;
	do {

		if ( p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
			intersects( p, p.next, a, b ) ) return true;
		p = p.next;

	} while ( p !== a );

	return false;

}

// check if a polygon diagonal is locally inside the polygon
function locallyInside( a, b ) {

	return area( a.prev, a, a.next ) < 0 ?
		area( a, b, a.next ) >= 0 && area( a, a.prev, b ) >= 0 :
		area( a, b, a.prev ) < 0 || area( a, a.next, b ) < 0;

}

// check if the middle point of a polygon diagonal is inside the polygon
function middleInside( a, b ) {

	let p = a,
		inside = false;
	const px = ( a.x + b.x ) / 2,
		py = ( a.y + b.y ) / 2;
	do {

		if ( ( ( p.y > py ) !== ( p.next.y > py ) ) && p.next.y !== p.y &&
			( px < ( p.next.x - p.x ) * ( py - p.y ) / ( p.next.y - p.y ) + p.x ) )
			inside = ! inside;
		p = p.next;

	} while ( p !== a );

	return inside;

}

// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
// if one belongs to the outer ring and another to a hole, it merges it into a single ring
function splitPolygon( a, b ) {

	const a2 = new Node( a.i, a.x, a.y ),
		b2 = new Node( b.i, b.x, b.y ),
		an = a.next,
		bp = b.prev;

	a.next = b;
	b.prev = a;

	a2.next = an;
	an.prev = a2;

	b2.next = a2;
	a2.prev = b2;

	bp.next = b2;
	b2.prev = bp;

	return b2;

}

// create a node and optionally link it with previous one (in a circular doubly linked list)
function insertNode( i, x, y, last ) {

	const p = new Node( i, x, y );

	if ( ! last ) {

		p.prev = p;
		p.next = p;

	} else {

		p.next = last.next;
		p.prev = last;
		last.next.prev = p;
		last.next = p;

	}

	return p;

}

function removeNode( p ) {

	p.next.prev = p.prev;
	p.prev.next = p.next;

	if ( p.prevZ ) p.prevZ.nextZ = p.nextZ;
	if ( p.nextZ ) p.nextZ.prevZ = p.prevZ;

}

function Node( i, x, y ) {

	// vertex index in coordinates array
	this.i = i;

	// vertex coordinates
	this.x = x;
	this.y = y;

	// previous and next vertex nodes in a polygon ring
	this.prev = null;
	this.next = null;

	// z-order curve value
	this.z = 0;

	// previous and next nodes in z-order
	this.prevZ = null;
	this.nextZ = null;

	// indicates whether this is a steiner point
	this.steiner = false;

}

function signedArea( data, start, end, dim ) {

	let sum = 0;
	for ( let i = start, j = end - dim; i < end; i += dim ) {

		sum += ( data[ j ] - data[ i ] ) * ( data[ i + 1 ] + data[ j + 1 ] );
		j = i;

	}

	return sum;

}

class ShapeUtils {

	// calculate area of the contour polygon

	static area( contour ) {

		const n = contour.length;
		let a = 0.0;

		for ( let p = n - 1, q = 0; q < n; p = q ++ ) {

			a += contour[ p ].x * contour[ q ].y - contour[ q ].x * contour[ p ].y;

		}

		return a * 0.5;

	}

	static isClockWise( pts ) {

		return ShapeUtils.area( pts ) < 0;

	}

	static triangulateShape( contour, holes ) {

		const vertices = []; // flat array of vertices like [ x0,y0, x1,y1, x2,y2, ... ]
		const holeIndices = []; // array of hole indices
		const faces = []; // final array of vertex indices like [ [ a,b,d ], [ b,c,d ] ]

		removeDupEndPts( contour );
		addContour( vertices, contour );

		//

		let holeIndex = contour.length;

		holes.forEach( removeDupEndPts );

		for ( let i = 0; i < holes.length; i ++ ) {

			holeIndices.push( holeIndex );
			holeIndex += holes[ i ].length;
			addContour( vertices, holes[ i ] );

		}

		//

		const triangles = Earcut.triangulate( vertices, holeIndices );

		//

		for ( let i = 0; i < triangles.length; i += 3 ) {

			faces.push( triangles.slice( i, i + 3 ) );

		}

		return faces;

	}

}

function removeDupEndPts( points ) {

	const l = points.length;

	if ( l > 2 && points[ l - 1 ].equals( points[ 0 ] ) ) {

		points.pop();

	}

}

function addContour( vertices, contour ) {

	for ( let i = 0; i < contour.length; i ++ ) {

		vertices.push( contour[ i ].x );
		vertices.push( contour[ i ].y );

	}

}

/**
 * Creates extruded geometry from a path shape.
 *
 * parameters = {
 *
 *  curveSegments: <int>, // number of points on the curves
 *  steps: <int>, // number of points for z-side extrusions / used for subdividing segments of extrude spline too
 *  depth: <float>, // Depth to extrude the shape
 *
 *  bevelEnabled: <bool>, // turn on bevel
 *  bevelThickness: <float>, // how deep into the original shape bevel goes
 *  bevelSize: <float>, // how far from shape outline (including bevelOffset) is bevel
 *  bevelOffset: <float>, // how far from shape outline does bevel start
 *  bevelSegments: <int>, // number of bevel layers
 *
 *  extrudePath: <THREE.Curve> // curve to extrude shape along
 *
 *  UVGenerator: <Object> // object that provides UV generator functions
 *
 * }
 */


class ExtrudeGeometry extends BufferGeometry {

	constructor( shapes = new Shape( [ new Vector2( 0.5, 0.5 ), new Vector2( - 0.5, 0.5 ), new Vector2( - 0.5, - 0.5 ), new Vector2( 0.5, - 0.5 ) ] ), options = {} ) {

		super();

		this.type = 'ExtrudeGeometry';

		this.parameters = {
			shapes: shapes,
			options: options
		};

		shapes = Array.isArray( shapes ) ? shapes : [ shapes ];

		const scope = this;

		const verticesArray = [];
		const uvArray = [];

		for ( let i = 0, l = shapes.length; i < l; i ++ ) {

			const shape = shapes[ i ];
			addShape( shape );

		}

		// build geometry

		this.setAttribute( 'position', new Float32BufferAttribute( verticesArray, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvArray, 2 ) );

		this.computeVertexNormals();

		// functions

		function addShape( shape ) {

			const placeholder = [];

			// options

			const curveSegments = options.curveSegments !== undefined ? options.curveSegments : 12;
			const steps = options.steps !== undefined ? options.steps : 1;
			const depth = options.depth !== undefined ? options.depth : 1;

			let bevelEnabled = options.bevelEnabled !== undefined ? options.bevelEnabled : true;
			let bevelThickness = options.bevelThickness !== undefined ? options.bevelThickness : 0.2;
			let bevelSize = options.bevelSize !== undefined ? options.bevelSize : bevelThickness - 0.1;
			let bevelOffset = options.bevelOffset !== undefined ? options.bevelOffset : 0;
			let bevelSegments = options.bevelSegments !== undefined ? options.bevelSegments : 3;

			const extrudePath = options.extrudePath;

			const uvgen = options.UVGenerator !== undefined ? options.UVGenerator : WorldUVGenerator;

			//

			let extrudePts, extrudeByPath = false;
			let splineTube, binormal, normal, position2;

			if ( extrudePath ) {

				extrudePts = extrudePath.getSpacedPoints( steps );

				extrudeByPath = true;
				bevelEnabled = false; // bevels not supported for path extrusion

				// SETUP TNB variables

				// TODO1 - have a .isClosed in spline?

				splineTube = extrudePath.computeFrenetFrames( steps, false );

				// console.log(splineTube, 'splineTube', splineTube.normals.length, 'steps', steps, 'extrudePts', extrudePts.length);

				binormal = new Vector3();
				normal = new Vector3();
				position2 = new Vector3();

			}

			// Safeguards if bevels are not enabled

			if ( ! bevelEnabled ) {

				bevelSegments = 0;
				bevelThickness = 0;
				bevelSize = 0;
				bevelOffset = 0;

			}

			// Variables initialization

			const shapePoints = shape.extractPoints( curveSegments );

			let vertices = shapePoints.shape;
			const holes = shapePoints.holes;

			const reverse = ! ShapeUtils.isClockWise( vertices );

			if ( reverse ) {

				vertices = vertices.reverse();

				// Maybe we should also check if holes are in the opposite direction, just to be safe ...

				for ( let h = 0, hl = holes.length; h < hl; h ++ ) {

					const ahole = holes[ h ];

					if ( ShapeUtils.isClockWise( ahole ) ) {

						holes[ h ] = ahole.reverse();

					}

				}

			}


			const faces = ShapeUtils.triangulateShape( vertices, holes );

			/* Vertices */

			const contour = vertices; // vertices has all points but contour has only points of circumference

			for ( let h = 0, hl = holes.length; h < hl; h ++ ) {

				const ahole = holes[ h ];

				vertices = vertices.concat( ahole );

			}


			function scalePt2( pt, vec, size ) {

				if ( ! vec ) console.error( 'THREE.ExtrudeGeometry: vec does not exist' );

				return pt.clone().addScaledVector( vec, size );

			}

			const vlen = vertices.length, flen = faces.length;


			// Find directions for point movement


			function getBevelVec( inPt, inPrev, inNext ) {

				// computes for inPt the corresponding point inPt' on a new contour
				//   shifted by 1 unit (length of normalized vector) to the left
				// if we walk along contour clockwise, this new contour is outside the old one
				//
				// inPt' is the intersection of the two lines parallel to the two
				//  adjacent edges of inPt at a distance of 1 unit on the left side.

				let v_trans_x, v_trans_y, shrink_by; // resulting translation vector for inPt

				// good reading for geometry algorithms (here: line-line intersection)
				// http://geomalgorithms.com/a05-_intersect-1.html

				const v_prev_x = inPt.x - inPrev.x,
					v_prev_y = inPt.y - inPrev.y;
				const v_next_x = inNext.x - inPt.x,
					v_next_y = inNext.y - inPt.y;

				const v_prev_lensq = ( v_prev_x * v_prev_x + v_prev_y * v_prev_y );

				// check for collinear edges
				const collinear0 = ( v_prev_x * v_next_y - v_prev_y * v_next_x );

				if ( Math.abs( collinear0 ) > Number.EPSILON ) {

					// not collinear

					// length of vectors for normalizing

					const v_prev_len = Math.sqrt( v_prev_lensq );
					const v_next_len = Math.sqrt( v_next_x * v_next_x + v_next_y * v_next_y );

					// shift adjacent points by unit vectors to the left

					const ptPrevShift_x = ( inPrev.x - v_prev_y / v_prev_len );
					const ptPrevShift_y = ( inPrev.y + v_prev_x / v_prev_len );

					const ptNextShift_x = ( inNext.x - v_next_y / v_next_len );
					const ptNextShift_y = ( inNext.y + v_next_x / v_next_len );

					// scaling factor for v_prev to intersection point

					const sf = ( ( ptNextShift_x - ptPrevShift_x ) * v_next_y -
							( ptNextShift_y - ptPrevShift_y ) * v_next_x ) /
						( v_prev_x * v_next_y - v_prev_y * v_next_x );

					// vector from inPt to intersection point

					v_trans_x = ( ptPrevShift_x + v_prev_x * sf - inPt.x );
					v_trans_y = ( ptPrevShift_y + v_prev_y * sf - inPt.y );

					// Don't normalize!, otherwise sharp corners become ugly
					//  but prevent crazy spikes
					const v_trans_lensq = ( v_trans_x * v_trans_x + v_trans_y * v_trans_y );
					if ( v_trans_lensq <= 2 ) {

						return new Vector2( v_trans_x, v_trans_y );

					} else {

						shrink_by = Math.sqrt( v_trans_lensq / 2 );

					}

				} else {

					// handle special case of collinear edges

					let direction_eq = false; // assumes: opposite

					if ( v_prev_x > Number.EPSILON ) {

						if ( v_next_x > Number.EPSILON ) {

							direction_eq = true;

						}

					} else {

						if ( v_prev_x < - Number.EPSILON ) {

							if ( v_next_x < - Number.EPSILON ) {

								direction_eq = true;

							}

						} else {

							if ( Math.sign( v_prev_y ) === Math.sign( v_next_y ) ) {

								direction_eq = true;

							}

						}

					}

					if ( direction_eq ) {

						// console.log("Warning: lines are a straight sequence");
						v_trans_x = - v_prev_y;
						v_trans_y = v_prev_x;
						shrink_by = Math.sqrt( v_prev_lensq );

					} else {

						// console.log("Warning: lines are a straight spike");
						v_trans_x = v_prev_x;
						v_trans_y = v_prev_y;
						shrink_by = Math.sqrt( v_prev_lensq / 2 );

					}

				}

				return new Vector2( v_trans_x / shrink_by, v_trans_y / shrink_by );

			}


			const contourMovements = [];

			for ( let i = 0, il = contour.length, j = il - 1, k = i + 1; i < il; i ++, j ++, k ++ ) {

				if ( j === il ) j = 0;
				if ( k === il ) k = 0;

				//  (j)---(i)---(k)
				// console.log('i,j,k', i, j , k)

				contourMovements[ i ] = getBevelVec( contour[ i ], contour[ j ], contour[ k ] );

			}

			const holesMovements = [];
			let oneHoleMovements, verticesMovements = contourMovements.concat();

			for ( let h = 0, hl = holes.length; h < hl; h ++ ) {

				const ahole = holes[ h ];

				oneHoleMovements = [];

				for ( let i = 0, il = ahole.length, j = il - 1, k = i + 1; i < il; i ++, j ++, k ++ ) {

					if ( j === il ) j = 0;
					if ( k === il ) k = 0;

					//  (j)---(i)---(k)
					oneHoleMovements[ i ] = getBevelVec( ahole[ i ], ahole[ j ], ahole[ k ] );

				}

				holesMovements.push( oneHoleMovements );
				verticesMovements = verticesMovements.concat( oneHoleMovements );

			}


			// Loop bevelSegments, 1 for the front, 1 for the back

			for ( let b = 0; b < bevelSegments; b ++ ) {

				//for ( b = bevelSegments; b > 0; b -- ) {

				const t = b / bevelSegments;
				const z = bevelThickness * Math.cos( t * Math.PI / 2 );
				const bs = bevelSize * Math.sin( t * Math.PI / 2 ) + bevelOffset;

				// contract shape

				for ( let i = 0, il = contour.length; i < il; i ++ ) {

					const vert = scalePt2( contour[ i ], contourMovements[ i ], bs );

					v( vert.x, vert.y, - z );

				}

				// expand holes

				for ( let h = 0, hl = holes.length; h < hl; h ++ ) {

					const ahole = holes[ h ];
					oneHoleMovements = holesMovements[ h ];

					for ( let i = 0, il = ahole.length; i < il; i ++ ) {

						const vert = scalePt2( ahole[ i ], oneHoleMovements[ i ], bs );

						v( vert.x, vert.y, - z );

					}

				}

			}

			const bs = bevelSize + bevelOffset;

			// Back facing vertices

			for ( let i = 0; i < vlen; i ++ ) {

				const vert = bevelEnabled ? scalePt2( vertices[ i ], verticesMovements[ i ], bs ) : vertices[ i ];

				if ( ! extrudeByPath ) {

					v( vert.x, vert.y, 0 );

				} else {

					// v( vert.x, vert.y + extrudePts[ 0 ].y, extrudePts[ 0 ].x );

					normal.copy( splineTube.normals[ 0 ] ).multiplyScalar( vert.x );
					binormal.copy( splineTube.binormals[ 0 ] ).multiplyScalar( vert.y );

					position2.copy( extrudePts[ 0 ] ).add( normal ).add( binormal );

					v( position2.x, position2.y, position2.z );

				}

			}

			// Add stepped vertices...
			// Including front facing vertices

			for ( let s = 1; s <= steps; s ++ ) {

				for ( let i = 0; i < vlen; i ++ ) {

					const vert = bevelEnabled ? scalePt2( vertices[ i ], verticesMovements[ i ], bs ) : vertices[ i ];

					if ( ! extrudeByPath ) {

						v( vert.x, vert.y, depth / steps * s );

					} else {

						// v( vert.x, vert.y + extrudePts[ s - 1 ].y, extrudePts[ s - 1 ].x );

						normal.copy( splineTube.normals[ s ] ).multiplyScalar( vert.x );
						binormal.copy( splineTube.binormals[ s ] ).multiplyScalar( vert.y );

						position2.copy( extrudePts[ s ] ).add( normal ).add( binormal );

						v( position2.x, position2.y, position2.z );

					}

				}

			}


			// Add bevel segments planes

			//for ( b = 1; b <= bevelSegments; b ++ ) {
			for ( let b = bevelSegments - 1; b >= 0; b -- ) {

				const t = b / bevelSegments;
				const z = bevelThickness * Math.cos( t * Math.PI / 2 );
				const bs = bevelSize * Math.sin( t * Math.PI / 2 ) + bevelOffset;

				// contract shape

				for ( let i = 0, il = contour.length; i < il; i ++ ) {

					const vert = scalePt2( contour[ i ], contourMovements[ i ], bs );
					v( vert.x, vert.y, depth + z );

				}

				// expand holes

				for ( let h = 0, hl = holes.length; h < hl; h ++ ) {

					const ahole = holes[ h ];
					oneHoleMovements = holesMovements[ h ];

					for ( let i = 0, il = ahole.length; i < il; i ++ ) {

						const vert = scalePt2( ahole[ i ], oneHoleMovements[ i ], bs );

						if ( ! extrudeByPath ) {

							v( vert.x, vert.y, depth + z );

						} else {

							v( vert.x, vert.y + extrudePts[ steps - 1 ].y, extrudePts[ steps - 1 ].x + z );

						}

					}

				}

			}

			/* Faces */

			// Top and bottom faces

			buildLidFaces();

			// Sides faces

			buildSideFaces();


			/////  Internal functions

			function buildLidFaces() {

				const start = verticesArray.length / 3;

				if ( bevelEnabled ) {

					let layer = 0; // steps + 1
					let offset = vlen * layer;

					// Bottom faces

					for ( let i = 0; i < flen; i ++ ) {

						const face = faces[ i ];
						f3( face[ 2 ] + offset, face[ 1 ] + offset, face[ 0 ] + offset );

					}

					layer = steps + bevelSegments * 2;
					offset = vlen * layer;

					// Top faces

					for ( let i = 0; i < flen; i ++ ) {

						const face = faces[ i ];
						f3( face[ 0 ] + offset, face[ 1 ] + offset, face[ 2 ] + offset );

					}

				} else {

					// Bottom faces

					for ( let i = 0; i < flen; i ++ ) {

						const face = faces[ i ];
						f3( face[ 2 ], face[ 1 ], face[ 0 ] );

					}

					// Top faces

					for ( let i = 0; i < flen; i ++ ) {

						const face = faces[ i ];
						f3( face[ 0 ] + vlen * steps, face[ 1 ] + vlen * steps, face[ 2 ] + vlen * steps );

					}

				}

				scope.addGroup( start, verticesArray.length / 3 - start, 0 );

			}

			// Create faces for the z-sides of the shape

			function buildSideFaces() {

				const start = verticesArray.length / 3;
				let layeroffset = 0;
				sidewalls( contour, layeroffset );
				layeroffset += contour.length;

				for ( let h = 0, hl = holes.length; h < hl; h ++ ) {

					const ahole = holes[ h ];
					sidewalls( ahole, layeroffset );

					//, true
					layeroffset += ahole.length;

				}


				scope.addGroup( start, verticesArray.length / 3 - start, 1 );


			}

			function sidewalls( contour, layeroffset ) {

				let i = contour.length;

				while ( -- i >= 0 ) {

					const j = i;
					let k = i - 1;
					if ( k < 0 ) k = contour.length - 1;

					//console.log('b', i,j, i-1, k,vertices.length);

					for ( let s = 0, sl = ( steps + bevelSegments * 2 ); s < sl; s ++ ) {

						const slen1 = vlen * s;
						const slen2 = vlen * ( s + 1 );

						const a = layeroffset + j + slen1,
							b = layeroffset + k + slen1,
							c = layeroffset + k + slen2,
							d = layeroffset + j + slen2;

						f4( a, b, c, d );

					}

				}

			}

			function v( x, y, z ) {

				placeholder.push( x );
				placeholder.push( y );
				placeholder.push( z );

			}


			function f3( a, b, c ) {

				addVertex( a );
				addVertex( b );
				addVertex( c );

				const nextIndex = verticesArray.length / 3;
				const uvs = uvgen.generateTopUV( scope, verticesArray, nextIndex - 3, nextIndex - 2, nextIndex - 1 );

				addUV( uvs[ 0 ] );
				addUV( uvs[ 1 ] );
				addUV( uvs[ 2 ] );

			}

			function f4( a, b, c, d ) {

				addVertex( a );
				addVertex( b );
				addVertex( d );

				addVertex( b );
				addVertex( c );
				addVertex( d );


				const nextIndex = verticesArray.length / 3;
				const uvs = uvgen.generateSideWallUV( scope, verticesArray, nextIndex - 6, nextIndex - 3, nextIndex - 2, nextIndex - 1 );

				addUV( uvs[ 0 ] );
				addUV( uvs[ 1 ] );
				addUV( uvs[ 3 ] );

				addUV( uvs[ 1 ] );
				addUV( uvs[ 2 ] );
				addUV( uvs[ 3 ] );

			}

			function addVertex( index ) {

				verticesArray.push( placeholder[ index * 3 + 0 ] );
				verticesArray.push( placeholder[ index * 3 + 1 ] );
				verticesArray.push( placeholder[ index * 3 + 2 ] );

			}


			function addUV( vector2 ) {

				uvArray.push( vector2.x );
				uvArray.push( vector2.y );

			}

		}

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		const shapes = this.parameters.shapes;
		const options = this.parameters.options;

		return toJSON$1( shapes, options, data );

	}

	static fromJSON( data, shapes ) {

		const geometryShapes = [];

		for ( let j = 0, jl = data.shapes.length; j < jl; j ++ ) {

			const shape = shapes[ data.shapes[ j ] ];

			geometryShapes.push( shape );

		}

		const extrudePath = data.options.extrudePath;

		if ( extrudePath !== undefined ) {

			data.options.extrudePath = new Curves[ extrudePath.type ]().fromJSON( extrudePath );

		}

		return new ExtrudeGeometry( geometryShapes, data.options );

	}

}

const WorldUVGenerator = {

	generateTopUV: function ( geometry, vertices, indexA, indexB, indexC ) {

		const a_x = vertices[ indexA * 3 ];
		const a_y = vertices[ indexA * 3 + 1 ];
		const b_x = vertices[ indexB * 3 ];
		const b_y = vertices[ indexB * 3 + 1 ];
		const c_x = vertices[ indexC * 3 ];
		const c_y = vertices[ indexC * 3 + 1 ];

		return [
			new Vector2( a_x, a_y ),
			new Vector2( b_x, b_y ),
			new Vector2( c_x, c_y )
		];

	},

	generateSideWallUV: function ( geometry, vertices, indexA, indexB, indexC, indexD ) {

		const a_x = vertices[ indexA * 3 ];
		const a_y = vertices[ indexA * 3 + 1 ];
		const a_z = vertices[ indexA * 3 + 2 ];
		const b_x = vertices[ indexB * 3 ];
		const b_y = vertices[ indexB * 3 + 1 ];
		const b_z = vertices[ indexB * 3 + 2 ];
		const c_x = vertices[ indexC * 3 ];
		const c_y = vertices[ indexC * 3 + 1 ];
		const c_z = vertices[ indexC * 3 + 2 ];
		const d_x = vertices[ indexD * 3 ];
		const d_y = vertices[ indexD * 3 + 1 ];
		const d_z = vertices[ indexD * 3 + 2 ];

		if ( Math.abs( a_y - b_y ) < Math.abs( a_x - b_x ) ) {

			return [
				new Vector2( a_x, 1 - a_z ),
				new Vector2( b_x, 1 - b_z ),
				new Vector2( c_x, 1 - c_z ),
				new Vector2( d_x, 1 - d_z )
			];

		} else {

			return [
				new Vector2( a_y, 1 - a_z ),
				new Vector2( b_y, 1 - b_z ),
				new Vector2( c_y, 1 - c_z ),
				new Vector2( d_y, 1 - d_z )
			];

		}

	}

};

function toJSON$1( shapes, options, data ) {

	data.shapes = [];

	if ( Array.isArray( shapes ) ) {

		for ( let i = 0, l = shapes.length; i < l; i ++ ) {

			const shape = shapes[ i ];

			data.shapes.push( shape.uuid );

		}

	} else {

		data.shapes.push( shapes.uuid );

	}

	data.options = Object.assign( {}, options );

	if ( options.extrudePath !== undefined ) data.options.extrudePath = options.extrudePath.toJSON();

	return data;

}

class IcosahedronGeometry extends PolyhedronGeometry {

	constructor( radius = 1, detail = 0 ) {

		const t = ( 1 + Math.sqrt( 5 ) ) / 2;

		const vertices = [
			- 1, t, 0, 	1, t, 0, 	- 1, - t, 0, 	1, - t, 0,
			0, - 1, t, 	0, 1, t,	0, - 1, - t, 	0, 1, - t,
			t, 0, - 1, 	t, 0, 1, 	- t, 0, - 1, 	- t, 0, 1
		];

		const indices = [
			0, 11, 5, 	0, 5, 1, 	0, 1, 7, 	0, 7, 10, 	0, 10, 11,
			1, 5, 9, 	5, 11, 4,	11, 10, 2,	10, 7, 6,	7, 1, 8,
			3, 9, 4, 	3, 4, 2,	3, 2, 6,	3, 6, 8,	3, 8, 9,
			4, 9, 5, 	2, 4, 11,	6, 2, 10,	8, 6, 7,	9, 8, 1
		];

		super( vertices, indices, radius, detail );

		this.type = 'IcosahedronGeometry';

		this.parameters = {
			radius: radius,
			detail: detail
		};

	}

	static fromJSON( data ) {

		return new IcosahedronGeometry( data.radius, data.detail );

	}

}

class OctahedronGeometry extends PolyhedronGeometry {

	constructor( radius = 1, detail = 0 ) {

		const vertices = [
			1, 0, 0, 	- 1, 0, 0,	0, 1, 0,
			0, - 1, 0, 	0, 0, 1,	0, 0, - 1
		];

		const indices = [
			0, 2, 4,	0, 4, 3,	0, 3, 5,
			0, 5, 2,	1, 2, 5,	1, 5, 3,
			1, 3, 4,	1, 4, 2
		];

		super( vertices, indices, radius, detail );

		this.type = 'OctahedronGeometry';

		this.parameters = {
			radius: radius,
			detail: detail
		};

	}

	static fromJSON( data ) {

		return new OctahedronGeometry( data.radius, data.detail );

	}

}

class PlaneGeometry extends BufferGeometry {

	constructor( width = 1, height = 1, widthSegments = 1, heightSegments = 1 ) {

		super();

		this.type = 'PlaneGeometry';

		this.parameters = {
			width: width,
			height: height,
			widthSegments: widthSegments,
			heightSegments: heightSegments
		};

		const width_half = width / 2;
		const height_half = height / 2;

		const gridX = Math.floor( widthSegments );
		const gridY = Math.floor( heightSegments );

		const gridX1 = gridX + 1;
		const gridY1 = gridY + 1;

		const segment_width = width / gridX;
		const segment_height = height / gridY;

		//

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		for ( let iy = 0; iy < gridY1; iy ++ ) {

			const y = iy * segment_height - height_half;

			for ( let ix = 0; ix < gridX1; ix ++ ) {

				const x = ix * segment_width - width_half;

				vertices.push( x, - y, 0 );

				normals.push( 0, 0, 1 );

				uvs.push( ix / gridX );
				uvs.push( 1 - ( iy / gridY ) );

			}

		}

		for ( let iy = 0; iy < gridY; iy ++ ) {

			for ( let ix = 0; ix < gridX; ix ++ ) {

				const a = ix + gridX1 * iy;
				const b = ix + gridX1 * ( iy + 1 );
				const c = ( ix + 1 ) + gridX1 * ( iy + 1 );
				const d = ( ix + 1 ) + gridX1 * iy;

				indices.push( a, b, d );
				indices.push( b, c, d );

			}

		}

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	static fromJSON( data ) {

		return new PlaneGeometry( data.width, data.height, data.widthSegments, data.heightSegments );

	}

}

class RingGeometry extends BufferGeometry {

	constructor( innerRadius = 0.5, outerRadius = 1, thetaSegments = 32, phiSegments = 1, thetaStart = 0, thetaLength = Math.PI * 2 ) {

		super();

		this.type = 'RingGeometry';

		this.parameters = {
			innerRadius: innerRadius,
			outerRadius: outerRadius,
			thetaSegments: thetaSegments,
			phiSegments: phiSegments,
			thetaStart: thetaStart,
			thetaLength: thetaLength
		};

		thetaSegments = Math.max( 3, thetaSegments );
		phiSegments = Math.max( 1, phiSegments );

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// some helper variables

		let radius = innerRadius;
		const radiusStep = ( ( outerRadius - innerRadius ) / phiSegments );
		const vertex = new Vector3();
		const uv = new Vector2();

		// generate vertices, normals and uvs

		for ( let j = 0; j <= phiSegments; j ++ ) {

			for ( let i = 0; i <= thetaSegments; i ++ ) {

				// values are generate from the inside of the ring to the outside

				const segment = thetaStart + i / thetaSegments * thetaLength;

				// vertex

				vertex.x = radius * Math.cos( segment );
				vertex.y = radius * Math.sin( segment );

				vertices.push( vertex.x, vertex.y, vertex.z );

				// normal

				normals.push( 0, 0, 1 );

				// uv

				uv.x = ( vertex.x / outerRadius + 1 ) / 2;
				uv.y = ( vertex.y / outerRadius + 1 ) / 2;

				uvs.push( uv.x, uv.y );

			}

			// increase the radius for next row of vertices

			radius += radiusStep;

		}

		// indices

		for ( let j = 0; j < phiSegments; j ++ ) {

			const thetaSegmentLevel = j * ( thetaSegments + 1 );

			for ( let i = 0; i < thetaSegments; i ++ ) {

				const segment = i + thetaSegmentLevel;

				const a = segment;
				const b = segment + thetaSegments + 1;
				const c = segment + thetaSegments + 2;
				const d = segment + 1;

				// faces

				indices.push( a, b, d );
				indices.push( b, c, d );

			}

		}

		// build geometry

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	static fromJSON( data ) {

		return new RingGeometry( data.innerRadius, data.outerRadius, data.thetaSegments, data.phiSegments, data.thetaStart, data.thetaLength );

	}

}

class ShapeGeometry extends BufferGeometry {

	constructor( shapes = new Shape( [ new Vector2( 0, 0.5 ), new Vector2( - 0.5, - 0.5 ), new Vector2( 0.5, - 0.5 ) ] ), curveSegments = 12 ) {

		super();

		this.type = 'ShapeGeometry';

		this.parameters = {
			shapes: shapes,
			curveSegments: curveSegments
		};

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// helper variables

		let groupStart = 0;
		let groupCount = 0;

		// allow single and array values for "shapes" parameter

		if ( Array.isArray( shapes ) === false ) {

			addShape( shapes );

		} else {

			for ( let i = 0; i < shapes.length; i ++ ) {

				addShape( shapes[ i ] );

				this.addGroup( groupStart, groupCount, i ); // enables MultiMaterial support

				groupStart += groupCount;
				groupCount = 0;

			}

		}

		// build geometry

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );


		// helper functions

		function addShape( shape ) {

			const indexOffset = vertices.length / 3;
			const points = shape.extractPoints( curveSegments );

			let shapeVertices = points.shape;
			const shapeHoles = points.holes;

			// check direction of vertices

			if ( ShapeUtils.isClockWise( shapeVertices ) === false ) {

				shapeVertices = shapeVertices.reverse();

			}

			for ( let i = 0, l = shapeHoles.length; i < l; i ++ ) {

				const shapeHole = shapeHoles[ i ];

				if ( ShapeUtils.isClockWise( shapeHole ) === true ) {

					shapeHoles[ i ] = shapeHole.reverse();

				}

			}

			const faces = ShapeUtils.triangulateShape( shapeVertices, shapeHoles );

			// join vertices of inner and outer paths to a single array

			for ( let i = 0, l = shapeHoles.length; i < l; i ++ ) {

				const shapeHole = shapeHoles[ i ];
				shapeVertices = shapeVertices.concat( shapeHole );

			}

			// vertices, normals, uvs

			for ( let i = 0, l = shapeVertices.length; i < l; i ++ ) {

				const vertex = shapeVertices[ i ];

				vertices.push( vertex.x, vertex.y, 0 );
				normals.push( 0, 0, 1 );
				uvs.push( vertex.x, vertex.y ); // world uvs

			}

			// indices

			for ( let i = 0, l = faces.length; i < l; i ++ ) {

				const face = faces[ i ];

				const a = face[ 0 ] + indexOffset;
				const b = face[ 1 ] + indexOffset;
				const c = face[ 2 ] + indexOffset;

				indices.push( a, b, c );
				groupCount += 3;

			}

		}

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		const shapes = this.parameters.shapes;

		return toJSON( shapes, data );

	}

	static fromJSON( data, shapes ) {

		const geometryShapes = [];

		for ( let j = 0, jl = data.shapes.length; j < jl; j ++ ) {

			const shape = shapes[ data.shapes[ j ] ];

			geometryShapes.push( shape );

		}

		return new ShapeGeometry( geometryShapes, data.curveSegments );

	}

}

function toJSON( shapes, data ) {

	data.shapes = [];

	if ( Array.isArray( shapes ) ) {

		for ( let i = 0, l = shapes.length; i < l; i ++ ) {

			const shape = shapes[ i ];

			data.shapes.push( shape.uuid );

		}

	} else {

		data.shapes.push( shapes.uuid );

	}

	return data;

}

class SphereGeometry extends BufferGeometry {

	constructor( radius = 1, widthSegments = 32, heightSegments = 16, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI ) {

		super();

		this.type = 'SphereGeometry';

		this.parameters = {
			radius: radius,
			widthSegments: widthSegments,
			heightSegments: heightSegments,
			phiStart: phiStart,
			phiLength: phiLength,
			thetaStart: thetaStart,
			thetaLength: thetaLength
		};

		widthSegments = Math.max( 3, Math.floor( widthSegments ) );
		heightSegments = Math.max( 2, Math.floor( heightSegments ) );

		const thetaEnd = Math.min( thetaStart + thetaLength, Math.PI );

		let index = 0;
		const grid = [];

		const vertex = new Vector3();
		const normal = new Vector3();

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// generate vertices, normals and uvs

		for ( let iy = 0; iy <= heightSegments; iy ++ ) {

			const verticesRow = [];

			const v = iy / heightSegments;

			// special case for the poles

			let uOffset = 0;

			if ( iy === 0 && thetaStart === 0 ) {

				uOffset = 0.5 / widthSegments;

			} else if ( iy === heightSegments && thetaEnd === Math.PI ) {

				uOffset = - 0.5 / widthSegments;

			}

			for ( let ix = 0; ix <= widthSegments; ix ++ ) {

				const u = ix / widthSegments;

				// vertex

				vertex.x = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
				vertex.y = radius * Math.cos( thetaStart + v * thetaLength );
				vertex.z = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );

				vertices.push( vertex.x, vertex.y, vertex.z );

				// normal

				normal.copy( vertex ).normalize();
				normals.push( normal.x, normal.y, normal.z );

				// uv

				uvs.push( u + uOffset, 1 - v );

				verticesRow.push( index ++ );

			}

			grid.push( verticesRow );

		}

		// indices

		for ( let iy = 0; iy < heightSegments; iy ++ ) {

			for ( let ix = 0; ix < widthSegments; ix ++ ) {

				const a = grid[ iy ][ ix + 1 ];
				const b = grid[ iy ][ ix ];
				const c = grid[ iy + 1 ][ ix ];
				const d = grid[ iy + 1 ][ ix + 1 ];

				if ( iy !== 0 || thetaStart > 0 ) indices.push( a, b, d );
				if ( iy !== heightSegments - 1 || thetaEnd < Math.PI ) indices.push( b, c, d );

			}

		}

		// build geometry

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	static fromJSON( data ) {

		return new SphereGeometry( data.radius, data.widthSegments, data.heightSegments, data.phiStart, data.phiLength, data.thetaStart, data.thetaLength );

	}

}

class TetrahedronGeometry extends PolyhedronGeometry {

	constructor( radius = 1, detail = 0 ) {

		const vertices = [
			1, 1, 1, 	- 1, - 1, 1, 	- 1, 1, - 1, 	1, - 1, - 1
		];

		const indices = [
			2, 1, 0, 	0, 3, 2,	1, 3, 0,	2, 3, 1
		];

		super( vertices, indices, radius, detail );

		this.type = 'TetrahedronGeometry';

		this.parameters = {
			radius: radius,
			detail: detail
		};

	}

	static fromJSON( data ) {

		return new TetrahedronGeometry( data.radius, data.detail );

	}

}

class TorusGeometry extends BufferGeometry {

	constructor( radius = 1, tube = 0.4, radialSegments = 12, tubularSegments = 48, arc = Math.PI * 2 ) {

		super();

		this.type = 'TorusGeometry';

		this.parameters = {
			radius: radius,
			tube: tube,
			radialSegments: radialSegments,
			tubularSegments: tubularSegments,
			arc: arc
		};

		radialSegments = Math.floor( radialSegments );
		tubularSegments = Math.floor( tubularSegments );

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// helper variables

		const center = new Vector3();
		const vertex = new Vector3();
		const normal = new Vector3();

		// generate vertices, normals and uvs

		for ( let j = 0; j <= radialSegments; j ++ ) {

			for ( let i = 0; i <= tubularSegments; i ++ ) {

				const u = i / tubularSegments * arc;
				const v = j / radialSegments * Math.PI * 2;

				// vertex

				vertex.x = ( radius + tube * Math.cos( v ) ) * Math.cos( u );
				vertex.y = ( radius + tube * Math.cos( v ) ) * Math.sin( u );
				vertex.z = tube * Math.sin( v );

				vertices.push( vertex.x, vertex.y, vertex.z );

				// normal

				center.x = radius * Math.cos( u );
				center.y = radius * Math.sin( u );
				normal.subVectors( vertex, center ).normalize();

				normals.push( normal.x, normal.y, normal.z );

				// uv

				uvs.push( i / tubularSegments );
				uvs.push( j / radialSegments );

			}

		}

		// generate indices

		for ( let j = 1; j <= radialSegments; j ++ ) {

			for ( let i = 1; i <= tubularSegments; i ++ ) {

				// indices

				const a = ( tubularSegments + 1 ) * j + i - 1;
				const b = ( tubularSegments + 1 ) * ( j - 1 ) + i - 1;
				const c = ( tubularSegments + 1 ) * ( j - 1 ) + i;
				const d = ( tubularSegments + 1 ) * j + i;

				// faces

				indices.push( a, b, d );
				indices.push( b, c, d );

			}

		}

		// build geometry

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	static fromJSON( data ) {

		return new TorusGeometry( data.radius, data.tube, data.radialSegments, data.tubularSegments, data.arc );

	}

}

class TorusKnotGeometry extends BufferGeometry {

	constructor( radius = 1, tube = 0.4, tubularSegments = 64, radialSegments = 8, p = 2, q = 3 ) {

		super();

		this.type = 'TorusKnotGeometry';

		this.parameters = {
			radius: radius,
			tube: tube,
			tubularSegments: tubularSegments,
			radialSegments: radialSegments,
			p: p,
			q: q
		};

		tubularSegments = Math.floor( tubularSegments );
		radialSegments = Math.floor( radialSegments );

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// helper variables

		const vertex = new Vector3();
		const normal = new Vector3();

		const P1 = new Vector3();
		const P2 = new Vector3();

		const B = new Vector3();
		const T = new Vector3();
		const N = new Vector3();

		// generate vertices, normals and uvs

		for ( let i = 0; i <= tubularSegments; ++ i ) {

			// the radian "u" is used to calculate the position on the torus curve of the current tubular segment

			const u = i / tubularSegments * p * Math.PI * 2;

			// now we calculate two points. P1 is our current position on the curve, P2 is a little farther ahead.
			// these points are used to create a special "coordinate space", which is necessary to calculate the correct vertex positions

			calculatePositionOnCurve( u, p, q, radius, P1 );
			calculatePositionOnCurve( u + 0.01, p, q, radius, P2 );

			// calculate orthonormal basis

			T.subVectors( P2, P1 );
			N.addVectors( P2, P1 );
			B.crossVectors( T, N );
			N.crossVectors( B, T );

			// normalize B, N. T can be ignored, we don't use it

			B.normalize();
			N.normalize();

			for ( let j = 0; j <= radialSegments; ++ j ) {

				// now calculate the vertices. they are nothing more than an extrusion of the torus curve.
				// because we extrude a shape in the xy-plane, there is no need to calculate a z-value.

				const v = j / radialSegments * Math.PI * 2;
				const cx = - tube * Math.cos( v );
				const cy = tube * Math.sin( v );

				// now calculate the final vertex position.
				// first we orient the extrusion with our basis vectors, then we add it to the current position on the curve

				vertex.x = P1.x + ( cx * N.x + cy * B.x );
				vertex.y = P1.y + ( cx * N.y + cy * B.y );
				vertex.z = P1.z + ( cx * N.z + cy * B.z );

				vertices.push( vertex.x, vertex.y, vertex.z );

				// normal (P1 is always the center/origin of the extrusion, thus we can use it to calculate the normal)

				normal.subVectors( vertex, P1 ).normalize();

				normals.push( normal.x, normal.y, normal.z );

				// uv

				uvs.push( i / tubularSegments );
				uvs.push( j / radialSegments );

			}

		}

		// generate indices

		for ( let j = 1; j <= tubularSegments; j ++ ) {

			for ( let i = 1; i <= radialSegments; i ++ ) {

				// indices

				const a = ( radialSegments + 1 ) * ( j - 1 ) + ( i - 1 );
				const b = ( radialSegments + 1 ) * j + ( i - 1 );
				const c = ( radialSegments + 1 ) * j + i;
				const d = ( radialSegments + 1 ) * ( j - 1 ) + i;

				// faces

				indices.push( a, b, d );
				indices.push( b, c, d );

			}

		}

		// build geometry

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

		// this function calculates the current position on the torus curve

		function calculatePositionOnCurve( u, p, q, radius, position ) {

			const cu = Math.cos( u );
			const su = Math.sin( u );
			const quOverP = q / p * u;
			const cs = Math.cos( quOverP );

			position.x = radius * ( 2 + cs ) * 0.5 * cu;
			position.y = radius * ( 2 + cs ) * su * 0.5;
			position.z = radius * Math.sin( quOverP ) * 0.5;

		}

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	static fromJSON( data ) {

		return new TorusKnotGeometry( data.radius, data.tube, data.tubularSegments, data.radialSegments, data.p, data.q );

	}

}

class TubeGeometry extends BufferGeometry {

	constructor( path = new QuadraticBezierCurve3( new Vector3( - 1, - 1, 0 ), new Vector3( - 1, 1, 0 ), new Vector3( 1, 1, 0 ) ), tubularSegments = 64, radius = 1, radialSegments = 8, closed = false ) {

		super();

		this.type = 'TubeGeometry';

		this.parameters = {
			path: path,
			tubularSegments: tubularSegments,
			radius: radius,
			radialSegments: radialSegments,
			closed: closed
		};

		const frames = path.computeFrenetFrames( tubularSegments, closed );

		// expose internals

		this.tangents = frames.tangents;
		this.normals = frames.normals;
		this.binormals = frames.binormals;

		// helper variables

		const vertex = new Vector3();
		const normal = new Vector3();
		const uv = new Vector2();
		let P = new Vector3();

		// buffer

		const vertices = [];
		const normals = [];
		const uvs = [];
		const indices = [];

		// create buffer data

		generateBufferData();

		// build geometry

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

		// functions

		function generateBufferData() {

			for ( let i = 0; i < tubularSegments; i ++ ) {

				generateSegment( i );

			}

			// if the geometry is not closed, generate the last row of vertices and normals
			// at the regular position on the given path
			//
			// if the geometry is closed, duplicate the first row of vertices and normals (uvs will differ)

			generateSegment( ( closed === false ) ? tubularSegments : 0 );

			// uvs are generated in a separate function.
			// this makes it easy compute correct values for closed geometries

			generateUVs();

			// finally create faces

			generateIndices();

		}

		function generateSegment( i ) {

			// we use getPointAt to sample evenly distributed points from the given path

			P = path.getPointAt( i / tubularSegments, P );

			// retrieve corresponding normal and binormal

			const N = frames.normals[ i ];
			const B = frames.binormals[ i ];

			// generate normals and vertices for the current segment

			for ( let j = 0; j <= radialSegments; j ++ ) {

				const v = j / radialSegments * Math.PI * 2;

				const sin = Math.sin( v );
				const cos = - Math.cos( v );

				// normal

				normal.x = ( cos * N.x + sin * B.x );
				normal.y = ( cos * N.y + sin * B.y );
				normal.z = ( cos * N.z + sin * B.z );
				normal.normalize();

				normals.push( normal.x, normal.y, normal.z );

				// vertex

				vertex.x = P.x + radius * normal.x;
				vertex.y = P.y + radius * normal.y;
				vertex.z = P.z + radius * normal.z;

				vertices.push( vertex.x, vertex.y, vertex.z );

			}

		}

		function generateIndices() {

			for ( let j = 1; j <= tubularSegments; j ++ ) {

				for ( let i = 1; i <= radialSegments; i ++ ) {

					const a = ( radialSegments + 1 ) * ( j - 1 ) + ( i - 1 );
					const b = ( radialSegments + 1 ) * j + ( i - 1 );
					const c = ( radialSegments + 1 ) * j + i;
					const d = ( radialSegments + 1 ) * ( j - 1 ) + i;

					// faces

					indices.push( a, b, d );
					indices.push( b, c, d );

				}

			}

		}

		function generateUVs() {

			for ( let i = 0; i <= tubularSegments; i ++ ) {

				for ( let j = 0; j <= radialSegments; j ++ ) {

					uv.x = i / tubularSegments;
					uv.y = j / radialSegments;

					uvs.push( uv.x, uv.y );

				}

			}

		}

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.path = this.parameters.path.toJSON();

		return data;

	}

	static fromJSON( data ) {

		// This only works for built-in curves (e.g. CatmullRomCurve3).
		// User defined curves or instances of CurvePath will not be deserialized.
		return new TubeGeometry(
			new Curves[ data.path.type ]().fromJSON( data.path ),
			data.tubularSegments,
			data.radius,
			data.radialSegments,
			data.closed
		);

	}

}

class WireframeGeometry extends BufferGeometry {

	constructor( geometry = null ) {

		super();

		this.type = 'WireframeGeometry';

		this.parameters = {
			geometry: geometry
		};

		if ( geometry !== null ) {

			// buffer

			const vertices = [];
			const edges = new Set();

			// helper variables

			const start = new Vector3();
			const end = new Vector3();

			if ( geometry.index !== null ) {

				// indexed BufferGeometry

				const position = geometry.attributes.position;
				const indices = geometry.index;
				let groups = geometry.groups;

				if ( groups.length === 0 ) {

					groups = [ { start: 0, count: indices.count, materialIndex: 0 } ];

				}

				// create a data structure that contains all edges without duplicates

				for ( let o = 0, ol = groups.length; o < ol; ++ o ) {

					const group = groups[ o ];

					const groupStart = group.start;
					const groupCount = group.count;

					for ( let i = groupStart, l = ( groupStart + groupCount ); i < l; i += 3 ) {

						for ( let j = 0; j < 3; j ++ ) {

							const index1 = indices.getX( i + j );
							const index2 = indices.getX( i + ( j + 1 ) % 3 );

							start.fromBufferAttribute( position, index1 );
							end.fromBufferAttribute( position, index2 );

							if ( isUniqueEdge( start, end, edges ) === true ) {

								vertices.push( start.x, start.y, start.z );
								vertices.push( end.x, end.y, end.z );

							}

						}

					}

				}

			} else {

				// non-indexed BufferGeometry

				const position = geometry.attributes.position;

				for ( let i = 0, l = ( position.count / 3 ); i < l; i ++ ) {

					for ( let j = 0; j < 3; j ++ ) {

						// three edges per triangle, an edge is represented as (index1, index2)
						// e.g. the first triangle has the following edges: (0,1),(1,2),(2,0)

						const index1 = 3 * i + j;
						const index2 = 3 * i + ( ( j + 1 ) % 3 );

						start.fromBufferAttribute( position, index1 );
						end.fromBufferAttribute( position, index2 );

						if ( isUniqueEdge( start, end, edges ) === true ) {

							vertices.push( start.x, start.y, start.z );
							vertices.push( end.x, end.y, end.z );

						}

					}

				}

			}

			// build geometry

			this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );

		}

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

}

function isUniqueEdge( start, end, edges ) {

	const hash1 = `${start.x},${start.y},${start.z}-${end.x},${end.y},${end.z}`;
	const hash2 = `${end.x},${end.y},${end.z}-${start.x},${start.y},${start.z}`; // coincident edge

	if ( edges.has( hash1 ) === true || edges.has( hash2 ) === true ) {

		return false;

	} else {

		edges.add( hash1 );
		edges.add( hash2 );
		return true;

	}

}

var Geometries = /*#__PURE__*/Object.freeze({
	__proto__: null,
	BoxGeometry: BoxGeometry,
	CapsuleGeometry: CapsuleGeometry,
	CircleGeometry: CircleGeometry,
	ConeGeometry: ConeGeometry,
	CylinderGeometry: CylinderGeometry,
	DodecahedronGeometry: DodecahedronGeometry,
	EdgesGeometry: EdgesGeometry,
	ExtrudeGeometry: ExtrudeGeometry,
	IcosahedronGeometry: IcosahedronGeometry,
	LatheGeometry: LatheGeometry,
	OctahedronGeometry: OctahedronGeometry,
	PlaneGeometry: PlaneGeometry,
	PolyhedronGeometry: PolyhedronGeometry,
	RingGeometry: RingGeometry,
	ShapeGeometry: ShapeGeometry,
	SphereGeometry: SphereGeometry,
	TetrahedronGeometry: TetrahedronGeometry,
	TorusGeometry: TorusGeometry,
	TorusKnotGeometry: TorusKnotGeometry,
	TubeGeometry: TubeGeometry,
	WireframeGeometry: WireframeGeometry
});

class ShadowMaterial extends Material {

	constructor( parameters ) {

		super();

		this.isShadowMaterial = true;

		this.type = 'ShadowMaterial';

		this.color = new Color( 0x000000 );
		this.transparent = true;

		this.fog = true;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.color.copy( source.color );

		this.fog = source.fog;

		return this;

	}

}

class RawShaderMaterial extends ShaderMaterial {

	constructor( parameters ) {

		super( parameters );

		this.isRawShaderMaterial = true;

		this.type = 'RawShaderMaterial';

	}

}

class MeshStandardMaterial extends Material {

	constructor( parameters ) {

		super();

		this.isMeshStandardMaterial = true;

		this.type = 'MeshStandardMaterial';

		this.defines = { 'STANDARD': '' };

		this.color = new Color( 0xffffff ); // diffuse
		this.roughness = 1.0;
		this.metalness = 0.0;

		this.map = null;

		this.lightMap = null;
		this.lightMapIntensity = 1.0;

		this.aoMap = null;
		this.aoMapIntensity = 1.0;

		this.emissive = new Color( 0x000000 );
		this.emissiveIntensity = 1.0;
		this.emissiveMap = null;

		this.bumpMap = null;
		this.bumpScale = 1;

		this.normalMap = null;
		this.normalMapType = TangentSpaceNormalMap;
		this.normalScale = new Vector2( 1, 1 );

		this.displacementMap = null;
		this.displacementScale = 1;
		this.displacementBias = 0;

		this.roughnessMap = null;

		this.metalnessMap = null;

		this.alphaMap = null;

		this.envMap = null;
		this.envMapRotation = new Euler();
		this.envMapIntensity = 1.0;

		this.wireframe = false;
		this.wireframeLinewidth = 1;
		this.wireframeLinecap = 'round';
		this.wireframeLinejoin = 'round';

		this.flatShading = false;

		this.fog = true;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.defines = { 'STANDARD': '' };

		this.color.copy( source.color );
		this.roughness = source.roughness;
		this.metalness = source.metalness;

		this.map = source.map;

		this.lightMap = source.lightMap;
		this.lightMapIntensity = source.lightMapIntensity;

		this.aoMap = source.aoMap;
		this.aoMapIntensity = source.aoMapIntensity;

		this.emissive.copy( source.emissive );
		this.emissiveMap = source.emissiveMap;
		this.emissiveIntensity = source.emissiveIntensity;

		this.bumpMap = source.bumpMap;
		this.bumpScale = source.bumpScale;

		this.normalMap = source.normalMap;
		this.normalMapType = source.normalMapType;
		this.normalScale.copy( source.normalScale );

		this.displacementMap = source.displacementMap;
		this.displacementScale = source.displacementScale;
		this.displacementBias = source.displacementBias;

		this.roughnessMap = source.roughnessMap;

		this.metalnessMap = source.metalnessMap;

		this.alphaMap = source.alphaMap;

		this.envMap = source.envMap;
		this.envMapRotation.copy( source.envMapRotation );
		this.envMapIntensity = source.envMapIntensity;

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;
		this.wireframeLinecap = source.wireframeLinecap;
		this.wireframeLinejoin = source.wireframeLinejoin;

		this.flatShading = source.flatShading;

		this.fog = source.fog;

		return this;

	}

}

class MeshPhysicalMaterial extends MeshStandardMaterial {

	constructor( parameters ) {

		super();

		this.isMeshPhysicalMaterial = true;

		this.defines = {

			'STANDARD': '',
			'PHYSICAL': ''

		};

		this.type = 'MeshPhysicalMaterial';

		this.anisotropyRotation = 0;
		this.anisotropyMap = null;

		this.clearcoatMap = null;
		this.clearcoatRoughness = 0.0;
		this.clearcoatRoughnessMap = null;
		this.clearcoatNormalScale = new Vector2( 1, 1 );
		this.clearcoatNormalMap = null;

		this.ior = 1.5;

		Object.defineProperty( this, 'reflectivity', {
			get: function () {

				return ( clamp( 2.5 * ( this.ior - 1 ) / ( this.ior + 1 ), 0, 1 ) );

			},
			set: function ( reflectivity ) {

				this.ior = ( 1 + 0.4 * reflectivity ) / ( 1 - 0.4 * reflectivity );

			}
		} );

		this.iridescenceMap = null;
		this.iridescenceIOR = 1.3;
		this.iridescenceThicknessRange = [ 100, 400 ];
		this.iridescenceThicknessMap = null;

		this.sheenColor = new Color( 0x000000 );
		this.sheenColorMap = null;
		this.sheenRoughness = 1.0;
		this.sheenRoughnessMap = null;

		this.transmissionMap = null;

		this.thickness = 0;
		this.thicknessMap = null;
		this.attenuationDistance = Infinity;
		this.attenuationColor = new Color( 1, 1, 1 );

		this.specularIntensity = 1.0;
		this.specularIntensityMap = null;
		this.specularColor = new Color( 1, 1, 1 );
		this.specularColorMap = null;

		this._anisotropy = 0;
		this._clearcoat = 0;
		this._dispersion = 0;
		this._iridescence = 0;
		this._sheen = 0.0;
		this._transmission = 0;

		this.setValues( parameters );

	}

	get anisotropy() {

		return this._anisotropy;

	}

	set anisotropy( value ) {

		if ( this._anisotropy > 0 !== value > 0 ) {

			this.version ++;

		}

		this._anisotropy = value;

	}

	get clearcoat() {

		return this._clearcoat;

	}

	set clearcoat( value ) {

		if ( this._clearcoat > 0 !== value > 0 ) {

			this.version ++;

		}

		this._clearcoat = value;

	}

	get iridescence() {

		return this._iridescence;

	}

	set iridescence( value ) {

		if ( this._iridescence > 0 !== value > 0 ) {

			this.version ++;

		}

		this._iridescence = value;

	}

	get dispersion() {

		return this._dispersion;

	}

	set dispersion( value ) {

		if ( this._dispersion > 0 !== value > 0 ) {

			this.version ++;

		}

		this._dispersion = value;

	}

	get sheen() {

		return this._sheen;

	}

	set sheen( value ) {

		if ( this._sheen > 0 !== value > 0 ) {

			this.version ++;

		}

		this._sheen = value;

	}

	get transmission() {

		return this._transmission;

	}

	set transmission( value ) {

		if ( this._transmission > 0 !== value > 0 ) {

			this.version ++;

		}

		this._transmission = value;

	}

	copy( source ) {

		super.copy( source );

		this.defines = {

			'STANDARD': '',
			'PHYSICAL': ''

		};

		this.anisotropy = source.anisotropy;
		this.anisotropyRotation = source.anisotropyRotation;
		this.anisotropyMap = source.anisotropyMap;

		this.clearcoat = source.clearcoat;
		this.clearcoatMap = source.clearcoatMap;
		this.clearcoatRoughness = source.clearcoatRoughness;
		this.clearcoatRoughnessMap = source.clearcoatRoughnessMap;
		this.clearcoatNormalMap = source.clearcoatNormalMap;
		this.clearcoatNormalScale.copy( source.clearcoatNormalScale );

		this.dispersion = source.dispersion;
		this.ior = source.ior;

		this.iridescence = source.iridescence;
		this.iridescenceMap = source.iridescenceMap;
		this.iridescenceIOR = source.iridescenceIOR;
		this.iridescenceThicknessRange = [ ...source.iridescenceThicknessRange ];
		this.iridescenceThicknessMap = source.iridescenceThicknessMap;

		this.sheen = source.sheen;
		this.sheenColor.copy( source.sheenColor );
		this.sheenColorMap = source.sheenColorMap;
		this.sheenRoughness = source.sheenRoughness;
		this.sheenRoughnessMap = source.sheenRoughnessMap;

		this.transmission = source.transmission;
		this.transmissionMap = source.transmissionMap;

		this.thickness = source.thickness;
		this.thicknessMap = source.thicknessMap;
		this.attenuationDistance = source.attenuationDistance;
		this.attenuationColor.copy( source.attenuationColor );

		this.specularIntensity = source.specularIntensity;
		this.specularIntensityMap = source.specularIntensityMap;
		this.specularColor.copy( source.specularColor );
		this.specularColorMap = source.specularColorMap;

		return this;

	}

}

class MeshPhongMaterial extends Material {

	constructor( parameters ) {

		super();

		this.isMeshPhongMaterial = true;

		this.type = 'MeshPhongMaterial';

		this.color = new Color( 0xffffff ); // diffuse
		this.specular = new Color( 0x111111 );
		this.shininess = 30;

		this.map = null;

		this.lightMap = null;
		this.lightMapIntensity = 1.0;

		this.aoMap = null;
		this.aoMapIntensity = 1.0;

		this.emissive = new Color( 0x000000 );
		this.emissiveIntensity = 1.0;
		this.emissiveMap = null;

		this.bumpMap = null;
		this.bumpScale = 1;

		this.normalMap = null;
		this.normalMapType = TangentSpaceNormalMap;
		this.normalScale = new Vector2( 1, 1 );

		this.displacementMap = null;
		this.displacementScale = 1;
		this.displacementBias = 0;

		this.specularMap = null;

		this.alphaMap = null;

		this.envMap = null;
		this.envMapRotation = new Euler();

		this.combine = MultiplyOperation;
		this.reflectivity = 1;
		this.refractionRatio = 0.98;

		this.wireframe = false;
		this.wireframeLinewidth = 1;
		this.wireframeLinecap = 'round';
		this.wireframeLinejoin = 'round';

		this.flatShading = false;

		this.fog = true;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.color.copy( source.color );
		this.specular.copy( source.specular );
		this.shininess = source.shininess;

		this.map = source.map;

		this.lightMap = source.lightMap;
		this.lightMapIntensity = source.lightMapIntensity;

		this.aoMap = source.aoMap;
		this.aoMapIntensity = source.aoMapIntensity;

		this.emissive.copy( source.emissive );
		this.emissiveMap = source.emissiveMap;
		this.emissiveIntensity = source.emissiveIntensity;

		this.bumpMap = source.bumpMap;
		this.bumpScale = source.bumpScale;

		this.normalMap = source.normalMap;
		this.normalMapType = source.normalMapType;
		this.normalScale.copy( source.normalScale );

		this.displacementMap = source.displacementMap;
		this.displacementScale = source.displacementScale;
		this.displacementBias = source.displacementBias;

		this.specularMap = source.specularMap;

		this.alphaMap = source.alphaMap;

		this.envMap = source.envMap;
		this.envMapRotation.copy( source.envMapRotation );
		this.combine = source.combine;
		this.reflectivity = source.reflectivity;
		this.refractionRatio = source.refractionRatio;

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;
		this.wireframeLinecap = source.wireframeLinecap;
		this.wireframeLinejoin = source.wireframeLinejoin;

		this.flatShading = source.flatShading;

		this.fog = source.fog;

		return this;

	}

}

class MeshToonMaterial extends Material {

	constructor( parameters ) {

		super();

		this.isMeshToonMaterial = true;

		this.defines = { 'TOON': '' };

		this.type = 'MeshToonMaterial';

		this.color = new Color( 0xffffff );

		this.map = null;
		this.gradientMap = null;

		this.lightMap = null;
		this.lightMapIntensity = 1.0;

		this.aoMap = null;
		this.aoMapIntensity = 1.0;

		this.emissive = new Color( 0x000000 );
		this.emissiveIntensity = 1.0;
		this.emissiveMap = null;

		this.bumpMap = null;
		this.bumpScale = 1;

		this.normalMap = null;
		this.normalMapType = TangentSpaceNormalMap;
		this.normalScale = new Vector2( 1, 1 );

		this.displacementMap = null;
		this.displacementScale = 1;
		this.displacementBias = 0;

		this.alphaMap = null;

		this.wireframe = false;
		this.wireframeLinewidth = 1;
		this.wireframeLinecap = 'round';
		this.wireframeLinejoin = 'round';

		this.fog = true;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.color.copy( source.color );

		this.map = source.map;
		this.gradientMap = source.gradientMap;

		this.lightMap = source.lightMap;
		this.lightMapIntensity = source.lightMapIntensity;

		this.aoMap = source.aoMap;
		this.aoMapIntensity = source.aoMapIntensity;

		this.emissive.copy( source.emissive );
		this.emissiveMap = source.emissiveMap;
		this.emissiveIntensity = source.emissiveIntensity;

		this.bumpMap = source.bumpMap;
		this.bumpScale = source.bumpScale;

		this.normalMap = source.normalMap;
		this.normalMapType = source.normalMapType;
		this.normalScale.copy( source.normalScale );

		this.displacementMap = source.displacementMap;
		this.displacementScale = source.displacementScale;
		this.displacementBias = source.displacementBias;

		this.alphaMap = source.alphaMap;

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;
		this.wireframeLinecap = source.wireframeLinecap;
		this.wireframeLinejoin = source.wireframeLinejoin;

		this.fog = source.fog;

		return this;

	}

}

class MeshNormalMaterial extends Material {

	constructor( parameters ) {

		super();

		this.isMeshNormalMaterial = true;

		this.type = 'MeshNormalMaterial';

		this.bumpMap = null;
		this.bumpScale = 1;

		this.normalMap = null;
		this.normalMapType = TangentSpaceNormalMap;
		this.normalScale = new Vector2( 1, 1 );

		this.displacementMap = null;
		this.displacementScale = 1;
		this.displacementBias = 0;

		this.wireframe = false;
		this.wireframeLinewidth = 1;

		this.flatShading = false;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.bumpMap = source.bumpMap;
		this.bumpScale = source.bumpScale;

		this.normalMap = source.normalMap;
		this.normalMapType = source.normalMapType;
		this.normalScale.copy( source.normalScale );

		this.displacementMap = source.displacementMap;
		this.displacementScale = source.displacementScale;
		this.displacementBias = source.displacementBias;

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;

		this.flatShading = source.flatShading;

		return this;

	}

}

class MeshLambertMaterial extends Material {

	constructor( parameters ) {

		super();

		this.isMeshLambertMaterial = true;

		this.type = 'MeshLambertMaterial';

		this.color = new Color( 0xffffff ); // diffuse

		this.map = null;

		this.lightMap = null;
		this.lightMapIntensity = 1.0;

		this.aoMap = null;
		this.aoMapIntensity = 1.0;

		this.emissive = new Color( 0x000000 );
		this.emissiveIntensity = 1.0;
		this.emissiveMap = null;

		this.bumpMap = null;
		this.bumpScale = 1;

		this.normalMap = null;
		this.normalMapType = TangentSpaceNormalMap;
		this.normalScale = new Vector2( 1, 1 );

		this.displacementMap = null;
		this.displacementScale = 1;
		this.displacementBias = 0;

		this.specularMap = null;

		this.alphaMap = null;

		this.envMap = null;
		this.envMapRotation = new Euler();
		this.combine = MultiplyOperation;
		this.reflectivity = 1;
		this.refractionRatio = 0.98;

		this.wireframe = false;
		this.wireframeLinewidth = 1;
		this.wireframeLinecap = 'round';
		this.wireframeLinejoin = 'round';

		this.flatShading = false;

		this.fog = true;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.color.copy( source.color );

		this.map = source.map;

		this.lightMap = source.lightMap;
		this.lightMapIntensity = source.lightMapIntensity;

		this.aoMap = source.aoMap;
		this.aoMapIntensity = source.aoMapIntensity;

		this.emissive.copy( source.emissive );
		this.emissiveMap = source.emissiveMap;
		this.emissiveIntensity = source.emissiveIntensity;

		this.bumpMap = source.bumpMap;
		this.bumpScale = source.bumpScale;

		this.normalMap = source.normalMap;
		this.normalMapType = source.normalMapType;
		this.normalScale.copy( source.normalScale );

		this.displacementMap = source.displacementMap;
		this.displacementScale = source.displacementScale;
		this.displacementBias = source.displacementBias;

		this.specularMap = source.specularMap;

		this.alphaMap = source.alphaMap;

		this.envMap = source.envMap;
		this.envMapRotation.copy( source.envMapRotation );
		this.combine = source.combine;
		this.reflectivity = source.reflectivity;
		this.refractionRatio = source.refractionRatio;

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;
		this.wireframeLinecap = source.wireframeLinecap;
		this.wireframeLinejoin = source.wireframeLinejoin;

		this.flatShading = source.flatShading;

		this.fog = source.fog;

		return this;

	}

}

class MeshDepthMaterial extends Material {

	constructor( parameters ) {

		super();

		this.isMeshDepthMaterial = true;

		this.type = 'MeshDepthMaterial';

		this.depthPacking = BasicDepthPacking;

		this.map = null;

		this.alphaMap = null;

		this.displacementMap = null;
		this.displacementScale = 1;
		this.displacementBias = 0;

		this.wireframe = false;
		this.wireframeLinewidth = 1;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.depthPacking = source.depthPacking;

		this.map = source.map;

		this.alphaMap = source.alphaMap;

		this.displacementMap = source.displacementMap;
		this.displacementScale = source.displacementScale;
		this.displacementBias = source.displacementBias;

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;

		return this;

	}

}

class MeshDistanceMaterial extends Material {

	constructor( parameters ) {

		super();

		this.isMeshDistanceMaterial = true;

		this.type = 'MeshDistanceMaterial';

		this.map = null;

		this.alphaMap = null;

		this.displacementMap = null;
		this.displacementScale = 1;
		this.displacementBias = 0;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.map = source.map;

		this.alphaMap = source.alphaMap;

		this.displacementMap = source.displacementMap;
		this.displacementScale = source.displacementScale;
		this.displacementBias = source.displacementBias;

		return this;

	}

}

class MeshMatcapMaterial extends Material {

	constructor( parameters ) {

		super();

		this.isMeshMatcapMaterial = true;

		this.defines = { 'MATCAP': '' };

		this.type = 'MeshMatcapMaterial';

		this.color = new Color( 0xffffff ); // diffuse

		this.matcap = null;

		this.map = null;

		this.bumpMap = null;
		this.bumpScale = 1;

		this.normalMap = null;
		this.normalMapType = TangentSpaceNormalMap;
		this.normalScale = new Vector2( 1, 1 );

		this.displacementMap = null;
		this.displacementScale = 1;
		this.displacementBias = 0;

		this.alphaMap = null;

		this.flatShading = false;

		this.fog = true;

		this.setValues( parameters );

	}


	copy( source ) {

		super.copy( source );

		this.defines = { 'MATCAP': '' };

		this.color.copy( source.color );

		this.matcap = source.matcap;

		this.map = source.map;

		this.bumpMap = source.bumpMap;
		this.bumpScale = source.bumpScale;

		this.normalMap = source.normalMap;
		this.normalMapType = source.normalMapType;
		this.normalScale.copy( source.normalScale );

		this.displacementMap = source.displacementMap;
		this.displacementScale = source.displacementScale;
		this.displacementBias = source.displacementBias;

		this.alphaMap = source.alphaMap;

		this.flatShading = source.flatShading;

		this.fog = source.fog;

		return this;

	}

}

class LineDashedMaterial extends LineBasicMaterial {

	constructor( parameters ) {

		super();

		this.isLineDashedMaterial = true;
		this.type = 'LineDashedMaterial';

		this.scale = 1;
		this.dashSize = 3;
		this.gapSize = 1;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.scale = source.scale;
		this.dashSize = source.dashSize;
		this.gapSize = source.gapSize;

		return this;

	}

}

// converts an array to a specific type
function convertArray( array, type, forceClone ) {

	if ( ! array || // let 'undefined' and 'null' pass
		! forceClone && array.constructor === type ) return array;

	if ( typeof type.BYTES_PER_ELEMENT === 'number' ) {

		return new type( array ); // create typed array

	}

	return Array.prototype.slice.call( array ); // create Array

}

function isTypedArray( object ) {

	return ArrayBuffer.isView( object ) &&
		! ( object instanceof DataView );

}

// returns an array by which times and values can be sorted
function getKeyframeOrder( times ) {

	function compareTime( i, j ) {

		return times[ i ] - times[ j ];

	}

	const n = times.length;
	const result = new Array( n );
	for ( let i = 0; i !== n; ++ i ) result[ i ] = i;

	result.sort( compareTime );

	return result;

}

// uses the array previously returned by 'getKeyframeOrder' to sort data
function sortedArray( values, stride, order ) {

	const nValues = values.length;
	const result = new values.constructor( nValues );

	for ( let i = 0, dstOffset = 0; dstOffset !== nValues; ++ i ) {

		const srcOffset = order[ i ] * stride;

		for ( let j = 0; j !== stride; ++ j ) {

			result[ dstOffset ++ ] = values[ srcOffset + j ];

		}

	}

	return result;

}

// function for parsing AOS keyframe formats
function flattenJSON( jsonKeys, times, values, valuePropertyName ) {

	let i = 1, key = jsonKeys[ 0 ];

	while ( key !== undefined && key[ valuePropertyName ] === undefined ) {

		key = jsonKeys[ i ++ ];

	}

	if ( key === undefined ) return; // no data

	let value = key[ valuePropertyName ];
	if ( value === undefined ) return; // no data

	if ( Array.isArray( value ) ) {

		do {

			value = key[ valuePropertyName ];

			if ( value !== undefined ) {

				times.push( key.time );
				values.push.apply( values, value ); // push all elements

			}

			key = jsonKeys[ i ++ ];

		} while ( key !== undefined );

	} else if ( value.toArray !== undefined ) {

		// ...assume THREE.Math-ish

		do {

			value = key[ valuePropertyName ];

			if ( value !== undefined ) {

				times.push( key.time );
				value.toArray( values, values.length );

			}

			key = jsonKeys[ i ++ ];

		} while ( key !== undefined );

	} else {

		// otherwise push as-is

		do {

			value = key[ valuePropertyName ];

			if ( value !== undefined ) {

				times.push( key.time );
				values.push( value );

			}

			key = jsonKeys[ i ++ ];

		} while ( key !== undefined );

	}

}

function subclip( sourceClip, name, startFrame, endFrame, fps = 30 ) {

	const clip = sourceClip.clone();

	clip.name = name;

	const tracks = [];

	for ( let i = 0; i < clip.tracks.length; ++ i ) {

		const track = clip.tracks[ i ];
		const valueSize = track.getValueSize();

		const times = [];
		const values = [];

		for ( let j = 0; j < track.times.length; ++ j ) {

			const frame = track.times[ j ] * fps;

			if ( frame < startFrame || frame >= endFrame ) continue;

			times.push( track.times[ j ] );

			for ( let k = 0; k < valueSize; ++ k ) {

				values.push( track.values[ j * valueSize + k ] );

			}

		}

		if ( times.length === 0 ) continue;

		track.times = convertArray( times, track.times.constructor );
		track.values = convertArray( values, track.values.constructor );

		tracks.push( track );

	}

	clip.tracks = tracks;

	// find minimum .times value across all tracks in the trimmed clip

	let minStartTime = Infinity;

	for ( let i = 0; i < clip.tracks.length; ++ i ) {

		if ( minStartTime > clip.tracks[ i ].times[ 0 ] ) {

			minStartTime = clip.tracks[ i ].times[ 0 ];

		}

	}

	// shift all tracks such that clip begins at t=0

	for ( let i = 0; i < clip.tracks.length; ++ i ) {

		clip.tracks[ i ].shift( - 1 * minStartTime );

	}

	clip.resetDuration();

	return clip;

}

function makeClipAdditive( targetClip, referenceFrame = 0, referenceClip = targetClip, fps = 30 ) {

	if ( fps <= 0 ) fps = 30;

	const numTracks = referenceClip.tracks.length;
	const referenceTime = referenceFrame / fps;

	// Make each track's values relative to the values at the reference frame
	for ( let i = 0; i < numTracks; ++ i ) {

		const referenceTrack = referenceClip.tracks[ i ];
		const referenceTrackType = referenceTrack.ValueTypeName;

		// Skip this track if it's non-numeric
		if ( referenceTrackType === 'bool' || referenceTrackType === 'string' ) continue;

		// Find the track in the target clip whose name and type matches the reference track
		const targetTrack = targetClip.tracks.find( function ( track ) {

			return track.name === referenceTrack.name
				&& track.ValueTypeName === referenceTrackType;

		} );

		if ( targetTrack === undefined ) continue;

		let referenceOffset = 0;
		const referenceValueSize = referenceTrack.getValueSize();

		if ( referenceTrack.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline ) {

			referenceOffset = referenceValueSize / 3;

		}

		let targetOffset = 0;
		const targetValueSize = targetTrack.getValueSize();

		if ( targetTrack.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline ) {

			targetOffset = targetValueSize / 3;

		}

		const lastIndex = referenceTrack.times.length - 1;
		let referenceValue;

		// Find the value to subtract out of the track
		if ( referenceTime <= referenceTrack.times[ 0 ] ) {

			// Reference frame is earlier than the first keyframe, so just use the first keyframe
			const startIndex = referenceOffset;
			const endIndex = referenceValueSize - referenceOffset;
			referenceValue = referenceTrack.values.slice( startIndex, endIndex );

		} else if ( referenceTime >= referenceTrack.times[ lastIndex ] ) {

			// Reference frame is after the last keyframe, so just use the last keyframe
			const startIndex = lastIndex * referenceValueSize + referenceOffset;
			const endIndex = startIndex + referenceValueSize - referenceOffset;
			referenceValue = referenceTrack.values.slice( startIndex, endIndex );

		} else {

			// Interpolate to the reference value
			const interpolant = referenceTrack.createInterpolant();
			const startIndex = referenceOffset;
			const endIndex = referenceValueSize - referenceOffset;
			interpolant.evaluate( referenceTime );
			referenceValue = interpolant.resultBuffer.slice( startIndex, endIndex );

		}

		// Conjugate the quaternion
		if ( referenceTrackType === 'quaternion' ) {

			const referenceQuat = new Quaternion().fromArray( referenceValue ).normalize().conjugate();
			referenceQuat.toArray( referenceValue );

		}

		// Subtract the reference value from all of the track values

		const numTimes = targetTrack.times.length;
		for ( let j = 0; j < numTimes; ++ j ) {

			const valueStart = j * targetValueSize + targetOffset;

			if ( referenceTrackType === 'quaternion' ) {

				// Multiply the conjugate for quaternion track types
				Quaternion.multiplyQuaternionsFlat(
					targetTrack.values,
					valueStart,
					referenceValue,
					0,
					targetTrack.values,
					valueStart
				);

			} else {

				const valueEnd = targetValueSize - targetOffset * 2;

				// Subtract each value for all other numeric track types
				for ( let k = 0; k < valueEnd; ++ k ) {

					targetTrack.values[ valueStart + k ] -= referenceValue[ k ];

				}

			}

		}

	}

	targetClip.blendMode = AdditiveAnimationBlendMode;

	return targetClip;

}

const AnimationUtils = {
	convertArray: convertArray,
	isTypedArray: isTypedArray,
	getKeyframeOrder: getKeyframeOrder,
	sortedArray: sortedArray,
	flattenJSON: flattenJSON,
	subclip: subclip,
	makeClipAdditive: makeClipAdditive
};

/**
 * Abstract base class of interpolants over parametric samples.
 *
 * The parameter domain is one dimensional, typically the time or a path
 * along a curve defined by the data.
 *
 * The sample values can have any dimensionality and derived classes may
 * apply special interpretations to the data.
 *
 * This class provides the interval seek in a Template Method, deferring
 * the actual interpolation to derived classes.
 *
 * Time complexity is O(1) for linear access crossing at most two points
 * and O(log N) for random access, where N is the number of positions.
 *
 * References:
 *
 * 		http://www.oodesign.com/template-method-pattern.html
 *
 */

class Interpolant {

	constructor( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

		this.parameterPositions = parameterPositions;
		this._cachedIndex = 0;

		this.resultBuffer = resultBuffer !== undefined ?
			resultBuffer : new sampleValues.constructor( sampleSize );
		this.sampleValues = sampleValues;
		this.valueSize = sampleSize;

		this.settings = null;
		this.DefaultSettings_ = {};

	}

	evaluate( t ) {

		const pp = this.parameterPositions;
		let i1 = this._cachedIndex,
			t1 = pp[ i1 ],
			t0 = pp[ i1 - 1 ];

		validate_interval: {

			seek: {

				let right;

				linear_scan: {

					//- See http://jsperf.com/comparison-to-undefined/3
					//- slower code:
					//-
					//- 				if ( t >= t1 || t1 === undefined ) {
					forward_scan: if ( ! ( t < t1 ) ) {

						for ( let giveUpAt = i1 + 2; ; ) {

							if ( t1 === undefined ) {

								if ( t < t0 ) break forward_scan;

								// after end

								i1 = pp.length;
								this._cachedIndex = i1;
								return this.copySampleValue_( i1 - 1 );

							}

							if ( i1 === giveUpAt ) break; // this loop

							t0 = t1;
							t1 = pp[ ++ i1 ];

							if ( t < t1 ) {

								// we have arrived at the sought interval
								break seek;

							}

						}

						// prepare binary search on the right side of the index
						right = pp.length;
						break linear_scan;

					}

					//- slower code:
					//-					if ( t < t0 || t0 === undefined ) {
					if ( ! ( t >= t0 ) ) {

						// looping?

						const t1global = pp[ 1 ];

						if ( t < t1global ) {

							i1 = 2; // + 1, using the scan for the details
							t0 = t1global;

						}

						// linear reverse scan

						for ( let giveUpAt = i1 - 2; ; ) {

							if ( t0 === undefined ) {

								// before start

								this._cachedIndex = 0;
								return this.copySampleValue_( 0 );

							}

							if ( i1 === giveUpAt ) break; // this loop

							t1 = t0;
							t0 = pp[ -- i1 - 1 ];

							if ( t >= t0 ) {

								// we have arrived at the sought interval
								break seek;

							}

						}

						// prepare binary search on the left side of the index
						right = i1;
						i1 = 0;
						break linear_scan;

					}

					// the interval is valid

					break validate_interval;

				} // linear scan

				// binary search

				while ( i1 < right ) {

					const mid = ( i1 + right ) >>> 1;

					if ( t < pp[ mid ] ) {

						right = mid;

					} else {

						i1 = mid + 1;

					}

				}

				t1 = pp[ i1 ];
				t0 = pp[ i1 - 1 ];

				// check boundary cases, again

				if ( t0 === undefined ) {

					this._cachedIndex = 0;
					return this.copySampleValue_( 0 );

				}

				if ( t1 === undefined ) {

					i1 = pp.length;
					this._cachedIndex = i1;
					return this.copySampleValue_( i1 - 1 );

				}

			} // seek

			this._cachedIndex = i1;

			this.intervalChanged_( i1, t0, t1 );

		} // validate_interval

		return this.interpolate_( i1, t0, t, t1 );

	}

	getSettings_() {

		return this.settings || this.DefaultSettings_;

	}

	copySampleValue_( index ) {

		// copies a sample value to the result buffer

		const result = this.resultBuffer,
			values = this.sampleValues,
			stride = this.valueSize,
			offset = index * stride;

		for ( let i = 0; i !== stride; ++ i ) {

			result[ i ] = values[ offset + i ];

		}

		return result;

	}

	// Template methods for derived classes:

	interpolate_( /* i1, t0, t, t1 */ ) {

		throw new Error( 'call to abstract method' );
		// implementations shall return this.resultBuffer

	}

	intervalChanged_( /* i1, t0, t1 */ ) {

		// empty

	}

}

/**
 * Fast and simple cubic spline interpolant.
 *
 * It was derived from a Hermitian construction setting the first derivative
 * at each sample position to the linear slope between neighboring positions
 * over their parameter interval.
 */

class CubicInterpolant extends Interpolant {

	constructor( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

		super( parameterPositions, sampleValues, sampleSize, resultBuffer );

		this._weightPrev = - 0;
		this._offsetPrev = - 0;
		this._weightNext = - 0;
		this._offsetNext = - 0;

		this.DefaultSettings_ = {

			endingStart: ZeroCurvatureEnding,
			endingEnd: ZeroCurvatureEnding

		};

	}

	intervalChanged_( i1, t0, t1 ) {

		const pp = this.parameterPositions;
		let iPrev = i1 - 2,
			iNext = i1 + 1,

			tPrev = pp[ iPrev ],
			tNext = pp[ iNext ];

		if ( tPrev === undefined ) {

			switch ( this.getSettings_().endingStart ) {

				case ZeroSlopeEnding:

					// f'(t0) = 0
					iPrev = i1;
					tPrev = 2 * t0 - t1;

					break;

				case WrapAroundEnding:

					// use the other end of the curve
					iPrev = pp.length - 2;
					tPrev = t0 + pp[ iPrev ] - pp[ iPrev + 1 ];

					break;

				default: // ZeroCurvatureEnding

					// f''(t0) = 0 a.k.a. Natural Spline
					iPrev = i1;
					tPrev = t1;

			}

		}

		if ( tNext === undefined ) {

			switch ( this.getSettings_().endingEnd ) {

				case ZeroSlopeEnding:

					// f'(tN) = 0
					iNext = i1;
					tNext = 2 * t1 - t0;

					break;

				case WrapAroundEnding:

					// use the other end of the curve
					iNext = 1;
					tNext = t1 + pp[ 1 ] - pp[ 0 ];

					break;

				default: // ZeroCurvatureEnding

					// f''(tN) = 0, a.k.a. Natural Spline
					iNext = i1 - 1;
					tNext = t0;

			}

		}

		const halfDt = ( t1 - t0 ) * 0.5,
			stride = this.valueSize;

		this._weightPrev = halfDt / ( t0 - tPrev );
		this._weightNext = halfDt / ( tNext - t1 );
		this._offsetPrev = iPrev * stride;
		this._offsetNext = iNext * stride;

	}

	interpolate_( i1, t0, t, t1 ) {

		const result = this.resultBuffer,
			values = this.sampleValues,
			stride = this.valueSize,

			o1 = i1 * stride,		o0 = o1 - stride,
			oP = this._offsetPrev, 	oN = this._offsetNext,
			wP = this._weightPrev,	wN = this._weightNext,

			p = ( t - t0 ) / ( t1 - t0 ),
			pp = p * p,
			ppp = pp * p;

		// evaluate polynomials

		const sP = - wP * ppp + 2 * wP * pp - wP * p;
		const s0 = ( 1 + wP ) * ppp + ( - 1.5 - 2 * wP ) * pp + ( - 0.5 + wP ) * p + 1;
		const s1 = ( - 1 - wN ) * ppp + ( 1.5 + wN ) * pp + 0.5 * p;
		const sN = wN * ppp - wN * pp;

		// combine data linearly

		for ( let i = 0; i !== stride; ++ i ) {

			result[ i ] =
					sP * values[ oP + i ] +
					s0 * values[ o0 + i ] +
					s1 * values[ o1 + i ] +
					sN * values[ oN + i ];

		}

		return result;

	}

}

class LinearInterpolant extends Interpolant {

	constructor( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

		super( parameterPositions, sampleValues, sampleSize, resultBuffer );

	}

	interpolate_( i1, t0, t, t1 ) {

		const result = this.resultBuffer,
			values = this.sampleValues,
			stride = this.valueSize,

			offset1 = i1 * stride,
			offset0 = offset1 - stride,

			weight1 = ( t - t0 ) / ( t1 - t0 ),
			weight0 = 1 - weight1;

		for ( let i = 0; i !== stride; ++ i ) {

			result[ i ] =
					values[ offset0 + i ] * weight0 +
					values[ offset1 + i ] * weight1;

		}

		return result;

	}

}

/**
 *
 * Interpolant that evaluates to the sample value at the position preceding
 * the parameter.
 */

class DiscreteInterpolant extends Interpolant {

	constructor( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

		super( parameterPositions, sampleValues, sampleSize, resultBuffer );

	}

	interpolate_( i1 /*, t0, t, t1 */ ) {

		return this.copySampleValue_( i1 - 1 );

	}

}

class KeyframeTrack {

	constructor( name, times, values, interpolation ) {

		if ( name === undefined ) throw new Error( 'THREE.KeyframeTrack: track name is undefined' );
		if ( times === undefined || times.length === 0 ) throw new Error( 'THREE.KeyframeTrack: no keyframes in track named ' + name );

		this.name = name;

		this.times = convertArray( times, this.TimeBufferType );
		this.values = convertArray( values, this.ValueBufferType );

		this.setInterpolation( interpolation || this.DefaultInterpolation );

	}

	// Serialization (in static context, because of constructor invocation
	// and automatic invocation of .toJSON):

	static toJSON( track ) {

		const trackType = track.constructor;

		let json;

		// derived classes can define a static toJSON method
		if ( trackType.toJSON !== this.toJSON ) {

			json = trackType.toJSON( track );

		} else {

			// by default, we assume the data can be serialized as-is
			json = {

				'name': track.name,
				'times': convertArray( track.times, Array ),
				'values': convertArray( track.values, Array )

			};

			const interpolation = track.getInterpolation();

			if ( interpolation !== track.DefaultInterpolation ) {

				json.interpolation = interpolation;

			}

		}

		json.type = track.ValueTypeName; // mandatory

		return json;

	}

	InterpolantFactoryMethodDiscrete( result ) {

		return new DiscreteInterpolant( this.times, this.values, this.getValueSize(), result );

	}

	InterpolantFactoryMethodLinear( result ) {

		return new LinearInterpolant( this.times, this.values, this.getValueSize(), result );

	}

	InterpolantFactoryMethodSmooth( result ) {

		return new CubicInterpolant( this.times, this.values, this.getValueSize(), result );

	}

	setInterpolation( interpolation ) {

		let factoryMethod;

		switch ( interpolation ) {

			case InterpolateDiscrete:

				factoryMethod = this.InterpolantFactoryMethodDiscrete;

				break;

			case InterpolateLinear:

				factoryMethod = this.InterpolantFactoryMethodLinear;

				break;

			case InterpolateSmooth:

				factoryMethod = this.InterpolantFactoryMethodSmooth;

				break;

		}

		if ( factoryMethod === undefined ) {

			const message = 'unsupported interpolation for ' +
				this.ValueTypeName + ' keyframe track named ' + this.name;

			if ( this.createInterpolant === undefined ) {

				// fall back to default, unless the default itself is messed up
				if ( interpolation !== this.DefaultInterpolation ) {

					this.setInterpolation( this.DefaultInterpolation );

				} else {

					throw new Error( message ); // fatal, in this case

				}

			}

			console.warn( 'THREE.KeyframeTrack:', message );
			return this;

		}

		this.createInterpolant = factoryMethod;

		return this;

	}

	getInterpolation() {

		switch ( this.createInterpolant ) {

			case this.InterpolantFactoryMethodDiscrete:

				return InterpolateDiscrete;

			case this.InterpolantFactoryMethodLinear:

				return InterpolateLinear;

			case this.InterpolantFactoryMethodSmooth:

				return InterpolateSmooth;

		}

	}

	getValueSize() {

		return this.values.length / this.times.length;

	}

	// move all keyframes either forwards or backwards in time
	shift( timeOffset ) {

		if ( timeOffset !== 0.0 ) {

			const times = this.times;

			for ( let i = 0, n = times.length; i !== n; ++ i ) {

				times[ i ] += timeOffset;

			}

		}

		return this;

	}

	// scale all keyframe times by a factor (useful for frame <-> seconds conversions)
	scale( timeScale ) {

		if ( timeScale !== 1.0 ) {

			const times = this.times;

			for ( let i = 0, n = times.length; i !== n; ++ i ) {

				times[ i ] *= timeScale;

			}

		}

		return this;

	}

	// removes keyframes before and after animation without changing any values within the range [startTime, endTime].
	// IMPORTANT: We do not shift around keys to the start of the track time, because for interpolated keys this will change their values
	trim( startTime, endTime ) {

		const times = this.times,
			nKeys = times.length;

		let from = 0,
			to = nKeys - 1;

		while ( from !== nKeys && times[ from ] < startTime ) {

			++ from;

		}

		while ( to !== - 1 && times[ to ] > endTime ) {

			-- to;

		}

		++ to; // inclusive -> exclusive bound

		if ( from !== 0 || to !== nKeys ) {

			// empty tracks are forbidden, so keep at least one keyframe
			if ( from >= to ) {

				to = Math.max( to, 1 );
				from = to - 1;

			}

			const stride = this.getValueSize();
			this.times = times.slice( from, to );
			this.values = this.values.slice( from * stride, to * stride );

		}

		return this;

	}

	// ensure we do not get a GarbageInGarbageOut situation, make sure tracks are at least minimally viable
	validate() {

		let valid = true;

		const valueSize = this.getValueSize();
		if ( valueSize - Math.floor( valueSize ) !== 0 ) {

			console.error( 'THREE.KeyframeTrack: Invalid value size in track.', this );
			valid = false;

		}

		const times = this.times,
			values = this.values,

			nKeys = times.length;

		if ( nKeys === 0 ) {

			console.error( 'THREE.KeyframeTrack: Track is empty.', this );
			valid = false;

		}

		let prevTime = null;

		for ( let i = 0; i !== nKeys; i ++ ) {

			const currTime = times[ i ];

			if ( typeof currTime === 'number' && isNaN( currTime ) ) {

				console.error( 'THREE.KeyframeTrack: Time is not a valid number.', this, i, currTime );
				valid = false;
				break;

			}

			if ( prevTime !== null && prevTime > currTime ) {

				console.error( 'THREE.KeyframeTrack: Out of order keys.', this, i, currTime, prevTime );
				valid = false;
				break;

			}

			prevTime = currTime;

		}

		if ( values !== undefined ) {

			if ( isTypedArray( values ) ) {

				for ( let i = 0, n = values.length; i !== n; ++ i ) {

					const value = values[ i ];

					if ( isNaN( value ) ) {

						console.error( 'THREE.KeyframeTrack: Value is not a valid number.', this, i, value );
						valid = false;
						break;

					}

				}

			}

		}

		return valid;

	}

	// removes equivalent sequential keys as common in morph target sequences
	// (0,0,0,0,1,1,1,0,0,0,0,0,0,0) --> (0,0,1,1,0,0)
	optimize() {

		// times or values may be shared with other tracks, so overwriting is unsafe
		const times = this.times.slice(),
			values = this.values.slice(),
			stride = this.getValueSize(),

			smoothInterpolation = this.getInterpolation() === InterpolateSmooth,

			lastIndex = times.length - 1;

		let writeIndex = 1;

		for ( let i = 1; i < lastIndex; ++ i ) {

			let keep = false;

			const time = times[ i ];
			const timeNext = times[ i + 1 ];

			// remove adjacent keyframes scheduled at the same time

			if ( time !== timeNext && ( i !== 1 || time !== times[ 0 ] ) ) {

				if ( ! smoothInterpolation ) {

					// remove unnecessary keyframes same as their neighbors

					const offset = i * stride,
						offsetP = offset - stride,
						offsetN = offset + stride;

					for ( let j = 0; j !== stride; ++ j ) {

						const value = values[ offset + j ];

						if ( value !== values[ offsetP + j ] ||
							value !== values[ offsetN + j ] ) {

							keep = true;
							break;

						}

					}

				} else {

					keep = true;

				}

			}

			// in-place compaction

			if ( keep ) {

				if ( i !== writeIndex ) {

					times[ writeIndex ] = times[ i ];

					const readOffset = i * stride,
						writeOffset = writeIndex * stride;

					for ( let j = 0; j !== stride; ++ j ) {

						values[ writeOffset + j ] = values[ readOffset + j ];

					}

				}

				++ writeIndex;

			}

		}

		// flush last keyframe (compaction looks ahead)

		if ( lastIndex > 0 ) {

			times[ writeIndex ] = times[ lastIndex ];

			for ( let readOffset = lastIndex * stride, writeOffset = writeIndex * stride, j = 0; j !== stride; ++ j ) {

				values[ writeOffset + j ] = values[ readOffset + j ];

			}

			++ writeIndex;

		}

		if ( writeIndex !== times.length ) {

			this.times = times.slice( 0, writeIndex );
			this.values = values.slice( 0, writeIndex * stride );

		} else {

			this.times = times;
			this.values = values;

		}

		return this;

	}

	clone() {

		const times = this.times.slice();
		const values = this.values.slice();

		const TypedKeyframeTrack = this.constructor;
		const track = new TypedKeyframeTrack( this.name, times, values );

		// Interpolant argument to constructor is not saved, so copy the factory method directly.
		track.createInterpolant = this.createInterpolant;

		return track;

	}

}

KeyframeTrack.prototype.TimeBufferType = Float32Array;
KeyframeTrack.prototype.ValueBufferType = Float32Array;
KeyframeTrack.prototype.DefaultInterpolation = InterpolateLinear;

/**
 * A Track of Boolean keyframe values.
 */
class BooleanKeyframeTrack extends KeyframeTrack {

	// No interpolation parameter because only InterpolateDiscrete is valid.
	constructor( name, times, values ) {

		super( name, times, values );

	}

}

BooleanKeyframeTrack.prototype.ValueTypeName = 'bool';
BooleanKeyframeTrack.prototype.ValueBufferType = Array;
BooleanKeyframeTrack.prototype.DefaultInterpolation = InterpolateDiscrete;
BooleanKeyframeTrack.prototype.InterpolantFactoryMethodLinear = undefined;
BooleanKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = undefined;

/**
 * A Track of keyframe values that represent color.
 */
class ColorKeyframeTrack extends KeyframeTrack {}

ColorKeyframeTrack.prototype.ValueTypeName = 'color';

/**
 * A Track of numeric keyframe values.
 */
class NumberKeyframeTrack extends KeyframeTrack {}

NumberKeyframeTrack.prototype.ValueTypeName = 'number';

/**
 * Spherical linear unit quaternion interpolant.
 */

class QuaternionLinearInterpolant extends Interpolant {

	constructor( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

		super( parameterPositions, sampleValues, sampleSize, resultBuffer );

	}

	interpolate_( i1, t0, t, t1 ) {

		const result = this.resultBuffer,
			values = this.sampleValues,
			stride = this.valueSize,

			alpha = ( t - t0 ) / ( t1 - t0 );

		let offset = i1 * stride;

		for ( let end = offset + stride; offset !== end; offset += 4 ) {

			Quaternion.slerpFlat( result, 0, values, offset - stride, values, offset, alpha );

		}

		return result;

	}

}

/**
 * A Track of quaternion keyframe values.
 */
class QuaternionKeyframeTrack extends KeyframeTrack {

	InterpolantFactoryMethodLinear( result ) {

		return new QuaternionLinearInterpolant( this.times, this.values, this.getValueSize(), result );

	}

}

QuaternionKeyframeTrack.prototype.ValueTypeName = 'quaternion';
// ValueBufferType is inherited
// DefaultInterpolation is inherited;
QuaternionKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = undefined;

/**
 * A Track that interpolates Strings
 */
class StringKeyframeTrack extends KeyframeTrack {

	// No interpolation parameter because only InterpolateDiscrete is valid.
	constructor( name, times, values ) {

		super( name, times, values );

	}

}

StringKeyframeTrack.prototype.ValueTypeName = 'string';
StringKeyframeTrack.prototype.ValueBufferType = Array;
StringKeyframeTrack.prototype.DefaultInterpolation = InterpolateDiscrete;
StringKeyframeTrack.prototype.InterpolantFactoryMethodLinear = undefined;
StringKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = undefined;

/**
 * A Track of vectored keyframe values.
 */
class VectorKeyframeTrack extends KeyframeTrack {}

VectorKeyframeTrack.prototype.ValueTypeName = 'vector';

class AnimationClip {

	constructor( name = '', duration = - 1, tracks = [], blendMode = NormalAnimationBlendMode ) {

		this.name = name;
		this.tracks = tracks;
		this.duration = duration;
		this.blendMode = blendMode;

		this.uuid = generateUUID();

		// this means it should figure out its duration by scanning the tracks
		if ( this.duration < 0 ) {

			this.resetDuration();

		}

	}


	static parse( json ) {

		const tracks = [],
			jsonTracks = json.tracks,
			frameTime = 1.0 / ( json.fps || 1.0 );

		for ( let i = 0, n = jsonTracks.length; i !== n; ++ i ) {

			tracks.push( parseKeyframeTrack( jsonTracks[ i ] ).scale( frameTime ) );

		}

		const clip = new this( json.name, json.duration, tracks, json.blendMode );
		clip.uuid = json.uuid;

		return clip;

	}

	static toJSON( clip ) {

		const tracks = [],
			clipTracks = clip.tracks;

		const json = {

			'name': clip.name,
			'duration': clip.duration,
			'tracks': tracks,
			'uuid': clip.uuid,
			'blendMode': clip.blendMode

		};

		for ( let i = 0, n = clipTracks.length; i !== n; ++ i ) {

			tracks.push( KeyframeTrack.toJSON( clipTracks[ i ] ) );

		}

		return json;

	}

	static CreateFromMorphTargetSequence( name, morphTargetSequence, fps, noLoop ) {

		const numMorphTargets = morphTargetSequence.length;
		const tracks = [];

		for ( let i = 0; i < numMorphTargets; i ++ ) {

			let times = [];
			let values = [];

			times.push(
				( i + numMorphTargets - 1 ) % numMorphTargets,
				i,
				( i + 1 ) % numMorphTargets );

			values.push( 0, 1, 0 );

			const order = getKeyframeOrder( times );
			times = sortedArray( times, 1, order );
			values = sortedArray( values, 1, order );

			// if there is a key at the first frame, duplicate it as the
			// last frame as well for perfect loop.
			if ( ! noLoop && times[ 0 ] === 0 ) {

				times.push( numMorphTargets );
				values.push( values[ 0 ] );

			}

			tracks.push(
				new NumberKeyframeTrack(
					'.morphTargetInfluences[' + morphTargetSequence[ i ].name + ']',
					times, values
				).scale( 1.0 / fps ) );

		}

		return new this( name, - 1, tracks );

	}

	static findByName( objectOrClipArray, name ) {

		let clipArray = objectOrClipArray;

		if ( ! Array.isArray( objectOrClipArray ) ) {

			const o = objectOrClipArray;
			clipArray = o.geometry && o.geometry.animations || o.animations;

		}

		for ( let i = 0; i < clipArray.length; i ++ ) {

			if ( clipArray[ i ].name === name ) {

				return clipArray[ i ];

			}

		}

		return null;

	}

	static CreateClipsFromMorphTargetSequences( morphTargets, fps, noLoop ) {

		const animationToMorphTargets = {};

		// tested with https://regex101.com/ on trick sequences
		// such flamingo_flyA_003, flamingo_run1_003, crdeath0059
		const pattern = /^([\w-]*?)([\d]+)$/;

		// sort morph target names into animation groups based
		// patterns like Walk_001, Walk_002, Run_001, Run_002
		for ( let i = 0, il = morphTargets.length; i < il; i ++ ) {

			const morphTarget = morphTargets[ i ];
			const parts = morphTarget.name.match( pattern );

			if ( parts && parts.length > 1 ) {

				const name = parts[ 1 ];

				let animationMorphTargets = animationToMorphTargets[ name ];

				if ( ! animationMorphTargets ) {

					animationToMorphTargets[ name ] = animationMorphTargets = [];

				}

				animationMorphTargets.push( morphTarget );

			}

		}

		const clips = [];

		for ( const name in animationToMorphTargets ) {

			clips.push( this.CreateFromMorphTargetSequence( name, animationToMorphTargets[ name ], fps, noLoop ) );

		}

		return clips;

	}

	// parse the animation.hierarchy format
	static parseAnimation( animation, bones ) {

		if ( ! animation ) {

			console.error( 'THREE.AnimationClip: No animation in JSONLoader data.' );
			return null;

		}

		const addNonemptyTrack = function ( trackType, trackName, animationKeys, propertyName, destTracks ) {

			// only return track if there are actually keys.
			if ( animationKeys.length !== 0 ) {

				const times = [];
				const values = [];

				flattenJSON( animationKeys, times, values, propertyName );

				// empty keys are filtered out, so check again
				if ( times.length !== 0 ) {

					destTracks.push( new trackType( trackName, times, values ) );

				}

			}

		};

		const tracks = [];

		const clipName = animation.name || 'default';
		const fps = animation.fps || 30;
		const blendMode = animation.blendMode;

		// automatic length determination in AnimationClip.
		let duration = animation.length || - 1;

		const hierarchyTracks = animation.hierarchy || [];

		for ( let h = 0; h < hierarchyTracks.length; h ++ ) {

			const animationKeys = hierarchyTracks[ h ].keys;

			// skip empty tracks
			if ( ! animationKeys || animationKeys.length === 0 ) continue;

			// process morph targets
			if ( animationKeys[ 0 ].morphTargets ) {

				// figure out all morph targets used in this track
				const morphTargetNames = {};

				let k;

				for ( k = 0; k < animationKeys.length; k ++ ) {

					if ( animationKeys[ k ].morphTargets ) {

						for ( let m = 0; m < animationKeys[ k ].morphTargets.length; m ++ ) {

							morphTargetNames[ animationKeys[ k ].morphTargets[ m ] ] = - 1;

						}

					}

				}

				// create a track for each morph target with all zero
				// morphTargetInfluences except for the keys in which
				// the morphTarget is named.
				for ( const morphTargetName in morphTargetNames ) {

					const times = [];
					const values = [];

					for ( let m = 0; m !== animationKeys[ k ].morphTargets.length; ++ m ) {

						const animationKey = animationKeys[ k ];

						times.push( animationKey.time );
						values.push( ( animationKey.morphTarget === morphTargetName ) ? 1 : 0 );

					}

					tracks.push( new NumberKeyframeTrack( '.morphTargetInfluence[' + morphTargetName + ']', times, values ) );

				}

				duration = morphTargetNames.length * fps;

			} else {

				// ...assume skeletal animation

				const boneName = '.bones[' + bones[ h ].name + ']';

				addNonemptyTrack(
					VectorKeyframeTrack, boneName + '.position',
					animationKeys, 'pos', tracks );

				addNonemptyTrack(
					QuaternionKeyframeTrack, boneName + '.quaternion',
					animationKeys, 'rot', tracks );

				addNonemptyTrack(
					VectorKeyframeTrack, boneName + '.scale',
					animationKeys, 'scl', tracks );

			}

		}

		if ( tracks.length === 0 ) {

			return null;

		}

		const clip = new this( clipName, duration, tracks, blendMode );

		return clip;

	}

	resetDuration() {

		const tracks = this.tracks;
		let duration = 0;

		for ( let i = 0, n = tracks.length; i !== n; ++ i ) {

			const track = this.tracks[ i ];

			duration = Math.max( duration, track.times[ track.times.length - 1 ] );

		}

		this.duration = duration;

		return this;

	}

	trim() {

		for ( let i = 0; i < this.tracks.length; i ++ ) {

			this.tracks[ i ].trim( 0, this.duration );

		}

		return this;

	}

	validate() {

		let valid = true;

		for ( let i = 0; i < this.tracks.length; i ++ ) {

			valid = valid && this.tracks[ i ].validate();

		}

		return valid;

	}

	optimize() {

		for ( let i = 0; i < this.tracks.length; i ++ ) {

			this.tracks[ i ].optimize();

		}

		return this;

	}

	clone() {

		const tracks = [];

		for ( let i = 0; i < this.tracks.length; i ++ ) {

			tracks.push( this.tracks[ i ].clone() );

		}

		return new this.constructor( this.name, this.duration, tracks, this.blendMode );

	}

	toJSON() {

		return this.constructor.toJSON( this );

	}

}

function getTrackTypeForValueTypeName( typeName ) {

	switch ( typeName.toLowerCase() ) {

		case 'scalar':
		case 'double':
		case 'float':
		case 'number':
		case 'integer':

			return NumberKeyframeTrack;

		case 'vector':
		case 'vector2':
		case 'vector3':
		case 'vector4':

			return VectorKeyframeTrack;

		case 'color':

			return ColorKeyframeTrack;

		case 'quaternion':

			return QuaternionKeyframeTrack;

		case 'bool':
		case 'boolean':

			return BooleanKeyframeTrack;

		case 'string':

			return StringKeyframeTrack;

	}

	throw new Error( 'THREE.KeyframeTrack: Unsupported typeName: ' + typeName );

}

function parseKeyframeTrack( json ) {

	if ( json.type === undefined ) {

		throw new Error( 'THREE.KeyframeTrack: track type undefined, can not parse' );

	}

	const trackType = getTrackTypeForValueTypeName( json.type );

	if ( json.times === undefined ) {

		const times = [], values = [];

		flattenJSON( json.keys, times, values, 'value' );

		json.times = times;
		json.values = values;

	}

	// derived classes can define a static parse method
	if ( trackType.parse !== undefined ) {

		return trackType.parse( json );

	} else {

		// by default, we assume a constructor compatible with the base
		return new trackType( json.name, json.times, json.values, json.interpolation );

	}

}

const Cache = {

	enabled: false,

	files: {},

	add: function ( key, file ) {

		if ( this.enabled === false ) return;

		// console.log( 'THREE.Cache', 'Adding key:', key );

		this.files[ key ] = file;

	},

	get: function ( key ) {

		if ( this.enabled === false ) return;

		// console.log( 'THREE.Cache', 'Checking key:', key );

		return this.files[ key ];

	},

	remove: function ( key ) {

		delete this.files[ key ];

	},

	clear: function () {

		this.files = {};

	}

};

class LoadingManager {

	constructor( onLoad, onProgress, onError ) {

		const scope = this;

		let isLoading = false;
		let itemsLoaded = 0;
		let itemsTotal = 0;
		let urlModifier = undefined;
		const handlers = [];

		// Refer to #5689 for the reason why we don't set .onStart
		// in the constructor

		this.onStart = undefined;
		this.onLoad = onLoad;
		this.onProgress = onProgress;
		this.onError = onError;

		this.itemStart = function ( url ) {

			itemsTotal ++;

			if ( isLoading === false ) {

				if ( scope.onStart !== undefined ) {

					scope.onStart( url, itemsLoaded, itemsTotal );

				}

			}

			isLoading = true;

		};

		this.itemEnd = function ( url ) {

			itemsLoaded ++;

			if ( scope.onProgress !== undefined ) {

				scope.onProgress( url, itemsLoaded, itemsTotal );

			}

			if ( itemsLoaded === itemsTotal ) {

				isLoading = false;

				if ( scope.onLoad !== undefined ) {

					scope.onLoad();

				}

			}

		};

		this.itemError = function ( url ) {

			if ( scope.onError !== undefined ) {

				scope.onError( url );

			}

		};

		this.resolveURL = function ( url ) {

			if ( urlModifier ) {

				return urlModifier( url );

			}

			return url;

		};

		this.setURLModifier = function ( transform ) {

			urlModifier = transform;

			return this;

		};

		this.addHandler = function ( regex, loader ) {

			handlers.push( regex, loader );

			return this;

		};

		this.removeHandler = function ( regex ) {

			const index = handlers.indexOf( regex );

			if ( index !== - 1 ) {

				handlers.splice( index, 2 );

			}

			return this;

		};

		this.getHandler = function ( file ) {

			for ( let i = 0, l = handlers.length; i < l; i += 2 ) {

				const regex = handlers[ i ];
				const loader = handlers[ i + 1 ];

				if ( regex.global ) regex.lastIndex = 0; // see #17920

				if ( regex.test( file ) ) {

					return loader;

				}

			}

			return null;

		};

	}

}

const DefaultLoadingManager = /*@__PURE__*/ new LoadingManager();

class Loader {

	constructor( manager ) {

		this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

		this.crossOrigin = 'anonymous';
		this.withCredentials = false;
		this.path = '';
		this.resourcePath = '';
		this.requestHeader = {};

	}

	load( /* url, onLoad, onProgress, onError */ ) {}

	loadAsync( url, onProgress ) {

		const scope = this;

		return new Promise( function ( resolve, reject ) {

			scope.load( url, resolve, onProgress, reject );

		} );

	}

	parse( /* data */ ) {}

	setCrossOrigin( crossOrigin ) {

		this.crossOrigin = crossOrigin;
		return this;

	}

	setWithCredentials( value ) {

		this.withCredentials = value;
		return this;

	}

	setPath( path ) {

		this.path = path;
		return this;

	}

	setResourcePath( resourcePath ) {

		this.resourcePath = resourcePath;
		return this;

	}

	setRequestHeader( requestHeader ) {

		this.requestHeader = requestHeader;
		return this;

	}

}

Loader.DEFAULT_MATERIAL_NAME = '__DEFAULT';

const loading = {};

class HttpError extends Error {

	constructor( message, response ) {

		super( message );
		this.response = response;

	}

}

class FileLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		if ( url === undefined ) url = '';

		if ( this.path !== undefined ) url = this.path + url;

		url = this.manager.resolveURL( url );

		const cached = Cache.get( url );

		if ( cached !== undefined ) {

			this.manager.itemStart( url );

			setTimeout( () => {

				if ( onLoad ) onLoad( cached );

				this.manager.itemEnd( url );

			}, 0 );

			return cached;

		}

		// Check if request is duplicate

		if ( loading[ url ] !== undefined ) {

			loading[ url ].push( {

				onLoad: onLoad,
				onProgress: onProgress,
				onError: onError

			} );

			return;

		}

		// Initialise array for duplicate requests
		loading[ url ] = [];

		loading[ url ].push( {
			onLoad: onLoad,
			onProgress: onProgress,
			onError: onError,
		} );

		// create request
		const req = new Request( url, {
			headers: new Headers( this.requestHeader ),
			credentials: this.withCredentials ? 'include' : 'same-origin',
			// An abort controller could be added within a future PR
		} );

		// record states ( avoid data race )
		const mimeType = this.mimeType;
		const responseType = this.responseType;

		// start the fetch
		fetch( req )
			.then( response => {

				if ( response.status === 200 || response.status === 0 ) {

					// Some browsers return HTTP Status 0 when using non-http protocol
					// e.g. 'file://' or 'data://'. Handle as success.

					if ( response.status === 0 ) {

						console.warn( 'THREE.FileLoader: HTTP Status 0 received.' );

					}

					// Workaround: Checking if response.body === undefined for Alipay browser #23548

					if ( typeof ReadableStream === 'undefined' || response.body === undefined || response.body.getReader === undefined ) {

						return response;

					}

					const callbacks = loading[ url ];
					const reader = response.body.getReader();

					// Nginx needs X-File-Size check
					// https://serverfault.com/questions/482875/why-does-nginx-remove-content-length-header-for-chunked-content
					const contentLength = response.headers.get( 'X-File-Size' ) || response.headers.get( 'Content-Length' );
					const total = contentLength ? parseInt( contentLength ) : 0;
					const lengthComputable = total !== 0;
					let loaded = 0;

					// periodically read data into the new stream tracking while download progress
					const stream = new ReadableStream( {
						start( controller ) {

							readData();

							function readData() {

								reader.read().then( ( { done, value } ) => {

									if ( done ) {

										controller.close();

									} else {

										loaded += value.byteLength;

										const event = new ProgressEvent( 'progress', { lengthComputable, loaded, total } );
										for ( let i = 0, il = callbacks.length; i < il; i ++ ) {

											const callback = callbacks[ i ];
											if ( callback.onProgress ) callback.onProgress( event );

										}

										controller.enqueue( value );
										readData();

									}

								}, ( e ) => {

									controller.error( e );

								} );

							}

						}

					} );

					return new Response( stream );

				} else {

					throw new HttpError( `fetch for "${response.url}" responded with ${response.status}: ${response.statusText}`, response );

				}

			} )
			.then( response => {

				switch ( responseType ) {

					case 'arraybuffer':

						return response.arrayBuffer();

					case 'blob':

						return response.blob();

					case 'document':

						return response.text()
							.then( text => {

								const parser = new DOMParser();
								return parser.parseFromString( text, mimeType );

							} );

					case 'json':

						return response.json();

					default:

						if ( mimeType === undefined ) {

							return response.text();

						} else {

							// sniff encoding
							const re = /charset="?([^;"\s]*)"?/i;
							const exec = re.exec( mimeType );
							const label = exec && exec[ 1 ] ? exec[ 1 ].toLowerCase() : undefined;
							const decoder = new TextDecoder( label );
							return response.arrayBuffer().then( ab => decoder.decode( ab ) );

						}

				}

			} )
			.then( data => {

				// Add to cache only on HTTP success, so that we do not cache
				// error response bodies as proper responses to requests.
				Cache.add( url, data );

				const callbacks = loading[ url ];
				delete loading[ url ];

				for ( let i = 0, il = callbacks.length; i < il; i ++ ) {

					const callback = callbacks[ i ];
					if ( callback.onLoad ) callback.onLoad( data );

				}

			} )
			.catch( err => {

				// Abort errors and other errors are handled the same

				const callbacks = loading[ url ];

				if ( callbacks === undefined ) {

					// When onLoad was called and url was deleted in `loading`
					this.manager.itemError( url );
					throw err;

				}

				delete loading[ url ];

				for ( let i = 0, il = callbacks.length; i < il; i ++ ) {

					const callback = callbacks[ i ];
					if ( callback.onError ) callback.onError( err );

				}

				this.manager.itemError( url );

			} )
			.finally( () => {

				this.manager.itemEnd( url );

			} );

		this.manager.itemStart( url );

	}

	setResponseType( value ) {

		this.responseType = value;
		return this;

	}

	setMimeType( value ) {

		this.mimeType = value;
		return this;

	}

}

class AnimationLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( JSON.parse( text ) ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parse( json ) {

		const animations = [];

		for ( let i = 0; i < json.length; i ++ ) {

			const clip = AnimationClip.parse( json[ i ] );

			animations.push( clip );

		}

		return animations;

	}

}

/**
 * Abstract Base class to block based textures loader (dds, pvr, ...)
 *
 * Sub classes have to implement the parse() method which will be used in load().
 */

class CompressedTextureLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const images = [];

		const texture = new CompressedTexture();

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( scope.withCredentials );

		let loaded = 0;

		function loadTexture( i ) {

			loader.load( url[ i ], function ( buffer ) {

				const texDatas = scope.parse( buffer, true );

				images[ i ] = {
					width: texDatas.width,
					height: texDatas.height,
					format: texDatas.format,
					mipmaps: texDatas.mipmaps
				};

				loaded += 1;

				if ( loaded === 6 ) {

					if ( texDatas.mipmapCount === 1 ) texture.minFilter = LinearFilter;

					texture.image = images;
					texture.format = texDatas.format;
					texture.needsUpdate = true;

					if ( onLoad ) onLoad( texture );

				}

			}, onProgress, onError );

		}

		if ( Array.isArray( url ) ) {

			for ( let i = 0, il = url.length; i < il; ++ i ) {

				loadTexture( i );

			}

		} else {

			// compressed cubemap texture stored in a single DDS file

			loader.load( url, function ( buffer ) {

				const texDatas = scope.parse( buffer, true );

				if ( texDatas.isCubemap ) {

					const faces = texDatas.mipmaps.length / texDatas.mipmapCount;

					for ( let f = 0; f < faces; f ++ ) {

						images[ f ] = { mipmaps: [] };

						for ( let i = 0; i < texDatas.mipmapCount; i ++ ) {

							images[ f ].mipmaps.push( texDatas.mipmaps[ f * texDatas.mipmapCount + i ] );
							images[ f ].format = texDatas.format;
							images[ f ].width = texDatas.width;
							images[ f ].height = texDatas.height;

						}

					}

					texture.image = images;

				} else {

					texture.image.width = texDatas.width;
					texture.image.height = texDatas.height;
					texture.mipmaps = texDatas.mipmaps;

				}

				if ( texDatas.mipmapCount === 1 ) {

					texture.minFilter = LinearFilter;

				}

				texture.format = texDatas.format;
				texture.needsUpdate = true;

				if ( onLoad ) onLoad( texture );

			}, onProgress, onError );

		}

		return texture;

	}

}

class ImageLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		if ( this.path !== undefined ) url = this.path + url;

		url = this.manager.resolveURL( url );

		const scope = this;

		const cached = Cache.get( url );

		if ( cached !== undefined ) {

			scope.manager.itemStart( url );

			setTimeout( function () {

				if ( onLoad ) onLoad( cached );

				scope.manager.itemEnd( url );

			}, 0 );

			return cached;

		}

		const image = createElementNS( 'img' );

		function onImageLoad() {

			removeEventListeners();

			Cache.add( url, this );

			if ( onLoad ) onLoad( this );

			scope.manager.itemEnd( url );

		}

		function onImageError( event ) {

			removeEventListeners();

			if ( onError ) onError( event );

			scope.manager.itemError( url );
			scope.manager.itemEnd( url );

		}

		function removeEventListeners() {

			image.removeEventListener( 'load', onImageLoad, false );
			image.removeEventListener( 'error', onImageError, false );

		}

		image.addEventListener( 'load', onImageLoad, false );
		image.addEventListener( 'error', onImageError, false );

		if ( url.slice( 0, 5 ) !== 'data:' ) {

			if ( this.crossOrigin !== undefined ) image.crossOrigin = this.crossOrigin;

		}

		scope.manager.itemStart( url );

		image.src = url;

		return image;

	}

}

class CubeTextureLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( urls, onLoad, onProgress, onError ) {

		const texture = new CubeTexture();
		texture.colorSpace = SRGBColorSpace;

		const loader = new ImageLoader( this.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.setPath( this.path );

		let loaded = 0;

		function loadTexture( i ) {

			loader.load( urls[ i ], function ( image ) {

				texture.images[ i ] = image;

				loaded ++;

				if ( loaded === 6 ) {

					texture.needsUpdate = true;

					if ( onLoad ) onLoad( texture );

				}

			}, undefined, onError );

		}

		for ( let i = 0; i < urls.length; ++ i ) {

			loadTexture( i );

		}

		return texture;

	}

}

/**
 * Abstract Base class to load generic binary textures formats (rgbe, hdr, ...)
 *
 * Sub classes have to implement the parse() method which will be used in load().
 */

class DataTextureLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const texture = new DataTexture();

		const loader = new FileLoader( this.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setPath( this.path );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( buffer ) {

			let texData;

			try {

				texData = scope.parse( buffer );

			} catch ( error ) {

				if ( onError !== undefined ) {

					onError( error );

				} else {

					console.error( error );
					return;

				}

			}

			if ( texData.image !== undefined ) {

				texture.image = texData.image;

			} else if ( texData.data !== undefined ) {

				texture.image.width = texData.width;
				texture.image.height = texData.height;
				texture.image.data = texData.data;

			}

			texture.wrapS = texData.wrapS !== undefined ? texData.wrapS : ClampToEdgeWrapping;
			texture.wrapT = texData.wrapT !== undefined ? texData.wrapT : ClampToEdgeWrapping;

			texture.magFilter = texData.magFilter !== undefined ? texData.magFilter : LinearFilter;
			texture.minFilter = texData.minFilter !== undefined ? texData.minFilter : LinearFilter;

			texture.anisotropy = texData.anisotropy !== undefined ? texData.anisotropy : 1;

			if ( texData.colorSpace !== undefined ) {

				texture.colorSpace = texData.colorSpace;

			}

			if ( texData.flipY !== undefined ) {

				texture.flipY = texData.flipY;

			}

			if ( texData.format !== undefined ) {

				texture.format = texData.format;

			}

			if ( texData.type !== undefined ) {

				texture.type = texData.type;

			}

			if ( texData.mipmaps !== undefined ) {

				texture.mipmaps = texData.mipmaps;
				texture.minFilter = LinearMipmapLinearFilter; // presumably...

			}

			if ( texData.mipmapCount === 1 ) {

				texture.minFilter = LinearFilter;

			}

			if ( texData.generateMipmaps !== undefined ) {

				texture.generateMipmaps = texData.generateMipmaps;

			}

			texture.needsUpdate = true;

			if ( onLoad ) onLoad( texture, texData );

		}, onProgress, onError );


		return texture;

	}

}

class TextureLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const texture = new Texture();

		const loader = new ImageLoader( this.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.setPath( this.path );

		loader.load( url, function ( image ) {

			texture.image = image;
			texture.needsUpdate = true;

			if ( onLoad !== undefined ) {

				onLoad( texture );

			}

		}, onProgress, onError );

		return texture;

	}

}

class Light extends Object3D {

	constructor( color, intensity = 1 ) {

		super();

		this.isLight = true;

		this.type = 'Light';

		this.color = new Color( color );
		this.intensity = intensity;

	}

	dispose() {

		// Empty here in base class; some subclasses override.

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.color.copy( source.color );
		this.intensity = source.intensity;

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.color = this.color.getHex();
		data.object.intensity = this.intensity;

		if ( this.groundColor !== undefined ) data.object.groundColor = this.groundColor.getHex();

		if ( this.distance !== undefined ) data.object.distance = this.distance;
		if ( this.angle !== undefined ) data.object.angle = this.angle;
		if ( this.decay !== undefined ) data.object.decay = this.decay;
		if ( this.penumbra !== undefined ) data.object.penumbra = this.penumbra;

		if ( this.shadow !== undefined ) data.object.shadow = this.shadow.toJSON();
		if ( this.target !== undefined ) data.object.target = this.target.uuid;

		return data;

	}

}

class HemisphereLight extends Light {

	constructor( skyColor, groundColor, intensity ) {

		super( skyColor, intensity );

		this.isHemisphereLight = true;

		this.type = 'HemisphereLight';

		this.position.copy( Object3D.DEFAULT_UP );
		this.updateMatrix();

		this.groundColor = new Color( groundColor );

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.groundColor.copy( source.groundColor );

		return this;

	}

}

const _projScreenMatrix$1 = /*@__PURE__*/ new Matrix4();
const _lightPositionWorld$1 = /*@__PURE__*/ new Vector3();
const _lookTarget$1 = /*@__PURE__*/ new Vector3();

class LightShadow {

	constructor( camera ) {

		this.camera = camera;

		this.intensity = 1;

		this.bias = 0;
		this.normalBias = 0;
		this.radius = 1;
		this.blurSamples = 8;

		this.mapSize = new Vector2( 512, 512 );

		this.map = null;
		this.mapPass = null;
		this.matrix = new Matrix4();

		this.autoUpdate = true;
		this.needsUpdate = false;

		this._frustum = new Frustum();
		this._frameExtents = new Vector2( 1, 1 );

		this._viewportCount = 1;

		this._viewports = [

			new Vector4( 0, 0, 1, 1 )

		];

	}

	getViewportCount() {

		return this._viewportCount;

	}

	getFrustum() {

		return this._frustum;

	}

	updateMatrices( light ) {

		const shadowCamera = this.camera;
		const shadowMatrix = this.matrix;

		_lightPositionWorld$1.setFromMatrixPosition( light.matrixWorld );
		shadowCamera.position.copy( _lightPositionWorld$1 );

		_lookTarget$1.setFromMatrixPosition( light.target.matrixWorld );
		shadowCamera.lookAt( _lookTarget$1 );
		shadowCamera.updateMatrixWorld();

		_projScreenMatrix$1.multiplyMatrices( shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse );
		this._frustum.setFromProjectionMatrix( _projScreenMatrix$1 );

		shadowMatrix.set(
			0.5, 0.0, 0.0, 0.5,
			0.0, 0.5, 0.0, 0.5,
			0.0, 0.0, 0.5, 0.5,
			0.0, 0.0, 0.0, 1.0
		);

		shadowMatrix.multiply( _projScreenMatrix$1 );

	}

	getViewport( viewportIndex ) {

		return this._viewports[ viewportIndex ];

	}

	getFrameExtents() {

		return this._frameExtents;

	}

	dispose() {

		if ( this.map ) {

			this.map.dispose();

		}

		if ( this.mapPass ) {

			this.mapPass.dispose();

		}

	}

	copy( source ) {

		this.camera = source.camera.clone();

		this.intensity = source.intensity;

		this.bias = source.bias;
		this.radius = source.radius;

		this.mapSize.copy( source.mapSize );

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	toJSON() {

		const object = {};

		if ( this.intensity !== 1 ) object.intensity = this.intensity;
		if ( this.bias !== 0 ) object.bias = this.bias;
		if ( this.normalBias !== 0 ) object.normalBias = this.normalBias;
		if ( this.radius !== 1 ) object.radius = this.radius;
		if ( this.mapSize.x !== 512 || this.mapSize.y !== 512 ) object.mapSize = this.mapSize.toArray();

		object.camera = this.camera.toJSON( false ).object;
		delete object.camera.matrix;

		return object;

	}

}

class SpotLightShadow extends LightShadow {

	constructor() {

		super( new PerspectiveCamera( 50, 1, 0.5, 500 ) );

		this.isSpotLightShadow = true;

		this.focus = 1;

	}

	updateMatrices( light ) {

		const camera = this.camera;

		const fov = RAD2DEG * 2 * light.angle * this.focus;
		const aspect = this.mapSize.width / this.mapSize.height;
		const far = light.distance || camera.far;

		if ( fov !== camera.fov || aspect !== camera.aspect || far !== camera.far ) {

			camera.fov = fov;
			camera.aspect = aspect;
			camera.far = far;
			camera.updateProjectionMatrix();

		}

		super.updateMatrices( light );

	}

	copy( source ) {

		super.copy( source );

		this.focus = source.focus;

		return this;

	}

}

class SpotLight extends Light {

	constructor( color, intensity, distance = 0, angle = Math.PI / 3, penumbra = 0, decay = 2 ) {

		super( color, intensity );

		this.isSpotLight = true;

		this.type = 'SpotLight';

		this.position.copy( Object3D.DEFAULT_UP );
		this.updateMatrix();

		this.target = new Object3D();

		this.distance = distance;
		this.angle = angle;
		this.penumbra = penumbra;
		this.decay = decay;

		this.map = null;

		this.shadow = new SpotLightShadow();

	}

	get power() {

		// compute the light's luminous power (in lumens) from its intensity (in candela)
		// by convention for a spotlight, luminous power (lm) = π * luminous intensity (cd)
		return this.intensity * Math.PI;

	}

	set power( power ) {

		// set the light's intensity (in candela) from the desired luminous power (in lumens)
		this.intensity = power / Math.PI;

	}

	dispose() {

		this.shadow.dispose();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.distance = source.distance;
		this.angle = source.angle;
		this.penumbra = source.penumbra;
		this.decay = source.decay;

		this.target = source.target.clone();

		this.shadow = source.shadow.clone();

		return this;

	}

}

const _projScreenMatrix = /*@__PURE__*/ new Matrix4();
const _lightPositionWorld = /*@__PURE__*/ new Vector3();
const _lookTarget = /*@__PURE__*/ new Vector3();

class PointLightShadow extends LightShadow {

	constructor() {

		super( new PerspectiveCamera( 90, 1, 0.5, 500 ) );

		this.isPointLightShadow = true;

		this._frameExtents = new Vector2( 4, 2 );

		this._viewportCount = 6;

		this._viewports = [
			// These viewports map a cube-map onto a 2D texture with the
			// following orientation:
			//
			//  xzXZ
			//   y Y
			//
			// X - Positive x direction
			// x - Negative x direction
			// Y - Positive y direction
			// y - Negative y direction
			// Z - Positive z direction
			// z - Negative z direction

			// positive X
			new Vector4( 2, 1, 1, 1 ),
			// negative X
			new Vector4( 0, 1, 1, 1 ),
			// positive Z
			new Vector4( 3, 1, 1, 1 ),
			// negative Z
			new Vector4( 1, 1, 1, 1 ),
			// positive Y
			new Vector4( 3, 0, 1, 1 ),
			// negative Y
			new Vector4( 1, 0, 1, 1 )
		];

		this._cubeDirections = [
			new Vector3( 1, 0, 0 ), new Vector3( - 1, 0, 0 ), new Vector3( 0, 0, 1 ),
			new Vector3( 0, 0, - 1 ), new Vector3( 0, 1, 0 ), new Vector3( 0, - 1, 0 )
		];

		this._cubeUps = [
			new Vector3( 0, 1, 0 ), new Vector3( 0, 1, 0 ), new Vector3( 0, 1, 0 ),
			new Vector3( 0, 1, 0 ), new Vector3( 0, 0, 1 ),	new Vector3( 0, 0, - 1 )
		];

	}

	updateMatrices( light, viewportIndex = 0 ) {

		const camera = this.camera;
		const shadowMatrix = this.matrix;

		const far = light.distance || camera.far;

		if ( far !== camera.far ) {

			camera.far = far;
			camera.updateProjectionMatrix();

		}

		_lightPositionWorld.setFromMatrixPosition( light.matrixWorld );
		camera.position.copy( _lightPositionWorld );

		_lookTarget.copy( camera.position );
		_lookTarget.add( this._cubeDirections[ viewportIndex ] );
		camera.up.copy( this._cubeUps[ viewportIndex ] );
		camera.lookAt( _lookTarget );
		camera.updateMatrixWorld();

		shadowMatrix.makeTranslation( - _lightPositionWorld.x, - _lightPositionWorld.y, - _lightPositionWorld.z );

		_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		this._frustum.setFromProjectionMatrix( _projScreenMatrix );

	}

}

class PointLight extends Light {

	constructor( color, intensity, distance = 0, decay = 2 ) {

		super( color, intensity );

		this.isPointLight = true;

		this.type = 'PointLight';

		this.distance = distance;
		this.decay = decay;

		this.shadow = new PointLightShadow();

	}

	get power() {

		// compute the light's luminous power (in lumens) from its intensity (in candela)
		// for an isotropic light source, luminous power (lm) = 4 π luminous intensity (cd)
		return this.intensity * 4 * Math.PI;

	}

	set power( power ) {

		// set the light's intensity (in candela) from the desired luminous power (in lumens)
		this.intensity = power / ( 4 * Math.PI );

	}

	dispose() {

		this.shadow.dispose();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.distance = source.distance;
		this.decay = source.decay;

		this.shadow = source.shadow.clone();

		return this;

	}

}

class OrthographicCamera extends Camera {

	constructor( left = - 1, right = 1, top = 1, bottom = - 1, near = 0.1, far = 2000 ) {

		super();

		this.isOrthographicCamera = true;

		this.type = 'OrthographicCamera';

		this.zoom = 1;
		this.view = null;

		this.left = left;
		this.right = right;
		this.top = top;
		this.bottom = bottom;

		this.near = near;
		this.far = far;

		this.updateProjectionMatrix();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.left = source.left;
		this.right = source.right;
		this.top = source.top;
		this.bottom = source.bottom;
		this.near = source.near;
		this.far = source.far;

		this.zoom = source.zoom;
		this.view = source.view === null ? null : Object.assign( {}, source.view );

		return this;

	}

	setViewOffset( fullWidth, fullHeight, x, y, width, height ) {

		if ( this.view === null ) {

			this.view = {
				enabled: true,
				fullWidth: 1,
				fullHeight: 1,
				offsetX: 0,
				offsetY: 0,
				width: 1,
				height: 1
			};

		}

		this.view.enabled = true;
		this.view.fullWidth = fullWidth;
		this.view.fullHeight = fullHeight;
		this.view.offsetX = x;
		this.view.offsetY = y;
		this.view.width = width;
		this.view.height = height;

		this.updateProjectionMatrix();

	}

	clearViewOffset() {

		if ( this.view !== null ) {

			this.view.enabled = false;

		}

		this.updateProjectionMatrix();

	}

	updateProjectionMatrix() {

		const dx = ( this.right - this.left ) / ( 2 * this.zoom );
		const dy = ( this.top - this.bottom ) / ( 2 * this.zoom );
		const cx = ( this.right + this.left ) / 2;
		const cy = ( this.top + this.bottom ) / 2;

		let left = cx - dx;
		let right = cx + dx;
		let top = cy + dy;
		let bottom = cy - dy;

		if ( this.view !== null && this.view.enabled ) {

			const scaleW = ( this.right - this.left ) / this.view.fullWidth / this.zoom;
			const scaleH = ( this.top - this.bottom ) / this.view.fullHeight / this.zoom;

			left += scaleW * this.view.offsetX;
			right = left + scaleW * this.view.width;
			top -= scaleH * this.view.offsetY;
			bottom = top - scaleH * this.view.height;

		}

		this.projectionMatrix.makeOrthographic( left, right, top, bottom, this.near, this.far, this.coordinateSystem );

		this.projectionMatrixInverse.copy( this.projectionMatrix ).invert();

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.zoom = this.zoom;
		data.object.left = this.left;
		data.object.right = this.right;
		data.object.top = this.top;
		data.object.bottom = this.bottom;
		data.object.near = this.near;
		data.object.far = this.far;

		if ( this.view !== null ) data.object.view = Object.assign( {}, this.view );

		return data;

	}

}

class DirectionalLightShadow extends LightShadow {

	constructor() {

		super( new OrthographicCamera( - 5, 5, 5, - 5, 0.5, 500 ) );

		this.isDirectionalLightShadow = true;

	}

}

class DirectionalLight extends Light {

	constructor( color, intensity ) {

		super( color, intensity );

		this.isDirectionalLight = true;

		this.type = 'DirectionalLight';

		this.position.copy( Object3D.DEFAULT_UP );
		this.updateMatrix();

		this.target = new Object3D();

		this.shadow = new DirectionalLightShadow();

	}

	dispose() {

		this.shadow.dispose();

	}

	copy( source ) {

		super.copy( source );

		this.target = source.target.clone();
		this.shadow = source.shadow.clone();

		return this;

	}

}

class AmbientLight extends Light {

	constructor( color, intensity ) {

		super( color, intensity );

		this.isAmbientLight = true;

		this.type = 'AmbientLight';

	}

}

class RectAreaLight extends Light {

	constructor( color, intensity, width = 10, height = 10 ) {

		super( color, intensity );

		this.isRectAreaLight = true;

		this.type = 'RectAreaLight';

		this.width = width;
		this.height = height;

	}

	get power() {

		// compute the light's luminous power (in lumens) from its intensity (in nits)
		return this.intensity * this.width * this.height * Math.PI;

	}

	set power( power ) {

		// set the light's intensity (in nits) from the desired luminous power (in lumens)
		this.intensity = power / ( this.width * this.height * Math.PI );

	}

	copy( source ) {

		super.copy( source );

		this.width = source.width;
		this.height = source.height;

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.width = this.width;
		data.object.height = this.height;

		return data;

	}

}

/**
 * Primary reference:
 *   https://graphics.stanford.edu/papers/envmap/envmap.pdf
 *
 * Secondary reference:
 *   https://www.ppsloan.org/publications/StupidSH36.pdf
 */

// 3-band SH defined by 9 coefficients

class SphericalHarmonics3 {

	constructor() {

		this.isSphericalHarmonics3 = true;

		this.coefficients = [];

		for ( let i = 0; i < 9; i ++ ) {

			this.coefficients.push( new Vector3() );

		}

	}

	set( coefficients ) {

		for ( let i = 0; i < 9; i ++ ) {

			this.coefficients[ i ].copy( coefficients[ i ] );

		}

		return this;

	}

	zero() {

		for ( let i = 0; i < 9; i ++ ) {

			this.coefficients[ i ].set( 0, 0, 0 );

		}

		return this;

	}

	// get the radiance in the direction of the normal
	// target is a Vector3
	getAt( normal, target ) {

		// normal is assumed to be unit length

		const x = normal.x, y = normal.y, z = normal.z;

		const coeff = this.coefficients;

		// band 0
		target.copy( coeff[ 0 ] ).multiplyScalar( 0.282095 );

		// band 1
		target.addScaledVector( coeff[ 1 ], 0.488603 * y );
		target.addScaledVector( coeff[ 2 ], 0.488603 * z );
		target.addScaledVector( coeff[ 3 ], 0.488603 * x );

		// band 2
		target.addScaledVector( coeff[ 4 ], 1.092548 * ( x * y ) );
		target.addScaledVector( coeff[ 5 ], 1.092548 * ( y * z ) );
		target.addScaledVector( coeff[ 6 ], 0.315392 * ( 3.0 * z * z - 1.0 ) );
		target.addScaledVector( coeff[ 7 ], 1.092548 * ( x * z ) );
		target.addScaledVector( coeff[ 8 ], 0.546274 * ( x * x - y * y ) );

		return target;

	}

	// get the irradiance (radiance convolved with cosine lobe) in the direction of the normal
	// target is a Vector3
	// https://graphics.stanford.edu/papers/envmap/envmap.pdf
	getIrradianceAt( normal, target ) {

		// normal is assumed to be unit length

		const x = normal.x, y = normal.y, z = normal.z;

		const coeff = this.coefficients;

		// band 0
		target.copy( coeff[ 0 ] ).multiplyScalar( 0.886227 ); // π * 0.282095

		// band 1
		target.addScaledVector( coeff[ 1 ], 2.0 * 0.511664 * y ); // ( 2 * π / 3 ) * 0.488603
		target.addScaledVector( coeff[ 2 ], 2.0 * 0.511664 * z );
		target.addScaledVector( coeff[ 3 ], 2.0 * 0.511664 * x );

		// band 2
		target.addScaledVector( coeff[ 4 ], 2.0 * 0.429043 * x * y ); // ( π / 4 ) * 1.092548
		target.addScaledVector( coeff[ 5 ], 2.0 * 0.429043 * y * z );
		target.addScaledVector( coeff[ 6 ], 0.743125 * z * z - 0.247708 ); // ( π / 4 ) * 0.315392 * 3
		target.addScaledVector( coeff[ 7 ], 2.0 * 0.429043 * x * z );
		target.addScaledVector( coeff[ 8 ], 0.429043 * ( x * x - y * y ) ); // ( π / 4 ) * 0.546274

		return target;

	}

	add( sh ) {

		for ( let i = 0; i < 9; i ++ ) {

			this.coefficients[ i ].add( sh.coefficients[ i ] );

		}

		return this;

	}

	addScaledSH( sh, s ) {

		for ( let i = 0; i < 9; i ++ ) {

			this.coefficients[ i ].addScaledVector( sh.coefficients[ i ], s );

		}

		return this;

	}

	scale( s ) {

		for ( let i = 0; i < 9; i ++ ) {

			this.coefficients[ i ].multiplyScalar( s );

		}

		return this;

	}

	lerp( sh, alpha ) {

		for ( let i = 0; i < 9; i ++ ) {

			this.coefficients[ i ].lerp( sh.coefficients[ i ], alpha );

		}

		return this;

	}

	equals( sh ) {

		for ( let i = 0; i < 9; i ++ ) {

			if ( ! this.coefficients[ i ].equals( sh.coefficients[ i ] ) ) {

				return false;

			}

		}

		return true;

	}

	copy( sh ) {

		return this.set( sh.coefficients );

	}

	clone() {

		return new this.constructor().copy( this );

	}

	fromArray( array, offset = 0 ) {

		const coefficients = this.coefficients;

		for ( let i = 0; i < 9; i ++ ) {

			coefficients[ i ].fromArray( array, offset + ( i * 3 ) );

		}

		return this;

	}

	toArray( array = [], offset = 0 ) {

		const coefficients = this.coefficients;

		for ( let i = 0; i < 9; i ++ ) {

			coefficients[ i ].toArray( array, offset + ( i * 3 ) );

		}

		return array;

	}

	// evaluate the basis functions
	// shBasis is an Array[ 9 ]
	static getBasisAt( normal, shBasis ) {

		// normal is assumed to be unit length

		const x = normal.x, y = normal.y, z = normal.z;

		// band 0
		shBasis[ 0 ] = 0.282095;

		// band 1
		shBasis[ 1 ] = 0.488603 * y;
		shBasis[ 2 ] = 0.488603 * z;
		shBasis[ 3 ] = 0.488603 * x;

		// band 2
		shBasis[ 4 ] = 1.092548 * x * y;
		shBasis[ 5 ] = 1.092548 * y * z;
		shBasis[ 6 ] = 0.315392 * ( 3 * z * z - 1 );
		shBasis[ 7 ] = 1.092548 * x * z;
		shBasis[ 8 ] = 0.546274 * ( x * x - y * y );

	}

}

class LightProbe extends Light {

	constructor( sh = new SphericalHarmonics3(), intensity = 1 ) {

		super( undefined, intensity );

		this.isLightProbe = true;

		this.sh = sh;

	}

	copy( source ) {

		super.copy( source );

		this.sh.copy( source.sh );

		return this;

	}

	fromJSON( json ) {

		this.intensity = json.intensity; // TODO: Move this bit to Light.fromJSON();
		this.sh.fromArray( json.sh );

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.sh = this.sh.toArray();

		return data;

	}

}

class MaterialLoader extends Loader {

	constructor( manager ) {

		super( manager );
		this.textures = {};

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( JSON.parse( text ) ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parse( json ) {

		const textures = this.textures;

		function getTexture( name ) {

			if ( textures[ name ] === undefined ) {

				console.warn( 'THREE.MaterialLoader: Undefined texture', name );

			}

			return textures[ name ];

		}

		const material = this.createMaterialFromType( json.type );

		if ( json.uuid !== undefined ) material.uuid = json.uuid;
		if ( json.name !== undefined ) material.name = json.name;
		if ( json.color !== undefined && material.color !== undefined ) material.color.setHex( json.color );
		if ( json.roughness !== undefined ) material.roughness = json.roughness;
		if ( json.metalness !== undefined ) material.metalness = json.metalness;
		if ( json.sheen !== undefined ) material.sheen = json.sheen;
		if ( json.sheenColor !== undefined ) material.sheenColor = new Color().setHex( json.sheenColor );
		if ( json.sheenRoughness !== undefined ) material.sheenRoughness = json.sheenRoughness;
		if ( json.emissive !== undefined && material.emissive !== undefined ) material.emissive.setHex( json.emissive );
		if ( json.specular !== undefined && material.specular !== undefined ) material.specular.setHex( json.specular );
		if ( json.specularIntensity !== undefined ) material.specularIntensity = json.specularIntensity;
		if ( json.specularColor !== undefined && material.specularColor !== undefined ) material.specularColor.setHex( json.specularColor );
		if ( json.shininess !== undefined ) material.shininess = json.shininess;
		if ( json.clearcoat !== undefined ) material.clearcoat = json.clearcoat;
		if ( json.clearcoatRoughness !== undefined ) material.clearcoatRoughness = json.clearcoatRoughness;
		if ( json.dispersion !== undefined ) material.dispersion = json.dispersion;
		if ( json.iridescence !== undefined ) material.iridescence = json.iridescence;
		if ( json.iridescenceIOR !== undefined ) material.iridescenceIOR = json.iridescenceIOR;
		if ( json.iridescenceThicknessRange !== undefined ) material.iridescenceThicknessRange = json.iridescenceThicknessRange;
		if ( json.transmission !== undefined ) material.transmission = json.transmission;
		if ( json.thickness !== undefined ) material.thickness = json.thickness;
		if ( json.attenuationDistance !== undefined ) material.attenuationDistance = json.attenuationDistance;
		if ( json.attenuationColor !== undefined && material.attenuationColor !== undefined ) material.attenuationColor.setHex( json.attenuationColor );
		if ( json.anisotropy !== undefined ) material.anisotropy = json.anisotropy;
		if ( json.anisotropyRotation !== undefined ) material.anisotropyRotation = json.anisotropyRotation;
		if ( json.fog !== undefined ) material.fog = json.fog;
		if ( json.flatShading !== undefined ) material.flatShading = json.flatShading;
		if ( json.blending !== undefined ) material.blending = json.blending;
		if ( json.combine !== undefined ) material.combine = json.combine;
		if ( json.side !== undefined ) material.side = json.side;
		if ( json.shadowSide !== undefined ) material.shadowSide = json.shadowSide;
		if ( json.opacity !== undefined ) material.opacity = json.opacity;
		if ( json.transparent !== undefined ) material.transparent = json.transparent;
		if ( json.alphaTest !== undefined ) material.alphaTest = json.alphaTest;
		if ( json.alphaHash !== undefined ) material.alphaHash = json.alphaHash;
		if ( json.depthFunc !== undefined ) material.depthFunc = json.depthFunc;
		if ( json.depthTest !== undefined ) material.depthTest = json.depthTest;
		if ( json.depthWrite !== undefined ) material.depthWrite = json.depthWrite;
		if ( json.colorWrite !== undefined ) material.colorWrite = json.colorWrite;
		if ( json.blendSrc !== undefined ) material.blendSrc = json.blendSrc;
		if ( json.blendDst !== undefined ) material.blendDst = json.blendDst;
		if ( json.blendEquation !== undefined ) material.blendEquation = json.blendEquation;
		if ( json.blendSrcAlpha !== undefined ) material.blendSrcAlpha = json.blendSrcAlpha;
		if ( json.blendDstAlpha !== undefined ) material.blendDstAlpha = json.blendDstAlpha;
		if ( json.blendEquationAlpha !== undefined ) material.blendEquationAlpha = json.blendEquationAlpha;
		if ( json.blendColor !== undefined && material.blendColor !== undefined ) material.blendColor.setHex( json.blendColor );
		if ( json.blendAlpha !== undefined ) material.blendAlpha = json.blendAlpha;
		if ( json.stencilWriteMask !== undefined ) material.stencilWriteMask = json.stencilWriteMask;
		if ( json.stencilFunc !== undefined ) material.stencilFunc = json.stencilFunc;
		if ( json.stencilRef !== undefined ) material.stencilRef = json.stencilRef;
		if ( json.stencilFuncMask !== undefined ) material.stencilFuncMask = json.stencilFuncMask;
		if ( json.stencilFail !== undefined ) material.stencilFail = json.stencilFail;
		if ( json.stencilZFail !== undefined ) material.stencilZFail = json.stencilZFail;
		if ( json.stencilZPass !== undefined ) material.stencilZPass = json.stencilZPass;
		if ( json.stencilWrite !== undefined ) material.stencilWrite = json.stencilWrite;

		if ( json.wireframe !== undefined ) material.wireframe = json.wireframe;
		if ( json.wireframeLinewidth !== undefined ) material.wireframeLinewidth = json.wireframeLinewidth;
		if ( json.wireframeLinecap !== undefined ) material.wireframeLinecap = json.wireframeLinecap;
		if ( json.wireframeLinejoin !== undefined ) material.wireframeLinejoin = json.wireframeLinejoin;

		if ( json.rotation !== undefined ) material.rotation = json.rotation;

		if ( json.linewidth !== undefined ) material.linewidth = json.linewidth;
		if ( json.dashSize !== undefined ) material.dashSize = json.dashSize;
		if ( json.gapSize !== undefined ) material.gapSize = json.gapSize;
		if ( json.scale !== undefined ) material.scale = json.scale;

		if ( json.polygonOffset !== undefined ) material.polygonOffset = json.polygonOffset;
		if ( json.polygonOffsetFactor !== undefined ) material.polygonOffsetFactor = json.polygonOffsetFactor;
		if ( json.polygonOffsetUnits !== undefined ) material.polygonOffsetUnits = json.polygonOffsetUnits;

		if ( json.dithering !== undefined ) material.dithering = json.dithering;

		if ( json.alphaToCoverage !== undefined ) material.alphaToCoverage = json.alphaToCoverage;
		if ( json.premultipliedAlpha !== undefined ) material.premultipliedAlpha = json.premultipliedAlpha;
		if ( json.forceSinglePass !== undefined ) material.forceSinglePass = json.forceSinglePass;

		if ( json.visible !== undefined ) material.visible = json.visible;

		if ( json.toneMapped !== undefined ) material.toneMapped = json.toneMapped;

		if ( json.userData !== undefined ) material.userData = json.userData;

		if ( json.vertexColors !== undefined ) {

			if ( typeof json.vertexColors === 'number' ) {

				material.vertexColors = ( json.vertexColors > 0 ) ? true : false;

			} else {

				material.vertexColors = json.vertexColors;

			}

		}

		// Shader Material

		if ( json.uniforms !== undefined ) {

			for ( const name in json.uniforms ) {

				const uniform = json.uniforms[ name ];

				material.uniforms[ name ] = {};

				switch ( uniform.type ) {

					case 't':
						material.uniforms[ name ].value = getTexture( uniform.value );
						break;

					case 'c':
						material.uniforms[ name ].value = new Color().setHex( uniform.value );
						break;

					case 'v2':
						material.uniforms[ name ].value = new Vector2().fromArray( uniform.value );
						break;

					case 'v3':
						material.uniforms[ name ].value = new Vector3().fromArray( uniform.value );
						break;

					case 'v4':
						material.uniforms[ name ].value = new Vector4().fromArray( uniform.value );
						break;

					case 'm3':
						material.uniforms[ name ].value = new Matrix3().fromArray( uniform.value );
						break;

					case 'm4':
						material.uniforms[ name ].value = new Matrix4().fromArray( uniform.value );
						break;

					default:
						material.uniforms[ name ].value = uniform.value;

				}

			}

		}

		if ( json.defines !== undefined ) material.defines = json.defines;
		if ( json.vertexShader !== undefined ) material.vertexShader = json.vertexShader;
		if ( json.fragmentShader !== undefined ) material.fragmentShader = json.fragmentShader;
		if ( json.glslVersion !== undefined ) material.glslVersion = json.glslVersion;

		if ( json.extensions !== undefined ) {

			for ( const key in json.extensions ) {

				material.extensions[ key ] = json.extensions[ key ];

			}

		}

		if ( json.lights !== undefined ) material.lights = json.lights;
		if ( json.clipping !== undefined ) material.clipping = json.clipping;

		// for PointsMaterial

		if ( json.size !== undefined ) material.size = json.size;
		if ( json.sizeAttenuation !== undefined ) material.sizeAttenuation = json.sizeAttenuation;

		// maps

		if ( json.map !== undefined ) material.map = getTexture( json.map );
		if ( json.matcap !== undefined ) material.matcap = getTexture( json.matcap );

		if ( json.alphaMap !== undefined ) material.alphaMap = getTexture( json.alphaMap );

		if ( json.bumpMap !== undefined ) material.bumpMap = getTexture( json.bumpMap );
		if ( json.bumpScale !== undefined ) material.bumpScale = json.bumpScale;

		if ( json.normalMap !== undefined ) material.normalMap = getTexture( json.normalMap );
		if ( json.normalMapType !== undefined ) material.normalMapType = json.normalMapType;
		if ( json.normalScale !== undefined ) {

			let normalScale = json.normalScale;

			if ( Array.isArray( normalScale ) === false ) {

				// Blender exporter used to export a scalar. See #7459

				normalScale = [ normalScale, normalScale ];

			}

			material.normalScale = new Vector2().fromArray( normalScale );

		}

		if ( json.displacementMap !== undefined ) material.displacementMap = getTexture( json.displacementMap );
		if ( json.displacementScale !== undefined ) material.displacementScale = json.displacementScale;
		if ( json.displacementBias !== undefined ) material.displacementBias = json.displacementBias;

		if ( json.roughnessMap !== undefined ) material.roughnessMap = getTexture( json.roughnessMap );
		if ( json.metalnessMap !== undefined ) material.metalnessMap = getTexture( json.metalnessMap );

		if ( json.emissiveMap !== undefined ) material.emissiveMap = getTexture( json.emissiveMap );
		if ( json.emissiveIntensity !== undefined ) material.emissiveIntensity = json.emissiveIntensity;

		if ( json.specularMap !== undefined ) material.specularMap = getTexture( json.specularMap );
		if ( json.specularIntensityMap !== undefined ) material.specularIntensityMap = getTexture( json.specularIntensityMap );
		if ( json.specularColorMap !== undefined ) material.specularColorMap = getTexture( json.specularColorMap );

		if ( json.envMap !== undefined ) material.envMap = getTexture( json.envMap );
		if ( json.envMapRotation !== undefined ) material.envMapRotation.fromArray( json.envMapRotation );
		if ( json.envMapIntensity !== undefined ) material.envMapIntensity = json.envMapIntensity;

		if ( json.reflectivity !== undefined ) material.reflectivity = json.reflectivity;
		if ( json.refractionRatio !== undefined ) material.refractionRatio = json.refractionRatio;

		if ( json.lightMap !== undefined ) material.lightMap = getTexture( json.lightMap );
		if ( json.lightMapIntensity !== undefined ) material.lightMapIntensity = json.lightMapIntensity;

		if ( json.aoMap !== undefined ) material.aoMap = getTexture( json.aoMap );
		if ( json.aoMapIntensity !== undefined ) material.aoMapIntensity = json.aoMapIntensity;

		if ( json.gradientMap !== undefined ) material.gradientMap = getTexture( json.gradientMap );

		if ( json.clearcoatMap !== undefined ) material.clearcoatMap = getTexture( json.clearcoatMap );
		if ( json.clearcoatRoughnessMap !== undefined ) material.clearcoatRoughnessMap = getTexture( json.clearcoatRoughnessMap );
		if ( json.clearcoatNormalMap !== undefined ) material.clearcoatNormalMap = getTexture( json.clearcoatNormalMap );
		if ( json.clearcoatNormalScale !== undefined ) material.clearcoatNormalScale = new Vector2().fromArray( json.clearcoatNormalScale );

		if ( json.iridescenceMap !== undefined ) material.iridescenceMap = getTexture( json.iridescenceMap );
		if ( json.iridescenceThicknessMap !== undefined ) material.iridescenceThicknessMap = getTexture( json.iridescenceThicknessMap );

		if ( json.transmissionMap !== undefined ) material.transmissionMap = getTexture( json.transmissionMap );
		if ( json.thicknessMap !== undefined ) material.thicknessMap = getTexture( json.thicknessMap );

		if ( json.anisotropyMap !== undefined ) material.anisotropyMap = getTexture( json.anisotropyMap );

		if ( json.sheenColorMap !== undefined ) material.sheenColorMap = getTexture( json.sheenColorMap );
		if ( json.sheenRoughnessMap !== undefined ) material.sheenRoughnessMap = getTexture( json.sheenRoughnessMap );

		return material;

	}

	setTextures( value ) {

		this.textures = value;
		return this;

	}

	createMaterialFromType( type ) {

		return MaterialLoader.createMaterialFromType( type );

	}

	static createMaterialFromType( type ) {

		const materialLib = {
			ShadowMaterial,
			SpriteMaterial,
			RawShaderMaterial,
			ShaderMaterial,
			PointsMaterial,
			MeshPhysicalMaterial,
			MeshStandardMaterial,
			MeshPhongMaterial,
			MeshToonMaterial,
			MeshNormalMaterial,
			MeshLambertMaterial,
			MeshDepthMaterial,
			MeshDistanceMaterial,
			MeshBasicMaterial,
			MeshMatcapMaterial,
			LineDashedMaterial,
			LineBasicMaterial,
			Material
		};

		return new materialLib[ type ]();

	}

}

class LoaderUtils {

	static decodeText( array ) { // @deprecated, r165

		console.warn( 'THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead.' );

		if ( typeof TextDecoder !== 'undefined' ) {

			return new TextDecoder().decode( array );

		}

		// Avoid the String.fromCharCode.apply(null, array) shortcut, which
		// throws a "maximum call stack size exceeded" error for large arrays.

		let s = '';

		for ( let i = 0, il = array.length; i < il; i ++ ) {

			// Implicitly assumes little-endian.
			s += String.fromCharCode( array[ i ] );

		}

		try {

			// merges multi-byte utf-8 characters.

			return decodeURIComponent( escape( s ) );

		} catch ( e ) { // see #16358

			return s;

		}

	}

	static extractUrlBase( url ) {

		const index = url.lastIndexOf( '/' );

		if ( index === - 1 ) return './';

		return url.slice( 0, index + 1 );

	}

	static resolveURL( url, path ) {

		// Invalid URL
		if ( typeof url !== 'string' || url === '' ) return '';

		// Host Relative URL
		if ( /^https?:\/\//i.test( path ) && /^\//.test( url ) ) {

			path = path.replace( /(^https?:\/\/[^\/]+).*/i, '$1' );

		}

		// Absolute URL http://,https://,//
		if ( /^(https?:)?\/\//i.test( url ) ) return url;

		// Data URI
		if ( /^data:.*,.*$/i.test( url ) ) return url;

		// Blob URL
		if ( /^blob:.*$/i.test( url ) ) return url;

		// Relative URL
		return path + url;

	}

}

class InstancedBufferGeometry extends BufferGeometry {

	constructor() {

		super();

		this.isInstancedBufferGeometry = true;

		this.type = 'InstancedBufferGeometry';
		this.instanceCount = Infinity;

	}

	copy( source ) {

		super.copy( source );

		this.instanceCount = source.instanceCount;

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		data.instanceCount = this.instanceCount;

		data.isInstancedBufferGeometry = true;

		return data;

	}

}

class BufferGeometryLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( JSON.parse( text ) ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parse( json ) {

		const interleavedBufferMap = {};
		const arrayBufferMap = {};

		function getInterleavedBuffer( json, uuid ) {

			if ( interleavedBufferMap[ uuid ] !== undefined ) return interleavedBufferMap[ uuid ];

			const interleavedBuffers = json.interleavedBuffers;
			const interleavedBuffer = interleavedBuffers[ uuid ];

			const buffer = getArrayBuffer( json, interleavedBuffer.buffer );

			const array = getTypedArray( interleavedBuffer.type, buffer );
			const ib = new InterleavedBuffer( array, interleavedBuffer.stride );
			ib.uuid = interleavedBuffer.uuid;

			interleavedBufferMap[ uuid ] = ib;

			return ib;

		}

		function getArrayBuffer( json, uuid ) {

			if ( arrayBufferMap[ uuid ] !== undefined ) return arrayBufferMap[ uuid ];

			const arrayBuffers = json.arrayBuffers;
			const arrayBuffer = arrayBuffers[ uuid ];

			const ab = new Uint32Array( arrayBuffer ).buffer;

			arrayBufferMap[ uuid ] = ab;

			return ab;

		}

		const geometry = json.isInstancedBufferGeometry ? new InstancedBufferGeometry() : new BufferGeometry();

		const index = json.data.index;

		if ( index !== undefined ) {

			const typedArray = getTypedArray( index.type, index.array );
			geometry.setIndex( new BufferAttribute( typedArray, 1 ) );

		}

		const attributes = json.data.attributes;

		for ( const key in attributes ) {

			const attribute = attributes[ key ];
			let bufferAttribute;

			if ( attribute.isInterleavedBufferAttribute ) {

				const interleavedBuffer = getInterleavedBuffer( json.data, attribute.data );
				bufferAttribute = new InterleavedBufferAttribute( interleavedBuffer, attribute.itemSize, attribute.offset, attribute.normalized );

			} else {

				const typedArray = getTypedArray( attribute.type, attribute.array );
				const bufferAttributeConstr = attribute.isInstancedBufferAttribute ? InstancedBufferAttribute : BufferAttribute;
				bufferAttribute = new bufferAttributeConstr( typedArray, attribute.itemSize, attribute.normalized );

			}

			if ( attribute.name !== undefined ) bufferAttribute.name = attribute.name;
			if ( attribute.usage !== undefined ) bufferAttribute.setUsage( attribute.usage );

			geometry.setAttribute( key, bufferAttribute );

		}

		const morphAttributes = json.data.morphAttributes;

		if ( morphAttributes ) {

			for ( const key in morphAttributes ) {

				const attributeArray = morphAttributes[ key ];

				const array = [];

				for ( let i = 0, il = attributeArray.length; i < il; i ++ ) {

					const attribute = attributeArray[ i ];
					let bufferAttribute;

					if ( attribute.isInterleavedBufferAttribute ) {

						const interleavedBuffer = getInterleavedBuffer( json.data, attribute.data );
						bufferAttribute = new InterleavedBufferAttribute( interleavedBuffer, attribute.itemSize, attribute.offset, attribute.normalized );

					} else {

						const typedArray = getTypedArray( attribute.type, attribute.array );
						bufferAttribute = new BufferAttribute( typedArray, attribute.itemSize, attribute.normalized );

					}

					if ( attribute.name !== undefined ) bufferAttribute.name = attribute.name;
					array.push( bufferAttribute );

				}

				geometry.morphAttributes[ key ] = array;

			}

		}

		const morphTargetsRelative = json.data.morphTargetsRelative;

		if ( morphTargetsRelative ) {

			geometry.morphTargetsRelative = true;

		}

		const groups = json.data.groups || json.data.drawcalls || json.data.offsets;

		if ( groups !== undefined ) {

			for ( let i = 0, n = groups.length; i !== n; ++ i ) {

				const group = groups[ i ];

				geometry.addGroup( group.start, group.count, group.materialIndex );

			}

		}

		const boundingSphere = json.data.boundingSphere;

		if ( boundingSphere !== undefined ) {

			const center = new Vector3();

			if ( boundingSphere.center !== undefined ) {

				center.fromArray( boundingSphere.center );

			}

			geometry.boundingSphere = new Sphere( center, boundingSphere.radius );

		}

		if ( json.name ) geometry.name = json.name;
		if ( json.userData ) geometry.userData = json.userData;

		return geometry;

	}

}

class ObjectLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const path = ( this.path === '' ) ? LoaderUtils.extractUrlBase( url ) : this.path;
		this.resourcePath = this.resourcePath || path;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, function ( text ) {

			let json = null;

			try {

				json = JSON.parse( text );

			} catch ( error ) {

				if ( onError !== undefined ) onError( error );

				console.error( 'THREE:ObjectLoader: Can\'t parse ' + url + '.', error.message );

				return;

			}

			const metadata = json.metadata;

			if ( metadata === undefined || metadata.type === undefined || metadata.type.toLowerCase() === 'geometry' ) {

				if ( onError !== undefined ) onError( new Error( 'THREE.ObjectLoader: Can\'t load ' + url ) );

				console.error( 'THREE.ObjectLoader: Can\'t load ' + url );
				return;

			}

			scope.parse( json, onLoad );

		}, onProgress, onError );

	}

	async loadAsync( url, onProgress ) {

		const scope = this;

		const path = ( this.path === '' ) ? LoaderUtils.extractUrlBase( url ) : this.path;
		this.resourcePath = this.resourcePath || path;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );

		const text = await loader.loadAsync( url, onProgress );

		const json = JSON.parse( text );

		const metadata = json.metadata;

		if ( metadata === undefined || metadata.type === undefined || metadata.type.toLowerCase() === 'geometry' ) {

			throw new Error( 'THREE.ObjectLoader: Can\'t load ' + url );

		}

		return await scope.parseAsync( json );

	}

	parse( json, onLoad ) {

		const animations = this.parseAnimations( json.animations );
		const shapes = this.parseShapes( json.shapes );
		const geometries = this.parseGeometries( json.geometries, shapes );

		const images = this.parseImages( json.images, function () {

			if ( onLoad !== undefined ) onLoad( object );

		} );

		const textures = this.parseTextures( json.textures, images );
		const materials = this.parseMaterials( json.materials, textures );

		const object = this.parseObject( json.object, geometries, materials, textures, animations );
		const skeletons = this.parseSkeletons( json.skeletons, object );

		this.bindSkeletons( object, skeletons );
		this.bindLightTargets( object );

		//

		if ( onLoad !== undefined ) {

			let hasImages = false;

			for ( const uuid in images ) {

				if ( images[ uuid ].data instanceof HTMLImageElement ) {

					hasImages = true;
					break;

				}

			}

			if ( hasImages === false ) onLoad( object );

		}

		return object;

	}

	async parseAsync( json ) {

		const animations = this.parseAnimations( json.animations );
		const shapes = this.parseShapes( json.shapes );
		const geometries = this.parseGeometries( json.geometries, shapes );

		const images = await this.parseImagesAsync( json.images );

		const textures = this.parseTextures( json.textures, images );
		const materials = this.parseMaterials( json.materials, textures );

		const object = this.parseObject( json.object, geometries, materials, textures, animations );
		const skeletons = this.parseSkeletons( json.skeletons, object );

		this.bindSkeletons( object, skeletons );
		this.bindLightTargets( object );

		return object;

	}

	parseShapes( json ) {

		const shapes = {};

		if ( json !== undefined ) {

			for ( let i = 0, l = json.length; i < l; i ++ ) {

				const shape = new Shape().fromJSON( json[ i ] );

				shapes[ shape.uuid ] = shape;

			}

		}

		return shapes;

	}

	parseSkeletons( json, object ) {

		const skeletons = {};
		const bones = {};

		// generate bone lookup table

		object.traverse( function ( child ) {

			if ( child.isBone ) bones[ child.uuid ] = child;

		} );

		// create skeletons

		if ( json !== undefined ) {

			for ( let i = 0, l = json.length; i < l; i ++ ) {

				const skeleton = new Skeleton().fromJSON( json[ i ], bones );

				skeletons[ skeleton.uuid ] = skeleton;

			}

		}

		return skeletons;

	}

	parseGeometries( json, shapes ) {

		const geometries = {};

		if ( json !== undefined ) {

			const bufferGeometryLoader = new BufferGeometryLoader();

			for ( let i = 0, l = json.length; i < l; i ++ ) {

				let geometry;
				const data = json[ i ];

				switch ( data.type ) {

					case 'BufferGeometry':
					case 'InstancedBufferGeometry':

						geometry = bufferGeometryLoader.parse( data );
						break;

					default:

						if ( data.type in Geometries ) {

							geometry = Geometries[ data.type ].fromJSON( data, shapes );

						} else {

							console.warn( `THREE.ObjectLoader: Unsupported geometry type "${ data.type }"` );

						}

				}

				geometry.uuid = data.uuid;

				if ( data.name !== undefined ) geometry.name = data.name;
				if ( data.userData !== undefined ) geometry.userData = data.userData;

				geometries[ data.uuid ] = geometry;

			}

		}

		return geometries;

	}

	parseMaterials( json, textures ) {

		const cache = {}; // MultiMaterial
		const materials = {};

		if ( json !== undefined ) {

			const loader = new MaterialLoader();
			loader.setTextures( textures );

			for ( let i = 0, l = json.length; i < l; i ++ ) {

				const data = json[ i ];

				if ( cache[ data.uuid ] === undefined ) {

					cache[ data.uuid ] = loader.parse( data );

				}

				materials[ data.uuid ] = cache[ data.uuid ];

			}

		}

		return materials;

	}

	parseAnimations( json ) {

		const animations = {};

		if ( json !== undefined ) {

			for ( let i = 0; i < json.length; i ++ ) {

				const data = json[ i ];

				const clip = AnimationClip.parse( data );

				animations[ clip.uuid ] = clip;

			}

		}

		return animations;

	}

	parseImages( json, onLoad ) {

		const scope = this;
		const images = {};

		let loader;

		function loadImage( url ) {

			scope.manager.itemStart( url );

			return loader.load( url, function () {

				scope.manager.itemEnd( url );

			}, undefined, function () {

				scope.manager.itemError( url );
				scope.manager.itemEnd( url );

			} );

		}

		function deserializeImage( image ) {

			if ( typeof image === 'string' ) {

				const url = image;

				const path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test( url ) ? url : scope.resourcePath + url;

				return loadImage( path );

			} else {

				if ( image.data ) {

					return {
						data: getTypedArray( image.type, image.data ),
						width: image.width,
						height: image.height
					};

				} else {

					return null;

				}

			}

		}

		if ( json !== undefined && json.length > 0 ) {

			const manager = new LoadingManager( onLoad );

			loader = new ImageLoader( manager );
			loader.setCrossOrigin( this.crossOrigin );

			for ( let i = 0, il = json.length; i < il; i ++ ) {

				const image = json[ i ];
				const url = image.url;

				if ( Array.isArray( url ) ) {

					// load array of images e.g CubeTexture

					const imageArray = [];

					for ( let j = 0, jl = url.length; j < jl; j ++ ) {

						const currentUrl = url[ j ];

						const deserializedImage = deserializeImage( currentUrl );

						if ( deserializedImage !== null ) {

							if ( deserializedImage instanceof HTMLImageElement ) {

								imageArray.push( deserializedImage );

							} else {

								// special case: handle array of data textures for cube textures

								imageArray.push( new DataTexture( deserializedImage.data, deserializedImage.width, deserializedImage.height ) );

							}

						}

					}

					images[ image.uuid ] = new Source( imageArray );

				} else {

					// load single image

					const deserializedImage = deserializeImage( image.url );
					images[ image.uuid ] = new Source( deserializedImage );


				}

			}

		}

		return images;

	}

	async parseImagesAsync( json ) {

		const scope = this;
		const images = {};

		let loader;

		async function deserializeImage( image ) {

			if ( typeof image === 'string' ) {

				const url = image;

				const path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test( url ) ? url : scope.resourcePath + url;

				return await loader.loadAsync( path );

			} else {

				if ( image.data ) {

					return {
						data: getTypedArray( image.type, image.data ),
						width: image.width,
						height: image.height
					};

				} else {

					return null;

				}

			}

		}

		if ( json !== undefined && json.length > 0 ) {

			loader = new ImageLoader( this.manager );
			loader.setCrossOrigin( this.crossOrigin );

			for ( let i = 0, il = json.length; i < il; i ++ ) {

				const image = json[ i ];
				const url = image.url;

				if ( Array.isArray( url ) ) {

					// load array of images e.g CubeTexture

					const imageArray = [];

					for ( let j = 0, jl = url.length; j < jl; j ++ ) {

						const currentUrl = url[ j ];

						const deserializedImage = await deserializeImage( currentUrl );

						if ( deserializedImage !== null ) {

							if ( deserializedImage instanceof HTMLImageElement ) {

								imageArray.push( deserializedImage );

							} else {

								// special case: handle array of data textures for cube textures

								imageArray.push( new DataTexture( deserializedImage.data, deserializedImage.width, deserializedImage.height ) );

							}

						}

					}

					images[ image.uuid ] = new Source( imageArray );

				} else {

					// load single image

					const deserializedImage = await deserializeImage( image.url );
					images[ image.uuid ] = new Source( deserializedImage );

				}

			}

		}

		return images;

	}

	parseTextures( json, images ) {

		function parseConstant( value, type ) {

			if ( typeof value === 'number' ) return value;

			console.warn( 'THREE.ObjectLoader.parseTexture: Constant should be in numeric form.', value );

			return type[ value ];

		}

		const textures = {};

		if ( json !== undefined ) {

			for ( let i = 0, l = json.length; i < l; i ++ ) {

				const data = json[ i ];

				if ( data.image === undefined ) {

					console.warn( 'THREE.ObjectLoader: No "image" specified for', data.uuid );

				}

				if ( images[ data.image ] === undefined ) {

					console.warn( 'THREE.ObjectLoader: Undefined image', data.image );

				}

				const source = images[ data.image ];
				const image = source.data;

				let texture;

				if ( Array.isArray( image ) ) {

					texture = new CubeTexture();

					if ( image.length === 6 ) texture.needsUpdate = true;

				} else {

					if ( image && image.data ) {

						texture = new DataTexture();

					} else {

						texture = new Texture();

					}

					if ( image ) texture.needsUpdate = true; // textures can have undefined image data

				}

				texture.source = source;

				texture.uuid = data.uuid;

				if ( data.name !== undefined ) texture.name = data.name;

				if ( data.mapping !== undefined ) texture.mapping = parseConstant( data.mapping, TEXTURE_MAPPING );
				if ( data.channel !== undefined ) texture.channel = data.channel;

				if ( data.offset !== undefined ) texture.offset.fromArray( data.offset );
				if ( data.repeat !== undefined ) texture.repeat.fromArray( data.repeat );
				if ( data.center !== undefined ) texture.center.fromArray( data.center );
				if ( data.rotation !== undefined ) texture.rotation = data.rotation;

				if ( data.wrap !== undefined ) {

					texture.wrapS = parseConstant( data.wrap[ 0 ], TEXTURE_WRAPPING );
					texture.wrapT = parseConstant( data.wrap[ 1 ], TEXTURE_WRAPPING );

				}

				if ( data.format !== undefined ) texture.format = data.format;
				if ( data.internalFormat !== undefined ) texture.internalFormat = data.internalFormat;
				if ( data.type !== undefined ) texture.type = data.type;
				if ( data.colorSpace !== undefined ) texture.colorSpace = data.colorSpace;

				if ( data.minFilter !== undefined ) texture.minFilter = parseConstant( data.minFilter, TEXTURE_FILTER );
				if ( data.magFilter !== undefined ) texture.magFilter = parseConstant( data.magFilter, TEXTURE_FILTER );
				if ( data.anisotropy !== undefined ) texture.anisotropy = data.anisotropy;

				if ( data.flipY !== undefined ) texture.flipY = data.flipY;

				if ( data.generateMipmaps !== undefined ) texture.generateMipmaps = data.generateMipmaps;
				if ( data.premultiplyAlpha !== undefined ) texture.premultiplyAlpha = data.premultiplyAlpha;
				if ( data.unpackAlignment !== undefined ) texture.unpackAlignment = data.unpackAlignment;
				if ( data.compareFunction !== undefined ) texture.compareFunction = data.compareFunction;

				if ( data.userData !== undefined ) texture.userData = data.userData;

				textures[ data.uuid ] = texture;

			}

		}

		return textures;

	}

	parseObject( data, geometries, materials, textures, animations ) {

		let object;

		function getGeometry( name ) {

			if ( geometries[ name ] === undefined ) {

				console.warn( 'THREE.ObjectLoader: Undefined geometry', name );

			}

			return geometries[ name ];

		}

		function getMaterial( name ) {

			if ( name === undefined ) return undefined;

			if ( Array.isArray( name ) ) {

				const array = [];

				for ( let i = 0, l = name.length; i < l; i ++ ) {

					const uuid = name[ i ];

					if ( materials[ uuid ] === undefined ) {

						console.warn( 'THREE.ObjectLoader: Undefined material', uuid );

					}

					array.push( materials[ uuid ] );

				}

				return array;

			}

			if ( materials[ name ] === undefined ) {

				console.warn( 'THREE.ObjectLoader: Undefined material', name );

			}

			return materials[ name ];

		}

		function getTexture( uuid ) {

			if ( textures[ uuid ] === undefined ) {

				console.warn( 'THREE.ObjectLoader: Undefined texture', uuid );

			}

			return textures[ uuid ];

		}

		let geometry, material;

		switch ( data.type ) {

			case 'Scene':

				object = new Scene();

				if ( data.background !== undefined ) {

					if ( Number.isInteger( data.background ) ) {

						object.background = new Color( data.background );

					} else {

						object.background = getTexture( data.background );

					}

				}

				if ( data.environment !== undefined ) {

					object.environment = getTexture( data.environment );

				}

				if ( data.fog !== undefined ) {

					if ( data.fog.type === 'Fog' ) {

						object.fog = new Fog( data.fog.color, data.fog.near, data.fog.far );

					} else if ( data.fog.type === 'FogExp2' ) {

						object.fog = new FogExp2( data.fog.color, data.fog.density );

					}

					if ( data.fog.name !== '' ) {

						object.fog.name = data.fog.name;

					}

				}

				if ( data.backgroundBlurriness !== undefined ) object.backgroundBlurriness = data.backgroundBlurriness;
				if ( data.backgroundIntensity !== undefined ) object.backgroundIntensity = data.backgroundIntensity;
				if ( data.backgroundRotation !== undefined ) object.backgroundRotation.fromArray( data.backgroundRotation );

				if ( data.environmentIntensity !== undefined ) object.environmentIntensity = data.environmentIntensity;
				if ( data.environmentRotation !== undefined ) object.environmentRotation.fromArray( data.environmentRotation );

				break;

			case 'PerspectiveCamera':

				object = new PerspectiveCamera( data.fov, data.aspect, data.near, data.far );

				if ( data.focus !== undefined ) object.focus = data.focus;
				if ( data.zoom !== undefined ) object.zoom = data.zoom;
				if ( data.filmGauge !== undefined ) object.filmGauge = data.filmGauge;
				if ( data.filmOffset !== undefined ) object.filmOffset = data.filmOffset;
				if ( data.view !== undefined ) object.view = Object.assign( {}, data.view );

				break;

			case 'OrthographicCamera':

				object = new OrthographicCamera( data.left, data.right, data.top, data.bottom, data.near, data.far );

				if ( data.zoom !== undefined ) object.zoom = data.zoom;
				if ( data.view !== undefined ) object.view = Object.assign( {}, data.view );

				break;

			case 'AmbientLight':

				object = new AmbientLight( data.color, data.intensity );

				break;

			case 'DirectionalLight':

				object = new DirectionalLight( data.color, data.intensity );
				object.target = data.target || '';

				break;

			case 'PointLight':

				object = new PointLight( data.color, data.intensity, data.distance, data.decay );

				break;

			case 'RectAreaLight':

				object = new RectAreaLight( data.color, data.intensity, data.width, data.height );

				break;

			case 'SpotLight':

				object = new SpotLight( data.color, data.intensity, data.distance, data.angle, data.penumbra, data.decay );
				object.target = data.target || '';

				break;

			case 'HemisphereLight':

				object = new HemisphereLight( data.color, data.groundColor, data.intensity );

				break;

			case 'LightProbe':

				object = new LightProbe().fromJSON( data );

				break;

			case 'SkinnedMesh':

				geometry = getGeometry( data.geometry );
			 	material = getMaterial( data.material );

				object = new SkinnedMesh( geometry, material );

				if ( data.bindMode !== undefined ) object.bindMode = data.bindMode;
				if ( data.bindMatrix !== undefined ) object.bindMatrix.fromArray( data.bindMatrix );
				if ( data.skeleton !== undefined ) object.skeleton = data.skeleton;

				break;

			case 'Mesh':

				geometry = getGeometry( data.geometry );
				material = getMaterial( data.material );

				object = new Mesh( geometry, material );

				break;

			case 'InstancedMesh':

				geometry = getGeometry( data.geometry );
				material = getMaterial( data.material );
				const count = data.count;
				const instanceMatrix = data.instanceMatrix;
				const instanceColor = data.instanceColor;

				object = new InstancedMesh( geometry, material, count );
				object.instanceMatrix = new InstancedBufferAttribute( new Float32Array( instanceMatrix.array ), 16 );
				if ( instanceColor !== undefined ) object.instanceColor = new InstancedBufferAttribute( new Float32Array( instanceColor.array ), instanceColor.itemSize );

				break;

			case 'BatchedMesh':

				geometry = getGeometry( data.geometry );
				material = getMaterial( data.material );

				object = new BatchedMesh( data.maxInstanceCount, data.maxVertexCount, data.maxIndexCount, material );
				object.geometry = geometry;
				object.perObjectFrustumCulled = data.perObjectFrustumCulled;
				object.sortObjects = data.sortObjects;

				object._drawRanges = data.drawRanges;
				object._reservedRanges = data.reservedRanges;

				object._visibility = data.visibility;
				object._active = data.active;
				object._bounds = data.bounds.map( bound => {

					const box = new Box3();
					box.min.fromArray( bound.boxMin );
					box.max.fromArray( bound.boxMax );

					const sphere = new Sphere();
					sphere.radius = bound.sphereRadius;
					sphere.center.fromArray( bound.sphereCenter );

					return {
						boxInitialized: bound.boxInitialized,
						box: box,

						sphereInitialized: bound.sphereInitialized,
						sphere: sphere
					};

				} );

				object._maxInstanceCount = data.maxInstanceCount;
				object._maxVertexCount = data.maxVertexCount;
				object._maxIndexCount = data.maxIndexCount;

				object._geometryInitialized = data.geometryInitialized;
				object._geometryCount = data.geometryCount;

				object._matricesTexture = getTexture( data.matricesTexture.uuid );
				if ( data.colorsTexture !== undefined ) object._colorsTexture = getTexture( data.colorsTexture.uuid );

				break;

			case 'LOD':

				object = new LOD();

				break;

			case 'Line':

				object = new Line( getGeometry( data.geometry ), getMaterial( data.material ) );

				break;

			case 'LineLoop':

				object = new LineLoop( getGeometry( data.geometry ), getMaterial( data.material ) );

				break;

			case 'LineSegments':

				object = new LineSegments( getGeometry( data.geometry ), getMaterial( data.material ) );

				break;

			case 'PointCloud':
			case 'Points':

				object = new Points( getGeometry( data.geometry ), getMaterial( data.material ) );

				break;

			case 'Sprite':

				object = new Sprite( getMaterial( data.material ) );

				break;

			case 'Group':

				object = new Group();

				break;

			case 'Bone':

				object = new Bone();

				break;

			default:

				object = new Object3D();

		}

		object.uuid = data.uuid;

		if ( data.name !== undefined ) object.name = data.name;

		if ( data.matrix !== undefined ) {

			object.matrix.fromArray( data.matrix );

			if ( data.matrixAutoUpdate !== undefined ) object.matrixAutoUpdate = data.matrixAutoUpdate;
			if ( object.matrixAutoUpdate ) object.matrix.decompose( object.position, object.quaternion, object.scale );

		} else {

			if ( data.position !== undefined ) object.position.fromArray( data.position );
			if ( data.rotation !== undefined ) object.rotation.fromArray( data.rotation );
			if ( data.quaternion !== undefined ) object.quaternion.fromArray( data.quaternion );
			if ( data.scale !== undefined ) object.scale.fromArray( data.scale );

		}

		if ( data.up !== undefined ) object.up.fromArray( data.up );

		if ( data.castShadow !== undefined ) object.castShadow = data.castShadow;
		if ( data.receiveShadow !== undefined ) object.receiveShadow = data.receiveShadow;

		if ( data.shadow ) {

			if ( data.shadow.intensity !== undefined ) object.shadow.intensity = data.shadow.intensity;
			if ( data.shadow.bias !== undefined ) object.shadow.bias = data.shadow.bias;
			if ( data.shadow.normalBias !== undefined ) object.shadow.normalBias = data.shadow.normalBias;
			if ( data.shadow.radius !== undefined ) object.shadow.radius = data.shadow.radius;
			if ( data.shadow.mapSize !== undefined ) object.shadow.mapSize.fromArray( data.shadow.mapSize );
			if ( data.shadow.camera !== undefined ) object.shadow.camera = this.parseObject( data.shadow.camera );

		}

		if ( data.visible !== undefined ) object.visible = data.visible;
		if ( data.frustumCulled !== undefined ) object.frustumCulled = data.frustumCulled;
		if ( data.renderOrder !== undefined ) object.renderOrder = data.renderOrder;
		if ( data.userData !== undefined ) object.userData = data.userData;
		if ( data.layers !== undefined ) object.layers.mask = data.layers;

		if ( data.children !== undefined ) {

			const children = data.children;

			for ( let i = 0; i < children.length; i ++ ) {

				object.add( this.parseObject( children[ i ], geometries, materials, textures, animations ) );

			}

		}

		if ( data.animations !== undefined ) {

			const objectAnimations = data.animations;

			for ( let i = 0; i < objectAnimations.length; i ++ ) {

				const uuid = objectAnimations[ i ];

				object.animations.push( animations[ uuid ] );

			}

		}

		if ( data.type === 'LOD' ) {

			if ( data.autoUpdate !== undefined ) object.autoUpdate = data.autoUpdate;

			const levels = data.levels;

			for ( let l = 0; l < levels.length; l ++ ) {

				const level = levels[ l ];
				const child = object.getObjectByProperty( 'uuid', level.object );

				if ( child !== undefined ) {

					object.addLevel( child, level.distance, level.hysteresis );

				}

			}

		}

		return object;

	}

	bindSkeletons( object, skeletons ) {

		if ( Object.keys( skeletons ).length === 0 ) return;

		object.traverse( function ( child ) {

			if ( child.isSkinnedMesh === true && child.skeleton !== undefined ) {

				const skeleton = skeletons[ child.skeleton ];

				if ( skeleton === undefined ) {

					console.warn( 'THREE.ObjectLoader: No skeleton found with UUID:', child.skeleton );

				} else {

					child.bind( skeleton, child.bindMatrix );

				}

			}

		} );

	}

	bindLightTargets( object ) {

		object.traverse( function ( child ) {

			if ( child.isDirectionalLight || child.isSpotLight ) {

				const uuid = child.target;

				const target = object.getObjectByProperty( 'uuid', uuid );

				if ( target !== undefined ) {

					child.target = target;

				} else {

					child.target = new Object3D();

				}

			}

		} );

	}

}

const TEXTURE_MAPPING = {
	UVMapping: UVMapping,
	CubeReflectionMapping: CubeReflectionMapping,
	CubeRefractionMapping: CubeRefractionMapping,
	EquirectangularReflectionMapping: EquirectangularReflectionMapping,
	EquirectangularRefractionMapping: EquirectangularRefractionMapping,
	CubeUVReflectionMapping: CubeUVReflectionMapping
};

const TEXTURE_WRAPPING = {
	RepeatWrapping: RepeatWrapping,
	ClampToEdgeWrapping: ClampToEdgeWrapping,
	MirroredRepeatWrapping: MirroredRepeatWrapping
};

const TEXTURE_FILTER = {
	NearestFilter: NearestFilter,
	NearestMipmapNearestFilter: NearestMipmapNearestFilter,
	NearestMipmapLinearFilter: NearestMipmapLinearFilter,
	LinearFilter: LinearFilter,
	LinearMipmapNearestFilter: LinearMipmapNearestFilter,
	LinearMipmapLinearFilter: LinearMipmapLinearFilter
};

class ImageBitmapLoader extends Loader {

	constructor( manager ) {

		super( manager );

		this.isImageBitmapLoader = true;

		if ( typeof createImageBitmap === 'undefined' ) {

			console.warn( 'THREE.ImageBitmapLoader: createImageBitmap() not supported.' );

		}

		if ( typeof fetch === 'undefined' ) {

			console.warn( 'THREE.ImageBitmapLoader: fetch() not supported.' );

		}

		this.options = { premultiplyAlpha: 'none' };

	}

	setOptions( options ) {

		this.options = options;

		return this;

	}

	load( url, onLoad, onProgress, onError ) {

		if ( url === undefined ) url = '';

		if ( this.path !== undefined ) url = this.path + url;

		url = this.manager.resolveURL( url );

		const scope = this;

		const cached = Cache.get( url );

		if ( cached !== undefined ) {

			scope.manager.itemStart( url );

			// If cached is a promise, wait for it to resolve
			if ( cached.then ) {

				cached.then( imageBitmap => {

					if ( onLoad ) onLoad( imageBitmap );

					scope.manager.itemEnd( url );

				} ).catch( e => {

					if ( onError ) onError( e );

				} );
				return;

			}

			// If cached is not a promise (i.e., it's already an imageBitmap)
			setTimeout( function () {

				if ( onLoad ) onLoad( cached );

				scope.manager.itemEnd( url );

			}, 0 );

			return cached;

		}

		const fetchOptions = {};
		fetchOptions.credentials = ( this.crossOrigin === 'anonymous' ) ? 'same-origin' : 'include';
		fetchOptions.headers = this.requestHeader;

		const promise = fetch( url, fetchOptions ).then( function ( res ) {

			return res.blob();

		} ).then( function ( blob ) {

			return createImageBitmap( blob, Object.assign( scope.options, { colorSpaceConversion: 'none' } ) );

		} ).then( function ( imageBitmap ) {

			Cache.add( url, imageBitmap );

			if ( onLoad ) onLoad( imageBitmap );

			scope.manager.itemEnd( url );

			return imageBitmap;

		} ).catch( function ( e ) {

			if ( onError ) onError( e );

			Cache.remove( url );

			scope.manager.itemError( url );
			scope.manager.itemEnd( url );

		} );

		Cache.add( url, promise );
		scope.manager.itemStart( url );

	}

}

let _context;

class AudioContext {

	static getContext() {

		if ( _context === undefined ) {

			_context = new ( window.AudioContext || window.webkitAudioContext )();

		}

		return _context;

	}

	static setContext( value ) {

		_context = value;

	}

}

class AudioLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, function ( buffer ) {

			try {

				// Create a copy of the buffer. The `decodeAudioData` method
				// detaches the buffer when complete, preventing reuse.
				const bufferCopy = buffer.slice( 0 );

				const context = AudioContext.getContext();
				context.decodeAudioData( bufferCopy, function ( audioBuffer ) {

					onLoad( audioBuffer );

				} ).catch( handleError );

			} catch ( e ) {

				handleError( e );

			}

		}, onProgress, onError );

		function handleError( e ) {

			if ( onError ) {

				onError( e );

			} else {

				console.error( e );

			}

			scope.manager.itemError( url );

		}

	}

}

const _eyeRight = /*@__PURE__*/ new Matrix4();
const _eyeLeft = /*@__PURE__*/ new Matrix4();
const _projectionMatrix = /*@__PURE__*/ new Matrix4();

class StereoCamera {

	constructor() {

		this.type = 'StereoCamera';

		this.aspect = 1;

		this.eyeSep = 0.064;

		this.cameraL = new PerspectiveCamera();
		this.cameraL.layers.enable( 1 );
		this.cameraL.matrixAutoUpdate = false;

		this.cameraR = new PerspectiveCamera();
		this.cameraR.layers.enable( 2 );
		this.cameraR.matrixAutoUpdate = false;

		this._cache = {
			focus: null,
			fov: null,
			aspect: null,
			near: null,
			far: null,
			zoom: null,
			eyeSep: null
		};

	}

	update( camera ) {

		const cache = this._cache;

		const needsUpdate = cache.focus !== camera.focus || cache.fov !== camera.fov ||
			cache.aspect !== camera.aspect * this.aspect || cache.near !== camera.near ||
			cache.far !== camera.far || cache.zoom !== camera.zoom || cache.eyeSep !== this.eyeSep;

		if ( needsUpdate ) {

			cache.focus = camera.focus;
			cache.fov = camera.fov;
			cache.aspect = camera.aspect * this.aspect;
			cache.near = camera.near;
			cache.far = camera.far;
			cache.zoom = camera.zoom;
			cache.eyeSep = this.eyeSep;

			// Off-axis stereoscopic effect based on
			// http://paulbourke.net/stereographics/stereorender/

			_projectionMatrix.copy( camera.projectionMatrix );
			const eyeSepHalf = cache.eyeSep / 2;
			const eyeSepOnProjection = eyeSepHalf * cache.near / cache.focus;
			const ymax = ( cache.near * Math.tan( DEG2RAD * cache.fov * 0.5 ) ) / cache.zoom;
			let xmin, xmax;

			// translate xOffset

			_eyeLeft.elements[ 12 ] = - eyeSepHalf;
			_eyeRight.elements[ 12 ] = eyeSepHalf;

			// for left eye

			xmin = - ymax * cache.aspect + eyeSepOnProjection;
			xmax = ymax * cache.aspect + eyeSepOnProjection;

			_projectionMatrix.elements[ 0 ] = 2 * cache.near / ( xmax - xmin );
			_projectionMatrix.elements[ 8 ] = ( xmax + xmin ) / ( xmax - xmin );

			this.cameraL.projectionMatrix.copy( _projectionMatrix );

			// for right eye

			xmin = - ymax * cache.aspect - eyeSepOnProjection;
			xmax = ymax * cache.aspect - eyeSepOnProjection;

			_projectionMatrix.elements[ 0 ] = 2 * cache.near / ( xmax - xmin );
			_projectionMatrix.elements[ 8 ] = ( xmax + xmin ) / ( xmax - xmin );

			this.cameraR.projectionMatrix.copy( _projectionMatrix );

		}

		this.cameraL.matrixWorld.copy( camera.matrixWorld ).multiply( _eyeLeft );
		this.cameraR.matrixWorld.copy( camera.matrixWorld ).multiply( _eyeRight );

	}

}

class ArrayCamera extends PerspectiveCamera {

	constructor( array = [] ) {

		super();

		this.isArrayCamera = true;

		this.cameras = array;

	}

}

class Clock {

	constructor( autoStart = true ) {

		this.autoStart = autoStart;

		this.startTime = 0;
		this.oldTime = 0;
		this.elapsedTime = 0;

		this.running = false;

	}

	start() {

		this.startTime = now();

		this.oldTime = this.startTime;
		this.elapsedTime = 0;
		this.running = true;

	}

	stop() {

		this.getElapsedTime();
		this.running = false;
		this.autoStart = false;

	}

	getElapsedTime() {

		this.getDelta();
		return this.elapsedTime;

	}

	getDelta() {

		let diff = 0;

		if ( this.autoStart && ! this.running ) {

			this.start();
			return 0;

		}

		if ( this.running ) {

			const newTime = now();

			diff = ( newTime - this.oldTime ) / 1000;
			this.oldTime = newTime;

			this.elapsedTime += diff;

		}

		return diff;

	}

}

function now() {

	return performance.now();

}

const _position$1 = /*@__PURE__*/ new Vector3();
const _quaternion$1 = /*@__PURE__*/ new Quaternion();
const _scale$1 = /*@__PURE__*/ new Vector3();
const _orientation$1 = /*@__PURE__*/ new Vector3();

class AudioListener extends Object3D {

	constructor() {

		super();

		this.type = 'AudioListener';

		this.context = AudioContext.getContext();

		this.gain = this.context.createGain();
		this.gain.connect( this.context.destination );

		this.filter = null;

		this.timeDelta = 0;

		// private

		this._clock = new Clock();

	}

	getInput() {

		return this.gain;

	}

	removeFilter() {

		if ( this.filter !== null ) {

			this.gain.disconnect( this.filter );
			this.filter.disconnect( this.context.destination );
			this.gain.connect( this.context.destination );
			this.filter = null;

		}

		return this;

	}

	getFilter() {

		return this.filter;

	}

	setFilter( value ) {

		if ( this.filter !== null ) {

			this.gain.disconnect( this.filter );
			this.filter.disconnect( this.context.destination );

		} else {

			this.gain.disconnect( this.context.destination );

		}

		this.filter = value;
		this.gain.connect( this.filter );
		this.filter.connect( this.context.destination );

		return this;

	}

	getMasterVolume() {

		return this.gain.gain.value;

	}

	setMasterVolume( value ) {

		this.gain.gain.setTargetAtTime( value, this.context.currentTime, 0.01 );

		return this;

	}

	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		const listener = this.context.listener;
		const up = this.up;

		this.timeDelta = this._clock.getDelta();

		this.matrixWorld.decompose( _position$1, _quaternion$1, _scale$1 );

		_orientation$1.set( 0, 0, - 1 ).applyQuaternion( _quaternion$1 );

		if ( listener.positionX ) {

			// code path for Chrome (see #14393)

			const endTime = this.context.currentTime + this.timeDelta;

			listener.positionX.linearRampToValueAtTime( _position$1.x, endTime );
			listener.positionY.linearRampToValueAtTime( _position$1.y, endTime );
			listener.positionZ.linearRampToValueAtTime( _position$1.z, endTime );
			listener.forwardX.linearRampToValueAtTime( _orientation$1.x, endTime );
			listener.forwardY.linearRampToValueAtTime( _orientation$1.y, endTime );
			listener.forwardZ.linearRampToValueAtTime( _orientation$1.z, endTime );
			listener.upX.linearRampToValueAtTime( up.x, endTime );
			listener.upY.linearRampToValueAtTime( up.y, endTime );
			listener.upZ.linearRampToValueAtTime( up.z, endTime );

		} else {

			listener.setPosition( _position$1.x, _position$1.y, _position$1.z );
			listener.setOrientation( _orientation$1.x, _orientation$1.y, _orientation$1.z, up.x, up.y, up.z );

		}

	}

}

class Audio extends Object3D {

	constructor( listener ) {

		super();

		this.type = 'Audio';

		this.listener = listener;
		this.context = listener.context;

		this.gain = this.context.createGain();
		this.gain.connect( listener.getInput() );

		this.autoplay = false;

		this.buffer = null;
		this.detune = 0;
		this.loop = false;
		this.loopStart = 0;
		this.loopEnd = 0;
		this.offset = 0;
		this.duration = undefined;
		this.playbackRate = 1;
		this.isPlaying = false;
		this.hasPlaybackControl = true;
		this.source = null;
		this.sourceType = 'empty';

		this._startedAt = 0;
		this._progress = 0;
		this._connected = false;

		this.filters = [];

	}

	getOutput() {

		return this.gain;

	}

	setNodeSource( audioNode ) {

		this.hasPlaybackControl = false;
		this.sourceType = 'audioNode';
		this.source = audioNode;
		this.connect();

		return this;

	}

	setMediaElementSource( mediaElement ) {

		this.hasPlaybackControl = false;
		this.sourceType = 'mediaNode';
		this.source = this.context.createMediaElementSource( mediaElement );
		this.connect();

		return this;

	}

	setMediaStreamSource( mediaStream ) {

		this.hasPlaybackControl = false;
		this.sourceType = 'mediaStreamNode';
		this.source = this.context.createMediaStreamSource( mediaStream );
		this.connect();

		return this;

	}

	setBuffer( audioBuffer ) {

		this.buffer = audioBuffer;
		this.sourceType = 'buffer';

		if ( this.autoplay ) this.play();

		return this;

	}

	play( delay = 0 ) {

		if ( this.isPlaying === true ) {

			console.warn( 'THREE.Audio: Audio is already playing.' );
			return;

		}

		if ( this.hasPlaybackControl === false ) {

			console.warn( 'THREE.Audio: this Audio has no playback control.' );
			return;

		}

		this._startedAt = this.context.currentTime + delay;

		const source = this.context.createBufferSource();
		source.buffer = this.buffer;
		source.loop = this.loop;
		source.loopStart = this.loopStart;
		source.loopEnd = this.loopEnd;
		source.onended = this.onEnded.bind( this );
		source.start( this._startedAt, this._progress + this.offset, this.duration );

		this.isPlaying = true;

		this.source = source;

		this.setDetune( this.detune );
		this.setPlaybackRate( this.playbackRate );

		return this.connect();

	}

	pause() {

		if ( this.hasPlaybackControl === false ) {

			console.warn( 'THREE.Audio: this Audio has no playback control.' );
			return;

		}

		if ( this.isPlaying === true ) {

			// update current progress

			this._progress += Math.max( this.context.currentTime - this._startedAt, 0 ) * this.playbackRate;

			if ( this.loop === true ) {

				// ensure _progress does not exceed duration with looped audios

				this._progress = this._progress % ( this.duration || this.buffer.duration );

			}

			this.source.stop();
			this.source.onended = null;

			this.isPlaying = false;

		}

		return this;

	}

	stop( delay = 0 ) {

		if ( this.hasPlaybackControl === false ) {

			console.warn( 'THREE.Audio: this Audio has no playback control.' );
			return;

		}

		this._progress = 0;

		if ( this.source !== null ) {

			this.source.stop( this.context.currentTime + delay );
			this.source.onended = null;

		}

		this.isPlaying = false;

		return this;

	}

	connect() {

		if ( this.filters.length > 0 ) {

			this.source.connect( this.filters[ 0 ] );

			for ( let i = 1, l = this.filters.length; i < l; i ++ ) {

				this.filters[ i - 1 ].connect( this.filters[ i ] );

			}

			this.filters[ this.filters.length - 1 ].connect( this.getOutput() );

		} else {

			this.source.connect( this.getOutput() );

		}

		this._connected = true;

		return this;

	}

	disconnect() {

		if ( this._connected === false ) {

			return;

		}

		if ( this.filters.length > 0 ) {

			this.source.disconnect( this.filters[ 0 ] );

			for ( let i = 1, l = this.filters.length; i < l; i ++ ) {

				this.filters[ i - 1 ].disconnect( this.filters[ i ] );

			}

			this.filters[ this.filters.length - 1 ].disconnect( this.getOutput() );

		} else {

			this.source.disconnect( this.getOutput() );

		}

		this._connected = false;

		return this;

	}

	getFilters() {

		return this.filters;

	}

	setFilters( value ) {

		if ( ! value ) value = [];

		if ( this._connected === true ) {

			this.disconnect();
			this.filters = value.slice();
			this.connect();

		} else {

			this.filters = value.slice();

		}

		return this;

	}

	setDetune( value ) {

		this.detune = value;

		if ( this.isPlaying === true && this.source.detune !== undefined ) {

			this.source.detune.setTargetAtTime( this.detune, this.context.currentTime, 0.01 );

		}

		return this;

	}

	getDetune() {

		return this.detune;

	}

	getFilter() {

		return this.getFilters()[ 0 ];

	}

	setFilter( filter ) {

		return this.setFilters( filter ? [ filter ] : [] );

	}

	setPlaybackRate( value ) {

		if ( this.hasPlaybackControl === false ) {

			console.warn( 'THREE.Audio: this Audio has no playback control.' );
			return;

		}

		this.playbackRate = value;

		if ( this.isPlaying === true ) {

			this.source.playbackRate.setTargetAtTime( this.playbackRate, this.context.currentTime, 0.01 );

		}

		return this;

	}

	getPlaybackRate() {

		return this.playbackRate;

	}

	onEnded() {

		this.isPlaying = false;
		this._progress = 0;

	}

	getLoop() {

		if ( this.hasPlaybackControl === false ) {

			console.warn( 'THREE.Audio: this Audio has no playback control.' );
			return false;

		}

		return this.loop;

	}

	setLoop( value ) {

		if ( this.hasPlaybackControl === false ) {

			console.warn( 'THREE.Audio: this Audio has no playback control.' );
			return;

		}

		this.loop = value;

		if ( this.isPlaying === true ) {

			this.source.loop = this.loop;

		}

		return this;

	}

	setLoopStart( value ) {

		this.loopStart = value;

		return this;

	}

	setLoopEnd( value ) {

		this.loopEnd = value;

		return this;

	}

	getVolume() {

		return this.gain.gain.value;

	}

	setVolume( value ) {

		this.gain.gain.setTargetAtTime( value, this.context.currentTime, 0.01 );

		return this;

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		if ( source.sourceType !== 'buffer' ) {

			console.warn( 'THREE.Audio: Audio source type cannot be copied.' );

			return this;

		}

		this.autoplay = source.autoplay;

		this.buffer = source.buffer;
		this.detune = source.detune;
		this.loop = source.loop;
		this.loopStart = source.loopStart;
		this.loopEnd = source.loopEnd;
		this.offset = source.offset;
		this.duration = source.duration;
		this.playbackRate = source.playbackRate;
		this.hasPlaybackControl = source.hasPlaybackControl;
		this.sourceType = source.sourceType;

		this.filters = source.filters.slice();

		return this;

	}

	clone( recursive ) {

		return new this.constructor( this.listener ).copy( this, recursive );

	}

}

const _position = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();
const _scale = /*@__PURE__*/ new Vector3();
const _orientation = /*@__PURE__*/ new Vector3();

class PositionalAudio extends Audio {

	constructor( listener ) {

		super( listener );

		this.panner = this.context.createPanner();
		this.panner.panningModel = 'HRTF';
		this.panner.connect( this.gain );

	}

	connect() {

		super.connect();

		this.panner.connect( this.gain );

	}

	disconnect() {

		super.disconnect();

		this.panner.disconnect( this.gain );

	}

	getOutput() {

		return this.panner;

	}

	getRefDistance() {

		return this.panner.refDistance;

	}

	setRefDistance( value ) {

		this.panner.refDistance = value;

		return this;

	}

	getRolloffFactor() {

		return this.panner.rolloffFactor;

	}

	setRolloffFactor( value ) {

		this.panner.rolloffFactor = value;

		return this;

	}

	getDistanceModel() {

		return this.panner.distanceModel;

	}

	setDistanceModel( value ) {

		this.panner.distanceModel = value;

		return this;

	}

	getMaxDistance() {

		return this.panner.maxDistance;

	}

	setMaxDistance( value ) {

		this.panner.maxDistance = value;

		return this;

	}

	setDirectionalCone( coneInnerAngle, coneOuterAngle, coneOuterGain ) {

		this.panner.coneInnerAngle = coneInnerAngle;
		this.panner.coneOuterAngle = coneOuterAngle;
		this.panner.coneOuterGain = coneOuterGain;

		return this;

	}

	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		if ( this.hasPlaybackControl === true && this.isPlaying === false ) return;

		this.matrixWorld.decompose( _position, _quaternion, _scale );

		_orientation.set( 0, 0, 1 ).applyQuaternion( _quaternion );

		const panner = this.panner;

		if ( panner.positionX ) {

			// code path for Chrome and Firefox (see #14393)

			const endTime = this.context.currentTime + this.listener.timeDelta;

			panner.positionX.linearRampToValueAtTime( _position.x, endTime );
			panner.positionY.linearRampToValueAtTime( _position.y, endTime );
			panner.positionZ.linearRampToValueAtTime( _position.z, endTime );
			panner.orientationX.linearRampToValueAtTime( _orientation.x, endTime );
			panner.orientationY.linearRampToValueAtTime( _orientation.y, endTime );
			panner.orientationZ.linearRampToValueAtTime( _orientation.z, endTime );

		} else {

			panner.setPosition( _position.x, _position.y, _position.z );
			panner.setOrientation( _orientation.x, _orientation.y, _orientation.z );

		}

	}

}

class AudioAnalyser {

	constructor( audio, fftSize = 2048 ) {

		this.analyser = audio.context.createAnalyser();
		this.analyser.fftSize = fftSize;

		this.data = new Uint8Array( this.analyser.frequencyBinCount );

		audio.getOutput().connect( this.analyser );

	}


	getFrequencyData() {

		this.analyser.getByteFrequencyData( this.data );

		return this.data;

	}

	getAverageFrequency() {

		let value = 0;
		const data = this.getFrequencyData();

		for ( let i = 0; i < data.length; i ++ ) {

			value += data[ i ];

		}

		return value / data.length;

	}

}

class PropertyMixer {

	constructor( binding, typeName, valueSize ) {

		this.binding = binding;
		this.valueSize = valueSize;

		let mixFunction,
			mixFunctionAdditive,
			setIdentity;

		// buffer layout: [ incoming | accu0 | accu1 | orig | addAccu | (optional work) ]
		//
		// interpolators can use .buffer as their .result
		// the data then goes to 'incoming'
		//
		// 'accu0' and 'accu1' are used frame-interleaved for
		// the cumulative result and are compared to detect
		// changes
		//
		// 'orig' stores the original state of the property
		//
		// 'add' is used for additive cumulative results
		//
		// 'work' is optional and is only present for quaternion types. It is used
		// to store intermediate quaternion multiplication results

		switch ( typeName ) {

			case 'quaternion':
				mixFunction = this._slerp;
				mixFunctionAdditive = this._slerpAdditive;
				setIdentity = this._setAdditiveIdentityQuaternion;

				this.buffer = new Float64Array( valueSize * 6 );
				this._workIndex = 5;
				break;

			case 'string':
			case 'bool':
				mixFunction = this._select;

				// Use the regular mix function and for additive on these types,
				// additive is not relevant for non-numeric types
				mixFunctionAdditive = this._select;

				setIdentity = this._setAdditiveIdentityOther;

				this.buffer = new Array( valueSize * 5 );
				break;

			default:
				mixFunction = this._lerp;
				mixFunctionAdditive = this._lerpAdditive;
				setIdentity = this._setAdditiveIdentityNumeric;

				this.buffer = new Float64Array( valueSize * 5 );

		}

		this._mixBufferRegion = mixFunction;
		this._mixBufferRegionAdditive = mixFunctionAdditive;
		this._setIdentity = setIdentity;
		this._origIndex = 3;
		this._addIndex = 4;

		this.cumulativeWeight = 0;
		this.cumulativeWeightAdditive = 0;

		this.useCount = 0;
		this.referenceCount = 0;

	}

	// accumulate data in the 'incoming' region into 'accu<i>'
	accumulate( accuIndex, weight ) {

		// note: happily accumulating nothing when weight = 0, the caller knows
		// the weight and shouldn't have made the call in the first place

		const buffer = this.buffer,
			stride = this.valueSize,
			offset = accuIndex * stride + stride;

		let currentWeight = this.cumulativeWeight;

		if ( currentWeight === 0 ) {

			// accuN := incoming * weight

			for ( let i = 0; i !== stride; ++ i ) {

				buffer[ offset + i ] = buffer[ i ];

			}

			currentWeight = weight;

		} else {

			// accuN := accuN + incoming * weight

			currentWeight += weight;
			const mix = weight / currentWeight;
			this._mixBufferRegion( buffer, offset, 0, mix, stride );

		}

		this.cumulativeWeight = currentWeight;

	}

	// accumulate data in the 'incoming' region into 'add'
	accumulateAdditive( weight ) {

		const buffer = this.buffer,
			stride = this.valueSize,
			offset = stride * this._addIndex;

		if ( this.cumulativeWeightAdditive === 0 ) {

			// add = identity

			this._setIdentity();

		}

		// add := add + incoming * weight

		this._mixBufferRegionAdditive( buffer, offset, 0, weight, stride );
		this.cumulativeWeightAdditive += weight;

	}

	// apply the state of 'accu<i>' to the binding when accus differ
	apply( accuIndex ) {

		const stride = this.valueSize,
			buffer = this.buffer,
			offset = accuIndex * stride + stride,

			weight = this.cumulativeWeight,
			weightAdditive = this.cumulativeWeightAdditive,

			binding = this.binding;

		this.cumulativeWeight = 0;
		this.cumulativeWeightAdditive = 0;

		if ( weight < 1 ) {

			// accuN := accuN + original * ( 1 - cumulativeWeight )

			const originalValueOffset = stride * this._origIndex;

			this._mixBufferRegion(
				buffer, offset, originalValueOffset, 1 - weight, stride );

		}

		if ( weightAdditive > 0 ) {

			// accuN := accuN + additive accuN

			this._mixBufferRegionAdditive( buffer, offset, this._addIndex * stride, 1, stride );

		}

		for ( let i = stride, e = stride + stride; i !== e; ++ i ) {

			if ( buffer[ i ] !== buffer[ i + stride ] ) {

				// value has changed -> update scene graph

				binding.setValue( buffer, offset );
				break;

			}

		}

	}

	// remember the state of the bound property and copy it to both accus
	saveOriginalState() {

		const binding = this.binding;

		const buffer = this.buffer,
			stride = this.valueSize,

			originalValueOffset = stride * this._origIndex;

		binding.getValue( buffer, originalValueOffset );

		// accu[0..1] := orig -- initially detect changes against the original
		for ( let i = stride, e = originalValueOffset; i !== e; ++ i ) {

			buffer[ i ] = buffer[ originalValueOffset + ( i % stride ) ];

		}

		// Add to identity for additive
		this._setIdentity();

		this.cumulativeWeight = 0;
		this.cumulativeWeightAdditive = 0;

	}

	// apply the state previously taken via 'saveOriginalState' to the binding
	restoreOriginalState() {

		const originalValueOffset = this.valueSize * 3;
		this.binding.setValue( this.buffer, originalValueOffset );

	}

	_setAdditiveIdentityNumeric() {

		const startIndex = this._addIndex * this.valueSize;
		const endIndex = startIndex + this.valueSize;

		for ( let i = startIndex; i < endIndex; i ++ ) {

			this.buffer[ i ] = 0;

		}

	}

	_setAdditiveIdentityQuaternion() {

		this._setAdditiveIdentityNumeric();
		this.buffer[ this._addIndex * this.valueSize + 3 ] = 1;

	}

	_setAdditiveIdentityOther() {

		const startIndex = this._origIndex * this.valueSize;
		const targetIndex = this._addIndex * this.valueSize;

		for ( let i = 0; i < this.valueSize; i ++ ) {

			this.buffer[ targetIndex + i ] = this.buffer[ startIndex + i ];

		}

	}


	// mix functions

	_select( buffer, dstOffset, srcOffset, t, stride ) {

		if ( t >= 0.5 ) {

			for ( let i = 0; i !== stride; ++ i ) {

				buffer[ dstOffset + i ] = buffer[ srcOffset + i ];

			}

		}

	}

	_slerp( buffer, dstOffset, srcOffset, t ) {

		Quaternion.slerpFlat( buffer, dstOffset, buffer, dstOffset, buffer, srcOffset, t );

	}

	_slerpAdditive( buffer, dstOffset, srcOffset, t, stride ) {

		const workOffset = this._workIndex * stride;

		// Store result in intermediate buffer offset
		Quaternion.multiplyQuaternionsFlat( buffer, workOffset, buffer, dstOffset, buffer, srcOffset );

		// Slerp to the intermediate result
		Quaternion.slerpFlat( buffer, dstOffset, buffer, dstOffset, buffer, workOffset, t );

	}

	_lerp( buffer, dstOffset, srcOffset, t, stride ) {

		const s = 1 - t;

		for ( let i = 0; i !== stride; ++ i ) {

			const j = dstOffset + i;

			buffer[ j ] = buffer[ j ] * s + buffer[ srcOffset + i ] * t;

		}

	}

	_lerpAdditive( buffer, dstOffset, srcOffset, t, stride ) {

		for ( let i = 0; i !== stride; ++ i ) {

			const j = dstOffset + i;

			buffer[ j ] = buffer[ j ] + buffer[ srcOffset + i ] * t;

		}

	}

}

// Characters [].:/ are reserved for track binding syntax.
const _RESERVED_CHARS_RE = '\\[\\]\\.:\\/';
const _reservedRe = new RegExp( '[' + _RESERVED_CHARS_RE + ']', 'g' );

// Attempts to allow node names from any language. ES5's `\w` regexp matches
// only latin characters, and the unicode \p{L} is not yet supported. So
// instead, we exclude reserved characters and match everything else.
const _wordChar = '[^' + _RESERVED_CHARS_RE + ']';
const _wordCharOrDot = '[^' + _RESERVED_CHARS_RE.replace( '\\.', '' ) + ']';

// Parent directories, delimited by '/' or ':'. Currently unused, but must
// be matched to parse the rest of the track name.
const _directoryRe = /*@__PURE__*/ /((?:WC+[\/:])*)/.source.replace( 'WC', _wordChar );

// Target node. May contain word characters (a-zA-Z0-9_) and '.' or '-'.
const _nodeRe = /*@__PURE__*/ /(WCOD+)?/.source.replace( 'WCOD', _wordCharOrDot );

// Object on target node, and accessor. May not contain reserved
// characters. Accessor may contain any character except closing bracket.
const _objectRe = /*@__PURE__*/ /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace( 'WC', _wordChar );

// Property and accessor. May not contain reserved characters. Accessor may
// contain any non-bracket characters.
const _propertyRe = /*@__PURE__*/ /\.(WC+)(?:\[(.+)\])?/.source.replace( 'WC', _wordChar );

const _trackRe = new RegExp( ''
	+ '^'
	+ _directoryRe
	+ _nodeRe
	+ _objectRe
	+ _propertyRe
	+ '$'
);

const _supportedObjectNames = [ 'material', 'materials', 'bones', 'map' ];

class Composite {

	constructor( targetGroup, path, optionalParsedPath ) {

		const parsedPath = optionalParsedPath || PropertyBinding.parseTrackName( path );

		this._targetGroup = targetGroup;
		this._bindings = targetGroup.subscribe_( path, parsedPath );

	}

	getValue( array, offset ) {

		this.bind(); // bind all binding

		const firstValidIndex = this._targetGroup.nCachedObjects_,
			binding = this._bindings[ firstValidIndex ];

		// and only call .getValue on the first
		if ( binding !== undefined ) binding.getValue( array, offset );

	}

	setValue( array, offset ) {

		const bindings = this._bindings;

		for ( let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++ i ) {

			bindings[ i ].setValue( array, offset );

		}

	}

	bind() {

		const bindings = this._bindings;

		for ( let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++ i ) {

			bindings[ i ].bind();

		}

	}

	unbind() {

		const bindings = this._bindings;

		for ( let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++ i ) {

			bindings[ i ].unbind();

		}

	}

}

// Note: This class uses a State pattern on a per-method basis:
// 'bind' sets 'this.getValue' / 'setValue' and shadows the
// prototype version of these methods with one that represents
// the bound state. When the property is not found, the methods
// become no-ops.
class PropertyBinding {

	constructor( rootNode, path, parsedPath ) {

		this.path = path;
		this.parsedPath = parsedPath || PropertyBinding.parseTrackName( path );

		this.node = PropertyBinding.findNode( rootNode, this.parsedPath.nodeName );

		this.rootNode = rootNode;

		// initial state of these methods that calls 'bind'
		this.getValue = this._getValue_unbound;
		this.setValue = this._setValue_unbound;

	}


	static create( root, path, parsedPath ) {

		if ( ! ( root && root.isAnimationObjectGroup ) ) {

			return new PropertyBinding( root, path, parsedPath );

		} else {

			return new PropertyBinding.Composite( root, path, parsedPath );

		}

	}

	/**
	 * Replaces spaces with underscores and removes unsupported characters from
	 * node names, to ensure compatibility with parseTrackName().
	 *
	 * @param {string} name Node name to be sanitized.
	 * @return {string}
	 */
	static sanitizeNodeName( name ) {

		return name.replace( /\s/g, '_' ).replace( _reservedRe, '' );

	}

	static parseTrackName( trackName ) {

		const matches = _trackRe.exec( trackName );

		if ( matches === null ) {

			throw new Error( 'PropertyBinding: Cannot parse trackName: ' + trackName );

		}

		const results = {
			// directoryName: matches[ 1 ], // (tschw) currently unused
			nodeName: matches[ 2 ],
			objectName: matches[ 3 ],
			objectIndex: matches[ 4 ],
			propertyName: matches[ 5 ], // required
			propertyIndex: matches[ 6 ]
		};

		const lastDot = results.nodeName && results.nodeName.lastIndexOf( '.' );

		if ( lastDot !== undefined && lastDot !== - 1 ) {

			const objectName = results.nodeName.substring( lastDot + 1 );

			// Object names must be checked against an allowlist. Otherwise, there
			// is no way to parse 'foo.bar.baz': 'baz' must be a property, but
			// 'bar' could be the objectName, or part of a nodeName (which can
			// include '.' characters).
			if ( _supportedObjectNames.indexOf( objectName ) !== - 1 ) {

				results.nodeName = results.nodeName.substring( 0, lastDot );
				results.objectName = objectName;

			}

		}

		if ( results.propertyName === null || results.propertyName.length === 0 ) {

			throw new Error( 'PropertyBinding: can not parse propertyName from trackName: ' + trackName );

		}

		return results;

	}

	static findNode( root, nodeName ) {

		if ( nodeName === undefined || nodeName === '' || nodeName === '.' || nodeName === - 1 || nodeName === root.name || nodeName === root.uuid ) {

			return root;

		}

		// search into skeleton bones.
		if ( root.skeleton ) {

			const bone = root.skeleton.getBoneByName( nodeName );

			if ( bone !== undefined ) {

				return bone;

			}

		}

		// search into node subtree.
		if ( root.children ) {

			const searchNodeSubtree = function ( children ) {

				for ( let i = 0; i < children.length; i ++ ) {

					const childNode = children[ i ];

					if ( childNode.name === nodeName || childNode.uuid === nodeName ) {

						return childNode;

					}

					const result = searchNodeSubtree( childNode.children );

					if ( result ) return result;

				}

				return null;

			};

			const subTreeNode = searchNodeSubtree( root.children );

			if ( subTreeNode ) {

				return subTreeNode;

			}

		}

		return null;

	}

	// these are used to "bind" a nonexistent property
	_getValue_unavailable() {}
	_setValue_unavailable() {}

	// Getters

	_getValue_direct( buffer, offset ) {

		buffer[ offset ] = this.targetObject[ this.propertyName ];

	}

	_getValue_array( buffer, offset ) {

		const source = this.resolvedProperty;

		for ( let i = 0, n = source.length; i !== n; ++ i ) {

			buffer[ offset ++ ] = source[ i ];

		}

	}

	_getValue_arrayElement( buffer, offset ) {

		buffer[ offset ] = this.resolvedProperty[ this.propertyIndex ];

	}

	_getValue_toArray( buffer, offset ) {

		this.resolvedProperty.toArray( buffer, offset );

	}

	// Direct

	_setValue_direct( buffer, offset ) {

		this.targetObject[ this.propertyName ] = buffer[ offset ];

	}

	_setValue_direct_setNeedsUpdate( buffer, offset ) {

		this.targetObject[ this.propertyName ] = buffer[ offset ];
		this.targetObject.needsUpdate = true;

	}

	_setValue_direct_setMatrixWorldNeedsUpdate( buffer, offset ) {

		this.targetObject[ this.propertyName ] = buffer[ offset ];
		this.targetObject.matrixWorldNeedsUpdate = true;

	}

	// EntireArray

	_setValue_array( buffer, offset ) {

		const dest = this.resolvedProperty;

		for ( let i = 0, n = dest.length; i !== n; ++ i ) {

			dest[ i ] = buffer[ offset ++ ];

		}

	}

	_setValue_array_setNeedsUpdate( buffer, offset ) {

		const dest = this.resolvedProperty;

		for ( let i = 0, n = dest.length; i !== n; ++ i ) {

			dest[ i ] = buffer[ offset ++ ];

		}

		this.targetObject.needsUpdate = true;

	}

	_setValue_array_setMatrixWorldNeedsUpdate( buffer, offset ) {

		const dest = this.resolvedProperty;

		for ( let i = 0, n = dest.length; i !== n; ++ i ) {

			dest[ i ] = buffer[ offset ++ ];

		}

		this.targetObject.matrixWorldNeedsUpdate = true;

	}

	// ArrayElement

	_setValue_arrayElement( buffer, offset ) {

		this.resolvedProperty[ this.propertyIndex ] = buffer[ offset ];

	}

	_setValue_arrayElement_setNeedsUpdate( buffer, offset ) {

		this.resolvedProperty[ this.propertyIndex ] = buffer[ offset ];
		this.targetObject.needsUpdate = true;

	}

	_setValue_arrayElement_setMatrixWorldNeedsUpdate( buffer, offset ) {

		this.resolvedProperty[ this.propertyIndex ] = buffer[ offset ];
		this.targetObject.matrixWorldNeedsUpdate = true;

	}

	// HasToFromArray

	_setValue_fromArray( buffer, offset ) {

		this.resolvedProperty.fromArray( buffer, offset );

	}

	_setValue_fromArray_setNeedsUpdate( buffer, offset ) {

		this.resolvedProperty.fromArray( buffer, offset );
		this.targetObject.needsUpdate = true;

	}

	_setValue_fromArray_setMatrixWorldNeedsUpdate( buffer, offset ) {

		this.resolvedProperty.fromArray( buffer, offset );
		this.targetObject.matrixWorldNeedsUpdate = true;

	}

	_getValue_unbound( targetArray, offset ) {

		this.bind();
		this.getValue( targetArray, offset );

	}

	_setValue_unbound( sourceArray, offset ) {

		this.bind();
		this.setValue( sourceArray, offset );

	}

	// create getter / setter pair for a property in the scene graph
	bind() {

		let targetObject = this.node;
		const parsedPath = this.parsedPath;

		const objectName = parsedPath.objectName;
		const propertyName = parsedPath.propertyName;
		let propertyIndex = parsedPath.propertyIndex;

		if ( ! targetObject ) {

			targetObject = PropertyBinding.findNode( this.rootNode, parsedPath.nodeName );

			this.node = targetObject;

		}

		// set fail state so we can just 'return' on error
		this.getValue = this._getValue_unavailable;
		this.setValue = this._setValue_unavailable;

		// ensure there is a value node
		if ( ! targetObject ) {

			console.warn( 'THREE.PropertyBinding: No target node found for track: ' + this.path + '.' );
			return;

		}

		if ( objectName ) {

			let objectIndex = parsedPath.objectIndex;

			// special cases were we need to reach deeper into the hierarchy to get the face materials....
			switch ( objectName ) {

				case 'materials':

					if ( ! targetObject.material ) {

						console.error( 'THREE.PropertyBinding: Can not bind to material as node does not have a material.', this );
						return;

					}

					if ( ! targetObject.material.materials ) {

						console.error( 'THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.', this );
						return;

					}

					targetObject = targetObject.material.materials;

					break;

				case 'bones':

					if ( ! targetObject.skeleton ) {

						console.error( 'THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.', this );
						return;

					}

					// potential future optimization: skip this if propertyIndex is already an integer
					// and convert the integer string to a true integer.

					targetObject = targetObject.skeleton.bones;

					// support resolving morphTarget names into indices.
					for ( let i = 0; i < targetObject.length; i ++ ) {

						if ( targetObject[ i ].name === objectIndex ) {

							objectIndex = i;
							break;

						}

					}

					break;

				case 'map':

					if ( 'map' in targetObject ) {

						targetObject = targetObject.map;
						break;

					}

					if ( ! targetObject.material ) {

						console.error( 'THREE.PropertyBinding: Can not bind to material as node does not have a material.', this );
						return;

					}

					if ( ! targetObject.material.map ) {

						console.error( 'THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.', this );
						return;

					}

					targetObject = targetObject.material.map;
					break;

				default:

					if ( targetObject[ objectName ] === undefined ) {

						console.error( 'THREE.PropertyBinding: Can not bind to objectName of node undefined.', this );
						return;

					}

					targetObject = targetObject[ objectName ];

			}


			if ( objectIndex !== undefined ) {

				if ( targetObject[ objectIndex ] === undefined ) {

					console.error( 'THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.', this, targetObject );
					return;

				}

				targetObject = targetObject[ objectIndex ];

			}

		}

		// resolve property
		const nodeProperty = targetObject[ propertyName ];

		if ( nodeProperty === undefined ) {

			const nodeName = parsedPath.nodeName;

			console.error( 'THREE.PropertyBinding: Trying to update property for track: ' + nodeName +
				'.' + propertyName + ' but it wasn\'t found.', targetObject );
			return;

		}

		// determine versioning scheme
		let versioning = this.Versioning.None;

		this.targetObject = targetObject;

		if ( targetObject.isMaterial === true ) {

			versioning = this.Versioning.NeedsUpdate;

		} else if ( targetObject.isObject3D === true ) {

			versioning = this.Versioning.MatrixWorldNeedsUpdate;

		}

		// determine how the property gets bound
		let bindingType = this.BindingType.Direct;

		if ( propertyIndex !== undefined ) {

			// access a sub element of the property array (only primitives are supported right now)

			if ( propertyName === 'morphTargetInfluences' ) {

				// potential optimization, skip this if propertyIndex is already an integer, and convert the integer string to a true integer.

				// support resolving morphTarget names into indices.
				if ( ! targetObject.geometry ) {

					console.error( 'THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.', this );
					return;

				}

				if ( ! targetObject.geometry.morphAttributes ) {

					console.error( 'THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.', this );
					return;

				}

				if ( targetObject.morphTargetDictionary[ propertyIndex ] !== undefined ) {

					propertyIndex = targetObject.morphTargetDictionary[ propertyIndex ];

				}

			}

			bindingType = this.BindingType.ArrayElement;

			this.resolvedProperty = nodeProperty;
			this.propertyIndex = propertyIndex;

		} else if ( nodeProperty.fromArray !== undefined && nodeProperty.toArray !== undefined ) {

			// must use copy for Object3D.Euler/Quaternion

			bindingType = this.BindingType.HasFromToArray;

			this.resolvedProperty = nodeProperty;

		} else if ( Array.isArray( nodeProperty ) ) {

			bindingType = this.BindingType.EntireArray;

			this.resolvedProperty = nodeProperty;

		} else {

			this.propertyName = propertyName;

		}

		// select getter / setter
		this.getValue = this.GetterByBindingType[ bindingType ];
		this.setValue = this.SetterByBindingTypeAndVersioning[ bindingType ][ versioning ];

	}

	unbind() {

		this.node = null;

		// back to the prototype version of getValue / setValue
		// note: avoiding to mutate the shape of 'this' via 'delete'
		this.getValue = this._getValue_unbound;
		this.setValue = this._setValue_unbound;

	}

}

PropertyBinding.Composite = Composite;

PropertyBinding.prototype.BindingType = {
	Direct: 0,
	EntireArray: 1,
	ArrayElement: 2,
	HasFromToArray: 3
};

PropertyBinding.prototype.Versioning = {
	None: 0,
	NeedsUpdate: 1,
	MatrixWorldNeedsUpdate: 2
};

PropertyBinding.prototype.GetterByBindingType = [

	PropertyBinding.prototype._getValue_direct,
	PropertyBinding.prototype._getValue_array,
	PropertyBinding.prototype._getValue_arrayElement,
	PropertyBinding.prototype._getValue_toArray,

];

PropertyBinding.prototype.SetterByBindingTypeAndVersioning = [

	[
		// Direct
		PropertyBinding.prototype._setValue_direct,
		PropertyBinding.prototype._setValue_direct_setNeedsUpdate,
		PropertyBinding.prototype._setValue_direct_setMatrixWorldNeedsUpdate,

	], [

		// EntireArray

		PropertyBinding.prototype._setValue_array,
		PropertyBinding.prototype._setValue_array_setNeedsUpdate,
		PropertyBinding.prototype._setValue_array_setMatrixWorldNeedsUpdate,

	], [

		// ArrayElement
		PropertyBinding.prototype._setValue_arrayElement,
		PropertyBinding.prototype._setValue_arrayElement_setNeedsUpdate,
		PropertyBinding.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate,

	], [

		// HasToFromArray
		PropertyBinding.prototype._setValue_fromArray,
		PropertyBinding.prototype._setValue_fromArray_setNeedsUpdate,
		PropertyBinding.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate,

	]

];

/**
 *
 * A group of objects that receives a shared animation state.
 *
 * Usage:
 *
 *  - Add objects you would otherwise pass as 'root' to the
 *    constructor or the .clipAction method of AnimationMixer.
 *
 *  - Instead pass this object as 'root'.
 *
 *  - You can also add and remove objects later when the mixer
 *    is running.
 *
 * Note:
 *
 *    Objects of this class appear as one object to the mixer,
 *    so cache control of the individual objects must be done
 *    on the group.
 *
 * Limitation:
 *
 *  - The animated properties must be compatible among the
 *    all objects in the group.
 *
 *  - A single property can either be controlled through a
 *    target group or directly, but not both.
 */

class AnimationObjectGroup {

	constructor() {

		this.isAnimationObjectGroup = true;

		this.uuid = generateUUID();

		// cached objects followed by the active ones
		this._objects = Array.prototype.slice.call( arguments );

		this.nCachedObjects_ = 0; // threshold
		// note: read by PropertyBinding.Composite

		const indices = {};
		this._indicesByUUID = indices; // for bookkeeping

		for ( let i = 0, n = arguments.length; i !== n; ++ i ) {

			indices[ arguments[ i ].uuid ] = i;

		}

		this._paths = []; // inside: string
		this._parsedPaths = []; // inside: { we don't care, here }
		this._bindings = []; // inside: Array< PropertyBinding >
		this._bindingsIndicesByPath = {}; // inside: indices in these arrays

		const scope = this;

		this.stats = {

			objects: {
				get total() {

					return scope._objects.length;

				},
				get inUse() {

					return this.total - scope.nCachedObjects_;

				}
			},
			get bindingsPerObject() {

				return scope._bindings.length;

			}

		};

	}

	add() {

		const objects = this._objects,
			indicesByUUID = this._indicesByUUID,
			paths = this._paths,
			parsedPaths = this._parsedPaths,
			bindings = this._bindings,
			nBindings = bindings.length;

		let knownObject = undefined,
			nObjects = objects.length,
			nCachedObjects = this.nCachedObjects_;

		for ( let i = 0, n = arguments.length; i !== n; ++ i ) {

			const object = arguments[ i ],
				uuid = object.uuid;
			let index = indicesByUUID[ uuid ];

			if ( index === undefined ) {

				// unknown object -> add it to the ACTIVE region

				index = nObjects ++;
				indicesByUUID[ uuid ] = index;
				objects.push( object );

				// accounting is done, now do the same for all bindings

				for ( let j = 0, m = nBindings; j !== m; ++ j ) {

					bindings[ j ].push( new PropertyBinding( object, paths[ j ], parsedPaths[ j ] ) );

				}

			} else if ( index < nCachedObjects ) {

				knownObject = objects[ index ];

				// move existing object to the ACTIVE region

				const firstActiveIndex = -- nCachedObjects,
					lastCachedObject = objects[ firstActiveIndex ];

				indicesByUUID[ lastCachedObject.uuid ] = index;
				objects[ index ] = lastCachedObject;

				indicesByUUID[ uuid ] = firstActiveIndex;
				objects[ firstActiveIndex ] = object;

				// accounting is done, now do the same for all bindings

				for ( let j = 0, m = nBindings; j !== m; ++ j ) {

					const bindingsForPath = bindings[ j ],
						lastCached = bindingsForPath[ firstActiveIndex ];

					let binding = bindingsForPath[ index ];

					bindingsForPath[ index ] = lastCached;

					if ( binding === undefined ) {

						// since we do not bother to create new bindings
						// for objects that are cached, the binding may
						// or may not exist

						binding = new PropertyBinding( object, paths[ j ], parsedPaths[ j ] );

					}

					bindingsForPath[ firstActiveIndex ] = binding;

				}

			} else if ( objects[ index ] !== knownObject ) {

				console.error( 'THREE.AnimationObjectGroup: Different objects with the same UUID ' +
					'detected. Clean the caches or recreate your infrastructure when reloading scenes.' );

			} // else the object is already where we want it to be

		} // for arguments

		this.nCachedObjects_ = nCachedObjects;

	}

	remove() {

		const objects = this._objects,
			indicesByUUID = this._indicesByUUID,
			bindings = this._bindings,
			nBindings = bindings.length;

		let nCachedObjects = this.nCachedObjects_;

		for ( let i = 0, n = arguments.length; i !== n; ++ i ) {

			const object = arguments[ i ],
				uuid = object.uuid,
				index = indicesByUUID[ uuid ];

			if ( index !== undefined && index >= nCachedObjects ) {

				// move existing object into the CACHED region

				const lastCachedIndex = nCachedObjects ++,
					firstActiveObject = objects[ lastCachedIndex ];

				indicesByUUID[ firstActiveObject.uuid ] = index;
				objects[ index ] = firstActiveObject;

				indicesByUUID[ uuid ] = lastCachedIndex;
				objects[ lastCachedIndex ] = object;

				// accounting is done, now do the same for all bindings

				for ( let j = 0, m = nBindings; j !== m; ++ j ) {

					const bindingsForPath = bindings[ j ],
						firstActive = bindingsForPath[ lastCachedIndex ],
						binding = bindingsForPath[ index ];

					bindingsForPath[ index ] = firstActive;
					bindingsForPath[ lastCachedIndex ] = binding;

				}

			}

		} // for arguments

		this.nCachedObjects_ = nCachedObjects;

	}

	// remove & forget
	uncache() {

		const objects = this._objects,
			indicesByUUID = this._indicesByUUID,
			bindings = this._bindings,
			nBindings = bindings.length;

		let nCachedObjects = this.nCachedObjects_,
			nObjects = objects.length;

		for ( let i = 0, n = arguments.length; i !== n; ++ i ) {

			const object = arguments[ i ],
				uuid = object.uuid,
				index = indicesByUUID[ uuid ];

			if ( index !== undefined ) {

				delete indicesByUUID[ uuid ];

				if ( index < nCachedObjects ) {

					// object is cached, shrink the CACHED region

					const firstActiveIndex = -- nCachedObjects,
						lastCachedObject = objects[ firstActiveIndex ],
						lastIndex = -- nObjects,
						lastObject = objects[ lastIndex ];

					// last cached object takes this object's place
					indicesByUUID[ lastCachedObject.uuid ] = index;
					objects[ index ] = lastCachedObject;

					// last object goes to the activated slot and pop
					indicesByUUID[ lastObject.uuid ] = firstActiveIndex;
					objects[ firstActiveIndex ] = lastObject;
					objects.pop();

					// accounting is done, now do the same for all bindings

					for ( let j = 0, m = nBindings; j !== m; ++ j ) {

						const bindingsForPath = bindings[ j ],
							lastCached = bindingsForPath[ firstActiveIndex ],
							last = bindingsForPath[ lastIndex ];

						bindingsForPath[ index ] = lastCached;
						bindingsForPath[ firstActiveIndex ] = last;
						bindingsForPath.pop();

					}

				} else {

					// object is active, just swap with the last and pop

					const lastIndex = -- nObjects,
						lastObject = objects[ lastIndex ];

					if ( lastIndex > 0 ) {

						indicesByUUID[ lastObject.uuid ] = index;

					}

					objects[ index ] = lastObject;
					objects.pop();

					// accounting is done, now do the same for all bindings

					for ( let j = 0, m = nBindings; j !== m; ++ j ) {

						const bindingsForPath = bindings[ j ];

						bindingsForPath[ index ] = bindingsForPath[ lastIndex ];
						bindingsForPath.pop();

					}

				} // cached or active

			} // if object is known

		} // for arguments

		this.nCachedObjects_ = nCachedObjects;

	}

	// Internal interface used by befriended PropertyBinding.Composite:

	subscribe_( path, parsedPath ) {

		// returns an array of bindings for the given path that is changed
		// according to the contained objects in the group

		const indicesByPath = this._bindingsIndicesByPath;
		let index = indicesByPath[ path ];
		const bindings = this._bindings;

		if ( index !== undefined ) return bindings[ index ];

		const paths = this._paths,
			parsedPaths = this._parsedPaths,
			objects = this._objects,
			nObjects = objects.length,
			nCachedObjects = this.nCachedObjects_,
			bindingsForPath = new Array( nObjects );

		index = bindings.length;

		indicesByPath[ path ] = index;

		paths.push( path );
		parsedPaths.push( parsedPath );
		bindings.push( bindingsForPath );

		for ( let i = nCachedObjects, n = objects.length; i !== n; ++ i ) {

			const object = objects[ i ];
			bindingsForPath[ i ] = new PropertyBinding( object, path, parsedPath );

		}

		return bindingsForPath;

	}

	unsubscribe_( path ) {

		// tells the group to forget about a property path and no longer
		// update the array previously obtained with 'subscribe_'

		const indicesByPath = this._bindingsIndicesByPath,
			index = indicesByPath[ path ];

		if ( index !== undefined ) {

			const paths = this._paths,
				parsedPaths = this._parsedPaths,
				bindings = this._bindings,
				lastBindingsIndex = bindings.length - 1,
				lastBindings = bindings[ lastBindingsIndex ],
				lastBindingsPath = path[ lastBindingsIndex ];

			indicesByPath[ lastBindingsPath ] = index;

			bindings[ index ] = lastBindings;
			bindings.pop();

			parsedPaths[ index ] = parsedPaths[ lastBindingsIndex ];
			parsedPaths.pop();

			paths[ index ] = paths[ lastBindingsIndex ];
			paths.pop();

		}

	}

}

class AnimationAction {

	constructor( mixer, clip, localRoot = null, blendMode = clip.blendMode ) {

		this._mixer = mixer;
		this._clip = clip;
		this._localRoot = localRoot;
		this.blendMode = blendMode;

		const tracks = clip.tracks,
			nTracks = tracks.length,
			interpolants = new Array( nTracks );

		const interpolantSettings = {
			endingStart: ZeroCurvatureEnding,
			endingEnd: ZeroCurvatureEnding
		};

		for ( let i = 0; i !== nTracks; ++ i ) {

			const interpolant = tracks[ i ].createInterpolant( null );
			interpolants[ i ] = interpolant;
			interpolant.settings = interpolantSettings;

		}

		this._interpolantSettings = interpolantSettings;

		this._interpolants = interpolants; // bound by the mixer

		// inside: PropertyMixer (managed by the mixer)
		this._propertyBindings = new Array( nTracks );

		this._cacheIndex = null; // for the memory manager
		this._byClipCacheIndex = null; // for the memory manager

		this._timeScaleInterpolant = null;
		this._weightInterpolant = null;

		this.loop = LoopRepeat;
		this._loopCount = - 1;

		// global mixer time when the action is to be started
		// it's set back to 'null' upon start of the action
		this._startTime = null;

		// scaled local time of the action
		// gets clamped or wrapped to 0..clip.duration according to loop
		this.time = 0;

		this.timeScale = 1;
		this._effectiveTimeScale = 1;

		this.weight = 1;
		this._effectiveWeight = 1;

		this.repetitions = Infinity; // no. of repetitions when looping

		this.paused = false; // true -> zero effective time scale
		this.enabled = true; // false -> zero effective weight

		this.clampWhenFinished = false;// keep feeding the last frame?

		this.zeroSlopeAtStart = true;// for smooth interpolation w/o separate
		this.zeroSlopeAtEnd = true;// clips for start, loop and end

	}

	// State & Scheduling

	play() {

		this._mixer._activateAction( this );

		return this;

	}

	stop() {

		this._mixer._deactivateAction( this );

		return this.reset();

	}

	reset() {

		this.paused = false;
		this.enabled = true;

		this.time = 0; // restart clip
		this._loopCount = - 1;// forget previous loops
		this._startTime = null;// forget scheduling

		return this.stopFading().stopWarping();

	}

	isRunning() {

		return this.enabled && ! this.paused && this.timeScale !== 0 &&
			this._startTime === null && this._mixer._isActiveAction( this );

	}

	// return true when play has been called
	isScheduled() {

		return this._mixer._isActiveAction( this );

	}

	startAt( time ) {

		this._startTime = time;

		return this;

	}

	setLoop( mode, repetitions ) {

		this.loop = mode;
		this.repetitions = repetitions;

		return this;

	}

	// Weight

	// set the weight stopping any scheduled fading
	// although .enabled = false yields an effective weight of zero, this
	// method does *not* change .enabled, because it would be confusing
	setEffectiveWeight( weight ) {

		this.weight = weight;

		// note: same logic as when updated at runtime
		this._effectiveWeight = this.enabled ? weight : 0;

		return this.stopFading();

	}

	// return the weight considering fading and .enabled
	getEffectiveWeight() {

		return this._effectiveWeight;

	}

	fadeIn( duration ) {

		return this._scheduleFading( duration, 0, 1 );

	}

	fadeOut( duration ) {

		return this._scheduleFading( duration, 1, 0 );

	}

	crossFadeFrom( fadeOutAction, duration, warp ) {

		fadeOutAction.fadeOut( duration );
		this.fadeIn( duration );

		if ( warp ) {

			const fadeInDuration = this._clip.duration,
				fadeOutDuration = fadeOutAction._clip.duration,

				startEndRatio = fadeOutDuration / fadeInDuration,
				endStartRatio = fadeInDuration / fadeOutDuration;

			fadeOutAction.warp( 1.0, startEndRatio, duration );
			this.warp( endStartRatio, 1.0, duration );

		}

		return this;

	}

	crossFadeTo( fadeInAction, duration, warp ) {

		return fadeInAction.crossFadeFrom( this, duration, warp );

	}

	stopFading() {

		const weightInterpolant = this._weightInterpolant;

		if ( weightInterpolant !== null ) {

			this._weightInterpolant = null;
			this._mixer._takeBackControlInterpolant( weightInterpolant );

		}

		return this;

	}

	// Time Scale Control

	// set the time scale stopping any scheduled warping
	// although .paused = true yields an effective time scale of zero, this
	// method does *not* change .paused, because it would be confusing
	setEffectiveTimeScale( timeScale ) {

		this.timeScale = timeScale;
		this._effectiveTimeScale = this.paused ? 0 : timeScale;

		return this.stopWarping();

	}

	// return the time scale considering warping and .paused
	getEffectiveTimeScale() {

		return this._effectiveTimeScale;

	}

	setDuration( duration ) {

		this.timeScale = this._clip.duration / duration;

		return this.stopWarping();

	}

	syncWith( action ) {

		this.time = action.time;
		this.timeScale = action.timeScale;

		return this.stopWarping();

	}

	halt( duration ) {

		return this.warp( this._effectiveTimeScale, 0, duration );

	}

	warp( startTimeScale, endTimeScale, duration ) {

		const mixer = this._mixer,
			now = mixer.time,
			timeScale = this.timeScale;

		let interpolant = this._timeScaleInterpolant;

		if ( interpolant === null ) {

			interpolant = mixer._lendControlInterpolant();
			this._timeScaleInterpolant = interpolant;

		}

		const times = interpolant.parameterPositions,
			values = interpolant.sampleValues;

		times[ 0 ] = now;
		times[ 1 ] = now + duration;

		values[ 0 ] = startTimeScale / timeScale;
		values[ 1 ] = endTimeScale / timeScale;

		return this;

	}

	stopWarping() {

		const timeScaleInterpolant = this._timeScaleInterpolant;

		if ( timeScaleInterpolant !== null ) {

			this._timeScaleInterpolant = null;
			this._mixer._takeBackControlInterpolant( timeScaleInterpolant );

		}

		return this;

	}

	// Object Accessors

	getMixer() {

		return this._mixer;

	}

	getClip() {

		return this._clip;

	}

	getRoot() {

		return this._localRoot || this._mixer._root;

	}

	// Interna

	_update( time, deltaTime, timeDirection, accuIndex ) {

		// called by the mixer

		if ( ! this.enabled ) {

			// call ._updateWeight() to update ._effectiveWeight

			this._updateWeight( time );
			return;

		}

		const startTime = this._startTime;

		if ( startTime !== null ) {

			// check for scheduled start of action

			const timeRunning = ( time - startTime ) * timeDirection;
			if ( timeRunning < 0 || timeDirection === 0 ) {

				deltaTime = 0;

			} else {


				this._startTime = null; // unschedule
				deltaTime = timeDirection * timeRunning;

			}

		}

		// apply time scale and advance time

		deltaTime *= this._updateTimeScale( time );
		const clipTime = this._updateTime( deltaTime );

		// note: _updateTime may disable the action resulting in
		// an effective weight of 0

		const weight = this._updateWeight( time );

		if ( weight > 0 ) {

			const interpolants = this._interpolants;
			const propertyMixers = this._propertyBindings;

			switch ( this.blendMode ) {

				case AdditiveAnimationBlendMode:

					for ( let j = 0, m = interpolants.length; j !== m; ++ j ) {

						interpolants[ j ].evaluate( clipTime );
						propertyMixers[ j ].accumulateAdditive( weight );

					}

					break;

				case NormalAnimationBlendMode:
				default:

					for ( let j = 0, m = interpolants.length; j !== m; ++ j ) {

						interpolants[ j ].evaluate( clipTime );
						propertyMixers[ j ].accumulate( accuIndex, weight );

					}

			}

		}

	}

	_updateWeight( time ) {

		let weight = 0;

		if ( this.enabled ) {

			weight = this.weight;
			const interpolant = this._weightInterpolant;

			if ( interpolant !== null ) {

				const interpolantValue = interpolant.evaluate( time )[ 0 ];

				weight *= interpolantValue;

				if ( time > interpolant.parameterPositions[ 1 ] ) {

					this.stopFading();

					if ( interpolantValue === 0 ) {

						// faded out, disable
						this.enabled = false;

					}

				}

			}

		}

		this._effectiveWeight = weight;
		return weight;

	}

	_updateTimeScale( time ) {

		let timeScale = 0;

		if ( ! this.paused ) {

			timeScale = this.timeScale;

			const interpolant = this._timeScaleInterpolant;

			if ( interpolant !== null ) {

				const interpolantValue = interpolant.evaluate( time )[ 0 ];

				timeScale *= interpolantValue;

				if ( time > interpolant.parameterPositions[ 1 ] ) {

					this.stopWarping();

					if ( timeScale === 0 ) {

						// motion has halted, pause
						this.paused = true;

					} else {

						// warp done - apply final time scale
						this.timeScale = timeScale;

					}

				}

			}

		}

		this._effectiveTimeScale = timeScale;
		return timeScale;

	}

	_updateTime( deltaTime ) {

		const duration = this._clip.duration;
		const loop = this.loop;

		let time = this.time + deltaTime;
		let loopCount = this._loopCount;

		const pingPong = ( loop === LoopPingPong );

		if ( deltaTime === 0 ) {

			if ( loopCount === - 1 ) return time;

			return ( pingPong && ( loopCount & 1 ) === 1 ) ? duration - time : time;

		}

		if ( loop === LoopOnce ) {

			if ( loopCount === - 1 ) {

				// just started

				this._loopCount = 0;
				this._setEndings( true, true, false );

			}

			handle_stop: {

				if ( time >= duration ) {

					time = duration;

				} else if ( time < 0 ) {

					time = 0;

				} else {

					this.time = time;

					break handle_stop;

				}

				if ( this.clampWhenFinished ) this.paused = true;
				else this.enabled = false;

				this.time = time;

				this._mixer.dispatchEvent( {
					type: 'finished', action: this,
					direction: deltaTime < 0 ? - 1 : 1
				} );

			}

		} else { // repetitive Repeat or PingPong

			if ( loopCount === - 1 ) {

				// just started

				if ( deltaTime >= 0 ) {

					loopCount = 0;

					this._setEndings( true, this.repetitions === 0, pingPong );

				} else {

					// when looping in reverse direction, the initial
					// transition through zero counts as a repetition,
					// so leave loopCount at -1

					this._setEndings( this.repetitions === 0, true, pingPong );

				}

			}

			if ( time >= duration || time < 0 ) {

				// wrap around

				const loopDelta = Math.floor( time / duration ); // signed
				time -= duration * loopDelta;

				loopCount += Math.abs( loopDelta );

				const pending = this.repetitions - loopCount;

				if ( pending <= 0 ) {

					// have to stop (switch state, clamp time, fire event)

					if ( this.clampWhenFinished ) this.paused = true;
					else this.enabled = false;

					time = deltaTime > 0 ? duration : 0;

					this.time = time;

					this._mixer.dispatchEvent( {
						type: 'finished', action: this,
						direction: deltaTime > 0 ? 1 : - 1
					} );

				} else {

					// keep running

					if ( pending === 1 ) {

						// entering the last round

						const atStart = deltaTime < 0;
						this._setEndings( atStart, ! atStart, pingPong );

					} else {

						this._setEndings( false, false, pingPong );

					}

					this._loopCount = loopCount;

					this.time = time;

					this._mixer.dispatchEvent( {
						type: 'loop', action: this, loopDelta: loopDelta
					} );

				}

			} else {

				this.time = time;

			}

			if ( pingPong && ( loopCount & 1 ) === 1 ) {

				// invert time for the "pong round"

				return duration - time;

			}

		}

		return time;

	}

	_setEndings( atStart, atEnd, pingPong ) {

		const settings = this._interpolantSettings;

		if ( pingPong ) {

			settings.endingStart = ZeroSlopeEnding;
			settings.endingEnd = ZeroSlopeEnding;

		} else {

			// assuming for LoopOnce atStart == atEnd == true

			if ( atStart ) {

				settings.endingStart = this.zeroSlopeAtStart ? ZeroSlopeEnding : ZeroCurvatureEnding;

			} else {

				settings.endingStart = WrapAroundEnding;

			}

			if ( atEnd ) {

				settings.endingEnd = this.zeroSlopeAtEnd ? ZeroSlopeEnding : ZeroCurvatureEnding;

			} else {

				settings.endingEnd 	 = WrapAroundEnding;

			}

		}

	}

	_scheduleFading( duration, weightNow, weightThen ) {

		const mixer = this._mixer, now = mixer.time;
		let interpolant = this._weightInterpolant;

		if ( interpolant === null ) {

			interpolant = mixer._lendControlInterpolant();
			this._weightInterpolant = interpolant;

		}

		const times = interpolant.parameterPositions,
			values = interpolant.sampleValues;

		times[ 0 ] = now;
		values[ 0 ] = weightNow;
		times[ 1 ] = now + duration;
		values[ 1 ] = weightThen;

		return this;

	}

}

const _controlInterpolantsResultBuffer = new Float32Array( 1 );


class AnimationMixer extends EventDispatcher {

	constructor( root ) {

		super();

		this._root = root;
		this._initMemoryManager();
		this._accuIndex = 0;
		this.time = 0;
		this.timeScale = 1.0;

	}

	_bindAction( action, prototypeAction ) {

		const root = action._localRoot || this._root,
			tracks = action._clip.tracks,
			nTracks = tracks.length,
			bindings = action._propertyBindings,
			interpolants = action._interpolants,
			rootUuid = root.uuid,
			bindingsByRoot = this._bindingsByRootAndName;

		let bindingsByName = bindingsByRoot[ rootUuid ];

		if ( bindingsByName === undefined ) {

			bindingsByName = {};
			bindingsByRoot[ rootUuid ] = bindingsByName;

		}

		for ( let i = 0; i !== nTracks; ++ i ) {

			const track = tracks[ i ],
				trackName = track.name;

			let binding = bindingsByName[ trackName ];

			if ( binding !== undefined ) {

				++ binding.referenceCount;
				bindings[ i ] = binding;

			} else {

				binding = bindings[ i ];

				if ( binding !== undefined ) {

					// existing binding, make sure the cache knows

					if ( binding._cacheIndex === null ) {

						++ binding.referenceCount;
						this._addInactiveBinding( binding, rootUuid, trackName );

					}

					continue;

				}

				const path = prototypeAction && prototypeAction.
					_propertyBindings[ i ].binding.parsedPath;

				binding = new PropertyMixer(
					PropertyBinding.create( root, trackName, path ),
					track.ValueTypeName, track.getValueSize() );

				++ binding.referenceCount;
				this._addInactiveBinding( binding, rootUuid, trackName );

				bindings[ i ] = binding;

			}

			interpolants[ i ].resultBuffer = binding.buffer;

		}

	}

	_activateAction( action ) {

		if ( ! this._isActiveAction( action ) ) {

			if ( action._cacheIndex === null ) {

				// this action has been forgotten by the cache, but the user
				// appears to be still using it -> rebind

				const rootUuid = ( action._localRoot || this._root ).uuid,
					clipUuid = action._clip.uuid,
					actionsForClip = this._actionsByClip[ clipUuid ];

				this._bindAction( action,
					actionsForClip && actionsForClip.knownActions[ 0 ] );

				this._addInactiveAction( action, clipUuid, rootUuid );

			}

			const bindings = action._propertyBindings;

			// increment reference counts / sort out state
			for ( let i = 0, n = bindings.length; i !== n; ++ i ) {

				const binding = bindings[ i ];

				if ( binding.useCount ++ === 0 ) {

					this._lendBinding( binding );
					binding.saveOriginalState();

				}

			}

			this._lendAction( action );

		}

	}

	_deactivateAction( action ) {

		if ( this._isActiveAction( action ) ) {

			const bindings = action._propertyBindings;

			// decrement reference counts / sort out state
			for ( let i = 0, n = bindings.length; i !== n; ++ i ) {

				const binding = bindings[ i ];

				if ( -- binding.useCount === 0 ) {

					binding.restoreOriginalState();
					this._takeBackBinding( binding );

				}

			}

			this._takeBackAction( action );

		}

	}

	// Memory manager

	_initMemoryManager() {

		this._actions = []; // 'nActiveActions' followed by inactive ones
		this._nActiveActions = 0;

		this._actionsByClip = {};
		// inside:
		// {
		// 	knownActions: Array< AnimationAction > - used as prototypes
		// 	actionByRoot: AnimationAction - lookup
		// }


		this._bindings = []; // 'nActiveBindings' followed by inactive ones
		this._nActiveBindings = 0;

		this._bindingsByRootAndName = {}; // inside: Map< name, PropertyMixer >


		this._controlInterpolants = []; // same game as above
		this._nActiveControlInterpolants = 0;

		const scope = this;

		this.stats = {

			actions: {
				get total() {

					return scope._actions.length;

				},
				get inUse() {

					return scope._nActiveActions;

				}
			},
			bindings: {
				get total() {

					return scope._bindings.length;

				},
				get inUse() {

					return scope._nActiveBindings;

				}
			},
			controlInterpolants: {
				get total() {

					return scope._controlInterpolants.length;

				},
				get inUse() {

					return scope._nActiveControlInterpolants;

				}
			}

		};

	}

	// Memory management for AnimationAction objects

	_isActiveAction( action ) {

		const index = action._cacheIndex;
		return index !== null && index < this._nActiveActions;

	}

	_addInactiveAction( action, clipUuid, rootUuid ) {

		const actions = this._actions,
			actionsByClip = this._actionsByClip;

		let actionsForClip = actionsByClip[ clipUuid ];

		if ( actionsForClip === undefined ) {

			actionsForClip = {

				knownActions: [ action ],
				actionByRoot: {}

			};

			action._byClipCacheIndex = 0;

			actionsByClip[ clipUuid ] = actionsForClip;

		} else {

			const knownActions = actionsForClip.knownActions;

			action._byClipCacheIndex = knownActions.length;
			knownActions.push( action );

		}

		action._cacheIndex = actions.length;
		actions.push( action );

		actionsForClip.actionByRoot[ rootUuid ] = action;

	}

	_removeInactiveAction( action ) {

		const actions = this._actions,
			lastInactiveAction = actions[ actions.length - 1 ],
			cacheIndex = action._cacheIndex;

		lastInactiveAction._cacheIndex = cacheIndex;
		actions[ cacheIndex ] = lastInactiveAction;
		actions.pop();

		action._cacheIndex = null;


		const clipUuid = action._clip.uuid,
			actionsByClip = this._actionsByClip,
			actionsForClip = actionsByClip[ clipUuid ],
			knownActionsForClip = actionsForClip.knownActions,

			lastKnownAction =
				knownActionsForClip[ knownActionsForClip.length - 1 ],

			byClipCacheIndex = action._byClipCacheIndex;

		lastKnownAction._byClipCacheIndex = byClipCacheIndex;
		knownActionsForClip[ byClipCacheIndex ] = lastKnownAction;
		knownActionsForClip.pop();

		action._byClipCacheIndex = null;


		const actionByRoot = actionsForClip.actionByRoot,
			rootUuid = ( action._localRoot || this._root ).uuid;

		delete actionByRoot[ rootUuid ];

		if ( knownActionsForClip.length === 0 ) {

			delete actionsByClip[ clipUuid ];

		}

		this._removeInactiveBindingsForAction( action );

	}

	_removeInactiveBindingsForAction( action ) {

		const bindings = action._propertyBindings;

		for ( let i = 0, n = bindings.length; i !== n; ++ i ) {

			const binding = bindings[ i ];

			if ( -- binding.referenceCount === 0 ) {

				this._removeInactiveBinding( binding );

			}

		}

	}

	_lendAction( action ) {

		// [ active actions |  inactive actions  ]
		// [  active actions >| inactive actions ]
		//                 s        a
		//                  <-swap->
		//                 a        s

		const actions = this._actions,
			prevIndex = action._cacheIndex,

			lastActiveIndex = this._nActiveActions ++,

			firstInactiveAction = actions[ lastActiveIndex ];

		action._cacheIndex = lastActiveIndex;
		actions[ lastActiveIndex ] = action;

		firstInactiveAction._cacheIndex = prevIndex;
		actions[ prevIndex ] = firstInactiveAction;

	}

	_takeBackAction( action ) {

		// [  active actions  | inactive actions ]
		// [ active actions |< inactive actions  ]
		//        a        s
		//         <-swap->
		//        s        a

		const actions = this._actions,
			prevIndex = action._cacheIndex,

			firstInactiveIndex = -- this._nActiveActions,

			lastActiveAction = actions[ firstInactiveIndex ];

		action._cacheIndex = firstInactiveIndex;
		actions[ firstInactiveIndex ] = action;

		lastActiveAction._cacheIndex = prevIndex;
		actions[ prevIndex ] = lastActiveAction;

	}

	// Memory management for PropertyMixer objects

	_addInactiveBinding( binding, rootUuid, trackName ) {

		const bindingsByRoot = this._bindingsByRootAndName,
			bindings = this._bindings;

		let bindingByName = bindingsByRoot[ rootUuid ];

		if ( bindingByName === undefined ) {

			bindingByName = {};
			bindingsByRoot[ rootUuid ] = bindingByName;

		}

		bindingByName[ trackName ] = binding;

		binding._cacheIndex = bindings.length;
		bindings.push( binding );

	}

	_removeInactiveBinding( binding ) {

		const bindings = this._bindings,
			propBinding = binding.binding,
			rootUuid = propBinding.rootNode.uuid,
			trackName = propBinding.path,
			bindingsByRoot = this._bindingsByRootAndName,
			bindingByName = bindingsByRoot[ rootUuid ],

			lastInactiveBinding = bindings[ bindings.length - 1 ],
			cacheIndex = binding._cacheIndex;

		lastInactiveBinding._cacheIndex = cacheIndex;
		bindings[ cacheIndex ] = lastInactiveBinding;
		bindings.pop();

		delete bindingByName[ trackName ];

		if ( Object.keys( bindingByName ).length === 0 ) {

			delete bindingsByRoot[ rootUuid ];

		}

	}

	_lendBinding( binding ) {

		const bindings = this._bindings,
			prevIndex = binding._cacheIndex,

			lastActiveIndex = this._nActiveBindings ++,

			firstInactiveBinding = bindings[ lastActiveIndex ];

		binding._cacheIndex = lastActiveIndex;
		bindings[ lastActiveIndex ] = binding;

		firstInactiveBinding._cacheIndex = prevIndex;
		bindings[ prevIndex ] = firstInactiveBinding;

	}

	_takeBackBinding( binding ) {

		const bindings = this._bindings,
			prevIndex = binding._cacheIndex,

			firstInactiveIndex = -- this._nActiveBindings,

			lastActiveBinding = bindings[ firstInactiveIndex ];

		binding._cacheIndex = firstInactiveIndex;
		bindings[ firstInactiveIndex ] = binding;

		lastActiveBinding._cacheIndex = prevIndex;
		bindings[ prevIndex ] = lastActiveBinding;

	}


	// Memory management of Interpolants for weight and time scale

	_lendControlInterpolant() {

		const interpolants = this._controlInterpolants,
			lastActiveIndex = this._nActiveControlInterpolants ++;

		let interpolant = interpolants[ lastActiveIndex ];

		if ( interpolant === undefined ) {

			interpolant = new LinearInterpolant(
				new Float32Array( 2 ), new Float32Array( 2 ),
				1, _controlInterpolantsResultBuffer );

			interpolant.__cacheIndex = lastActiveIndex;
			interpolants[ lastActiveIndex ] = interpolant;

		}

		return interpolant;

	}

	_takeBackControlInterpolant( interpolant ) {

		const interpolants = this._controlInterpolants,
			prevIndex = interpolant.__cacheIndex,

			firstInactiveIndex = -- this._nActiveControlInterpolants,

			lastActiveInterpolant = interpolants[ firstInactiveIndex ];

		interpolant.__cacheIndex = firstInactiveIndex;
		interpolants[ firstInactiveIndex ] = interpolant;

		lastActiveInterpolant.__cacheIndex = prevIndex;
		interpolants[ prevIndex ] = lastActiveInterpolant;

	}

	// return an action for a clip optionally using a custom root target
	// object (this method allocates a lot of dynamic memory in case a
	// previously unknown clip/root combination is specified)
	clipAction( clip, optionalRoot, blendMode ) {

		const root = optionalRoot || this._root,
			rootUuid = root.uuid;

		let clipObject = typeof clip === 'string' ? AnimationClip.findByName( root, clip ) : clip;

		const clipUuid = clipObject !== null ? clipObject.uuid : clip;

		const actionsForClip = this._actionsByClip[ clipUuid ];
		let prototypeAction = null;

		if ( blendMode === undefined ) {

			if ( clipObject !== null ) {

				blendMode = clipObject.blendMode;

			} else {

				blendMode = NormalAnimationBlendMode;

			}

		}

		if ( actionsForClip !== undefined ) {

			const existingAction = actionsForClip.actionByRoot[ rootUuid ];

			if ( existingAction !== undefined && existingAction.blendMode === blendMode ) {

				return existingAction;

			}

			// we know the clip, so we don't have to parse all
			// the bindings again but can just copy
			prototypeAction = actionsForClip.knownActions[ 0 ];

			// also, take the clip from the prototype action
			if ( clipObject === null )
				clipObject = prototypeAction._clip;

		}

		// clip must be known when specified via string
		if ( clipObject === null ) return null;

		// allocate all resources required to run it
		const newAction = new AnimationAction( this, clipObject, optionalRoot, blendMode );

		this._bindAction( newAction, prototypeAction );

		// and make the action known to the memory manager
		this._addInactiveAction( newAction, clipUuid, rootUuid );

		return newAction;

	}

	// get an existing action
	existingAction( clip, optionalRoot ) {

		const root = optionalRoot || this._root,
			rootUuid = root.uuid,

			clipObject = typeof clip === 'string' ?
				AnimationClip.findByName( root, clip ) : clip,

			clipUuid = clipObject ? clipObject.uuid : clip,

			actionsForClip = this._actionsByClip[ clipUuid ];

		if ( actionsForClip !== undefined ) {

			return actionsForClip.actionByRoot[ rootUuid ] || null;

		}

		return null;

	}

	// deactivates all previously scheduled actions
	stopAllAction() {

		const actions = this._actions,
			nActions = this._nActiveActions;

		for ( let i = nActions - 1; i >= 0; -- i ) {

			actions[ i ].stop();

		}

		return this;

	}

	// advance the time and update apply the animation
	update( deltaTime ) {

		deltaTime *= this.timeScale;

		const actions = this._actions,
			nActions = this._nActiveActions,

			time = this.time += deltaTime,
			timeDirection = Math.sign( deltaTime ),

			accuIndex = this._accuIndex ^= 1;

		// run active actions

		for ( let i = 0; i !== nActions; ++ i ) {

			const action = actions[ i ];

			action._update( time, deltaTime, timeDirection, accuIndex );

		}

		// update scene graph

		const bindings = this._bindings,
			nBindings = this._nActiveBindings;

		for ( let i = 0; i !== nBindings; ++ i ) {

			bindings[ i ].apply( accuIndex );

		}

		return this;

	}

	// Allows you to seek to a specific time in an animation.
	setTime( timeInSeconds ) {

		this.time = 0; // Zero out time attribute for AnimationMixer object;
		for ( let i = 0; i < this._actions.length; i ++ ) {

			this._actions[ i ].time = 0; // Zero out time attribute for all associated AnimationAction objects.

		}

		return this.update( timeInSeconds ); // Update used to set exact time. Returns "this" AnimationMixer object.

	}

	// return this mixer's root target object
	getRoot() {

		return this._root;

	}

	// free all resources specific to a particular clip
	uncacheClip( clip ) {

		const actions = this._actions,
			clipUuid = clip.uuid,
			actionsByClip = this._actionsByClip,
			actionsForClip = actionsByClip[ clipUuid ];

		if ( actionsForClip !== undefined ) {

			// note: just calling _removeInactiveAction would mess up the
			// iteration state and also require updating the state we can
			// just throw away

			const actionsToRemove = actionsForClip.knownActions;

			for ( let i = 0, n = actionsToRemove.length; i !== n; ++ i ) {

				const action = actionsToRemove[ i ];

				this._deactivateAction( action );

				const cacheIndex = action._cacheIndex,
					lastInactiveAction = actions[ actions.length - 1 ];

				action._cacheIndex = null;
				action._byClipCacheIndex = null;

				lastInactiveAction._cacheIndex = cacheIndex;
				actions[ cacheIndex ] = lastInactiveAction;
				actions.pop();

				this._removeInactiveBindingsForAction( action );

			}

			delete actionsByClip[ clipUuid ];

		}

	}

	// free all resources specific to a particular root target object
	uncacheRoot( root ) {

		const rootUuid = root.uuid,
			actionsByClip = this._actionsByClip;

		for ( const clipUuid in actionsByClip ) {

			const actionByRoot = actionsByClip[ clipUuid ].actionByRoot,
				action = actionByRoot[ rootUuid ];

			if ( action !== undefined ) {

				this._deactivateAction( action );
				this._removeInactiveAction( action );

			}

		}

		const bindingsByRoot = this._bindingsByRootAndName,
			bindingByName = bindingsByRoot[ rootUuid ];

		if ( bindingByName !== undefined ) {

			for ( const trackName in bindingByName ) {

				const binding = bindingByName[ trackName ];
				binding.restoreOriginalState();
				this._removeInactiveBinding( binding );

			}

		}

	}

	// remove a targeted clip from the cache
	uncacheAction( clip, optionalRoot ) {

		const action = this.existingAction( clip, optionalRoot );

		if ( action !== null ) {

			this._deactivateAction( action );
			this._removeInactiveAction( action );

		}

	}

}

class RenderTarget3D extends RenderTarget {

	constructor( width = 1, height = 1, depth = 1, options = {} ) {

		super( width, height, options );

		this.isRenderTarget3D = true;

		this.depth = depth;

		this.texture = new Data3DTexture( null, width, height, depth );

		this.texture.isRenderTargetTexture = true;

	}

}

class RenderTargetArray extends RenderTarget {

	constructor( width = 1, height = 1, depth = 1, options = {} ) {

		super( width, height, options );

		this.isRenderTargetArray = true;

		this.depth = depth;

		this.texture = new DataArrayTexture( null, width, height, depth );

		this.texture.isRenderTargetTexture = true;

	}

}

class Uniform {

	constructor( value ) {

		this.value = value;

	}

	clone() {

		return new Uniform( this.value.clone === undefined ? this.value : this.value.clone() );

	}

}

let _id = 0;

class UniformsGroup extends EventDispatcher {

	constructor() {

		super();

		this.isUniformsGroup = true;

		Object.defineProperty( this, 'id', { value: _id ++ } );

		this.name = '';

		this.usage = StaticDrawUsage;
		this.uniforms = [];

	}

	add( uniform ) {

		this.uniforms.push( uniform );

		return this;

	}

	remove( uniform ) {

		const index = this.uniforms.indexOf( uniform );

		if ( index !== - 1 ) this.uniforms.splice( index, 1 );

		return this;

	}

	setName( name ) {

		this.name = name;

		return this;

	}

	setUsage( value ) {

		this.usage = value;

		return this;

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

		return this;

	}

	copy( source ) {

		this.name = source.name;
		this.usage = source.usage;

		const uniformsSource = source.uniforms;

		this.uniforms.length = 0;

		for ( let i = 0, l = uniformsSource.length; i < l; i ++ ) {

			const uniforms = Array.isArray( uniformsSource[ i ] ) ? uniformsSource[ i ] : [ uniformsSource[ i ] ];

			for ( let j = 0; j < uniforms.length; j ++ ) {

				this.uniforms.push( uniforms[ j ].clone() );

			}

		}

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

class InstancedInterleavedBuffer extends InterleavedBuffer {

	constructor( array, stride, meshPerAttribute = 1 ) {

		super( array, stride );

		this.isInstancedInterleavedBuffer = true;

		this.meshPerAttribute = meshPerAttribute;

	}

	copy( source ) {

		super.copy( source );

		this.meshPerAttribute = source.meshPerAttribute;

		return this;

	}

	clone( data ) {

		const ib = super.clone( data );

		ib.meshPerAttribute = this.meshPerAttribute;

		return ib;

	}

	toJSON( data ) {

		const json = super.toJSON( data );

		json.isInstancedInterleavedBuffer = true;
		json.meshPerAttribute = this.meshPerAttribute;

		return json;

	}

}

class GLBufferAttribute {

	constructor( buffer, type, itemSize, elementSize, count ) {

		this.isGLBufferAttribute = true;

		this.name = '';

		this.buffer = buffer;
		this.type = type;
		this.itemSize = itemSize;
		this.elementSize = elementSize;
		this.count = count;

		this.version = 0;

	}

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

	setBuffer( buffer ) {

		this.buffer = buffer;

		return this;

	}

	setType( type, elementSize ) {

		this.type = type;
		this.elementSize = elementSize;

		return this;

	}

	setItemSize( itemSize ) {

		this.itemSize = itemSize;

		return this;

	}

	setCount( count ) {

		this.count = count;

		return this;

	}

}

const _matrix = /*@__PURE__*/ new Matrix4();

class Raycaster {

	constructor( origin, direction, near = 0, far = Infinity ) {

		this.ray = new Ray( origin, direction );
		// direction is assumed to be normalized (for accurate distance calculations)

		this.near = near;
		this.far = far;
		this.camera = null;
		this.layers = new Layers();

		this.params = {
			Mesh: {},
			Line: { threshold: 1 },
			LOD: {},
			Points: { threshold: 1 },
			Sprite: {}
		};

	}

	set( origin, direction ) {

		// direction is assumed to be normalized (for accurate distance calculations)

		this.ray.set( origin, direction );

	}

	setFromCamera( coords, camera ) {

		if ( camera.isPerspectiveCamera ) {

			this.ray.origin.setFromMatrixPosition( camera.matrixWorld );
			this.ray.direction.set( coords.x, coords.y, 0.5 ).unproject( camera ).sub( this.ray.origin ).normalize();
			this.camera = camera;

		} else if ( camera.isOrthographicCamera ) {

			this.ray.origin.set( coords.x, coords.y, ( camera.near + camera.far ) / ( camera.near - camera.far ) ).unproject( camera ); // set origin in plane of camera
			this.ray.direction.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld );
			this.camera = camera;

		} else {

			console.error( 'THREE.Raycaster: Unsupported camera type: ' + camera.type );

		}

	}

	setFromXRController( controller ) {

		_matrix.identity().extractRotation( controller.matrixWorld );

		this.ray.origin.setFromMatrixPosition( controller.matrixWorld );
		this.ray.direction.set( 0, 0, - 1 ).applyMatrix4( _matrix );

		return this;

	}

	intersectObject( object, recursive = true, intersects = [] ) {

		intersect( object, this, intersects, recursive );

		intersects.sort( ascSort );

		return intersects;

	}

	intersectObjects( objects, recursive = true, intersects = [] ) {

		for ( let i = 0, l = objects.length; i < l; i ++ ) {

			intersect( objects[ i ], this, intersects, recursive );

		}

		intersects.sort( ascSort );

		return intersects;

	}

}

function ascSort( a, b ) {

	return a.distance - b.distance;

}

function intersect( object, raycaster, intersects, recursive ) {

	let propagate = true;

	if ( object.layers.test( raycaster.layers ) ) {

		const result = object.raycast( raycaster, intersects );

		if ( result === false ) propagate = false;

	}

	if ( propagate === true && recursive === true ) {

		const children = object.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			intersect( children[ i ], raycaster, intersects, true );

		}

	}

}

/**
 * Ref: https://en.wikipedia.org/wiki/Spherical_coordinate_system
 *
 * phi (the polar angle) is measured from the positive y-axis. The positive y-axis is up.
 * theta (the azimuthal angle) is measured from the positive z-axis.
 */
class Spherical {

	constructor( radius = 1, phi = 0, theta = 0 ) {

		this.radius = radius;
		this.phi = phi; // polar angle
		this.theta = theta; // azimuthal angle

		return this;

	}

	set( radius, phi, theta ) {

		this.radius = radius;
		this.phi = phi;
		this.theta = theta;

		return this;

	}

	copy( other ) {

		this.radius = other.radius;
		this.phi = other.phi;
		this.theta = other.theta;

		return this;

	}

	// restrict phi to be between EPS and PI-EPS
	makeSafe() {

		const EPS = 0.000001;
		this.phi = clamp( this.phi, EPS, Math.PI - EPS );

		return this;

	}

	setFromVector3( v ) {

		return this.setFromCartesianCoords( v.x, v.y, v.z );

	}

	setFromCartesianCoords( x, y, z ) {

		this.radius = Math.sqrt( x * x + y * y + z * z );

		if ( this.radius === 0 ) {

			this.theta = 0;
			this.phi = 0;

		} else {

			this.theta = Math.atan2( x, z );
			this.phi = Math.acos( clamp( y / this.radius, - 1, 1 ) );

		}

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

/**
 * Ref: https://en.wikipedia.org/wiki/Cylindrical_coordinate_system
 */

class Cylindrical {

	constructor( radius = 1, theta = 0, y = 0 ) {

		this.radius = radius; // distance from the origin to a point in the x-z plane
		this.theta = theta; // counterclockwise angle in the x-z plane measured in radians from the positive z-axis
		this.y = y; // height above the x-z plane

		return this;

	}

	set( radius, theta, y ) {

		this.radius = radius;
		this.theta = theta;
		this.y = y;

		return this;

	}

	copy( other ) {

		this.radius = other.radius;
		this.theta = other.theta;
		this.y = other.y;

		return this;

	}

	setFromVector3( v ) {

		return this.setFromCartesianCoords( v.x, v.y, v.z );

	}

	setFromCartesianCoords( x, y, z ) {

		this.radius = Math.sqrt( x * x + z * z );
		this.theta = Math.atan2( x, z );
		this.y = y;

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

class Matrix2 {

	constructor( n11, n12, n21, n22 ) {

		Matrix2.prototype.isMatrix2 = true;

		this.elements = [
			1, 0,
			0, 1,
		];

		if ( n11 !== undefined ) {

			this.set( n11, n12, n21, n22 );

		}

	}

	identity() {

		this.set(
			1, 0,
			0, 1,
		);

		return this;

	}

	fromArray( array, offset = 0 ) {

		for ( let i = 0; i < 4; i ++ ) {

			this.elements[ i ] = array[ i + offset ];

		}

		return this;

	}

	set( n11, n12, n21, n22 ) {

		const te = this.elements;

		te[ 0 ] = n11; te[ 2 ] = n12;
		te[ 1 ] = n21; te[ 3 ] = n22;

		return this;

	}

}

const _vector$4 = /*@__PURE__*/ new Vector2();

class Box2 {

	constructor( min = new Vector2( + Infinity, + Infinity ), max = new Vector2( - Infinity, - Infinity ) ) {

		this.isBox2 = true;

		this.min = min;
		this.max = max;

	}

	set( min, max ) {

		this.min.copy( min );
		this.max.copy( max );

		return this;

	}

	setFromPoints( points ) {

		this.makeEmpty();

		for ( let i = 0, il = points.length; i < il; i ++ ) {

			this.expandByPoint( points[ i ] );

		}

		return this;

	}

	setFromCenterAndSize( center, size ) {

		const halfSize = _vector$4.copy( size ).multiplyScalar( 0.5 );
		this.min.copy( center ).sub( halfSize );
		this.max.copy( center ).add( halfSize );

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	copy( box ) {

		this.min.copy( box.min );
		this.max.copy( box.max );

		return this;

	}

	makeEmpty() {

		this.min.x = this.min.y = + Infinity;
		this.max.x = this.max.y = - Infinity;

		return this;

	}

	isEmpty() {

		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

		return ( this.max.x < this.min.x ) || ( this.max.y < this.min.y );

	}

	getCenter( target ) {

		return this.isEmpty() ? target.set( 0, 0 ) : target.addVectors( this.min, this.max ).multiplyScalar( 0.5 );

	}

	getSize( target ) {

		return this.isEmpty() ? target.set( 0, 0 ) : target.subVectors( this.max, this.min );

	}

	expandByPoint( point ) {

		this.min.min( point );
		this.max.max( point );

		return this;

	}

	expandByVector( vector ) {

		this.min.sub( vector );
		this.max.add( vector );

		return this;

	}

	expandByScalar( scalar ) {

		this.min.addScalar( - scalar );
		this.max.addScalar( scalar );

		return this;

	}

	containsPoint( point ) {

		return point.x >= this.min.x && point.x <= this.max.x &&
			point.y >= this.min.y && point.y <= this.max.y;

	}

	containsBox( box ) {

		return this.min.x <= box.min.x && box.max.x <= this.max.x &&
			this.min.y <= box.min.y && box.max.y <= this.max.y;

	}

	getParameter( point, target ) {

		// This can potentially have a divide by zero if the box
		// has a size dimension of 0.

		return target.set(
			( point.x - this.min.x ) / ( this.max.x - this.min.x ),
			( point.y - this.min.y ) / ( this.max.y - this.min.y )
		);

	}

	intersectsBox( box ) {

		// using 4 splitting planes to rule out intersections

		return box.max.x >= this.min.x && box.min.x <= this.max.x &&
			box.max.y >= this.min.y && box.min.y <= this.max.y;

	}

	clampPoint( point, target ) {

		return target.copy( point ).clamp( this.min, this.max );

	}

	distanceToPoint( point ) {

		return this.clampPoint( point, _vector$4 ).distanceTo( point );

	}

	intersect( box ) {

		this.min.max( box.min );
		this.max.min( box.max );

		if ( this.isEmpty() ) this.makeEmpty();

		return this;

	}

	union( box ) {

		this.min.min( box.min );
		this.max.max( box.max );

		return this;

	}

	translate( offset ) {

		this.min.add( offset );
		this.max.add( offset );

		return this;

	}

	equals( box ) {

		return box.min.equals( this.min ) && box.max.equals( this.max );

	}

}

const _startP = /*@__PURE__*/ new Vector3();
const _startEnd = /*@__PURE__*/ new Vector3();

class Line3 {

	constructor( start = new Vector3(), end = new Vector3() ) {

		this.start = start;
		this.end = end;

	}

	set( start, end ) {

		this.start.copy( start );
		this.end.copy( end );

		return this;

	}

	copy( line ) {

		this.start.copy( line.start );
		this.end.copy( line.end );

		return this;

	}

	getCenter( target ) {

		return target.addVectors( this.start, this.end ).multiplyScalar( 0.5 );

	}

	delta( target ) {

		return target.subVectors( this.end, this.start );

	}

	distanceSq() {

		return this.start.distanceToSquared( this.end );

	}

	distance() {

		return this.start.distanceTo( this.end );

	}

	at( t, target ) {

		return this.delta( target ).multiplyScalar( t ).add( this.start );

	}

	closestPointToPointParameter( point, clampToLine ) {

		_startP.subVectors( point, this.start );
		_startEnd.subVectors( this.end, this.start );

		const startEnd2 = _startEnd.dot( _startEnd );
		const startEnd_startP = _startEnd.dot( _startP );

		let t = startEnd_startP / startEnd2;

		if ( clampToLine ) {

			t = clamp( t, 0, 1 );

		}

		return t;

	}

	closestPointToPoint( point, clampToLine, target ) {

		const t = this.closestPointToPointParameter( point, clampToLine );

		return this.delta( target ).multiplyScalar( t ).add( this.start );

	}

	applyMatrix4( matrix ) {

		this.start.applyMatrix4( matrix );
		this.end.applyMatrix4( matrix );

		return this;

	}

	equals( line ) {

		return line.start.equals( this.start ) && line.end.equals( this.end );

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

const _vector$3 = /*@__PURE__*/ new Vector3();

class SpotLightHelper extends Object3D {

	constructor( light, color ) {

		super();

		this.light = light;

		this.matrixAutoUpdate = false;

		this.color = color;

		this.type = 'SpotLightHelper';

		const geometry = new BufferGeometry();

		const positions = [
			0, 0, 0, 	0, 0, 1,
			0, 0, 0, 	1, 0, 1,
			0, 0, 0,	- 1, 0, 1,
			0, 0, 0, 	0, 1, 1,
			0, 0, 0, 	0, - 1, 1
		];

		for ( let i = 0, j = 1, l = 32; i < l; i ++, j ++ ) {

			const p1 = ( i / l ) * Math.PI * 2;
			const p2 = ( j / l ) * Math.PI * 2;

			positions.push(
				Math.cos( p1 ), Math.sin( p1 ), 1,
				Math.cos( p2 ), Math.sin( p2 ), 1
			);

		}

		geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );

		const material = new LineBasicMaterial( { fog: false, toneMapped: false } );

		this.cone = new LineSegments( geometry, material );
		this.add( this.cone );

		this.update();

	}

	dispose() {

		this.cone.geometry.dispose();
		this.cone.material.dispose();

	}

	update() {

		this.light.updateWorldMatrix( true, false );
		this.light.target.updateWorldMatrix( true, false );

		// update the local matrix based on the parent and light target transforms
		if ( this.parent ) {

			this.parent.updateWorldMatrix( true );

			this.matrix
				.copy( this.parent.matrixWorld )
				.invert()
				.multiply( this.light.matrixWorld );

		} else {

			this.matrix.copy( this.light.matrixWorld );

		}

		this.matrixWorld.copy( this.light.matrixWorld );

		const coneLength = this.light.distance ? this.light.distance : 1000;
		const coneWidth = coneLength * Math.tan( this.light.angle );

		this.cone.scale.set( coneWidth, coneWidth, coneLength );

		_vector$3.setFromMatrixPosition( this.light.target.matrixWorld );

		this.cone.lookAt( _vector$3 );

		if ( this.color !== undefined ) {

			this.cone.material.color.set( this.color );

		} else {

			this.cone.material.color.copy( this.light.color );

		}

	}

}

const _vector$2 = /*@__PURE__*/ new Vector3();
const _boneMatrix = /*@__PURE__*/ new Matrix4();
const _matrixWorldInv = /*@__PURE__*/ new Matrix4();


class SkeletonHelper extends LineSegments {

	constructor( object ) {

		const bones = getBoneList( object );

		const geometry = new BufferGeometry();

		const vertices = [];
		const colors = [];

		const color1 = new Color( 0, 0, 1 );
		const color2 = new Color( 0, 1, 0 );

		for ( let i = 0; i < bones.length; i ++ ) {

			const bone = bones[ i ];

			if ( bone.parent && bone.parent.isBone ) {

				vertices.push( 0, 0, 0 );
				vertices.push( 0, 0, 0 );
				colors.push( color1.r, color1.g, color1.b );
				colors.push( color2.r, color2.g, color2.b );

			}

		}

		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		const material = new LineBasicMaterial( { vertexColors: true, depthTest: false, depthWrite: false, toneMapped: false, transparent: true } );

		super( geometry, material );

		this.isSkeletonHelper = true;

		this.type = 'SkeletonHelper';

		this.root = object;
		this.bones = bones;

		this.matrix = object.matrixWorld;
		this.matrixAutoUpdate = false;

	}

	updateMatrixWorld( force ) {

		const bones = this.bones;

		const geometry = this.geometry;
		const position = geometry.getAttribute( 'position' );

		_matrixWorldInv.copy( this.root.matrixWorld ).invert();

		for ( let i = 0, j = 0; i < bones.length; i ++ ) {

			const bone = bones[ i ];

			if ( bone.parent && bone.parent.isBone ) {

				_boneMatrix.multiplyMatrices( _matrixWorldInv, bone.matrixWorld );
				_vector$2.setFromMatrixPosition( _boneMatrix );
				position.setXYZ( j, _vector$2.x, _vector$2.y, _vector$2.z );

				_boneMatrix.multiplyMatrices( _matrixWorldInv, bone.parent.matrixWorld );
				_vector$2.setFromMatrixPosition( _boneMatrix );
				position.setXYZ( j + 1, _vector$2.x, _vector$2.y, _vector$2.z );

				j += 2;

			}

		}

		geometry.getAttribute( 'position' ).needsUpdate = true;

		super.updateMatrixWorld( force );

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}


function getBoneList( object ) {

	const boneList = [];

	if ( object.isBone === true ) {

		boneList.push( object );

	}

	for ( let i = 0; i < object.children.length; i ++ ) {

		boneList.push.apply( boneList, getBoneList( object.children[ i ] ) );

	}

	return boneList;

}

class PointLightHelper extends Mesh {

	constructor( light, sphereSize, color ) {

		const geometry = new SphereGeometry( sphereSize, 4, 2 );
		const material = new MeshBasicMaterial( { wireframe: true, fog: false, toneMapped: false } );

		super( geometry, material );

		this.light = light;

		this.color = color;

		this.type = 'PointLightHelper';

		this.matrix = this.light.matrixWorld;
		this.matrixAutoUpdate = false;

		this.update();


		/*
	// TODO: delete this comment?
	const distanceGeometry = new THREE.IcosahedronGeometry( 1, 2 );
	const distanceMaterial = new THREE.MeshBasicMaterial( { color: hexColor, fog: false, wireframe: true, opacity: 0.1, transparent: true } );

	this.lightSphere = new THREE.Mesh( bulbGeometry, bulbMaterial );
	this.lightDistance = new THREE.Mesh( distanceGeometry, distanceMaterial );

	const d = light.distance;

	if ( d === 0.0 ) {

		this.lightDistance.visible = false;

	} else {

		this.lightDistance.scale.set( d, d, d );

	}

	this.add( this.lightDistance );
	*/

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

	update() {

		this.light.updateWorldMatrix( true, false );

		if ( this.color !== undefined ) {

			this.material.color.set( this.color );

		} else {

			this.material.color.copy( this.light.color );

		}

		/*
		const d = this.light.distance;

		if ( d === 0.0 ) {

			this.lightDistance.visible = false;

		} else {

			this.lightDistance.visible = true;
			this.lightDistance.scale.set( d, d, d );

		}
		*/

	}

}

const _vector$1 = /*@__PURE__*/ new Vector3();
const _color1 = /*@__PURE__*/ new Color();
const _color2 = /*@__PURE__*/ new Color();

class HemisphereLightHelper extends Object3D {

	constructor( light, size, color ) {

		super();

		this.light = light;

		this.matrix = light.matrixWorld;
		this.matrixAutoUpdate = false;

		this.color = color;

		this.type = 'HemisphereLightHelper';

		const geometry = new OctahedronGeometry( size );
		geometry.rotateY( Math.PI * 0.5 );

		this.material = new MeshBasicMaterial( { wireframe: true, fog: false, toneMapped: false } );
		if ( this.color === undefined ) this.material.vertexColors = true;

		const position = geometry.getAttribute( 'position' );
		const colors = new Float32Array( position.count * 3 );

		geometry.setAttribute( 'color', new BufferAttribute( colors, 3 ) );

		this.add( new Mesh( geometry, this.material ) );

		this.update();

	}

	dispose() {

		this.children[ 0 ].geometry.dispose();
		this.children[ 0 ].material.dispose();

	}

	update() {

		const mesh = this.children[ 0 ];

		if ( this.color !== undefined ) {

			this.material.color.set( this.color );

		} else {

			const colors = mesh.geometry.getAttribute( 'color' );

			_color1.copy( this.light.color );
			_color2.copy( this.light.groundColor );

			for ( let i = 0, l = colors.count; i < l; i ++ ) {

				const color = ( i < ( l / 2 ) ) ? _color1 : _color2;

				colors.setXYZ( i, color.r, color.g, color.b );

			}

			colors.needsUpdate = true;

		}

		this.light.updateWorldMatrix( true, false );

		mesh.lookAt( _vector$1.setFromMatrixPosition( this.light.matrixWorld ).negate() );

	}

}

class GridHelper extends LineSegments {

	constructor( size = 10, divisions = 10, color1 = 0x444444, color2 = 0x888888 ) {

		color1 = new Color( color1 );
		color2 = new Color( color2 );

		const center = divisions / 2;
		const step = size / divisions;
		const halfSize = size / 2;

		const vertices = [], colors = [];

		for ( let i = 0, j = 0, k = - halfSize; i <= divisions; i ++, k += step ) {

			vertices.push( - halfSize, 0, k, halfSize, 0, k );
			vertices.push( k, 0, - halfSize, k, 0, halfSize );

			const color = i === center ? color1 : color2;

			color.toArray( colors, j ); j += 3;
			color.toArray( colors, j ); j += 3;
			color.toArray( colors, j ); j += 3;
			color.toArray( colors, j ); j += 3;

		}

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		const material = new LineBasicMaterial( { vertexColors: true, toneMapped: false } );

		super( geometry, material );

		this.type = 'GridHelper';

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}

class PolarGridHelper extends LineSegments {

	constructor( radius = 10, sectors = 16, rings = 8, divisions = 64, color1 = 0x444444, color2 = 0x888888 ) {

		color1 = new Color( color1 );
		color2 = new Color( color2 );

		const vertices = [];
		const colors = [];

		// create the sectors

		if ( sectors > 1 ) {

			for ( let i = 0; i < sectors; i ++ ) {

				const v = ( i / sectors ) * ( Math.PI * 2 );

				const x = Math.sin( v ) * radius;
				const z = Math.cos( v ) * radius;

				vertices.push( 0, 0, 0 );
				vertices.push( x, 0, z );

				const color = ( i & 1 ) ? color1 : color2;

				colors.push( color.r, color.g, color.b );
				colors.push( color.r, color.g, color.b );

			}

		}

		// create the rings

		for ( let i = 0; i < rings; i ++ ) {

			const color = ( i & 1 ) ? color1 : color2;

			const r = radius - ( radius / rings * i );

			for ( let j = 0; j < divisions; j ++ ) {

				// first vertex

				let v = ( j / divisions ) * ( Math.PI * 2 );

				let x = Math.sin( v ) * r;
				let z = Math.cos( v ) * r;

				vertices.push( x, 0, z );
				colors.push( color.r, color.g, color.b );

				// second vertex

				v = ( ( j + 1 ) / divisions ) * ( Math.PI * 2 );

				x = Math.sin( v ) * r;
				z = Math.cos( v ) * r;

				vertices.push( x, 0, z );
				colors.push( color.r, color.g, color.b );

			}

		}

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		const material = new LineBasicMaterial( { vertexColors: true, toneMapped: false } );

		super( geometry, material );

		this.type = 'PolarGridHelper';

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}

const _v1 = /*@__PURE__*/ new Vector3();
const _v2 = /*@__PURE__*/ new Vector3();
const _v3 = /*@__PURE__*/ new Vector3();

class DirectionalLightHelper extends Object3D {

	constructor( light, size, color ) {

		super();

		this.light = light;

		this.matrix = light.matrixWorld;
		this.matrixAutoUpdate = false;

		this.color = color;

		this.type = 'DirectionalLightHelper';

		if ( size === undefined ) size = 1;

		let geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( [
			- size, size, 0,
			size, size, 0,
			size, - size, 0,
			- size, - size, 0,
			- size, size, 0
		], 3 ) );

		const material = new LineBasicMaterial( { fog: false, toneMapped: false } );

		this.lightPlane = new Line( geometry, material );
		this.add( this.lightPlane );

		geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 0, 0, 1 ], 3 ) );

		this.targetLine = new Line( geometry, material );
		this.add( this.targetLine );

		this.update();

	}

	dispose() {

		this.lightPlane.geometry.dispose();
		this.lightPlane.material.dispose();
		this.targetLine.geometry.dispose();
		this.targetLine.material.dispose();

	}

	update() {

		this.light.updateWorldMatrix( true, false );
		this.light.target.updateWorldMatrix( true, false );

		_v1.setFromMatrixPosition( this.light.matrixWorld );
		_v2.setFromMatrixPosition( this.light.target.matrixWorld );
		_v3.subVectors( _v2, _v1 );

		this.lightPlane.lookAt( _v2 );

		if ( this.color !== undefined ) {

			this.lightPlane.material.color.set( this.color );
			this.targetLine.material.color.set( this.color );

		} else {

			this.lightPlane.material.color.copy( this.light.color );
			this.targetLine.material.color.copy( this.light.color );

		}

		this.targetLine.lookAt( _v2 );
		this.targetLine.scale.z = _v3.length();

	}

}

const _vector = /*@__PURE__*/ new Vector3();
const _camera = /*@__PURE__*/ new Camera();

/**
 *	- shows frustum, line of sight and up of the camera
 *	- suitable for fast updates
 * 	- based on frustum visualization in lightgl.js shadowmap example
 *		https://github.com/evanw/lightgl.js/blob/master/tests/shadowmap.html
 */

class CameraHelper extends LineSegments {

	constructor( camera ) {

		const geometry = new BufferGeometry();
		const material = new LineBasicMaterial( { color: 0xffffff, vertexColors: true, toneMapped: false } );

		const vertices = [];
		const colors = [];

		const pointMap = {};

		// near

		addLine( 'n1', 'n2' );
		addLine( 'n2', 'n4' );
		addLine( 'n4', 'n3' );
		addLine( 'n3', 'n1' );

		// far

		addLine( 'f1', 'f2' );
		addLine( 'f2', 'f4' );
		addLine( 'f4', 'f3' );
		addLine( 'f3', 'f1' );

		// sides

		addLine( 'n1', 'f1' );
		addLine( 'n2', 'f2' );
		addLine( 'n3', 'f3' );
		addLine( 'n4', 'f4' );

		// cone

		addLine( 'p', 'n1' );
		addLine( 'p', 'n2' );
		addLine( 'p', 'n3' );
		addLine( 'p', 'n4' );

		// up

		addLine( 'u1', 'u2' );
		addLine( 'u2', 'u3' );
		addLine( 'u3', 'u1' );

		// target

		addLine( 'c', 't' );
		addLine( 'p', 'c' );

		// cross

		addLine( 'cn1', 'cn2' );
		addLine( 'cn3', 'cn4' );

		addLine( 'cf1', 'cf2' );
		addLine( 'cf3', 'cf4' );

		function addLine( a, b ) {

			addPoint( a );
			addPoint( b );

		}

		function addPoint( id ) {

			vertices.push( 0, 0, 0 );
			colors.push( 0, 0, 0 );

			if ( pointMap[ id ] === undefined ) {

				pointMap[ id ] = [];

			}

			pointMap[ id ].push( ( vertices.length / 3 ) - 1 );

		}

		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		super( geometry, material );

		this.type = 'CameraHelper';

		this.camera = camera;
		if ( this.camera.updateProjectionMatrix ) this.camera.updateProjectionMatrix();

		this.matrix = camera.matrixWorld;
		this.matrixAutoUpdate = false;

		this.pointMap = pointMap;

		this.update();

		// colors

		const colorFrustum = new Color( 0xffaa00 );
		const colorCone = new Color( 0xff0000 );
		const colorUp = new Color( 0x00aaff );
		const colorTarget = new Color( 0xffffff );
		const colorCross = new Color( 0x333333 );

		this.setColors( colorFrustum, colorCone, colorUp, colorTarget, colorCross );

	}

	setColors( frustum, cone, up, target, cross ) {

		const geometry = this.geometry;

		const colorAttribute = geometry.getAttribute( 'color' );

		// near

		colorAttribute.setXYZ( 0, frustum.r, frustum.g, frustum.b ); colorAttribute.setXYZ( 1, frustum.r, frustum.g, frustum.b ); // n1, n2
		colorAttribute.setXYZ( 2, frustum.r, frustum.g, frustum.b ); colorAttribute.setXYZ( 3, frustum.r, frustum.g, frustum.b ); // n2, n4
		colorAttribute.setXYZ( 4, frustum.r, frustum.g, frustum.b ); colorAttribute.setXYZ( 5, frustum.r, frustum.g, frustum.b ); // n4, n3
		colorAttribute.setXYZ( 6, frustum.r, frustum.g, frustum.b ); colorAttribute.setXYZ( 7, frustum.r, frustum.g, frustum.b ); // n3, n1

		// far

		colorAttribute.setXYZ( 8, frustum.r, frustum.g, frustum.b ); colorAttribute.setXYZ( 9, frustum.r, frustum.g, frustum.b ); // f1, f2
		colorAttribute.setXYZ( 10, frustum.r, frustum.g, frustum.b ); colorAttribute.setXYZ( 11, frustum.r, frustum.g, frustum.b ); // f2, f4
		colorAttribute.setXYZ( 12, frustum.r, frustum.g, frustum.b ); colorAttribute.setXYZ( 13, frustum.r, frustum.g, frustum.b ); // f4, f3
		colorAttribute.setXYZ( 14, frustum.r, frustum.g, frustum.b ); colorAttribute.setXYZ( 15, frustum.r, frustum.g, frustum.b ); // f3, f1

		// sides

		colorAttribute.setXYZ( 16, frustum.r, frustum.g, frustum.b ); colorAttribute.setXYZ( 17, frustum.r, frustum.g, frustum.b ); // n1, f1
		colorAttribute.setXYZ( 18, frustum.r, frustum.g, frustum.b ); colorAttribute.setXYZ( 19, frustum.r, frustum.g, frustum.b ); // n2, f2
		colorAttribute.setXYZ( 20, frustum.r, frustum.g, frustum.b ); colorAttribute.setXYZ( 21, frustum.r, frustum.g, frustum.b ); // n3, f3
		colorAttribute.setXYZ( 22, frustum.r, frustum.g, frustum.b ); colorAttribute.setXYZ( 23, frustum.r, frustum.g, frustum.b ); // n4, f4

		// cone

		colorAttribute.setXYZ( 24, cone.r, cone.g, cone.b ); colorAttribute.setXYZ( 25, cone.r, cone.g, cone.b ); // p, n1
		colorAttribute.setXYZ( 26, cone.r, cone.g, cone.b ); colorAttribute.setXYZ( 27, cone.r, cone.g, cone.b ); // p, n2
		colorAttribute.setXYZ( 28, cone.r, cone.g, cone.b ); colorAttribute.setXYZ( 29, cone.r, cone.g, cone.b ); // p, n3
		colorAttribute.setXYZ( 30, cone.r, cone.g, cone.b ); colorAttribute.setXYZ( 31, cone.r, cone.g, cone.b ); // p, n4

		// up

		colorAttribute.setXYZ( 32, up.r, up.g, up.b ); colorAttribute.setXYZ( 33, up.r, up.g, up.b ); // u1, u2
		colorAttribute.setXYZ( 34, up.r, up.g, up.b ); colorAttribute.setXYZ( 35, up.r, up.g, up.b ); // u2, u3
		colorAttribute.setXYZ( 36, up.r, up.g, up.b ); colorAttribute.setXYZ( 37, up.r, up.g, up.b ); // u3, u1

		// target

		colorAttribute.setXYZ( 38, target.r, target.g, target.b ); colorAttribute.setXYZ( 39, target.r, target.g, target.b ); // c, t
		colorAttribute.setXYZ( 40, cross.r, cross.g, cross.b ); colorAttribute.setXYZ( 41, cross.r, cross.g, cross.b ); // p, c

		// cross

		colorAttribute.setXYZ( 42, cross.r, cross.g, cross.b ); colorAttribute.setXYZ( 43, cross.r, cross.g, cross.b ); // cn1, cn2
		colorAttribute.setXYZ( 44, cross.r, cross.g, cross.b ); colorAttribute.setXYZ( 45, cross.r, cross.g, cross.b ); // cn3, cn4

		colorAttribute.setXYZ( 46, cross.r, cross.g, cross.b ); colorAttribute.setXYZ( 47, cross.r, cross.g, cross.b ); // cf1, cf2
		colorAttribute.setXYZ( 48, cross.r, cross.g, cross.b ); colorAttribute.setXYZ( 49, cross.r, cross.g, cross.b ); // cf3, cf4

		colorAttribute.needsUpdate = true;

	}

	update() {

		const geometry = this.geometry;
		const pointMap = this.pointMap;

		const w = 1, h = 1;

		// we need just camera projection matrix inverse
		// world matrix must be identity

		_camera.projectionMatrixInverse.copy( this.camera.projectionMatrixInverse );

		// Adjust z values based on coordinate system
		const nearZ = this.camera.coordinateSystem === WebGLCoordinateSystem ? - 1 : 0;

		// center / target
		setPoint( 'c', pointMap, geometry, _camera, 0, 0, nearZ );
		setPoint( 't', pointMap, geometry, _camera, 0, 0, 1 );

		// near

		setPoint( 'n1', pointMap, geometry, _camera, - w, - h, nearZ );
		setPoint( 'n2', pointMap, geometry, _camera, w, - h, nearZ );
		setPoint( 'n3', pointMap, geometry, _camera, - w, h, nearZ );
		setPoint( 'n4', pointMap, geometry, _camera, w, h, nearZ );

		// far

		setPoint( 'f1', pointMap, geometry, _camera, - w, - h, 1 );
		setPoint( 'f2', pointMap, geometry, _camera, w, - h, 1 );
		setPoint( 'f3', pointMap, geometry, _camera, - w, h, 1 );
		setPoint( 'f4', pointMap, geometry, _camera, w, h, 1 );

		// up

		setPoint( 'u1', pointMap, geometry, _camera, w * 0.7, h * 1.1, nearZ );
		setPoint( 'u2', pointMap, geometry, _camera, - w * 0.7, h * 1.1, nearZ );
		setPoint( 'u3', pointMap, geometry, _camera, 0, h * 2, nearZ );

		// cross

		setPoint( 'cf1', pointMap, geometry, _camera, - w, 0, 1 );
		setPoint( 'cf2', pointMap, geometry, _camera, w, 0, 1 );
		setPoint( 'cf3', pointMap, geometry, _camera, 0, - h, 1 );
		setPoint( 'cf4', pointMap, geometry, _camera, 0, h, 1 );

		setPoint( 'cn1', pointMap, geometry, _camera, - w, 0, nearZ );
		setPoint( 'cn2', pointMap, geometry, _camera, w, 0, nearZ );
		setPoint( 'cn3', pointMap, geometry, _camera, 0, - h, nearZ );
		setPoint( 'cn4', pointMap, geometry, _camera, 0, h, nearZ );

		geometry.getAttribute( 'position' ).needsUpdate = true;

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}


function setPoint( point, pointMap, geometry, camera, x, y, z ) {

	_vector.set( x, y, z ).unproject( camera );

	const points = pointMap[ point ];

	if ( points !== undefined ) {

		const position = geometry.getAttribute( 'position' );

		for ( let i = 0, l = points.length; i < l; i ++ ) {

			position.setXYZ( points[ i ], _vector.x, _vector.y, _vector.z );

		}

	}

}

const _box = /*@__PURE__*/ new Box3();

class BoxHelper extends LineSegments {

	constructor( object, color = 0xffff00 ) {

		const indices = new Uint16Array( [ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7 ] );
		const positions = new Float32Array( 8 * 3 );

		const geometry = new BufferGeometry();
		geometry.setIndex( new BufferAttribute( indices, 1 ) );
		geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );

		super( geometry, new LineBasicMaterial( { color: color, toneMapped: false } ) );

		this.object = object;
		this.type = 'BoxHelper';

		this.matrixAutoUpdate = false;

		this.update();

	}

	update( object ) {

		if ( object !== undefined ) {

			console.warn( 'THREE.BoxHelper: .update() has no longer arguments.' );

		}

		if ( this.object !== undefined ) {

			_box.setFromObject( this.object );

		}

		if ( _box.isEmpty() ) return;

		const min = _box.min;
		const max = _box.max;

		/*
			5____4
		1/___0/|
		| 6__|_7
		2/___3/

		0: max.x, max.y, max.z
		1: min.x, max.y, max.z
		2: min.x, min.y, max.z
		3: max.x, min.y, max.z
		4: max.x, max.y, min.z
		5: min.x, max.y, min.z
		6: min.x, min.y, min.z
		7: max.x, min.y, min.z
		*/

		const position = this.geometry.attributes.position;
		const array = position.array;

		array[ 0 ] = max.x; array[ 1 ] = max.y; array[ 2 ] = max.z;
		array[ 3 ] = min.x; array[ 4 ] = max.y; array[ 5 ] = max.z;
		array[ 6 ] = min.x; array[ 7 ] = min.y; array[ 8 ] = max.z;
		array[ 9 ] = max.x; array[ 10 ] = min.y; array[ 11 ] = max.z;
		array[ 12 ] = max.x; array[ 13 ] = max.y; array[ 14 ] = min.z;
		array[ 15 ] = min.x; array[ 16 ] = max.y; array[ 17 ] = min.z;
		array[ 18 ] = min.x; array[ 19 ] = min.y; array[ 20 ] = min.z;
		array[ 21 ] = max.x; array[ 22 ] = min.y; array[ 23 ] = min.z;

		position.needsUpdate = true;

		this.geometry.computeBoundingSphere();

	}

	setFromObject( object ) {

		this.object = object;
		this.update();

		return this;

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.object = source.object;

		return this;

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}

class Box3Helper extends LineSegments {

	constructor( box, color = 0xffff00 ) {

		const indices = new Uint16Array( [ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7 ] );

		const positions = [ 1, 1, 1, - 1, 1, 1, - 1, - 1, 1, 1, - 1, 1, 1, 1, - 1, - 1, 1, - 1, - 1, - 1, - 1, 1, - 1, - 1 ];

		const geometry = new BufferGeometry();

		geometry.setIndex( new BufferAttribute( indices, 1 ) );

		geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );

		super( geometry, new LineBasicMaterial( { color: color, toneMapped: false } ) );

		this.box = box;

		this.type = 'Box3Helper';

		this.geometry.computeBoundingSphere();

	}

	updateMatrixWorld( force ) {

		const box = this.box;

		if ( box.isEmpty() ) return;

		box.getCenter( this.position );

		box.getSize( this.scale );

		this.scale.multiplyScalar( 0.5 );

		super.updateMatrixWorld( force );

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}

class PlaneHelper extends Line {

	constructor( plane, size = 1, hex = 0xffff00 ) {

		const color = hex;

		const positions = [ 1, - 1, 0, - 1, 1, 0, - 1, - 1, 0, 1, 1, 0, - 1, 1, 0, - 1, - 1, 0, 1, - 1, 0, 1, 1, 0 ];

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
		geometry.computeBoundingSphere();

		super( geometry, new LineBasicMaterial( { color: color, toneMapped: false } ) );

		this.type = 'PlaneHelper';

		this.plane = plane;

		this.size = size;

		const positions2 = [ 1, 1, 0, - 1, 1, 0, - 1, - 1, 0, 1, 1, 0, - 1, - 1, 0, 1, - 1, 0 ];

		const geometry2 = new BufferGeometry();
		geometry2.setAttribute( 'position', new Float32BufferAttribute( positions2, 3 ) );
		geometry2.computeBoundingSphere();

		this.add( new Mesh( geometry2, new MeshBasicMaterial( { color: color, opacity: 0.2, transparent: true, depthWrite: false, toneMapped: false } ) ) );

	}

	updateMatrixWorld( force ) {

		this.position.set( 0, 0, 0 );

		this.scale.set( 0.5 * this.size, 0.5 * this.size, 1 );

		this.lookAt( this.plane.normal );

		this.translateZ( - this.plane.constant );

		super.updateMatrixWorld( force );

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();
		this.children[ 0 ].geometry.dispose();
		this.children[ 0 ].material.dispose();

	}

}

const _axis = /*@__PURE__*/ new Vector3();
let _lineGeometry, _coneGeometry;

class ArrowHelper extends Object3D {

	// dir is assumed to be normalized

	constructor( dir = new Vector3( 0, 0, 1 ), origin = new Vector3( 0, 0, 0 ), length = 1, color = 0xffff00, headLength = length * 0.2, headWidth = headLength * 0.2 ) {

		super();

		this.type = 'ArrowHelper';

		if ( _lineGeometry === undefined ) {

			_lineGeometry = new BufferGeometry();
			_lineGeometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 0, 1, 0 ], 3 ) );

			_coneGeometry = new CylinderGeometry( 0, 0.5, 1, 5, 1 );
			_coneGeometry.translate( 0, - 0.5, 0 );

		}

		this.position.copy( origin );

		this.line = new Line( _lineGeometry, new LineBasicMaterial( { color: color, toneMapped: false } ) );
		this.line.matrixAutoUpdate = false;
		this.add( this.line );

		this.cone = new Mesh( _coneGeometry, new MeshBasicMaterial( { color: color, toneMapped: false } ) );
		this.cone.matrixAutoUpdate = false;
		this.add( this.cone );

		this.setDirection( dir );
		this.setLength( length, headLength, headWidth );

	}

	setDirection( dir ) {

		// dir is assumed to be normalized

		if ( dir.y > 0.99999 ) {

			this.quaternion.set( 0, 0, 0, 1 );

		} else if ( dir.y < - 0.99999 ) {

			this.quaternion.set( 1, 0, 0, 0 );

		} else {

			_axis.set( dir.z, 0, - dir.x ).normalize();

			const radians = Math.acos( dir.y );

			this.quaternion.setFromAxisAngle( _axis, radians );

		}

	}

	setLength( length, headLength = length * 0.2, headWidth = headLength * 0.2 ) {

		this.line.scale.set( 1, Math.max( 0.0001, length - headLength ), 1 ); // see #17458
		this.line.updateMatrix();

		this.cone.scale.set( headWidth, headLength, headWidth );
		this.cone.position.y = length;
		this.cone.updateMatrix();

	}

	setColor( color ) {

		this.line.material.color.set( color );
		this.cone.material.color.set( color );

	}

	copy( source ) {

		super.copy( source, false );

		this.line.copy( source.line );
		this.cone.copy( source.cone );

		return this;

	}

	dispose() {

		this.line.geometry.dispose();
		this.line.material.dispose();
		this.cone.geometry.dispose();
		this.cone.material.dispose();

	}

}

class AxesHelper extends LineSegments {

	constructor( size = 1 ) {

		const vertices = [
			0, 0, 0,	size, 0, 0,
			0, 0, 0,	0, size, 0,
			0, 0, 0,	0, 0, size
		];

		const colors = [
			1, 0, 0,	1, 0.6, 0,
			0, 1, 0,	0.6, 1, 0,
			0, 0, 1,	0, 0.6, 1
		];

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		const material = new LineBasicMaterial( { vertexColors: true, toneMapped: false } );

		super( geometry, material );

		this.type = 'AxesHelper';

	}

	setColors( xAxisColor, yAxisColor, zAxisColor ) {

		const color = new Color();
		const array = this.geometry.attributes.color.array;

		color.set( xAxisColor );
		color.toArray( array, 0 );
		color.toArray( array, 3 );

		color.set( yAxisColor );
		color.toArray( array, 6 );
		color.toArray( array, 9 );

		color.set( zAxisColor );
		color.toArray( array, 12 );
		color.toArray( array, 15 );

		this.geometry.attributes.color.needsUpdate = true;

		return this;

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}

class ShapePath {

	constructor() {

		this.type = 'ShapePath';

		this.color = new Color();

		this.subPaths = [];
		this.currentPath = null;

	}

	moveTo( x, y ) {

		this.currentPath = new Path();
		this.subPaths.push( this.currentPath );
		this.currentPath.moveTo( x, y );

		return this;

	}

	lineTo( x, y ) {

		this.currentPath.lineTo( x, y );

		return this;

	}

	quadraticCurveTo( aCPx, aCPy, aX, aY ) {

		this.currentPath.quadraticCurveTo( aCPx, aCPy, aX, aY );

		return this;

	}

	bezierCurveTo( aCP1x, aCP1y, aCP2x, aCP2y, aX, aY ) {

		this.currentPath.bezierCurveTo( aCP1x, aCP1y, aCP2x, aCP2y, aX, aY );

		return this;

	}

	splineThru( pts ) {

		this.currentPath.splineThru( pts );

		return this;

	}

	toShapes( isCCW ) {

		function toShapesNoHoles( inSubpaths ) {

			const shapes = [];

			for ( let i = 0, l = inSubpaths.length; i < l; i ++ ) {

				const tmpPath = inSubpaths[ i ];

				const tmpShape = new Shape();
				tmpShape.curves = tmpPath.curves;

				shapes.push( tmpShape );

			}

			return shapes;

		}

		function isPointInsidePolygon( inPt, inPolygon ) {

			const polyLen = inPolygon.length;

			// inPt on polygon contour => immediate success    or
			// toggling of inside/outside at every single! intersection point of an edge
			//  with the horizontal line through inPt, left of inPt
			//  not counting lowerY endpoints of edges and whole edges on that line
			let inside = false;
			for ( let p = polyLen - 1, q = 0; q < polyLen; p = q ++ ) {

				let edgeLowPt = inPolygon[ p ];
				let edgeHighPt = inPolygon[ q ];

				let edgeDx = edgeHighPt.x - edgeLowPt.x;
				let edgeDy = edgeHighPt.y - edgeLowPt.y;

				if ( Math.abs( edgeDy ) > Number.EPSILON ) {

					// not parallel
					if ( edgeDy < 0 ) {

						edgeLowPt = inPolygon[ q ]; edgeDx = - edgeDx;
						edgeHighPt = inPolygon[ p ]; edgeDy = - edgeDy;

					}

					if ( ( inPt.y < edgeLowPt.y ) || ( inPt.y > edgeHighPt.y ) ) 		continue;

					if ( inPt.y === edgeLowPt.y ) {

						if ( inPt.x === edgeLowPt.x )		return	true;		// inPt is on contour ?
						// continue;				// no intersection or edgeLowPt => doesn't count !!!

					} else {

						const perpEdge = edgeDy * ( inPt.x - edgeLowPt.x ) - edgeDx * ( inPt.y - edgeLowPt.y );
						if ( perpEdge === 0 )				return	true;		// inPt is on contour ?
						if ( perpEdge < 0 ) 				continue;
						inside = ! inside;		// true intersection left of inPt

					}

				} else {

					// parallel or collinear
					if ( inPt.y !== edgeLowPt.y ) 		continue;			// parallel
					// edge lies on the same horizontal line as inPt
					if ( ( ( edgeHighPt.x <= inPt.x ) && ( inPt.x <= edgeLowPt.x ) ) ||
						 ( ( edgeLowPt.x <= inPt.x ) && ( inPt.x <= edgeHighPt.x ) ) )		return	true;	// inPt: Point on contour !
					// continue;

				}

			}

			return	inside;

		}

		const isClockWise = ShapeUtils.isClockWise;

		const subPaths = this.subPaths;
		if ( subPaths.length === 0 ) return [];

		let solid, tmpPath, tmpShape;
		const shapes = [];

		if ( subPaths.length === 1 ) {

			tmpPath = subPaths[ 0 ];
			tmpShape = new Shape();
			tmpShape.curves = tmpPath.curves;
			shapes.push( tmpShape );
			return shapes;

		}

		let holesFirst = ! isClockWise( subPaths[ 0 ].getPoints() );
		holesFirst = isCCW ? ! holesFirst : holesFirst;

		// console.log("Holes first", holesFirst);

		const betterShapeHoles = [];
		const newShapes = [];
		let newShapeHoles = [];
		let mainIdx = 0;
		let tmpPoints;

		newShapes[ mainIdx ] = undefined;
		newShapeHoles[ mainIdx ] = [];

		for ( let i = 0, l = subPaths.length; i < l; i ++ ) {

			tmpPath = subPaths[ i ];
			tmpPoints = tmpPath.getPoints();
			solid = isClockWise( tmpPoints );
			solid = isCCW ? ! solid : solid;

			if ( solid ) {

				if ( ( ! holesFirst ) && ( newShapes[ mainIdx ] ) )	mainIdx ++;

				newShapes[ mainIdx ] = { s: new Shape(), p: tmpPoints };
				newShapes[ mainIdx ].s.curves = tmpPath.curves;

				if ( holesFirst )	mainIdx ++;
				newShapeHoles[ mainIdx ] = [];

				//console.log('cw', i);

			} else {

				newShapeHoles[ mainIdx ].push( { h: tmpPath, p: tmpPoints[ 0 ] } );

				//console.log('ccw', i);

			}

		}

		// only Holes? -> probably all Shapes with wrong orientation
		if ( ! newShapes[ 0 ] )	return	toShapesNoHoles( subPaths );


		if ( newShapes.length > 1 ) {

			let ambiguous = false;
			let toChange = 0;

			for ( let sIdx = 0, sLen = newShapes.length; sIdx < sLen; sIdx ++ ) {

				betterShapeHoles[ sIdx ] = [];

			}

			for ( let sIdx = 0, sLen = newShapes.length; sIdx < sLen; sIdx ++ ) {

				const sho = newShapeHoles[ sIdx ];

				for ( let hIdx = 0; hIdx < sho.length; hIdx ++ ) {

					const ho = sho[ hIdx ];
					let hole_unassigned = true;

					for ( let s2Idx = 0; s2Idx < newShapes.length; s2Idx ++ ) {

						if ( isPointInsidePolygon( ho.p, newShapes[ s2Idx ].p ) ) {

							if ( sIdx !== s2Idx )	toChange ++;

							if ( hole_unassigned ) {

								hole_unassigned = false;
								betterShapeHoles[ s2Idx ].push( ho );

							} else {

								ambiguous = true;

							}

						}

					}

					if ( hole_unassigned ) {

						betterShapeHoles[ sIdx ].push( ho );

					}

				}

			}

			if ( toChange > 0 && ambiguous === false ) {

				newShapeHoles = betterShapeHoles;

			}

		}

		let tmpHoles;

		for ( let i = 0, il = newShapes.length; i < il; i ++ ) {

			tmpShape = newShapes[ i ].s;
			shapes.push( tmpShape );
			tmpHoles = newShapeHoles[ i ];

			for ( let j = 0, jl = tmpHoles.length; j < jl; j ++ ) {

				tmpShape.holes.push( tmpHoles[ j ].h );

			}

		}

		//console.log("shape", shapes);

		return shapes;

	}

}

class Controls extends EventDispatcher {

	constructor( object, domElement = null ) {

		super();

		this.object = object;
		this.domElement = domElement;

		this.enabled = true;

		this.state = - 1;

		this.keys = {};
		this.mouseButtons = { LEFT: null, MIDDLE: null, RIGHT: null };
		this.touches = { ONE: null, TWO: null };

	}

	connect() {}

	disconnect() {}

	dispose() {}

	update( /* delta */ ) {}

}

function contain( texture, aspect ) {

	const imageAspect = ( texture.image && texture.image.width ) ? texture.image.width / texture.image.height : 1;

	if ( imageAspect > aspect ) {

		texture.repeat.x = 1;
		texture.repeat.y = imageAspect / aspect;

		texture.offset.x = 0;
		texture.offset.y = ( 1 - texture.repeat.y ) / 2;

	} else {

		texture.repeat.x = aspect / imageAspect;
		texture.repeat.y = 1;

		texture.offset.x = ( 1 - texture.repeat.x ) / 2;
		texture.offset.y = 0;

	}

	return texture;

}

function cover( texture, aspect ) {

	const imageAspect = ( texture.image && texture.image.width ) ? texture.image.width / texture.image.height : 1;

	if ( imageAspect > aspect ) {

		texture.repeat.x = aspect / imageAspect;
		texture.repeat.y = 1;

		texture.offset.x = ( 1 - texture.repeat.x ) / 2;
		texture.offset.y = 0;

	} else {

		texture.repeat.x = 1;
		texture.repeat.y = imageAspect / aspect;

		texture.offset.x = 0;
		texture.offset.y = ( 1 - texture.repeat.y ) / 2;

	}

	return texture;

}

function fill( texture ) {

	texture.repeat.x = 1;
	texture.repeat.y = 1;

	texture.offset.x = 0;
	texture.offset.y = 0;

	return texture;

}



/**
 * Given the width, height, format, and type of a texture. Determines how many
 * bytes must be used to represent the texture.
 *
 * @param {Number} width
 * @param {Number} height
 * @param {Number} format
 * @param {Number} type
 * @return {Number} The number of bytes required to represent the texture.
 */
function getByteLength( width, height, format, type ) {

	const typeByteLength = getTextureTypeByteLength( type );

	switch ( format ) {

		// https://registry.khronos.org/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
		case AlphaFormat:
			return width * height;
		case LuminanceFormat:
			return width * height;
		case LuminanceAlphaFormat:
			return width * height * 2;
		case RedFormat:
			return ( ( width * height ) / typeByteLength.components ) * typeByteLength.byteLength;
		case RedIntegerFormat:
			return ( ( width * height ) / typeByteLength.components ) * typeByteLength.byteLength;
		case RGFormat:
			return ( ( width * height * 2 ) / typeByteLength.components ) * typeByteLength.byteLength;
		case RGIntegerFormat:
			return ( ( width * height * 2 ) / typeByteLength.components ) * typeByteLength.byteLength;
		case RGBFormat:
			return ( ( width * height * 3 ) / typeByteLength.components ) * typeByteLength.byteLength;
		case RGBAFormat:
			return ( ( width * height * 4 ) / typeByteLength.components ) * typeByteLength.byteLength;
		case RGBAIntegerFormat:
			return ( ( width * height * 4 ) / typeByteLength.components ) * typeByteLength.byteLength;

		// https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_s3tc_srgb/
		case RGB_S3TC_DXT1_Format:
		case RGBA_S3TC_DXT1_Format:
			return Math.floor( ( width + 3 ) / 4 ) * Math.floor( ( height + 3 ) / 4 ) * 8;
		case RGBA_S3TC_DXT3_Format:
		case RGBA_S3TC_DXT5_Format:
			return Math.floor( ( width + 3 ) / 4 ) * Math.floor( ( height + 3 ) / 4 ) * 16;

		// https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_pvrtc/
		case RGB_PVRTC_2BPPV1_Format:
		case RGBA_PVRTC_2BPPV1_Format:
			return ( Math.max( width, 16 ) * Math.max( height, 8 ) ) / 4;
		case RGB_PVRTC_4BPPV1_Format:
		case RGBA_PVRTC_4BPPV1_Format:
			return ( Math.max( width, 8 ) * Math.max( height, 8 ) ) / 2;

		// https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_etc/
		case RGB_ETC1_Format:
		case RGB_ETC2_Format:
			return Math.floor( ( width + 3 ) / 4 ) * Math.floor( ( height + 3 ) / 4 ) * 8;
		case RGBA_ETC2_EAC_Format:
			return Math.floor( ( width + 3 ) / 4 ) * Math.floor( ( height + 3 ) / 4 ) * 16;

		// https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_astc/
		case RGBA_ASTC_4x4_Format:
			return Math.floor( ( width + 3 ) / 4 ) * Math.floor( ( height + 3 ) / 4 ) * 16;
		case RGBA_ASTC_5x4_Format:
			return Math.floor( ( width + 4 ) / 5 ) * Math.floor( ( height + 3 ) / 4 ) * 16;
		case RGBA_ASTC_5x5_Format:
			return Math.floor( ( width + 4 ) / 5 ) * Math.floor( ( height + 4 ) / 5 ) * 16;
		case RGBA_ASTC_6x5_Format:
			return Math.floor( ( width + 5 ) / 6 ) * Math.floor( ( height + 4 ) / 5 ) * 16;
		case RGBA_ASTC_6x6_Format:
			return Math.floor( ( width + 5 ) / 6 ) * Math.floor( ( height + 5 ) / 6 ) * 16;
		case RGBA_ASTC_8x5_Format:
			return Math.floor( ( width + 7 ) / 8 ) * Math.floor( ( height + 4 ) / 5 ) * 16;
		case RGBA_ASTC_8x6_Format:
			return Math.floor( ( width + 7 ) / 8 ) * Math.floor( ( height + 5 ) / 6 ) * 16;
		case RGBA_ASTC_8x8_Format:
			return Math.floor( ( width + 7 ) / 8 ) * Math.floor( ( height + 7 ) / 8 ) * 16;
		case RGBA_ASTC_10x5_Format:
			return Math.floor( ( width + 9 ) / 10 ) * Math.floor( ( height + 4 ) / 5 ) * 16;
		case RGBA_ASTC_10x6_Format:
			return Math.floor( ( width + 9 ) / 10 ) * Math.floor( ( height + 5 ) / 6 ) * 16;
		case RGBA_ASTC_10x8_Format:
			return Math.floor( ( width + 9 ) / 10 ) * Math.floor( ( height + 7 ) / 8 ) * 16;
		case RGBA_ASTC_10x10_Format:
			return Math.floor( ( width + 9 ) / 10 ) * Math.floor( ( height + 9 ) / 10 ) * 16;
		case RGBA_ASTC_12x10_Format:
			return Math.floor( ( width + 11 ) / 12 ) * Math.floor( ( height + 9 ) / 10 ) * 16;
		case RGBA_ASTC_12x12_Format:
			return Math.floor( ( width + 11 ) / 12 ) * Math.floor( ( height + 11 ) / 12 ) * 16;

		// https://registry.khronos.org/webgl/extensions/EXT_texture_compression_bptc/
		case RGBA_BPTC_Format:
		case RGB_BPTC_SIGNED_Format:
		case RGB_BPTC_UNSIGNED_Format:
			return Math.ceil( width / 4 ) * Math.ceil( height / 4 ) * 16;

		// https://registry.khronos.org/webgl/extensions/EXT_texture_compression_rgtc/
		case RED_RGTC1_Format:
		case SIGNED_RED_RGTC1_Format:
			return Math.ceil( width / 4 ) * Math.ceil( height / 4 ) * 8;
		case RED_GREEN_RGTC2_Format:
		case SIGNED_RED_GREEN_RGTC2_Format:
			return Math.ceil( width / 4 ) * Math.ceil( height / 4 ) * 16;

	}

	throw new Error(
		`Unable to determine texture byte length for ${format} format.`,
	);

}

function getTextureTypeByteLength( type ) {

	switch ( type ) {

		case UnsignedByteType:
		case ByteType:
			return { byteLength: 1, components: 1 };
		case UnsignedShortType:
		case ShortType:
		case HalfFloatType:
			return { byteLength: 2, components: 1 };
		case UnsignedShort4444Type:
		case UnsignedShort5551Type:
			return { byteLength: 2, components: 4 };
		case UnsignedIntType:
		case IntType:
		case FloatType:
			return { byteLength: 4, components: 1 };
		case UnsignedInt5999Type:
			return { byteLength: 4, components: 3 };

	}

	throw new Error( `Unknown texture type ${type}.` );

}

const TextureUtils = {
	contain,
	cover,
	fill,
	getByteLength
};

if ( typeof __THREE_DEVTOOLS__ !== 'undefined' ) {

	__THREE_DEVTOOLS__.dispatchEvent( new CustomEvent( 'register', { detail: {
		revision: REVISION,
	} } ) );

}

if ( typeof window !== 'undefined' ) {

	if ( window.__THREE__ ) {

		console.warn( 'WARNING: Multiple instances of Three.js being imported.' );

	} else {

		window.__THREE__ = REVISION;

	}

}

export { ACESFilmicToneMapping, AddEquation, AddOperation, AdditiveAnimationBlendMode, AdditiveBlending, AgXToneMapping, AlphaFormat, AlwaysCompare, AlwaysDepth, AlwaysStencilFunc, AmbientLight, AnimationAction, AnimationClip, AnimationLoader, AnimationMixer, AnimationObjectGroup, AnimationUtils, ArcCurve, ArrayCamera, ArrowHelper, AttachedBindMode, Audio, AudioAnalyser, AudioContext, AudioListener, AudioLoader, AxesHelper, BackSide, BasicDepthPacking, BasicShadowMap, BatchedMesh, Bone, BooleanKeyframeTrack, Box2, Box3, Box3Helper, BoxGeometry, BoxHelper, BufferAttribute, BufferGeometry, BufferGeometryLoader, ByteType, Cache, Camera, CameraHelper, CanvasTexture, CapsuleGeometry, CatmullRomCurve3, CineonToneMapping, CircleGeometry, ClampToEdgeWrapping, Clock, Color, ColorKeyframeTrack, ColorManagement, CompressedArrayTexture, CompressedCubeTexture, CompressedTexture, CompressedTextureLoader, ConeGeometry, ConstantAlphaFactor, ConstantColorFactor, Controls, CubeCamera, CubeReflectionMapping, CubeRefractionMapping, CubeTexture, CubeTextureLoader, CubeUVReflectionMapping, CubicBezierCurve, CubicBezierCurve3, CubicInterpolant, CullFaceBack, CullFaceFront, CullFaceFrontBack, CullFaceNone, Curve, CurvePath, CustomBlending, CustomToneMapping, CylinderGeometry, Cylindrical, Data3DTexture, DataArrayTexture, DataTexture, DataTextureLoader, DataUtils, DecrementStencilOp, DecrementWrapStencilOp, DefaultLoadingManager, DepthFormat, DepthStencilFormat, DepthTexture, DetachedBindMode, DirectionalLight, DirectionalLightHelper, DiscreteInterpolant, DodecahedronGeometry, DoubleSide, DstAlphaFactor, DstColorFactor, DynamicCopyUsage, DynamicDrawUsage, DynamicReadUsage, EdgesGeometry, EllipseCurve, EqualCompare, EqualDepth, EqualStencilFunc, EquirectangularReflectionMapping, EquirectangularRefractionMapping, Euler, EventDispatcher, ExtrudeGeometry, FileLoader, Float16BufferAttribute, Float32BufferAttribute, FloatType, Fog, FogExp2, FramebufferTexture, FrontSide, Frustum, GLBufferAttribute, GLSL1, GLSL3, GreaterCompare, GreaterDepth, GreaterEqualCompare, GreaterEqualDepth, GreaterEqualStencilFunc, GreaterStencilFunc, GridHelper, Group, HalfFloatType, HemisphereLight, HemisphereLightHelper, IcosahedronGeometry, ImageBitmapLoader, ImageLoader, ImageUtils, IncrementStencilOp, IncrementWrapStencilOp, InstancedBufferAttribute, InstancedBufferGeometry, InstancedInterleavedBuffer, InstancedMesh, Int16BufferAttribute, Int32BufferAttribute, Int8BufferAttribute, IntType, InterleavedBuffer, InterleavedBufferAttribute, Interpolant, InterpolateDiscrete, InterpolateLinear, InterpolateSmooth, InvertStencilOp, KeepStencilOp, KeyframeTrack, LOD, LatheGeometry, Layers, LessCompare, LessDepth, LessEqualCompare, LessEqualDepth, LessEqualStencilFunc, LessStencilFunc, Light, LightProbe, Line, Line3, LineBasicMaterial, LineCurve, LineCurve3, LineDashedMaterial, LineLoop, LineSegments, LinearFilter, LinearInterpolant, LinearMipMapLinearFilter, LinearMipMapNearestFilter, LinearMipmapLinearFilter, LinearMipmapNearestFilter, LinearSRGBColorSpace, LinearToneMapping, LinearTransfer, Loader, LoaderUtils, LoadingManager, LoopOnce, LoopPingPong, LoopRepeat, LuminanceAlphaFormat, LuminanceFormat, MOUSE, Material, MaterialLoader, MathUtils, Matrix2, Matrix3, Matrix4, MaxEquation, Mesh, MeshBasicMaterial, MeshDepthMaterial, MeshDistanceMaterial, MeshLambertMaterial, MeshMatcapMaterial, MeshNormalMaterial, MeshPhongMaterial, MeshPhysicalMaterial, MeshStandardMaterial, MeshToonMaterial, MinEquation, MirroredRepeatWrapping, MixOperation, MultiplyBlending, MultiplyOperation, NearestFilter, NearestMipMapLinearFilter, NearestMipMapNearestFilter, NearestMipmapLinearFilter, NearestMipmapNearestFilter, NeutralToneMapping, NeverCompare, NeverDepth, NeverStencilFunc, NoBlending, NoColorSpace, NoToneMapping, NormalAnimationBlendMode, NormalBlending, NotEqualCompare, NotEqualDepth, NotEqualStencilFunc, NumberKeyframeTrack, Object3D, ObjectLoader, ObjectSpaceNormalMap, OctahedronGeometry, OneFactor, OneMinusConstantAlphaFactor, OneMinusConstantColorFactor, OneMinusDstAlphaFactor, OneMinusDstColorFactor, OneMinusSrcAlphaFactor, OneMinusSrcColorFactor, OrthographicCamera, PCFShadowMap, PCFSoftShadowMap, Path, PerspectiveCamera, Plane, PlaneGeometry, PlaneHelper, PointLight, PointLightHelper, Points, PointsMaterial, PolarGridHelper, PolyhedronGeometry, PositionalAudio, PropertyBinding, PropertyMixer, QuadraticBezierCurve, QuadraticBezierCurve3, Quaternion, QuaternionKeyframeTrack, QuaternionLinearInterpolant, RAD2DEG, RED_GREEN_RGTC2_Format, RED_RGTC1_Format, REVISION, RGBADepthPacking, RGBAFormat, RGBAIntegerFormat, RGBA_ASTC_10x10_Format, RGBA_ASTC_10x5_Format, RGBA_ASTC_10x6_Format, RGBA_ASTC_10x8_Format, RGBA_ASTC_12x10_Format, RGBA_ASTC_12x12_Format, RGBA_ASTC_4x4_Format, RGBA_ASTC_5x4_Format, RGBA_ASTC_5x5_Format, RGBA_ASTC_6x5_Format, RGBA_ASTC_6x6_Format, RGBA_ASTC_8x5_Format, RGBA_ASTC_8x6_Format, RGBA_ASTC_8x8_Format, RGBA_BPTC_Format, RGBA_ETC2_EAC_Format, RGBA_PVRTC_2BPPV1_Format, RGBA_PVRTC_4BPPV1_Format, RGBA_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format, RGBDepthPacking, RGBFormat, RGBIntegerFormat, RGB_BPTC_SIGNED_Format, RGB_BPTC_UNSIGNED_Format, RGB_ETC1_Format, RGB_ETC2_Format, RGB_PVRTC_2BPPV1_Format, RGB_PVRTC_4BPPV1_Format, RGB_S3TC_DXT1_Format, RGDepthPacking, RGFormat, RGIntegerFormat, RawShaderMaterial, Ray, Raycaster, RectAreaLight, RedFormat, RedIntegerFormat, ReinhardToneMapping, RenderTarget, RenderTarget3D, RenderTargetArray, RepeatWrapping, ReplaceStencilOp, ReverseSubtractEquation, RingGeometry, SIGNED_RED_GREEN_RGTC2_Format, SIGNED_RED_RGTC1_Format, SRGBColorSpace, SRGBTransfer, Scene, ShaderMaterial, ShadowMaterial, Shape, ShapeGeometry, ShapePath, ShapeUtils, ShortType, Skeleton, SkeletonHelper, SkinnedMesh, Source, Sphere, SphereGeometry, Spherical, SphericalHarmonics3, SplineCurve, SpotLight, SpotLightHelper, Sprite, SpriteMaterial, SrcAlphaFactor, SrcAlphaSaturateFactor, SrcColorFactor, StaticCopyUsage, StaticDrawUsage, StaticReadUsage, StereoCamera, StreamCopyUsage, StreamDrawUsage, StreamReadUsage, StringKeyframeTrack, SubtractEquation, SubtractiveBlending, TOUCH, TangentSpaceNormalMap, TetrahedronGeometry, Texture, TextureLoader, TextureUtils, TorusGeometry, TorusKnotGeometry, Triangle, TriangleFanDrawMode, TriangleStripDrawMode, TrianglesDrawMode, TubeGeometry, UVMapping, Uint16BufferAttribute, Uint32BufferAttribute, Uint8BufferAttribute, Uint8ClampedBufferAttribute, Uniform, UniformsGroup, UniformsUtils, UnsignedByteType, UnsignedInt248Type, UnsignedInt5999Type, UnsignedIntType, UnsignedShort4444Type, UnsignedShort5551Type, UnsignedShortType, VSMShadowMap, Vector2, Vector3, Vector4, VectorKeyframeTrack, VideoTexture, WebGL3DRenderTarget, WebGLArrayRenderTarget, WebGLCoordinateSystem, WebGLCubeRenderTarget, WebGLRenderTarget, WebGPUCoordinateSystem, WireframeGeometry, WrapAroundEnding, ZeroCurvatureEnding, ZeroFactor, ZeroSlopeEnding, ZeroStencilOp, arrayNeedsUint32, cloneUniforms, createCanvasElement, createElementNS, getByteLength, getUnlitUniformColorSpace, mergeUniforms, probeAsync, toNormalizedProjectionMatrix, toReversedProjectionMatrix, warnOnce };
