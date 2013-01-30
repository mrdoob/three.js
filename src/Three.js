/**
 * @author mrdoob / http://mrdoob.com/
 * @author Larry Battle / http://bateru.com/news
 */

var THREE = THREE || { REVISION: '55' };

self.console = self.console || {

	info: function () {},
	log: function () {},
	debug: function () {},
	warn: function () {},
	error: function () {}

};

self.Int32Array = self.Int32Array || Array;
self.Float32Array = self.Float32Array || Array;

// Shims for "startsWith", "endsWith", and "trim" for browsers where this is not yet implemented
// not sure we should have this, or at least not have it here
// Taken from ES6-shim 0.6.0 (https://github.com/paulmillr/es6-shim/).
(function() {
	// Define configurable, writable and non-enumerable props
	// if they don’t exists.
	var defineProperties = function(object, map) {
		Object.keys(map).forEach(function(name) {
			var method = map[name];
			if (!object[name]) {
				Object.defineProperty(object, name, {
					configurable: true,
					enumerable: false,
					writable: true,
					value: method
				});
			}
		});
	};

	defineProperties(String.prototype, {
		startsWith: function(searchString) {
			var position = arguments[1];

			// Let searchStr be ToString(searchString).
			var searchStr = searchString.toString();

			// ReturnIfAbrupt(searchStr).

			// Let S be the result of calling ToString,
			// giving it the this value as its argument.
			var s = this.toString();

			// ReturnIfAbrupt(S).

			// Let pos be ToInteger(position).
			// (If position is undefined, this step produces the value 0).
			var pos = (position === undefined) ? 0 : Number.toInteger(position);
			// ReturnIfAbrupt(pos).

			// Let len be the number of elements in S.
			var len = s.length;

			// Let start be min(max(pos, 0), len).
			var start = Math.min(Math.max(pos, 0), len);

			// Let searchLength be the number of elements in searchString.
			var searchLength = searchString.length;

			// If searchLength+start is greater than len, return false.
			if ((searchLength + start) > len) return false;

			// If the searchLength sequence of elements of S starting at
			// start is the same as the full element sequence of searchString,
			// return true.
			var index = ''.indexOf.call(s, searchString, start);
			return index === start;
		},

		endsWith: function(searchString) {
			var endPosition = arguments[1];

			// ReturnIfAbrupt(CheckObjectCoercible(this value)).
			// Let S be the result of calling ToString, giving it the this value as its argument.
			// ReturnIfAbrupt(S).
			var s = this.toString();

			// Let searchStr be ToString(searchString).
			// ReturnIfAbrupt(searchStr).
			var searchStr = searchString.toString();

			// Let len be the number of elements in S.
			var len = s.length;

			// If endPosition is undefined, let pos be len, else let pos be ToInteger(endPosition).
			// ReturnIfAbrupt(pos).
			var pos = (endPosition === undefined) ?
			  len :
			  Number.toInteger(endPosition);

			// Let end be min(max(pos, 0), len).
			var end = Math.min(Math.max(pos, 0), len);

			// Let searchLength be the number of elements in searchString.
			var searchLength = searchString.length;

			// Let start be end - searchLength.
			var start = end - searchLength;

			// If start is less than 0, return false.
			if (start < 0) return false;

			// If the searchLength sequence of elements of S starting at start is the same as the full element sequence of searchString, return true.
			// Otherwise, return false.
			var index = ''.indexOf.call(s, searchString, start);
			return index === start;
		},
		trim: function() {
			return this.replace( /^\s+|\s+$/g, '' );
		}
	});
})();


// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

( function () {

	var lastTime = 0;
	var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

	for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++ x ) {

		window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
		window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ] || window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];

	}

	if ( window.requestAnimationFrame === undefined ) {

		window.requestAnimationFrame = function ( callback, element ) {

			var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
			lastTime = currTime + timeToCall;
			return id;

		};

	}

	window.cancelAnimationFrame = window.cancelAnimationFrame || function ( id ) { window.clearTimeout( id ) };

}() );

// GL STATE CONSTANTS

THREE.CullFaceNone = 0;
THREE.CullFaceBack = 1;
THREE.CullFaceFront = 2;
THREE.CullFaceFrontBack = 3;

THREE.FrontFaceDirectionCW = 0;
THREE.FrontFaceDirectionCCW = 1;

// SHADOWING TYPES

THREE.BasicShadowMap = 0;
THREE.PCFShadowMap = 1;
THREE.PCFSoftShadowMap = 2;

// MATERIAL CONSTANTS

// side

THREE.FrontSide = 0;
THREE.BackSide = 1;
THREE.DoubleSide = 2;

// shading

THREE.NoShading = 0;
THREE.FlatShading = 1;
THREE.SmoothShading = 2;

// colors

THREE.NoColors = 0;
THREE.FaceColors = 1;
THREE.VertexColors = 2;

// blending modes

THREE.NoBlending = 0;
THREE.NormalBlending = 1;
THREE.AdditiveBlending = 2;
THREE.SubtractiveBlending = 3;
THREE.MultiplyBlending = 4;
THREE.CustomBlending = 5;

// custom blending equations
// (numbers start from 100 not to clash with other
//  mappings to OpenGL constants defined in Texture.js)

THREE.AddEquation = 100;
THREE.SubtractEquation = 101;
THREE.ReverseSubtractEquation = 102;

// custom blending destination factors

THREE.ZeroFactor = 200;
THREE.OneFactor = 201;
THREE.SrcColorFactor = 202;
THREE.OneMinusSrcColorFactor = 203;
THREE.SrcAlphaFactor = 204;
THREE.OneMinusSrcAlphaFactor = 205;
THREE.DstAlphaFactor = 206;
THREE.OneMinusDstAlphaFactor = 207;

// custom blending source factors

//THREE.ZeroFactor = 200;
//THREE.OneFactor = 201;
//THREE.SrcAlphaFactor = 204;
//THREE.OneMinusSrcAlphaFactor = 205;
//THREE.DstAlphaFactor = 206;
//THREE.OneMinusDstAlphaFactor = 207;
THREE.DstColorFactor = 208;
THREE.OneMinusDstColorFactor = 209;
THREE.SrcAlphaSaturateFactor = 210;


// TEXTURE CONSTANTS

THREE.MultiplyOperation = 0;
THREE.MixOperation = 1;
THREE.AddOperation = 2;

// Mapping modes

THREE.UVMapping = function () {};

THREE.CubeReflectionMapping = function () {};
THREE.CubeRefractionMapping = function () {};

THREE.SphericalReflectionMapping = function () {};
THREE.SphericalRefractionMapping = function () {};

// Wrapping modes

THREE.RepeatWrapping = 1000;
THREE.ClampToEdgeWrapping = 1001;
THREE.MirroredRepeatWrapping = 1002;

// Filters

THREE.NearestFilter = 1003;
THREE.NearestMipMapNearestFilter = 1004;
THREE.NearestMipMapLinearFilter = 1005;
THREE.LinearFilter = 1006;
THREE.LinearMipMapNearestFilter = 1007;
THREE.LinearMipMapLinearFilter = 1008;

// Data types

THREE.UnsignedByteType = 1009;
THREE.ByteType = 1010;
THREE.ShortType = 1011;
THREE.UnsignedShortType = 1012;
THREE.IntType = 1013;
THREE.UnsignedIntType = 1014;
THREE.FloatType = 1015;

// Pixel types

//THREE.UnsignedByteType = 1009;
THREE.UnsignedShort4444Type = 1016;
THREE.UnsignedShort5551Type = 1017;
THREE.UnsignedShort565Type = 1018;

// Pixel formats

THREE.AlphaFormat = 1019;
THREE.RGBFormat = 1020;
THREE.RGBAFormat = 1021;
THREE.LuminanceFormat = 1022;
THREE.LuminanceAlphaFormat = 1023;

// Compressed texture formats

THREE.RGB_S3TC_DXT1_Format = 2001;
THREE.RGBA_S3TC_DXT1_Format = 2002;
THREE.RGBA_S3TC_DXT3_Format = 2003;
THREE.RGBA_S3TC_DXT5_Format = 2004;

/*
// Potential future PVRTC compressed texture formats
THREE.RGB_PVRTC_4BPPV1_Format = 2100;
THREE.RGB_PVRTC_2BPPV1_Format = 2101;
THREE.RGBA_PVRTC_4BPPV1_Format = 2102;
THREE.RGBA_PVRTC_2BPPV1_Format = 2103;
*/
