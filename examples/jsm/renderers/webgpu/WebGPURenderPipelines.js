import { GPUPrimitiveTopology, GPUIndexFormat, GPUTextureFormat, GPUCompareFunction, GPUFrontFace, GPUCullMode, GPUVertexFormat } from './constants.js';
import { FrontSide, BackSide, DoubleSide } from '../../../../build/three.module.js';

class WebGPURenderPipelines {

	constructor( device, glslang, bindings ) {

		this.device = device;
		this.glslang = glslang;
		this.bindings = bindings;

		this.pipelines = new WeakMap();
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

			const geometry = object.geometry;

			const attributes = geometry.attributes;
			const vertexBuffers = [];

			let shaderLocation = 0;

			for ( const name in attributes ) {

				const attribute = attributes[ name ];

				const arrayStride = this._getArrayStride( attribute );
				const vertexFormat = this._getVertexFormat( attribute );

				vertexBuffers.push( {
					arrayStride: arrayStride,
					attributes: [ { shaderLocation: shaderLocation, offset: 0, format: vertexFormat } ]
				} );

				shaderLocation ++;

			}

			let indexFormat;

			if ( object.isLine ) {

				const count = ( geometry.index ) ? geometry.index.count : geometry.attributes.position.count;

				indexFormat = ( count > 65535 ) ? GPUIndexFormat.Uint32 : GPUIndexFormat.Uint16; // define data type the primitive restart value

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
				colorStates: [ { format: GPUTextureFormat.BRGA8Unorm } ],
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

		}

		return pipeline;

	}

	dispose() {

		this.pipelines = new WeakMap();
		this.shaderModules = {
			vertex: new WeakMap(),
			fragment: new WeakMap()
		};

	}

	_getArrayStride( attribute ) {

		const array = attribute.array;

		if ( array instanceof Float32Array || array instanceof Uint32Array || array instanceof Int32Array ) {

			return attribute.itemSize * 4;

		}

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

	_getVertexFormat( attribute ) {

		const array = attribute.array;

		if ( array instanceof Float32Array ) {

			if ( attribute.itemSize === 1 ) return GPUVertexFormat.Float;
			if ( attribute.itemSize === 2 ) return GPUVertexFormat.Float2;
			if ( attribute.itemSize === 3 ) return GPUVertexFormat.Float3;
			if ( attribute.itemSize === 4 ) return GPUVertexFormat.Float4;

		} else if ( array instanceof Uint32Array ) {

			if ( attribute.itemSize === 1 ) return GPUVertexFormat.Uint;
			if ( attribute.itemSize === 2 ) return GPUVertexFormat.Uint2;
			if ( attribute.itemSize === 3 ) return GPUVertexFormat.Uint3;
			if ( attribute.itemSize === 4 ) return GPUVertexFormat.Uint4;

		} else if ( array instanceof Int32Array ) {

			if ( attribute.itemSize === 1 ) return GPUVertexFormat.Int;
			if ( attribute.itemSize === 2 ) return GPUVertexFormat.Int2;
			if ( attribute.itemSize === 3 ) return GPUVertexFormat.Int3;
			if ( attribute.itemSize === 4 ) return GPUVertexFormat.Int4;

		}

	}

}

const ShaderLib = {
	mesh_basic: {
		vertexShader: `#version 450

		layout(location = 0) in vec3 position;
		layout(location = 1) in vec3 normal;
		layout(location = 2) in vec2 uv;

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
		layout(set = 0, binding = 2) uniform sampler mySampler;
		layout(set = 0, binding = 3) uniform texture2D myTexture;

		layout(location = 0) in vec2 vUv;
		layout(location = 0) out vec4 outColor;

		void main() {
			outColor = texture( sampler2D( myTexture, mySampler ), vUv );
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
