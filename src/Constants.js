module.exports = {

	REVISION: "72dev",

	// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent.button
	MOUSE: { LEFT: 0, MIDDLE: 1, RIGHT: 2 },

	// GL States
	CullFaceNone: 0,
	CullFaceBack: 1,
	CullFaceFront: 2,
	CullFaceFrontBack: 3,

	FrontFaceDirectionCW: 0,
	FrontFaceDirectionCCW: 1,

	// Shadowing Types
	BasicShadowMap: 0,
	PCFShadowMap: 1,
	PCFSoftShadowMap: 2,

	// Material Constants
	FrontSide: 0,
	BackSide: 1,
	DoubleSide: 2,

	FlatShading: 1,
	SmoothShading: 2,

	NoColors: 0,
	FaceColors: 1,
	VertexColors: 2,

	NoBlending: 0,
	NormalBlending: 1,
	AdditiveBlending: 2,
	SubtractiveBlending: 3,
	MultiplyBlending: 4,
	CustomBlending: 5,

	// Custom blending equations (100+ to avoid clash with other mappings in Texture.js)
	AddEquation: 100,
	SubtractEquation: 101,
	ReverseSubtractEquation: 102,
	MinEquation: 103,
	MaxEquation: 104,

	// Custom blending destination factors
	ZeroFactor: 200,
	OneFactor: 201,
	SrcColorFactor: 202,
	OneMinusSrcColorFactor: 203,
	SrcAlphaFactor: 204,
	OneMinusSrcAlphaFactor: 205,
	DstAlphaFactor: 206,
	OneMinusDstAlphaFactor: 207,

	// Custom blending source factors
	/* ZeroFactor: 200,
	OneFactor: 201,
	SrcAlphaFactor: 204,
	OneMinusSrcAlphaFactor: 205,
	DstAlphaFactor: 206,
	OneMinusDstAlphaFactor: 207,*/
	DstColorFactor: 208,
	OneMinusDstColorFactor: 209,
	SrcAlphaSaturateFactor: 210,

	// Depth modes
	NeverDepth: 0,
	AlwaysDepth: 1,
	LessDepth: 2,
	LessEqualDepth: 3,
	EqualDepth: 4,
	GreaterEqualDepth: 5,
	GreaterDepth: 6,
	NotEqualDepth: 7,

	// Texture constants
	MultiplyOperation: 0,
	MixOperation: 1,
	AddOperation: 2,

	// Mapping modes
	UVMapping: 300,

	CubeReflectionMapping: 301,
	CubeRefractionMapping: 302,

	EquirectangularReflectionMapping: 303,
	EquirectangularRefractionMapping: 304,

	SphericalReflectionMapping: 305,

	// Wrapping modes
	RepeatWrapping: 1000,
	ClampToEdgeWrapping: 1001,
	MirroredRepeatWrapping: 1002,

	// Filters
	NearestFilter: 1003,
	NearestMipMapNearestFilter: 1004,
	NearestMipMapLinearFilter: 1005,
	LinearFilter: 1006,
	LinearMipMapNearestFilter: 1007,
	LinearMipMapLinearFilter: 1008,

	// Data types
	UnsignedByteType: 1009,
	ByteType: 1010,
	ShortType: 1011,
	UnsignedShortType: 1012,
	IntType: 1013,
	UnsignedIntType: 1014,
	FloatType: 1015,
	HalfFloatType: 1025,

	// Pixel types
	//UnsignedByteType: 1009,
	UnsignedShort4444Type: 1016,
	UnsignedShort5551Type: 1017,
	UnsignedShort565Type: 1018,

	// Pixel formats
	AlphaFormat: 1019,
	RGBFormat: 1020,
	RGBAFormat: 1021,
	LuminanceFormat: 1022,
	LuminanceAlphaFormat: 1023,
	//RGBEFormat handled as RGBAFormat in shaders
	RGBEFormat: this.RGBAFormat,//1024,

	// DDS / ST3C Compressed texture formats
	RGB_S3TC_DXT1_Format: 2001,
	RGBA_S3TC_DXT1_Format: 2002,
	RGBA_S3TC_DXT3_Format: 2003,
	RGBA_S3TC_DXT5_Format: 2004,

	// PVRTC compressed texture formats
	RGB_PVRTC_4BPPV1_Format: 2100,
	RGB_PVRTC_2BPPV1_Format: 2101,
	RGBA_PVRTC_4BPPV1_Format: 2102,
	RGBA_PVRTC_2BPPV1_Format: 2103,

	// DEPRECATED
	LineStrip: 0,
	LinePieces: 1

};
