( function ( global, factory ) {

	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define( factory ) :
			( global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.GLTFExporter = factory() );

} )( this, ( function () {

	'use strict';

	/**
	 * @license
	 * Copyright 2010-2025 Three.js Authors
	 * SPDX-License-Identifier: MIT
	 */
	const REVISION = '177dev';

	/**
	 * Both front and back faces are rendered.
	 *
	 * @type {number}
	 * @constant
	 */
	const DoubleSide = 2;

	/**
	 * Maps textures using the geometry's UV coordinates.
	 *
	 * @type {number}
	 * @constant
	 */
	const UVMapping = 300;

	/**
	 * The texture will simply repeat to infinity.
	 *
	 * @type {number}
	 * @constant
	 */
	const RepeatWrapping = 1000;

	/**
	 * The last pixel of the texture stretches to the edge of the mesh.
	 *
	 * @type {number}
	 * @constant
	 */
	const ClampToEdgeWrapping = 1001;

	/**
	 * The texture will repeats to infinity, mirroring on each repeat.
	 *
	 * @type {number}
	 * @constant
	 */
	const MirroredRepeatWrapping = 1002;

	/**
	 * Returns the value of the texture element that is nearest (in Manhattan distance)
	 * to the specified texture coordinates.
	 *
	 * @type {number}
	 * @constant
	 */
	const NearestFilter = 1003;

	/**
	 * Chooses the mipmap that most closely matches the size of the pixel being textured
	 * and uses the `NearestFilter` criterion (the texel nearest to the center of the pixel)
	 * to produce a texture value.
	 *
	 * @type {number}
	 * @constant
	 */
	const NearestMipmapNearestFilter = 1004;

	/**
	 * Chooses the two mipmaps that most closely match the size of the pixel being textured and
	 * uses the `NearestFilter` criterion to produce a texture value from each mipmap.
	 * The final texture value is a weighted average of those two values.
	 *
	 * @type {number}
	 * @constant
	 */
	const NearestMipmapLinearFilter = 1005;

	/**
	 * Returns the weighted average of the four texture elements that are closest to the specified
	 * texture coordinates, and can include items wrapped or repeated from other parts of a texture,
	 * depending on the values of `wrapS` and `wrapT`, and on the exact mapping.
	 *
	 * @type {number}
	 * @constant
	 */
	const LinearFilter = 1006;

	/**
	 * Chooses the mipmap that most closely matches the size of the pixel being textured and uses
	 * the `LinearFilter` criterion (a weighted average of the four texels that are closest to the
	 * center of the pixel) to produce a texture value.
	 *
	 * @type {number}
	 * @constant
	 */
	const LinearMipmapNearestFilter = 1007;

	/**
	 * Chooses the two mipmaps that most closely match the size of the pixel being textured and uses
	 * the `LinearFilter` criterion to produce a texture value from each mipmap. The final texture value
	 * is a weighted average of those two values.
	 *
	 * @type {number}
	 * @constant
	 */
	const LinearMipmapLinearFilter = 1008;

	/**
	 * An unsigned byte data type for textures.
	 *
	 * @type {number}
	 * @constant
	 */
	const UnsignedByteType = 1009;

	/**
	 * A float data type for textures.
	 *
	 * @type {number}
	 * @constant
	 */
	const FloatType = 1015;

	/**
	 * Reads the red, green, blue and alpha components.
	 *
	 * @type {number}
	 * @constant
	 */
	const RGBAFormat = 1023;

	/**
	 * Discrete interpolation mode for keyframe tracks.
	 *
	 * @type {number}
	 * @constant
	 */
	const InterpolateDiscrete = 2300;

	/**
	 * Linear interpolation mode for keyframe tracks.
	 *
	 * @type {number}
	 * @constant
	 */
	const InterpolateLinear = 2301;

	// Color space string identifiers, matching CSS Color Module Level 4 and WebGPU names where available.

	/**
	 * No color space.
	 *
	 * @type {string}
	 * @constant
	 */
	const NoColorSpace = '';

	/**
	 * sRGB color space.
	 *
	 * @type {string}
	 * @constant
	 */
	const SRGBColorSpace = 'srgb';

	/**
	 * sRGB-linear color space.
	 *
	 * @type {string}
	 * @constant
	 */
	const LinearSRGBColorSpace = 'srgb-linear';

	/**
	 * Linear transfer function.
	 *
	 * @type {string}
	 * @constant
	 */
	const LinearTransfer = 'linear';

	/**
	 * sRGB transfer function.
	 *
	 * @type {string}
	 * @constant
	 */
	const SRGBTransfer = 'srgb';

	/**
	 * The contents are intended to be specified once by the application, and used many
	 * times as the source for drawing and image specification commands.
	 *
	 * @type {number}
	 * @constant
	 */
	const StaticDrawUsage = 35044;

	/**
	 * WebGL coordinate system.
	 *
	 * @type {number}
	 * @constant
	 */
	const WebGLCoordinateSystem = 2000;

	/**
	 * WebGPU coordinate system.
	 *
	 * @type {number}
	 * @constant
	 */
	const WebGPUCoordinateSystem = 2001;

	/**
	 * This type represents mouse buttons and interaction types in context of controls.
	 *
	 * @typedef {Object} ConstantsMouse
	 * @property {number} MIDDLE - The left mouse button.
	 * @property {number} LEFT - The middle mouse button.
	 * @property {number} RIGHT - The right mouse button.
	 * @property {number} ROTATE - A rotate interaction.
	 * @property {number} DOLLY - A dolly interaction.
	 * @property {number} PAN - A pan interaction.
	 **/

	/**
	 * This type represents touch interaction types in context of controls.
	 *
	 * @typedef {Object} ConstantsTouch
	 * @property {number} ROTATE - A rotate interaction.
	 * @property {number} PAN - A pan interaction.
	 * @property {number} DOLLY_PAN - The dolly-pan interaction.
	 * @property {number} DOLLY_ROTATE - A dolly-rotate interaction.
	 **/

	/**
	 * This type represents the different timestamp query types.
	 *
	 * @typedef {Object} ConstantsTimestampQuery
	 * @property {string} COMPUTE - A `compute` timestamp query.
	 * @property {string} RENDER - A `render` timestamp query.
	 **/

	/**
	 * Represents the different interpolation sampling types.
	 *
	 * @typedef {Object} ConstantsInterpolationSamplingType
	 * @property {string} PERSPECTIVE - Perspective-correct interpolation.
	 * @property {string} LINEAR - Linear interpolation.
	 * @property {string} FLAT - Flat interpolation.
	 */

	/**
	 * Represents the different interpolation sampling modes.
	 *
	 * @typedef {Object} ConstantsInterpolationSamplingMode
	 * @property {string} NORMAL - Normal sampling mode.
	 * @property {string} CENTROID - Centroid sampling mode.
	 * @property {string} SAMPLE - Sample-specific sampling mode.
	 * @property {string} FLAT_FIRST - Flat interpolation using the first vertex.
	 * @property {string} FLAT_EITHER - Flat interpolation using either vertex.
	 */

	/**
	 * This modules allows to dispatch event objects on custom JavaScript objects.
	 *
	 * Main repository: [eventdispatcher.js]{@link https://github.com/mrdoob/eventdispatcher.js/}
	 *
	 * Code Example:
	 * ```js
	 * class Car extends EventDispatcher {
	 * 	start() {
	 *		this.dispatchEvent( { type: 'start', message: 'vroom vroom!' } );
	 *	}
	 *};
	 *
	 * // Using events with the custom object
	 * const car = new Car();
	 * car.addEventListener( 'start', function ( event ) {
	 * 	alert( event.message );
	 * } );
	 *
	 * car.start();
	 * ```
	 */
	class EventDispatcher {

		/**
		 * Adds the given event listener to the given event type.
		 *
		 * @param {string} type - The type of event to listen to.
		 * @param {Function} listener - The function that gets called when the event is fired.
		 */
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

		/**
		 * Returns `true` if the given event listener has been added to the given event type.
		 *
		 * @param {string} type - The type of event.
		 * @param {Function} listener - The listener to check.
		 * @return {boolean} Whether the given event listener has been added to the given event type.
		 */
		hasEventListener( type, listener ) {

			const listeners = this._listeners;

			if ( listeners === undefined ) return false;

			return listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1;

		}

		/**
		 * Removes the given event listener from the given event type.
		 *
		 * @param {string} type - The type of event.
		 * @param {Function} listener - The listener to remove.
		 */
		removeEventListener( type, listener ) {

			const listeners = this._listeners;

			if ( listeners === undefined ) return;

			const listenerArray = listeners[ type ];

			if ( listenerArray !== undefined ) {

				const index = listenerArray.indexOf( listener );

				if ( index !== - 1 ) {

					listenerArray.splice( index, 1 );

				}

			}

		}

		/**
		 * Dispatches an event object.
		 *
		 * @param {Object} event - The event that gets fired.
		 */
		dispatchEvent( event ) {

			const listeners = this._listeners;

			if ( listeners === undefined ) return;

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

	/**
	 * Generate a [UUID]{@link https://en.wikipedia.org/wiki/Universally_unique_identifier}
	 * (universally unique identifier).
	 *
	 * @return {string} The UUID.
	 */
	function generateUUID() {

		// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136

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

	/**
	 * Clamps the given value between min and max.
	 *
	 * @param {number} value - The value to clamp.
	 * @param {number} min - The min value.
	 * @param {number} max - The max value.
	 * @return {number} The clamped value.
	 */
	function clamp( value, min, max ) {

		return Math.max( min, Math.min( max, value ) );

	}

	/**
	 * Computes the Euclidean modulo of the given parameters that
	 * is `( ( n % m ) + m ) % m`.
	 *
	 * @param {number} n - The first parameter.
	 * @param {number} m - The second parameter.
	 * @return {number} The Euclidean modulo.
	 */
	function euclideanModulo( n, m ) {

		// https://en.wikipedia.org/wiki/Modulo_operation

		return ( ( n % m ) + m ) % m;

	}

	/**
	 * Performs a linear mapping from range `<a1, a2>` to range `<b1, b2>`
	 * for the given value.
	 *
	 * @param {number} x - The value to be mapped.
	 * @param {number} a1 - Minimum value for range A.
	 * @param {number} a2 - Maximum value for range A.
	 * @param {number} b1 - Minimum value for range B.
	 * @param {number} b2 - Maximum value for range B.
	 * @return {number} The mapped value.
	 */
	function mapLinear( x, a1, a2, b1, b2 ) {

		return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );

	}

	/**
	 * Returns the percentage in the closed interval `[0, 1]` of the given value
	 * between the start and end point.
	 *
	 * @param {number} x - The start point
	 * @param {number} y - The end point.
	 * @param {number} value - A value between start and end.
	 * @return {number} The interpolation factor.
	 */
	function inverseLerp( x, y, value ) {

		// https://www.gamedev.net/tutorials/programming/general-and-gameplay-programming/inverse-lerp-a-super-useful-yet-often-overlooked-function-r5230/

		if ( x !== y ) {

			return ( value - x ) / ( y - x );

		} else {

			return 0;

		}

	}

	/**
	 * Returns a value linearly interpolated from two known points based on the given interval -
	 * `t = 0` will return `x` and `t = 1` will return `y`.
	 *
	 * @param {number} x - The start point
	 * @param {number} y - The end point.
	 * @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
	 * @return {number} The interpolated value.
	 */
	function lerp( x, y, t ) {

		return ( 1 - t ) * x + t * y;

	}

	/**
	 * Smoothly interpolate a number from `x` to `y` in  a spring-like manner using a delta
	 * time to maintain frame rate independent movement. For details, see
	 * [Frame rate independent damping using lerp]{@link http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/}.
	 *
	 * @param {number} x - The current point.
	 * @param {number} y - The target point.
	 * @param {number} lambda - A higher lambda value will make the movement more sudden,
	 * and a lower value will make the movement more gradual.
	 * @param {number} dt - Delta time in seconds.
	 * @return {number} The interpolated value.
	 */
	function damp( x, y, lambda, dt ) {

		return lerp( x, y, 1 - Math.exp( - lambda * dt ) );

	}

	/**
	 * Returns a value that alternates between `0` and the given `length` parameter.
	 *
	 * @param {number} x - The value to pingpong.
	 * @param {number} [length=1] - The positive value the function will pingpong to.
	 * @return {number} The alternated value.
	 */
	function pingpong( x, length = 1 ) {

		// https://www.desmos.com/calculator/vcsjnyz7x4

		return length - Math.abs( euclideanModulo( x, length * 2 ) - length );

	}

	/**
	 * Returns a value in the range `[0,1]` that represents the percentage that `x` has
	 * moved between `min` and `max`, but smoothed or slowed down the closer `x` is to
	 * the `min` and `max`.
	 *
	 * See [Smoothstep]{@link http://en.wikipedia.org/wiki/Smoothstep} for more details.
	 *
	 * @param {number} x - The value to evaluate based on its position between min and max.
	 * @param {number} min - The min value. Any x value below min will be `0`.
	 * @param {number} max - The max value. Any x value above max will be `1`.
	 * @return {number} The alternated value.
	 */
	function smoothstep( x, min, max ) {

		if ( x <= min ) return 0;
		if ( x >= max ) return 1;

		x = ( x - min ) / ( max - min );

		return x * x * ( 3 - 2 * x );

	}

	/**
	 * A [variation on smoothstep]{@link https://en.wikipedia.org/wiki/Smoothstep#Variations}
	 * that has zero 1st and 2nd order derivatives at x=0 and x=1.
	 *
	 * @param {number} x - The value to evaluate based on its position between min and max.
	 * @param {number} min - The min value. Any x value below min will be `0`.
	 * @param {number} max - The max value. Any x value above max will be `1`.
	 * @return {number} The alternated value.
	 */
	function smootherstep( x, min, max ) {

		if ( x <= min ) return 0;
		if ( x >= max ) return 1;

		x = ( x - min ) / ( max - min );

		return x * x * x * ( x * ( x * 6 - 15 ) + 10 );

	}

	/**
	 * Returns a random integer from `<low, high>` interval.
	 *
	 * @param {number} low - The lower value boundary.
	 * @param {number} high - The upper value boundary
	 * @return {number} A random integer.
	 */
	function randInt( low, high ) {

		return low + Math.floor( Math.random() * ( high - low + 1 ) );

	}

	/**
	 * Returns a random float from `<low, high>` interval.
	 *
	 * @param {number} low - The lower value boundary.
	 * @param {number} high - The upper value boundary
	 * @return {number} A random float.
	 */
	function randFloat( low, high ) {

		return low + Math.random() * ( high - low );

	}

	/**
	 * Returns a random integer from `<-range/2, range/2>` interval.
	 *
	 * @param {number} range - Defines the value range.
	 * @return {number} A random float.
	 */
	function randFloatSpread( range ) {

		return range * ( 0.5 - Math.random() );

	}

	/**
	 * Returns a deterministic pseudo-random float in the interval `[0, 1]`.
	 *
	 * @param {number} [s] - The integer seed.
	 * @return {number} A random float.
	 */
	function seededRandom( s ) {

		if ( s !== undefined ) _seed = s;

		// Mulberry32 generator

		let t = _seed += 0x6D2B79F5;

		t = Math.imul( t ^ t >>> 15, t | 1 );

		t ^= t + Math.imul( t ^ t >>> 7, t | 61 );

		return ( ( t ^ t >>> 14 ) >>> 0 ) / 4294967296;

	}

	/**
	 * Converts degrees to radians.
	 *
	 * @param {number} degrees - A value in degrees.
	 * @return {number} The converted value in radians.
	 */
	function degToRad( degrees ) {

		return degrees * DEG2RAD;

	}

	/**
	 * Converts radians to degrees.
	 *
	 * @param {number} radians - A value in radians.
	 * @return {number} The converted value in degrees.
	 */
	function radToDeg( radians ) {

		return radians * RAD2DEG;

	}

	/**
	 * Returns `true` if the given number is a power of two.
	 *
	 * @param {number} value - The value to check.
	 * @return {boolean} Whether the given number is a power of two or not.
	 */
	function isPowerOfTwo( value ) {

		return ( value & ( value - 1 ) ) === 0 && value !== 0;

	}

	/**
	 * Returns the smallest power of two that is greater than or equal to the given number.
	 *
	 * @param {number} value - The value to find a POT for.
	 * @return {number} The smallest power of two that is greater than or equal to the given number.
	 */
	function ceilPowerOfTwo( value ) {

		return Math.pow( 2, Math.ceil( Math.log( value ) / Math.LN2 ) );

	}

	/**
	 * Returns the largest power of two that is less than or equal to the given number.
	 *
	 * @param {number} value - The value to find a POT for.
	 * @return {number} The largest power of two that is less than or equal to the given number.
	 */
	function floorPowerOfTwo( value ) {

		return Math.pow( 2, Math.floor( Math.log( value ) / Math.LN2 ) );

	}

	/**
	 * Sets the given quaternion from the [Intrinsic Proper Euler Angles]{@link https://en.wikipedia.org/wiki/Euler_angles}
	 * defined by the given angles and order.
	 *
	 * Rotations are applied to the axes in the order specified by order:
	 * rotation by angle `a` is applied first, then by angle `b`, then by angle `c`.
	 *
	 * @param {Quaternion} q - The quaternion to set.
	 * @param {number} a - The rotation applied to the first axis, in radians.
	 * @param {number} b - The rotation applied to the second axis, in radians.
	 * @param {number} c - The rotation applied to the third axis, in radians.
	 * @param {('XYX'|'XZX'|'YXY'|'YZY'|'ZXZ'|'ZYZ')} order - A string specifying the axes order.
	 */
	function setQuaternionFromProperEuler( q, a, b, c, order ) {

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

	/**
	 * Denormalizes the given value according to the given typed array.
	 *
	 * @param {number} value - The value to denormalize.
	 * @param {TypedArray} array - The typed array that defines the data type of the value.
	 * @return {number} The denormalize (float) value in the range `[0,1]`.
	 */
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

				return Math.max( value / 2147483647.0, - 1 );

			case Int16Array:

				return Math.max( value / 32767.0, - 1 );

			case Int8Array:

				return Math.max( value / 127.0, - 1 );

			default:

				throw new Error( 'Invalid component type.' );

		}

	}

	/**
	 * Normalizes the given value according to the given typed array.
	 *
	 * @param {number} value - The float value in the range `[0,1]` to normalize.
	 * @param {TypedArray} array - The typed array that defines the data type of the value.
	 * @return {number} The normalize value.
	 */
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

	/**
	 * @class
	 * @classdesc A collection of math utility functions.
	 * @hideconstructor
	 */
	const MathUtils = {
		DEG2RAD: DEG2RAD,
		RAD2DEG: RAD2DEG,
		/**
		 * Generate a [UUID]{@link https://en.wikipedia.org/wiki/Universally_unique_identifier}
		 * (universally unique identifier).
		 *
		 * @static
		 * @method
		 * @return {string} The UUID.
		 */
		generateUUID: generateUUID,
		/**
		 * Clamps the given value between min and max.
		 *
		 * @static
		 * @method
		 * @param {number} value - The value to clamp.
		 * @param {number} min - The min value.
		 * @param {number} max - The max value.
		 * @return {number} The clamped value.
		 */
		clamp: clamp,
		/**
		 * Computes the Euclidean modulo of the given parameters that
		 * is `( ( n % m ) + m ) % m`.
		 *
		 * @static
		 * @method
		 * @param {number} n - The first parameter.
		 * @param {number} m - The second parameter.
		 * @return {number} The Euclidean modulo.
		 */
		euclideanModulo: euclideanModulo,
		/**
		 * Performs a linear mapping from range `<a1, a2>` to range `<b1, b2>`
		 * for the given value.
		 *
		 * @static
		 * @method
		 * @param {number} x - The value to be mapped.
		 * @param {number} a1 - Minimum value for range A.
		 * @param {number} a2 - Maximum value for range A.
		 * @param {number} b1 - Minimum value for range B.
		 * @param {number} b2 - Maximum value for range B.
		 * @return {number} The mapped value.
		 */
		mapLinear: mapLinear,
		/**
		 * Returns the percentage in the closed interval `[0, 1]` of the given value
		 * between the start and end point.
		 *
		 * @static
		 * @method
		 * @param {number} x - The start point
		 * @param {number} y - The end point.
		 * @param {number} value - A value between start and end.
		 * @return {number} The interpolation factor.
		 */
		inverseLerp: inverseLerp,
		/**
		 * Returns a value linearly interpolated from two known points based on the given interval -
		 * `t = 0` will return `x` and `t = 1` will return `y`.
		 *
		 * @static
		 * @method
		 * @param {number} x - The start point
		 * @param {number} y - The end point.
		 * @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
		 * @return {number} The interpolated value.
		 */
		lerp: lerp,
		/**
		 * Smoothly interpolate a number from `x` to `y` in  a spring-like manner using a delta
		 * time to maintain frame rate independent movement. For details, see
		 * [Frame rate independent damping using lerp]{@link http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/}.
		 *
		 * @static
		 * @method
		 * @param {number} x - The current point.
		 * @param {number} y - The target point.
		 * @param {number} lambda - A higher lambda value will make the movement more sudden,
		 * and a lower value will make the movement more gradual.
		 * @param {number} dt - Delta time in seconds.
		 * @return {number} The interpolated value.
		 */
		damp: damp,
		/**
		 * Returns a value that alternates between `0` and the given `length` parameter.
		 *
		 * @static
		 * @method
		 * @param {number} x - The value to pingpong.
		 * @param {number} [length=1] - The positive value the function will pingpong to.
		 * @return {number} The alternated value.
		 */
		pingpong: pingpong,
		/**
		 * Returns a value in the range `[0,1]` that represents the percentage that `x` has
		 * moved between `min` and `max`, but smoothed or slowed down the closer `x` is to
		 * the `min` and `max`.
		 *
		 * See [Smoothstep]{@link http://en.wikipedia.org/wiki/Smoothstep} for more details.
		 *
		 * @static
		 * @method
		 * @param {number} x - The value to evaluate based on its position between min and max.
		 * @param {number} min - The min value. Any x value below min will be `0`.
		 * @param {number} max - The max value. Any x value above max will be `1`.
		 * @return {number} The alternated value.
		 */
		smoothstep: smoothstep,
		/**
		 * A [variation on smoothstep]{@link https://en.wikipedia.org/wiki/Smoothstep#Variations}
		 * that has zero 1st and 2nd order derivatives at x=0 and x=1.
		 *
		 * @static
		 * @method
		 * @param {number} x - The value to evaluate based on its position between min and max.
		 * @param {number} min - The min value. Any x value below min will be `0`.
		 * @param {number} max - The max value. Any x value above max will be `1`.
		 * @return {number} The alternated value.
		 */
		smootherstep: smootherstep,
		/**
		 * Returns a random integer from `<low, high>` interval.
		 *
		 * @static
		 * @method
		 * @param {number} low - The lower value boundary.
		 * @param {number} high - The upper value boundary
		 * @return {number} A random integer.
		 */
		randInt: randInt,
		/**
		 * Returns a random float from `<low, high>` interval.
		 *
		 * @static
		 * @method
		 * @param {number} low - The lower value boundary.
		 * @param {number} high - The upper value boundary
		 * @return {number} A random float.
		 */
		randFloat: randFloat,
		/**
		 * Returns a random integer from `<-range/2, range/2>` interval.
		 *
		 * @static
		 * @method
		 * @param {number} range - Defines the value range.
		 * @return {number} A random float.
		 */
		randFloatSpread: randFloatSpread,
		/**
		 * Returns a deterministic pseudo-random float in the interval `[0, 1]`.
		 *
		 * @static
		 * @method
		 * @param {number} [s] - The integer seed.
		 * @return {number} A random float.
		 */
		seededRandom: seededRandom,
		/**
		 * Converts degrees to radians.
		 *
		 * @static
		 * @method
		 * @param {number} degrees - A value in degrees.
		 * @return {number} The converted value in radians.
		 */
		degToRad: degToRad,
		/**
		 * Converts radians to degrees.
		 *
		 * @static
		 * @method
		 * @param {number} radians - A value in radians.
		 * @return {number} The converted value in degrees.
		 */
		radToDeg: radToDeg,
		/**
		 * Returns `true` if the given number is a power of two.
		 *
		 * @static
		 * @method
		 * @param {number} value - The value to check.
		 * @return {boolean} Whether the given number is a power of two or not.
		 */
		isPowerOfTwo: isPowerOfTwo,
		/**
		 * Returns the smallest power of two that is greater than or equal to the given number.
		 *
		 * @static
		 * @method
		 * @param {number} value - The value to find a POT for.
		 * @return {number} The smallest power of two that is greater than or equal to the given number.
		 */
		ceilPowerOfTwo: ceilPowerOfTwo,
		/**
		 * Returns the largest power of two that is less than or equal to the given number.
		 *
		 * @static
		 * @method
		 * @param {number} value - The value to find a POT for.
		 * @return {number} The largest power of two that is less than or equal to the given number.
		 */
		floorPowerOfTwo: floorPowerOfTwo,
		/**
		 * Sets the given quaternion from the [Intrinsic Proper Euler Angles]{@link https://en.wikipedia.org/wiki/Euler_angles}
		 * defined by the given angles and order.
		 *
		 * Rotations are applied to the axes in the order specified by order:
		 * rotation by angle `a` is applied first, then by angle `b`, then by angle `c`.
		 *
		 * @static
		 * @method
		 * @param {Quaternion} q - The quaternion to set.
		 * @param {number} a - The rotation applied to the first axis, in radians.
		 * @param {number} b - The rotation applied to the second axis, in radians.
		 * @param {number} c - The rotation applied to the third axis, in radians.
		 * @param {('XYX'|'XZX'|'YXY'|'YZY'|'ZXZ'|'ZYZ')} order - A string specifying the axes order.
		 */
		setQuaternionFromProperEuler: setQuaternionFromProperEuler,
		/**
		 * Normalizes the given value according to the given typed array.
		 *
		 * @static
		 * @method
		 * @param {number} value - The float value in the range `[0,1]` to normalize.
		 * @param {TypedArray} array - The typed array that defines the data type of the value.
		 * @return {number} The normalize value.
		 */
		normalize: normalize,
		/**
		 * Denormalizes the given value according to the given typed array.
		 *
		 * @static
		 * @method
		 * @param {number} value - The value to denormalize.
		 * @param {TypedArray} array - The typed array that defines the data type of the value.
		 * @return {number} The denormalize (float) value in the range `[0,1]`.
		 */
		denormalize: denormalize
	};

	/**
	 * Class representing a 2D vector. A 2D vector is an ordered pair of numbers
	 * (labeled x and y), which can be used to represent a number of things, such as:
	 *
	 * - A point in 2D space (i.e. a position on a plane).
	 * - A direction and length across a plane. In three.js the length will
	 * always be the Euclidean distance(straight-line distance) from `(0, 0)` to `(x, y)`
	 * and the direction is also measured from `(0, 0)` towards `(x, y)`.
	 * - Any arbitrary ordered pair of numbers.
	 *
	 * There are other things a 2D vector can be used to represent, such as
	 * momentum vectors, complex numbers and so on, however these are the most
	 * common uses in three.js.
	 *
	 * Iterating through a vector instance will yield its components `(x, y)` in
	 * the corresponding order.
	 * ```js
	 * const a = new THREE.Vector2( 0, 1 );
	 *
	 * //no arguments; will be initialised to (0, 0)
	 * const b = new THREE.Vector2( );
	 *
	 * const d = a.distanceTo( b );
	 * ```
	 */
	class Vector2 {

		/**
		 * Constructs a new 2D vector.
		 *
		 * @param {number} [x=0] - The x value of this vector.
		 * @param {number} [y=0] - The y value of this vector.
		 */
		constructor( x = 0, y = 0 ) {

			/**
			 * This flag can be used for type testing.
			 *
			 * @type {boolean}
			 * @readonly
			 * @default true
			 */
			Vector2.prototype.isVector2 = true;

			/**
			 * The x value of this vector.
			 *
			 * @type {number}
			 */
			this.x = x;

			/**
			 * The y value of this vector.
			 *
			 * @type {number}
			 */
			this.y = y;

		}

		/**
		 * Alias for {@link Vector2#x}.
		 *
		 * @type {number}
		 */
		get width() {

			return this.x;

		}

		set width( value ) {

			this.x = value;

		}

		/**
		 * Alias for {@link Vector2#y}.
		 *
		 * @type {number}
		 */
		get height() {

			return this.y;

		}

		set height( value ) {

			this.y = value;

		}

		/**
		 * Sets the vector components.
		 *
		 * @param {number} x - The value of the x component.
		 * @param {number} y - The value of the y component.
		 * @return {Vector2} A reference to this vector.
		 */
		set( x, y ) {

			this.x = x;
			this.y = y;

			return this;

		}

		/**
		 * Sets the vector components to the same value.
		 *
		 * @param {number} scalar - The value to set for all vector components.
		 * @return {Vector2} A reference to this vector.
		 */
		setScalar( scalar ) {

			this.x = scalar;
			this.y = scalar;

			return this;

		}

		/**
		 * Sets the vector's x component to the given value
		 *
		 * @param {number} x - The value to set.
		 * @return {Vector2} A reference to this vector.
		 */
		setX( x ) {

			this.x = x;

			return this;

		}

		/**
		 * Sets the vector's y component to the given value
		 *
		 * @param {number} y - The value to set.
		 * @return {Vector2} A reference to this vector.
		 */
		setY( y ) {

			this.y = y;

			return this;

		}

		/**
		 * Allows to set a vector component with an index.
		 *
		 * @param {number} index - The component index. `0` equals to x, `1` equals to y.
		 * @param {number} value - The value to set.
		 * @return {Vector2} A reference to this vector.
		 */
		setComponent( index, value ) {

			switch ( index ) {

				case 0: this.x = value; break;
				case 1: this.y = value; break;
				default: throw new Error( 'index is out of range: ' + index );

			}

			return this;

		}

		/**
		 * Returns the value of the vector component which matches the given index.
		 *
		 * @param {number} index - The component index. `0` equals to x, `1` equals to y.
		 * @return {number} A vector component value.
		 */
		getComponent( index ) {

			switch ( index ) {

				case 0: return this.x;
				case 1: return this.y;
				default: throw new Error( 'index is out of range: ' + index );

			}

		}

		/**
		 * Returns a new vector with copied values from this instance.
		 *
		 * @return {Vector2} A clone of this instance.
		 */
		clone() {

			return new this.constructor( this.x, this.y );

		}

		/**
		 * Copies the values of the given vector to this instance.
		 *
		 * @param {Vector2} v - The vector to copy.
		 * @return {Vector2} A reference to this vector.
		 */
		copy( v ) {

			this.x = v.x;
			this.y = v.y;

			return this;

		}

		/**
		 * Adds the given vector to this instance.
		 *
		 * @param {Vector2} v - The vector to add.
		 * @return {Vector2} A reference to this vector.
		 */
		add( v ) {

			this.x += v.x;
			this.y += v.y;

			return this;

		}

		/**
		 * Adds the given scalar value to all components of this instance.
		 *
		 * @param {number} s - The scalar to add.
		 * @return {Vector2} A reference to this vector.
		 */
		addScalar( s ) {

			this.x += s;
			this.y += s;

			return this;

		}

		/**
		 * Adds the given vectors and stores the result in this instance.
		 *
		 * @param {Vector2} a - The first vector.
		 * @param {Vector2} b - The second vector.
		 * @return {Vector2} A reference to this vector.
		 */
		addVectors( a, b ) {

			this.x = a.x + b.x;
			this.y = a.y + b.y;

			return this;

		}

		/**
		 * Adds the given vector scaled by the given factor to this instance.
		 *
		 * @param {Vector2} v - The vector.
		 * @param {number} s - The factor that scales `v`.
		 * @return {Vector2} A reference to this vector.
		 */
		addScaledVector( v, s ) {

			this.x += v.x * s;
			this.y += v.y * s;

			return this;

		}

		/**
		 * Subtracts the given vector from this instance.
		 *
		 * @param {Vector2} v - The vector to subtract.
		 * @return {Vector2} A reference to this vector.
		 */
		sub( v ) {

			this.x -= v.x;
			this.y -= v.y;

			return this;

		}

		/**
		 * Subtracts the given scalar value from all components of this instance.
		 *
		 * @param {number} s - The scalar to subtract.
		 * @return {Vector2} A reference to this vector.
		 */
		subScalar( s ) {

			this.x -= s;
			this.y -= s;

			return this;

		}

		/**
		 * Subtracts the given vectors and stores the result in this instance.
		 *
		 * @param {Vector2} a - The first vector.
		 * @param {Vector2} b - The second vector.
		 * @return {Vector2} A reference to this vector.
		 */
		subVectors( a, b ) {

			this.x = a.x - b.x;
			this.y = a.y - b.y;

			return this;

		}

		/**
		 * Multiplies the given vector with this instance.
		 *
		 * @param {Vector2} v - The vector to multiply.
		 * @return {Vector2} A reference to this vector.
		 */
		multiply( v ) {

			this.x *= v.x;
			this.y *= v.y;

			return this;

		}

		/**
		 * Multiplies the given scalar value with all components of this instance.
		 *
		 * @param {number} scalar - The scalar to multiply.
		 * @return {Vector2} A reference to this vector.
		 */
		multiplyScalar( scalar ) {

			this.x *= scalar;
			this.y *= scalar;

			return this;

		}

		/**
		 * Divides this instance by the given vector.
		 *
		 * @param {Vector2} v - The vector to divide.
		 * @return {Vector2} A reference to this vector.
		 */
		divide( v ) {

			this.x /= v.x;
			this.y /= v.y;

			return this;

		}

		/**
		 * Divides this vector by the given scalar.
		 *
		 * @param {number} scalar - The scalar to divide.
		 * @return {Vector2} A reference to this vector.
		 */
		divideScalar( scalar ) {

			return this.multiplyScalar( 1 / scalar );

		}

		/**
		 * Multiplies this vector (with an implicit 1 as the 3rd component) by
		 * the given 3x3 matrix.
		 *
		 * @param {Matrix3} m - The matrix to apply.
		 * @return {Vector2} A reference to this vector.
		 */
		applyMatrix3( m ) {

			const x = this.x, y = this.y;
			const e = m.elements;

			this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ];
			this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ];

			return this;

		}

		/**
		 * If this vector's x or y value is greater than the given vector's x or y
		 * value, replace that value with the corresponding min value.
		 *
		 * @param {Vector2} v - The vector.
		 * @return {Vector2} A reference to this vector.
		 */
		min( v ) {

			this.x = Math.min( this.x, v.x );
			this.y = Math.min( this.y, v.y );

			return this;

		}

		/**
		 * If this vector's x or y value is less than the given vector's x or y
		 * value, replace that value with the corresponding max value.
		 *
		 * @param {Vector2} v - The vector.
		 * @return {Vector2} A reference to this vector.
		 */
		max( v ) {

			this.x = Math.max( this.x, v.x );
			this.y = Math.max( this.y, v.y );

			return this;

		}

		/**
		 * If this vector's x or y value is greater than the max vector's x or y
		 * value, it is replaced by the corresponding value.
		 * If this vector's x or y value is less than the min vector's x or y value,
		 * it is replaced by the corresponding value.
		 *
		 * @param {Vector2} min - The minimum x and y values.
		 * @param {Vector2} max - The maximum x and y values in the desired range.
		 * @return {Vector2} A reference to this vector.
		 */
		clamp( min, max ) {

			// assumes min < max, componentwise

			this.x = clamp( this.x, min.x, max.x );
			this.y = clamp( this.y, min.y, max.y );

			return this;

		}

		/**
		 * If this vector's x or y values are greater than the max value, they are
		 * replaced by the max value.
		 * If this vector's x or y values are less than the min value, they are
		 * replaced by the min value.
		 *
		 * @param {number} minVal - The minimum value the components will be clamped to.
		 * @param {number} maxVal - The maximum value the components will be clamped to.
		 * @return {Vector2} A reference to this vector.
		 */
		clampScalar( minVal, maxVal ) {

			this.x = clamp( this.x, minVal, maxVal );
			this.y = clamp( this.y, minVal, maxVal );

			return this;

		}

		/**
		 * If this vector's length is greater than the max value, it is replaced by
		 * the max value.
		 * If this vector's length is less than the min value, it is replaced by the
		 * min value.
		 *
		 * @param {number} min - The minimum value the vector length will be clamped to.
		 * @param {number} max - The maximum value the vector length will be clamped to.
		 * @return {Vector2} A reference to this vector.
		 */
		clampLength( min, max ) {

			const length = this.length();

			return this.divideScalar( length || 1 ).multiplyScalar( clamp( length, min, max ) );

		}

		/**
		 * The components of this vector are rounded down to the nearest integer value.
		 *
		 * @return {Vector2} A reference to this vector.
		 */
		floor() {

			this.x = Math.floor( this.x );
			this.y = Math.floor( this.y );

			return this;

		}

		/**
		 * The components of this vector are rounded up to the nearest integer value.
		 *
		 * @return {Vector2} A reference to this vector.
		 */
		ceil() {

			this.x = Math.ceil( this.x );
			this.y = Math.ceil( this.y );

			return this;

		}

		/**
		 * The components of this vector are rounded to the nearest integer value
		 *
		 * @return {Vector2} A reference to this vector.
		 */
		round() {

			this.x = Math.round( this.x );
			this.y = Math.round( this.y );

			return this;

		}

		/**
		 * The components of this vector are rounded towards zero (up if negative,
		 * down if positive) to an integer value.
		 *
		 * @return {Vector2} A reference to this vector.
		 */
		roundToZero() {

			this.x = Math.trunc( this.x );
			this.y = Math.trunc( this.y );

			return this;

		}

		/**
		 * Inverts this vector - i.e. sets x = -x and y = -y.
		 *
		 * @return {Vector2} A reference to this vector.
		 */
		negate() {

			this.x = - this.x;
			this.y = - this.y;

			return this;

		}

		/**
		 * Calculates the dot product of the given vector with this instance.
		 *
		 * @param {Vector2} v - The vector to compute the dot product with.
		 * @return {number} The result of the dot product.
		 */
		dot( v ) {

			return this.x * v.x + this.y * v.y;

		}

		/**
		 * Calculates the cross product of the given vector with this instance.
		 *
		 * @param {Vector2} v - The vector to compute the cross product with.
		 * @return {number} The result of the cross product.
		 */
		cross( v ) {

			return this.x * v.y - this.y * v.x;

		}

		/**
		 * Computes the square of the Euclidean length (straight-line length) from
		 * (0, 0) to (x, y). If you are comparing the lengths of vectors, you should
		 * compare the length squared instead as it is slightly more efficient to calculate.
		 *
		 * @return {number} The square length of this vector.
		 */
		lengthSq() {

			return this.x * this.x + this.y * this.y;

		}

		/**
		 * Computes the  Euclidean length (straight-line length) from (0, 0) to (x, y).
		 *
		 * @return {number} The length of this vector.
		 */
		length() {

			return Math.sqrt( this.x * this.x + this.y * this.y );

		}

		/**
		 * Computes the Manhattan length of this vector.
		 *
		 * @return {number} The length of this vector.
		 */
		manhattanLength() {

			return Math.abs( this.x ) + Math.abs( this.y );

		}

		/**
		 * Converts this vector to a unit vector - that is, sets it equal to a vector
		 * with the same direction as this one, but with a vector length of `1`.
		 *
		 * @return {Vector2} A reference to this vector.
		 */
		normalize() {

			return this.divideScalar( this.length() || 1 );

		}

		/**
		 * Computes the angle in radians of this vector with respect to the positive x-axis.
		 *
		 * @return {number} The angle in radians.
		 */
		angle() {

			const angle = Math.atan2( - this.y, - this.x ) + Math.PI;

			return angle;

		}

		/**
		 * Returns the angle between the given vector and this instance in radians.
		 *
		 * @param {Vector2} v - The vector to compute the angle with.
		 * @return {number} The angle in radians.
		 */
		angleTo( v ) {

			const denominator = Math.sqrt( this.lengthSq() * v.lengthSq() );

			if ( denominator === 0 ) return Math.PI / 2;

			const theta = this.dot( v ) / denominator;

			// clamp, to handle numerical problems

			return Math.acos( clamp( theta, - 1, 1 ) );

		}

		/**
		 * Computes the distance from the given vector to this instance.
		 *
		 * @param {Vector2} v - The vector to compute the distance to.
		 * @return {number} The distance.
		 */
		distanceTo( v ) {

			return Math.sqrt( this.distanceToSquared( v ) );

		}

		/**
		 * Computes the squared distance from the given vector to this instance.
		 * If you are just comparing the distance with another distance, you should compare
		 * the distance squared instead as it is slightly more efficient to calculate.
		 *
		 * @param {Vector2} v - The vector to compute the squared distance to.
		 * @return {number} The squared distance.
		 */
		distanceToSquared( v ) {

			const dx = this.x - v.x, dy = this.y - v.y;
			return dx * dx + dy * dy;

		}

		/**
		 * Computes the Manhattan distance from the given vector to this instance.
		 *
		 * @param {Vector2} v - The vector to compute the Manhattan distance to.
		 * @return {number} The Manhattan distance.
		 */
		manhattanDistanceTo( v ) {

			return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y );

		}

		/**
		 * Sets this vector to a vector with the same direction as this one, but
		 * with the specified length.
		 *
		 * @param {number} length - The new length of this vector.
		 * @return {Vector2} A reference to this vector.
		 */
		setLength( length ) {

			return this.normalize().multiplyScalar( length );

		}

		/**
		 * Linearly interpolates between the given vector and this instance, where
		 * alpha is the percent distance along the line - alpha = 0 will be this
		 * vector, and alpha = 1 will be the given one.
		 *
		 * @param {Vector2} v - The vector to interpolate towards.
		 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
		 * @return {Vector2} A reference to this vector.
		 */
		lerp( v, alpha ) {

			this.x += ( v.x - this.x ) * alpha;
			this.y += ( v.y - this.y ) * alpha;

			return this;

		}

		/**
		 * Linearly interpolates between the given vectors, where alpha is the percent
		 * distance along the line - alpha = 0 will be first vector, and alpha = 1 will
		 * be the second one. The result is stored in this instance.
		 *
		 * @param {Vector2} v1 - The first vector.
		 * @param {Vector2} v2 - The second vector.
		 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
		 * @return {Vector2} A reference to this vector.
		 */
		lerpVectors( v1, v2, alpha ) {

			this.x = v1.x + ( v2.x - v1.x ) * alpha;
			this.y = v1.y + ( v2.y - v1.y ) * alpha;

			return this;

		}

		/**
		 * Returns `true` if this vector is equal with the given one.
		 *
		 * @param {Vector2} v - The vector to test for equality.
		 * @return {boolean} Whether this vector is equal with the given one.
		 */
		equals( v ) {

			return ( ( v.x === this.x ) && ( v.y === this.y ) );

		}

		/**
		 * Sets this vector's x value to be `array[ offset ]` and y
		 * value to be `array[ offset + 1 ]`.
		 *
		 * @param {Array<number>} array - An array holding the vector component values.
		 * @param {number} [offset=0] - The offset into the array.
		 * @return {Vector2} A reference to this vector.
		 */
		fromArray( array, offset = 0 ) {

			this.x = array[ offset ];
			this.y = array[ offset + 1 ];

			return this;

		}

		/**
		 * Writes the components of this vector to the given array. If no array is provided,
		 * the method returns a new instance.
		 *
		 * @param {Array<number>} [array=[]] - The target array holding the vector components.
		 * @param {number} [offset=0] - Index of the first element in the array.
		 * @return {Array<number>} The vector components.
		 */
		toArray( array = [], offset = 0 ) {

			array[ offset ] = this.x;
			array[ offset + 1 ] = this.y;

			return array;

		}

		/**
		 * Sets the components of this vector from the given buffer attribute.
		 *
		 * @param {BufferAttribute} attribute - The buffer attribute holding vector data.
		 * @param {number} index - The index into the attribute.
		 * @return {Vector2} A reference to this vector.
		 */
		fromBufferAttribute( attribute, index ) {

			this.x = attribute.getX( index );
			this.y = attribute.getY( index );

			return this;

		}

		/**
		 * Rotates this vector around the given center by the given angle.
		 *
		 * @param {Vector2} center - The point around which to rotate.
		 * @param {number} angle - The angle to rotate, in radians.
		 * @return {Vector2} A reference to this vector.
		 */
		rotateAround( center, angle ) {

			const c = Math.cos( angle ), s = Math.sin( angle );

			const x = this.x - center.x;
			const y = this.y - center.y;

			this.x = x * c - y * s + center.x;
			this.y = x * s + y * c + center.y;

			return this;

		}

		/**
		 * Sets each component of this vector to a pseudo-random value between `0` and
		 * `1`, excluding `1`.
		 *
		 * @return {Vector2} A reference to this vector.
		 */
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

	/**
	 * Class for representing a Quaternion. Quaternions are used in three.js to represent rotations.
	 *
	 * Iterating through a vector instance will yield its components `(x, y, z, w)` in
	 * the corresponding order.
	 *
	 * Note that three.js expects Quaternions to be normalized.
	 * ```js
	 * const quaternion = new THREE.Quaternion();
	 * quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 );
	 *
	 * const vector = new THREE.Vector3( 1, 0, 0 );
	 * vector.applyQuaternion( quaternion );
	 * ```
	 */
	class Quaternion {

		/**
		 * Constructs a new quaternion.
		 *
		 * @param {number} [x=0] - The x value of this quaternion.
		 * @param {number} [y=0] - The y value of this quaternion.
		 * @param {number} [z=0] - The z value of this quaternion.
		 * @param {number} [w=1] - The w value of this quaternion.
		 */
		constructor( x = 0, y = 0, z = 0, w = 1 ) {

			/**
			 * This flag can be used for type testing.
			 *
			 * @type {boolean}
			 * @readonly
			 * @default true
			 */
			this.isQuaternion = true;

			this._x = x;
			this._y = y;
			this._z = z;
			this._w = w;

		}

		/**
		 * Interpolates between two quaternions via SLERP. This implementation assumes the
		 * quaternion data are managed  in flat arrays.
		 *
		 * @param {Array<number>} dst - The destination array.
		 * @param {number} dstOffset - An offset into the destination array.
		 * @param {Array<number>} src0 - The source array of the first quaternion.
		 * @param {number} srcOffset0 - An offset into the first source array.
		 * @param {Array<number>} src1 -  The source array of the second quaternion.
		 * @param {number} srcOffset1 - An offset into the second source array.
		 * @param {number} t - The interpolation factor in the range `[0,1]`.
		 * @see {@link Quaternion#slerp}
		 */
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

		/**
		 * Multiplies two quaternions. This implementation assumes the quaternion data are managed
		 * in flat arrays.
		 *
		 * @param {Array<number>} dst - The destination array.
		 * @param {number} dstOffset - An offset into the destination array.
		 * @param {Array<number>} src0 - The source array of the first quaternion.
		 * @param {number} srcOffset0 - An offset into the first source array.
		 * @param {Array<number>} src1 -  The source array of the second quaternion.
		 * @param {number} srcOffset1 - An offset into the second source array.
		 * @return {Array<number>} The destination array.
		 * @see {@link Quaternion#multiplyQuaternions}.
		 */
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

		/**
		 * The x value of this quaternion.
		 *
		 * @type {number}
		 * @default 0
		 */
		get x() {

			return this._x;

		}

		set x( value ) {

			this._x = value;
			this._onChangeCallback();

		}

		/**
		 * The y value of this quaternion.
		 *
		 * @type {number}
		 * @default 0
		 */
		get y() {

			return this._y;

		}

		set y( value ) {

			this._y = value;
			this._onChangeCallback();

		}

		/**
		 * The z value of this quaternion.
		 *
		 * @type {number}
		 * @default 0
		 */
		get z() {

			return this._z;

		}

		set z( value ) {

			this._z = value;
			this._onChangeCallback();

		}

		/**
		 * The w value of this quaternion.
		 *
		 * @type {number}
		 * @default 1
		 */
		get w() {

			return this._w;

		}

		set w( value ) {

			this._w = value;
			this._onChangeCallback();

		}

		/**
		 * Sets the quaternion components.
		 *
		 * @param {number} x - The x value of this quaternion.
		 * @param {number} y - The y value of this quaternion.
		 * @param {number} z - The z value of this quaternion.
		 * @param {number} w - The w value of this quaternion.
		 * @return {Quaternion} A reference to this quaternion.
		 */
		set( x, y, z, w ) {

			this._x = x;
			this._y = y;
			this._z = z;
			this._w = w;

			this._onChangeCallback();

			return this;

		}

		/**
		 * Returns a new quaternion with copied values from this instance.
		 *
		 * @return {Quaternion} A clone of this instance.
		 */
		clone() {

			return new this.constructor( this._x, this._y, this._z, this._w );

		}

		/**
		 * Copies the values of the given quaternion to this instance.
		 *
		 * @param {Quaternion} quaternion - The quaternion to copy.
		 * @return {Quaternion} A reference to this quaternion.
		 */
		copy( quaternion ) {

			this._x = quaternion.x;
			this._y = quaternion.y;
			this._z = quaternion.z;
			this._w = quaternion.w;

			this._onChangeCallback();

			return this;

		}

		/**
		 * Sets this quaternion from the rotation specified by the given
		 * Euler angles.
		 *
		 * @param {Euler} euler - The Euler angles.
		 * @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
		 * @return {Quaternion} A reference to this quaternion.
		 */
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

		/**
		 * Sets this quaternion from the given axis and angle.
		 *
		 * @param {Vector3} axis - The normalized axis.
		 * @param {number} angle - The angle in radians.
		 * @return {Quaternion} A reference to this quaternion.
		 */
		setFromAxisAngle( axis, angle ) {

			// http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

			const halfAngle = angle / 2, s = Math.sin( halfAngle );

			this._x = axis.x * s;
			this._y = axis.y * s;
			this._z = axis.z * s;
			this._w = Math.cos( halfAngle );

			this._onChangeCallback();

			return this;

		}

		/**
		 * Sets this quaternion from the given rotation matrix.
		 *
		 * @param {Matrix4} m - A 4x4 matrix of which the upper 3x3 of matrix is a pure rotation matrix (i.e. unscaled).
		 * @return {Quaternion} A reference to this quaternion.
		 */
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

		/**
		 * Sets this quaternion to the rotation required to rotate the direction vector
		 * `vFrom` to the direction vector `vTo`.
		 *
		 * @param {Vector3} vFrom - The first (normalized) direction vector.
		 * @param {Vector3} vTo - The second (normalized) direction vector.
		 * @return {Quaternion} A reference to this quaternion.
		 */
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

		/**
		 * Returns the angle between this quaternion and the given one in radians.
		 *
		 * @param {Quaternion} q - The quaternion to compute the angle with.
		 * @return {number} The angle in radians.
		 */
		angleTo( q ) {

			return 2 * Math.acos( Math.abs( clamp( this.dot( q ), - 1, 1 ) ) );

		}

		/**
		 * Rotates this quaternion by a given angular step to the given quaternion.
		 * The method ensures that the final quaternion will not overshoot `q`.
		 *
		 * @param {Quaternion} q - The target quaternion.
		 * @param {number} step - The angular step in radians.
		 * @return {Quaternion} A reference to this quaternion.
		 */
		rotateTowards( q, step ) {

			const angle = this.angleTo( q );

			if ( angle === 0 ) return this;

			const t = Math.min( 1, step / angle );

			this.slerp( q, t );

			return this;

		}

		/**
		 * Sets this quaternion to the identity quaternion; that is, to the
		 * quaternion that represents "no rotation".
		 *
		 * @return {Quaternion} A reference to this quaternion.
		 */
		identity() {

			return this.set( 0, 0, 0, 1 );

		}

		/**
		 * Inverts this quaternion via {@link Quaternion#conjugate}. The
		 * quaternion is assumed to have unit length.
		 *
		 * @return {Quaternion} A reference to this quaternion.
		 */
		invert() {

			return this.conjugate();

		}

		/**
		 * Returns the rotational conjugate of this quaternion. The conjugate of a
		 * quaternion represents the same rotation in the opposite direction about
		 * the rotational axis.
		 *
		 * @return {Quaternion} A reference to this quaternion.
		 */
		conjugate() {

			this._x *= - 1;
			this._y *= - 1;
			this._z *= - 1;

			this._onChangeCallback();

			return this;

		}

		/**
		 * Calculates the dot product of this quaternion and the given one.
		 *
		 * @param {Quaternion} v - The quaternion to compute the dot product with.
		 * @return {number} The result of the dot product.
		 */
		dot( v ) {

			return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;

		}

		/**
		 * Computes the squared Euclidean length (straight-line length) of this quaternion,
		 * considered as a 4 dimensional vector. This can be useful if you are comparing the
		 * lengths of two quaternions, as this is a slightly more efficient calculation than
		 * {@link Quaternion#length}.
		 *
		 * @return {number} The squared Euclidean length.
		 */
		lengthSq() {

			return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;

		}

		/**
		 * Computes the Euclidean length (straight-line length) of this quaternion,
		 * considered as a 4 dimensional vector.
		 *
		 * @return {number} The Euclidean length.
		 */
		length() {

			return Math.sqrt( this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w );

		}

		/**
		 * Normalizes this quaternion - that is, calculated the quaternion that performs
		 * the same rotation as this one, but has a length equal to `1`.
		 *
		 * @return {Quaternion} A reference to this quaternion.
		 */
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

		/**
		 * Multiplies this quaternion by the given one.
		 *
		 * @param {Quaternion} q - The quaternion.
		 * @return {Quaternion} A reference to this quaternion.
		 */
		multiply( q ) {

			return this.multiplyQuaternions( this, q );

		}

		/**
		 * Pre-multiplies this quaternion by the given one.
		 *
		 * @param {Quaternion} q - The quaternion.
		 * @return {Quaternion} A reference to this quaternion.
		 */
		premultiply( q ) {

			return this.multiplyQuaternions( q, this );

		}

		/**
		 * Multiplies the given quaternions and stores the result in this instance.
		 *
		 * @param {Quaternion} a - The first quaternion.
		 * @param {Quaternion} b - The second quaternion.
		 * @return {Quaternion} A reference to this quaternion.
		 */
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

		/**
		 * Performs a spherical linear interpolation between quaternions.
		 *
		 * @param {Quaternion} qb - The target quaternion.
		 * @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
		 * @return {Quaternion} A reference to this quaternion.
		 */
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

		/**
		 * Performs a spherical linear interpolation between the given quaternions
		 * and stores the result in this quaternion.
		 *
		 * @param {Quaternion} qa - The source quaternion.
		 * @param {Quaternion} qb - The target quaternion.
		 * @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
		 * @return {Quaternion} A reference to this quaternion.
		 */
		slerpQuaternions( qa, qb, t ) {

			return this.copy( qa ).slerp( qb, t );

		}

		/**
		 * Sets this quaternion to a uniformly random, normalized quaternion.
		 *
		 * @return {Quaternion} A reference to this quaternion.
		 */
		random() {

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

		/**
		 * Returns `true` if this quaternion is equal with the given one.
		 *
		 * @param {Quaternion} quaternion - The quaternion to test for equality.
		 * @return {boolean} Whether this quaternion is equal with the given one.
		 */
		equals( quaternion ) {

			return ( quaternion._x === this._x ) && ( quaternion._y === this._y ) && ( quaternion._z === this._z ) && ( quaternion._w === this._w );

		}

		/**
		 * Sets this quaternion's components from the given array.
		 *
		 * @param {Array<number>} array - An array holding the quaternion component values.
		 * @param {number} [offset=0] - The offset into the array.
		 * @return {Quaternion} A reference to this quaternion.
		 */
		fromArray( array, offset = 0 ) {

			this._x = array[ offset ];
			this._y = array[ offset + 1 ];
			this._z = array[ offset + 2 ];
			this._w = array[ offset + 3 ];

			this._onChangeCallback();

			return this;

		}

		/**
		 * Writes the components of this quaternion to the given array. If no array is provided,
		 * the method returns a new instance.
		 *
		 * @param {Array<number>} [array=[]] - The target array holding the quaternion components.
		 * @param {number} [offset=0] - Index of the first element in the array.
		 * @return {Array<number>} The quaternion components.
		 */
		toArray( array = [], offset = 0 ) {

			array[ offset ] = this._x;
			array[ offset + 1 ] = this._y;
			array[ offset + 2 ] = this._z;
			array[ offset + 3 ] = this._w;

			return array;

		}

		/**
		 * Sets the components of this quaternion from the given buffer attribute.
		 *
		 * @param {BufferAttribute} attribute - The buffer attribute holding quaternion data.
		 * @param {number} index - The index into the attribute.
		 * @return {Quaternion} A reference to this quaternion.
		 */
		fromBufferAttribute( attribute, index ) {

			this._x = attribute.getX( index );
			this._y = attribute.getY( index );
			this._z = attribute.getZ( index );
			this._w = attribute.getW( index );

			this._onChangeCallback();

			return this;

		}

		/**
		 * This methods defines the serialization result of this class. Returns the
		 * numerical elements of this quaternion in an array of format `[x, y, z, w]`.
		 *
		 * @return {Array<number>} The serialized quaternion.
		 */
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

	/**
	 * Class representing a 3D vector. A 3D vector is an ordered triplet of numbers
	 * (labeled x, y and z), which can be used to represent a number of things, such as:
	 *
	 * - A point in 3D space.
	 * - A direction and length in 3D space. In three.js the length will
	 * always be the Euclidean distance(straight-line distance) from `(0, 0, 0)` to `(x, y, z)`
	 * and the direction is also measured from `(0, 0, 0)` towards `(x, y, z)`.
	 * - Any arbitrary ordered triplet of numbers.
	 *
	 * There are other things a 3D vector can be used to represent, such as
	 * momentum vectors and so on, however these are the most
	 * common uses in three.js.
	 *
	 * Iterating through a vector instance will yield its components `(x, y, z)` in
	 * the corresponding order.
	 * ```js
	 * const a = new THREE.Vector3( 0, 1, 0 );
	 *
	 * //no arguments; will be initialised to (0, 0, 0)
	 * const b = new THREE.Vector3( );
	 *
	 * const d = a.distanceTo( b );
	 * ```
	 */
	class Vector3 {

		/**
		 * Constructs a new 3D vector.
		 *
		 * @param {number} [x=0] - The x value of this vector.
		 * @param {number} [y=0] - The y value of this vector.
		 * @param {number} [z=0] - The z value of this vector.
		 */
		constructor( x = 0, y = 0, z = 0 ) {

			/**
			 * This flag can be used for type testing.
			 *
			 * @type {boolean}
			 * @readonly
			 * @default true
			 */
			Vector3.prototype.isVector3 = true;

			/**
			 * The x value of this vector.
			 *
			 * @type {number}
			 */
			this.x = x;

			/**
			 * The y value of this vector.
			 *
			 * @type {number}
			 */
			this.y = y;

			/**
			 * The z value of this vector.
			 *
			 * @type {number}
			 */
			this.z = z;

		}

		/**
		 * Sets the vector components.
		 *
		 * @param {number} x - The value of the x component.
		 * @param {number} y - The value of the y component.
		 * @param {number} z - The value of the z component.
		 * @return {Vector3} A reference to this vector.
		 */
		set( x, y, z ) {

			if ( z === undefined ) z = this.z; // sprite.scale.set(x,y)

			this.x = x;
			this.y = y;
			this.z = z;

			return this;

		}

		/**
		 * Sets the vector components to the same value.
		 *
		 * @param {number} scalar - The value to set for all vector components.
		 * @return {Vector3} A reference to this vector.
		 */
		setScalar( scalar ) {

			this.x = scalar;
			this.y = scalar;
			this.z = scalar;

			return this;

		}

		/**
		 * Sets the vector's x component to the given value
		 *
		 * @param {number} x - The value to set.
		 * @return {Vector3} A reference to this vector.
		 */
		setX( x ) {

			this.x = x;

			return this;

		}

		/**
		 * Sets the vector's y component to the given value
		 *
		 * @param {number} y - The value to set.
		 * @return {Vector3} A reference to this vector.
		 */
		setY( y ) {

			this.y = y;

			return this;

		}

		/**
		 * Sets the vector's z component to the given value
		 *
		 * @param {number} z - The value to set.
		 * @return {Vector3} A reference to this vector.
		 */
		setZ( z ) {

			this.z = z;

			return this;

		}

		/**
		 * Allows to set a vector component with an index.
		 *
		 * @param {number} index - The component index. `0` equals to x, `1` equals to y, `2` equals to z.
		 * @param {number} value - The value to set.
		 * @return {Vector3} A reference to this vector.
		 */
		setComponent( index, value ) {

			switch ( index ) {

				case 0: this.x = value; break;
				case 1: this.y = value; break;
				case 2: this.z = value; break;
				default: throw new Error( 'index is out of range: ' + index );

			}

			return this;

		}

		/**
		 * Returns the value of the vector component which matches the given index.
		 *
		 * @param {number} index - The component index. `0` equals to x, `1` equals to y, `2` equals to z.
		 * @return {number} A vector component value.
		 */
		getComponent( index ) {

			switch ( index ) {

				case 0: return this.x;
				case 1: return this.y;
				case 2: return this.z;
				default: throw new Error( 'index is out of range: ' + index );

			}

		}

		/**
		 * Returns a new vector with copied values from this instance.
		 *
		 * @return {Vector3} A clone of this instance.
		 */
		clone() {

			return new this.constructor( this.x, this.y, this.z );

		}

		/**
		 * Copies the values of the given vector to this instance.
		 *
		 * @param {Vector3} v - The vector to copy.
		 * @return {Vector3} A reference to this vector.
		 */
		copy( v ) {

			this.x = v.x;
			this.y = v.y;
			this.z = v.z;

			return this;

		}

		/**
		 * Adds the given vector to this instance.
		 *
		 * @param {Vector3} v - The vector to add.
		 * @return {Vector3} A reference to this vector.
		 */
		add( v ) {

			this.x += v.x;
			this.y += v.y;
			this.z += v.z;

			return this;

		}

		/**
		 * Adds the given scalar value to all components of this instance.
		 *
		 * @param {number} s - The scalar to add.
		 * @return {Vector3} A reference to this vector.
		 */
		addScalar( s ) {

			this.x += s;
			this.y += s;
			this.z += s;

			return this;

		}

		/**
		 * Adds the given vectors and stores the result in this instance.
		 *
		 * @param {Vector3} a - The first vector.
		 * @param {Vector3} b - The second vector.
		 * @return {Vector3} A reference to this vector.
		 */
		addVectors( a, b ) {

			this.x = a.x + b.x;
			this.y = a.y + b.y;
			this.z = a.z + b.z;

			return this;

		}

		/**
		 * Adds the given vector scaled by the given factor to this instance.
		 *
		 * @param {Vector3|Vector4} v - The vector.
		 * @param {number} s - The factor that scales `v`.
		 * @return {Vector3} A reference to this vector.
		 */
		addScaledVector( v, s ) {

			this.x += v.x * s;
			this.y += v.y * s;
			this.z += v.z * s;

			return this;

		}

		/**
		 * Subtracts the given vector from this instance.
		 *
		 * @param {Vector3} v - The vector to subtract.
		 * @return {Vector3} A reference to this vector.
		 */
		sub( v ) {

			this.x -= v.x;
			this.y -= v.y;
			this.z -= v.z;

			return this;

		}

		/**
		 * Subtracts the given scalar value from all components of this instance.
		 *
		 * @param {number} s - The scalar to subtract.
		 * @return {Vector3} A reference to this vector.
		 */
		subScalar( s ) {

			this.x -= s;
			this.y -= s;
			this.z -= s;

			return this;

		}

		/**
		 * Subtracts the given vectors and stores the result in this instance.
		 *
		 * @param {Vector3} a - The first vector.
		 * @param {Vector3} b - The second vector.
		 * @return {Vector3} A reference to this vector.
		 */
		subVectors( a, b ) {

			this.x = a.x - b.x;
			this.y = a.y - b.y;
			this.z = a.z - b.z;

			return this;

		}

		/**
		 * Multiplies the given vector with this instance.
		 *
		 * @param {Vector3} v - The vector to multiply.
		 * @return {Vector3} A reference to this vector.
		 */
		multiply( v ) {

			this.x *= v.x;
			this.y *= v.y;
			this.z *= v.z;

			return this;

		}

		/**
		 * Multiplies the given scalar value with all components of this instance.
		 *
		 * @param {number} scalar - The scalar to multiply.
		 * @return {Vector3} A reference to this vector.
		 */
		multiplyScalar( scalar ) {

			this.x *= scalar;
			this.y *= scalar;
			this.z *= scalar;

			return this;

		}

		/**
		 * Multiplies the given vectors and stores the result in this instance.
		 *
		 * @param {Vector3} a - The first vector.
		 * @param {Vector3} b - The second vector.
		 * @return {Vector3} A reference to this vector.
		 */
		multiplyVectors( a, b ) {

			this.x = a.x * b.x;
			this.y = a.y * b.y;
			this.z = a.z * b.z;

			return this;

		}

		/**
		 * Applies the given Euler rotation to this vector.
		 *
		 * @param {Euler} euler - The Euler angles.
		 * @return {Vector3} A reference to this vector.
		 */
		applyEuler( euler ) {

			return this.applyQuaternion( _quaternion$4.setFromEuler( euler ) );

		}

		/**
		 * Applies a rotation specified by an axis and an angle to this vector.
		 *
		 * @param {Vector3} axis - A normalized vector representing the rotation axis.
		 * @param {number} angle - The angle in radians.
		 * @return {Vector3} A reference to this vector.
		 */
		applyAxisAngle( axis, angle ) {

			return this.applyQuaternion( _quaternion$4.setFromAxisAngle( axis, angle ) );

		}

		/**
		 * Multiplies this vector with the given 3x3 matrix.
		 *
		 * @param {Matrix3} m - The 3x3 matrix.
		 * @return {Vector3} A reference to this vector.
		 */
		applyMatrix3( m ) {

			const x = this.x, y = this.y, z = this.z;
			const e = m.elements;

			this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
			this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
			this.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

			return this;

		}

		/**
		 * Multiplies this vector by the given normal matrix and normalizes
		 * the result.
		 *
		 * @param {Matrix3} m - The normal matrix.
		 * @return {Vector3} A reference to this vector.
		 */
		applyNormalMatrix( m ) {

			return this.applyMatrix3( m ).normalize();

		}

		/**
		 * Multiplies this vector (with an implicit 1 in the 4th dimension) by m, and
		 * divides by perspective.
		 *
		 * @param {Matrix4} m - The matrix to apply.
		 * @return {Vector3} A reference to this vector.
		 */
		applyMatrix4( m ) {

			const x = this.x, y = this.y, z = this.z;
			const e = m.elements;

			const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

			this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
			this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
			this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;

			return this;

		}

		/**
		 * Applies the given Quaternion to this vector.
		 *
		 * @param {Quaternion} q - The Quaternion.
		 * @return {Vector3} A reference to this vector.
		 */
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

		/**
		 * Projects this vector from world space into the camera's normalized
		 * device coordinate (NDC) space.
		 *
		 * @param {Camera} camera - The camera.
		 * @return {Vector3} A reference to this vector.
		 */
		project( camera ) {

			return this.applyMatrix4( camera.matrixWorldInverse ).applyMatrix4( camera.projectionMatrix );

		}

		/**
		 * Unprojects this vector from the camera's normalized device coordinate (NDC)
		 * space into world space.
		 *
		 * @param {Camera} camera - The camera.
		 * @return {Vector3} A reference to this vector.
		 */
		unproject( camera ) {

			return this.applyMatrix4( camera.projectionMatrixInverse ).applyMatrix4( camera.matrixWorld );

		}

		/**
		 * Transforms the direction of this vector by a matrix (the upper left 3 x 3
		 * subset of the given 4x4 matrix and then normalizes the result.
		 *
		 * @param {Matrix4} m - The matrix.
		 * @return {Vector3} A reference to this vector.
		 */
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

		/**
		 * Divides this instance by the given vector.
		 *
		 * @param {Vector3} v - The vector to divide.
		 * @return {Vector3} A reference to this vector.
		 */
		divide( v ) {

			this.x /= v.x;
			this.y /= v.y;
			this.z /= v.z;

			return this;

		}

		/**
		 * Divides this vector by the given scalar.
		 *
		 * @param {number} scalar - The scalar to divide.
		 * @return {Vector3} A reference to this vector.
		 */
		divideScalar( scalar ) {

			return this.multiplyScalar( 1 / scalar );

		}

		/**
		 * If this vector's x, y or z value is greater than the given vector's x, y or z
		 * value, replace that value with the corresponding min value.
		 *
		 * @param {Vector3} v - The vector.
		 * @return {Vector3} A reference to this vector.
		 */
		min( v ) {

			this.x = Math.min( this.x, v.x );
			this.y = Math.min( this.y, v.y );
			this.z = Math.min( this.z, v.z );

			return this;

		}

		/**
		 * If this vector's x, y or z value is less than the given vector's x, y or z
		 * value, replace that value with the corresponding max value.
		 *
		 * @param {Vector3} v - The vector.
		 * @return {Vector3} A reference to this vector.
		 */
		max( v ) {

			this.x = Math.max( this.x, v.x );
			this.y = Math.max( this.y, v.y );
			this.z = Math.max( this.z, v.z );

			return this;

		}

		/**
		 * If this vector's x, y or z value is greater than the max vector's x, y or z
		 * value, it is replaced by the corresponding value.
		 * If this vector's x, y or z value is less than the min vector's x, y or z value,
		 * it is replaced by the corresponding value.
		 *
		 * @param {Vector3} min - The minimum x, y and z values.
		 * @param {Vector3} max - The maximum x, y and z values in the desired range.
		 * @return {Vector3} A reference to this vector.
		 */
		clamp( min, max ) {

			// assumes min < max, componentwise

			this.x = clamp( this.x, min.x, max.x );
			this.y = clamp( this.y, min.y, max.y );
			this.z = clamp( this.z, min.z, max.z );

			return this;

		}

		/**
		 * If this vector's x, y or z values are greater than the max value, they are
		 * replaced by the max value.
		 * If this vector's x, y or z values are less than the min value, they are
		 * replaced by the min value.
		 *
		 * @param {number} minVal - The minimum value the components will be clamped to.
		 * @param {number} maxVal - The maximum value the components will be clamped to.
		 * @return {Vector3} A reference to this vector.
		 */
		clampScalar( minVal, maxVal ) {

			this.x = clamp( this.x, minVal, maxVal );
			this.y = clamp( this.y, minVal, maxVal );
			this.z = clamp( this.z, minVal, maxVal );

			return this;

		}

		/**
		 * If this vector's length is greater than the max value, it is replaced by
		 * the max value.
		 * If this vector's length is less than the min value, it is replaced by the
		 * min value.
		 *
		 * @param {number} min - The minimum value the vector length will be clamped to.
		 * @param {number} max - The maximum value the vector length will be clamped to.
		 * @return {Vector3} A reference to this vector.
		 */
		clampLength( min, max ) {

			const length = this.length();

			return this.divideScalar( length || 1 ).multiplyScalar( clamp( length, min, max ) );

		}

		/**
		 * The components of this vector are rounded down to the nearest integer value.
		 *
		 * @return {Vector3} A reference to this vector.
		 */
		floor() {

			this.x = Math.floor( this.x );
			this.y = Math.floor( this.y );
			this.z = Math.floor( this.z );

			return this;

		}

		/**
		 * The components of this vector are rounded up to the nearest integer value.
		 *
		 * @return {Vector3} A reference to this vector.
		 */
		ceil() {

			this.x = Math.ceil( this.x );
			this.y = Math.ceil( this.y );
			this.z = Math.ceil( this.z );

			return this;

		}

		/**
		 * The components of this vector are rounded to the nearest integer value
		 *
		 * @return {Vector3} A reference to this vector.
		 */
		round() {

			this.x = Math.round( this.x );
			this.y = Math.round( this.y );
			this.z = Math.round( this.z );

			return this;

		}

		/**
		 * The components of this vector are rounded towards zero (up if negative,
		 * down if positive) to an integer value.
		 *
		 * @return {Vector3} A reference to this vector.
		 */
		roundToZero() {

			this.x = Math.trunc( this.x );
			this.y = Math.trunc( this.y );
			this.z = Math.trunc( this.z );

			return this;

		}

		/**
		 * Inverts this vector - i.e. sets x = -x, y = -y and z = -z.
		 *
		 * @return {Vector3} A reference to this vector.
		 */
		negate() {

			this.x = - this.x;
			this.y = - this.y;
			this.z = - this.z;

			return this;

		}

		/**
		 * Calculates the dot product of the given vector with this instance.
		 *
		 * @param {Vector3} v - The vector to compute the dot product with.
		 * @return {number} The result of the dot product.
		 */
		dot( v ) {

			return this.x * v.x + this.y * v.y + this.z * v.z;

		}

		// TODO lengthSquared?

		/**
		 * Computes the square of the Euclidean length (straight-line length) from
		 * (0, 0, 0) to (x, y, z). If you are comparing the lengths of vectors, you should
		 * compare the length squared instead as it is slightly more efficient to calculate.
		 *
		 * @return {number} The square length of this vector.
		 */
		lengthSq() {

			return this.x * this.x + this.y * this.y + this.z * this.z;

		}

		/**
		 * Computes the  Euclidean length (straight-line length) from (0, 0, 0) to (x, y, z).
		 *
		 * @return {number} The length of this vector.
		 */
		length() {

			return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

		}

		/**
		 * Computes the Manhattan length of this vector.
		 *
		 * @return {number} The length of this vector.
		 */
		manhattanLength() {

			return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

		}

		/**
		 * Converts this vector to a unit vector - that is, sets it equal to a vector
		 * with the same direction as this one, but with a vector length of `1`.
		 *
		 * @return {Vector3} A reference to this vector.
		 */
		normalize() {

			return this.divideScalar( this.length() || 1 );

		}

		/**
		 * Sets this vector to a vector with the same direction as this one, but
		 * with the specified length.
		 *
		 * @param {number} length - The new length of this vector.
		 * @return {Vector3} A reference to this vector.
		 */
		setLength( length ) {

			return this.normalize().multiplyScalar( length );

		}

		/**
		 * Linearly interpolates between the given vector and this instance, where
		 * alpha is the percent distance along the line - alpha = 0 will be this
		 * vector, and alpha = 1 will be the given one.
		 *
		 * @param {Vector3} v - The vector to interpolate towards.
		 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
		 * @return {Vector3} A reference to this vector.
		 */
		lerp( v, alpha ) {

			this.x += ( v.x - this.x ) * alpha;
			this.y += ( v.y - this.y ) * alpha;
			this.z += ( v.z - this.z ) * alpha;

			return this;

		}

		/**
		 * Linearly interpolates between the given vectors, where alpha is the percent
		 * distance along the line - alpha = 0 will be first vector, and alpha = 1 will
		 * be the second one. The result is stored in this instance.
		 *
		 * @param {Vector3} v1 - The first vector.
		 * @param {Vector3} v2 - The second vector.
		 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
		 * @return {Vector3} A reference to this vector.
		 */
		lerpVectors( v1, v2, alpha ) {

			this.x = v1.x + ( v2.x - v1.x ) * alpha;
			this.y = v1.y + ( v2.y - v1.y ) * alpha;
			this.z = v1.z + ( v2.z - v1.z ) * alpha;

			return this;

		}

		/**
		 * Calculates the cross product of the given vector with this instance.
		 *
		 * @param {Vector3} v - The vector to compute the cross product with.
		 * @return {Vector3} The result of the cross product.
		 */
		cross( v ) {

			return this.crossVectors( this, v );

		}

		/**
		 * Calculates the cross product of the given vectors and stores the result
		 * in this instance.
		 *
		 * @param {Vector3} a - The first vector.
		 * @param {Vector3} b - The second vector.
		 * @return {Vector3} A reference to this vector.
		 */
		crossVectors( a, b ) {

			const ax = a.x, ay = a.y, az = a.z;
			const bx = b.x, by = b.y, bz = b.z;

			this.x = ay * bz - az * by;
			this.y = az * bx - ax * bz;
			this.z = ax * by - ay * bx;

			return this;

		}

		/**
		 * Projects this vector onto the given one.
		 *
		 * @param {Vector3} v - The vector to project to.
		 * @return {Vector3} A reference to this vector.
		 */
		projectOnVector( v ) {

			const denominator = v.lengthSq();

			if ( denominator === 0 ) return this.set( 0, 0, 0 );

			const scalar = v.dot( this ) / denominator;

			return this.copy( v ).multiplyScalar( scalar );

		}

		/**
		 * Projects this vector onto a plane by subtracting this
		 * vector projected onto the plane's normal from this vector.
		 *
		 * @param {Vector3} planeNormal - The plane normal.
		 * @return {Vector3} A reference to this vector.
		 */
		projectOnPlane( planeNormal ) {

			_vector$c.copy( this ).projectOnVector( planeNormal );

			return this.sub( _vector$c );

		}

		/**
		 * Reflects this vector off a plane orthogonal to the given normal vector.
		 *
		 * @param {Vector3} normal - The (normalized) normal vector.
		 * @return {Vector3} A reference to this vector.
		 */
		reflect( normal ) {

			return this.sub( _vector$c.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

		}
		/**
		 * Returns the angle between the given vector and this instance in radians.
		 *
		 * @param {Vector3} v - The vector to compute the angle with.
		 * @return {number} The angle in radians.
		 */
		angleTo( v ) {

			const denominator = Math.sqrt( this.lengthSq() * v.lengthSq() );

			if ( denominator === 0 ) return Math.PI / 2;

			const theta = this.dot( v ) / denominator;

			// clamp, to handle numerical problems

			return Math.acos( clamp( theta, - 1, 1 ) );

		}

		/**
		 * Computes the distance from the given vector to this instance.
		 *
		 * @param {Vector3} v - The vector to compute the distance to.
		 * @return {number} The distance.
		 */
		distanceTo( v ) {

			return Math.sqrt( this.distanceToSquared( v ) );

		}

		/**
		 * Computes the squared distance from the given vector to this instance.
		 * If you are just comparing the distance with another distance, you should compare
		 * the distance squared instead as it is slightly more efficient to calculate.
		 *
		 * @param {Vector3} v - The vector to compute the squared distance to.
		 * @return {number} The squared distance.
		 */
		distanceToSquared( v ) {

			const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

			return dx * dx + dy * dy + dz * dz;

		}

		/**
		 * Computes the Manhattan distance from the given vector to this instance.
		 *
		 * @param {Vector3} v - The vector to compute the Manhattan distance to.
		 * @return {number} The Manhattan distance.
		 */
		manhattanDistanceTo( v ) {

			return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y ) + Math.abs( this.z - v.z );

		}

		/**
		 * Sets the vector components from the given spherical coordinates.
		 *
		 * @param {Spherical} s - The spherical coordinates.
		 * @return {Vector3} A reference to this vector.
		 */
		setFromSpherical( s ) {

			return this.setFromSphericalCoords( s.radius, s.phi, s.theta );

		}

		/**
		 * Sets the vector components from the given spherical coordinates.
		 *
		 * @param {number} radius - The radius.
		 * @param {number} phi - The phi angle in radians.
		 * @param {number} theta - The theta angle in radians.
		 * @return {Vector3} A reference to this vector.
		 */
		setFromSphericalCoords( radius, phi, theta ) {

			const sinPhiRadius = Math.sin( phi ) * radius;

			this.x = sinPhiRadius * Math.sin( theta );
			this.y = Math.cos( phi ) * radius;
			this.z = sinPhiRadius * Math.cos( theta );

			return this;

		}

		/**
		 * Sets the vector components from the given cylindrical coordinates.
		 *
		 * @param {Cylindrical} c - The cylindrical coordinates.
		 * @return {Vector3} A reference to this vector.
		 */
		setFromCylindrical( c ) {

			return this.setFromCylindricalCoords( c.radius, c.theta, c.y );

		}

		/**
		 * Sets the vector components from the given cylindrical coordinates.
		 *
		 * @param {number} radius - The radius.
		 * @param {number} theta - The theta angle in radians.
		 * @param {number} y - The y value.
		 * @return {Vector3} A reference to this vector.
		 */
		setFromCylindricalCoords( radius, theta, y ) {

			this.x = radius * Math.sin( theta );
			this.y = y;
			this.z = radius * Math.cos( theta );

			return this;

		}

		/**
		 * Sets the vector components to the position elements of the
		 * given transformation matrix.
		 *
		 * @param {Matrix4} m - The 4x4 matrix.
		 * @return {Vector3} A reference to this vector.
		 */
		setFromMatrixPosition( m ) {

			const e = m.elements;

			this.x = e[ 12 ];
			this.y = e[ 13 ];
			this.z = e[ 14 ];

			return this;

		}

		/**
		 * Sets the vector components to the scale elements of the
		 * given transformation matrix.
		 *
		 * @param {Matrix4} m - The 4x4 matrix.
		 * @return {Vector3} A reference to this vector.
		 */
		setFromMatrixScale( m ) {

			const sx = this.setFromMatrixColumn( m, 0 ).length();
			const sy = this.setFromMatrixColumn( m, 1 ).length();
			const sz = this.setFromMatrixColumn( m, 2 ).length();

			this.x = sx;
			this.y = sy;
			this.z = sz;

			return this;

		}

		/**
		 * Sets the vector components from the specified matrix column.
		 *
		 * @param {Matrix4} m - The 4x4 matrix.
		 * @param {number} index - The column index.
		 * @return {Vector3} A reference to this vector.
		 */
		setFromMatrixColumn( m, index ) {

			return this.fromArray( m.elements, index * 4 );

		}

		/**
		 * Sets the vector components from the specified matrix column.
		 *
		 * @param {Matrix3} m - The 3x3 matrix.
		 * @param {number} index - The column index.
		 * @return {Vector3} A reference to this vector.
		 */
		setFromMatrix3Column( m, index ) {

			return this.fromArray( m.elements, index * 3 );

		}

		/**
		 * Sets the vector components from the given Euler angles.
		 *
		 * @param {Euler} e - The Euler angles to set.
		 * @return {Vector3} A reference to this vector.
		 */
		setFromEuler( e ) {

			this.x = e._x;
			this.y = e._y;
			this.z = e._z;

			return this;

		}

		/**
		 * Sets the vector components from the RGB components of the
		 * given color.
		 *
		 * @param {Color} c - The color to set.
		 * @return {Vector3} A reference to this vector.
		 */
		setFromColor( c ) {

			this.x = c.r;
			this.y = c.g;
			this.z = c.b;

			return this;

		}

		/**
		 * Returns `true` if this vector is equal with the given one.
		 *
		 * @param {Vector3} v - The vector to test for equality.
		 * @return {boolean} Whether this vector is equal with the given one.
		 */
		equals( v ) {

			return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

		}

		/**
		 * Sets this vector's x value to be `array[ offset ]`, y value to be `array[ offset + 1 ]`
		 * and z value to be `array[ offset + 2 ]`.
		 *
		 * @param {Array<number>} array - An array holding the vector component values.
		 * @param {number} [offset=0] - The offset into the array.
		 * @return {Vector3} A reference to this vector.
		 */
		fromArray( array, offset = 0 ) {

			this.x = array[ offset ];
			this.y = array[ offset + 1 ];
			this.z = array[ offset + 2 ];

			return this;

		}

		/**
		 * Writes the components of this vector to the given array. If no array is provided,
		 * the method returns a new instance.
		 *
		 * @param {Array<number>} [array=[]] - The target array holding the vector components.
		 * @param {number} [offset=0] - Index of the first element in the array.
		 * @return {Array<number>} The vector components.
		 */
		toArray( array = [], offset = 0 ) {

			array[ offset ] = this.x;
			array[ offset + 1 ] = this.y;
			array[ offset + 2 ] = this.z;

			return array;

		}

		/**
		 * Sets the components of this vector from the given buffer attribute.
		 *
		 * @param {BufferAttribute} attribute - The buffer attribute holding vector data.
		 * @param {number} index - The index into the attribute.
		 * @return {Vector3} A reference to this vector.
		 */
		fromBufferAttribute( attribute, index ) {

			this.x = attribute.getX( index );
			this.y = attribute.getY( index );
			this.z = attribute.getZ( index );

			return this;

		}

		/**
		 * Sets each component of this vector to a pseudo-random value between `0` and
		 * `1`, excluding `1`.
		 *
		 * @return {Vector3} A reference to this vector.
		 */
		random() {

			this.x = Math.random();
			this.y = Math.random();
			this.z = Math.random();

			return this;

		}

		/**
		 * Sets this vector to a uniformly random point on a unit sphere.
		 *
		 * @return {Vector3} A reference to this vector.
		 */
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

	/**
	 * Represents a 3x3 matrix.
	 *
	 * A Note on Row-Major and Column-Major Ordering:
	 *
	 * The constructor and {@link Matrix3#set} method take arguments in
	 * [row-major]{@link https://en.wikipedia.org/wiki/Row-_and_column-major_order#Column-major_order}
	 * order, while internally they are stored in the {@link Matrix3#elements} array in column-major order.
	 * This means that calling:
	 * ```js
	 * const m = new THREE.Matrix();
	 * m.set( 11, 12, 13,
	 *        21, 22, 23,
	 *        31, 32, 33 );
	 * ```
	 * will result in the elements array containing:
	 * ```js
	 * m.elements = [ 11, 21, 31,
	 *                12, 22, 32,
	 *                13, 23, 33 ];
	 * ```
	 * and internally all calculations are performed using column-major ordering.
	 * However, as the actual ordering makes no difference mathematically and
	 * most people are used to thinking about matrices in row-major order, the
	 * three.js documentation shows matrices in row-major order. Just bear in
	 * mind that if you are reading the source code, you'll have to take the
	 * transpose of any matrices outlined here to make sense of the calculations.
	 */
	class Matrix3 {

		/**
		 * Constructs a new 3x3 matrix. The arguments are supposed to be
		 * in row-major order. If no arguments are provided, the constructor
		 * initializes the matrix as an identity matrix.
		 *
		 * @param {number} [n11] - 1-1 matrix element.
		 * @param {number} [n12] - 1-2 matrix element.
		 * @param {number} [n13] - 1-3 matrix element.
		 * @param {number} [n21] - 2-1 matrix element.
		 * @param {number} [n22] - 2-2 matrix element.
		 * @param {number} [n23] - 2-3 matrix element.
		 * @param {number} [n31] - 3-1 matrix element.
		 * @param {number} [n32] - 3-2 matrix element.
		 * @param {number} [n33] - 3-3 matrix element.
		 */
		constructor( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {

			/**
			 * This flag can be used for type testing.
			 *
			 * @type {boolean}
			 * @readonly
			 * @default true
			 */
			Matrix3.prototype.isMatrix3 = true;

			/**
			 * A column-major list of matrix values.
			 *
			 * @type {Array<number>}
			 */
			this.elements = [

				1, 0, 0,
				0, 1, 0,
				0, 0, 1

			];

			if ( n11 !== undefined ) {

				this.set( n11, n12, n13, n21, n22, n23, n31, n32, n33 );

			}

		}

		/**
		 * Sets the elements of the matrix.The arguments are supposed to be
		 * in row-major order.
		 *
		 * @param {number} [n11] - 1-1 matrix element.
		 * @param {number} [n12] - 1-2 matrix element.
		 * @param {number} [n13] - 1-3 matrix element.
		 * @param {number} [n21] - 2-1 matrix element.
		 * @param {number} [n22] - 2-2 matrix element.
		 * @param {number} [n23] - 2-3 matrix element.
		 * @param {number} [n31] - 3-1 matrix element.
		 * @param {number} [n32] - 3-2 matrix element.
		 * @param {number} [n33] - 3-3 matrix element.
		 * @return {Matrix3} A reference to this matrix.
		 */
		set( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {

			const te = this.elements;

			te[ 0 ] = n11; te[ 1 ] = n21; te[ 2 ] = n31;
			te[ 3 ] = n12; te[ 4 ] = n22; te[ 5 ] = n32;
			te[ 6 ] = n13; te[ 7 ] = n23; te[ 8 ] = n33;

			return this;

		}

		/**
		 * Sets this matrix to the 3x3 identity matrix.
		 *
		 * @return {Matrix3} A reference to this matrix.
		 */
		identity() {

			this.set(

				1, 0, 0,
				0, 1, 0,
				0, 0, 1

			);

			return this;

		}

		/**
		 * Copies the values of the given matrix to this instance.
		 *
		 * @param {Matrix3} m - The matrix to copy.
		 * @return {Matrix3} A reference to this matrix.
		 */
		copy( m ) {

			const te = this.elements;
			const me = m.elements;

			te[ 0 ] = me[ 0 ]; te[ 1 ] = me[ 1 ]; te[ 2 ] = me[ 2 ];
			te[ 3 ] = me[ 3 ]; te[ 4 ] = me[ 4 ]; te[ 5 ] = me[ 5 ];
			te[ 6 ] = me[ 6 ]; te[ 7 ] = me[ 7 ]; te[ 8 ] = me[ 8 ];

			return this;

		}

		/**
		 * Extracts the basis of this matrix into the three axis vectors provided.
		 *
		 * @param {Vector3} xAxis - The basis's x axis.
		 * @param {Vector3} yAxis - The basis's y axis.
		 * @param {Vector3} zAxis - The basis's z axis.
		 * @return {Matrix3} A reference to this matrix.
		 */
		extractBasis( xAxis, yAxis, zAxis ) {

			xAxis.setFromMatrix3Column( this, 0 );
			yAxis.setFromMatrix3Column( this, 1 );
			zAxis.setFromMatrix3Column( this, 2 );

			return this;

		}

		/**
		 * Set this matrix to the upper 3x3 matrix of the given 4x4 matrix.
		 *
		 * @param {Matrix4} m - The 4x4 matrix.
		 * @return {Matrix3} A reference to this matrix.
		 */
		setFromMatrix4( m ) {

			const me = m.elements;

			this.set(

				me[ 0 ], me[ 4 ], me[ 8 ],
				me[ 1 ], me[ 5 ], me[ 9 ],
				me[ 2 ], me[ 6 ], me[ 10 ]

			);

			return this;

		}

		/**
		 * Post-multiplies this matrix by the given 3x3 matrix.
		 *
		 * @param {Matrix3} m - The matrix to multiply with.
		 * @return {Matrix3} A reference to this matrix.
		 */
		multiply( m ) {

			return this.multiplyMatrices( this, m );

		}

		/**
		 * Pre-multiplies this matrix by the given 3x3 matrix.
		 *
		 * @param {Matrix3} m - The matrix to multiply with.
		 * @return {Matrix3} A reference to this matrix.
		 */
		premultiply( m ) {

			return this.multiplyMatrices( m, this );

		}

		/**
		 * Multiples the given 3x3 matrices and stores the result
		 * in this matrix.
		 *
		 * @param {Matrix3} a - The first matrix.
		 * @param {Matrix3} b - The second matrix.
		 * @return {Matrix3} A reference to this matrix.
		 */
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

		/**
		 * Multiplies every component of the matrix by the given scalar.
		 *
		 * @param {number} s - The scalar.
		 * @return {Matrix3} A reference to this matrix.
		 */
		multiplyScalar( s ) {

			const te = this.elements;

			te[ 0 ] *= s; te[ 3 ] *= s; te[ 6 ] *= s;
			te[ 1 ] *= s; te[ 4 ] *= s; te[ 7 ] *= s;
			te[ 2 ] *= s; te[ 5 ] *= s; te[ 8 ] *= s;

			return this;

		}

		/**
		 * Computes and returns the determinant of this matrix.
		 *
		 * @return {number} The determinant.
		 */
		determinant() {

			const te = this.elements;

			const a = te[ 0 ], b = te[ 1 ], c = te[ 2 ],
				d = te[ 3 ], e = te[ 4 ], f = te[ 5 ],
				g = te[ 6 ], h = te[ 7 ], i = te[ 8 ];

			return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;

		}

		/**
		 * Inverts this matrix, using the [analytic method]{@link https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution}.
		 * You can not invert with a determinant of zero. If you attempt this, the method produces
		 * a zero matrix instead.
		 *
		 * @return {Matrix3} A reference to this matrix.
		 */
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

		/**
		 * Transposes this matrix in place.
		 *
		 * @return {Matrix3} A reference to this matrix.
		 */
		transpose() {

			let tmp;
			const m = this.elements;

			tmp = m[ 1 ]; m[ 1 ] = m[ 3 ]; m[ 3 ] = tmp;
			tmp = m[ 2 ]; m[ 2 ] = m[ 6 ]; m[ 6 ] = tmp;
			tmp = m[ 5 ]; m[ 5 ] = m[ 7 ]; m[ 7 ] = tmp;

			return this;

		}

		/**
		 * Computes the normal matrix which is the inverse transpose of the upper
		 * left 3x3 portion of the given 4x4 matrix.
		 *
		 * @param {Matrix4} matrix4 - The 4x4 matrix.
		 * @return {Matrix3} A reference to this matrix.
		 */
		getNormalMatrix( matrix4 ) {

			return this.setFromMatrix4( matrix4 ).invert().transpose();

		}

		/**
		 * Transposes this matrix into the supplied array, and returns itself unchanged.
		 *
		 * @param {Array<number>} r - An array to store the transposed matrix elements.
		 * @return {Matrix3} A reference to this matrix.
		 */
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

		/**
		 * Sets the UV transform matrix from offset, repeat, rotation, and center.
		 *
		 * @param {number} tx - Offset x.
		 * @param {number} ty - Offset y.
		 * @param {number} sx - Repeat x.
		 * @param {number} sy - Repeat y.
		 * @param {number} rotation - Rotation, in radians. Positive values rotate counterclockwise.
		 * @param {number} cx - Center x of rotation.
		 * @param {number} cy - Center y of rotation
		 * @return {Matrix3} A reference to this matrix.
		 */
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

		/**
		 * Scales this matrix with the given scalar values.
		 *
		 * @param {number} sx - The amount to scale in the X axis.
		 * @param {number} sy - The amount to scale in the Y axis.
		 * @return {Matrix3} A reference to this matrix.
		 */
		scale( sx, sy ) {

			this.premultiply( _m3.makeScale( sx, sy ) );

			return this;

		}

		/**
		 * Rotates this matrix by the given angle.
		 *
		 * @param {number} theta - The rotation in radians.
		 * @return {Matrix3} A reference to this matrix.
		 */
		rotate( theta ) {

			this.premultiply( _m3.makeRotation( - theta ) );

			return this;

		}

		/**
		 * Translates this matrix by the given scalar values.
		 *
		 * @param {number} tx - The amount to translate in the X axis.
		 * @param {number} ty - The amount to translate in the Y axis.
		 * @return {Matrix3} A reference to this matrix.
		 */
		translate( tx, ty ) {

			this.premultiply( _m3.makeTranslation( tx, ty ) );

			return this;

		}

		// for 2D Transforms

		/**
		 * Sets this matrix as a 2D translation transform.
		 *
		 * @param {number|Vector2} x - The amount to translate in the X axis or alternatively a translation vector.
		 * @param {number} y - The amount to translate in the Y axis.
		 * @return {Matrix3} A reference to this matrix.
		 */
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

		/**
		 * Sets this matrix as a 2D rotational transformation.
		 *
		 * @param {number} theta - The rotation in radians.
		 * @return {Matrix3} A reference to this matrix.
		 */
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

		/**
		 * Sets this matrix as a 2D scale transform.
		 *
		 * @param {number} x - The amount to scale in the X axis.
		 * @param {number} y - The amount to scale in the Y axis.
		 * @return {Matrix3} A reference to this matrix.
		 */
		makeScale( x, y ) {

			this.set(

				x, 0, 0,
				0, y, 0,
				0, 0, 1

			);

			return this;

		}

		/**
		 * Returns `true` if this matrix is equal with the given one.
		 *
		 * @param {Matrix3} matrix - The matrix to test for equality.
		 * @return {boolean} Whether this matrix is equal with the given one.
		 */
		equals( matrix ) {

			const te = this.elements;
			const me = matrix.elements;

			for ( let i = 0; i < 9; i ++ ) {

				if ( te[ i ] !== me[ i ] ) return false;

			}

			return true;

		}

		/**
		 * Sets the elements of the matrix from the given array.
		 *
		 * @param {Array<number>} array - The matrix elements in column-major order.
		 * @param {number} [offset=0] - Index of the first element in the array.
		 * @return {Matrix3} A reference to this matrix.
		 */
		fromArray( array, offset = 0 ) {

			for ( let i = 0; i < 9; i ++ ) {

				this.elements[ i ] = array[ i + offset ];

			}

			return this;

		}

		/**
		 * Writes the elements of this matrix to the given array. If no array is provided,
		 * the method returns a new instance.
		 *
		 * @param {Array<number>} [array=[]] - The target array holding the matrix elements in column-major order.
		 * @param {number} [offset=0] - Index of the first element in the array.
		 * @return {Array<number>} The matrix elements in column-major order.
		 */
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

		/**
		 * Returns a matrix with copied values from this instance.
		 *
		 * @return {Matrix3} A clone of this instance.
		 */
		clone() {

			return new this.constructor().fromArray( this.elements );

		}

	}

	const _m3 = /*@__PURE__*/ new Matrix3();

	function createElementNS( name ) {

		return document.createElementNS( 'http://www.w3.org/1999/xhtml', name );

	}

	const _cache = {};

	function warnOnce( message ) {

		if ( message in _cache ) return;

		_cache[ message ] = true;

		console.warn( message );

	}

	const LINEAR_REC709_TO_XYZ = /*@__PURE__*/ new Matrix3().set(
		0.4123908, 0.3575843, 0.1804808,
		0.2126390, 0.7151687, 0.0721923,
		0.0193308, 0.1191948, 0.9505322
	);

	const XYZ_TO_LINEAR_REC709 = /*@__PURE__*/ new Matrix3().set(
		3.2409699, - 1.5373832, - 0.4986108,
		- 0.9692436, 1.8759675, 0.0415551,
		0.0556301, - 0.203977, 1.0569715
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

			workingToColorSpace: function ( color, targetColorSpace ) {

				return this.convert( color, this.workingColorSpace, targetColorSpace );

			},

			colorSpaceToWorking: function ( color, sourceColorSpace ) {

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

			},

			// Deprecated

			fromWorkingColorSpace: function ( color, targetColorSpace ) {

				warnOnce( 'THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().' ); // @deprecated, r177

				return ColorManagement.workingToColorSpace( color, targetColorSpace );

			},

			toWorkingColorSpace: function ( color, sourceColorSpace ) {

				warnOnce( 'THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().' ); // @deprecated, r177

				return ColorManagement.colorSpaceToWorking( color, sourceColorSpace );

			},

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

	/**
	 * A class containing utility functions for images.
	 *
	 * @hideconstructor
	 */
	class ImageUtils {

		/**
		 * Returns a data URI containing a representation of the given image.
		 *
		 * @param {(HTMLImageElement|HTMLCanvasElement)} image - The image object.
		 * @param {string} [type='image/png'] - Indicates the image format.
		 * @return {string} The data URI.
		 */
		static getDataURL( image, type = 'image/png' ) {

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

			return canvas.toDataURL( type );

		}

		/**
		 * Converts the given sRGB image data to linear color space.
		 *
		 * @param {(HTMLImageElement|HTMLCanvasElement|ImageBitmap|Object)} image - The image object.
		 * @return {HTMLCanvasElement|Object} The converted image.
		 */
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

	/**
	 * Represents the data source of a texture.
	 *
	 * The main purpose of this class is to decouple the data definition from the texture
	 * definition so the same data can be used with multiple texture instances.
	 */
	class Source {

		/**
		 * Constructs a new video texture.
		 *
		 * @param {any} [data=null] - The data definition of a texture.
		 */
		constructor( data = null ) {

			/**
			 * This flag can be used for type testing.
			 *
			 * @type {boolean}
			 * @readonly
			 * @default true
			 */
			this.isSource = true;

			/**
			 * The ID of the source.
			 *
			 * @name Source#id
			 * @type {number}
			 * @readonly
			 */
			Object.defineProperty( this, 'id', { value: _sourceId ++ } );

			/**
			 * The UUID of the source.
			 *
			 * @type {string}
			 * @readonly
			 */
			this.uuid = generateUUID();

			/**
			 * The data definition of a texture.
			 *
			 * @type {any}
			 */
			this.data = data;

			/**
			 * This property is only relevant when {@link Source#needsUpdate} is set to `true` and
			 * provides more control on how texture data should be processed. When `dataReady` is set
			 * to `false`, the engine performs the memory allocation (if necessary) but does not transfer
			 * the data into the GPU memory.
			 *
			 * @type {boolean}
			 * @default true
			 */
			this.dataReady = true;

			/**
			 * This starts at `0` and counts how many times {@link Source#needsUpdate} is set to `true`.
			 *
			 * @type {number}
			 * @readonly
			 * @default 0
			 */
			this.version = 0;

		}

		getSize( target ) {

			const data = this.data;

			if ( data instanceof HTMLVideoElement ) {

				target.set( data.videoWidth, data.videoHeight );

			} else if ( data !== null ) {

				target.set( data.width, data.height, data.depth || 0 );

			} else {

				target.set( 0, 0, 0 );

			}

			return target;

		}

		/**
		 * When the property is set to `true`, the engine allocates the memory
		 * for the texture (if necessary) and triggers the actual texture upload
		 * to the GPU next time the source is used.
		 *
		 * @type {boolean}
		 * @default false
		 * @param {boolean} value
		 */
		set needsUpdate( value ) {

			if ( value === true ) this.version ++;

		}

		/**
		 * Serializes the source into JSON.
		 *
		 * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
		 * @return {Object} A JSON object representing the serialized source.
		 * @see {@link ObjectLoader#parse}
		 */
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

	const _tempVec3 = /*@__PURE__*/ new Vector3();

	/**
	 * Base class for all textures.
	 *
	 * Note: After the initial use of a texture, its dimensions, format, and type
	 * cannot be changed. Instead, call {@link Texture#dispose} on the texture and instantiate a new one.
	 *
	 * @augments EventDispatcher
	 */
	class Texture extends EventDispatcher {

		/**
		 * Constructs a new texture.
		 *
		 * @param {?Object} [image=Texture.DEFAULT_IMAGE] - The image holding the texture data.
		 * @param {number} [mapping=Texture.DEFAULT_MAPPING] - The texture mapping.
		 * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
		 * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
		 * @param {number} [magFilter=LinearFilter] - The mag filter value.
		 * @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
		 * @param {number} [format=RGBAFormat] - The texture format.
		 * @param {number} [type=UnsignedByteType] - The texture type.
		 * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
		 * @param {string} [colorSpace=NoColorSpace] - The color space.
		 */
		constructor( image = Texture.DEFAULT_IMAGE, mapping = Texture.DEFAULT_MAPPING, wrapS = ClampToEdgeWrapping, wrapT = ClampToEdgeWrapping, magFilter = LinearFilter, minFilter = LinearMipmapLinearFilter, format = RGBAFormat, type = UnsignedByteType, anisotropy = Texture.DEFAULT_ANISOTROPY, colorSpace = NoColorSpace ) {

			super();

			/**
			 * This flag can be used for type testing.
			 *
			 * @type {boolean}
			 * @readonly
			 * @default true
			 */
			this.isTexture = true;

			/**
			 * The ID of the texture.
			 *
			 * @name Texture#id
			 * @type {number}
			 * @readonly
			 */
			Object.defineProperty( this, 'id', { value: _textureId ++ } );

			/**
			 * The UUID of the material.
			 *
			 * @type {string}
			 * @readonly
			 */
			this.uuid = generateUUID();

			/**
			 * The name of the material.
			 *
			 * @type {string}
			 */
			this.name = '';

			/**
			 * The data definition of a texture. A reference to the data source can be
			 * shared across textures. This is often useful in context of spritesheets
			 * where multiple textures render the same data but with different texture
			 * transformations.
			 *
			 * @type {Source}
			 */
			this.source = new Source( image );

			/**
			 * An array holding user-defined mipmaps.
			 *
			 * @type {Array<Object>}
			 */
			this.mipmaps = [];

			/**
			 * How the texture is applied to the object. The value `UVMapping`
			 * is the default, where texture or uv coordinates are used to apply the map.
			 *
			 * @type {(UVMapping|CubeReflectionMapping|CubeRefractionMapping|EquirectangularReflectionMapping|EquirectangularRefractionMapping|CubeUVReflectionMapping)}
			 * @default UVMapping
			*/
			this.mapping = mapping;

			/**
			 * Lets you select the uv attribute to map the texture to. `0` for `uv`,
			 * `1` for `uv1`, `2` for `uv2` and `3` for `uv3`.
			 *
			 * @type {number}
			 * @default 0
			 */
			this.channel = 0;

			/**
			 * This defines how the texture is wrapped horizontally and corresponds to
			 * *U* in UV mapping.
			 *
			 * @type {(RepeatWrapping|ClampToEdgeWrapping|MirroredRepeatWrapping)}
			 * @default ClampToEdgeWrapping
			 */
			this.wrapS = wrapS;

			/**
			 * This defines how the texture is wrapped horizontally and corresponds to
			 * *V* in UV mapping.
			 *
			 * @type {(RepeatWrapping|ClampToEdgeWrapping|MirroredRepeatWrapping)}
			 * @default ClampToEdgeWrapping
			 */
			this.wrapT = wrapT;

			/**
			 * How the texture is sampled when a texel covers more than one pixel.
			 *
			 * @type {(NearestFilter|NearestMipmapNearestFilter|NearestMipmapLinearFilter|LinearFilter|LinearMipmapNearestFilter|LinearMipmapLinearFilter)}
			 * @default LinearFilter
			 */
			this.magFilter = magFilter;

			/**
			 * How the texture is sampled when a texel covers less than one pixel.
			 *
			 * @type {(NearestFilter|NearestMipmapNearestFilter|NearestMipmapLinearFilter|LinearFilter|LinearMipmapNearestFilter|LinearMipmapLinearFilter)}
			 * @default LinearMipmapLinearFilter
			 */
			this.minFilter = minFilter;

			/**
			 * The number of samples taken along the axis through the pixel that has the
			 * highest density of texels. By default, this value is `1`. A higher value
			 * gives a less blurry result than a basic mipmap, at the cost of more
			 * texture samples being used.
			 *
			 * @type {number}
			 * @default 0
			 */
			this.anisotropy = anisotropy;

			/**
			 * The format of the texture.
			 *
			 * @type {number}
			 * @default RGBAFormat
			 */
			this.format = format;

			/**
			 * The default internal format is derived from {@link Texture#format} and {@link Texture#type} and
			 * defines how the texture data is going to be stored on the GPU.
			 *
			 * This property allows to overwrite the default format.
			 *
			 * @type {?string}
			 * @default null
			 */
			this.internalFormat = null;

			/**
			 * The data type of the texture.
			 *
			 * @type {number}
			 * @default UnsignedByteType
			 */
			this.type = type;

			/**
			 * How much a single repetition of the texture is offset from the beginning,
			 * in each direction U and V. Typical range is `0.0` to `1.0`.
			 *
			 * @type {Vector2}
			 * @default (0,0)
			 */
			this.offset = new Vector2( 0, 0 );

			/**
			 * How many times the texture is repeated across the surface, in each
			 * direction U and V. If repeat is set greater than `1` in either direction,
			 * the corresponding wrap parameter should also be set to `RepeatWrapping`
			 * or `MirroredRepeatWrapping` to achieve the desired tiling effect.
			 *
			 * @type {Vector2}
			 * @default (1,1)
			 */
			this.repeat = new Vector2( 1, 1 );

			/**
			 * The point around which rotation occurs. A value of `(0.5, 0.5)` corresponds
			 * to the center of the texture. Default is `(0, 0)`, the lower left.
			 *
			 * @type {Vector2}
			 * @default (0,0)
			 */
			this.center = new Vector2( 0, 0 );

			/**
			 * How much the texture is rotated around the center point, in radians.
			 * Positive values are counter-clockwise.
			 *
			 * @type {number}
			 * @default 0
			 */
			this.rotation = 0;

			/**
			 * Whether to update the texture's uv-transformation {@link Texture#matrix}
			 * from the properties {@link Texture#offset}, {@link Texture#repeat},
			 * {@link Texture#rotation}, and {@link Texture#center}.
			 *
			 * Set this to `false` if you are specifying the uv-transform matrix directly.
			 *
			 * @type {boolean}
			 * @default true
			 */
			this.matrixAutoUpdate = true;

			/**
			 * The uv-transformation matrix of the texture.
			 *
			 * @type {Matrix3}
			 */
			this.matrix = new Matrix3();

			/**
			 * Whether to generate mipmaps (if possible) for a texture.
			 *
			 * Set this to `false` if you are creating mipmaps manually.
			 *
			 * @type {boolean}
			 * @default true
			 */
			this.generateMipmaps = true;

			/**
			 * If set to `true`, the alpha channel, if present, is multiplied into the
			 * color channels when the texture is uploaded to the GPU.
			 *
			 * Note that this property has no effect when using `ImageBitmap`. You need to
			 * configure premultiply alpha on bitmap creation instead.
			 *
			 * @type {boolean}
			 * @default false
			 */
			this.premultiplyAlpha = false;

			/**
			 * If set to `true`, the texture is flipped along the vertical axis when
			 * uploaded to the GPU.
			 *
			 * Note that this property has no effect when using `ImageBitmap`. You need to
			 * configure the flip on bitmap creation instead.
			 *
			 * @type {boolean}
			 * @default true
			 */
			this.flipY = true;

			/**
			 * Specifies the alignment requirements for the start of each pixel row in memory.
			 * The allowable values are `1` (byte-alignment), `2` (rows aligned to even-numbered bytes),
			 * `4` (word-alignment), and `8` (rows start on double-word boundaries).
			 *
			 * @type {number}
			 * @default 4
			 */
			this.unpackAlignment = 4;	// valid values: 1, 2, 4, 8 (see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)

			/**
			 * Textures containing color data should be annotated with `SRGBColorSpace` or `LinearSRGBColorSpace`.
			 *
			 * @type {string}
			 * @default NoColorSpace
			 */
			this.colorSpace = colorSpace;

			/**
			 * An object that can be used to store custom data about the texture. It
			 * should not hold references to functions as these will not be cloned.
			 *
			 * @type {Object}
			 */
			this.userData = {};

			/**
			 * This can be used to only update a subregion or specific rows of the texture (for example, just the
			 * first 3 rows). Use the `addUpdateRange()` function to add ranges to this array.
			 *
			 * @type {Array<Object>}
			 */
			this.updateRanges = [];

			/**
			 * This starts at `0` and counts how many times {@link Texture#needsUpdate} is set to `true`.
			 *
			 * @type {number}
			 * @readonly
			 * @default 0
			 */
			this.version = 0;

			/**
			 * A callback function, called when the texture is updated (e.g., when
			 * {@link Texture#needsUpdate} has been set to true and then the texture is used).
			 *
			 * @type {?Function}
			 * @default null
			 */
			this.onUpdate = null;

			/**
			 * An optional back reference to the textures render target.
			 *
			 * @type {?(RenderTarget|WebGLRenderTarget)}
			 * @default null
			 */
			this.renderTarget = null;

			/**
			 * Indicates whether a texture belongs to a render target or not.
			 *
			 * @type {boolean}
			 * @readonly
			 * @default false
			 */
			this.isRenderTargetTexture = false;

			/**
			 * Indicates if a texture should be handled like a texture array.
			 *
			 * @type {boolean}
			 * @readonly
			 * @default false
			 */
			this.isArrayTexture = image && image.depth && image.depth > 1 ? true : false;

			/**
			 * Indicates whether this texture should be processed by `PMREMGenerator` or not
			 * (only relevant for render target textures).
			 *
			 * @type {number}
			 * @readonly
			 * @default 0
			 */
			this.pmremVersion = 0;

		}

		/**
		 * The width of the texture in pixels.
		 */
		get width() {

			return this.source.getSize( _tempVec3 ).x;

		}

		/**
		 * The height of the texture in pixels.
		 */
		get height() {

			return this.source.getSize( _tempVec3 ).y;

		}

		/**
		 * The depth of the texture in pixels.
		 */
		get depth() {

			return this.source.getSize( _tempVec3 ).z;

		}

		/**
		 * The image object holding the texture data.
		 *
		 * @type {?Object}
		 */
		get image() {

			return this.source.data;

		}

		set image( value = null ) {

			this.source.data = value;

		}

		/**
		 * Updates the texture transformation matrix from the from the properties {@link Texture#offset},
		 * {@link Texture#repeat}, {@link Texture#rotation}, and {@link Texture#center}.
		 */
		updateMatrix() {

			this.matrix.setUvTransform( this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y );

		}

		/**
		 * Adds a range of data in the data texture to be updated on the GPU.
		 *
		 * @param {number} start - Position at which to start update.
		 * @param {number} count - The number of components to update.
		 */
		addUpdateRange( start, count ) {

			this.updateRanges.push( { start, count } );

		}

		/**
		 * Clears the update ranges.
		 */
		clearUpdateRanges() {

			this.updateRanges.length = 0;

		}

		/**
		 * Returns a new texture with copied values from this instance.
		 *
		 * @return {Texture} A clone of this instance.
		 */
		clone() {

			return new this.constructor().copy( this );

		}

		/**
		 * Copies the values of the given texture to this instance.
		 *
		 * @param {Texture} source - The texture to copy.
		 * @return {Texture} A reference to this instance.
		 */
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
			this.isArrayTexture = source.isArrayTexture;

			this.userData = JSON.parse( JSON.stringify( source.userData ) );

			this.needsUpdate = true;

			return this;

		}

		/**
		 * Sets this texture's properties based on `values`.
		 * @param {Object} values - A container with texture parameters.
		 */
		setValues( values ) {

			for ( const key in values ) {

				const newValue = values[ key ];

				if ( newValue === undefined ) {

					console.warn( `THREE.Texture.setValues(): parameter '${ key }' has value of undefined.` );
					continue;

				}

				const currentValue = this[ key ];

				if ( currentValue === undefined ) {

					console.warn( `THREE.Texture.setValues(): property '${ key }' does not exist.` );
					continue;

				}

				if ( ( currentValue && newValue ) && ( currentValue.isVector2 && newValue.isVector2 ) ) {

					currentValue.copy( newValue );

				} else if ( ( currentValue && newValue ) && ( currentValue.isVector3 && newValue.isVector3 ) ) {

					currentValue.copy( newValue );

				} else if ( ( currentValue && newValue ) && ( currentValue.isMatrix3 && newValue.isMatrix3 ) ) {

					currentValue.copy( newValue );

				} else {

					this[ key ] = newValue;

				}

			}

		}

		/**
		 * Serializes the texture into JSON.
		 *
		 * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
		 * @return {Object} A JSON object representing the serialized texture.
		 * @see {@link ObjectLoader#parse}
		 */
		toJSON( meta ) {

			const isRootObject = ( meta === undefined || typeof meta === 'string' );

			if ( ! isRootObject && meta.textures[ this.uuid ] !== undefined ) {

				return meta.textures[ this.uuid ];

			}

			const output = {

				metadata: {
					version: 4.7,
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

		/**
		 * Frees the GPU-related resources allocated by this instance. Call this
		 * method whenever this instance is no longer used in your app.
		 *
		 * @fires Texture#dispose
		 */
		dispose() {

			/**
			 * Fires when the texture has been disposed of.
			 *
			 * @event Texture#dispose
			 * @type {Object}
			 */
			this.dispatchEvent( { type: 'dispose' } );

		}

		/**
		 * Transforms the given uv vector with the textures uv transformation matrix.
		 *
		 * @param {Vector2} uv - The uv vector.
		 * @return {Vector2} The transformed uv vector.
		 */
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

		/**
		 * Setting this property to `true` indicates the engine the texture
		 * must be updated in the next render. This triggers a texture upload
		 * to the GPU and ensures correct texture parameter configuration.
		 *
		 * @type {boolean}
		 * @default false
		 * @param {boolean} value
		 */
		set needsUpdate( value ) {

			if ( value === true ) {

				this.version ++;
				this.source.needsUpdate = true;

			}

		}

		/**
		 * Setting this property to `true` indicates the engine the PMREM
		 * must be regenerated.
		 *
		 * @type {boolean}
		 * @default false
		 * @param {boolean} value
		 */
		set needsPMREMUpdate( value ) {

			if ( value === true ) {

				this.pmremVersion ++;

			}

		}

	}

	/**
	 * The default image for all textures.
	 *
	 * @static
	 * @type {?Image}
	 * @default null
	 */
	Texture.DEFAULT_IMAGE = null;

	/**
	 * The default mapping for all textures.
	 *
	 * @static
	 * @type {number}
	 * @default UVMapping
	 */
	Texture.DEFAULT_MAPPING = UVMapping;

	/**
	 * The default anisotropy value for all textures.
	 *
	 * @static
	 * @type {number}
	 * @default 1
	 */
	Texture.DEFAULT_ANISOTROPY = 1;

	/**
	 * Represents a 4x4 matrix.
	 *
	 * The most common use of a 4x4 matrix in 3D computer graphics is as a transformation matrix.
	 * For an introduction to transformation matrices as used in WebGL, check out [this tutorial]{@link https://www.opengl-tutorial.org/beginners-tutorials/tutorial-3-matrices}
	 *
	 * This allows a 3D vector representing a point in 3D space to undergo
	 * transformations such as translation, rotation, shear, scale, reflection,
	 * orthogonal or perspective projection and so on, by being multiplied by the
	 * matrix. This is known as `applying` the matrix to the vector.
	 *
	 * A Note on Row-Major and Column-Major Ordering:
	 *
	 * The constructor and {@link Matrix3#set} method take arguments in
	 * [row-major]{@link https://en.wikipedia.org/wiki/Row-_and_column-major_order#Column-major_order}
	 * order, while internally they are stored in the {@link Matrix3#elements} array in column-major order.
	 * This means that calling:
	 * ```js
	 * const m = new THREE.Matrix4();
	 * m.set( 11, 12, 13, 14,
	 *        21, 22, 23, 24,
	 *        31, 32, 33, 34,
	 *        41, 42, 43, 44 );
	 * ```
	 * will result in the elements array containing:
	 * ```js
	 * m.elements = [ 11, 21, 31, 41,
	 *                12, 22, 32, 42,
	 *                13, 23, 33, 43,
	 *                14, 24, 34, 44 ];
	 * ```
	 * and internally all calculations are performed using column-major ordering.
	 * However, as the actual ordering makes no difference mathematically and
	 * most people are used to thinking about matrices in row-major order, the
	 * three.js documentation shows matrices in row-major order. Just bear in
	 * mind that if you are reading the source code, you'll have to take the
	 * transpose of any matrices outlined here to make sense of the calculations.
	 */
	class Matrix4 {

		/**
		 * Constructs a new 4x4 matrix. The arguments are supposed to be
		 * in row-major order. If no arguments are provided, the constructor
		 * initializes the matrix as an identity matrix.
		 *
		 * @param {number} [n11] - 1-1 matrix element.
		 * @param {number} [n12] - 1-2 matrix element.
		 * @param {number} [n13] - 1-3 matrix element.
		 * @param {number} [n14] - 1-4 matrix element.
		 * @param {number} [n21] - 2-1 matrix element.
		 * @param {number} [n22] - 2-2 matrix element.
		 * @param {number} [n23] - 2-3 matrix element.
		 * @param {number} [n24] - 2-4 matrix element.
		 * @param {number} [n31] - 3-1 matrix element.
		 * @param {number} [n32] - 3-2 matrix element.
		 * @param {number} [n33] - 3-3 matrix element.
		 * @param {number} [n34] - 3-4 matrix element.
		 * @param {number} [n41] - 4-1 matrix element.
		 * @param {number} [n42] - 4-2 matrix element.
		 * @param {number} [n43] - 4-3 matrix element.
		 * @param {number} [n44] - 4-4 matrix element.
		 */
		constructor( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

			/**
			 * This flag can be used for type testing.
			 *
			 * @type {boolean}
			 * @readonly
			 * @default true
			 */
			Matrix4.prototype.isMatrix4 = true;

			/**
			 * A column-major list of matrix values.
			 *
			 * @type {Array<number>}
			 */
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

		/**
		 * Sets the elements of the matrix.The arguments are supposed to be
		 * in row-major order.
		 *
		 * @param {number} [n11] - 1-1 matrix element.
		 * @param {number} [n12] - 1-2 matrix element.
		 * @param {number} [n13] - 1-3 matrix element.
		 * @param {number} [n14] - 1-4 matrix element.
		 * @param {number} [n21] - 2-1 matrix element.
		 * @param {number} [n22] - 2-2 matrix element.
		 * @param {number} [n23] - 2-3 matrix element.
		 * @param {number} [n24] - 2-4 matrix element.
		 * @param {number} [n31] - 3-1 matrix element.
		 * @param {number} [n32] - 3-2 matrix element.
		 * @param {number} [n33] - 3-3 matrix element.
		 * @param {number} [n34] - 3-4 matrix element.
		 * @param {number} [n41] - 4-1 matrix element.
		 * @param {number} [n42] - 4-2 matrix element.
		 * @param {number} [n43] - 4-3 matrix element.
		 * @param {number} [n44] - 4-4 matrix element.
		 * @return {Matrix4} A reference to this matrix.
		 */
		set( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

			const te = this.elements;

			te[ 0 ] = n11; te[ 4 ] = n12; te[ 8 ] = n13; te[ 12 ] = n14;
			te[ 1 ] = n21; te[ 5 ] = n22; te[ 9 ] = n23; te[ 13 ] = n24;
			te[ 2 ] = n31; te[ 6 ] = n32; te[ 10 ] = n33; te[ 14 ] = n34;
			te[ 3 ] = n41; te[ 7 ] = n42; te[ 11 ] = n43; te[ 15 ] = n44;

			return this;

		}

		/**
		 * Sets this matrix to the 4x4 identity matrix.
		 *
		 * @return {Matrix4} A reference to this matrix.
		 */
		identity() {

			this.set(

				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1

			);

			return this;

		}

		/**
		 * Returns a matrix with copied values from this instance.
		 *
		 * @return {Matrix4} A clone of this instance.
		 */
		clone() {

			return new Matrix4().fromArray( this.elements );

		}

		/**
		 * Copies the values of the given matrix to this instance.
		 *
		 * @param {Matrix4} m - The matrix to copy.
		 * @return {Matrix4} A reference to this matrix.
		 */
		copy( m ) {

			const te = this.elements;
			const me = m.elements;

			te[ 0 ] = me[ 0 ]; te[ 1 ] = me[ 1 ]; te[ 2 ] = me[ 2 ]; te[ 3 ] = me[ 3 ];
			te[ 4 ] = me[ 4 ]; te[ 5 ] = me[ 5 ]; te[ 6 ] = me[ 6 ]; te[ 7 ] = me[ 7 ];
			te[ 8 ] = me[ 8 ]; te[ 9 ] = me[ 9 ]; te[ 10 ] = me[ 10 ]; te[ 11 ] = me[ 11 ];
			te[ 12 ] = me[ 12 ]; te[ 13 ] = me[ 13 ]; te[ 14 ] = me[ 14 ]; te[ 15 ] = me[ 15 ];

			return this;

		}

		/**
		 * Copies the translation component of the given matrix
		 * into this matrix's translation component.
		 *
		 * @param {Matrix4} m - The matrix to copy the translation component.
		 * @return {Matrix4} A reference to this matrix.
		 */
		copyPosition( m ) {

			const te = this.elements, me = m.elements;

			te[ 12 ] = me[ 12 ];
			te[ 13 ] = me[ 13 ];
			te[ 14 ] = me[ 14 ];

			return this;

		}

		/**
		 * Set the upper 3x3 elements of this matrix to the values of given 3x3 matrix.
		 *
		 * @param {Matrix3} m - The 3x3 matrix.
		 * @return {Matrix4} A reference to this matrix.
		 */
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

		/**
		 * Extracts the basis of this matrix into the three axis vectors provided.
		 *
		 * @param {Vector3} xAxis - The basis's x axis.
		 * @param {Vector3} yAxis - The basis's y axis.
		 * @param {Vector3} zAxis - The basis's z axis.
		 * @return {Matrix4} A reference to this matrix.
		 */
		extractBasis( xAxis, yAxis, zAxis ) {

			xAxis.setFromMatrixColumn( this, 0 );
			yAxis.setFromMatrixColumn( this, 1 );
			zAxis.setFromMatrixColumn( this, 2 );

			return this;

		}

		/**
		 * Sets the given basis vectors to this matrix.
		 *
		 * @param {Vector3} xAxis - The basis's x axis.
		 * @param {Vector3} yAxis - The basis's y axis.
		 * @param {Vector3} zAxis - The basis's z axis.
		 * @return {Matrix4} A reference to this matrix.
		 */
		makeBasis( xAxis, yAxis, zAxis ) {

			this.set(
				xAxis.x, yAxis.x, zAxis.x, 0,
				xAxis.y, yAxis.y, zAxis.y, 0,
				xAxis.z, yAxis.z, zAxis.z, 0,
				0, 0, 0, 1
			);

			return this;

		}

		/**
		 * Extracts the rotation component of the given matrix
		 * into this matrix's rotation component.
		 *
		 * Note: This method does not support reflection matrices.
		 *
		 * @param {Matrix4} m - The matrix.
		 * @return {Matrix4} A reference to this matrix.
		 */
		extractRotation( m ) {

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

		/**
		 * Sets the rotation component (the upper left 3x3 matrix) of this matrix to
		 * the rotation specified by the given Euler angles. The rest of
		 * the matrix is set to the identity. Depending on the {@link Euler#order},
		 * there are six possible outcomes. See [this page]{@link https://en.wikipedia.org/wiki/Euler_angles#Rotation_matrix}
		 * for a complete list.
		 *
		 * @param {Euler} euler - The Euler angles.
		 * @return {Matrix4} A reference to this matrix.
		 */
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

		/**
		 * Sets the rotation component of this matrix to the rotation specified by
		 * the given Quaternion as outlined [here]{@link https://en.wikipedia.org/wiki/Rotation_matrix#Quaternion}
		 * The rest of the matrix is set to the identity.
		 *
		 * @param {Quaternion} q - The Quaternion.
		 * @return {Matrix4} A reference to this matrix.
		 */
		makeRotationFromQuaternion( q ) {

			return this.compose( _zero, q, _one );

		}

		/**
		 * Sets the rotation component of the transformation matrix, looking from `eye` towards
		 * `target`, and oriented by the up-direction.
		 *
		 * @param {Vector3} eye - The eye vector.
		 * @param {Vector3} target - The target vector.
		 * @param {Vector3} up - The up vector.
		 * @return {Matrix4} A reference to this matrix.
		 */
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

		/**
		 * Post-multiplies this matrix by the given 4x4 matrix.
		 *
		 * @param {Matrix4} m - The matrix to multiply with.
		 * @return {Matrix4} A reference to this matrix.
		 */
		multiply( m ) {

			return this.multiplyMatrices( this, m );

		}

		/**
		 * Pre-multiplies this matrix by the given 4x4 matrix.
		 *
		 * @param {Matrix4} m - The matrix to multiply with.
		 * @return {Matrix4} A reference to this matrix.
		 */
		premultiply( m ) {

			return this.multiplyMatrices( m, this );

		}

		/**
		 * Multiples the given 4x4 matrices and stores the result
		 * in this matrix.
		 *
		 * @param {Matrix4} a - The first matrix.
		 * @param {Matrix4} b - The second matrix.
		 * @return {Matrix4} A reference to this matrix.
		 */
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

		/**
		 * Multiplies every component of the matrix by the given scalar.
		 *
		 * @param {number} s - The scalar.
		 * @return {Matrix4} A reference to this matrix.
		 */
		multiplyScalar( s ) {

			const te = this.elements;

			te[ 0 ] *= s; te[ 4 ] *= s; te[ 8 ] *= s; te[ 12 ] *= s;
			te[ 1 ] *= s; te[ 5 ] *= s; te[ 9 ] *= s; te[ 13 ] *= s;
			te[ 2 ] *= s; te[ 6 ] *= s; te[ 10 ] *= s; te[ 14 ] *= s;
			te[ 3 ] *= s; te[ 7 ] *= s; te[ 11 ] *= s; te[ 15 ] *= s;

			return this;

		}

		/**
		 * Computes and returns the determinant of this matrix.
		 *
		 * Based on the method outlined [here]{@link http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.html}.
		 *
		 * @return {number} The determinant.
		 */
		determinant() {

			const te = this.elements;

			const n11 = te[ 0 ], n12 = te[ 4 ], n13 = te[ 8 ], n14 = te[ 12 ];
			const n21 = te[ 1 ], n22 = te[ 5 ], n23 = te[ 9 ], n24 = te[ 13 ];
			const n31 = te[ 2 ], n32 = te[ 6 ], n33 = te[ 10 ], n34 = te[ 14 ];
			const n41 = te[ 3 ], n42 = te[ 7 ], n43 = te[ 11 ], n44 = te[ 15 ];

			//TODO: make this more efficient

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

		/**
		 * Transposes this matrix in place.
		 *
		 * @return {Matrix4} A reference to this matrix.
		 */
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

		/**
		 * Sets the position component for this matrix from the given vector,
		 * without affecting the rest of the matrix.
		 *
		 * @param {number|Vector3} x - The x component of the vector or alternatively the vector object.
		 * @param {number} y - The y component of the vector.
		 * @param {number} z - The z component of the vector.
		 * @return {Matrix4} A reference to this matrix.
		 */
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

		/**
		 * Inverts this matrix, using the [analytic method]{@link https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution}.
		 * You can not invert with a determinant of zero. If you attempt this, the method produces
		 * a zero matrix instead.
		 *
		 * @return {Matrix4} A reference to this matrix.
		 */
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

		/**
		 * Multiplies the columns of this matrix by the given vector.
		 *
		 * @param {Vector3} v - The scale vector.
		 * @return {Matrix4} A reference to this matrix.
		 */
		scale( v ) {

			const te = this.elements;
			const x = v.x, y = v.y, z = v.z;

			te[ 0 ] *= x; te[ 4 ] *= y; te[ 8 ] *= z;
			te[ 1 ] *= x; te[ 5 ] *= y; te[ 9 ] *= z;
			te[ 2 ] *= x; te[ 6 ] *= y; te[ 10 ] *= z;
			te[ 3 ] *= x; te[ 7 ] *= y; te[ 11 ] *= z;

			return this;

		}

		/**
		 * Gets the maximum scale value of the three axes.
		 *
		 * @return {number} The maximum scale.
		 */
		getMaxScaleOnAxis() {

			const te = this.elements;

			const scaleXSq = te[ 0 ] * te[ 0 ] + te[ 1 ] * te[ 1 ] + te[ 2 ] * te[ 2 ];
			const scaleYSq = te[ 4 ] * te[ 4 ] + te[ 5 ] * te[ 5 ] + te[ 6 ] * te[ 6 ];
			const scaleZSq = te[ 8 ] * te[ 8 ] + te[ 9 ] * te[ 9 ] + te[ 10 ] * te[ 10 ];

			return Math.sqrt( Math.max( scaleXSq, scaleYSq, scaleZSq ) );

		}

		/**
		 * Sets this matrix as a translation transform from the given vector.
		 *
		 * @param {number|Vector3} x - The amount to translate in the X axis or alternatively a translation vector.
		 * @param {number} y - The amount to translate in the Y axis.
		 * @param {number} z - The amount to translate in the z axis.
		 * @return {Matrix4} A reference to this matrix.
		 */
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

		/**
		 * Sets this matrix as a rotational transformation around the X axis by
		 * the given angle.
		 *
		 * @param {number} theta - The rotation in radians.
		 * @return {Matrix4} A reference to this matrix.
		 */
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

		/**
		 * Sets this matrix as a rotational transformation around the Y axis by
		 * the given angle.
		 *
		 * @param {number} theta - The rotation in radians.
		 * @return {Matrix4} A reference to this matrix.
		 */
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

		/**
		 * Sets this matrix as a rotational transformation around the Z axis by
		 * the given angle.
		 *
		 * @param {number} theta - The rotation in radians.
		 * @return {Matrix4} A reference to this matrix.
		 */
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

		/**
		 * Sets this matrix as a rotational transformation around the given axis by
		 * the given angle.
		 *
		 * This is a somewhat controversial but mathematically sound alternative to
		 * rotating via Quaternions. See the discussion [here]{@link https://www.gamedev.net/articles/programming/math-and-physics/do-we-really-need-quaternions-r1199}.
		 *
		 * @param {Vector3} axis - The normalized rotation axis.
		 * @param {number} angle - The rotation in radians.
		 * @return {Matrix4} A reference to this matrix.
		 */
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

		/**
		 * Sets this matrix as a scale transformation.
		 *
		 * @param {number} x - The amount to scale in the X axis.
		 * @param {number} y - The amount to scale in the Y axis.
		 * @param {number} z - The amount to scale in the Z axis.
		 * @return {Matrix4} A reference to this matrix.
		 */
		makeScale( x, y, z ) {

			this.set(

				x, 0, 0, 0,
				0, y, 0, 0,
				0, 0, z, 0,
				0, 0, 0, 1

			);

			return this;

		}

		/**
		 * Sets this matrix as a shear transformation.
		 *
		 * @param {number} xy - The amount to shear X by Y.
		 * @param {number} xz - The amount to shear X by Z.
		 * @param {number} yx - The amount to shear Y by X.
		 * @param {number} yz - The amount to shear Y by Z.
		 * @param {number} zx - The amount to shear Z by X.
		 * @param {number} zy - The amount to shear Z by Y.
		 * @return {Matrix4} A reference to this matrix.
		 */
		makeShear( xy, xz, yx, yz, zx, zy ) {

			this.set(

				1, yx, zx, 0,
				xy, 1, zy, 0,
				xz, yz, 1, 0,
				0, 0, 0, 1

			);

			return this;

		}

		/**
		 * Sets this matrix to the transformation composed of the given position,
		 * rotation (Quaternion) and scale.
		 *
		 * @param {Vector3} position - The position vector.
		 * @param {Quaternion} quaternion - The rotation as a Quaternion.
		 * @param {Vector3} scale - The scale vector.
		 * @return {Matrix4} A reference to this matrix.
		 */
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

		/**
		 * Decomposes this matrix into its position, rotation and scale components
		 * and provides the result in the given objects.
		 *
		 * Note: Not all matrices are decomposable in this way. For example, if an
		 * object has a non-uniformly scaled parent, then the object's world matrix
		 * may not be decomposable, and this method may not be appropriate.
		 *
		 * @param {Vector3} position - The position vector.
		 * @param {Quaternion} quaternion - The rotation as a Quaternion.
		 * @param {Vector3} scale - The scale vector.
		 * @return {Matrix4} A reference to this matrix.
		 */
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

		/**
		 * Creates a perspective projection matrix. This is used internally by
		 * {@link PerspectiveCamera#updateProjectionMatrix}.

		 * @param {number} left - Left boundary of the viewing frustum at the near plane.
		 * @param {number} right - Right boundary of the viewing frustum at the near plane.
		 * @param {number} top - Top boundary of the viewing frustum at the near plane.
		 * @param {number} bottom - Bottom boundary of the viewing frustum at the near plane.
		 * @param {number} near - The distance from the camera to the near plane.
		 * @param {number} far - The distance from the camera to the far plane.
		 * @param {(WebGLCoordinateSystem|WebGPUCoordinateSystem)} [coordinateSystem=WebGLCoordinateSystem] - The coordinate system.
		 * @return {Matrix4} A reference to this matrix.
		 */
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

		/**
		 * Creates a orthographic projection matrix. This is used internally by
		 * {@link OrthographicCamera#updateProjectionMatrix}.

		 * @param {number} left - Left boundary of the viewing frustum at the near plane.
		 * @param {number} right - Right boundary of the viewing frustum at the near plane.
		 * @param {number} top - Top boundary of the viewing frustum at the near plane.
		 * @param {number} bottom - Bottom boundary of the viewing frustum at the near plane.
		 * @param {number} near - The distance from the camera to the near plane.
		 * @param {number} far - The distance from the camera to the far plane.
		 * @param {(WebGLCoordinateSystem|WebGPUCoordinateSystem)} [coordinateSystem=WebGLCoordinateSystem] - The coordinate system.
		 * @return {Matrix4} A reference to this matrix.
		 */
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

		/**
		 * Returns `true` if this matrix is equal with the given one.
		 *
		 * @param {Matrix4} matrix - The matrix to test for equality.
		 * @return {boolean} Whether this matrix is equal with the given one.
		 */
		equals( matrix ) {

			const te = this.elements;
			const me = matrix.elements;

			for ( let i = 0; i < 16; i ++ ) {

				if ( te[ i ] !== me[ i ] ) return false;

			}

			return true;

		}

		/**
		 * Sets the elements of the matrix from the given array.
		 *
		 * @param {Array<number>} array - The matrix elements in column-major order.
		 * @param {number} [offset=0] - Index of the first element in the array.
		 * @return {Matrix4} A reference to this matrix.
		 */
		fromArray( array, offset = 0 ) {

			for ( let i = 0; i < 16; i ++ ) {

				this.elements[ i ] = array[ i + offset ];

			}

			return this;

		}

		/**
		 * Writes the elements of this matrix to the given array. If no array is provided,
		 * the method returns a new instance.
		 *
		 * @param {Array<number>} [array=[]] - The target array holding the matrix elements in column-major order.
		 * @param {number} [offset=0] - Index of the first element in the array.
		 * @return {Array<number>} The matrix elements in column-major order.
		 */
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

	/**
	 * A class representing Euler angles.
	 *
	 * Euler angles describe a rotational transformation by rotating an object on
	 * its various axes in specified amounts per axis, and a specified axis
	 * order.
	 *
	 * Iterating through an instance will yield its components (x, y, z,
	 * order) in the corresponding order.
	 *
	 * ```js
	 * const a = new THREE.Euler( 0, 1, 1.57, 'XYZ' );
	 * const b = new THREE.Vector3( 1, 0, 1 );
	 * b.applyEuler(a);
	 * ```
	 */
	class Euler {

		/**
		 * Constructs a new euler instance.
		 *
		 * @param {number} [x=0] - The angle of the x axis in radians.
		 * @param {number} [y=0] - The angle of the y axis in radians.
		 * @param {number} [z=0] - The angle of the z axis in radians.
		 * @param {string} [order=Euler.DEFAULT_ORDER] - A string representing the order that the rotations are applied.
		 */
		constructor( x = 0, y = 0, z = 0, order = Euler.DEFAULT_ORDER ) {

			/**
			 * This flag can be used for type testing.
			 *
			 * @type {boolean}
			 * @readonly
			 * @default true
			 */
			this.isEuler = true;

			this._x = x;
			this._y = y;
			this._z = z;
			this._order = order;

		}

		/**
		 * The angle of the x axis in radians.
		 *
		 * @type {number}
		 * @default 0
		 */
		get x() {

			return this._x;

		}

		set x( value ) {

			this._x = value;
			this._onChangeCallback();

		}

		/**
		 * The angle of the y axis in radians.
		 *
		 * @type {number}
		 * @default 0
		 */
		get y() {

			return this._y;

		}

		set y( value ) {

			this._y = value;
			this._onChangeCallback();

		}

		/**
		 * The angle of the z axis in radians.
		 *
		 * @type {number}
		 * @default 0
		 */
		get z() {

			return this._z;

		}

		set z( value ) {

			this._z = value;
			this._onChangeCallback();

		}

		/**
		 * A string representing the order that the rotations are applied.
		 *
		 * @type {string}
		 * @default 'XYZ'
		 */
		get order() {

			return this._order;

		}

		set order( value ) {

			this._order = value;
			this._onChangeCallback();

		}

		/**
		 * Sets the Euler components.
		 *
		 * @param {number} x - The angle of the x axis in radians.
		 * @param {number} y - The angle of the y axis in radians.
		 * @param {number} z - The angle of the z axis in radians.
		 * @param {string} [order] - A string representing the order that the rotations are applied.
		 * @return {Euler} A reference to this Euler instance.
		 */
		set( x, y, z, order = this._order ) {

			this._x = x;
			this._y = y;
			this._z = z;
			this._order = order;

			this._onChangeCallback();

			return this;

		}

		/**
		 * Returns a new Euler instance with copied values from this instance.
		 *
		 * @return {Euler} A clone of this instance.
		 */
		clone() {

			return new this.constructor( this._x, this._y, this._z, this._order );

		}

		/**
		 * Copies the values of the given Euler instance to this instance.
		 *
		 * @param {Euler} euler - The Euler instance to copy.
		 * @return {Euler} A reference to this Euler instance.
		 */
		copy( euler ) {

			this._x = euler._x;
			this._y = euler._y;
			this._z = euler._z;
			this._order = euler._order;

			this._onChangeCallback();

			return this;

		}

		/**
		 * Sets the angles of this Euler instance from a pure rotation matrix.
		 *
		 * @param {Matrix4} m - A 4x4 matrix of which the upper 3x3 of matrix is a pure rotation matrix (i.e. unscaled).
		 * @param {string} [order] - A string representing the order that the rotations are applied.
		 * @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
		 * @return {Euler} A reference to this Euler instance.
		 */
		setFromRotationMatrix( m, order = this._order, update = true ) {

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

		/**
		 * Sets the angles of this Euler instance from a normalized quaternion.
		 *
		 * @param {Quaternion} q - A normalized Quaternion.
		 * @param {string} [order] - A string representing the order that the rotations are applied.
		 * @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
		 * @return {Euler} A reference to this Euler instance.
		 */
		setFromQuaternion( q, order, update ) {

			_matrix$2.makeRotationFromQuaternion( q );

			return this.setFromRotationMatrix( _matrix$2, order, update );

		}

		/**
		 * Sets the angles of this Euler instance from the given vector.
		 *
		 * @param {Vector3} v - The vector.
		 * @param {string} [order] - A string representing the order that the rotations are applied.
		 * @return {Euler} A reference to this Euler instance.
		 */
		setFromVector3( v, order = this._order ) {

			return this.set( v.x, v.y, v.z, order );

		}

		/**
		 * Resets the euler angle with a new order by creating a quaternion from this
		 * euler angle and then setting this euler angle with the quaternion and the
		 * new order.
		 *
		 * Warning: This discards revolution information.
		 *
		 * @param {string} [newOrder] - A string representing the new order that the rotations are applied.
		 * @return {Euler} A reference to this Euler instance.
		 */
		reorder( newOrder ) {

			_quaternion$3.setFromEuler( this );

			return this.setFromQuaternion( _quaternion$3, newOrder );

		}

		/**
		 * Returns `true` if this Euler instance is equal with the given one.
		 *
		 * @param {Euler} euler - The Euler instance to test for equality.
		 * @return {boolean} Whether this Euler instance is equal with the given one.
		 */
		equals( euler ) {

			return ( euler._x === this._x ) && ( euler._y === this._y ) && ( euler._z === this._z ) && ( euler._order === this._order );

		}

		/**
		 * Sets this Euler instance's components to values from the given array. The first three
		 * entries of the array are assign to the x,y and z components. An optional fourth entry
		 * defines the Euler order.
		 *
		 * @param {Array<number,number,number,?string>} array - An array holding the Euler component values.
		 * @return {Euler} A reference to this Euler instance.
		 */
		fromArray( array ) {

			this._x = array[ 0 ];
			this._y = array[ 1 ];
			this._z = array[ 2 ];
			if ( array[ 3 ] !== undefined ) this._order = array[ 3 ];

			this._onChangeCallback();

			return this;

		}

		/**
		 * Writes the components of this Euler instance to the given array. If no array is provided,
		 * the method returns a new instance.
		 *
		 * @param {Array<number,number,number,string>} [array=[]] - The target array holding the Euler components.
		 * @param {number} [offset=0] - Index of the first element in the array.
		 * @return {Array<number,number,number,string>} The Euler components.
		 */
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

	/**
	 * The default Euler angle order.
	 *
	 * @static
	 * @type {string}
	 * @default 'XYZ'
	 */
	Euler.DEFAULT_ORDER = 'XYZ';

	/**
	 * A layers object assigns an 3D object to 1 or more of 32
	 * layers numbered `0` to `31` - internally the layers are stored as a
	 * bit mask], and by default all 3D objects are a member of layer `0`.
	 *
	 * This can be used to control visibility - an object must share a layer with
	 * a camera to be visible when that camera's view is
	 * rendered.
	 *
	 * All classes that inherit from {@link Object3D} have an `layers` property which
	 * is an instance of this class.
	 */
	class Layers {

		/**
		 * Constructs a new layers instance, with membership
		 * initially set to layer `0`.
		 */
		constructor() {

			/**
			 * A bit mask storing which of the 32 layers this layers object is currently
			 * a member of.
			 *
			 * @type {number}
			 */
			this.mask = 1 | 0;

		}

		/**
		 * Sets membership to the given layer, and remove membership all other layers.
		 *
		 * @param {number} layer - The layer to set.
		 */
		set( layer ) {

			this.mask = ( 1 << layer | 0 ) >>> 0;

		}

		/**
		 * Adds membership of the given layer.
		 *
		 * @param {number} layer - The layer to enable.
		 */
		enable( layer ) {

			this.mask |= 1 << layer | 0;

		}

		/**
		 * Adds membership to all layers.
		 */
		enableAll() {

			this.mask = 0xffffffff | 0;

		}

		/**
		 * Toggles the membership of the given layer.
		 *
		 * @param {number} layer - The layer to toggle.
		 */
		toggle( layer ) {

			this.mask ^= 1 << layer | 0;

		}

		/**
		 * Removes membership of the given layer.
		 *
		 * @param {number} layer - The layer to enable.
		 */
		disable( layer ) {

			this.mask &= ~ ( 1 << layer | 0 );

		}

		/**
		 * Removes the membership from all layers.
		 */
		disableAll() {

			this.mask = 0;

		}

		/**
		 * Returns `true` if this and the given layers object have at least one
		 * layer in common.
		 *
		 * @param {Layers} layers - The layers to test.
		 * @return {boolean } Whether this and the given layers object have at least one layer in common or not.
		 */
		test( layers ) {

			return ( this.mask & layers.mask ) !== 0;

		}

		/**
		 * Returns `true` if the given layer is enabled.
		 *
		 * @param {number} layer - The layer to test.
		 * @return {boolean } Whether the given layer is enabled or not.
		 */
		isEnabled( layer ) {

			return ( this.mask & ( 1 << layer | 0 ) ) !== 0;

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

	/**
	 * Fires when the object has been added to its parent object.
	 *
	 * @event Object3D#added
	 * @type {Object}
	 */
	const _addedEvent = { type: 'added' };

	/**
	 * Fires when the object has been removed from its parent object.
	 *
	 * @event Object3D#removed
	 * @type {Object}
	 */
	const _removedEvent = { type: 'removed' };

	/**
	 * Fires when a new child object has been added.
	 *
	 * @event Object3D#childadded
	 * @type {Object}
	 */
	const _childaddedEvent = { type: 'childadded', child: null };

	/**
	 * Fires when a new child object has been added.
	 *
	 * @event Object3D#childremoved
	 * @type {Object}
	 */
	const _childremovedEvent = { type: 'childremoved', child: null };

	/**
	 * This is the base class for most objects in three.js and provides a set of
	 * properties and methods for manipulating objects in 3D space.
	 *
	 * @augments EventDispatcher
	 */
	class Object3D extends EventDispatcher {

		/**
		 * Constructs a new 3D object.
		 */
		constructor() {

			super();

			/**
			 * This flag can be used for type testing.
			 *
			 * @type {boolean}
			 * @readonly
			 * @default true
			 */
			this.isObject3D = true;

			/**
			 * The ID of the 3D object.
			 *
			 * @name Object3D#id
			 * @type {number}
			 * @readonly
			 */
			Object.defineProperty( this, 'id', { value: _object3DId ++ } );

			/**
			 * The UUID of the 3D object.
			 *
			 * @type {string}
			 * @readonly
			 */
			this.uuid = generateUUID();

			/**
			 * The name of the 3D object.
			 *
			 * @type {string}
			 */
			this.name = '';

			/**
			 * The type property is used for detecting the object type
			 * in context of serialization/deserialization.
			 *
			 * @type {string}
			 * @readonly
			 */
			this.type = 'Object3D';

			/**
			 * A reference to the parent object.
			 *
			 * @type {?Object3D}
			 * @default null
			 */
			this.parent = null;

			/**
			 * An array holding the child 3D objects of this instance.
			 *
			 * @type {Array<Object3D>}
			 */
			this.children = [];

			/**
			 * Defines the `up` direction of the 3D object which influences
			 * the orientation via methods like {@link Object3D#lookAt}.
			 *
			 * The default values for all 3D objects is defined by `Object3D.DEFAULT_UP`.
			 *
			 * @type {Vector3}
			 */
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
				/**
				 * Represents the object's local position.
				 *
				 * @name Object3D#position
				 * @type {Vector3}
				 * @default (0,0,0)
				 */
				position: {
					configurable: true,
					enumerable: true,
					value: position
				},
				/**
				 * Represents the object's local rotation as Euler angles, in radians.
				 *
				 * @name Object3D#rotation
				 * @type {Euler}
				 * @default (0,0,0)
				 */
				rotation: {
					configurable: true,
					enumerable: true,
					value: rotation
				},
				/**
				 * Represents the object's local rotation as Quaternions.
				 *
				 * @name Object3D#quaternion
				 * @type {Quaternion}
				 */
				quaternion: {
					configurable: true,
					enumerable: true,
					value: quaternion
				},
				/**
				 * Represents the object's local scale.
				 *
				 * @name Object3D#scale
				 * @type {Vector3}
				 * @default (1,1,1)
				 */
				scale: {
					configurable: true,
					enumerable: true,
					value: scale
				},
				/**
				 * Represents the object's model-view matrix.
				 *
				 * @name Object3D#modelViewMatrix
				 * @type {Matrix4}
				 */
				modelViewMatrix: {
					value: new Matrix4()
				},
				/**
				 * Represents the object's normal matrix.
				 *
				 * @name Object3D#normalMatrix
				 * @type {Matrix3}
				 */
				normalMatrix: {
					value: new Matrix3()
				}
			} );

			/**
			 * Represents the object's transformation matrix in local space.
			 *
			 * @type {Matrix4}
			 */
			this.matrix = new Matrix4();

			/**
			 * Represents the object's transformation matrix in world space.
			 * If the 3D object has no parent, then it's identical to the local transformation matrix
			 *
			 * @type {Matrix4}
			 */
			this.matrixWorld = new Matrix4();

			/**
			 * When set to `true`, the engine automatically computes the local matrix from position,
			 * rotation and scale every frame.
			 *
			 * The default values for all 3D objects is defined by `Object3D.DEFAULT_MATRIX_AUTO_UPDATE`.
			 *
			 * @type {boolean}
			 * @default true
			 */
			this.matrixAutoUpdate = Object3D.DEFAULT_MATRIX_AUTO_UPDATE;

			/**
			 * When set to `true`, the engine automatically computes the world matrix from the current local
			 * matrix and the object's transformation hierarchy.
			 *
			 * The default values for all 3D objects is defined by `Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE`.
			 *
			 * @type {boolean}
			 * @default true
			 */
			this.matrixWorldAutoUpdate = Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE; // checked by the renderer

			/**
			 * When set to `true`, it calculates the world matrix in that frame and resets this property
			 * to `false`.
			 *
			 * @type {boolean}
			 * @default false
			 */
			this.matrixWorldNeedsUpdate = false;

			/**
			 * The layer membership of the 3D object. The 3D object is only visible if it has
			 * at least one layer in common with the camera in use. This property can also be
			 * used to filter out unwanted objects in ray-intersection tests when using {@link Raycaster}.
			 *
			 * @type {Layers}
			 */
			this.layers = new Layers();

			/**
			 * When set to `true`, the 3D object gets rendered.
			 *
			 * @type {boolean}
			 * @default true
			 */
			this.visible = true;

			/**
			 * When set to `true`, the 3D object gets rendered into shadow maps.
			 *
			 * @type {boolean}
			 * @default false
			 */
			this.castShadow = false;

			/**
			 * When set to `true`, the 3D object is affected by shadows in the scene.
			 *
			 * @type {boolean}
			 * @default false
			 */
			this.receiveShadow = false;

			/**
			 * When set to `true`, the 3D object is honored by view frustum culling.
			 *
			 * @type {boolean}
			 * @default true
			 */
			this.frustumCulled = true;

			/**
			 * This value allows the default rendering order of scene graph objects to be
			 * overridden although opaque and transparent objects remain sorted independently.
			 * When this property is set for an instance of {@link Group},all descendants
			 * objects will be sorted and rendered together. Sorting is from lowest to highest
			 * render order.
			 *
			 * @type {number}
			 * @default 0
			 */
			this.renderOrder = 0;

			/**
			 * An array holding the animation clips of the 3D object.
			 *
			 * @type {Array<AnimationClip>}
			 */
			this.animations = [];

			/**
			 * Custom depth material to be used when rendering to the depth map. Can only be used
			 * in context of meshes. When shadow-casting with a {@link DirectionalLight} or {@link SpotLight},
			 * if you are modifying vertex positions in the vertex shader you must specify a custom depth
			 * material for proper shadows.
			 *
			 * Only relevant in context of {@link WebGLRenderer}.
			 *
			 * @type {(Material|undefined)}
			 * @default undefined
			 */
			this.customDepthMaterial = undefined;

			/**
			 * Same as {@link Object3D#customDepthMaterial}, but used with {@link PointLight}.
			 *
			 * Only relevant in context of {@link WebGLRenderer}.
			 *
			 * @type {(Material|undefined)}
			 * @default undefined
			 */
			this.customDistanceMaterial = undefined;

			/**
			 * An object that can be used to store custom data about the 3D object. It
			 * should not hold references to functions as these will not be cloned.
			 *
			 * @type {Object}
			 */
			this.userData = {};

		}

		/**
		 * A callback that is executed immediately before a 3D object is rendered to a shadow map.
		 *
		 * @param {Renderer|WebGLRenderer} renderer - The renderer.
		 * @param {Object3D} object - The 3D object.
		 * @param {Camera} camera - The camera that is used to render the scene.
		 * @param {Camera} shadowCamera - The shadow camera.
		 * @param {BufferGeometry} geometry - The 3D object's geometry.
		 * @param {Material} depthMaterial - The depth material.
		 * @param {Object} group - The geometry group data.
		 */
		onBeforeShadow( /* renderer, object, camera, shadowCamera, geometry, depthMaterial, group */ ) {}

		/**
		 * A callback that is executed immediately after a 3D object is rendered to a shadow map.
		 *
		 * @param {Renderer|WebGLRenderer} renderer - The renderer.
		 * @param {Object3D} object - The 3D object.
		 * @param {Camera} camera - The camera that is used to render the scene.
		 * @param {Camera} shadowCamera - The shadow camera.
		 * @param {BufferGeometry} geometry - The 3D object's geometry.
		 * @param {Material} depthMaterial - The depth material.
		 * @param {Object} group - The geometry group data.
		 */
		onAfterShadow( /* renderer, object, camera, shadowCamera, geometry, depthMaterial, group */ ) {}

		/**
		 * A callback that is executed immediately before a 3D object is rendered.
		 *
		 * @param {Renderer|WebGLRenderer} renderer - The renderer.
		 * @param {Object3D} object - The 3D object.
		 * @param {Camera} camera - The camera that is used to render the scene.
		 * @param {BufferGeometry} geometry - The 3D object's geometry.
		 * @param {Material} material - The 3D object's material.
		 * @param {Object} group - The geometry group data.
		 */
		onBeforeRender( /* renderer, scene, camera, geometry, material, group */ ) {}

		/**
		 * A callback that is executed immediately after a 3D object is rendered.
		 *
		 * @param {Renderer|WebGLRenderer} renderer - The renderer.
		 * @param {Object3D} object - The 3D object.
		 * @param {Camera} camera - The camera that is used to render the scene.
		 * @param {BufferGeometry} geometry - The 3D object's geometry.
		 * @param {Material} material - The 3D object's material.
		 * @param {Object} group - The geometry group data.
		 */
		onAfterRender( /* renderer, scene, camera, geometry, material, group */ ) {}

		/**
		 * Applies the given transformation matrix to the object and updates the object's position,
		 * rotation and scale.
		 *
		 * @param {Matrix4} matrix - The transformation matrix.
		 */
		applyMatrix4( matrix ) {

			if ( this.matrixAutoUpdate ) this.updateMatrix();

			this.matrix.premultiply( matrix );

			this.matrix.decompose( this.position, this.quaternion, this.scale );

		}

		/**
		 * Applies a rotation represented by given the quaternion to the 3D object.
		 *
		 * @param {Quaternion} q - The quaternion.
		 * @return {Object3D} A reference to this instance.
		 */
		applyQuaternion( q ) {

			this.quaternion.premultiply( q );

			return this;

		}

		/**
		 * Sets the given rotation represented as an axis/angle couple to the 3D object.
		 *
		 * @param {Vector3} axis - The (normalized) axis vector.
		 * @param {number} angle - The angle in radians.
		 */
		setRotationFromAxisAngle( axis, angle ) {

			// assumes axis is normalized

			this.quaternion.setFromAxisAngle( axis, angle );

		}

		/**
		 * Sets the given rotation represented as Euler angles to the 3D object.
		 *
		 * @param {Euler} euler - The Euler angles.
		 */
		setRotationFromEuler( euler ) {

			this.quaternion.setFromEuler( euler, true );

		}

		/**
		 * Sets the given rotation represented as rotation matrix to the 3D object.
		 *
		 * @param {Matrix4} m - Although a 4x4 matrix is expected, the upper 3x3 portion must be
		 * a pure rotation matrix (i.e, unscaled).
		 */
		setRotationFromMatrix( m ) {

			// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

			this.quaternion.setFromRotationMatrix( m );

		}

		/**
		 * Sets the given rotation represented as a Quaternion to the 3D object.
		 *
		 * @param {Quaternion} q - The Quaternion
		 */
		setRotationFromQuaternion( q ) {

			// assumes q is normalized

			this.quaternion.copy( q );

		}

		/**
		 * Rotates the 3D object along an axis in local space.
		 *
		 * @param {Vector3} axis - The (normalized) axis vector.
		 * @param {number} angle - The angle in radians.
		 * @return {Object3D} A reference to this instance.
		 */
		rotateOnAxis( axis, angle ) {

			// rotate object on axis in object space
			// axis is assumed to be normalized

			_q1.setFromAxisAngle( axis, angle );

			this.quaternion.multiply( _q1 );

			return this;

		}

		/**
		 * Rotates the 3D object along an axis in world space.
		 *
		 * @param {Vector3} axis - The (normalized) axis vector.
		 * @param {number} angle - The angle in radians.
		 * @return {Object3D} A reference to this instance.
		 */
		rotateOnWorldAxis( axis, angle ) {

			// rotate object on axis in world space
			// axis is assumed to be normalized
			// method assumes no rotated parent

			_q1.setFromAxisAngle( axis, angle );

			this.quaternion.premultiply( _q1 );

			return this;

		}

		/**
		 * Rotates the 3D object around its X axis in local space.
		 *
		 * @param {number} angle - The angle in radians.
		 * @return {Object3D} A reference to this instance.
		 */
		rotateX( angle ) {

			return this.rotateOnAxis( _xAxis, angle );

		}

		/**
		 * Rotates the 3D object around its Y axis in local space.
		 *
		 * @param {number} angle - The angle in radians.
		 * @return {Object3D} A reference to this instance.
		 */
		rotateY( angle ) {

			return this.rotateOnAxis( _yAxis, angle );

		}

		/**
		 * Rotates the 3D object around its Z axis in local space.
		 *
		 * @param {number} angle - The angle in radians.
		 * @return {Object3D} A reference to this instance.
		 */
		rotateZ( angle ) {

			return this.rotateOnAxis( _zAxis, angle );

		}

		/**
		 * Translate the 3D object by a distance along the given axis in local space.
		 *
		 * @param {Vector3} axis - The (normalized) axis vector.
		 * @param {number} distance - The distance in world units.
		 * @return {Object3D} A reference to this instance.
		 */
		translateOnAxis( axis, distance ) {

			// translate object by distance along axis in object space
			// axis is assumed to be normalized

			_v1$4.copy( axis ).applyQuaternion( this.quaternion );

			this.position.add( _v1$4.multiplyScalar( distance ) );

			return this;

		}

		/**
		 * Translate the 3D object by a distance along its X-axis in local space.
		 *
		 * @param {number} distance - The distance in world units.
		 * @return {Object3D} A reference to this instance.
		 */
		translateX( distance ) {

			return this.translateOnAxis( _xAxis, distance );

		}

		/**
		 * Translate the 3D object by a distance along its Y-axis in local space.
		 *
		 * @param {number} distance - The distance in world units.
		 * @return {Object3D} A reference to this instance.
		 */
		translateY( distance ) {

			return this.translateOnAxis( _yAxis, distance );

		}

		/**
		 * Translate the 3D object by a distance along its Z-axis in local space.
		 *
		 * @param {number} distance - The distance in world units.
		 * @return {Object3D} A reference to this instance.
		 */
		translateZ( distance ) {

			return this.translateOnAxis( _zAxis, distance );

		}

		/**
		 * Converts the given vector from this 3D object's local space to world space.
		 *
		 * @param {Vector3} vector - The vector to convert.
		 * @return {Vector3} The converted vector.
		 */
		localToWorld( vector ) {

			this.updateWorldMatrix( true, false );

			return vector.applyMatrix4( this.matrixWorld );

		}

		/**
		 * Converts the given vector from this 3D object's word space to local space.
		 *
		 * @param {Vector3} vector - The vector to convert.
		 * @return {Vector3} The converted vector.
		 */
		worldToLocal( vector ) {

			this.updateWorldMatrix( true, false );

			return vector.applyMatrix4( _m1$1.copy( this.matrixWorld ).invert() );

		}

		/**
		 * Rotates the object to face a point in world space.
		 *
		 * This method does not support objects having non-uniformly-scaled parent(s).
		 *
		 * @param {number|Vector3} x - The x coordinate in world space. Alternatively, a vector representing a position in world space
		 * @param {number} [y] - The y coordinate in world space.
		 * @param {number} [z] - The z coordinate in world space.
		 */
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

		/**
		 * Adds the given 3D object as a child to this 3D object. An arbitrary number of
		 * objects may be added. Any current parent on an object passed in here will be
		 * removed, since an object can have at most one parent.
		 *
		 * @fires Object3D#added
		 * @fires Object3D#childadded
		 * @param {Object3D} object - The 3D object to add.
		 * @return {Object3D} A reference to this instance.
		 */
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

		/**
		 * Removes the given 3D object as child from this 3D object.
		 * An arbitrary number of objects may be removed.
		 *
		 * @fires Object3D#removed
		 * @fires Object3D#childremoved
		 * @param {Object3D} object - The 3D object to remove.
		 * @return {Object3D} A reference to this instance.
		 */
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

		/**
		 * Removes this 3D object from its current parent.
		 *
		 * @fires Object3D#removed
		 * @fires Object3D#childremoved
		 * @return {Object3D} A reference to this instance.
		 */
		removeFromParent() {

			const parent = this.parent;

			if ( parent !== null ) {

				parent.remove( this );

			}

			return this;

		}

		/**
		 * Removes all child objects.
		 *
		 * @fires Object3D#removed
		 * @fires Object3D#childremoved
		 * @return {Object3D} A reference to this instance.
		 */
		clear() {

			return this.remove( ... this.children );

		}

		/**
		 * Adds the given 3D object as a child of this 3D object, while maintaining the object's world
		 * transform. This method does not support scene graphs having non-uniformly-scaled nodes(s).
		 *
		 * @fires Object3D#added
		 * @fires Object3D#childadded
		 * @param {Object3D} object - The 3D object to attach.
		 * @return {Object3D} A reference to this instance.
		 */
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

		/**
		 * Searches through the 3D object and its children, starting with the 3D object
		 * itself, and returns the first with a matching ID.
		 *
		 * @param {number} id - The id.
		 * @return {Object3D|undefined} The found 3D object. Returns `undefined` if no 3D object has been found.
		 */
		getObjectById( id ) {

			return this.getObjectByProperty( 'id', id );

		}

		/**
		 * Searches through the 3D object and its children, starting with the 3D object
		 * itself, and returns the first with a matching name.
		 *
		 * @param {string} name - The name.
		 * @return {Object3D|undefined} The found 3D object. Returns `undefined` if no 3D object has been found.
		 */
		getObjectByName( name ) {

			return this.getObjectByProperty( 'name', name );

		}

		/**
		 * Searches through the 3D object and its children, starting with the 3D object
		 * itself, and returns the first with a matching property value.
		 *
		 * @param {string} name - The name of the property.
		 * @param {any} value - The value.
		 * @return {Object3D|undefined} The found 3D object. Returns `undefined` if no 3D object has been found.
		 */
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

		/**
		 * Searches through the 3D object and its children, starting with the 3D object
		 * itself, and returns all 3D objects with a matching property value.
		 *
		 * @param {string} name - The name of the property.
		 * @param {any} value - The value.
		 * @param {Array<Object3D>} result - The method stores the result in this array.
		 * @return {Array<Object3D>} The found 3D objects.
		 */
		getObjectsByProperty( name, value, result = [] ) {

			if ( this[ name ] === value ) result.push( this );

			const children = this.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {

				children[ i ].getObjectsByProperty( name, value, result );

			}

			return result;

		}

		/**
		 * Returns a vector representing the position of the 3D object in world space.
		 *
		 * @param {Vector3} target - The target vector the result is stored to.
		 * @return {Vector3} The 3D object's position in world space.
		 */
		getWorldPosition( target ) {

			this.updateWorldMatrix( true, false );

			return target.setFromMatrixPosition( this.matrixWorld );

		}

		/**
		 * Returns a Quaternion representing the position of the 3D object in world space.
		 *
		 * @param {Quaternion} target - The target Quaternion the result is stored to.
		 * @return {Quaternion} The 3D object's rotation in world space.
		 */
		getWorldQuaternion( target ) {

			this.updateWorldMatrix( true, false );

			this.matrixWorld.decompose( _position$3, target, _scale$2 );

			return target;

		}

		/**
		 * Returns a vector representing the scale of the 3D object in world space.
		 *
		 * @param {Vector3} target - The target vector the result is stored to.
		 * @return {Vector3} The 3D object's scale in world space.
		 */
		getWorldScale( target ) {

			this.updateWorldMatrix( true, false );

			this.matrixWorld.decompose( _position$3, _quaternion$2, target );

			return target;

		}

		/**
		 * Returns a vector representing the ("look") direction of the 3D object in world space.
		 *
		 * @param {Vector3} target - The target vector the result is stored to.
		 * @return {Vector3} The 3D object's direction in world space.
		 */
		getWorldDirection( target ) {

			this.updateWorldMatrix( true, false );

			const e = this.matrixWorld.elements;

			return target.set( e[ 8 ], e[ 9 ], e[ 10 ] ).normalize();

		}

		/**
		 * Abstract method to get intersections between a casted ray and this
		 * 3D object. Renderable 3D objects such as {@link Mesh}, {@link Line} or {@link Points}
		 * implement this method in order to use raycasting.
		 *
		 * @abstract
		 * @param {Raycaster} raycaster - The raycaster.
		 * @param {Array<Object>} intersects - An array holding the result of the method.
		 */
		raycast( /* raycaster, intersects */ ) {}

		/**
		 * Executes the callback on this 3D object and all descendants.
		 *
		 * Note: Modifying the scene graph inside the callback is discouraged.
		 *
		 * @param {Function} callback - A callback function that allows to process the current 3D object.
		 */
		traverse( callback ) {

			callback( this );

			const children = this.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {

				children[ i ].traverse( callback );

			}

		}

		/**
		 * Like {@link Object3D#traverse}, but the callback will only be executed for visible 3D objects.
		 * Descendants of invisible 3D objects are not traversed.
		 *
		 * Note: Modifying the scene graph inside the callback is discouraged.
		 *
		 * @param {Function} callback - A callback function that allows to process the current 3D object.
		 */
		traverseVisible( callback ) {

			if ( this.visible === false ) return;

			callback( this );

			const children = this.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {

				children[ i ].traverseVisible( callback );

			}

		}

		/**
		 * Like {@link Object3D#traverse}, but the callback will only be executed for all ancestors.
		 *
		 * Note: Modifying the scene graph inside the callback is discouraged.
		 *
		 * @param {Function} callback - A callback function that allows to process the current 3D object.
		 */
		traverseAncestors( callback ) {

			const parent = this.parent;

			if ( parent !== null ) {

				callback( parent );

				parent.traverseAncestors( callback );

			}

		}

		/**
		 * Updates the transformation matrix in local space by computing it from the current
		 * position, rotation and scale values.
		 */
		updateMatrix() {

			this.matrix.compose( this.position, this.quaternion, this.scale );

			this.matrixWorldNeedsUpdate = true;

		}

		/**
		 * Updates the transformation matrix in world space of this 3D objects and its descendants.
		 *
		 * To ensure correct results, this method also recomputes the 3D object's transformation matrix in
		 * local space. The computation of the local and world matrix can be controlled with the
		 * {@link Object3D#matrixAutoUpdate} and {@link Object3D#matrixWorldAutoUpdate} flags which are both
		 * `true` by default.  Set these flags to `false` if you need more control over the update matrix process.
		 *
		 * @param {boolean} [force=false] - When set to `true`, a recomputation of world matrices is forced even
		 * when {@link Object3D#matrixWorldAutoUpdate} is set to `false`.
		 */
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

		/**
		 * An alternative version of {@link Object3D#updateMatrixWorld} with more control over the
		 * update of ancestor and descendant nodes.
		 *
		 * @param {boolean} [updateParents=false] Whether ancestor nodes should be updated or not.
		 * @param {boolean} [updateChildren=false] Whether descendant nodes should be updated or not.
		 */
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

		/**
		 * Serializes the 3D object into JSON.
		 *
		 * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
		 * @return {Object} A JSON object representing the serialized 3D object.
		 * @see {@link ObjectLoader#parse}
		 */
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
					version: 4.7,
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

				object.geometryInfo = this._geometryInfo.map( info => ( {
					...info,
					boundingBox: info.boundingBox ? info.boundingBox.toJSON() : undefined,
					boundingSphere: info.boundingSphere ? info.boundingSphere.toJSON() : undefined
				} ) );
				object.instanceInfo = this._instanceInfo.map( info => ( { ...info } ) );

				object.availableInstanceIds = this._availableInstanceIds.slice();
				object.availableGeometryIds = this._availableGeometryIds.slice();

				object.nextIndexStart = this._nextIndexStart;
				object.nextVertexStart = this._nextVertexStart;
				object.geometryCount = this._geometryCount;

				object.maxInstanceCount = this._maxInstanceCount;
				object.maxVertexCount = this._maxVertexCount;
				object.maxIndexCount = this._maxIndexCount;

				object.geometryInitialized = this._geometryInitialized;

				object.matricesTexture = this._matricesTexture.toJSON( meta );

				object.indirectTexture = this._indirectTexture.toJSON( meta );

				if ( this._colorsTexture !== null ) {

					object.colorsTexture = this._colorsTexture.toJSON( meta );

				}

				if ( this.boundingSphere !== null ) {

					object.boundingSphere = this.boundingSphere.toJSON();

				}

				if ( this.boundingBox !== null ) {

					object.boundingBox = this.boundingBox.toJSON();

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

		/**
		 * Returns a new 3D object with copied values from this instance.
		 *
		 * @param {boolean} [recursive=true] - When set to `true`, descendants of the 3D object are also cloned.
		 * @return {Object3D} A clone of this instance.
		 */
		clone( recursive ) {

			return new this.constructor().copy( this, recursive );

		}

		/**
		 * Copies the values of the given 3D object to this instance.
		 *
		 * @param {Object3D} source - The 3D object to copy.
		 * @param {boolean} [recursive=true] - When set to `true`, descendants of the 3D object are cloned.
		 * @return {Object3D} A reference to this instance.
		 */
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

	/**
	 * The default up direction for objects, also used as the default
	 * position for {@link DirectionalLight} and {@link HemisphereLight}.
	 *
	 * @static
	 * @type {Vector3}
	 * @default (0,1,0)
	 */
	Object3D.DEFAULT_UP = /*@__PURE__*/ new Vector3( 0, 1, 0 );

	/**
	 * The default setting for {@link Object3D#matrixAutoUpdate} for
	 * newly created 3D objects.
	 *
	 * @static
	 * @type {boolean}
	 * @default true
	 */
	Object3D.DEFAULT_MATRIX_AUTO_UPDATE = true;

	/**
	 * The default setting for {@link Object3D#matrixWorldAutoUpdate} for
	 * newly created 3D objects.
	 *
	 * @static
	 * @type {boolean}
	 * @default true
	 */
	Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = true;

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

	/**
	 * A Color instance is represented by RGB components in the linear <i>working
	 * color space</i>, which defaults to `LinearSRGBColorSpace`. Inputs
	 * conventionally using `SRGBColorSpace` (such as hexadecimals and CSS
	 * strings) are converted to the working color space automatically.
	 *
	 * ```js
	 * // converted automatically from SRGBColorSpace to LinearSRGBColorSpace
	 * const color = new THREE.Color().setHex( 0x112233 );
	 * ```
	 * Source color spaces may be specified explicitly, to ensure correct conversions.
	 * ```js
	 * // assumed already LinearSRGBColorSpace; no conversion
	 * const color = new THREE.Color().setRGB( 0.5, 0.5, 0.5 );
	 *
	 * // converted explicitly from SRGBColorSpace to LinearSRGBColorSpace
	 * const color = new THREE.Color().setRGB( 0.5, 0.5, 0.5, SRGBColorSpace );
	 * ```
	 * If THREE.ColorManagement is disabled, no conversions occur. For details,
	 * see <i>Color management</i>. Iterating through a Color instance will yield
	 * its components (r, g, b) in the corresponding order. A Color can be initialised
	 * in any of the following ways:
	 * ```js
	 * //empty constructor - will default white
	 * const color1 = new THREE.Color();
	 *
	 * //Hexadecimal color (recommended)
	 * const color2 = new THREE.Color( 0xff0000 );
	 *
	 * //RGB string
	 * const color3 = new THREE.Color("rgb(255, 0, 0)");
	 * const color4 = new THREE.Color("rgb(100%, 0%, 0%)");
	 *
	 * //X11 color name - all 140 color names are supported.
	 * //Note the lack of CamelCase in the name
	 * const color5 = new THREE.Color( 'skyblue' );
	 * //HSL string
	 * const color6 = new THREE.Color("hsl(0, 100%, 50%)");
	 *
	 * //Separate RGB values between 0 and 1
	 * const color7 = new THREE.Color( 1, 0, 0 );
	 * ```
	 */
	class Color {

		/**
		 * Constructs a new color.
		 *
		 * Note that standard method of specifying color in three.js is with a hexadecimal triplet,
		 * and that method is used throughout the rest of the documentation.
		 *
		 * @param {(number|string|Color)} [r] - The red component of the color. If `g` and `b` are
		 * not provided, it can be hexadecimal triplet, a CSS-style string or another `Color` instance.
		 * @param {number} [g] - The green component.
		 * @param {number} [b] - The blue component.
		 */
		constructor( r, g, b ) {

			/**
			 * This flag can be used for type testing.
			 *
			 * @type {boolean}
			 * @readonly
			 * @default true
			 */
			this.isColor = true;

			/**
			 * The red component.
			 *
			 * @type {number}
			 * @default 1
			 */
			this.r = 1;

			/**
			 * The green component.
			 *
			 * @type {number}
			 * @default 1
			 */
			this.g = 1;

			/**
			 * The blue component.
			 *
			 * @type {number}
			 * @default 1
			 */
			this.b = 1;

			return this.set( r, g, b );

		}

		/**
		 * Sets the colors's components from the given values.
		 *
		 * @param {(number|string|Color)} [r] - The red component of the color. If `g` and `b` are
		 * not provided, it can be hexadecimal triplet, a CSS-style string or another `Color` instance.
		 * @param {number} [g] - The green component.
		 * @param {number} [b] - The blue component.
		 * @return {Color} A reference to this color.
		 */
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

		/**
		 * Sets the colors's components to the given scalar value.
		 *
		 * @param {number} scalar - The scalar value.
		 * @return {Color} A reference to this color.
		 */
		setScalar( scalar ) {

			this.r = scalar;
			this.g = scalar;
			this.b = scalar;

			return this;

		}

		/**
		 * Sets this color from a hexadecimal value.
		 *
		 * @param {number} hex - The hexadecimal value.
		 * @param {string} [colorSpace=SRGBColorSpace] - The color space.
		 * @return {Color} A reference to this color.
		 */
		setHex( hex, colorSpace = SRGBColorSpace ) {

			hex = Math.floor( hex );

			this.r = ( hex >> 16 & 255 ) / 255;
			this.g = ( hex >> 8 & 255 ) / 255;
			this.b = ( hex & 255 ) / 255;

			ColorManagement.colorSpaceToWorking( this, colorSpace );

			return this;

		}

		/**
		 * Sets this color from RGB values.
		 *
		 * @param {number} r - Red channel value between `0.0` and `1.0`.
		 * @param {number} g - Green channel value between `0.0` and `1.0`.
		 * @param {number} b - Blue channel value between `0.0` and `1.0`.
		 * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
		 * @return {Color} A reference to this color.
		 */
		setRGB( r, g, b, colorSpace = ColorManagement.workingColorSpace ) {

			this.r = r;
			this.g = g;
			this.b = b;

			ColorManagement.colorSpaceToWorking( this, colorSpace );

			return this;

		}

		/**
		 * Sets this color from RGB values.
		 *
		 * @param {number} h - Hue value between `0.0` and `1.0`.
		 * @param {number} s - Saturation value between `0.0` and `1.0`.
		 * @param {number} l - Lightness value between `0.0` and `1.0`.
		 * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
		 * @return {Color} A reference to this color.
		 */
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

			ColorManagement.colorSpaceToWorking( this, colorSpace );

			return this;

		}

		/**
		 * Sets this color from a CSS-style string. For example, `rgb(250, 0,0)`,
		 * `rgb(100%, 0%, 0%)`, `hsl(0, 100%, 50%)`, `#ff0000`, `#f00`, or `red` ( or
		 * any [X11 color name]{@link https://en.wikipedia.org/wiki/X11_color_names#Color_name_chart} -
		 * all 140 color names are supported).
		 *
		 * @param {string} style - Color as a CSS-style string.
		 * @param {string} [colorSpace=SRGBColorSpace] - The color space.
		 * @return {Color} A reference to this color.
		 */
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

		/**
		 * Sets this color from a color name. Faster than {@link Color#setStyle} if
		 * you don't need the other CSS-style formats.
		 *
		 * For convenience, the list of names is exposed in `Color.NAMES` as a hash.
		 * ```js
		 * Color.NAMES.aliceblue // returns 0xF0F8FF
		 * ```
		 *
		 * @param {string} style - The color name.
		 * @param {string} [colorSpace=SRGBColorSpace] - The color space.
		 * @return {Color} A reference to this color.
		 */
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

		/**
		 * Returns a new color with copied values from this instance.
		 *
		 * @return {Color} A clone of this instance.
		 */
		clone() {

			return new this.constructor( this.r, this.g, this.b );

		}

		/**
		 * Copies the values of the given color to this instance.
		 *
		 * @param {Color} color - The color to copy.
		 * @return {Color} A reference to this color.
		 */
		copy( color ) {

			this.r = color.r;
			this.g = color.g;
			this.b = color.b;

			return this;

		}

		/**
		 * Copies the given color into this color, and then converts this color from
		 * `SRGBColorSpace` to `LinearSRGBColorSpace`.
		 *
		 * @param {Color} color - The color to copy/convert.
		 * @return {Color} A reference to this color.
		 */
		copySRGBToLinear( color ) {

			this.r = SRGBToLinear( color.r );
			this.g = SRGBToLinear( color.g );
			this.b = SRGBToLinear( color.b );

			return this;

		}

		/**
		 * Copies the given color into this color, and then converts this color from
		 * `LinearSRGBColorSpace` to `SRGBColorSpace`.
		 *
		 * @param {Color} color - The color to copy/convert.
		 * @return {Color} A reference to this color.
		 */
		copyLinearToSRGB( color ) {

			this.r = LinearToSRGB( color.r );
			this.g = LinearToSRGB( color.g );
			this.b = LinearToSRGB( color.b );

			return this;

		}

		/**
		 * Converts this color from `SRGBColorSpace` to `LinearSRGBColorSpace`.
		 *
		 * @return {Color} A reference to this color.
		 */
		convertSRGBToLinear() {

			this.copySRGBToLinear( this );

			return this;

		}

		/**
		 * Converts this color from `LinearSRGBColorSpace` to `SRGBColorSpace`.
		 *
		 * @return {Color} A reference to this color.
		 */
		convertLinearToSRGB() {

			this.copyLinearToSRGB( this );

			return this;

		}

		/**
		 * Returns the hexadecimal value of this color.
		 *
		 * @param {string} [colorSpace=SRGBColorSpace] - The color space.
		 * @return {number} The hexadecimal value.
		 */
		getHex( colorSpace = SRGBColorSpace ) {

			ColorManagement.workingToColorSpace( _color.copy( this ), colorSpace );

			return Math.round( clamp( _color.r * 255, 0, 255 ) ) * 65536 + Math.round( clamp( _color.g * 255, 0, 255 ) ) * 256 + Math.round( clamp( _color.b * 255, 0, 255 ) );

		}

		/**
		 * Returns the hexadecimal value of this color as a string (for example, 'FFFFFF').
		 *
		 * @param {string} [colorSpace=SRGBColorSpace] - The color space.
		 * @return {string} The hexadecimal value as a string.
		 */
		getHexString( colorSpace = SRGBColorSpace ) {

			return ( '000000' + this.getHex( colorSpace ).toString( 16 ) ).slice( - 6 );

		}

		/**
		 * Converts the colors RGB values into the HSL format and stores them into the
		 * given target object.
		 *
		 * @param {{h:number,s:number,l:number}} target - The target object that is used to store the method's result.
		 * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
		 * @return {{h:number,s:number,l:number}} The HSL representation of this color.
		 */
		getHSL( target, colorSpace = ColorManagement.workingColorSpace ) {

			// h,s,l ranges are in 0.0 - 1.0

			ColorManagement.workingToColorSpace( _color.copy( this ), colorSpace );

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

		/**
		 * Returns the RGB values of this color and stores them into the given target object.
		 *
		 * @param {Color} target - The target color that is used to store the method's result.
		 * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
		 * @return {Color} The RGB representation of this color.
		 */
		getRGB( target, colorSpace = ColorManagement.workingColorSpace ) {

			ColorManagement.workingToColorSpace( _color.copy( this ), colorSpace );

			target.r = _color.r;
			target.g = _color.g;
			target.b = _color.b;

			return target;

		}

		/**
		 * Returns the value of this color as a CSS style string. Example: `rgb(255,0,0)`.
		 *
		 * @param {string} [colorSpace=SRGBColorSpace] - The color space.
		 * @return {string} The CSS representation of this color.
		 */
		getStyle( colorSpace = SRGBColorSpace ) {

			ColorManagement.workingToColorSpace( _color.copy( this ), colorSpace );

			const r = _color.r, g = _color.g, b = _color.b;

			if ( colorSpace !== SRGBColorSpace ) {

				// Requires CSS Color Module Level 4 (https://www.w3.org/TR/css-color-4/).
				return `color(${ colorSpace } ${ r.toFixed( 3 ) } ${ g.toFixed( 3 ) } ${ b.toFixed( 3 ) })`;

			}

			return `rgb(${ Math.round( r * 255 ) },${ Math.round( g * 255 ) },${ Math.round( b * 255 ) })`;

		}

		/**
		 * Adds the given HSL values to this color's values.
		 * Internally, this converts the color's RGB values to HSL, adds HSL
		 * and then converts the color back to RGB.
		 *
		 * @param {number} h - Hue value between `0.0` and `1.0`.
		 * @param {number} s - Saturation value between `0.0` and `1.0`.
		 * @param {number} l - Lightness value between `0.0` and `1.0`.
		 * @return {Color} A reference to this color.
		 */
		offsetHSL( h, s, l ) {

			this.getHSL( _hslA );

			return this.setHSL( _hslA.h + h, _hslA.s + s, _hslA.l + l );

		}

		/**
		 * Adds the RGB values of the given color to the RGB values of this color.
		 *
		 * @param {Color} color - The color to add.
		 * @return {Color} A reference to this color.
		 */
		add( color ) {

			this.r += color.r;
			this.g += color.g;
			this.b += color.b;

			return this;

		}

		/**
		 * Adds the RGB values of the given colors and stores the result in this instance.
		 *
		 * @param {Color} color1 - The first color.
		 * @param {Color} color2 - The second color.
		 * @return {Color} A reference to this color.
		 */
		addColors( color1, color2 ) {

			this.r = color1.r + color2.r;
			this.g = color1.g + color2.g;
			this.b = color1.b + color2.b;

			return this;

		}

		/**
		 * Adds the given scalar value to the RGB values of this color.
		 *
		 * @param {number} s - The scalar to add.
		 * @return {Color} A reference to this color.
		 */
		addScalar( s ) {

			this.r += s;
			this.g += s;
			this.b += s;

			return this;

		}

		/**
		 * Subtracts the RGB values of the given color from the RGB values of this color.
		 *
		 * @param {Color} color - The color to subtract.
		 * @return {Color} A reference to this color.
		 */
		sub( color ) {

			this.r = Math.max( 0, this.r - color.r );
			this.g = Math.max( 0, this.g - color.g );
			this.b = Math.max( 0, this.b - color.b );

			return this;

		}

		/**
		 * Multiplies the RGB values of the given color with the RGB values of this color.
		 *
		 * @param {Color} color - The color to multiply.
		 * @return {Color} A reference to this color.
		 */
		multiply( color ) {

			this.r *= color.r;
			this.g *= color.g;
			this.b *= color.b;

			return this;

		}

		/**
		 * Multiplies the given scalar value with the RGB values of this color.
		 *
		 * @param {number} s - The scalar to multiply.
		 * @return {Color} A reference to this color.
		 */
		multiplyScalar( s ) {

			this.r *= s;
			this.g *= s;
			this.b *= s;

			return this;

		}

		/**
		 * Linearly interpolates this color's RGB values toward the RGB values of the
		 * given color. The alpha argument can be thought of as the ratio between
		 * the two colors, where `0.0` is this color and `1.0` is the first argument.
		 *
		 * @param {Color} color - The color to converge on.
		 * @param {number} alpha - The interpolation factor in the closed interval `[0,1]`.
		 * @return {Color} A reference to this color.
		 */
		lerp( color, alpha ) {

			this.r += ( color.r - this.r ) * alpha;
			this.g += ( color.g - this.g ) * alpha;
			this.b += ( color.b - this.b ) * alpha;

			return this;

		}

		/**
		 * Linearly interpolates between the given colors and stores the result in this instance.
		 * The alpha argument can be thought of as the ratio between the two colors, where `0.0`
		 * is the first and `1.0` is the second color.
		 *
		 * @param {Color} color1 - The first color.
		 * @param {Color} color2 - The second color.
		 * @param {number} alpha - The interpolation factor in the closed interval `[0,1]`.
		 * @return {Color} A reference to this color.
		 */
		lerpColors( color1, color2, alpha ) {

			this.r = color1.r + ( color2.r - color1.r ) * alpha;
			this.g = color1.g + ( color2.g - color1.g ) * alpha;
			this.b = color1.b + ( color2.b - color1.b ) * alpha;

			return this;

		}

		/**
		 * Linearly interpolates this color's HSL values toward the HSL values of the
		 * given color. It differs from {@link Color#lerp} by not interpolating straight
		 * from one color to the other, but instead going through all the hues in between
		 * those two colors. The alpha argument can be thought of as the ratio between
		 * the two colors, where 0.0 is this color and 1.0 is the first argument.
		 *
		 * @param {Color} color - The color to converge on.
		 * @param {number} alpha - The interpolation factor in the closed interval `[0,1]`.
		 * @return {Color} A reference to this color.
		 */
		lerpHSL( color, alpha ) {

			this.getHSL( _hslA );
			color.getHSL( _hslB );

			const h = lerp( _hslA.h, _hslB.h, alpha );
			const s = lerp( _hslA.s, _hslB.s, alpha );
			const l = lerp( _hslA.l, _hslB.l, alpha );

			this.setHSL( h, s, l );

			return this;

		}

		/**
		 * Sets the color's RGB components from the given 3D vector.
		 *
		 * @param {Vector3} v - The vector to set.
		 * @return {Color} A reference to this color.
		 */
		setFromVector3( v ) {

			this.r = v.x;
			this.g = v.y;
			this.b = v.z;

			return this;

		}

		/**
		 * Transforms this color with the given 3x3 matrix.
		 *
		 * @param {Matrix3} m - The matrix.
		 * @return {Color} A reference to this color.
		 */
		applyMatrix3( m ) {

			const r = this.r, g = this.g, b = this.b;
			const e = m.elements;

			this.r = e[ 0 ] * r + e[ 3 ] * g + e[ 6 ] * b;
			this.g = e[ 1 ] * r + e[ 4 ] * g + e[ 7 ] * b;
			this.b = e[ 2 ] * r + e[ 5 ] * g + e[ 8 ] * b;

			return this;

		}

		/**
		 * Returns `true` if this color is equal with the given one.
		 *
		 * @param {Color} c - The color to test for equality.
		 * @return {boolean} Whether this bounding color is equal with the given one.
		 */
		equals( c ) {

			return ( c.r === this.r ) && ( c.g === this.g ) && ( c.b === this.b );

		}

		/**
		 * Sets this color's RGB components from the given array.
		 *
		 * @param {Array<number>} array - An array holding the RGB values.
		 * @param {number} [offset=0] - The offset into the array.
		 * @return {Color} A reference to this color.
		 */
		fromArray( array, offset = 0 ) {

			this.r = array[ offset ];
			this.g = array[ offset + 1 ];
			this.b = array[ offset + 2 ];

			return this;

		}

		/**
		 * Writes the RGB components of this color to the given array. If no array is provided,
		 * the method returns a new instance.
		 *
		 * @param {Array<number>} [array=[]] - The target array holding the color components.
		 * @param {number} [offset=0] - Index of the first element in the array.
		 * @return {Array<number>} The color components.
		 */
		toArray( array = [], offset = 0 ) {

			array[ offset ] = this.r;
			array[ offset + 1 ] = this.g;
			array[ offset + 2 ] = this.b;

			return array;

		}

		/**
		 * Sets the components of this color from the given buffer attribute.
		 *
		 * @param {BufferAttribute} attribute - The buffer attribute holding color data.
		 * @param {number} index - The index into the attribute.
		 * @return {Color} A reference to this color.
		 */
		fromBufferAttribute( attribute, index ) {

			this.r = attribute.getX( index );
			this.g = attribute.getY( index );
			this.b = attribute.getZ( index );

			return this;

		}

		/**
		 * This methods defines the serialization result of this class. Returns the color
		 * as a hexadecimal value.
		 *
		 * @return {number} The hexadecimal value.
		 */
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

	/**
	 * A dictionary with X11 color names.
	 *
	 * Note that multiple words such as Dark Orange become the string 'darkorange'.
	 *
	 * @static
	 * @type {Object}
	 */
	Color.NAMES = _colorKeywords;

	const _vector$9 = /*@__PURE__*/ new Vector3();
	const _vector2$1 = /*@__PURE__*/ new Vector2();

	let _id$2 = 0;

	/**
	 * This class stores data for an attribute (such as vertex positions, face
	 * indices, normals, colors, UVs, and any custom attributes ) associated with
	 * a geometry, which allows for more efficient passing of data to the GPU.
	 *
	 * When working with vector-like data, the `fromBufferAttribute( attribute, index )`
	 * helper methods on vector and color class might be helpful. E.g. {@link Vector3#fromBufferAttribute}.
	 */
	class BufferAttribute {

		/**
		 * Constructs a new buffer attribute.
		 *
		 * @param {TypedArray} array - The array holding the attribute data.
		 * @param {number} itemSize - The item size.
		 * @param {boolean} [normalized=false] - Whether the data are normalized or not.
		 */
		constructor( array, itemSize, normalized = false ) {

			if ( Array.isArray( array ) ) {

				throw new TypeError( 'THREE.BufferAttribute: array should be a Typed Array.' );

			}

			/**
			 * This flag can be used for type testing.
			 *
			 * @type {boolean}
			 * @readonly
			 * @default true
			 */
			this.isBufferAttribute = true;

			/**
			 * The ID of the buffer attribute.
			 *
			 * @name BufferAttribute#id
			 * @type {number}
			 * @readonly
			 */
			Object.defineProperty( this, 'id', { value: _id$2 ++ } );

			/**
			 * The name of the buffer attribute.
			 *
			 * @type {string}
			 */
			this.name = '';

			/**
			 * The array holding the attribute data. It should have `itemSize * numVertices`
			 * elements, where `numVertices` is the number of vertices in the associated geometry.
			 *
			 * @type {TypedArray}
			 */
			this.array = array;

			/**
			 * The number of values of the array that should be associated with a particular vertex.
			 * For instance, if this attribute is storing a 3-component vector (such as a position,
			 * normal, or color), then the value should be `3`.
			 *
			 * @type {number}
			 */
			this.itemSize = itemSize;

			/**
			 * Represents the number of items this buffer attribute stores. It is internally computed
			 * by dividing the `array` length by the `itemSize`.
			 *
			 * @type {number}
			 * @readonly
			 */
			this.count = array !== undefined ? array.length / itemSize : 0;

			/**
			 * Applies to integer data only. Indicates how the underlying data in the buffer maps to
			 * the values in the GLSL code. For instance, if `array` is an instance of `UInt16Array`,
			 * and `normalized` is `true`, the values `0 -+65535` in the array data will be mapped to
			 * `0.0f - +1.0f` in the GLSL attribute. If `normalized` is `false`, the values will be converted
			 * to floats unmodified, i.e. `65535` becomes `65535.0f`.
			 *
			 * @type {boolean}
			 */
			this.normalized = normalized;

			/**
			 * Defines the intended usage pattern of the data store for optimization purposes.
			 *
			 * Note: After the initial use of a buffer, its usage cannot be changed. Instead,
			 * instantiate a new one and set the desired usage before the next render.
			 *
			 * @type {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)}
			 * @default StaticDrawUsage
			 */
			this.usage = StaticDrawUsage;

			/**
			 * This can be used to only update some components of stored vectors (for example, just the
			 * component related to color). Use the `addUpdateRange()` function to add ranges to this array.
			 *
			 * @type {Array<Object>}
			 */
			this.updateRanges = [];

			/**
			 * Configures the bound GPU type for use in shaders.
			 *
			 * Note: this only has an effect for integer arrays and is not configurable for float arrays.
			 * For lower precision float types, use `Float16BufferAttribute`.
			 *
			 * @type {(FloatType|IntType)}
			 * @default FloatType
			 */
			this.gpuType = FloatType;

			/**
			 * A version number, incremented every time the `needsUpdate` is set to `true`.
			 *
			 * @type {number}
			 */
			this.version = 0;

		}

		/**
		 * A callback function that is executed after the renderer has transferred the attribute
		 * array data to the GPU.
		 */
		onUploadCallback() {}

		/**
		 * Flag to indicate that this attribute has changed and should be re-sent to
		 * the GPU. Set this to `true` when you modify the value of the array.
		 *
		 * @type {number}
		 * @default false
		 * @param {boolean} value
		 */
		set needsUpdate( value ) {

			if ( value === true ) this.version ++;

		}

		/**
		 * Sets the usage of this buffer attribute.
		 *
		 * @param {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)} value - The usage to set.
		 * @return {BufferAttribute} A reference to this buffer attribute.
		 */
		setUsage( value ) {

			this.usage = value;

			return this;

		}

		/**
		 * Adds a range of data in the data array to be updated on the GPU.
		 *
		 * @param {number} start - Position at which to start update.
		 * @param {number} count - The number of components to update.
		 */
		addUpdateRange( start, count ) {

			this.updateRanges.push( { start, count } );

		}

		/**
		 * Clears the update ranges.
		 */
		clearUpdateRanges() {

			this.updateRanges.length = 0;

		}

		/**
		 * Copies the values of the given buffer attribute to this instance.
		 *
		 * @param {BufferAttribute} source - The buffer attribute to copy.
		 * @return {BufferAttribute} A reference to this instance.
		 */
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

		/**
		 * Copies a vector from the given buffer attribute to this one. The start
		 * and destination position in the attribute buffers are represented by the
		 * given indices.
		 *
		 * @param {number} index1 - The destination index into this buffer attribute.
		 * @param {BufferAttribute} attribute - The buffer attribute to copy from.
		 * @param {number} index2 - The source index into the given buffer attribute.
		 * @return {BufferAttribute} A reference to this instance.
		 */
		copyAt( index1, attribute, index2 ) {

			index1 *= this.itemSize;
			index2 *= attribute.itemSize;

			for ( let i = 0, l = this.itemSize; i < l; i ++ ) {

				this.array[ index1 + i ] = attribute.array[ index2 + i ];

			}

			return this;

		}

		/**
		 * Copies the given array data into this buffer attribute.
		 *
		 * @param {(TypedArray|Array)} array - The array to copy.
		 * @return {BufferAttribute} A reference to this instance.
		 */
		copyArray( array ) {

			this.array.set( array );

			return this;

		}

		/**
		 * Applies the given 3x3 matrix to the given attribute. Works with
		 * item size `2` and `3`.
		 *
		 * @param {Matrix3} m - The matrix to apply.
		 * @return {BufferAttribute} A reference to this instance.
		 */
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

		/**
		 * Applies the given 4x4 matrix to the given attribute. Only works with
		 * item size `3`.
		 *
		 * @param {Matrix4} m - The matrix to apply.
		 * @return {BufferAttribute} A reference to this instance.
		 */
		applyMatrix4( m ) {

			for ( let i = 0, l = this.count; i < l; i ++ ) {

				_vector$9.fromBufferAttribute( this, i );

				_vector$9.applyMatrix4( m );

				this.setXYZ( i, _vector$9.x, _vector$9.y, _vector$9.z );

			}

			return this;

		}

		/**
		 * Applies the given 3x3 normal matrix to the given attribute. Only works with
		 * item size `3`.
		 *
		 * @param {Matrix3} m - The normal matrix to apply.
		 * @return {BufferAttribute} A reference to this instance.
		 */
		applyNormalMatrix( m ) {

			for ( let i = 0, l = this.count; i < l; i ++ ) {

				_vector$9.fromBufferAttribute( this, i );

				_vector$9.applyNormalMatrix( m );

				this.setXYZ( i, _vector$9.x, _vector$9.y, _vector$9.z );

			}

			return this;

		}

		/**
		 * Applies the given 4x4 matrix to the given attribute. Only works with
		 * item size `3` and with direction vectors.
		 *
		 * @param {Matrix4} m - The matrix to apply.
		 * @return {BufferAttribute} A reference to this instance.
		 */
		transformDirection( m ) {

			for ( let i = 0, l = this.count; i < l; i ++ ) {

				_vector$9.fromBufferAttribute( this, i );

				_vector$9.transformDirection( m );

				this.setXYZ( i, _vector$9.x, _vector$9.y, _vector$9.z );

			}

			return this;

		}

		/**
		 * Sets the given array data in the buffer attribute.
		 *
		 * @param {(TypedArray|Array)} value - The array data to set.
		 * @param {number} [offset=0] - The offset in this buffer attribute's array.
		 * @return {BufferAttribute} A reference to this instance.
		 */
		set( value, offset = 0 ) {

			// Matching BufferAttribute constructor, do not normalize the array.
			this.array.set( value, offset );

			return this;

		}

		/**
		 * Returns the given component of the vector at the given index.
		 *
		 * @param {number} index - The index into the buffer attribute.
		 * @param {number} component - The component index.
		 * @return {number} The returned value.
		 */
		getComponent( index, component ) {

			let value = this.array[ index * this.itemSize + component ];

			if ( this.normalized ) value = denormalize( value, this.array );

			return value;

		}

		/**
		 * Sets the given value to the given component of the vector at the given index.
		 *
		 * @param {number} index - The index into the buffer attribute.
		 * @param {number} component - The component index.
		 * @param {number} value - The value to set.
		 * @return {BufferAttribute} A reference to this instance.
		 */
		setComponent( index, component, value ) {

			if ( this.normalized ) value = normalize( value, this.array );

			this.array[ index * this.itemSize + component ] = value;

			return this;

		}

		/**
		 * Returns the x component of the vector at the given index.
		 *
		 * @param {number} index - The index into the buffer attribute.
		 * @return {number} The x component.
		 */
		getX( index ) {

			let x = this.array[ index * this.itemSize ];

			if ( this.normalized ) x = denormalize( x, this.array );

			return x;

		}

		/**
		 * Sets the x component of the vector at the given index.
		 *
		 * @param {number} index - The index into the buffer attribute.
		 * @param {number} x - The value to set.
		 * @return {BufferAttribute} A reference to this instance.
		 */
		setX( index, x ) {

			if ( this.normalized ) x = normalize( x, this.array );

			this.array[ index * this.itemSize ] = x;

			return this;

		}

		/**
		 * Returns the y component of the vector at the given index.
		 *
		 * @param {number} index - The index into the buffer attribute.
		 * @return {number} The y component.
		 */
		getY( index ) {

			let y = this.array[ index * this.itemSize + 1 ];

			if ( this.normalized ) y = denormalize( y, this.array );

			return y;

		}

		/**
		 * Sets the y component of the vector at the given index.
		 *
		 * @param {number} index - The index into the buffer attribute.
		 * @param {number} y - The value to set.
		 * @return {BufferAttribute} A reference to this instance.
		 */
		setY( index, y ) {

			if ( this.normalized ) y = normalize( y, this.array );

			this.array[ index * this.itemSize + 1 ] = y;

			return this;

		}

		/**
		 * Returns the z component of the vector at the given index.
		 *
		 * @param {number} index - The index into the buffer attribute.
		 * @return {number} The z component.
		 */
		getZ( index ) {

			let z = this.array[ index * this.itemSize + 2 ];

			if ( this.normalized ) z = denormalize( z, this.array );

			return z;

		}

		/**
		 * Sets the z component of the vector at the given index.
		 *
		 * @param {number} index - The index into the buffer attribute.
		 * @param {number} z - The value to set.
		 * @return {BufferAttribute} A reference to this instance.
		 */
		setZ( index, z ) {

			if ( this.normalized ) z = normalize( z, this.array );

			this.array[ index * this.itemSize + 2 ] = z;

			return this;

		}

		/**
		 * Returns the w component of the vector at the given index.
		 *
		 * @param {number} index - The index into the buffer attribute.
		 * @return {number} The w component.
		 */
		getW( index ) {

			let w = this.array[ index * this.itemSize + 3 ];

			if ( this.normalized ) w = denormalize( w, this.array );

			return w;

		}

		/**
		 * Sets the w component of the vector at the given index.
		 *
		 * @param {number} index - The index into the buffer attribute.
		 * @param {number} w - The value to set.
		 * @return {BufferAttribute} A reference to this instance.
		 */
		setW( index, w ) {

			if ( this.normalized ) w = normalize( w, this.array );

			this.array[ index * this.itemSize + 3 ] = w;

			return this;

		}

		/**
		 * Sets the x and y component of the vector at the given index.
		 *
		 * @param {number} index - The index into the buffer attribute.
		 * @param {number} x - The value for the x component to set.
		 * @param {number} y - The value for the y component to set.
		 * @return {BufferAttribute} A reference to this instance.
		 */
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

		/**
		 * Sets the x, y and z component of the vector at the given index.
		 *
		 * @param {number} index - The index into the buffer attribute.
		 * @param {number} x - The value for the x component to set.
		 * @param {number} y - The value for the y component to set.
		 * @param {number} z - The value for the z component to set.
		 * @return {BufferAttribute} A reference to this instance.
		 */
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

		/**
		 * Sets the x, y, z and w component of the vector at the given index.
		 *
		 * @param {number} index - The index into the buffer attribute.
		 * @param {number} x - The value for the x component to set.
		 * @param {number} y - The value for the y component to set.
		 * @param {number} z - The value for the z component to set.
		 * @param {number} w - The value for the w component to set.
		 * @return {BufferAttribute} A reference to this instance.
		 */
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

		/**
		 * Sets the given callback function that is executed after the Renderer has transferred
		 * the attribute array data to the GPU. Can be used to perform clean-up operations after
		 * the upload when attribute data are not needed anymore on the CPU side.
		 *
		 * @param {Function} callback - The `onUpload()` callback.
		 * @return {BufferAttribute} A reference to this instance.
		 */
		onUpload( callback ) {

			this.onUploadCallback = callback;

			return this;

		}

		/**
		 * Returns a new buffer attribute with copied values from this instance.
		 *
		 * @return {BufferAttribute} A clone of this instance.
		 */
		clone() {

			return new this.constructor( this.array, this.itemSize ).copy( this );

		}

		/**
		 * Serializes the buffer attribute into JSON.
		 *
		 * @return {Object} A JSON object representing the serialized buffer attribute.
		 */
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

	/**
	 * Scenes allow you to set up what is to be rendered and where by three.js.
	 * This is where you place 3D objects like meshes, lines or lights.
	 *
	 * @augments Object3D
	 */
	class Scene extends Object3D {

		/**
		 * Constructs a new scene.
		 */
		constructor() {

			super();

			/**
			 * This flag can be used for type testing.
			 *
			 * @type {boolean}
			 * @readonly
			 * @default true
			 */
			this.isScene = true;

			this.type = 'Scene';

			/**
			 * Defines the background of the scene. Valid inputs are:
			 *
			 * - A color for defining a uniform colored background.
			 * - A texture for defining a (flat) textured background.
			 * - Cube textures or equirectangular textures for defining a skybox.
			 *
			 * @type {?(Color|Texture)}
			 * @default null
			 */
			this.background = null;

			/**
			 * Sets the environment map for all physical materials in the scene. However,
			 * it's not possible to overwrite an existing texture assigned to the `envMap`
			 * material property.
			 *
			 * @type {?Texture}
			 * @default null
			 */
			this.environment = null;

			/**
			 * A fog instance defining the type of fog that affects everything
			 * rendered in the scene.
			 *
			 * @type {?(Fog|FogExp2)}
			 * @default null
			 */
			this.fog = null;

			/**
			 * Sets the blurriness of the background. Only influences environment maps
			 * assigned to {@link Scene#background}. Valid input is a float between `0`
			 * and `1`.
			 *
			 * @type {number}
			 * @default 0
			 */
			this.backgroundBlurriness = 0;

			/**
			 * Attenuates the color of the background. Only applies to background textures.
			 *
			 * @type {number}
			 * @default 1
			 */
			this.backgroundIntensity = 1;

			/**
			 * The rotation of the background in radians. Only influences environment maps
			 * assigned to {@link Scene#background}.
			 *
			 * @type {Euler}
			 * @default (0,0,0)
			 */
			this.backgroundRotation = new Euler();

			/**
			 * Attenuates the color of the environment. Only influences environment maps
			 * assigned to {@link Scene#environment}.
			 *
			 * @type {number}
			 * @default 1
			 */
			this.environmentIntensity = 1;

			/**
			 * The rotation of the environment map in radians. Only influences physical materials
			 * in the scene when {@link Scene#environment} is used.
			 *
			 * @type {Euler}
			 * @default (0,0,0)
			 */
			this.environmentRotation = new Euler();

			/**
			 * Forces everything in the scene to be rendered with the defined material. It is possible
			 * to exclude materials from override by setting {@link Material#allowOverride} to `false`.
			 *
			 * @type {?Material}
			 * @default null
			 */
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

	/**
	 * Creates a texture based on data in compressed form.
	 *
	 * These texture are usually loaded with {@link CompressedTextureLoader}.
	 *
	 * @augments Texture
	 */
	class CompressedTexture extends Texture {

		/**
		 * Constructs a new compressed texture.
		 *
		 * @param {Array<Object>} mipmaps - This array holds for all mipmaps (including the bases mip)
		 * the data and dimensions.
		 * @param {number} width - The width of the texture.
		 * @param {number} height - The height of the texture.
		 * @param {number} [format=RGBAFormat] - The texture format.
		 * @param {number} [type=UnsignedByteType] - The texture type.
		 * @param {number} [mapping=Texture.DEFAULT_MAPPING] - The texture mapping.
		 * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
		 * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
		 * @param {number} [magFilter=LinearFilter] - The mag filter value.
		 * @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
		 * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
		 * @param {string} [colorSpace=NoColorSpace] - The color space.
		 */
		constructor( mipmaps, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, colorSpace ) {

			super( null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace );

			/**
			 * This flag can be used for type testing.
			 *
			 * @type {boolean}
			 * @readonly
			 * @default true
			 */
			this.isCompressedTexture = true;

			/**
			 * The image property of a compressed texture just defines its dimensions.
			 *
			 * @type {{width:number,height:number}}
			 */
			this.image = { width: width, height: height };

			/**
			 * This array holds for all mipmaps (including the bases mip) the data and dimensions.
			 *
			 * @type {Array<Object>}
			 */
			this.mipmaps = mipmaps;

			/**
			 * If set to `true`, the texture is flipped along the vertical axis when
			 * uploaded to the GPU.
			 *
			 * Overwritten and set to `false` by default since it is not possible to
			 * flip compressed textures.
			 *
			 * @type {boolean}
			 * @default false
			 * @readonly
			 */
			this.flipY = false;

			/**
			 * Whether to generate mipmaps (if possible) for a texture.
			 *
			 * Overwritten and set to `false` by default since it is not
			 * possible to generate mipmaps for compressed data. Mipmaps
			 * must be embedded in the compressed texture file.
			 *
			 * @type {boolean}
			 * @default false
			 * @readonly
			 */
			this.generateMipmaps = false;

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


	/**
	 * This holds a reference to a real property in the scene graph; used internally.
	 */
	class PropertyBinding {

		/**
		 * Constructs a new property binding.
		 *
		 * @param {Object} rootNode - The root node.
		 * @param {string} path - The path.
		 * @param {?Object} [parsedPath] - The parsed path.
		 */
		constructor( rootNode, path, parsedPath ) {

			/**
			 * The object path to the animated property.
			 *
			 * @type {string}
			 */
			this.path = path;

			/**
			 * An object holding information about the path.
			 *
			 * @type {Object}
			 */
			this.parsedPath = parsedPath || PropertyBinding.parseTrackName( path );

			/**
			 * The object owns the animated property.
			 *
			 * @type {?Object}
			 */
			this.node = PropertyBinding.findNode( rootNode, this.parsedPath.nodeName );

			/**
			 * The root node.
			 *
			 * @type {Object3D|Skeleton}
			 */
			this.rootNode = rootNode;

			// initial state of these methods that calls 'bind'
			this.getValue = this._getValue_unbound;
			this.setValue = this._setValue_unbound;

		}


		/**
		 * Factory method for creating a property binding from the given parameters.
		 *
		 * @static
		 * @param {Object} root - The root node.
		 * @param {string} path - The path.
		 * @param {?Object} [parsedPath] - The parsed path.
		 * @return {PropertyBinding|Composite} The created property binding or composite.
		 */
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
		 * @param {string} name - Node name to be sanitized.
		 * @return {string} The sanitized node name.
		 */
		static sanitizeNodeName( name ) {

			return name.replace( /\s/g, '_' ).replace( _reservedRe, '' );

		}

		/**
		 * Parses the given track name (an object path to an animated property) and
		 * returns an object with information about the path. Matches strings in the following forms:
		 *
		 * - nodeName.property
		 * - nodeName.property[accessor]
		 * - nodeName.material.property[accessor]
		 * - uuid.property[accessor]
		 * - uuid.objectName[objectIndex].propertyName[propertyIndex]
		 * - parentName/nodeName.property
		 * - parentName/parentName/nodeName.property[index]
		 * - .bone[Armature.DEF_cog].position
		 * - scene:helium_balloon_model:helium_balloon_model.position
		 *
		 * @static
		 * @param {string} trackName - The track name to parse.
		 * @return {Object} The parsed track name as an object.
		 */
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

		/**
		 * Searches for a node in the hierarchy of the given root object by the given
		 * node name.
		 *
		 * @static
		 * @param {Object} root - The root object.
		 * @param {string|number} nodeName - The name of the node.
		 * @return {?Object} The found node. Returns `null` if no object was found.
		 */
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

		/**
		 * Creates a getter / setter pair for the property tracked by this binding.
		 */
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

		/**
		 * Unbinds the property.
		 */
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

	/**
	 * The KHR_mesh_quantization extension allows these extra attribute component types
	 *
	 * @see https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_mesh_quantization/README.md#extending-mesh-attributes
	 */
	const KHR_mesh_quantization_ExtraAttrTypes = {
		POSITION: [
			'byte',
			'byte normalized',
			'unsigned byte',
			'unsigned byte normalized',
			'short',
			'short normalized',
			'unsigned short',
			'unsigned short normalized',
		],
		NORMAL: [
			'byte normalized',
			'short normalized',
		],
		TANGENT: [
			'byte normalized',
			'short normalized',
		],
		TEXCOORD: [
			'byte',
			'byte normalized',
			'unsigned byte',
			'short',
			'short normalized',
			'unsigned short',
		],
	};

	/**
	 * An exporter for `glTF` 2.0.
	 *
	 * glTF (GL Transmission Format) is an [open format specification]{@link https://github.com/KhronosGroup/glTF/tree/master/specification/2.0}
	 * for efficient delivery and loading of 3D content. Assets may be provided either in JSON (.gltf)
	 * or binary (.glb) format. External files store textures (.jpg, .png) and additional binary
	 * data (.bin). A glTF asset may deliver one or more scenes, including meshes, materials,
	 * textures, skins, skeletons, morph targets, animations, lights, and/or cameras.
	 *
	 * GLTFExporter supports the [glTF 2.0 extensions]{@link https://github.com/KhronosGroup/glTF/tree/master/extensions/}:
	 *
	 * - KHR_lights_punctual
	 * - KHR_materials_clearcoat
	 * - KHR_materials_dispersion
	 * - KHR_materials_emissive_strength
	 * - KHR_materials_ior
	 * - KHR_materials_iridescence
	 * - KHR_materials_specular
	 * - KHR_materials_sheen
	 * - KHR_materials_transmission
	 * - KHR_materials_unlit
	 * - KHR_materials_volume
	 * - KHR_mesh_quantization
	 * - KHR_texture_transform
	 * - EXT_materials_bump
	 * - EXT_mesh_gpu_instancing
	 *
	 * The following glTF 2.0 extension is supported by an external user plugin:
	 *
	 * - [KHR_materials_variants]{@link https://github.com/takahirox/three-gltf-extensions}
	 *
	 * ```js
	 * const exporter = new GLTFExporter();
	 * const data = await exporter.parseAsync( scene, options );
	 * ```
	 *
	 * @three_import import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
	 */
	class GLTFExporter {

		/**
		 * Constructs a new glTF exporter.
		 */
		constructor() {

			/**
			 * A reference to a texture utils module.
			 *
			 * @type {?(WebGLTextureUtils|WebGPUTextureUtils)}
			 * @default null
			 */
			this.textureUtils = null;

			this.pluginCallbacks = [];

			this.register( function ( writer ) {

				return new GLTFLightExtension( writer );

			} );

			this.register( function ( writer ) {

				return new GLTFMaterialsUnlitExtension( writer );

			} );

			this.register( function ( writer ) {

				return new GLTFMaterialsTransmissionExtension( writer );

			} );

			this.register( function ( writer ) {

				return new GLTFMaterialsVolumeExtension( writer );

			} );

			this.register( function ( writer ) {

				return new GLTFMaterialsIorExtension( writer );

			} );

			this.register( function ( writer ) {

				return new GLTFMaterialsSpecularExtension( writer );

			} );

			this.register( function ( writer ) {

				return new GLTFMaterialsClearcoatExtension( writer );

			} );

			this.register( function ( writer ) {

				return new GLTFMaterialsDispersionExtension( writer );

			} );

			this.register( function ( writer ) {

				return new GLTFMaterialsIridescenceExtension( writer );

			} );

			this.register( function ( writer ) {

				return new GLTFMaterialsSheenExtension( writer );

			} );

			this.register( function ( writer ) {

				return new GLTFMaterialsAnisotropyExtension( writer );

			} );

			this.register( function ( writer ) {

				return new GLTFMaterialsEmissiveStrengthExtension( writer );

			} );

			this.register( function ( writer ) {

				return new GLTFMaterialsBumpExtension( writer );

			} );

			this.register( function ( writer ) {

				return new GLTFMeshGpuInstancing( writer );

			} );

		}

		/**
		 * Registers a plugin callback. This API is internally used to implement the various
		 * glTF extensions but can also used by third-party code to add additional logic
		 * to the exporter.
		 *
		 * @param {function(writer:GLTFWriter)} callback - The callback function to register.
		 * @return {GLTFExporter} A reference to this exporter.
		 */
		register( callback ) {

			if ( this.pluginCallbacks.indexOf( callback ) === - 1 ) {

				this.pluginCallbacks.push( callback );

			}

			return this;

		}

		/**
		 * Unregisters a plugin callback.
		 *
		 * @param {Function} callback - The callback function to unregister.
		 * @return {GLTFExporter} A reference to this exporter.
		 */
		unregister( callback ) {

			if ( this.pluginCallbacks.indexOf( callback ) !== - 1 ) {

				this.pluginCallbacks.splice( this.pluginCallbacks.indexOf( callback ), 1 );

			}

			return this;

		}

		/**
		 * Sets the texture utils for this exporter. Only relevant when compressed textures have to be exported.
		 *
		 * Depending on whether you use {@link WebGLRenderer} or {@link WebGPURenderer}, you must inject the
		 * corresponding texture utils {@link WebGLTextureUtils} or {@link WebGPUTextureUtils}.
		 *
		 * @param {WebGLTextureUtils|WebGPUTextureUtils} utils - The texture utils.
		 * @return {GLTFExporter} A reference to this exporter.
		 */
		setTextureUtils( utils ) {

			this.textureUtils = utils;

			return this;

		}

		/**
		 * Parses the given scenes and generates the glTF output.
		 *
		 * @param {Scene|Array<Scene>} input - A scene or an array of scenes.
		 * @param {GLTFExporter~OnDone} onDone - A callback function that is executed when the export has finished.
		 * @param {GLTFExporter~OnError} onError - A callback function that is executed when an error happens.
		 * @param {GLTFExporter~Options} options - options
		 */
		parse( input, onDone, onError, options ) {

			const writer = new GLTFWriter();
			const plugins = [];

			for ( let i = 0, il = this.pluginCallbacks.length; i < il; i ++ ) {

				plugins.push( this.pluginCallbacks[ i ]( writer ) );

			}

			writer.setPlugins( plugins );
			writer.setTextureUtils( this.textureUtils );
			writer.writeAsync( input, onDone, options ).catch( onError );

		}

		/**
		 * Async version of {@link GLTFExporter#parse}.
		 *
		 * @param {Scene|Array<Scene>} input - A scene or an array of scenes.
		 * @param {GLTFExporter~Options} options - options.
		 * @return {Promise<ArrayBuffer|string>} A Promise that resolved with the exported glTF data.
		 */
		parseAsync( input, options ) {

			const scope = this;

			return new Promise( function ( resolve, reject ) {

				scope.parse( input, resolve, reject, options );

			} );

		}

	}

	//------------------------------------------------------------------------------
	// Constants
	//------------------------------------------------------------------------------

	const WEBGL_CONSTANTS = {
		POINTS: 0x0000,
		LINES: 0x0001,
		LINE_LOOP: 0x0002,
		LINE_STRIP: 0x0003,
		TRIANGLES: 0x0004,
		BYTE: 0x1400,
		UNSIGNED_BYTE: 0x1401,
		SHORT: 0x1402,
		UNSIGNED_SHORT: 0x1403,
		INT: 0x1404,
		UNSIGNED_INT: 0x1405,
		FLOAT: 0x1406,

		ARRAY_BUFFER: 0x8892,
		ELEMENT_ARRAY_BUFFER: 0x8893,

		NEAREST: 0x2600,
		LINEAR: 0x2601,
		NEAREST_MIPMAP_NEAREST: 0x2700,
		LINEAR_MIPMAP_NEAREST: 0x2701,
		NEAREST_MIPMAP_LINEAR: 0x2702,
		LINEAR_MIPMAP_LINEAR: 0x2703,

		CLAMP_TO_EDGE: 33071,
		MIRRORED_REPEAT: 33648,
		REPEAT: 10497
	};

	const KHR_MESH_QUANTIZATION = 'KHR_mesh_quantization';

	const THREE_TO_WEBGL = {};

	THREE_TO_WEBGL[ NearestFilter ] = WEBGL_CONSTANTS.NEAREST;
	THREE_TO_WEBGL[ NearestMipmapNearestFilter ] = WEBGL_CONSTANTS.NEAREST_MIPMAP_NEAREST;
	THREE_TO_WEBGL[ NearestMipmapLinearFilter ] = WEBGL_CONSTANTS.NEAREST_MIPMAP_LINEAR;
	THREE_TO_WEBGL[ LinearFilter ] = WEBGL_CONSTANTS.LINEAR;
	THREE_TO_WEBGL[ LinearMipmapNearestFilter ] = WEBGL_CONSTANTS.LINEAR_MIPMAP_NEAREST;
	THREE_TO_WEBGL[ LinearMipmapLinearFilter ] = WEBGL_CONSTANTS.LINEAR_MIPMAP_LINEAR;

	THREE_TO_WEBGL[ ClampToEdgeWrapping ] = WEBGL_CONSTANTS.CLAMP_TO_EDGE;
	THREE_TO_WEBGL[ RepeatWrapping ] = WEBGL_CONSTANTS.REPEAT;
	THREE_TO_WEBGL[ MirroredRepeatWrapping ] = WEBGL_CONSTANTS.MIRRORED_REPEAT;

	const PATH_PROPERTIES = {
		scale: 'scale',
		position: 'translation',
		quaternion: 'rotation',
		morphTargetInfluences: 'weights'
	};

	const DEFAULT_SPECULAR_COLOR = new Color();

	// GLB constants
	// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#glb-file-format-specification

	const GLB_HEADER_BYTES = 12;
	const GLB_HEADER_MAGIC = 0x46546C67;
	const GLB_VERSION = 2;

	const GLB_CHUNK_PREFIX_BYTES = 8;
	const GLB_CHUNK_TYPE_JSON = 0x4E4F534A;
	const GLB_CHUNK_TYPE_BIN = 0x004E4942;

	//------------------------------------------------------------------------------
	// Utility functions
	//------------------------------------------------------------------------------

	/**
	 * Compare two arrays
	 *
	 * @private
	 * @param {Array} array1 Array 1 to compare
	 * @param {Array} array2 Array 2 to compare
	 * @return {boolean}        Returns true if both arrays are equal
	 */
	function equalArray( array1, array2 ) {

		return ( array1.length === array2.length ) && array1.every( function ( element, index ) {

			return element === array2[ index ];

		} );

	}

	/**
	 * Converts a string to an ArrayBuffer.
	 *
	 * @private
	 * @param {string} text
	 * @return {ArrayBuffer}
	 */
	function stringToArrayBuffer( text ) {

		return new TextEncoder().encode( text ).buffer;

	}

	/**
	 * Is identity matrix
	 *
	 * @private
	 * @param {Matrix4} matrix
	 * @returns {boolean} Returns true, if parameter is identity matrix
	 */
	function isIdentityMatrix( matrix ) {

		return equalArray( matrix.elements, [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ] );

	}

	/**
	 * Get the min and max vectors from the given attribute
	 *
	 * @private
	 * @param {BufferAttribute} attribute Attribute to find the min/max in range from start to start + count
	 * @param {number} start Start index
	 * @param {number} count Range to cover
	 * @return {Object} Object containing the `min` and `max` values (As an array of attribute.itemSize components)
	 */
	function getMinMax( attribute, start, count ) {

		const output = {

			min: new Array( attribute.itemSize ).fill( Number.POSITIVE_INFINITY ),
			max: new Array( attribute.itemSize ).fill( Number.NEGATIVE_INFINITY )

		};

		for ( let i = start; i < start + count; i ++ ) {

			for ( let a = 0; a < attribute.itemSize; a ++ ) {

				let value;

				if ( attribute.itemSize > 4 ) {

					 // no support for interleaved data for itemSize > 4

					value = attribute.array[ i * attribute.itemSize + a ];

				} else {

					if ( a === 0 ) value = attribute.getX( i );
					else if ( a === 1 ) value = attribute.getY( i );
					else if ( a === 2 ) value = attribute.getZ( i );
					else if ( a === 3 ) value = attribute.getW( i );

					if ( attribute.normalized === true ) {

						value = MathUtils.normalize( value, attribute.array );

					}

				}

				output.min[ a ] = Math.min( output.min[ a ], value );
				output.max[ a ] = Math.max( output.max[ a ], value );

			}

		}

		return output;

	}

	/**
	 * Get the required size + padding for a buffer, rounded to the next 4-byte boundary.
	 * https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#data-alignment
	 *
	 * @private
	 * @param {number} bufferSize The size the original buffer. Should be an integer.
	 * @returns {number} new buffer size with required padding as an integer.
	 *
	 */
	function getPaddedBufferSize( bufferSize ) {

		return Math.ceil( bufferSize / 4 ) * 4;

	}

	/**
	 * Returns a buffer aligned to 4-byte boundary.
	 *
	 * @private
	 * @param {ArrayBuffer} arrayBuffer Buffer to pad
	 * @param {number} [paddingByte=0] Should be an integer
	 * @returns {ArrayBuffer} The same buffer if it's already aligned to 4-byte boundary or a new buffer
	 */
	function getPaddedArrayBuffer( arrayBuffer, paddingByte = 0 ) {

		const paddedLength = getPaddedBufferSize( arrayBuffer.byteLength );

		if ( paddedLength !== arrayBuffer.byteLength ) {

			const array = new Uint8Array( paddedLength );
			array.set( new Uint8Array( arrayBuffer ) );

			if ( paddingByte !== 0 ) {

				for ( let i = arrayBuffer.byteLength; i < paddedLength; i ++ ) {

					array[ i ] = paddingByte;

				}

			}

			return array.buffer;

		}

		return arrayBuffer;

	}

	function getCanvas() {

		if ( typeof document === 'undefined' && typeof OffscreenCanvas !== 'undefined' ) {

			return new OffscreenCanvas( 1, 1 );

		}

		return document.createElement( 'canvas' );

	}

	function getToBlobPromise( canvas, mimeType ) {

		if ( canvas.toBlob !== undefined ) {

			return new Promise( ( resolve ) => canvas.toBlob( resolve, mimeType ) );

		}

		let quality;

		// Blink's implementation of convertToBlob seems to default to a quality level of 100%
		// Use the Blink default quality levels of toBlob instead so that file sizes are comparable.
		if ( mimeType === 'image/jpeg' ) {

			quality = 0.92;

		} else if ( mimeType === 'image/webp' ) {

			quality = 0.8;

		}

		return canvas.convertToBlob( {

			type: mimeType,
			quality: quality

		} );

	}

	/**
	 * Writer
	 *
	 * @private
	 */
	class GLTFWriter {

		constructor() {

			this.plugins = [];

			this.options = {};
			this.pending = [];
			this.buffers = [];

			this.byteOffset = 0;
			this.buffers = [];
			this.nodeMap = new Map();
			this.skins = [];

			this.extensionsUsed = {};
			this.extensionsRequired = {};

			this.uids = new Map();
			this.uid = 0;

			this.json = {
				asset: {
					version: '2.0',
					generator: 'THREE.GLTFExporter r' + REVISION
				}
			};

			this.cache = {
				meshes: new Map(),
				attributes: new Map(),
				attributesNormalized: new Map(),
				materials: new Map(),
				textures: new Map(),
				images: new Map()
			};

			this.textureUtils = null;

		}

		setPlugins( plugins ) {

			this.plugins = plugins;

		}

		setTextureUtils( utils ) {

			this.textureUtils = utils;

		}

		/**
		 * Parse scenes and generate GLTF output
		 *
		 * @param {Scene|Array<Scene>} input Scene or Array of THREE.Scenes
		 * @param {Function} onDone Callback on completed
		 * @param {Object} options options
		 */
		async writeAsync( input, onDone, options = {} ) {

			this.options = Object.assign( {
				// default options
				binary: false,
				trs: false,
				onlyVisible: true,
				maxTextureSize: Infinity,
				animations: [],
				includeCustomExtensions: false
			}, options );

			if ( this.options.animations.length > 0 ) {

				// Only TRS properties, and not matrices, may be targeted by animation.
				this.options.trs = true;

			}

			await this.processInputAsync( input );

			await Promise.all( this.pending );

			const writer = this;
			const buffers = writer.buffers;
			const json = writer.json;
			options = writer.options;

			const extensionsUsed = writer.extensionsUsed;
			const extensionsRequired = writer.extensionsRequired;

			// Merge buffers.
			const blob = new Blob( buffers, { type: 'application/octet-stream' } );

			// Declare extensions.
			const extensionsUsedList = Object.keys( extensionsUsed );
			const extensionsRequiredList = Object.keys( extensionsRequired );

			if ( extensionsUsedList.length > 0 ) json.extensionsUsed = extensionsUsedList;
			if ( extensionsRequiredList.length > 0 ) json.extensionsRequired = extensionsRequiredList;

			// Update bytelength of the single buffer.
			if ( json.buffers && json.buffers.length > 0 ) json.buffers[ 0 ].byteLength = blob.size;

			if ( options.binary === true ) {

				// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#glb-file-format-specification

				const reader = new FileReader();
				reader.readAsArrayBuffer( blob );
				reader.onloadend = function () {

					// Binary chunk.
					const binaryChunk = getPaddedArrayBuffer( reader.result );
					const binaryChunkPrefix = new DataView( new ArrayBuffer( GLB_CHUNK_PREFIX_BYTES ) );
					binaryChunkPrefix.setUint32( 0, binaryChunk.byteLength, true );
					binaryChunkPrefix.setUint32( 4, GLB_CHUNK_TYPE_BIN, true );

					// JSON chunk.
					const jsonChunk = getPaddedArrayBuffer( stringToArrayBuffer( JSON.stringify( json ) ), 0x20 );
					const jsonChunkPrefix = new DataView( new ArrayBuffer( GLB_CHUNK_PREFIX_BYTES ) );
					jsonChunkPrefix.setUint32( 0, jsonChunk.byteLength, true );
					jsonChunkPrefix.setUint32( 4, GLB_CHUNK_TYPE_JSON, true );

					// GLB header.
					const header = new ArrayBuffer( GLB_HEADER_BYTES );
					const headerView = new DataView( header );
					headerView.setUint32( 0, GLB_HEADER_MAGIC, true );
					headerView.setUint32( 4, GLB_VERSION, true );
					const totalByteLength = GLB_HEADER_BYTES
						+ jsonChunkPrefix.byteLength + jsonChunk.byteLength
						+ binaryChunkPrefix.byteLength + binaryChunk.byteLength;
					headerView.setUint32( 8, totalByteLength, true );

					const glbBlob = new Blob( [
						header,
						jsonChunkPrefix,
						jsonChunk,
						binaryChunkPrefix,
						binaryChunk
					], { type: 'application/octet-stream' } );

					const glbReader = new FileReader();
					glbReader.readAsArrayBuffer( glbBlob );
					glbReader.onloadend = function () {

						onDone( glbReader.result );

					};

				};

			} else {

				if ( json.buffers && json.buffers.length > 0 ) {

					const reader = new FileReader();
					reader.readAsDataURL( blob );
					reader.onloadend = function () {

						const base64data = reader.result;
						json.buffers[ 0 ].uri = base64data;
						onDone( json );

					};

				} else {

					onDone( json );

				}

			}


		}

		/**
		 * Serializes a userData.
		 *
		 * @param {THREE.Object3D|THREE.Material} object
		 * @param {Object} objectDef
		 */
		serializeUserData( object, objectDef ) {

			if ( Object.keys( object.userData ).length === 0 ) return;

			const options = this.options;
			const extensionsUsed = this.extensionsUsed;

			try {

				const json = JSON.parse( JSON.stringify( object.userData ) );

				if ( options.includeCustomExtensions && json.gltfExtensions ) {

					if ( objectDef.extensions === undefined ) objectDef.extensions = {};

					for ( const extensionName in json.gltfExtensions ) {

						objectDef.extensions[ extensionName ] = json.gltfExtensions[ extensionName ];
						extensionsUsed[ extensionName ] = true;

					}

					delete json.gltfExtensions;

				}

				if ( Object.keys( json ).length > 0 ) objectDef.extras = json;

			} catch ( error ) {

				console.warn( 'THREE.GLTFExporter: userData of \'' + object.name + '\' ' +
					'won\'t be serialized because of JSON.stringify error - ' + error.message );

			}

		}

		/**
		 * Returns ids for buffer attributes.
		 *
		 * @param {Object} attribute
		 * @param {boolean} [isRelativeCopy=false]
		 * @return {number} An integer
		 */
		getUID( attribute, isRelativeCopy = false ) {

			if ( this.uids.has( attribute ) === false ) {

				const uids = new Map();

				uids.set( true, this.uid ++ );
				uids.set( false, this.uid ++ );

				this.uids.set( attribute, uids );

			}

			const uids = this.uids.get( attribute );

			return uids.get( isRelativeCopy );

		}

		/**
		 * Checks if normal attribute values are normalized.
		 *
		 * @param {BufferAttribute} normal
		 * @returns {boolean}
		 */
		isNormalizedNormalAttribute( normal ) {

			const cache = this.cache;

			if ( cache.attributesNormalized.has( normal ) ) return false;

			const v = new Vector3();

			for ( let i = 0, il = normal.count; i < il; i ++ ) {

				// 0.0005 is from glTF-validator
				if ( Math.abs( v.fromBufferAttribute( normal, i ).length() - 1.0 ) > 0.0005 ) return false;

			}

			return true;

		}

		/**
		 * Creates normalized normal buffer attribute.
		 *
		 * @param {BufferAttribute} normal
		 * @returns {BufferAttribute}
		 *
		 */
		createNormalizedNormalAttribute( normal ) {

			const cache = this.cache;

			if ( cache.attributesNormalized.has( normal ) )	return cache.attributesNormalized.get( normal );

			const attribute = normal.clone();
			const v = new Vector3();

			for ( let i = 0, il = attribute.count; i < il; i ++ ) {

				v.fromBufferAttribute( attribute, i );

				if ( v.x === 0 && v.y === 0 && v.z === 0 ) {

					// if values can't be normalized set (1, 0, 0)
					v.setX( 1.0 );

				} else {

					v.normalize();

				}

				attribute.setXYZ( i, v.x, v.y, v.z );

			}

			cache.attributesNormalized.set( normal, attribute );

			return attribute;

		}

		/**
		 * Applies a texture transform, if present, to the map definition. Requires
		 * the KHR_texture_transform extension.
		 *
		 * @param {Object} mapDef
		 * @param {THREE.Texture} texture
		 */
		applyTextureTransform( mapDef, texture ) {

			let didTransform = false;
			const transformDef = {};

			if ( texture.offset.x !== 0 || texture.offset.y !== 0 ) {

				transformDef.offset = texture.offset.toArray();
				didTransform = true;

			}

			if ( texture.rotation !== 0 ) {

				transformDef.rotation = texture.rotation;
				didTransform = true;

			}

			if ( texture.repeat.x !== 1 || texture.repeat.y !== 1 ) {

				transformDef.scale = texture.repeat.toArray();
				didTransform = true;

			}

			if ( didTransform ) {

				mapDef.extensions = mapDef.extensions || {};
				mapDef.extensions[ 'KHR_texture_transform' ] = transformDef;
				this.extensionsUsed[ 'KHR_texture_transform' ] = true;

			}

		}

		async buildMetalRoughTextureAsync( metalnessMap, roughnessMap ) {

			if ( metalnessMap === roughnessMap ) return metalnessMap;

			function getEncodingConversion( map ) {

				if ( map.colorSpace === SRGBColorSpace ) {

					return function SRGBToLinear( c ) {

						return ( c < 0.04045 ) ? c * 0.0773993808 : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 );

					};

				}

				return function LinearToLinear( c ) {

					return c;

				};

			}

			if ( metalnessMap instanceof CompressedTexture ) {

				metalnessMap = await this.decompressTextureAsync( metalnessMap );

			}

			if ( roughnessMap instanceof CompressedTexture ) {

				roughnessMap = await this.decompressTextureAsync( roughnessMap );

			}

			const metalness = metalnessMap ? metalnessMap.image : null;
			const roughness = roughnessMap ? roughnessMap.image : null;

			const width = Math.max( metalness ? metalness.width : 0, roughness ? roughness.width : 0 );
			const height = Math.max( metalness ? metalness.height : 0, roughness ? roughness.height : 0 );

			const canvas = getCanvas();
			canvas.width = width;
			canvas.height = height;

			const context = canvas.getContext( '2d', {
				willReadFrequently: true,
			} );
			context.fillStyle = '#00ffff';
			context.fillRect( 0, 0, width, height );

			const composite = context.getImageData( 0, 0, width, height );

			if ( metalness ) {

				context.drawImage( metalness, 0, 0, width, height );

				const convert = getEncodingConversion( metalnessMap );
				const data = context.getImageData( 0, 0, width, height ).data;

				for ( let i = 2; i < data.length; i += 4 ) {

					composite.data[ i ] = convert( data[ i ] / 256 ) * 256;

				}

			}

			if ( roughness ) {

				context.drawImage( roughness, 0, 0, width, height );

				const convert = getEncodingConversion( roughnessMap );
				const data = context.getImageData( 0, 0, width, height ).data;

				for ( let i = 1; i < data.length; i += 4 ) {

					composite.data[ i ] = convert( data[ i ] / 256 ) * 256;

				}

			}

			context.putImageData( composite, 0, 0 );

			//

			const reference = metalnessMap || roughnessMap;

			const texture = reference.clone();

			texture.source = new Source( canvas );
			texture.colorSpace = NoColorSpace;
			texture.channel = ( metalnessMap || roughnessMap ).channel;

			if ( metalnessMap && roughnessMap && metalnessMap.channel !== roughnessMap.channel ) {

				console.warn( 'THREE.GLTFExporter: UV channels for metalnessMap and roughnessMap textures must match.' );

			}

			console.warn( 'THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures.' );

			return texture;

		}


		async decompressTextureAsync( texture, maxTextureSize = Infinity ) {

			if ( this.textureUtils === null ) {

				throw new Error( 'THREE.GLTFExporter: setTextureUtils() must be called to process compressed textures.' );

			}

			return await this.textureUtils.decompress( texture, maxTextureSize );

		}

		/**
		 * Process a buffer to append to the default one.
		 * @param {ArrayBuffer} buffer
		 * @return {0}
		 */
		processBuffer( buffer ) {

			const json = this.json;
			const buffers = this.buffers;

			if ( ! json.buffers ) json.buffers = [ { byteLength: 0 } ];

			// All buffers are merged before export.
			buffers.push( buffer );

			return 0;

		}

		/**
		 * Process and generate a BufferView
		 * @param {BufferAttribute} attribute
		 * @param {number} componentType
		 * @param {number} start
		 * @param {number} count
		 * @param {number} [target] Target usage of the BufferView
		 * @return {Object}
		 */
		processBufferView( attribute, componentType, start, count, target ) {

			const json = this.json;

			if ( ! json.bufferViews ) json.bufferViews = [];

			// Create a new dataview and dump the attribute's array into it

			let componentSize;

			switch ( componentType ) {

				case WEBGL_CONSTANTS.BYTE:
				case WEBGL_CONSTANTS.UNSIGNED_BYTE:

					componentSize = 1;

					break;

				case WEBGL_CONSTANTS.SHORT:
				case WEBGL_CONSTANTS.UNSIGNED_SHORT:

					componentSize = 2;

					break;

				default:

					componentSize = 4;

			}

			let byteStride = attribute.itemSize * componentSize;

			if ( target === WEBGL_CONSTANTS.ARRAY_BUFFER ) {

				// Each element of a vertex attribute MUST be aligned to 4-byte boundaries
				// inside a bufferView
				byteStride = Math.ceil( byteStride / 4 ) * 4;

			}

			const byteLength = getPaddedBufferSize( count * byteStride );
			const dataView = new DataView( new ArrayBuffer( byteLength ) );
			let offset = 0;

			for ( let i = start; i < start + count; i ++ ) {

				for ( let a = 0; a < attribute.itemSize; a ++ ) {

					let value;

					if ( attribute.itemSize > 4 ) {

						 // no support for interleaved data for itemSize > 4

						value = attribute.array[ i * attribute.itemSize + a ];

					} else {

						if ( a === 0 ) value = attribute.getX( i );
						else if ( a === 1 ) value = attribute.getY( i );
						else if ( a === 2 ) value = attribute.getZ( i );
						else if ( a === 3 ) value = attribute.getW( i );

						if ( attribute.normalized === true ) {

							value = MathUtils.normalize( value, attribute.array );

						}

					}

					if ( componentType === WEBGL_CONSTANTS.FLOAT ) {

						dataView.setFloat32( offset, value, true );

					} else if ( componentType === WEBGL_CONSTANTS.INT ) {

						dataView.setInt32( offset, value, true );

					} else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_INT ) {

						dataView.setUint32( offset, value, true );

					} else if ( componentType === WEBGL_CONSTANTS.SHORT ) {

						dataView.setInt16( offset, value, true );

					} else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_SHORT ) {

						dataView.setUint16( offset, value, true );

					} else if ( componentType === WEBGL_CONSTANTS.BYTE ) {

						dataView.setInt8( offset, value );

					} else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_BYTE ) {

						dataView.setUint8( offset, value );

					}

					offset += componentSize;

				}

				if ( ( offset % byteStride ) !== 0 ) {

					offset += byteStride - ( offset % byteStride );

				}

			}

			const bufferViewDef = {

				buffer: this.processBuffer( dataView.buffer ),
				byteOffset: this.byteOffset,
				byteLength: byteLength

			};

			if ( target !== undefined ) bufferViewDef.target = target;

			if ( target === WEBGL_CONSTANTS.ARRAY_BUFFER ) {

				// Only define byteStride for vertex attributes.
				bufferViewDef.byteStride = byteStride;

			}

			this.byteOffset += byteLength;

			json.bufferViews.push( bufferViewDef );

			// @TODO Merge bufferViews where possible.
			const output = {

				id: json.bufferViews.length - 1,
				byteLength: 0

			};

			return output;

		}

		/**
		 * Process and generate a BufferView from an image Blob.
		 * @param {Blob} blob
		 * @return {Promise<number>} An integer
		 */
		processBufferViewImage( blob ) {

			const writer = this;
			const json = writer.json;

			if ( ! json.bufferViews ) json.bufferViews = [];

			return new Promise( function ( resolve ) {

				const reader = new FileReader();
				reader.readAsArrayBuffer( blob );
				reader.onloadend = function () {

					const buffer = getPaddedArrayBuffer( reader.result );

					const bufferViewDef = {
						buffer: writer.processBuffer( buffer ),
						byteOffset: writer.byteOffset,
						byteLength: buffer.byteLength
					};

					writer.byteOffset += buffer.byteLength;
					resolve( json.bufferViews.push( bufferViewDef ) - 1 );

				};

			} );

		}

		/**
		 * Process attribute to generate an accessor
		 * @param {BufferAttribute} attribute Attribute to process
		 * @param {?BufferGeometry} [geometry] Geometry used for truncated draw range
		 * @param {number} [start=0]
		 * @param {number} [count=Infinity]
		 * @return {?number} Index of the processed accessor on the "accessors" array
		 */
		processAccessor( attribute, geometry, start, count ) {

			const json = this.json;

			const types = {

				1: 'SCALAR',
				2: 'VEC2',
				3: 'VEC3',
				4: 'VEC4',
				9: 'MAT3',
				16: 'MAT4'

			};

			let componentType;

			// Detect the component type of the attribute array
			if ( attribute.array.constructor === Float32Array ) {

				componentType = WEBGL_CONSTANTS.FLOAT;

			} else if ( attribute.array.constructor === Int32Array ) {

				componentType = WEBGL_CONSTANTS.INT;

			} else if ( attribute.array.constructor === Uint32Array ) {

				componentType = WEBGL_CONSTANTS.UNSIGNED_INT;

			} else if ( attribute.array.constructor === Int16Array ) {

				componentType = WEBGL_CONSTANTS.SHORT;

			} else if ( attribute.array.constructor === Uint16Array ) {

				componentType = WEBGL_CONSTANTS.UNSIGNED_SHORT;

			} else if ( attribute.array.constructor === Int8Array ) {

				componentType = WEBGL_CONSTANTS.BYTE;

			} else if ( attribute.array.constructor === Uint8Array ) {

				componentType = WEBGL_CONSTANTS.UNSIGNED_BYTE;

			} else {

				throw new Error( 'THREE.GLTFExporter: Unsupported bufferAttribute component type: ' + attribute.array.constructor.name );

			}

			if ( start === undefined ) start = 0;
			if ( count === undefined || count === Infinity ) count = attribute.count;

			// Skip creating an accessor if the attribute doesn't have data to export
			if ( count === 0 ) return null;

			const minMax = getMinMax( attribute, start, count );
			let bufferViewTarget;

			// If geometry isn't provided, don't infer the target usage of the bufferView. For
			// animation samplers, target must not be set.
			if ( geometry !== undefined ) {

				bufferViewTarget = attribute === geometry.index ? WEBGL_CONSTANTS.ELEMENT_ARRAY_BUFFER : WEBGL_CONSTANTS.ARRAY_BUFFER;

			}

			const bufferView = this.processBufferView( attribute, componentType, start, count, bufferViewTarget );

			const accessorDef = {

				bufferView: bufferView.id,
				byteOffset: bufferView.byteOffset,
				componentType: componentType,
				count: count,
				max: minMax.max,
				min: minMax.min,
				type: types[ attribute.itemSize ]

			};

			if ( attribute.normalized === true ) accessorDef.normalized = true;
			if ( ! json.accessors ) json.accessors = [];

			return json.accessors.push( accessorDef ) - 1;

		}

		/**
		 * Process image
		 * @param {Image} image to process
		 * @param {number} format Identifier of the format (RGBAFormat)
		 * @param {boolean} flipY before writing out the image
		 * @param {string} mimeType export format
		 * @return {number}     Index of the processed texture in the "images" array
		 */
		processImage( image, format, flipY, mimeType = 'image/png' ) {

			if ( image !== null ) {

				const writer = this;
				const cache = writer.cache;
				const json = writer.json;
				const options = writer.options;
				const pending = writer.pending;

				if ( ! cache.images.has( image ) ) cache.images.set( image, {} );

				const cachedImages = cache.images.get( image );

				const key = mimeType + ':flipY/' + flipY.toString();

				if ( cachedImages[ key ] !== undefined ) return cachedImages[ key ];

				if ( ! json.images ) json.images = [];

				const imageDef = { mimeType: mimeType };

				const canvas = getCanvas();

				canvas.width = Math.min( image.width, options.maxTextureSize );
				canvas.height = Math.min( image.height, options.maxTextureSize );

				const ctx = canvas.getContext( '2d', {
					willReadFrequently: true,
				} );

				if ( flipY === true ) {

					ctx.translate( 0, canvas.height );
					ctx.scale( 1, - 1 );

				}

				if ( image.data !== undefined ) { // THREE.DataTexture

					if ( format !== RGBAFormat ) {

						console.error( 'GLTFExporter: Only RGBAFormat is supported.', format );

					}

					if ( image.width > options.maxTextureSize || image.height > options.maxTextureSize ) {

						console.warn( 'GLTFExporter: Image size is bigger than maxTextureSize', image );

					}

					const data = new Uint8ClampedArray( image.height * image.width * 4 );

					for ( let i = 0; i < data.length; i += 4 ) {

						data[ i + 0 ] = image.data[ i + 0 ];
						data[ i + 1 ] = image.data[ i + 1 ];
						data[ i + 2 ] = image.data[ i + 2 ];
						data[ i + 3 ] = image.data[ i + 3 ];

					}

					ctx.putImageData( new ImageData( data, image.width, image.height ), 0, 0 );

				} else {

					if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
						( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ||
						( typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap ) ||
						( typeof OffscreenCanvas !== 'undefined' && image instanceof OffscreenCanvas ) ) {

						ctx.drawImage( image, 0, 0, canvas.width, canvas.height );

					} else {

						throw new Error( 'THREE.GLTFExporter: Invalid image type. Use HTMLImageElement, HTMLCanvasElement, ImageBitmap or OffscreenCanvas.' );

					}

				}

				if ( options.binary === true ) {

					pending.push(

						getToBlobPromise( canvas, mimeType )
							.then( blob => writer.processBufferViewImage( blob ) )
							.then( bufferViewIndex => {

								imageDef.bufferView = bufferViewIndex;

							} )

					);

				} else {

					imageDef.uri = ImageUtils.getDataURL( canvas, mimeType );

				}

				const index = json.images.push( imageDef ) - 1;
				cachedImages[ key ] = index;
				return index;

			} else {

				throw new Error( 'THREE.GLTFExporter: No valid image data found. Unable to process texture.' );

			}

		}

		/**
		 * Process sampler
		 * @param {Texture} map Texture to process
		 * @return {number}      Index of the processed texture in the "samplers" array
		 */
		processSampler( map ) {

			const json = this.json;

			if ( ! json.samplers ) json.samplers = [];

			const samplerDef = {
				magFilter: THREE_TO_WEBGL[ map.magFilter ],
				minFilter: THREE_TO_WEBGL[ map.minFilter ],
				wrapS: THREE_TO_WEBGL[ map.wrapS ],
				wrapT: THREE_TO_WEBGL[ map.wrapT ]
			};

			return json.samplers.push( samplerDef ) - 1;

		}

		/**
		 * Process texture
		 * @param {Texture} map Map to process
		 * @return {Promise<number>} Index of the processed texture in the "textures" array
		 */
		async processTextureAsync( map ) {

			const writer = this;
			const options = writer.options;
			const cache = this.cache;
			const json = this.json;

			if ( cache.textures.has( map ) ) return cache.textures.get( map );

			if ( ! json.textures ) json.textures = [];

			// make non-readable textures (e.g. CompressedTexture) readable by blitting them into a new texture
			if ( map instanceof CompressedTexture ) {

				map = await this.decompressTextureAsync( map, options.maxTextureSize );

			}

			let mimeType = map.userData.mimeType;

			if ( mimeType === 'image/webp' ) mimeType = 'image/png';

			const textureDef = {
				sampler: this.processSampler( map ),
				source: this.processImage( map.image, map.format, map.flipY, mimeType )
			};

			if ( map.name ) textureDef.name = map.name;

			await this._invokeAllAsync( async function ( ext ) {

				ext.writeTexture && await ext.writeTexture( map, textureDef );

			} );

			const index = json.textures.push( textureDef ) - 1;
			cache.textures.set( map, index );
			return index;

		}

		/**
		 * Process material
		 * @param {THREE.Material} material Material to process
		 * @return {Promise<number|null>} Index of the processed material in the "materials" array
		 */
		async processMaterialAsync( material ) {

			const cache = this.cache;
			const json = this.json;

			if ( cache.materials.has( material ) ) return cache.materials.get( material );

			if ( material.isShaderMaterial ) {

				console.warn( 'GLTFExporter: THREE.ShaderMaterial not supported.' );
				return null;

			}

			if ( ! json.materials ) json.materials = [];

			// @QUESTION Should we avoid including any attribute that has the default value?
			const materialDef = {	pbrMetallicRoughness: {} };

			if ( material.isMeshStandardMaterial !== true && material.isMeshBasicMaterial !== true ) {

				console.warn( 'GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.' );

			}

			// pbrMetallicRoughness.baseColorFactor
			const color = material.color.toArray().concat( [ material.opacity ] );

			if ( ! equalArray( color, [ 1, 1, 1, 1 ] ) ) {

				materialDef.pbrMetallicRoughness.baseColorFactor = color;

			}

			if ( material.isMeshStandardMaterial ) {

				materialDef.pbrMetallicRoughness.metallicFactor = material.metalness;
				materialDef.pbrMetallicRoughness.roughnessFactor = material.roughness;

			} else {

				materialDef.pbrMetallicRoughness.metallicFactor = 0;
				materialDef.pbrMetallicRoughness.roughnessFactor = 1;

			}

			// pbrMetallicRoughness.metallicRoughnessTexture
			if ( material.metalnessMap || material.roughnessMap ) {

				const metalRoughTexture = await this.buildMetalRoughTextureAsync( material.metalnessMap, material.roughnessMap );

				const metalRoughMapDef = {
					index: await this.processTextureAsync( metalRoughTexture ),
					texCoord: metalRoughTexture.channel
				};
				this.applyTextureTransform( metalRoughMapDef, metalRoughTexture );
				materialDef.pbrMetallicRoughness.metallicRoughnessTexture = metalRoughMapDef;

			}

			// pbrMetallicRoughness.baseColorTexture
			if ( material.map ) {

				const baseColorMapDef = {
					index: await this.processTextureAsync( material.map ),
					texCoord: material.map.channel
				};
				this.applyTextureTransform( baseColorMapDef, material.map );
				materialDef.pbrMetallicRoughness.baseColorTexture = baseColorMapDef;

			}

			if ( material.emissive ) {

				const emissive = material.emissive;
				const maxEmissiveComponent = Math.max( emissive.r, emissive.g, emissive.b );

				if ( maxEmissiveComponent > 0 ) {

					materialDef.emissiveFactor = material.emissive.toArray();

				}

				// emissiveTexture
				if ( material.emissiveMap ) {

					const emissiveMapDef = {
						index: await this.processTextureAsync( material.emissiveMap ),
						texCoord: material.emissiveMap.channel
					};
					this.applyTextureTransform( emissiveMapDef, material.emissiveMap );
					materialDef.emissiveTexture = emissiveMapDef;

				}

			}

			// normalTexture
			if ( material.normalMap ) {

				const normalMapDef = {
					index: await this.processTextureAsync( material.normalMap ),
					texCoord: material.normalMap.channel
				};

				if ( material.normalScale && material.normalScale.x !== 1 ) {

					// glTF normal scale is univariate. Ignore `y`, which may be flipped.
					// Context: https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
					normalMapDef.scale = material.normalScale.x;

				}

				this.applyTextureTransform( normalMapDef, material.normalMap );
				materialDef.normalTexture = normalMapDef;

			}

			// occlusionTexture
			if ( material.aoMap ) {

				const occlusionMapDef = {
					index: await this.processTextureAsync( material.aoMap ),
					texCoord: material.aoMap.channel
				};

				if ( material.aoMapIntensity !== 1.0 ) {

					occlusionMapDef.strength = material.aoMapIntensity;

				}

				this.applyTextureTransform( occlusionMapDef, material.aoMap );
				materialDef.occlusionTexture = occlusionMapDef;

			}

			// alphaMode
			if ( material.transparent ) {

				materialDef.alphaMode = 'BLEND';

			} else {

				if ( material.alphaTest > 0.0 ) {

					materialDef.alphaMode = 'MASK';
					materialDef.alphaCutoff = material.alphaTest;

				}

			}

			// doubleSided
			if ( material.side === DoubleSide ) materialDef.doubleSided = true;
			if ( material.name !== '' ) materialDef.name = material.name;

			this.serializeUserData( material, materialDef );

			await this._invokeAllAsync( async function ( ext ) {

				ext.writeMaterialAsync && await ext.writeMaterialAsync( material, materialDef );

			} );

			const index = json.materials.push( materialDef ) - 1;
			cache.materials.set( material, index );
			return index;

		}

		/**
		 * Process mesh
		 * @param {THREE.Mesh} mesh Mesh to process
		 * @return {Promise<number|null>} Index of the processed mesh in the "meshes" array
		 */
		async processMeshAsync( mesh ) {

			const cache = this.cache;
			const json = this.json;

			const meshCacheKeyParts = [ mesh.geometry.uuid ];

			if ( Array.isArray( mesh.material ) ) {

				for ( let i = 0, l = mesh.material.length; i < l; i ++ ) {

					meshCacheKeyParts.push( mesh.material[ i ].uuid	);

				}

			} else {

				meshCacheKeyParts.push( mesh.material.uuid );

			}

			const meshCacheKey = meshCacheKeyParts.join( ':' );

			if ( cache.meshes.has( meshCacheKey ) ) return cache.meshes.get( meshCacheKey );

			const geometry = mesh.geometry;

			let mode;

			// Use the correct mode
			if ( mesh.isLineSegments ) {

				mode = WEBGL_CONSTANTS.LINES;

			} else if ( mesh.isLineLoop ) {

				mode = WEBGL_CONSTANTS.LINE_LOOP;

			} else if ( mesh.isLine ) {

				mode = WEBGL_CONSTANTS.LINE_STRIP;

			} else if ( mesh.isPoints ) {

				mode = WEBGL_CONSTANTS.POINTS;

			} else {

				mode = mesh.material.wireframe ? WEBGL_CONSTANTS.LINES : WEBGL_CONSTANTS.TRIANGLES;

			}

			const meshDef = {};
			const attributes = {};
			const primitives = [];
			const targets = [];

			// Conversion between attributes names in threejs and gltf spec
			const nameConversion = {
				uv: 'TEXCOORD_0',
				uv1: 'TEXCOORD_1',
				uv2: 'TEXCOORD_2',
				uv3: 'TEXCOORD_3',
				color: 'COLOR_0',
				skinWeight: 'WEIGHTS_0',
				skinIndex: 'JOINTS_0'
			};

			const originalNormal = geometry.getAttribute( 'normal' );

			if ( originalNormal !== undefined && ! this.isNormalizedNormalAttribute( originalNormal ) ) {

				console.warn( 'THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one.' );

				geometry.setAttribute( 'normal', this.createNormalizedNormalAttribute( originalNormal ) );

			}

			// @QUESTION Detect if .vertexColors = true?
			// For every attribute create an accessor
			let modifiedAttribute = null;

			for ( let attributeName in geometry.attributes ) {

				// Ignore morph target attributes, which are exported later.
				if ( attributeName.slice( 0, 5 ) === 'morph' ) continue;

				const attribute = geometry.attributes[ attributeName ];
				attributeName = nameConversion[ attributeName ] || attributeName.toUpperCase();

				// Prefix all geometry attributes except the ones specifically
				// listed in the spec; non-spec attributes are considered custom.
				const validVertexAttributes =
						/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/;

				if ( ! validVertexAttributes.test( attributeName ) ) attributeName = '_' + attributeName;

				if ( cache.attributes.has( this.getUID( attribute ) ) ) {

					attributes[ attributeName ] = cache.attributes.get( this.getUID( attribute ) );
					continue;

				}

				// Enforce glTF vertex attribute requirements:
				// - JOINTS_0 must be UNSIGNED_BYTE or UNSIGNED_SHORT
				// - Only custom attributes may be INT or UNSIGNED_INT
				modifiedAttribute = null;
				const array = attribute.array;

				if ( attributeName === 'JOINTS_0' &&
					! ( array instanceof Uint16Array ) &&
					! ( array instanceof Uint8Array ) ) {

					console.warn( 'GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.' );
					modifiedAttribute = new BufferAttribute( new Uint16Array( array ), attribute.itemSize, attribute.normalized );

				} else if ( ( array instanceof Uint32Array || array instanceof Int32Array ) && ! attributeName.startsWith( '_' ) ) {

					console.warn( `GLTFExporter: Attribute "${ attributeName }" converted to type FLOAT.` );
					modifiedAttribute = GLTFExporter.Utils.toFloat32BufferAttribute( attribute );

				}

				const accessor = this.processAccessor( modifiedAttribute || attribute, geometry );

				if ( accessor !== null ) {

					if ( ! attributeName.startsWith( '_' ) ) {

						this.detectMeshQuantization( attributeName, attribute );

					}

					attributes[ attributeName ] = accessor;
					cache.attributes.set( this.getUID( attribute ), accessor );

				}

			}

			if ( originalNormal !== undefined ) geometry.setAttribute( 'normal', originalNormal );

			// Skip if no exportable attributes found
			if ( Object.keys( attributes ).length === 0 ) return null;

			// Morph targets
			if ( mesh.morphTargetInfluences !== undefined && mesh.morphTargetInfluences.length > 0 ) {

				const weights = [];
				const targetNames = [];
				const reverseDictionary = {};

				if ( mesh.morphTargetDictionary !== undefined ) {

					for ( const key in mesh.morphTargetDictionary ) {

						reverseDictionary[ mesh.morphTargetDictionary[ key ] ] = key;

					}

				}

				for ( let i = 0; i < mesh.morphTargetInfluences.length; ++ i ) {

					const target = {};
					let warned = false;

					for ( const attributeName in geometry.morphAttributes ) {

						// glTF 2.0 morph supports only POSITION/NORMAL/TANGENT.
						// Three.js doesn't support TANGENT yet.

						if ( attributeName !== 'position' && attributeName !== 'normal' ) {

							if ( ! warned ) {

								console.warn( 'GLTFExporter: Only POSITION and NORMAL morph are supported.' );
								warned = true;

							}

							continue;

						}

						const attribute = geometry.morphAttributes[ attributeName ][ i ];
						const gltfAttributeName = attributeName.toUpperCase();

						// Three.js morph attribute has absolute values while the one of glTF has relative values.
						//
						// glTF 2.0 Specification:
						// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#morph-targets

						const baseAttribute = geometry.attributes[ attributeName ];

						if ( cache.attributes.has( this.getUID( attribute, true ) ) ) {

							target[ gltfAttributeName ] = cache.attributes.get( this.getUID( attribute, true ) );
							continue;

						}

						// Clones attribute not to override
						const relativeAttribute = attribute.clone();

						if ( ! geometry.morphTargetsRelative ) {

							for ( let j = 0, jl = attribute.count; j < jl; j ++ ) {

								for ( let a = 0; a < attribute.itemSize; a ++ ) {

									if ( a === 0 ) relativeAttribute.setX( j, attribute.getX( j ) - baseAttribute.getX( j ) );
									if ( a === 1 ) relativeAttribute.setY( j, attribute.getY( j ) - baseAttribute.getY( j ) );
									if ( a === 2 ) relativeAttribute.setZ( j, attribute.getZ( j ) - baseAttribute.getZ( j ) );
									if ( a === 3 ) relativeAttribute.setW( j, attribute.getW( j ) - baseAttribute.getW( j ) );

								}

							}

						}

						target[ gltfAttributeName ] = this.processAccessor( relativeAttribute, geometry );
						cache.attributes.set( this.getUID( baseAttribute, true ), target[ gltfAttributeName ] );

					}

					targets.push( target );

					weights.push( mesh.morphTargetInfluences[ i ] );

					if ( mesh.morphTargetDictionary !== undefined ) targetNames.push( reverseDictionary[ i ] );

				}

				meshDef.weights = weights;

				if ( targetNames.length > 0 ) {

					meshDef.extras = {};
					meshDef.extras.targetNames = targetNames;

				}

			}

			const isMultiMaterial = Array.isArray( mesh.material );

			if ( isMultiMaterial && geometry.groups.length === 0 ) return null;

			let didForceIndices = false;

			if ( isMultiMaterial && geometry.index === null ) {

				const indices = [];

				for ( let i = 0, il = geometry.attributes.position.count; i < il; i ++ ) {

					indices[ i ] = i;

				}

				geometry.setIndex( indices );

				didForceIndices = true;

			}

			const materials = isMultiMaterial ? mesh.material : [ mesh.material ];
			const groups = isMultiMaterial ? geometry.groups : [ { materialIndex: 0, start: undefined, count: undefined } ];

			for ( let i = 0, il = groups.length; i < il; i ++ ) {

				const primitive = {
					mode: mode,
					attributes: attributes,
				};

				this.serializeUserData( geometry, primitive );

				if ( targets.length > 0 ) primitive.targets = targets;

				if ( geometry.index !== null ) {

					let cacheKey = this.getUID( geometry.index );

					if ( groups[ i ].start !== undefined || groups[ i ].count !== undefined ) {

						cacheKey += ':' + groups[ i ].start + ':' + groups[ i ].count;

					}

					if ( cache.attributes.has( cacheKey ) ) {

						primitive.indices = cache.attributes.get( cacheKey );

					} else {

						primitive.indices = this.processAccessor( geometry.index, geometry, groups[ i ].start, groups[ i ].count );
						cache.attributes.set( cacheKey, primitive.indices );

					}

					if ( primitive.indices === null ) delete primitive.indices;

				}

				const material = await this.processMaterialAsync( materials[ groups[ i ].materialIndex ] );

				if ( material !== null ) primitive.material = material;

				primitives.push( primitive );

			}

			if ( didForceIndices === true ) {

				geometry.setIndex( null );

			}

			meshDef.primitives = primitives;

			if ( ! json.meshes ) json.meshes = [];

			await this._invokeAllAsync( function ( ext ) {

				ext.writeMesh && ext.writeMesh( mesh, meshDef );

			} );

			const index = json.meshes.push( meshDef ) - 1;
			cache.meshes.set( meshCacheKey, index );
			return index;

		}

		/**
		 * If a vertex attribute with a
		 * [non-standard data type](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#meshes-overview)
		 * is used, it is checked whether it is a valid data type according to the
		 * [KHR_mesh_quantization](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_mesh_quantization/README.md)
		 * extension.
		 * In this case the extension is automatically added to the list of used extensions.
		 *
		 * @param {string} attributeName
		 * @param {THREE.BufferAttribute} attribute
		 */
		detectMeshQuantization( attributeName, attribute ) {

			if ( this.extensionsUsed[ KHR_MESH_QUANTIZATION ] ) return;

			let attrType = undefined;

			switch ( attribute.array.constructor ) {

				case Int8Array:

					attrType = 'byte';

					break;

				case Uint8Array:

					attrType = 'unsigned byte';

					break;

				case Int16Array:

					attrType = 'short';

					break;

				case Uint16Array:

					attrType = 'unsigned short';

					break;

				default:

					return;

			}

			if ( attribute.normalized ) attrType += ' normalized';

			const attrNamePrefix = attributeName.split( '_', 1 )[ 0 ];

			if ( KHR_mesh_quantization_ExtraAttrTypes[ attrNamePrefix ] && KHR_mesh_quantization_ExtraAttrTypes[ attrNamePrefix ].includes( attrType ) ) {

				this.extensionsUsed[ KHR_MESH_QUANTIZATION ] = true;
				this.extensionsRequired[ KHR_MESH_QUANTIZATION ] = true;

			}

		}

		/**
		 * Process camera
		 * @param {THREE.Camera} camera Camera to process
		 * @return {number} Index of the processed mesh in the "camera" array
		 */
		processCamera( camera ) {

			const json = this.json;

			if ( ! json.cameras ) json.cameras = [];

			const isOrtho = camera.isOrthographicCamera;

			const cameraDef = {
				type: isOrtho ? 'orthographic' : 'perspective'
			};

			if ( isOrtho ) {

				cameraDef.orthographic = {
					xmag: camera.right * 2,
					ymag: camera.top * 2,
					zfar: camera.far <= 0 ? 0.001 : camera.far,
					znear: camera.near < 0 ? 0 : camera.near
				};

			} else {

				cameraDef.perspective = {
					aspectRatio: camera.aspect,
					yfov: MathUtils.degToRad( camera.fov ),
					zfar: camera.far <= 0 ? 0.001 : camera.far,
					znear: camera.near < 0 ? 0 : camera.near
				};

			}

			// Question: Is saving "type" as name intentional?
			if ( camera.name !== '' ) cameraDef.name = camera.type;

			return json.cameras.push( cameraDef ) - 1;

		}

		/**
		 * Creates glTF animation entry from AnimationClip object.
		 *
		 * Status:
		 * - Only properties listed in PATH_PROPERTIES may be animated.
		 *
		 * @param {THREE.AnimationClip} clip
		 * @param {THREE.Object3D} root
		 * @return {number|null}
		 */
		processAnimation( clip, root ) {

			const json = this.json;
			const nodeMap = this.nodeMap;

			if ( ! json.animations ) json.animations = [];

			clip = GLTFExporter.Utils.mergeMorphTargetTracks( clip.clone(), root );

			const tracks = clip.tracks;
			const channels = [];
			const samplers = [];

			for ( let i = 0; i < tracks.length; ++ i ) {

				const track = tracks[ i ];
				const trackBinding = PropertyBinding.parseTrackName( track.name );
				let trackNode = PropertyBinding.findNode( root, trackBinding.nodeName );
				const trackProperty = PATH_PROPERTIES[ trackBinding.propertyName ];

				if ( trackBinding.objectName === 'bones' ) {

					if ( trackNode.isSkinnedMesh === true ) {

						trackNode = trackNode.skeleton.getBoneByName( trackBinding.objectIndex );

					} else {

						trackNode = undefined;

					}

				}

				if ( ! trackNode || ! trackProperty ) {

					console.warn( 'THREE.GLTFExporter: Could not export animation track "%s".', track.name );
					continue;

				}

				const inputItemSize = 1;
				let outputItemSize = track.values.length / track.times.length;

				if ( trackProperty === PATH_PROPERTIES.morphTargetInfluences ) {

					outputItemSize /= trackNode.morphTargetInfluences.length;

				}

				let interpolation;

				// @TODO export CubicInterpolant(InterpolateSmooth) as CUBICSPLINE

				// Detecting glTF cubic spline interpolant by checking factory method's special property
				// GLTFCubicSplineInterpolant is a custom interpolant and track doesn't return
				// valid value from .getInterpolation().
				if ( track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline === true ) {

					interpolation = 'CUBICSPLINE';

					// itemSize of CUBICSPLINE keyframe is 9
					// (VEC3 * 3: inTangent, splineVertex, and outTangent)
					// but needs to be stored as VEC3 so dividing by 3 here.
					outputItemSize /= 3;

				} else if ( track.getInterpolation() === InterpolateDiscrete ) {

					interpolation = 'STEP';

				} else {

					interpolation = 'LINEAR';

				}

				samplers.push( {
					input: this.processAccessor( new BufferAttribute( track.times, inputItemSize ) ),
					output: this.processAccessor( new BufferAttribute( track.values, outputItemSize ) ),
					interpolation: interpolation
				} );

				channels.push( {
					sampler: samplers.length - 1,
					target: {
						node: nodeMap.get( trackNode ),
						path: trackProperty
					}
				} );

			}

			json.animations.push( {
				name: clip.name || 'clip_' + json.animations.length,
				samplers: samplers,
				channels: channels
			} );

			return json.animations.length - 1;

		}

		/**
		 * @param {THREE.Object3D} object
		 * @return {number|null}
		 */
		 processSkin( object ) {

			const json = this.json;
			const nodeMap = this.nodeMap;

			const node = json.nodes[ nodeMap.get( object ) ];

			const skeleton = object.skeleton;

			if ( skeleton === undefined ) return null;

			const rootJoint = object.skeleton.bones[ 0 ];

			if ( rootJoint === undefined ) return null;

			const joints = [];
			const inverseBindMatrices = new Float32Array( skeleton.bones.length * 16 );
			const temporaryBoneInverse = new Matrix4();

			for ( let i = 0; i < skeleton.bones.length; ++ i ) {

				joints.push( nodeMap.get( skeleton.bones[ i ] ) );
				temporaryBoneInverse.copy( skeleton.boneInverses[ i ] );
				temporaryBoneInverse.multiply( object.bindMatrix ).toArray( inverseBindMatrices, i * 16 );

			}

			if ( json.skins === undefined ) json.skins = [];

			json.skins.push( {
				inverseBindMatrices: this.processAccessor( new BufferAttribute( inverseBindMatrices, 16 ) ),
				joints: joints,
				skeleton: nodeMap.get( rootJoint )
			} );

			const skinIndex = node.skin = json.skins.length - 1;

			return skinIndex;

		}

		/**
		 * Process Object3D node
		 * @param {THREE.Object3D} object Object3D to processNodeAsync
		 * @return {Promise<number>} Index of the node in the nodes list
		 */
		async processNodeAsync( object ) {

			const json = this.json;
			const options = this.options;
			const nodeMap = this.nodeMap;

			if ( ! json.nodes ) json.nodes = [];

			const nodeDef = {};

			if ( options.trs ) {

				const rotation = object.quaternion.toArray();
				const position = object.position.toArray();
				const scale = object.scale.toArray();

				if ( ! equalArray( rotation, [ 0, 0, 0, 1 ] ) ) {

					nodeDef.rotation = rotation;

				}

				if ( ! equalArray( position, [ 0, 0, 0 ] ) ) {

					nodeDef.translation = position;

				}

				if ( ! equalArray( scale, [ 1, 1, 1 ] ) ) {

					nodeDef.scale = scale;

				}

			} else {

				if ( object.matrixAutoUpdate ) {

					object.updateMatrix();

				}

				if ( isIdentityMatrix( object.matrix ) === false ) {

					nodeDef.matrix = object.matrix.elements;

				}

			}

			// We don't export empty strings name because it represents no-name in Three.js.
			if ( object.name !== '' ) nodeDef.name = String( object.name );

			this.serializeUserData( object, nodeDef );

			if ( object.isMesh || object.isLine || object.isPoints ) {

				const meshIndex = await this.processMeshAsync( object );

				if ( meshIndex !== null ) nodeDef.mesh = meshIndex;

			} else if ( object.isCamera ) {

				nodeDef.camera = this.processCamera( object );

			}

			if ( object.isSkinnedMesh ) this.skins.push( object );

			const nodeIndex = json.nodes.push( nodeDef ) - 1;
			nodeMap.set( object, nodeIndex );

			if ( object.children.length > 0 ) {

				const children = [];

				for ( let i = 0, l = object.children.length; i < l; i ++ ) {

					const child = object.children[ i ];

					if ( child.visible || options.onlyVisible === false ) {

						const childNodeIndex = await this.processNodeAsync( child );

						if ( childNodeIndex !== null ) children.push( childNodeIndex );

					}

				}

				if ( children.length > 0 ) nodeDef.children = children;

			}

			await this._invokeAllAsync( function ( ext ) {

				ext.writeNode && ext.writeNode( object, nodeDef );

			} );

			return nodeIndex;

		}

		/**
		 * Process Scene
		 * @param {Scene} scene Scene to process
		 */
		async processSceneAsync( scene ) {

			const json = this.json;
			const options = this.options;

			if ( ! json.scenes ) {

				json.scenes = [];
				json.scene = 0;

			}

			const sceneDef = {};

			if ( scene.name !== '' ) sceneDef.name = scene.name;

			json.scenes.push( sceneDef );

			const nodes = [];

			for ( let i = 0, l = scene.children.length; i < l; i ++ ) {

				const child = scene.children[ i ];

				if ( child.visible || options.onlyVisible === false ) {

					const nodeIndex = await this.processNodeAsync( child );

					if ( nodeIndex !== null ) nodes.push( nodeIndex );

				}

			}

			if ( nodes.length > 0 ) sceneDef.nodes = nodes;

			this.serializeUserData( scene, sceneDef );

		}

		/**
		 * Creates a Scene to hold a list of objects and parse it
		 * @param {Array<THREE.Object3D>} objects List of objects to process
		 */
		async processObjectsAsync( objects ) {

			const scene = new Scene();
			scene.name = 'AuxScene';

			for ( let i = 0; i < objects.length; i ++ ) {

				// We push directly to children instead of calling `add` to prevent
				// modify the .parent and break its original scene and hierarchy
				scene.children.push( objects[ i ] );

			}

			await this.processSceneAsync( scene );

		}

		/**
		 * @param {THREE.Object3D|Array<THREE.Object3D>} input
		 */
		async processInputAsync( input ) {

			const options = this.options;

			input = input instanceof Array ? input : [ input ];

			await this._invokeAllAsync( function ( ext ) {

				ext.beforeParse && ext.beforeParse( input );

			} );

			const objectsWithoutScene = [];

			for ( let i = 0; i < input.length; i ++ ) {

				if ( input[ i ] instanceof Scene ) {

					await this.processSceneAsync( input[ i ] );

				} else {

					objectsWithoutScene.push( input[ i ] );

				}

			}

			if ( objectsWithoutScene.length > 0 ) {

				await this.processObjectsAsync( objectsWithoutScene );

			}

			for ( let i = 0; i < this.skins.length; ++ i ) {

				this.processSkin( this.skins[ i ] );

			}

			for ( let i = 0; i < options.animations.length; ++ i ) {

				this.processAnimation( options.animations[ i ], input[ 0 ] );

			}

			await this._invokeAllAsync( function ( ext ) {

				ext.afterParse && ext.afterParse( input );

			} );

		}

		async _invokeAllAsync( func ) {

			for ( let i = 0, il = this.plugins.length; i < il; i ++ ) {

				await func( this.plugins[ i ] );

			}

		}

	}

	/**
	 * Punctual Lights Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
	 *
	 * @private
	 */
	class GLTFLightExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_lights_punctual';

		}

		writeNode( light, nodeDef ) {

			if ( ! light.isLight ) return;

			if ( ! light.isDirectionalLight && ! light.isPointLight && ! light.isSpotLight ) {

				console.warn( 'THREE.GLTFExporter: Only directional, point, and spot lights are supported.', light );
				return;

			}

			const writer = this.writer;
			const json = writer.json;
			const extensionsUsed = writer.extensionsUsed;

			const lightDef = {};

			if ( light.name ) lightDef.name = light.name;

			lightDef.color = light.color.toArray();

			lightDef.intensity = light.intensity;

			if ( light.isDirectionalLight ) {

				lightDef.type = 'directional';

			} else if ( light.isPointLight ) {

				lightDef.type = 'point';

				if ( light.distance > 0 ) lightDef.range = light.distance;

			} else if ( light.isSpotLight ) {

				lightDef.type = 'spot';

				if ( light.distance > 0 ) lightDef.range = light.distance;

				lightDef.spot = {};
				lightDef.spot.innerConeAngle = ( 1.0 - light.penumbra ) * light.angle;
				lightDef.spot.outerConeAngle = light.angle;

			}

			if ( light.decay !== undefined && light.decay !== 2 ) {

				console.warn( 'THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, '
					+ 'and expects light.decay=2.' );

			}

			if ( light.target
					&& ( light.target.parent !== light
					|| light.target.position.x !== 0
					|| light.target.position.y !== 0
					|| light.target.position.z !== - 1 ) ) {

				console.warn( 'THREE.GLTFExporter: Light direction may be lost. For best results, '
					+ 'make light.target a child of the light with position 0,0,-1.' );

			}

			if ( ! extensionsUsed[ this.name ] ) {

				json.extensions = json.extensions || {};
				json.extensions[ this.name ] = { lights: [] };
				extensionsUsed[ this.name ] = true;

			}

			const lights = json.extensions[ this.name ].lights;
			lights.push( lightDef );

			nodeDef.extensions = nodeDef.extensions || {};
			nodeDef.extensions[ this.name ] = { light: lights.length - 1 };

		}

	}

	/**
	 * Unlit Materials Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
	 *
	 * @private
	 */
	class GLTFMaterialsUnlitExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_materials_unlit';

		}

		async writeMaterialAsync( material, materialDef ) {

			if ( ! material.isMeshBasicMaterial ) return;

			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = {};

			extensionsUsed[ this.name ] = true;

			materialDef.pbrMetallicRoughness.metallicFactor = 0.0;
			materialDef.pbrMetallicRoughness.roughnessFactor = 0.9;

		}

	}

	/**
	 * Clearcoat Materials Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
	 *
	 * @private
	 */
	class GLTFMaterialsClearcoatExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_materials_clearcoat';

		}

		async writeMaterialAsync( material, materialDef ) {

			if ( ! material.isMeshPhysicalMaterial || material.clearcoat === 0 ) return;

			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;

			const extensionDef = {};

			extensionDef.clearcoatFactor = material.clearcoat;

			if ( material.clearcoatMap ) {

				const clearcoatMapDef = {
					index: await writer.processTextureAsync( material.clearcoatMap ),
					texCoord: material.clearcoatMap.channel
				};
				writer.applyTextureTransform( clearcoatMapDef, material.clearcoatMap );
				extensionDef.clearcoatTexture = clearcoatMapDef;

			}

			extensionDef.clearcoatRoughnessFactor = material.clearcoatRoughness;

			if ( material.clearcoatRoughnessMap ) {

				const clearcoatRoughnessMapDef = {
					index: await writer.processTextureAsync( material.clearcoatRoughnessMap ),
					texCoord: material.clearcoatRoughnessMap.channel
				};
				writer.applyTextureTransform( clearcoatRoughnessMapDef, material.clearcoatRoughnessMap );
				extensionDef.clearcoatRoughnessTexture = clearcoatRoughnessMapDef;

			}

			if ( material.clearcoatNormalMap ) {

				const clearcoatNormalMapDef = {
					index: await writer.processTextureAsync( material.clearcoatNormalMap ),
					texCoord: material.clearcoatNormalMap.channel
				};

				if ( material.clearcoatNormalScale.x !== 1 ) clearcoatNormalMapDef.scale = material.clearcoatNormalScale.x;

				writer.applyTextureTransform( clearcoatNormalMapDef, material.clearcoatNormalMap );
				extensionDef.clearcoatNormalTexture = clearcoatNormalMapDef;

			}

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = extensionDef;

			extensionsUsed[ this.name ] = true;


		}

	}

	/**
	 * Materials dispersion Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_dispersion
	 *
	 * @private
	 */
	class GLTFMaterialsDispersionExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_materials_dispersion';

		}

		async writeMaterialAsync( material, materialDef ) {

			if ( ! material.isMeshPhysicalMaterial || material.dispersion === 0 ) return;

			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;

			const extensionDef = {};

			extensionDef.dispersion = material.dispersion;

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = extensionDef;

			extensionsUsed[ this.name ] = true;

		}

	}

	/**
	 * Iridescence Materials Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_iridescence
	 *
	 * @private
	 */
	class GLTFMaterialsIridescenceExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_materials_iridescence';

		}

		async writeMaterialAsync( material, materialDef ) {

			if ( ! material.isMeshPhysicalMaterial || material.iridescence === 0 ) return;

			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;

			const extensionDef = {};

			extensionDef.iridescenceFactor = material.iridescence;

			if ( material.iridescenceMap ) {

				const iridescenceMapDef = {
					index: await writer.processTextureAsync( material.iridescenceMap ),
					texCoord: material.iridescenceMap.channel
				};
				writer.applyTextureTransform( iridescenceMapDef, material.iridescenceMap );
				extensionDef.iridescenceTexture = iridescenceMapDef;

			}

			extensionDef.iridescenceIor = material.iridescenceIOR;
			extensionDef.iridescenceThicknessMinimum = material.iridescenceThicknessRange[ 0 ];
			extensionDef.iridescenceThicknessMaximum = material.iridescenceThicknessRange[ 1 ];

			if ( material.iridescenceThicknessMap ) {

				const iridescenceThicknessMapDef = {
					index: await writer.processTextureAsync( material.iridescenceThicknessMap ),
					texCoord: material.iridescenceThicknessMap.channel
				};
				writer.applyTextureTransform( iridescenceThicknessMapDef, material.iridescenceThicknessMap );
				extensionDef.iridescenceThicknessTexture = iridescenceThicknessMapDef;

			}

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = extensionDef;

			extensionsUsed[ this.name ] = true;

		}

	}

	/**
	 * Transmission Materials Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
	 *
	 * @private
	 */
	class GLTFMaterialsTransmissionExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_materials_transmission';

		}

		async writeMaterialAsync( material, materialDef ) {

			if ( ! material.isMeshPhysicalMaterial || material.transmission === 0 ) return;

			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;

			const extensionDef = {};

			extensionDef.transmissionFactor = material.transmission;

			if ( material.transmissionMap ) {

				const transmissionMapDef = {
					index: await writer.processTextureAsync( material.transmissionMap ),
					texCoord: material.transmissionMap.channel
				};
				writer.applyTextureTransform( transmissionMapDef, material.transmissionMap );
				extensionDef.transmissionTexture = transmissionMapDef;

			}

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = extensionDef;

			extensionsUsed[ this.name ] = true;

		}

	}

	/**
	 * Materials Volume Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume
	 *
	 * @private
	 */
	class GLTFMaterialsVolumeExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_materials_volume';

		}

		async writeMaterialAsync( material, materialDef ) {

			if ( ! material.isMeshPhysicalMaterial || material.transmission === 0 ) return;

			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;

			const extensionDef = {};

			extensionDef.thicknessFactor = material.thickness;

			if ( material.thicknessMap ) {

				const thicknessMapDef = {
					index: await writer.processTextureAsync( material.thicknessMap ),
					texCoord: material.thicknessMap.channel
				};
				writer.applyTextureTransform( thicknessMapDef, material.thicknessMap );
				extensionDef.thicknessTexture = thicknessMapDef;

			}

			if ( material.attenuationDistance !== Infinity ) {

				extensionDef.attenuationDistance = material.attenuationDistance;

			}

			extensionDef.attenuationColor = material.attenuationColor.toArray();

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = extensionDef;

			extensionsUsed[ this.name ] = true;

		}

	}

	/**
	 * Materials ior Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior
	 *
	 * @private
	 */
	class GLTFMaterialsIorExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_materials_ior';

		}

		async writeMaterialAsync( material, materialDef ) {

			if ( ! material.isMeshPhysicalMaterial || material.ior === 1.5 ) return;

			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;

			const extensionDef = {};

			extensionDef.ior = material.ior;

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = extensionDef;

			extensionsUsed[ this.name ] = true;

		}

	}

	/**
	 * Materials specular Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular
	 *
	 * @private
	 */
	class GLTFMaterialsSpecularExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_materials_specular';

		}

		async writeMaterialAsync( material, materialDef ) {

			if ( ! material.isMeshPhysicalMaterial || ( material.specularIntensity === 1.0 &&
			       material.specularColor.equals( DEFAULT_SPECULAR_COLOR ) &&
			     ! material.specularIntensityMap && ! material.specularColorMap ) ) return;

			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;

			const extensionDef = {};

			if ( material.specularIntensityMap ) {

				const specularIntensityMapDef = {
					index: await writer.processTextureAsync( material.specularIntensityMap ),
					texCoord: material.specularIntensityMap.channel
				};
				writer.applyTextureTransform( specularIntensityMapDef, material.specularIntensityMap );
				extensionDef.specularTexture = specularIntensityMapDef;

			}

			if ( material.specularColorMap ) {

				const specularColorMapDef = {
					index: await writer.processTextureAsync( material.specularColorMap ),
					texCoord: material.specularColorMap.channel
				};
				writer.applyTextureTransform( specularColorMapDef, material.specularColorMap );
				extensionDef.specularColorTexture = specularColorMapDef;

			}

			extensionDef.specularFactor = material.specularIntensity;
			extensionDef.specularColorFactor = material.specularColor.toArray();

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = extensionDef;

			extensionsUsed[ this.name ] = true;

		}

	}

	/**
	 * Sheen Materials Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_sheen
	 *
	 * @private
	 */
	class GLTFMaterialsSheenExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_materials_sheen';

		}

		async writeMaterialAsync( material, materialDef ) {

			if ( ! material.isMeshPhysicalMaterial || material.sheen == 0.0 ) return;

			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;

			const extensionDef = {};

			if ( material.sheenRoughnessMap ) {

				const sheenRoughnessMapDef = {
					index: await writer.processTextureAsync( material.sheenRoughnessMap ),
					texCoord: material.sheenRoughnessMap.channel
				};
				writer.applyTextureTransform( sheenRoughnessMapDef, material.sheenRoughnessMap );
				extensionDef.sheenRoughnessTexture = sheenRoughnessMapDef;

			}

			if ( material.sheenColorMap ) {

				const sheenColorMapDef = {
					index: await writer.processTextureAsync( material.sheenColorMap ),
					texCoord: material.sheenColorMap.channel
				};
				writer.applyTextureTransform( sheenColorMapDef, material.sheenColorMap );
				extensionDef.sheenColorTexture = sheenColorMapDef;

			}

			extensionDef.sheenRoughnessFactor = material.sheenRoughness;
			extensionDef.sheenColorFactor = material.sheenColor.toArray();

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = extensionDef;

			extensionsUsed[ this.name ] = true;

		}

	}

	/**
	 * Anisotropy Materials Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_anisotropy
	 *
	 * @private
	 */
	class GLTFMaterialsAnisotropyExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_materials_anisotropy';

		}

		async writeMaterialAsync( material, materialDef ) {

			if ( ! material.isMeshPhysicalMaterial || material.anisotropy == 0.0 ) return;

			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;

			const extensionDef = {};

			if ( material.anisotropyMap ) {

				const anisotropyMapDef = { index: await writer.processTextureAsync( material.anisotropyMap ) };
				writer.applyTextureTransform( anisotropyMapDef, material.anisotropyMap );
				extensionDef.anisotropyTexture = anisotropyMapDef;

			}

			extensionDef.anisotropyStrength = material.anisotropy;
			extensionDef.anisotropyRotation = material.anisotropyRotation;

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = extensionDef;

			extensionsUsed[ this.name ] = true;

		}

	}

	/**
	 * Materials Emissive Strength Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/blob/5768b3ce0ef32bc39cdf1bef10b948586635ead3/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md
	 *
	 * @private
	 */
	class GLTFMaterialsEmissiveStrengthExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_materials_emissive_strength';

		}

		async writeMaterialAsync( material, materialDef ) {

			if ( ! material.isMeshStandardMaterial || material.emissiveIntensity === 1.0 ) return;

			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;

			const extensionDef = {};

			extensionDef.emissiveStrength = material.emissiveIntensity;

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = extensionDef;

			extensionsUsed[ this.name ] = true;

		}

	}


	/**
	 * Materials bump Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/EXT_materials_bump
	 *
	 * @private
	 */
	class GLTFMaterialsBumpExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'EXT_materials_bump';

		}

		async writeMaterialAsync( material, materialDef ) {

			if ( ! material.isMeshStandardMaterial || (
			       material.bumpScale === 1 &&
			     ! material.bumpMap ) ) return;

			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;

			const extensionDef = {};

			if ( material.bumpMap ) {

				const bumpMapDef = {
					index: await writer.processTextureAsync( material.bumpMap ),
					texCoord: material.bumpMap.channel
				};
				writer.applyTextureTransform( bumpMapDef, material.bumpMap );
				extensionDef.bumpTexture = bumpMapDef;

			}

			extensionDef.bumpFactor = material.bumpScale;

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = extensionDef;

			extensionsUsed[ this.name ] = true;

		}

	}

	/**
	 * GPU Instancing Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_mesh_gpu_instancing
	 *
	 * @private
	 */
	class GLTFMeshGpuInstancing {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'EXT_mesh_gpu_instancing';

		}

		writeNode( object, nodeDef ) {

			if ( ! object.isInstancedMesh ) return;

			const writer = this.writer;

			const mesh = object;

			const translationAttr = new Float32Array( mesh.count * 3 );
			const rotationAttr = new Float32Array( mesh.count * 4 );
			const scaleAttr = new Float32Array( mesh.count * 3 );

			const matrix = new Matrix4();
			const position = new Vector3();
			const quaternion = new Quaternion();
			const scale = new Vector3();

			for ( let i = 0; i < mesh.count; i ++ ) {

				mesh.getMatrixAt( i, matrix );
				matrix.decompose( position, quaternion, scale );

				position.toArray( translationAttr, i * 3 );
				quaternion.toArray( rotationAttr, i * 4 );
				scale.toArray( scaleAttr, i * 3 );

			}

			const attributes = {
				TRANSLATION: writer.processAccessor( new BufferAttribute( translationAttr, 3 ) ),
				ROTATION: writer.processAccessor( new BufferAttribute( rotationAttr, 4 ) ),
				SCALE: writer.processAccessor( new BufferAttribute( scaleAttr, 3 ) ),
			};

			if ( mesh.instanceColor )
				attributes._COLOR_0 = writer.processAccessor( mesh.instanceColor );

			nodeDef.extensions = nodeDef.extensions || {};
			nodeDef.extensions[ this.name ] = { attributes };

			writer.extensionsUsed[ this.name ] = true;
			writer.extensionsRequired[ this.name ] = true;

		}

	}

	/**
	 * Static utility functions
	 *
	 * @private
	 */
	GLTFExporter.Utils = {

		insertKeyframe: function ( track, time ) {

			const tolerance = 0.001; // 1ms
			const valueSize = track.getValueSize();

			const times = new track.TimeBufferType( track.times.length + 1 );
			const values = new track.ValueBufferType( track.values.length + valueSize );
			const interpolant = track.createInterpolant( new track.ValueBufferType( valueSize ) );

			let index;

			if ( track.times.length === 0 ) {

				times[ 0 ] = time;

				for ( let i = 0; i < valueSize; i ++ ) {

					values[ i ] = 0;

				}

				index = 0;

			} else if ( time < track.times[ 0 ] ) {

				if ( Math.abs( track.times[ 0 ] - time ) < tolerance ) return 0;

				times[ 0 ] = time;
				times.set( track.times, 1 );

				values.set( interpolant.evaluate( time ), 0 );
				values.set( track.values, valueSize );

				index = 0;

			} else if ( time > track.times[ track.times.length - 1 ] ) {

				if ( Math.abs( track.times[ track.times.length - 1 ] - time ) < tolerance ) {

					return track.times.length - 1;

				}

				times[ times.length - 1 ] = time;
				times.set( track.times, 0 );

				values.set( track.values, 0 );
				values.set( interpolant.evaluate( time ), track.values.length );

				index = times.length - 1;

			} else {

				for ( let i = 0; i < track.times.length; i ++ ) {

					if ( Math.abs( track.times[ i ] - time ) < tolerance ) return i;

					if ( track.times[ i ] < time && track.times[ i + 1 ] > time ) {

						times.set( track.times.slice( 0, i + 1 ), 0 );
						times[ i + 1 ] = time;
						times.set( track.times.slice( i + 1 ), i + 2 );

						values.set( track.values.slice( 0, ( i + 1 ) * valueSize ), 0 );
						values.set( interpolant.evaluate( time ), ( i + 1 ) * valueSize );
						values.set( track.values.slice( ( i + 1 ) * valueSize ), ( i + 2 ) * valueSize );

						index = i + 1;

						break;

					}

				}

			}

			track.times = times;
			track.values = values;

			return index;

		},

		mergeMorphTargetTracks: function ( clip, root ) {

			const tracks = [];
			const mergedTracks = {};
			const sourceTracks = clip.tracks;

			for ( let i = 0; i < sourceTracks.length; ++ i ) {

				let sourceTrack = sourceTracks[ i ];
				const sourceTrackBinding = PropertyBinding.parseTrackName( sourceTrack.name );
				const sourceTrackNode = PropertyBinding.findNode( root, sourceTrackBinding.nodeName );

				if ( sourceTrackBinding.propertyName !== 'morphTargetInfluences' || sourceTrackBinding.propertyIndex === undefined ) {

					// Tracks that don't affect morph targets, or that affect all morph targets together, can be left as-is.
					tracks.push( sourceTrack );
					continue;

				}

				if ( sourceTrack.createInterpolant !== sourceTrack.InterpolantFactoryMethodDiscrete
					&& sourceTrack.createInterpolant !== sourceTrack.InterpolantFactoryMethodLinear ) {

					if ( sourceTrack.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline ) {

						// This should never happen, because glTF morph target animations
						// affect all targets already.
						throw new Error( 'THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.' );

					}

					console.warn( 'THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead.' );

					sourceTrack = sourceTrack.clone();
					sourceTrack.setInterpolation( InterpolateLinear );

				}

				const targetCount = sourceTrackNode.morphTargetInfluences.length;
				const targetIndex = sourceTrackNode.morphTargetDictionary[ sourceTrackBinding.propertyIndex ];

				if ( targetIndex === undefined ) {

					throw new Error( 'THREE.GLTFExporter: Morph target name not found: ' + sourceTrackBinding.propertyIndex );

				}

				let mergedTrack;

				// If this is the first time we've seen this object, create a new
				// track to store merged keyframe data for each morph target.
				if ( mergedTracks[ sourceTrackNode.uuid ] === undefined ) {

					mergedTrack = sourceTrack.clone();

					const values = new mergedTrack.ValueBufferType( targetCount * mergedTrack.times.length );

					for ( let j = 0; j < mergedTrack.times.length; j ++ ) {

						values[ j * targetCount + targetIndex ] = mergedTrack.values[ j ];

					}

					// We need to take into consideration the intended target node
					// of our original un-merged morphTarget animation.
					mergedTrack.name = ( sourceTrackBinding.nodeName || '' ) + '.morphTargetInfluences';
					mergedTrack.values = values;

					mergedTracks[ sourceTrackNode.uuid ] = mergedTrack;
					tracks.push( mergedTrack );

					continue;

				}

				const sourceInterpolant = sourceTrack.createInterpolant( new sourceTrack.ValueBufferType( 1 ) );

				mergedTrack = mergedTracks[ sourceTrackNode.uuid ];

				// For every existing keyframe of the merged track, write a (possibly
				// interpolated) value from the source track.
				for ( let j = 0; j < mergedTrack.times.length; j ++ ) {

					mergedTrack.values[ j * targetCount + targetIndex ] = sourceInterpolant.evaluate( mergedTrack.times[ j ] );

				}

				// For every existing keyframe of the source track, write a (possibly
				// new) keyframe to the merged track. Values from the previous loop may
				// be written again, but keyframes are de-duplicated.
				for ( let j = 0; j < sourceTrack.times.length; j ++ ) {

					const keyframeIndex = this.insertKeyframe( mergedTrack, sourceTrack.times[ j ] );
					mergedTrack.values[ keyframeIndex * targetCount + targetIndex ] = sourceTrack.values[ j ];

				}

			}

			clip.tracks = tracks;

			return clip;

		},

		toFloat32BufferAttribute: function ( srcAttribute ) {

			const dstAttribute = new BufferAttribute( new Float32Array( srcAttribute.count * srcAttribute.itemSize ), srcAttribute.itemSize, false );

			if ( ! srcAttribute.normalized && ! srcAttribute.isInterleavedBufferAttribute ) {

				dstAttribute.array.set( srcAttribute.array );

				return dstAttribute;

			}

			for ( let i = 0, il = srcAttribute.count; i < il; i ++ ) {

				for ( let j = 0; j < srcAttribute.itemSize; j ++ ) {

					dstAttribute.setComponent( i, j, srcAttribute.getComponent( i, j ) );

				}

			}

			return dstAttribute;

		}

	};

	return GLTFExporter;

} ) );
