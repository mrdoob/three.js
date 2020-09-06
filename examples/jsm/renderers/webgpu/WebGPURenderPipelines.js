import { GPUPrimitiveTopology, GPUIndexFormat, GPUTextureFormat, GPUCompareFunction, GPUFrontFace, GPUCullMode, GPUVertexFormat, GPUBlendFactor, GPUBlendOperation } from './constants.js';
import { FrontSide, BackSide, DoubleSide } from '../../../../build/three.module.js';

class WebGPURenderPipelines {

	constructor( device, glslang, bindings ) {

		this.device = device;
		this.glslang = glslang;
		this.bindings = bindings;

		this.pipelines = new WeakMap();
		this.shaderAttributes = new WeakMap();
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

			} else {

				console.error( 'WebGPURenderer: Unknwon shader type' );

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

			// layout

			const bindLayout = this.bindings.get( object ).layout;
			const layout = device.createPipelineLayout( { bindGroupLayouts: [ bindLayout ] } );

			// vertex buffers

			const vertexBuffers = [];
			const shaderAttributes = [];

			// Find "layout (location = num) in type name" in vertex shader
			const regex = /^\s*layout\s*\(\s*location\s*=\s*(?<location>[0-9]+)\s*\)\s*in\s+(?<type>\w+)\s+(?<name>\w+)\s*;/gmi;
			let shaderAttribute = null;

			while ( shaderAttribute = regex.exec( shader.vertexShader ) ) {

				const shaderLocation = parseInt( shaderAttribute.groups.location );
				const arrayStride = this._getArrayStride( shaderAttribute.groups.type );
				const vertexFormat = this._getVertexFormat( shaderAttribute.groups.type );

				shaderAttributes.push( { name: shaderAttribute.groups.name, slot: shaderLocation } );

				vertexBuffers.push( {
					arrayStride: arrayStride,
					attributes: [ { shaderLocation: shaderLocation, offset: 0, format: vertexFormat } ]
				} );

			}

			const geometry = object.geometry;
			let indexFormat;

			if ( object.isLine ) {

				const count = ( geometry.index ) ? geometry.index.count : geometry.attributes.position.count;

				indexFormat = ( count > 65535 ) ? GPUIndexFormat.Uint32 : GPUIndexFormat.Uint16; // define data type the primitive restart value

			}

			let colorBlend;

			if ( material.transparent ) {

				// @TODO: Should be customizable with material.blend* properties.

				colorBlend = {
					srcFactor: GPUBlendFactor.SrcAlpha,
					dstFactor: GPUBlendFactor.OneMinusSrcAlpha,
					operation: GPUBlendOperation.Add
				};

			}

			// pipeline

			const primitiveTopology = this._getPrimitiveTopology( object );
			const rasterizationState = this._getRasterizationStateDescriptor( object );

			pipeline = device.createRenderPipeline( {
				layout: layout,
				vertexStage: moduleVertex,
				fragmentStage: moduleFragment,
				primitiveTopology: primitiveTopology,
				rasterizationState: rasterizationState,
				colorStates: [ {
					format: GPUTextureFormat.BRGA8Unorm,
					colorBlend: colorBlend
				} ],
				depthStencilState: {
					depthWriteEnabled: material.depthWrite,
					depthCompare: GPUCompareFunction.Less,
					format: GPUTextureFormat.Depth24PlusStencil8,
				},
				vertexState: {
					indexFormat: indexFormat,
					vertexBuffers: vertexBuffers
				}
			} );

			this.pipelines.set( object, pipeline );
			this.shaderAttributes.set( pipeline, shaderAttributes );


		}

		return pipeline;

	}

	getShaderAttributes( pipeline ) {

		return this.shaderAttributes.get( pipeline );

	}

	dispose() {

		this.pipelines = new WeakMap();
		this.shaderAttributes = new WeakMap();
		this.shaderModules = {
			vertex: new WeakMap(),
			fragment: new WeakMap()
		};

	}

	_getArrayStride( type ) {

		// This code is GLSL specific. We need to update when we switch to WGSL.

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

		console.error( 'WebGPURenderer: no this shader variable type support yet.', type );

	}

	_getPrimitiveTopology( object ) {

		if ( object.isMesh ) return GPUPrimitiveTopology.TriangleList;
		else if ( object.isPoints ) return GPUPrimitiveTopology.PointList;
		else if ( object.isLine ) return GPUPrimitiveTopology.LineStrip;
		else if ( object.isLineSegments ) return GPUPrimitiveTopology.LineList;

	}

	_getRasterizationStateDescriptor( object ) {

		const descriptor = {};
		const material = object.material;

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
				console.warn( 'WebGPURenderer: Unknown material.side value.', material.side );
				break;

		}

		return descriptor;

	}

	_getVertexFormat( type ) {

		// This code is GLSL specific. We need to update when we switch to WGSL.

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

		console.error( 'WebGPURenderer: no this shader variable type support yet.', type );

	}

}

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
	}
};

export default WebGPURenderPipelines;
