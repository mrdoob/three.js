import { GPUPrimitiveTopology, GPUIndexFormat, GPUCompareFunction, GPUFrontFace, GPUCullMode, GPUVertexFormat, GPUBlendFactor, GPUBlendOperation, BlendColorFactor, OneMinusBlendColorFactor, GPUColorWriteFlags, GPUStencilOperation, GPUInputStepMode } from './constants.js';
import {
	FrontSide, BackSide, DoubleSide,
	NeverDepth, AlwaysDepth, LessDepth, LessEqualDepth, EqualDepth, GreaterEqualDepth, GreaterDepth, NotEqualDepth,
	NeverStencilFunc, AlwaysStencilFunc, LessStencilFunc, LessEqualStencilFunc, EqualStencilFunc, GreaterEqualStencilFunc, GreaterStencilFunc, NotEqualStencilFunc,
	KeepStencilOp, ZeroStencilOp, ReplaceStencilOp, InvertStencilOp, IncrementStencilOp, DecrementStencilOp, IncrementWrapStencilOp, DecrementWrapStencilOp,
	NoBlending, NormalBlending, AdditiveBlending, SubtractiveBlending, MultiplyBlending, CustomBlending,
	AddEquation, SubtractEquation, ReverseSubtractEquation, MinEquation, MaxEquation,
	ZeroFactor, OneFactor, SrcColorFactor, OneMinusSrcColorFactor, SrcAlphaFactor, OneMinusSrcAlphaFactor, DstAlphaFactor, OneMinusDstAlphaFactor, DstColorFactor, OneMinusDstColorFactor, SrcAlphaSaturateFactor
} from 'three';

class WebGPURenderPipeline {

	constructor( device, renderer, sampleCount ) {

		this.cacheKey = null;
		this.shaderAttributes = null;
		this.stageVertex = null;
		this.stageFragment = null;
		this.usedTimes = 0;

		this._device = device;
		this._renderer = renderer;
		this._sampleCount = sampleCount;

	}

	init( cacheKey, stageVertex, stageFragment, object, nodeBuilder ) {

		const material = object.material;
		const geometry = object.geometry;

		// determine shader attributes

		const shaderAttributes = this._getShaderAttributes( nodeBuilder, geometry );

		// vertex buffers

		const vertexBuffers = [];

		for ( const attribute of shaderAttributes ) {

			const name = attribute.name;
			const geometryAttribute = geometry.getAttribute( name );
			const stepMode = ( geometryAttribute !== undefined && geometryAttribute.isInstancedBufferAttribute ) ? GPUInputStepMode.Instance : GPUInputStepMode.Vertex;

			vertexBuffers.push( {
				arrayStride: attribute.arrayStride,
				attributes: [ { shaderLocation: attribute.slot, offset: 0, format: attribute.format } ],
				stepMode: stepMode
			} );

		}

		this.cacheKey = cacheKey;
		this.shaderAttributes = shaderAttributes;
		this.stageVertex = stageVertex;
		this.stageFragment = stageFragment;

		// blending

		let alphaBlend = {};
		let colorBlend = {};

		if ( material.transparent === true && material.blending !== NoBlending ) {

			alphaBlend = this._getAlphaBlend( material );
			colorBlend = this._getColorBlend( material );

		}

		// stencil

		let stencilFront = {};

		if ( material.stencilWrite === true ) {

			stencilFront = {
				compare: this._getStencilCompare( material ),
				failOp: this._getStencilOperation( material.stencilFail ),
				depthFailOp: this._getStencilOperation( material.stencilZFail ),
				passOp: this._getStencilOperation( material.stencilZPass )
			};

		}

		//

		const primitiveState = this._getPrimitiveState( object, material );
		const colorWriteMask = this._getColorWriteMask( material );
		const depthCompare = this._getDepthCompare( material );
		const colorFormat = this._renderer.getCurrentColorFormat();
		const depthStencilFormat = this._renderer.getCurrentDepthStencilFormat();

		this.pipeline = this._device.createRenderPipeline( {
			vertex: Object.assign( {}, stageVertex.stage, { buffers: vertexBuffers } ),
			fragment: Object.assign( {}, stageFragment.stage, { targets: [ {
				format: colorFormat,
				blend: {
					alpha: alphaBlend,
					color: colorBlend
				},
				writeMask: colorWriteMask
			} ] } ),
			primitive: primitiveState,
			depthStencil: {
				format: depthStencilFormat,
				depthWriteEnabled: material.depthWrite,
				depthCompare: depthCompare,
				stencilFront: stencilFront,
				stencilBack: {}, // three.js does not provide an API to configure the back function (gl.stencilFuncSeparate() was never used)
				stencilReadMask: material.stencilFuncMask,
				stencilWriteMask: material.stencilWriteMask
			},
			multisample: {
				count: this._sampleCount
			}
		} );

	}

	_getArrayStride( type, bytesPerElement ) {

		// @TODO: This code is GLSL specific. We need to update when we switch to WGSL.

		if ( type === 'float' || type === 'int' || type === 'uint' ) return bytesPerElement;
		if ( type === 'vec2' || type === 'ivec2' || type === 'uvec2' ) return bytesPerElement * 2;
		if ( type === 'vec3' || type === 'ivec3' || type === 'uvec3' ) return bytesPerElement * 3;
		if ( type === 'vec4' || type === 'ivec4' || type === 'uvec4' ) return bytesPerElement * 4;

		console.error( 'THREE.WebGPURenderer: Shader variable type not supported yet.', type );

	}

	_getAlphaBlend( material ) {

		const blending = material.blending;
		const premultipliedAlpha = material.premultipliedAlpha;

		switch ( blending ) {

			case NormalBlending:

				if ( premultipliedAlpha === false ) {

					return {
						srcFactor: GPUBlendFactor.One,
						dstFactor: GPUBlendFactor.OneMinusSrcAlpha,
						operation: GPUBlendOperation.Add
					};

				}

				break;

			case AdditiveBlending:
				// no alphaBlend settings
				break;

			case SubtractiveBlending:

				if ( premultipliedAlpha === true ) {

					return {
						srcFactor: GPUBlendFactor.OneMinusSrcColor,
						dstFactor: GPUBlendFactor.OneMinusSrcAlpha,
						operation: GPUBlendOperation.Add
					};

				}

				break;

			case MultiplyBlending:
				if ( premultipliedAlpha === true ) {

					return {
						srcFactor: GPUBlendFactor.Zero,
						dstFactor: GPUBlendFactor.SrcAlpha,
						operation: GPUBlendOperation.Add
					};

				}

				break;

			case CustomBlending:

				const blendSrcAlpha = material.blendSrcAlpha;
				const blendDstAlpha = material.blendDstAlpha;
				const blendEquationAlpha = material.blendEquationAlpha;

				if ( blendSrcAlpha !== null && blendDstAlpha !== null && blendEquationAlpha !== null ) {

					return {
						srcFactor: this._getBlendFactor( blendSrcAlpha ),
						dstFactor: this._getBlendFactor( blendDstAlpha ),
						operation: this._getBlendOperation( blendEquationAlpha )
					};

				}

				break;

			default:
				console.error( 'THREE.WebGPURenderer: Blending not supported.', blending );

		}

	}

	_getBlendFactor( blend ) {

		switch ( blend ) {

			case ZeroFactor:
				return GPUBlendFactor.Zero;

			case OneFactor:
				return GPUBlendFactor.One;

			case SrcColorFactor:
				return GPUBlendFactor.SrcColor;

			case OneMinusSrcColorFactor:
				return GPUBlendFactor.OneMinusSrcColor;

			case SrcAlphaFactor:
				return GPUBlendFactor.SrcAlpha;

			case OneMinusSrcAlphaFactor:
				return GPUBlendFactor.OneMinusSrcAlpha;

			case DstColorFactor:
				return GPUBlendFactor.DstColor;

			case OneMinusDstColorFactor:
				return GPUBlendFactor.OneMinusDstColor;

			case DstAlphaFactor:
				return GPUBlendFactor.DstAlpha;

			case OneMinusDstAlphaFactor:
				return GPUBlendFactor.OneMinusDstAlpha;

			case SrcAlphaSaturateFactor:
				return GPUBlendFactor.SrcAlphaSaturated;

			case BlendColorFactor:
				return GPUBlendFactor.BlendColor;

			case OneMinusBlendColorFactor:
				return GPUBlendFactor.OneMinusBlendColor;

			default:
				console.error( 'THREE.WebGPURenderer: Blend factor not supported.', blend );

		}

	}

	_getBlendOperation( blendEquation ) {

		switch ( blendEquation ) {

			case AddEquation:
				return GPUBlendOperation.Add;

			case SubtractEquation:
				return GPUBlendOperation.Subtract;

			case ReverseSubtractEquation:
				return GPUBlendOperation.ReverseSubtract;

			case MinEquation:
				return GPUBlendOperation.Min;

			case MaxEquation:
				return GPUBlendOperation.Max;

			default:
				console.error( 'THREE.WebGPURenderer: Blend equation not supported.', blendEquation );

		}

	}

	_getColorBlend( material ) {

		const blending = material.blending;
		const premultipliedAlpha = material.premultipliedAlpha;

		switch ( blending ) {

			case NormalBlending:
				return {
					srcFactor: ( premultipliedAlpha === true ) ? GPUBlendFactor.One : GPUBlendFactor.SrcAlpha,
					dstFactor: GPUBlendFactor.OneMinusSrcAlpha,
					operation: GPUBlendOperation.Add
				};

			case AdditiveBlending:
				return {
					srcFactor: ( premultipliedAlpha === true ) ? GPUBlendFactor.One : GPUBlendFactor.SrcAlpha,
					dstFactor: null,
					operation: GPUBlendOperation.Add
				};

			case SubtractiveBlending:
				return {
					srcFactor: GPUBlendFactor.Zero,
					dstFactor: ( premultipliedAlpha === true ) ? GPUBlendFactor.Zero : GPUBlendFactor.OneMinusSrcColor,
					operation: GPUBlendOperation.Add
				};

			case MultiplyBlending:
				return {
					srcFactor: GPUBlendFactor.Zero,
					dstFactor: GPUBlendFactor.SrcColor,
					operation: GPUBlendOperation.Add
				};

			case CustomBlending:
				return {
					srcFactor: this._getBlendFactor( material.blendSrc ),
					dstFactor: this._getBlendFactor( material.blendDst ),
					operation: this._getBlendOperation( material.blendEquation )
				};

			default:
				console.error( 'THREE.WebGPURenderer: Blending not supported.', blending );
				return {
					srcFactor: null,
					dstFactor: null,
					operation: null
				};

		}

	}

	_getColorWriteMask( material ) {

		return ( material.colorWrite === true ) ? GPUColorWriteFlags.All : GPUColorWriteFlags.None;

	}

	_getDepthCompare( material ) {

		if ( material.depthTest === false ) {

			return GPUCompareFunction.Always;

		}

		const depthFunc = material.depthFunc;

		switch ( depthFunc ) {

			case NeverDepth:
				return GPUCompareFunction.Never;

			case AlwaysDepth:
				return GPUCompareFunction.Always;

			case LessDepth:
				return GPUCompareFunction.Less;

			case LessEqualDepth:
				return GPUCompareFunction.LessEqual;

			case EqualDepth:
				return GPUCompareFunction.Equal;

			case GreaterEqualDepth:
				return GPUCompareFunction.GreaterEqual;

			case GreaterDepth:
				return GPUCompareFunction.Greater;

			case NotEqualDepth:
				return GPUCompareFunction.NotEqual;

			default:
				console.error( 'THREE.WebGPURenderer: Invalid depth function.', depthFunc );

		}

	}

	_getPrimitiveState( object, material ) {

		const descriptor = {};

		descriptor.topology = this._getPrimitiveTopology( object );

		if ( object.isLine === true && object.isLineSegments !== true ) {

			const geometry = object.geometry;
			const count = ( geometry.index ) ? geometry.index.count : geometry.attributes.position.count;
			descriptor.stripIndexFormat = ( count > 65535 ) ? GPUIndexFormat.Uint32 : GPUIndexFormat.Uint16; // define data type for primitive restart value

		}

		switch ( material.side ) {

			case FrontSide:
				descriptor.frontFace = GPUFrontFace.CW;
				descriptor.cullMode = GPUCullMode.Front;
				break;

			case BackSide:
				descriptor.frontFace = GPUFrontFace.CW;
				descriptor.cullMode = GPUCullMode.Back;
				break;

			case DoubleSide:
				descriptor.frontFace = GPUFrontFace.CW;
				descriptor.cullMode = GPUCullMode.None;
				break;

			default:
				console.error( 'THREE.WebGPURenderer: Unknown Material.side value.', material.side );
				break;

		}

		return descriptor;

	}

	_getPrimitiveTopology( object ) {

		if ( object.isMesh ) return GPUPrimitiveTopology.TriangleList;
		else if ( object.isPoints ) return GPUPrimitiveTopology.PointList;
		else if ( object.isLineSegments ) return GPUPrimitiveTopology.LineList;
		else if ( object.isLine ) return GPUPrimitiveTopology.LineStrip;

	}

	_getStencilCompare( material ) {

		const stencilFunc = material.stencilFunc;

		switch ( stencilFunc ) {

			case NeverStencilFunc:
				return GPUCompareFunction.Never;

			case AlwaysStencilFunc:
				return GPUCompareFunction.Always;

			case LessStencilFunc:
				return GPUCompareFunction.Less;

			case LessEqualStencilFunc:
				return GPUCompareFunction.LessEqual;

			case EqualStencilFunc:
				return GPUCompareFunction.Equal;

			case GreaterEqualStencilFunc:
				return GPUCompareFunction.GreaterEqual;

			case GreaterStencilFunc:
				return GPUCompareFunction.Greater;

			case NotEqualStencilFunc:
				return GPUCompareFunction.NotEqual;

			default:
				console.error( 'THREE.WebGPURenderer: Invalid stencil function.', stencilFunc );

		}

	}

	_getStencilOperation( op ) {

		switch ( op ) {

			case KeepStencilOp:
				return GPUStencilOperation.Keep;

			case ZeroStencilOp:
				return GPUStencilOperation.Zero;

			case ReplaceStencilOp:
				return GPUStencilOperation.Replace;

			case InvertStencilOp:
				return GPUStencilOperation.Invert;

			case IncrementStencilOp:
				return GPUStencilOperation.IncrementClamp;

			case DecrementStencilOp:
				return GPUStencilOperation.DecrementClamp;

			case IncrementWrapStencilOp:
				return GPUStencilOperation.IncrementWrap;

			case DecrementWrapStencilOp:
				return GPUStencilOperation.DecrementWrap;

			default:
				console.error( 'THREE.WebGPURenderer: Invalid stencil operation.', stencilOperation );

		}

	}

	_getVertexFormat( type, bytesPerElement ) {

		// float

		if ( type === 'float' ) return GPUVertexFormat.Float32;

		if ( type === 'vec2' ) {

			if ( bytesPerElement === 2 ) {

				return GPUVertexFormat.Float16x2;

			} else {

				return GPUVertexFormat.Float32x2;

			}

		}

		if ( type === 'vec3' ) return GPUVertexFormat.Float32x3;

		if ( type === 'vec4' ) {

			if ( bytesPerElement === 2 ) {

				return GPUVertexFormat.Float16x4;

			} else {

				return GPUVertexFormat.Float32x4;

			}

		}

		// int

		if ( type === 'int' ) return GPUVertexFormat.Sint32;

		if ( type === 'ivec2' ) {

			if ( bytesPerElement === 1 ) {

				return GPUVertexFormat.Sint8x2;

			} else if ( bytesPerElement === 2 ) {

				return GPUVertexFormat.Sint16x2;

			} else {

				return GPUVertexFormat.Sint32x2;

			}

		}

		if ( type === 'ivec3' ) return GPUVertexFormat.Sint32x3;

		if ( type === 'ivec4' ) {

			if ( bytesPerElement === 1 ) {

				return GPUVertexFormat.Sint8x4;

			} else if ( bytesPerElement === 2 ) {

				return GPUVertexFormat.Sint16x4;

			} else {

				return GPUVertexFormat.Sint32x4;

			}

		}

		// uint

		if ( type === 'uint' ) return GPUVertexFormat.Uint32;

		if ( type === 'uvec2' ) {

			if ( bytesPerElement === 1 ) {

				return GPUVertexFormat.Uint8x2;

			} else if ( bytesPerElement === 2 ) {

				return GPUVertexFormat.Uint16x2;

			} else {

				return GPUVertexFormat.Uint32x2;

			}

		}

		if ( type === 'uvec3' ) return GPUVertexFormat.Uint32x3;

		if ( type === 'uvec4' ) {

			if ( bytesPerElement === 1 ) {

				return GPUVertexFormat.Uint8x4;

			} else if ( bytesPerElement === 2 ) {

				return GPUVertexFormat.Uint16x4;

			} else {

				return GPUVertexFormat.Uint32x4;

			}

		}

		console.error( 'THREE.WebGPURenderer: Shader variable type not supported yet.', type );

	}

	_getShaderAttributes( nodeBuilder, geometry ) {

		const nodeAttributes = nodeBuilder.attributes;
		const attributes = [];

		for ( let slot = 0; slot < nodeAttributes.length; slot ++ ) {

			const nodeAttribute = nodeAttributes[ slot ];

			const name = nodeAttribute.name;
			const type = nodeAttribute.type;

			const geometryAttribute = geometry.getAttribute( name );
			const bytesPerElement = ( geometryAttribute !== undefined ) ? geometryAttribute.array.BYTES_PER_ELEMENT : 4;

			const arrayStride = this._getArrayStride( type, bytesPerElement );
			const format = this._getVertexFormat( type, bytesPerElement );

			attributes.push( {
				name,
				arrayStride,
				format,
				slot
			} );

		}

		return attributes;

	}

}

export default WebGPURenderPipeline;
