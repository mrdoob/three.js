export const GPUPrimitiveTopology = {
	PointList: 'point-list',
	LineList: 'line-list',
	LineStrip: 'line-strip',
	TriangleList: 'triangle-list',
	TriangleStrip: 'triangle-strip',
};

export const GPUCompareFunction = {
	Never: 'never',
	Less: 'less',
	Equal: 'equal',
	LessEqual: 'less-equal',
	Greater: 'greater',
	NotEqual: 'not-equal',
	GreaterEqual: 'greater-equal',
	Always: 'always'
};

export const GPUStoreOp = {
	Store: 'store',
	Clear: 'clear'
};

export const GPULoadOp = {
	Load: 'load'
};

export const GPUFrontFace = {
	CCW: 'ccw',
	CW: 'cw'
};

export const GPUCullMode = {
	None: 'none',
	Front: 'front',
	Back: 'back'
};

export const GPUIndexFormat = {
	Uint16: 'uint16',
	Uint32: 'uint32'
};

export const GPUVertexFormat = {
	Uchar2: 'uchar2',
	Uchar4: 'uchar4',
	Char2: 'char2',
	Char4: 'char4',
	Uchar2Norm: 'uchar2norm',
	Uchar4Norm: 'uchar4norm',
	Char2Norm: 'char2norm',
	Char4Norm: 'char4norm',
	Ushort2: 'ushort2',
	Ushort4: 'ushort4',
	Short2: 'short2',
	Short4: 'short4',
	Ushort2Norm: 'ushort2norm',
	Ushort4Norm: 'ushort4norm',
	Short2Norm: 'short2norm',
	Short4Norm: 'short4norm',
	Half2: 'half2',
	Half4: 'half4',
	Float: 'float',
	Float2: 'float2',
	Float3: 'float3',
	Float4: 'float4',
	Uint: 'uint',
	Uint2: 'uint2',
	Uint3: 'uint3',
	Uint4: 'uint4',
	Int: 'int',
	Int2: 'int2',
	Int3: 'int3',
	Int4: 'int4',
};

export const GPUTextureFormat = {

	// 8-bit formats

	R8Unorm: 'r8unorm',
	R8Snorm: 'r8snorm',
	R8Uint: 'r8uint',
	R8Sint: 'r8sint',

	// 16-bit formats

	R16Uint: 'r16uint',
	R16Sint: 'r16sint',
	R16Float: 'r16float',
	RG8Unorm: 'rg8unorm',
	RG8Snorm: 'rg8snorm',
	RG8Uint: 'rg8uint',
	RG8Sint: 'rg8sint',

	// 32-bit formats

	R32Uint: 'r32uint',
	R32Sint: 'r32sint',
	R32Float: 'r32float',
	RG16Uint: 'rg16uint',
	RG16Sint: 'rg16sint',
	RG16Float: 'rg16float',
	RGBA8Unorm: 'rgba8unorm',
	RGBA8UnormSRGB: 'rgba8unorm-srgb',
	RGBA8Snorm: 'rgba8snorm',
	RGBA8Uint: 'rgba8uint',
	RGBA8Sint: 'rgba8sint',
	BRGA8Unorm: 'bgra8unorm',
	BRGA8UnormSRGB: 'bgra8unorm-srgb',
	// Packed 32-bit formats
	RGB9E5UFloat: 'rgb9e5ufloat',
	RGB10A2Unorm: 'rgb10a2unorm',
	RG11B10uFloat: 'rgb10a2unorm',

	// 64-bit formats

	RG32Uint: 'rg32uint',
	RG32Sint: 'rg32sint',
	RG32Float: 'rg32float',
	RGBA16Uint: 'rgba16uint',
	RGBA16Sint: 'rgba16sint',
	RGBA16Float: 'rgba16float',

	// 128-bit formats

	RGBA32Uint: 'rgba32uint',
	RGBA32Sint: 'rgba32sint',
	RGBA32Float: 'rgba32float',

	// Depth and stencil formats

	Stencil8: 'stencil8',
	Depth16Unorm: 'depth16unorm',
	Depth24Plus: 'depth24plus',
	Depth24PlusStencil8: 'depth24plus-stencil8',
	Depth32Float: 'depth32float',

	// BC compressed formats usable if 'texture-compression-bc' is both
	// supported by the device/user agent and enabled in requestDevice.

	BC1RGBAUnorm: 'bc1-rgba-unorm',
	BC1RGBAUnormSRGB: 'bc1-rgba-unorm-srgb',
	BC2RGBAUnorm: 'bc2-rgba-unorm',
	BC2RGBAUnormSRGB: 'bc2-rgba-unorm-srgb',
	BC3RGBAUnorm: 'bc3-rgba-unorm',
	BC3RGBAUnormSRGB: 'bc3-rgba-unorm-srgb',
	BC4RUnorm: 'bc4-r-unorm',
	BC4RSNorm: 'bc4-r-snorm',
	BC5RGUnorm: 'bc5-rg-unorm',
	BC5RGSnorm: 'bc5-rg-snorm',
	BC6HRGBUFloat: 'bc6h-rgb-ufloat',
	BC6HRGBFloat: 'bc6h-rgb-float',
	BC7RGBAUnorm: 'bc7-rgba-unorm',
	BC7RGBAUnormSRGB: 'bc7-rgba-srgb',

	// 'depth24unorm-stencil8' extension

	Depth24UnormStencil8: 'depth24unorm-stencil8',

	// 'depth32float-stencil8' extension

	Depth32FloatStencil8: 'depth32float-stencil8',

};

export const GPUAddressMode = {
	ClampToEdge: 'clamp-to-edge',
	Repeat: 'repeat',
	MirrorRepeat: 'mirror-repeat'
};

export const GPUFilterMode = {
	Linear: 'linear',
	Nearest: 'nearest'
};

export const GPUBlendFactor = {
	Zero: 'zero',
	One: 'one',
	SrcColor: 'src-color',
	OneMinusSrcColor: 'one-minus-src-color',
	SrcAlpha: 'src-alpha',
	OneMinusSrcAlpha: 'one-minus-src-alpha',
	DstColor: 'dst-color',
	OneMinusDstColor: 'one-minus-dst-color',
	DstAlpha: 'dst-alpha',
	OneMinusDstAlpha: 'one-minus-dst-alpha',
	SrcAlphaSaturated: 'src-alpha-saturated',
	BlendColor: 'blend-color',
	OneMinusBlendColor: 'one-minus-blend-color'
};

export const GPUBlendOperation = {
	Add: 'add',
	Subtract: 'subtract',
	ReverseSubtract: 'reverse-subtract',
	Min: 'min',
	Max: 'max'
};

export const GPUColorWriteFlags = {
	None: 0,
	Red: 0x1,
	Green: 0x2,
	Blue: 0x4,
	Alpha: 0x8,
	All: 0xF
};

export const GPUStencilOperation = {
	Keep: 'keep',
	Zero: 'zero',
	Replace: 'replace',
	Invert: 'invert',
	IncrementClamp: 'increment-clamp',
	DecrementClamp: 'decrement-clamp',
	IncrementWrap: 'increment-wrap',
	DecrementWrap: 'decrement-wrap'
};

export const GPUBindingType = {
	UniformBuffer: 'uniform-buffer',
	StorageBuffer: 'storage-buffer',
	ReadonlyStorageBuffer: 'readonly-storage-buffer',
	Sampler: 'sampler',
	ComparisonSampler: 'comparison-sampler',
	SampledTexture: 'sampled-texture',
	MultisampledTexture: 'multisampled-texture',
	ReadonlyStorageTexture: 'readonly-storage-texture',
	WriteonlyStorageTexture: 'writeonly-storage-texture'
};

export const GPUTextureDimension = {
	OneD: '1d',
	TwoD: '2d',
	ThreeD: '3d'
};

export const GPUTextureViewDimension = {
	OneD: '1d',
	TwoD: '2d',
	TwoDArray: '2d-array',
	Cube: 'cube',
	CubeArray: 'cube-array',
	ThreeD: '3d'
};

export const GPUInputStepMode = {
	Vertex: 'vertex',
	Instance: 'instance'
};

// @TODO: Move to src/constants.js

export const BlendColorFactor = 211;
export const OneMinusBlendColorFactor = 212;
