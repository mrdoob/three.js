/**
 * @author fernandojsg / http://fernandojsg.com
 */

var WEBGL_TO_THREE = {
	// @TODO Replace with computed property name [WEBGL_CONSTANTS.*] when available on es6

	// Types
	5126: Number,
	//35674: THREE.Matrix2,
	35675: THREE.Matrix3,
	35676: THREE.Matrix4,
	35664: THREE.Vector2,
	35665: THREE.Vector3,
	35666: THREE.Vector4,
	35678: THREE.Texture,

	// Component types
	5120: Int8Array,
	5121: Uint8Array,
	5122: Int16Array,
	5123: Uint16Array,
	5125: Uint32Array,
	5126: Float32Array,

	// Filters
	9728: THREE.NearestFilter,
	9729: THREE.LinearFilter,
	9984: THREE.NearestMipMapNearestFilter,
	9985: THREE.LinearMipMapNearestFilter,
	9986: THREE.NearestMipMapLinearFilter,
	9987: THREE.LinearMipMapLinearFilter,

	// Wrapping
	33071: THREE.ClampToEdgeWrapping,
	33648: THREE.MirroredRepeatWrapping,
	10497: THREE.RepeatWrapping,

	// Texture format
	6406: THREE.AlphaFormat,
	6407: THREE.RGBFormat,
	6408: THREE.RGBAFormat,
	6409: THREE.LuminanceFormat,
	6410: THREE.LuminanceAlphaFormat,

	// Data types
	5121: THREE.UnsignedByteType,
	32819: THREE.UnsignedShort4444Type,
	32820: THREE.UnsignedShort5551Type,
	33635: THREE.UnsignedShort565Type,

	// Sides
	1028: THREE.BackSide,
	1029: THREE.FrontSide,
	//1032: THREE.NoSide,

	// Depth func
	512: THREE.NeverDepth,
	513: THREE.LessDepth,
	514: THREE.EqualDepth,
	515: THREE.LessEqualDepth,
	516: THREE.GreaterEqualDepth,
	517: THREE.NotEqualDepth,
	518: THREE.GreaterEqualDepth,
	519: THREE.AlwaysDepth,

	// Blend equations
	32774: THREE.AddEquation,
	32778: THREE.SubtractEquation,
	32779: THREE.ReverseSubtractEquation,

	// Blend functions
	0: THREE.ZeroFactor,
	1: THREE.OneFactor,
	768: THREE.SrcColorFactor,
	769: THREE.OneMinusSrcColorFactor,
	770: THREE.SrcAlphaFactor,
	771: THREE.OneMinusSrcAlphaFactor,
	772: THREE.DstAlphaFactor,
	773: THREE.OneMinusDstAlphaFactor,
	774: THREE.DstColorFactor,
	775: THREE.OneMinusDstColorFactor,
	776: THREE.SrcAlphaSaturateFactor
};

 export { WEBGL_TO_THREE };
