import { BlendColorFactor, OneMinusBlendColorFactor, } from '../../common/Constants.js';

import {
	GPUFrontFace, GPUCullMode, GPUColorWriteFlags, GPUCompareFunction, GPUBlendFactor, GPUBlendOperation, GPUIndexFormat, GPUStencilOperation
} from './WebGPUConstants.js';

import {
	FrontSide, BackSide, DoubleSide,
	NeverDepth, AlwaysDepth, LessDepth, LessEqualDepth, EqualDepth, GreaterEqualDepth, GreaterDepth, NotEqualDepth,
	NoBlending, NormalBlending, AdditiveBlending, SubtractiveBlending, MultiplyBlending, CustomBlending,
	ZeroFactor, OneFactor, SrcColorFactor, OneMinusSrcColorFactor, SrcAlphaFactor, OneMinusSrcAlphaFactor, DstColorFactor,
	OneMinusDstColorFactor, DstAlphaFactor, OneMinusDstAlphaFactor, SrcAlphaSaturateFactor,
	AddEquation, SubtractEquation, ReverseSubtractEquation, MinEquation, MaxEquation,
	KeepStencilOp, ZeroStencilOp, ReplaceStencilOp, InvertStencilOp, IncrementStencilOp, DecrementStencilOp, IncrementWrapStencilOp, DecrementWrapStencilOp,
	NeverStencilFunc, AlwaysStencilFunc, LessStencilFunc, LessEqualStencilFunc, EqualStencilFunc, GreaterEqualStencilFunc, GreaterStencilFunc, NotEqualStencilFunc
} from '../../../constants.js';

/**
 * A WebGPU backend utility module for managing pipelines.
 *
 * @private
 */
class WebGPUPipelineUtils {

	/**
	 * Constructs a new utility object.
	 *
	 * @param {WebGPUBackend} backend - The WebGPU backend.
	 */
	constructor( backend ) {

		/**
		 * A reference to the WebGPU backend.
		 *
		 * @type {WebGPUBackend}
		 */
		this.backend = backend;

	}

	/**
	 * Returns the sample count derived from the given render context.
	 *
	 * @private
	 * @param {RenderContext} renderContext - The render context.
	 * @return {number} The sample count.
	 */
	_getSampleCount( renderContext ) {

		return this.backend.utils.getSampleCountRenderContext( renderContext );

	}

	/**
	 * Creates a render pipeline for the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @param {Array<Promise>} promises - An array of compilation promises which are used in `compileAsync()`.
	 */
	createRenderPipeline( renderObject, promises ) {

		const { object, material, geometry, pipeline } = renderObject;
		const { vertexProgram, fragmentProgram } = pipeline;

		const backend = this.backend;
		const device = backend.device;
		const utils = backend.utils;

		const pipelineData = backend.get( pipeline );

		// bind group layouts

		const bindGroupLayouts = [];

		for ( const bindGroup of renderObject.getBindings() ) {

			const bindingsData = backend.get( bindGroup );

			bindGroupLayouts.push( bindingsData.layout );

		}

		// vertex buffers

		const vertexBuffers = backend.attributeUtils.createShaderVertexBuffers( renderObject );

		// blending

		let blending;

		if ( material.blending !== NoBlending && ( material.blending !== NormalBlending || material.transparent !== false ) ) {

			blending = this._getBlending( material );

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

		const colorWriteMask = this._getColorWriteMask( material );

		const targets = [];

		if ( renderObject.context.textures !== null ) {

			const textures = renderObject.context.textures;

			for ( let i = 0; i < textures.length; i ++ ) {

				const colorFormat = utils.getTextureFormatGPU( textures[ i ] );

				targets.push( {
					format: colorFormat,
					blend: blending,
					writeMask: colorWriteMask
				} );

			}

		} else {

			const colorFormat = utils.getCurrentColorFormat( renderObject.context );

			targets.push( {
				format: colorFormat,
				blend: blending,
				writeMask: colorWriteMask
			} );

		}

		const vertexModule = backend.get( vertexProgram ).module;
		const fragmentModule = backend.get( fragmentProgram ).module;

		const primitiveState = this._getPrimitiveState( object, geometry, material );
		const depthCompare = this._getDepthCompare( material );
		const depthStencilFormat = utils.getCurrentDepthStencilFormat( renderObject.context );

		const sampleCount = this._getSampleCount( renderObject.context );

		const pipelineDescriptor = {
			label: `renderPipeline_${ material.name || material.type }_${ material.id }`,
			vertex: Object.assign( {}, vertexModule, { buffers: vertexBuffers } ),
			fragment: Object.assign( {}, fragmentModule, { targets } ),
			primitive: primitiveState,
			multisample: {
				count: sampleCount,
				alphaToCoverageEnabled: material.alphaToCoverage && sampleCount > 1
			},
			layout: device.createPipelineLayout( {
				bindGroupLayouts
			} )
		};


		const depthStencil = {};
		const renderDepth = renderObject.context.depth;
		const renderStencil = renderObject.context.stencil;

		if ( renderDepth === true || renderStencil === true ) {

			if ( renderDepth === true ) {

				depthStencil.format = depthStencilFormat;
				depthStencil.depthWriteEnabled = material.depthWrite;
				depthStencil.depthCompare = depthCompare;

			}

			if ( renderStencil === true ) {

				depthStencil.stencilFront = stencilFront;
				depthStencil.stencilBack = {}; // three.js does not provide an API to configure the back function (gl.stencilFuncSeparate() was never used)
				depthStencil.stencilReadMask = material.stencilFuncMask;
				depthStencil.stencilWriteMask = material.stencilWriteMask;

			}

			if ( material.polygonOffset === true ) {

				depthStencil.depthBias = material.polygonOffsetUnits;
				depthStencil.depthBiasSlopeScale = material.polygonOffsetFactor;
				depthStencil.depthBiasClamp = 0; // three.js does not provide an API to configure this value

			}

			pipelineDescriptor.depthStencil = depthStencil;

		}


		if ( promises === null ) {

			pipelineData.pipeline = device.createRenderPipeline( pipelineDescriptor );

		} else {

			const p = new Promise( ( resolve /*, reject*/ ) => {

				device.createRenderPipelineAsync( pipelineDescriptor ).then( pipeline => {

					pipelineData.pipeline = pipeline;
					resolve();

				} );

			} );

			promises.push( p );

		}

	}

	/**
	 * Creates GPU render bundle encoder for the given render context.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @param {?string} [label='renderBundleEncoder'] - The label.
	 * @return {GPURenderBundleEncoder} The GPU render bundle encoder.
	 */
	createBundleEncoder( renderContext, label = 'renderBundleEncoder' ) {

		const backend = this.backend;
		const { utils, device } = backend;

		const depthStencilFormat = utils.getCurrentDepthStencilFormat( renderContext );
		const colorFormat = utils.getCurrentColorFormat( renderContext );
		const sampleCount = this._getSampleCount( renderContext );

		const descriptor = {
			label: label,
			colorFormats: [ colorFormat ],
			depthStencilFormat,
			sampleCount
		};

		return device.createRenderBundleEncoder( descriptor );

	}

	/**
	 * Creates a compute pipeline for the given compute node.
	 *
	 * @param {ComputePipeline} pipeline - The compute pipeline.
	 * @param {Array<BindGroup>} bindings - The bindings.
	 */
	createComputePipeline( pipeline, bindings ) {

		const backend = this.backend;
		const device = backend.device;

		const computeProgram = backend.get( pipeline.computeProgram ).module;

		const pipelineGPU = backend.get( pipeline );

		// bind group layouts

		const bindGroupLayouts = [];

		for ( const bindingsGroup of bindings ) {

			const bindingsData = backend.get( bindingsGroup );

			bindGroupLayouts.push( bindingsData.layout );

		}

		pipelineGPU.pipeline = device.createComputePipeline( {
			compute: computeProgram,
			layout: device.createPipelineLayout( {
				bindGroupLayouts
			} )
		} );

	}

	/**
	 * Returns the blending state as a descriptor object required
	 * for the pipeline creation.
	 *
	 * @private
	 * @param {Material} material - The material.
	 * @return {Object} The blending state.
	 */
	_getBlending( material ) {

		let color, alpha;

		const blending = material.blending;
		const blendSrc = material.blendSrc;
		const blendDst = material.blendDst;
		const blendEquation = material.blendEquation;


		if ( blending === CustomBlending ) {

			const blendSrcAlpha = material.blendSrcAlpha !== null ? material.blendSrcAlpha : blendSrc;
			const blendDstAlpha = material.blendDstAlpha !== null ? material.blendDstAlpha : blendDst;
			const blendEquationAlpha = material.blendEquationAlpha !== null ? material.blendEquationAlpha : blendEquation;

			color = {
				srcFactor: this._getBlendFactor( blendSrc ),
				dstFactor: this._getBlendFactor( blendDst ),
				operation: this._getBlendOperation( blendEquation )
			};

			alpha = {
				srcFactor: this._getBlendFactor( blendSrcAlpha ),
				dstFactor: this._getBlendFactor( blendDstAlpha ),
				operation: this._getBlendOperation( blendEquationAlpha )
			};

		} else {

			const premultipliedAlpha = material.premultipliedAlpha;

			const setBlend = ( srcRGB, dstRGB, srcAlpha, dstAlpha ) => {

				color = {
					srcFactor: srcRGB,
					dstFactor: dstRGB,
					operation: GPUBlendOperation.Add
				};

				alpha = {
					srcFactor: srcAlpha,
					dstFactor: dstAlpha,
					operation: GPUBlendOperation.Add
				};

			};

			if ( premultipliedAlpha ) {

				switch ( blending ) {

					case NormalBlending:
						setBlend( GPUBlendFactor.One, GPUBlendFactor.OneMinusSrcAlpha, GPUBlendFactor.One, GPUBlendFactor.OneMinusSrcAlpha );
						break;

					case AdditiveBlending:
						setBlend( GPUBlendFactor.One, GPUBlendFactor.One, GPUBlendFactor.One, GPUBlendFactor.One );
						break;

					case SubtractiveBlending:
						setBlend( GPUBlendFactor.Zero, GPUBlendFactor.OneMinusSrc, GPUBlendFactor.Zero, GPUBlendFactor.One );
						break;

					case MultiplyBlending:
						setBlend( GPUBlendFactor.Zero, GPUBlendFactor.Src, GPUBlendFactor.Zero, GPUBlendFactor.SrcAlpha );
						break;

				}

			} else {

				switch ( blending ) {

					case NormalBlending:
						setBlend( GPUBlendFactor.SrcAlpha, GPUBlendFactor.OneMinusSrcAlpha, GPUBlendFactor.One, GPUBlendFactor.OneMinusSrcAlpha );
						break;

					case AdditiveBlending:
						setBlend( GPUBlendFactor.SrcAlpha, GPUBlendFactor.One, GPUBlendFactor.SrcAlpha, GPUBlendFactor.One );
						break;

					case SubtractiveBlending:
						setBlend( GPUBlendFactor.Zero, GPUBlendFactor.OneMinusSrc, GPUBlendFactor.Zero, GPUBlendFactor.One );
						break;

					case MultiplyBlending:
						setBlend( GPUBlendFactor.Zero, GPUBlendFactor.Src, GPUBlendFactor.Zero, GPUBlendFactor.Src );
						break;

				}

			}

		}

		if ( color !== undefined && alpha !== undefined ) {

			return { color, alpha };

		} else {

			console.error( 'THREE.WebGPURenderer: Invalid blending: ', blending );

		}

	}
	/**
	 * Returns the GPU blend factor which is required for the pipeline creation.
	 *
	 * @private
	 * @param {number} blend - The blend factor as a three.js constant.
	 * @return {string} The GPU blend factor.
	 */
	_getBlendFactor( blend ) {

		let blendFactor;

		switch ( blend ) {

			case ZeroFactor:
				blendFactor = GPUBlendFactor.Zero;
				break;

			case OneFactor:
				blendFactor = GPUBlendFactor.One;
				break;

			case SrcColorFactor:
				blendFactor = GPUBlendFactor.Src;
				break;

			case OneMinusSrcColorFactor:
				blendFactor = GPUBlendFactor.OneMinusSrc;
				break;

			case SrcAlphaFactor:
				blendFactor = GPUBlendFactor.SrcAlpha;
				break;

			case OneMinusSrcAlphaFactor:
				blendFactor = GPUBlendFactor.OneMinusSrcAlpha;
				break;

			case DstColorFactor:
				blendFactor = GPUBlendFactor.Dst;
				break;

			case OneMinusDstColorFactor:
				blendFactor = GPUBlendFactor.OneMinusDstColor;
				break;

			case DstAlphaFactor:
				blendFactor = GPUBlendFactor.DstAlpha;
				break;

			case OneMinusDstAlphaFactor:
				blendFactor = GPUBlendFactor.OneMinusDstAlpha;
				break;

			case SrcAlphaSaturateFactor:
				blendFactor = GPUBlendFactor.SrcAlphaSaturated;
				break;

			case BlendColorFactor:
				blendFactor = GPUBlendFactor.Constant;
				break;

			case OneMinusBlendColorFactor:
				blendFactor = GPUBlendFactor.OneMinusConstant;
				break;

			default:
				console.error( 'THREE.WebGPURenderer: Blend factor not supported.', blend );

		}

		return blendFactor;

	}

	/**
	 * Returns the GPU stencil compare function which is required for the pipeline creation.
	 *
	 * @private
	 * @param {Material} material - The material.
	 * @return {string} The GPU stencil compare function.
	 */
	_getStencilCompare( material ) {

		let stencilCompare;

		const stencilFunc = material.stencilFunc;

		switch ( stencilFunc ) {

			case NeverStencilFunc:
				stencilCompare = GPUCompareFunction.Never;
				break;

			case AlwaysStencilFunc:
				stencilCompare = GPUCompareFunction.Always;
				break;

			case LessStencilFunc:
				stencilCompare = GPUCompareFunction.Less;
				break;

			case LessEqualStencilFunc:
				stencilCompare = GPUCompareFunction.LessEqual;
				break;

			case EqualStencilFunc:
				stencilCompare = GPUCompareFunction.Equal;
				break;

			case GreaterEqualStencilFunc:
				stencilCompare = GPUCompareFunction.GreaterEqual;
				break;

			case GreaterStencilFunc:
				stencilCompare = GPUCompareFunction.Greater;
				break;

			case NotEqualStencilFunc:
				stencilCompare = GPUCompareFunction.NotEqual;
				break;

			default:
				console.error( 'THREE.WebGPURenderer: Invalid stencil function.', stencilFunc );

		}

		return stencilCompare;

	}

	/**
	 * Returns the GPU stencil operation which is required for the pipeline creation.
	 *
	 * @private
	 * @param {number} op - A three.js constant defining the stencil operation.
	 * @return {string} The GPU stencil operation.
	 */
	_getStencilOperation( op ) {

		let stencilOperation;

		switch ( op ) {

			case KeepStencilOp:
				stencilOperation = GPUStencilOperation.Keep;
				break;

			case ZeroStencilOp:
				stencilOperation = GPUStencilOperation.Zero;
				break;

			case ReplaceStencilOp:
				stencilOperation = GPUStencilOperation.Replace;
				break;

			case InvertStencilOp:
				stencilOperation = GPUStencilOperation.Invert;
				break;

			case IncrementStencilOp:
				stencilOperation = GPUStencilOperation.IncrementClamp;
				break;

			case DecrementStencilOp:
				stencilOperation = GPUStencilOperation.DecrementClamp;
				break;

			case IncrementWrapStencilOp:
				stencilOperation = GPUStencilOperation.IncrementWrap;
				break;

			case DecrementWrapStencilOp:
				stencilOperation = GPUStencilOperation.DecrementWrap;
				break;

			default:
				console.error( 'THREE.WebGPURenderer: Invalid stencil operation.', stencilOperation );

		}

		return stencilOperation;

	}

	/**
	 * Returns the GPU blend operation which is required for the pipeline creation.
	 *
	 * @private
	 * @param {number} blendEquation - A three.js constant defining the blend equation.
	 * @return {string} The GPU blend operation.
	 */
	_getBlendOperation( blendEquation ) {

		let blendOperation;

		switch ( blendEquation ) {

			case AddEquation:
				blendOperation = GPUBlendOperation.Add;
				break;

			case SubtractEquation:
				blendOperation = GPUBlendOperation.Subtract;
				break;

			case ReverseSubtractEquation:
				blendOperation = GPUBlendOperation.ReverseSubtract;
				break;

			case MinEquation:
				blendOperation = GPUBlendOperation.Min;
				break;

			case MaxEquation:
				blendOperation = GPUBlendOperation.Max;
				break;

			default:
				console.error( 'THREE.WebGPUPipelineUtils: Blend equation not supported.', blendEquation );

		}

		return blendOperation;

	}

	/**
	 * Returns the primitive state as a descriptor object required
	 * for the pipeline creation.
	 *
	 * @private
	 * @param {Object3D} object - The 3D object.
	 * @param {BufferGeometry} geometry - The geometry.
	 * @param {Material} material - The material.
	 * @return {Object} The primitive state.
	 */
	_getPrimitiveState( object, geometry, material ) {

		const descriptor = {};
		const utils = this.backend.utils;

		descriptor.topology = utils.getPrimitiveTopology( object, material );

		if ( geometry.index !== null && object.isLine === true && object.isLineSegments !== true ) {

			descriptor.stripIndexFormat = ( geometry.index.array instanceof Uint16Array ) ? GPUIndexFormat.Uint16 : GPUIndexFormat.Uint32;

		}

		switch ( material.side ) {

			case FrontSide:
				descriptor.frontFace = GPUFrontFace.CCW;
				descriptor.cullMode = GPUCullMode.Back;
				break;

			case BackSide:
				descriptor.frontFace = GPUFrontFace.CCW;
				descriptor.cullMode = GPUCullMode.Front;
				break;

			case DoubleSide:
				descriptor.frontFace = GPUFrontFace.CCW;
				descriptor.cullMode = GPUCullMode.None;
				break;

			default:
				console.error( 'THREE.WebGPUPipelineUtils: Unknown material.side value.', material.side );
				break;

		}

		return descriptor;

	}

	/**
	 * Returns the GPU color write mask which is required for the pipeline creation.
	 *
	 * @private
	 * @param {Material} material - The material.
	 * @return {string} The GPU color write mask.
	 */
	_getColorWriteMask( material ) {

		return ( material.colorWrite === true ) ? GPUColorWriteFlags.All : GPUColorWriteFlags.None;

	}

	/**
	 * Returns the GPU depth compare function which is required for the pipeline creation.
	 *
	 * @private
	 * @param {Material} material - The material.
	 * @return {string} The GPU depth compare function.
	 */
	_getDepthCompare( material ) {

		let depthCompare;

		if ( material.depthTest === false ) {

			depthCompare = GPUCompareFunction.Always;

		} else {

			const depthFunc = material.depthFunc;

			switch ( depthFunc ) {

				case NeverDepth:
					depthCompare = GPUCompareFunction.Never;
					break;

				case AlwaysDepth:
					depthCompare = GPUCompareFunction.Always;
					break;

				case LessDepth:
					depthCompare = GPUCompareFunction.Less;
					break;

				case LessEqualDepth:
					depthCompare = GPUCompareFunction.LessEqual;
					break;

				case EqualDepth:
					depthCompare = GPUCompareFunction.Equal;
					break;

				case GreaterEqualDepth:
					depthCompare = GPUCompareFunction.GreaterEqual;
					break;

				case GreaterDepth:
					depthCompare = GPUCompareFunction.Greater;
					break;

				case NotEqualDepth:
					depthCompare = GPUCompareFunction.NotEqual;
					break;

				default:
					console.error( 'THREE.WebGPUPipelineUtils: Invalid depth function.', depthFunc );

			}

		}

		return depthCompare;

	}

}

export default WebGPUPipelineUtils;
