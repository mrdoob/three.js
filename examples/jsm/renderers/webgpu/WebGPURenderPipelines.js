import { GPUPrimitiveTopology, GPUIndexFormat, GPUTextureFormat, GPUCompareFunction, GPUFrontFace, GPUCullMode, GPUVertexFormat, GPUBlendFactor, GPUBlendOperation, BlendColorFactor, OneMinusBlendColorFactor, GPUColorWriteFlags, GPUStencilOperation } from './constants.js';
import {
	FrontSide, BackSide, DoubleSide,
	NeverDepth, AlwaysDepth, LessDepth, LessEqualDepth, EqualDepth, GreaterEqualDepth, GreaterDepth, NotEqualDepth,
	NeverStencilFunc, AlwaysStencilFunc, LessStencilFunc, LessEqualStencilFunc, EqualStencilFunc, GreaterEqualStencilFunc, GreaterStencilFunc, NotEqualStencilFunc,
	KeepStencilOp, ZeroStencilOp, ReplaceStencilOp, InvertStencilOp, IncrementStencilOp, DecrementStencilOp, IncrementWrapStencilOp, DecrementWrapStencilOp,
	NoBlending, NormalBlending, AdditiveBlending, SubtractiveBlending, MultiplyBlending, CustomBlending,
	AddEquation, SubtractEquation, ReverseSubtractEquation, MinEquation, MaxEquation,
	ZeroFactor, OneFactor, SrcColorFactor, OneMinusSrcColorFactor, SrcAlphaFactor, OneMinusSrcAlphaFactor, DstAlphaFactor, OneMinusDstAlphaFactor, DstColorFactor, OneMinusDstColorFactor, SrcAlphaSaturateFactor
} from '../../../../build/three.module.js';

class WebGPURenderPipelines {

	constructor( device, glslang, bindings, sampleCount ) {

		this.device = device;
		this.glslang = glslang;
		this.bindings = bindings;
		this.sampleCount = sampleCount;

		this.pipelines = new WeakMap();
		this.shaderInfos = new WeakMap();
		this.shaderModules = {
			vertex: new WeakMap(),
			fragment: new WeakMap()
		};


	}

	get( object ) {

		let pipeline = this.pipelines.get( object );

		if ( pipeline === undefined ) {

			const device = this.device;
			const material = object.material;

			// shader source

			let shader;

			if ( material.isMeshBasicMaterial ) {

				shader = ShaderLib.mesh_basic;

			} else if ( material.isPointsMaterial ) {

				shader = ShaderLib.points_basic;

			} else if ( material.isLineBasicMaterial ) {

				shader = ShaderLib.line_basic;

			} else if ( material.isShaderMaterial ) {

				shader = {
					vertexShader: ShaderLib.shader.vertexShader + material.vertexShader,
					fragmentShader: ShaderLib.shader.fragmentShader + material.fragmentShader
				};

			} else {

				console.error( 'THREE.WebGPURenderer: Unknwon shader type.' );

			}

			// shader modules

			const glslang = this.glslang;

			let moduleVertex = this.shaderModules.vertex.get( shader );

			if ( moduleVertex === undefined ) {

				const byteCodeVertex = glslang.compileGLSL( shader.vertexShader, 'vertex' );

				moduleVertex = {
					module: device.createShaderModule( { code: byteCodeVertex } ),
					entryPoint: 'main'
				};

				this.shaderModules.vertex.set( shader, moduleVertex );

			}

			let moduleFragment = this.shaderModules.fragment.get( shader );

			if ( moduleFragment === undefined ) {

				const byteCodeFragment = glslang.compileGLSL( shader.fragmentShader, 'fragment' );

				moduleFragment = {
					module: device.createShaderModule( { code: byteCodeFragment } ),
					entryPoint: 'main'
				};

				this.shaderModules.fragment.set( shader, moduleFragment );

			}

			// parse attributes and uniforms in shader codes

			const shaderAttributes = parseAttributes( shader.vertexShader );
			const shaderUniforms = parseUniforms( shader.vertexShader, shader.fragmentShader );

			// layout

			const bindLayout = this.bindings.get( object, shaderUniforms ).layout;
			const layout = device.createPipelineLayout( { bindGroupLayouts: [ bindLayout ] } );

			// vertex buffers

			const vertexBuffers = [];

			for ( const attribute of shaderAttributes ) {

				vertexBuffers.push( {
					arrayStride: attribute.arrayStride,
					attributes: [ { shaderLocation: attribute.slot, offset: 0, format: attribute.format } ]
				} );

			}

			//

			const geometry = object.geometry;
			let indexFormat;

			if ( object.isLine ) {

				const count = ( geometry.index ) ? geometry.index.count : geometry.attributes.position.count;

				indexFormat = ( count > 65535 ) ? GPUIndexFormat.Uint32 : GPUIndexFormat.Uint16; // define data type for primitive restart value

			}

			//

			let alphaBlend = {};
			let colorBlend = {};

			if ( material.transparent === true && material.blending !== NoBlending ) {

				alphaBlend = this._getAlphaBlend( material );
				colorBlend = this._getColorBlend( material );

			}

			//

			let stencilFront = {};

			if ( material.stencilWrite === true ) {

				stencilFront = {
					compare: this._getStencilCompare( material ),
					failOp: this._getStencilOperation( material.stencilFail ),
					depthFailOp: this._getStencilOperation( material.stencilZFail ),
					passOp: this._getStencilOperation( material.stencilZPass )
				};

			}

			// pipeline

			const primitiveTopology = this._getPrimitiveTopology( object );
			const rasterizationState = this._getRasterizationStateDescriptor( material );
			const colorWriteMask = this._getColorWriteMask( material );
			const depthCompare = this._getDepthCompare( material );

			pipeline = device.createRenderPipeline( {
				layout: layout,
				vertexStage: moduleVertex,
				fragmentStage: moduleFragment,
				primitiveTopology: primitiveTopology,
				rasterizationState: rasterizationState,
				colorStates: [ {
					format: GPUTextureFormat.BRGA8Unorm,
					alphaBlend: alphaBlend,
					colorBlend: colorBlend,
					writeMask: colorWriteMask
				} ],
				depthStencilState: {
					format: GPUTextureFormat.Depth24PlusStencil8,
					depthWriteEnabled: material.depthWrite,
					depthCompare: depthCompare,
					stencilFront: stencilFront,
					stencilBack: {}, // three.js does not provide an API to configure the back function (gl.stencilFuncSeparate() was never used)
					stencilReadMask: material.stencilFuncMask,
					stencilWriteMask: material.stencilWriteMask
				},
				vertexState: {
					indexFormat: indexFormat,
					vertexBuffers: vertexBuffers
				},
				sampleCount: this.sampleCount
			} );

			this.pipelines.set( object, pipeline );
			this.shaderInfos.set( pipeline, {
				attributes: shaderAttributes,
				uniforms: shaderUniforms
			} );

		}

		return pipeline;

	}

	getShaderAttributes( pipeline ) {

		return this.shaderInfos.get( pipeline ).attributes;

	}

	getShaderUniforms( pipeline ) {

		return this.shaderInfos.get( pipeline ).uniforms;

	}

	dispose() {

		this.pipelines = new WeakMap();
		this.shaderInfos = new WeakMap();
		this.shaderModules = {
			vertex: new WeakMap(),
			fragment: new WeakMap()
		};

	}

	_getAlphaBlend( material ) {

		const blending = material.blending;
		const premultipliedAlpha = material.premultipliedAlpha;

		let alphaBlend = undefined;

		switch ( blending ) {

			case NormalBlending:

				if ( premultipliedAlpha === false ) {

					alphaBlend = {
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

					alphaBlend = {
						srcFactor: GPUBlendFactor.OneMinusSrcColor,
						dstFactor: GPUBlendFactor.OneMinusSrcAlpha,
						operation: GPUBlendOperation.Add
					};

				}

				break;

			case MultiplyBlending:
				if ( premultipliedAlpha === true ) {

					alphaBlend = {
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

					alphaBlend = {
						srcFactor: this._getBlendFactor( blendSrcAlpha ),
						dstFactor: this._getBlendFactor( blendDstAlpha ),
						operation: this._getBlendOperation( blendEquationAlpha )
					};

				}

				break;

			default:
				console.error( 'THREE.WebGPURenderer: Blending not supported.', blending );

		}

		return alphaBlend;

	}

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
				blendFactor = GPUBlendFactor.SrcColor;
				break;

			case OneMinusSrcColorFactor:
				blendFactor = GPUBlendFactor.OneMinusSrcColor;
				break;

			case SrcAlphaFactor:
				blendFactor = GPUBlendFactor.SrcAlpha;
				break;

			case OneMinusSrcAlphaFactor:
				blendFactor = GPUBlendFactor.OneMinusSrcAlpha;
				break;

			case DstColorFactor:
				blendFactor = GPUBlendFactor.DstColor;
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
				blendFactor = GPUBlendFactor.BlendColor;
				break;

			case OneMinusBlendColorFactor:
				blendFactor = GPUBlendFactor.OneMinusBlendColor;
				break;


			default:
				console.error( 'THREE.WebGPURenderer: Blend factor not supported.', blend );

		}

		return blendFactor;

	}

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
				console.error( 'THREE.WebGPURenderer: Blend equation not supported.', blendEquation );

		}

		return blendOperation;

	}

	_getColorBlend( material ) {

		const blending = material.blending;
		const premultipliedAlpha = material.premultipliedAlpha;

		const colorBlend = {
			srcFactor: null,
			dstFactor: null,
			operation: null
		};

		switch ( blending ) {

			case NormalBlending:

				colorBlend.srcFactor = ( premultipliedAlpha === true ) ? GPUBlendFactor.One : GPUBlendFactor.SrcAlpha;
				colorBlend.dstFactor = GPUBlendFactor.OneMinusSrcAlpha;
				colorBlend.operation = GPUBlendOperation.Add;
				break;

			case AdditiveBlending:
				colorBlend.srcFactor = ( premultipliedAlpha === true ) ? GPUBlendFactor.One : GPUBlendFactor.SrcAlpha;
				colorBlend.operation = GPUBlendOperation.Add;
				break;

			case SubtractiveBlending:
				colorBlend.srcFactor = GPUBlendFactor.Zero;
				colorBlend.dstFactor = ( premultipliedAlpha === true ) ? GPUBlendFactor.Zero : GPUBlendFactor.OneMinusSrcColor;
				colorBlend.operation = GPUBlendOperation.Add;
				break;

			case MultiplyBlending:
				colorBlend.srcFactor = GPUBlendFactor.Zero;
				colorBlend.dstFactor = GPUBlendFactor.SrcColor;
				colorBlend.operation = GPUBlendOperation.Add;
				break;

			case CustomBlending:
				colorBlend.srcFactor = this._getBlendFactor( material.blendSrc );
				colorBlend.dstFactor = this._getBlendFactor( material.blendDst );
				colorBlend.operation = this._getBlendOperation( material.blendEquation );
				break;

			default:
				console.error( 'THREE.WebGPURenderer: Blending not supported.', blending );

		}

		return colorBlend;

	}

	_getColorWriteMask( material ) {

		return ( material.colorWrite === true ) ? GPUColorWriteFlags.All : GPUColorWriteFlags.None;

	}

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
					console.error( 'THREE.WebGPURenderer: Invalid depth function.', depthFunc );

			}

		}

		return depthCompare;

	}

	_getPrimitiveTopology( object ) {

		if ( object.isMesh ) return GPUPrimitiveTopology.TriangleList;
		else if ( object.isPoints ) return GPUPrimitiveTopology.PointList;
		else if ( object.isLine ) return GPUPrimitiveTopology.LineStrip;
		else if ( object.isLineSegments ) return GPUPrimitiveTopology.LineList;

	}

	_getRasterizationStateDescriptor( material ) {

		const descriptor = {};

		switch ( material.side ) {

			case FrontSide:
				descriptor.frontFace = GPUFrontFace.CCW;
				descriptor.cullMode = GPUCullMode.Back;
				break;

			case BackSide:
				descriptor.frontFace = GPUFrontFace.CW;
				descriptor.cullMode = GPUCullMode.Back;
				break;

			case DoubleSide:
				descriptor.frontFace = GPUFrontFace.CCW;
				descriptor.cullMode = GPUCullMode.None;
				break;

			default:
				console.error( 'THREE.WebGPURenderer: Unknown Material.side value.', material.side );
				break;

		}

		return descriptor;

	}

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

}

// GLSL specific codes. We may switch to WGSL at some point.

const ShaderLib = {
	mesh_basic: {
		vertexShader: `#version 450

		layout(location = 0) in vec3 position;
		layout(location = 1) in vec2 uv;

		layout(location = 0) out vec2 vUv;

		layout(set = 0, binding = 0) uniform ModelUniforms {
			mat4 modelMatrix;
			mat4 modelViewMatrix;
		} modelUniforms;

		layout(set = 0, binding = 1) uniform CameraUniforms {
			mat4 projectionMatrix;
			mat4 viewMatrix;
		} cameraUniforms;

		void main(){
			vUv = uv;
			gl_Position = cameraUniforms.projectionMatrix * modelUniforms.modelViewMatrix * vec4( position, 1.0 );
		}`,
		fragmentShader: `#version 450
		layout(set = 0, binding = 2) uniform OpacityUniforms {
			float opacity;
		} opacityUniforms;

		layout(set = 0, binding = 3) uniform sampler mySampler;
		layout(set = 0, binding = 4) uniform texture2D myTexture;

		layout(location = 0) in vec2 vUv;
		layout(location = 0) out vec4 outColor;

		void main() {
			outColor = texture( sampler2D( myTexture, mySampler ), vUv );
			outColor.a *= opacityUniforms.opacity;
		}`
	},
	points_basic: {
		vertexShader: `#version 450

		layout(location = 0) in vec3 position;

		layout(set = 0, binding = 0) uniform ModelUniforms {
			mat4 modelMatrix;
			mat4 modelViewMatrix;
		} modelUniforms;

		layout(set = 0, binding = 1) uniform CameraUniforms {
			mat4 projectionMatrix;
			mat4 viewMatrix;
		} cameraUniforms;

		void main(){
			gl_Position = cameraUniforms.projectionMatrix * modelUniforms.modelViewMatrix * vec4( position, 1.0 );
		}`,
		fragmentShader: `#version 450

		layout(location = 0) out vec4 outColor;

		void main() {
			outColor = vec4( 1.0, 0.0, 0.0, 1.0 );
		}`
	},
	line_basic: {
		vertexShader: `#version 450

		layout(location = 0) in vec3 position;

		layout(set = 0, binding = 0) uniform ModelUniforms {
			mat4 modelMatrix;
			mat4 modelViewMatrix;
		} modelUniforms;

		layout(set = 0, binding = 1) uniform CameraUniforms {
			mat4 projectionMatrix;
			mat4 viewMatrix;
		} cameraUniforms;

		void main(){
			gl_Position = cameraUniforms.projectionMatrix * modelUniforms.modelViewMatrix * vec4( position, 1.0 );
		}`,
		fragmentShader: `#version 450

		layout(location = 0) out vec4 outColor;

		void main() {
			outColor = vec4( 1.0, 0.0, 0.0, 1.0 );
		}`
	},
	// Shader headers for ShaderMaterial
	shader: {
		vertexShader: `#version 450

		layout(location = 0) in vec3 position;
		layout(location = 1) in vec2 uv;

		layout(location = 0) out vec2 vUv;

		layout(set = 0, binding = 0) uniform ModelUniforms {
			mat4 modelMatrix;
			mat4 modelViewMatrix;
		} modelUniforms;

		layout(set = 0, binding = 1) uniform CameraUniforms {
			mat4 projectionMatrix;
			mat4 viewMatrix;
		} cameraUniforms;
		`,
		fragmentShader: `#version 450

		layout(location = 0) in vec2 vUv;
		layout(location = 0) out vec4 outColor;
		`
	}
};

function parseAttributes( vertexShader ) {

	// Find "layout (location = num) in type name" in vertex shader
	const regex = /^\s*layout\s*\(\s*location\s*=\s*(?<location>[0-9]+)\s*\)\s*in\s+(?<type>\w+)\s+(?<name>\w+)\s*;/gmi;
	let shaderAttribute = null;

	const attributes = [];

	while ( shaderAttribute = regex.exec( vertexShader ) ) {

		const shaderLocation = parseInt( shaderAttribute.groups.location );
		const arrayStride = getGLSLArrayStride( shaderAttribute.groups.type );
		const vertexFormat = getGLSLVertexFormat( shaderAttribute.groups.type );

		attributes.push( {
			name: shaderAttribute.groups.name,
			arrayStride: arrayStride,
			slot: shaderLocation,
			format: vertexFormat
		} );

	}

	return attributes.sort( function ( a, b ) {

		return a.shaderLocation - b.shaderLocation;

	} );

}

function parseUniforms( vertexShader, fragmentShader ) {

	const uniforms = [
		parseUniformsInternal( vertexShader, true ),
		parseUniformsInternal( fragmentShader, false )
	].flat().sort( function ( a, b ) {

		return a.binding - b.binding;

	} );

	// Find uniforms existing in both vertex and fragment
	let writeIndex = 0;
	for ( let readIndex = 0; readIndex < uniforms.length; readIndex ++ ) {

		const uniform1 = uniforms[ readIndex ];
		const uniform2 = uniforms[ readIndex + 1 ];

		if ( uniform2 && uniform1.binding === uniform2.binding ) {

			uniform1.visibility = 'vertex|fragment';
			readIndex ++;

		}

		uniforms[ writeIndex ++ ] = uniform1;

	}
	uniforms.length = writeIndex;

	return uniforms;

}

function parseUniformsInternal( shader, isVertexShader ) {

	// Find "layout (set = setNum, binding = bindingNum) uniform type name;"
	const regex = /^\s*layout\s*\(\s*set\s*=\s*(?<set>[0-9]+)\s*,\s*binding\s*=\s*(?<binding>[0-9]+)\s*\)\s*uniform\s+(?<type>\w+)\s+(?<name>\w+)\s*;/gmi;
	// Find "layout (set = setNum, binding = bindingNum) uniform type {
	//   entries
	// };
	const blockRegex = /^\s*layout\s*\(\s*set\s*=\s*(?<set>[0-9]+)\s*,\s*binding\s*=\s*(?<binding>[0-9]+)\s*\)\s*uniform\s+(?<type>\w+)\s*\{(?<entries>[^}]*)\}\s*(?<name>\w+)\s*;/gmi;
	// Find "type name;"
	const entryRegex = /^\s*(?<type>\w+)\s+(?<name>\w+)\s*;/gmi;

	const visibility = isVertexShader ? 'vertex' : 'fragment';
	const uniforms = [];
	let shaderUniform = null;

	while ( shaderUniform = regex.exec( shader ) ) {

		const binding = parseInt( shaderUniform.groups.binding );
		const type = shaderUniform.groups.type;
		const name = shaderUniform.groups.name;

		let groupType;

		switch ( type ) {
			case 'sampler':
				groupType = 'sampler';
				break;
			case 'texture2D':
				groupType = 'sampled-texture';
				break;
			default:
				console.error( 'WebGPURenderer: Unknown uniform type in shader ' + type );
				break;
		}

		uniforms.push( {
			binding: binding,
			type: type,
			name: name,
			groupType: groupType,
			visibility: visibility
		} );

	}

	while ( shaderUniform = blockRegex.exec( shader ) ) {

		const binding = parseInt( shaderUniform.groups.binding );
		const type = shaderUniform.groups.type;
		const name = shaderUniform.groups.name;
		const shaderEntries = shaderUniform.groups.entries;

		const entries = [];

		while ( shaderUniform = entryRegex.exec( shaderEntries ) ) {

			entries.push( {
				type: shaderUniform.groups.type,
				name: shaderUniform.groups.name
			} );

		}

		uniforms.push( {
			binding: binding,
			type: type,
			name: name,
			entries: entries,
			groupType: 'uniform-buffer',
			visibility: visibility
		} );

	}

	return uniforms;

}

function getGLSLArrayStride( type ) {

	if ( type === 'float' ) return 4;
	if ( type === 'vec2' ) return 8;
	if ( type === 'vec3' ) return 12;
	if ( type === 'vec4' ) return 16;

	if ( type === 'int' ) return 4;
	if ( type === 'ivec2' ) return 8;
	if ( type === 'ivec3' ) return 12;
	if ( type === 'ivec4' ) return 16;

	if ( type === 'uint' ) return 4;
	if ( type === 'uvec2' ) return 8;
	if ( type === 'uvec3' ) return 12;
	if ( type === 'uvec4' ) return 16;

	console.error( 'THREE.WebGPURenderer: no this shader variable type support yet.', type );

}

function getGLSLVertexFormat( type ) {

	if ( type === 'float' ) return GPUVertexFormat.Float;
	if ( type === 'vec2' ) return GPUVertexFormat.Float2;
	if ( type === 'vec3' ) return GPUVertexFormat.Float3;
	if ( type === 'vec4' ) return GPUVertexFormat.Float4;

	if ( type === 'int' ) return GPUVertexFormat.Int;
	if ( type === 'ivec2' ) return GPUVertexFormat.Int2;
	if ( type === 'ivec3' ) return GPUVertexFormat.Int3;
	if ( type === 'ivec4' ) return GPUVertexFormat.Int4;

	if ( type === 'uint' ) return GPUVertexFormat.UInt;
	if ( type === 'uvec2' ) return GPUVertexFormat.UInt2;
	if ( type === 'uvec3' ) return GPUVertexFormat.UInt3;
	if ( type === 'uvec4' ) return GPUVertexFormat.UInt4;

	console.error( 'THREE.WebGPURenderer: no this shader variable type support yet.', type );

}

export default WebGPURenderPipelines;
