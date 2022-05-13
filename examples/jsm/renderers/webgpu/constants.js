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
	Discard: 'discard'
};

export const GPULoadOp = {
	Load: 'load',
	Clear: 'clear'
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
	Uint8x2: 'uint8x2',
	Uint8x4: 'uint8x4',
	Sint8x2: 'sint8x2',
	Sint8x4: 'sint8x4',
	Unorm8x2: 'unorm8x2',
	Unorm8x4: 'unorm8x4',
	Snorm8x2: 'snorm8x2',
	Snorm8x4: 'snorm8x4',
	Uint16x2: 'uint16x2',
	Uint16x4: 'uint16x4',
	Sint16x2: 'sint16x2',
	Sint16x4: 'sint16x4',
	Unorm16x2: 'unorm16x2',
	Unorm16x4: 'unorm16x4',
	Snorm16x2: 'snorm16x2',
	Snorm16x4: 'snorm16x4',
	Float16x2: 'float16x2',
	Float16x4: 'float16x4',
	Float32: 'float32',
	Float32x2: 'float32x2',
	Float32x3: 'float32x3',
	Float32x4: 'float32x4',
	Uint32: 'uint32',
	Uint32x2: 'uint32x2',
	Uint32x3: 'uint32x3',
	Uint32x4: 'uint32x4',
	Sint32: 'sint32',
	Sint32x2: 'sint32x2',
	Sint32x3: 'sint32x3',
	Sint32x4: 'sint32x4'
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
	BGRA8Unorm: 'bgra8unorm',
	BGRA8UnormSRGB: 'bgra8unorm-srgb',
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

export const GPUChunkSize = 16; // size of a chunk in bytes (STD140 layout)

// @TODO: Move to src/constants.js

export const BlendColorFactor = 211;
export const OneMinusBlendColorFactor = 212;
