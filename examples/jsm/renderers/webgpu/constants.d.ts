
export enum GPUPrimitiveTopology {}
export const PointList: GPUPrimitiveTopology;
export const LineList: GPUPrimitiveTopology;
export const LineStrip: GPUPrimitiveTopology;
export const TriangleList: GPUPrimitiveTopology;
export const TriangleStrip: GPUPrimitiveTopology;

export enum GPUCompareFunction {}
export const Never: GPUCompareFunction;
export const Less: GPUCompareFunction;
export const Equal: GPUCompareFunction;
export const LessEqual: GPUCompareFunction;
export const Greater: GPUCompareFunction;
export const NotEqual: GPUCompareFunction;
export const GreaterEqual: GPUCompareFunction;
export const Always: GPUCompareFunction;

export enum GPUStoreOp {}
export const Store: GPUStoreOp;
export const Clear: GPUStoreOp;

export enum GPULoadOp {}
export const Load: GPULoadOp;

export enum GPUFrontFace {}
export const CCW: GPUFrontFace;
export const CW: GPUFrontFace;

export enum GPUCullMode {}
export const None: GPUCullMode;
export const Front: GPUCullMode;
export const Back: GPUCullMode;

export enum GPUIndexFormat {}
export const Uint16: GPUIndexFormat;


export enum GPUVertexFormat {}
export const Uchar2: GPUVertexFormat;
export const Uchar4: GPUVertexFormat;
export const Char2: GPUVertexFormat;
export const Char4: GPUVertexFormat;
export const Uchar2Norm: GPUVertexFormat;
export const Uchar4Norm: GPUVertexFormat;
export const Char2Norm: GPUVertexFormat;
export const Char4Norm: GPUVertexFormat;
export const Ushort2: GPUVertexFormat;
export const Ushort4: GPUVertexFormat;
export const Short2: GPUVertexFormat;
export const Short4: GPUVertexFormat;
export const Ushort2Norm: GPUVertexFormat;
export const Ushort4Norm: GPUVertexFormat;
export const Short2Norm: GPUVertexFormat;
export const Short4Norm: GPUVertexFormat;
export const Half2: GPUVertexFormat;
export const Half4: GPUVertexFormat;
export const Float: GPUVertexFormat;
export const Float2: GPUVertexFormat;
export const Float3: GPUVertexFormat;
export const Float4: GPUVertexFormat;
export const Uint: GPUVertexFormat;
export const Uint2: GPUVertexFormat;
export const Uint3: GPUVertexFormat;
export const Uint4: GPUVertexFormat;
export const Int: GPUVertexFormat;
export const Int2: GPUVertexFormat;
export const Int3: GPUVertexFormat;
export const Int4: GPUVertexFormat;

export enum GPUTextureFormat {}

// 8-bit formats
export const R8Unorm: GPUTextureFormat;
export const R8Snorm: GPUTextureFormat;
export const R8Uint: GPUTextureFormat;
export const R8Sint: GPUTextureFormat;

// 16-bit formats
export const R16Uint: GPUTextureFormat;
export const R16Sint: GPUTextureFormat;
export const R16Float: GPUTextureFormat;
export const RG8Unorm: GPUTextureFormat;
export const RG8Snorm: GPUTextureFormat;
export const RG8Uint: GPUTextureFormat;
export const RG8Sint: GPUTextureFormat;

// 32-bit formats
export const R32Uint: GPUTextureFormat;
export const R32Sint: GPUTextureFormat;
export const R32Float: GPUTextureFormat;
export const RG16Uint: GPUTextureFormat;
export const RG16Sint: GPUTextureFormat;
export const RG16Float: GPUTextureFormat;
export const RGBA8Unorm: GPUTextureFormat;
export const RGBA8UnormSRGB: GPUTextureFormat;
export const RGBA8Snorm: GPUTextureFormat;
export const RGBA8Uint: GPUTextureFormat;
export const RGBA8Sint: GPUTextureFormat;
export const BRGA8Unorm: GPUTextureFormat;
export const BRGA8UnormSRGB: GPUTextureFormat;

// Packed 32-bit formats
export const RGB9E5UFloat: GPUTextureFormat;
export const RGB10A2Unorm: GPUTextureFormat;
export const RG11B10uFloat: GPUTextureFormat;

// 64-bit formats
export const RG32Uint: GPUTextureFormat;
export const RG32Sint: GPUTextureFormat;
export const RG32Float: GPUTextureFormat;
export const RGBA16Uint: GPUTextureFormat;
export const RGBA16Sint: GPUTextureFormat;
export const RGBA16Float: GPUTextureFormat;

// 128-bit formats
export const RGBA32Uint: GPUTextureFormat;
export const RGBA32Sint: GPUTextureFormat;
export const RGBA32Float: GPUTextureFormat;

// Depth and stencil formats
export const Stencil8: GPUTextureFormat;
export const Depth16Unorm: GPUTextureFormat;
export const Depth24Plus: GPUTextureFormat;
export const Depth24PlusStencil8: GPUTextureFormat;
export const Depth32Float: GPUTextureFormat;

// BC compressed formats usable if 'texture-compression-bc' is both
// supported by the device/user agent and enabled in requestDevice.
export const BC1RGBAUnorm: GPUTextureFormat;
export const BC1RGBAUnormSRGB: GPUTextureFormat;
export const BC2RGBAUnorm: GPUTextureFormat;
export const BC2RGBAUnormSRGB: GPUTextureFormat;
export const BC3RGBAUnorm: GPUTextureFormat;
export const BC3RGBAUnormSRGB: GPUTextureFormat;
export const BC4RUnorm: GPUTextureFormat;
export const BC4RSNorm: GPUTextureFormat;
export const BC5RGUnorm: GPUTextureFormat;
export const BC5RGSnorm: GPUTextureFormat;
export const BC6HRGBUfloat: GPUTextureFormat;
export const BC6HRGBFloat: GPUTextureFormat;
export const BC7RGBAUnorm: GPUTextureFormat;
export const BC7RGBAUnormSRGB: GPUTextureFormat;

// 'depth24unorm-stencil8' extension
export const Depth24UnormStencil8: GPUTextureFormat;

// 'depth32float-stencil8' extension
export const Depth32FloatStencil8: GPUTextureFormat;


export enum GPUAddressMode {}
export const ClampToEdge: GPUAddressMode;
export const Repeat: GPUAddressMode;
export const MirrorRepeat: GPUAddressMode;

export enum GPUFilterMode {}
export const Linear: GPUFilterMode;
export const Nearest: GPUFilterMode;

export enum GPUBlendFactor {}
export const Zero: GPUBlendFactor;
export const One: GPUBlendFactor;
export const SrcColor: GPUBlendFactor;
export const OneMinusSrcColor: GPUBlendFactor;
export const SrcAlpha: GPUBlendFactor;
export const OneMinusSrcAlpha: GPUBlendFactor;
export const DstColor: GPUBlendFactor;
export const OneMinusDstColor: GPUBlendFactor;
export const DstAlpha: GPUBlendFactor;
export const OneMinusDstAlpha: GPUBlendFactor;
export const SrcAlphaSaturated: GPUBlendFactor;
export const BlendColor: GPUBlendFactor;
export const OneMinusBlendColor: GPUBlendFactor;

export enum GPUBlendOperation {}
export const Add: GPUBlendOperation;
export const Subtract: GPUBlendOperation;
export const ReverseSubtract: GPUBlendOperation;
export const Min: GPUBlendOperation;
export const Max: GPUBlendOperation;
