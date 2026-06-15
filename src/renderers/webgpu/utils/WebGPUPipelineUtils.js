import { BlendColorFactor, OneMinusBlendColorFactor, } from '../../common/Constants.js';

import {
	GPUFrontFace, GPUCullMode, GPUColorWriteFlags, GPUCompareFunction, GPUBlendFactor, GPUBlendOperation, GPUIndexFormat, GPUStencilOperation, GPUPrimitiveTopology
} from './WebGPUConstants.js';

import {
	BackSide, DoubleSide,
	NeverDepth, AlwaysDepth, LessDepth, LessEqualDepth, EqualDepth, GreaterEqualDepth, GreaterDepth, NotEqualDepth,
	NoBlending, NormalBlending, AdditiveBlending, SubtractiveBlending, MultiplyBlending, CustomBlending, MaterialBlending,
	ZeroFactor, OneFactor, SrcColorFactor, OneMinusSrcColorFactor, SrcAlphaFactor, OneMinusSrcAlphaFactor, DstColorFactor,
	OneMinusDstColorFactor, DstAlphaFactor, OneMinusDstAlphaFactor, SrcAlphaSaturateFactor,
	AddEquation, SubtractEquation, ReverseSubtractEquation, MinEquation, MaxEquation,
	KeepStencilOp, ZeroStencilOp, ReplaceStencilOp, InvertStencilOp, IncrementStencilOp, DecrementStencilOp, IncrementWrapStencilOp, DecrementWrapStencilOp,
	NeverStencilFunc, AlwaysStencilFunc, LessStencilFunc, LessEqualStencilFunc, EqualStencilFunc, GreaterEqualStencilFunc, GreaterStencilFunc, NotEqualStencilFunc
} from '../../../constants.js';

import { error, ReversedDepthFuncs, warn, warnOnce } from '../../../utils.js';

import GPUComputePipelineDescriptor from '../descriptors/GPUComputePipelineDescriptor.js';
import GPUPipelineLayoutDescriptor from '../descriptors/GPUPipelineLayoutDescriptor.js';
import GPURenderBundleEncoderDescriptor from '../descriptors/GPURenderBundleEncoderDescriptor.js';
import GPURenderPipelineDescriptor from '../descriptors/GPURenderPipelineDescriptor.js';

const _computePipelineDescriptor = new GPUComputePipelineDescriptor();
const _pipelineLayoutDescriptor = new GPUPipelineLayoutDescriptor();
const _renderBundleEncoderDescriptor = new GPURenderBundleEncoderDescriptor();
const _renderPipelineDescriptor = new GPURenderPipelineDescriptor();

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
			const { layoutGPU } = bindingsData.layout;

			bindGroupLayouts.push( layoutGPU );

		}

		// vertex buffers

		const vertexBuffers = backend.attributeUtils.createShaderVertexBuffers( renderObject );

		// material blending

		let materialBlending;

		if ( material.blending !== NoBlending && ( material.blending !== NormalBlending || material.transparent !== false ) ) {

			materialBlending = this._getBlending( material );

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
			const mrt = renderObject.context.mrt;

			for ( let i = 0; i < textures.length; i ++ ) {

				const texture = textures[ i ];
				const colorFormat = utils.getTextureFormatGPU( texture );

				// mrt blending

				let blending;

				if ( mrt !== null ) {

					if ( this.backend.compatibilityMode !== true ) {

						const blendMode = mrt.getBlendMode( texture.name );

						if ( blendMode.blending === MaterialBlending ) {

							blending = materialBlending;

						} else if ( blendMode.blending !== NoBlending ) {

							blending = this._getBlending( blendMode );

						}

					} else {

						warnOnce( 'WebGPURenderer: Multiple Render Targets (MRT) blending configuration is not fully supported in compatibility mode. The material blending will be used for all render targets.' );

						blending = materialBlending;

					}

				} else {

					blending = materialBlending;

				}

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
				blend: materialBlending,
				writeMask: colorWriteMask
			} );

		}

		const vertexModule = backend.get( vertexProgram ).module;
		const fragmentModule = backend.get( fragmentProgram ).module;

		const primitiveState = this._getPrimitiveState( object, geometry, material );
		const depthCompare = this._getDepthCompare( material );
		const depthStencilFormat = utils.getCurrentDepthStencilFormat( renderObject.context );

		const sampleCount = this._getSampleCount( renderObject.context );

		_pipelineLayoutDescriptor.bindGroupLayouts = bindGroupLayouts;

		const pipelineLayout = device.createPipelineLayout( _pipelineLayoutDescriptor );

		_pipelineLayoutDescriptor.reset();

		_renderPipelineDescriptor.label = `renderPipeline_${ material.name || material.type }_${ material.id }`;
		_renderPipelineDescriptor.vertex = Object.assign( {}, vertexModule, { buffers: vertexBuffers } );
		_renderPipelineDescriptor.fragment = Object.assign( {}, fragmentModule, { targets } );
		_renderPipelineDescriptor.primitive = primitiveState;
		_renderPipelineDescriptor.multisample.count = sampleCount;
		_renderPipelineDescriptor.multisample.alphaToCoverageEnabled = material.alphaToCoverage && sampleCount > 1;
		_renderPipelineDescriptor.layout = pipelineLayout;

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
				depthStencil.stencilBack = stencilFront; // apply the same stencil ops to both faces, matching gl.stencilOp() which is not face-separated
				depthStencil.stencilReadMask = material.stencilFuncMask;
				depthStencil.stencilWriteMask = material.stencilWriteMask;

			}

			if ( material.polygonOffset === true && ( primitiveState.topology === GPUPrimitiveTopology.TriangleList ) ) {

				depthStencil.depthBias = material.polygonOffsetUnits;
				depthStencil.depthBiasSlopeScale = material.polygonOffsetFactor;
				depthStencil.depthBiasClamp = 0; // three.js does not provide an API to configure this value

			}

			_renderPipelineDescriptor.depthStencil = depthStencil;

		}

		// create pipeline

		device.pushErrorScope( 'validation' );

		const stages = [
			{ program: vertexProgram, module: vertexModule.module },
			{ program: fragmentProgram, module: fragmentModule.module }
		];
		const pipelineLabel = _renderPipelineDescriptor.label;

		if ( promises === null ) {

			pipelineData.pipeline = device.createRenderPipeline( _renderPipelineDescriptor );

			_renderPipelineDescriptor.reset();

			device.popErrorScope().then( ( err ) => {

				if ( err !== null ) {

					pipelineData.error = true;

					error( `WebGPURenderer: Render pipeline creation failed (${ pipelineLabel }): ${ err.message }` );

					this._reportShaderDiagnostics( stages, pipelineLabel );

				}

			} );

		} else {

			const p = new Promise( async ( resolve /*, reject*/ ) => {

				try {

					let asyncError = null;
					let pipelinePromise = null;

					try {

						pipelinePromise = device.createRenderPipelineAsync( _renderPipelineDescriptor );

					} catch ( err ) {

						asyncError = err;

					}

					_renderPipelineDescriptor.reset();

					if ( pipelinePromise !== null ) {

						try {

							pipelineData.pipeline = await pipelinePromise;

						} catch ( err ) {

							asyncError = err;

						}

					}

					const errorScope = await device.popErrorScope();

					if ( errorScope !== null || asyncError !== null ) {

						pipelineData.error = true;

						const reason = ( errorScope && errorScope.message ) || ( asyncError && asyncError.message ) || 'unknown';
						error( `WebGPURenderer: Async render pipeline creation failed (${ pipelineLabel }): ${ reason }` );

						await this._reportShaderDiagnostics( stages, pipelineLabel );

					}

				} finally {

					// Guarantee resolution so `compileAsync`'s Promise.all cannot hang on an
					// unexpected throw from any await above.
					resolve();

				}

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
		const colorFormats = utils.getCurrentColorFormats( renderContext );
		const sampleCount = this._getSampleCount( renderContext );

		_renderBundleEncoderDescriptor.label = label;
		_renderBundleEncoderDescriptor.colorFormats = colorFormats;
		_renderBundleEncoderDescriptor.depthStencilFormat = depthStencilFormat;
		_renderBundleEncoderDescriptor.sampleCount = sampleCount;

		const bundleEncoder = device.createRenderBundleEncoder( _renderBundleEncoderDescriptor );

		_renderBundleEncoderDescriptor.reset();

		return bundleEncoder;

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
			const { layoutGPU } = bindingsData.layout;

			bindGroupLayouts.push( layoutGPU );

		}

		const computeStage = pipeline.computeProgram;
		const pipelineLabel = `computePipeline_${ computeStage.stage }${ computeStage.name ? `_${ computeStage.name }` : '' }`;

		device.pushErrorScope( 'validation' );

		_pipelineLayoutDescriptor.bindGroupLayouts = bindGroupLayouts;

		const pipelineLayout = device.createPipelineLayout( _pipelineLayoutDescriptor );

		_pipelineLayoutDescriptor.reset();

		_computePipelineDescriptor.label = pipelineLabel;
		_computePipelineDescriptor.compute = computeProgram;
		_computePipelineDescriptor.layout = pipelineLayout;

		pipelineGPU.pipeline = device.createComputePipeline( _computePipelineDescriptor );

		_computePipelineDescriptor.reset();

		device.popErrorScope().then( ( err ) => {

			if ( err !== null ) {

				pipelineGPU.error = true;

				error( `WebGPURenderer: Compute pipeline creation failed (${ pipelineLabel }): ${ err.message }` );

				this._reportShaderDiagnostics( [ { program: computeStage, module: computeProgram.module } ], pipelineLabel );

			}

		} );

	}

	/**
	 * Reads line-accurate diagnostics from shader modules and logs them.
	 * Called from pipeline creation error paths to turn opaque validation
	 * failures into actionable WGSL feedback.
	 *
	 * @private
	 * @param {Array<{program: ProgrammableStage, module: GPUShaderModule}>} stages - Pairs of program + compiled shader module.
	 * @param {string} pipelineLabel - Label of the owning pipeline, used as log prefix.
	 * @return {Promise<void>}
	 */
	async _reportShaderDiagnostics( stages, pipelineLabel ) {

		for ( const { program, module } of stages ) {

			const info = await module.getCompilationInfo();
			if ( info.messages.length === 0 ) continue;

			const sourceLines = program.code.split( '\n' );

			for ( const msg of info.messages ) {

				const location = msg.lineNum > 0
					? ` at line ${ msg.lineNum }${ msg.linePos > 0 ? `:${ msg.linePos }` : '' }`
					: '';

				const header = `WebGPURenderer [${ pipelineLabel } / ${ program.stage } ${ msg.type }]${ location }: ${ msg.message }`;

				let excerpt = '';
				if ( msg.lineNum > 0 && msg.lineNum <= sourceLines.length ) {

					excerpt = `\n  ${ sourceLines[ msg.lineNum - 1 ] }`;
					if ( msg.linePos > 0 ) excerpt += `\n  ${ ' '.repeat( msg.linePos - 1 ) }^`;

				}

				( msg.type === 'error' ? error : warn )( header + excerpt );

			}

		}

	}

	/**
	 * Returns the blending state as a descriptor object required
	 * for the pipeline creation.
	 *
	 * @private
	 * @param {Material|BlendMode} object - The object containing blending information.
	 * @return {Object} The blending state.
	 */
	_getBlending( object ) {

		let color, alpha;

		const blending = object.blending;
		const blendSrc = object.blendSrc;
		const blendDst = object.blendDst;
		const blendEquation = object.blendEquation;


		if ( blending === CustomBlending ) {

			const blendSrcAlpha = object.blendSrcAlpha !== null ? object.blendSrcAlpha : blendSrc;
			const blendDstAlpha = object.blendDstAlpha !== null ? object.blendDstAlpha : blendDst;
			const blendEquationAlpha = object.blendEquationAlpha !== null ? object.blendEquationAlpha : blendEquation;

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

			const premultipliedAlpha = object.premultipliedAlpha;

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
						setBlend( GPUBlendFactor.Dst, GPUBlendFactor.OneMinusSrcAlpha, GPUBlendFactor.Zero, GPUBlendFactor.One );
						break;

				}

			} else {

				switch ( blending ) {

					case NormalBlending:
						setBlend( GPUBlendFactor.SrcAlpha, GPUBlendFactor.OneMinusSrcAlpha, GPUBlendFactor.One, GPUBlendFactor.OneMinusSrcAlpha );
						break;

					case AdditiveBlending:
						setBlend( GPUBlendFactor.SrcAlpha, GPUBlendFactor.One, GPUBlendFactor.One, GPUBlendFactor.One );
						break;

					case SubtractiveBlending:
						error( `WebGPURenderer: "SubtractiveBlending" requires "${ object.isMaterial ? 'material' : 'blendMode' }.premultipliedAlpha = true".` );
						break;

					case MultiplyBlending:
						error( `WebGPURenderer: "MultiplyBlending" requires "${ object.isMaterial ? 'material' : 'blendMode' }.premultipliedAlpha = true".` );
						break;

				}

			}

		}

		if ( color !== undefined && alpha !== undefined ) {

			return { color, alpha };

		} else {

			error( 'WebGPURenderer: Invalid blending: ', blending );

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
				blendFactor = GPUBlendFactor.OneMinusDst;
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
				error( 'WebGPURenderer: Blend factor not supported.', blend );

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
				error( 'WebGPURenderer: Invalid stencil function.', stencilFunc );

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
				error( 'WebGPURenderer: Invalid stencil operation.', stencilOperation );

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
				error( 'WebGPUPipelineUtils: Blend equation not supported.', blendEquation );

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

		//

		descriptor.topology = utils.getPrimitiveTopology( object, material );

		if ( geometry.index !== null && object.isLine === true && object.isLineSegments !== true ) {

			descriptor.stripIndexFormat = ( geometry.index.array instanceof Uint16Array ) ? GPUIndexFormat.Uint16 : GPUIndexFormat.Uint32;

		}

		//

		let flipSided = ( material.side === BackSide );

		if ( object.isMesh && object.matrixWorld.determinant3x3() < 0 ) flipSided = ! flipSided;

		descriptor.frontFace = ( flipSided === true ) ? GPUFrontFace.CW : GPUFrontFace.CCW;

		//

		descriptor.cullMode = ( material.side === DoubleSide ) ? GPUCullMode.None : GPUCullMode.Back;

		return descriptor;

	}

	/**
	 * Returns the GPU color write mask which is required for the pipeline creation.
	 *
	 * @private
	 * @param {Material} material - The material.
	 * @return {number} The GPU color write mask.
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

			const depthFunc = ( this.backend.parameters.reversedDepthBuffer ) ? ReversedDepthFuncs[ material.depthFunc ] : material.depthFunc;

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
					error( 'WebGPUPipelineUtils: Invalid depth function.', depthFunc );

			}

		}

		return depthCompare;

	}

}

export default WebGPUPipelineUtils;
