/*// debugger tools
import 'https://greggman.github.io/webgpu-avoid-redundant-state-setting/webgpu-check-redundant-state-setting.js';
//*/

import { GPUFeatureName, GPUTextureFormat, GPULoadOp, GPUStoreOp, GPUIndexFormat, GPUTextureViewDimension } from './utils/WebGPUConstants.js';

import WebGPUNodeBuilder from './nodes/WGSLNodeBuilder.js';
import Backend from '../common/Backend.js';

import { DepthFormat, WebGPUCoordinateSystem } from 'three';

import WebGPUUtils from './utils/WebGPUUtils.js';
import WebGPUAttributeUtils from './utils/WebGPUAttributeUtils.js';
import WebGPUBindingUtils from './utils/WebGPUBindingUtils.js';
import WebGPUPipelineUtils from './utils/WebGPUPipelineUtils.js';
import WebGPUTextureUtils from './utils/WebGPUTextureUtils.js';

// statics

let _staticAdapter = null;

if ( navigator.gpu !== undefined ) {

	_staticAdapter = await navigator.gpu.requestAdapter();

}

//

class WebGPUBackend extends Backend {

	constructor( parameters = {} ) {

		super( parameters );

		// some parameters require default values other than "undefined"

		this.parameters.antialias = ( parameters.antialias === true );

		if ( this.parameters.antialias === true ) {

			this.parameters.sampleCount = ( parameters.sampleCount === undefined ) ? 4 : parameters.sampleCount;

		} else {

			this.parameters.sampleCount = 1;

		}

		this.parameters.requiredLimits = ( parameters.requiredLimits === undefined ) ? {} : parameters.requiredLimits;

		this.adapter = null;
		this.device = null;
		this.context = null;
		this.colorBuffer = null;
		this.depthBuffer = null;

		this.utils = new WebGPUUtils( this );
		this.attributeUtils = new WebGPUAttributeUtils( this );
		this.bindingUtils = new WebGPUBindingUtils( this );
		this.pipelineUtils = new WebGPUPipelineUtils( this );
		this.textureUtils = new WebGPUTextureUtils( this );

	}

	async init( renderer ) {

		await super.init( renderer );

		//

		const parameters = this.parameters;

		const adapterOptions = {
			powerPreference: parameters.powerPreference
		};

		const adapter = await navigator.gpu.requestAdapter( adapterOptions );

		if ( adapter === null ) {

			throw new Error( 'WebGPUBackend: Unable to create WebGPU adapter.' );

		}

		// feature support

		const features = Object.values( GPUFeatureName );

		const supportedFeatures = [];

		for ( const name of features ) {

			if ( adapter.features.has( name ) ) {

				supportedFeatures.push( name );

			}

		}

		const deviceDescriptor = {
			requiredFeatures: supportedFeatures,
			requiredLimits: parameters.requiredLimits
		};

		const device = await adapter.requestDevice( deviceDescriptor );

		const context = ( parameters.context !== undefined ) ? parameters.context : renderer.domElement.getContext( 'webgpu' );

		this.adapter = adapter;
		this.device = device;
		this.context = context;

		this.updateSize();

	}

	get coordinateSystem() {

		return WebGPUCoordinateSystem;

	}

	async getArrayBuffer( attribute ) {

		return await this.attributeUtils.getArrayBuffer( attribute );

	}

	beginRender( renderContext ) {

		const renderContextData = this.get( renderContext );

		const device = this.device;

		const descriptor = {
			colorAttachments: [ {
				view: null
			} ],
			depthStencilAttachment: {
				view: null
			}
		};

		const colorAttachment = descriptor.colorAttachments[ 0 ];
		const depthStencilAttachment = descriptor.depthStencilAttachment;

		const antialias = this.parameters.antialias;

		if ( renderContext.texture !== null ) {

			const textureData = this.get( renderContext.texture );
			const depthTextureData = this.get( renderContext.depthTexture );

			// @TODO: Support RenderTarget with antialiasing.

			colorAttachment.view = textureData.texture.createView( {
				baseMipLevel: 0,
				mipLevelCount: 1,
				baseArrayLayer: renderContext.activeCubeFace,
				dimension: GPUTextureViewDimension.TwoD
			} );

			depthStencilAttachment.view = depthTextureData.texture.createView();

			if ( renderContext.stencil && renderContext.depthTexture.format === DepthFormat ) {

				renderContext.stencil = false;

			}

		} else {

			if ( antialias === true ) {

				colorAttachment.view = this.colorBuffer.createView();
				colorAttachment.resolveTarget = this.context.getCurrentTexture().createView();

			} else {

				colorAttachment.view = this.context.getCurrentTexture().createView();
				colorAttachment.resolveTarget = undefined;

			}

			depthStencilAttachment.view = this.depthBuffer.createView();

		}

		if ( renderContext.clearColor ) {

			colorAttachment.clearValue = renderContext.clearColorValue;
			colorAttachment.loadOp = GPULoadOp.Clear;
			colorAttachment.storeOp = GPUStoreOp.Store;

		} else {

			colorAttachment.loadOp = GPULoadOp.Load;
			colorAttachment.storeOp = GPUStoreOp.Store;

		}

		//

		if ( renderContext.depth ) {

			if ( renderContext.clearDepth ) {

				depthStencilAttachment.depthClearValue = renderContext.clearDepthValue;
				depthStencilAttachment.depthLoadOp = GPULoadOp.Clear;
				depthStencilAttachment.depthStoreOp = GPUStoreOp.Store;

			} else {

				depthStencilAttachment.depthLoadOp = GPULoadOp.Load;
				depthStencilAttachment.depthStoreOp = GPUStoreOp.Store;

			}

		}

		if ( renderContext.stencil ) {

			if ( renderContext.clearStencil ) {

				depthStencilAttachment.stencilClearValue = renderContext.clearStencilValue;
				depthStencilAttachment.stencilLoadOp = GPULoadOp.Clear;
				depthStencilAttachment.stencilStoreOp = GPUStoreOp.Store;

			} else {

				depthStencilAttachment.stencilLoadOp = GPULoadOp.Load;
				depthStencilAttachment.stencilStoreOp = GPUStoreOp.Store;

			}

		}

		//

		const encoder = device.createCommandEncoder( { label: 'renderContext_' + renderContext.id } );
		const currentPass = encoder.beginRenderPass( descriptor );

		//

		renderContextData.descriptor = descriptor;
		renderContextData.encoder = encoder;
		renderContextData.currentPass = currentPass;
		renderContextData.currentAttributesSet = {};

		//

		if ( renderContext.viewport ) {

			this.updateViewport( renderContext );

		}

		if ( renderContext.scissor ) {

			const { x, y, width, height } = renderContext.scissorValue;

			currentPass.setScissorRect( x, y, width, height );

		}

	}

	finishRender( renderContext ) {

		const renderContextData = this.get( renderContext );

		renderContextData.currentPass.end();

		this.device.queue.submit( [ renderContextData.encoder.finish() ] );

		//

		if ( renderContext.texture !== null && renderContext.texture.generateMipmaps === true ) {

			this.textureUtils.generateMipmaps( renderContext.texture );

		}

	}

	updateViewport( renderContext ) {

		const { currentPass } = this.get( renderContext );
		const { x, y, width, height, minDepth, maxDepth } = renderContext.viewportValue;

		currentPass.setViewport( x, y, width, height, minDepth, maxDepth );

	}

	clear( renderContext, color, depth, stencil ) {

		const device = this.device;
		const renderContextData = this.get( renderContext );

		const { descriptor } = renderContextData;

		depth = depth && renderContext.depth;
		stencil = stencil && renderContext.stencil;

		const colorAttachment = descriptor.colorAttachments[ 0 ];

		const antialias = this.parameters.antialias;

		// @TODO: Include render target in clear operation.
		if ( antialias === true ) {

			colorAttachment.view = this.colorBuffer.createView();
			colorAttachment.resolveTarget = this.context.getCurrentTexture().createView();

		} else {

			colorAttachment.view = this.context.getCurrentTexture().createView();
			colorAttachment.resolveTarget = undefined;

		}

		descriptor.depthStencilAttachment.view = this.depthBuffer.createView();

		if ( color ) {

			colorAttachment.loadOp = GPULoadOp.Clear;
			colorAttachment.clearValue = renderContext.clearColorValue;

		}

		if ( depth ) {

			descriptor.depthStencilAttachment.depthLoadOp = GPULoadOp.Clear;
			descriptor.depthStencilAttachment.depthClearValue = renderContext.clearDepthValue;

		}

		if ( stencil ) {

			descriptor.depthStencilAttachment.stencilLoadOp = GPULoadOp.Clear;
			descriptor.depthStencilAttachment.stencilClearValue = renderContext.clearStencilValue;

		}

		renderContextData.encoder = device.createCommandEncoder( {} );
		renderContextData.currentPass = renderContextData.encoder.beginRenderPass( descriptor );

		renderContextData.currentPass.end();

		device.queue.submit( [ renderContextData.encoder.finish() ] );

	}

	// compute

	beginCompute( computeGroup ) {

		const groupGPU = this.get( computeGroup );

		groupGPU.cmdEncoderGPU = this.device.createCommandEncoder( {} );
		groupGPU.passEncoderGPU = groupGPU.cmdEncoderGPU.beginComputePass();

	}

	compute( computeGroup, computeNode, bindings, pipeline ) {

		const { passEncoderGPU } = this.get( computeGroup );

		// pipeline

		const pipelineGPU = this.get( pipeline ).pipeline;
		passEncoderGPU.setPipeline( pipelineGPU );

		// bind group

		const bindGroupGPU = this.get( bindings ).group;
		passEncoderGPU.setBindGroup( 0, bindGroupGPU );

		passEncoderGPU.dispatchWorkgroups( computeNode.dispatchCount );

	}

	finishCompute( computeGroup ) {

		const groupData = this.get( computeGroup );

		groupData.passEncoderGPU.end();
		this.device.queue.submit( [ groupData.cmdEncoderGPU.finish() ] );

	}

	// render object

	draw( renderObject, info ) {

		const { object, geometry, context, pipeline } = renderObject;

		const bindingsData = this.get( renderObject.getBindings() );
		const contextData = this.get( context );
		const pipelineGPU = this.get( pipeline ).pipeline;
		const attributesSet = contextData.currentAttributesSet;

		// pipeline

		const passEncoderGPU = contextData.currentPass;
		passEncoderGPU.setPipeline( pipelineGPU );

		// bind group

		const bindGroupGPU = bindingsData.group;
		passEncoderGPU.setBindGroup( 0, bindGroupGPU );

		// attributes

		const index = renderObject.getIndex();

		const hasIndex = ( index !== null );

		// index

		if ( hasIndex === true ) {

			if ( attributesSet.index !== index ) {
			
				const buffer = this.get( index ).buffer;
				const indexFormat = ( index.array instanceof Uint16Array ) ? GPUIndexFormat.Uint16 : GPUIndexFormat.Uint32;

				passEncoderGPU.setIndexBuffer( buffer, indexFormat );

				attributesSet.index = index;

			}

		}

		// vertex buffers

		const attributes = renderObject.getAttributes();

		for ( let i = 0, l = attributes.length; i < l; i ++ ) {

			const attribute = attributes[ i ];

			if ( attributesSet[ i ] !== attribute ) {

				const buffer = this.get( attribute ).buffer;
				passEncoderGPU.setVertexBuffer( i, buffer );

				attributesSet[ i ] = attribute;

			}

		}

		// draw

		const drawRange = geometry.drawRange;
		const firstVertex = drawRange.start;

		const instanceCount = this.getInstanceCount( renderObject );

		if ( hasIndex === true ) {

			const indexCount = ( drawRange.count !== Infinity ) ? drawRange.count : index.count;

			passEncoderGPU.drawIndexed( indexCount, instanceCount, firstVertex, 0, 0 );

			info.update( object, indexCount, instanceCount );

		} else {

			const positionAttribute = geometry.attributes.position;
			const vertexCount = ( drawRange.count !== Infinity ) ? drawRange.count : positionAttribute.count;

			passEncoderGPU.draw( vertexCount, instanceCount, firstVertex, 0 );

			info.update( object, vertexCount, instanceCount );

		}

	}

	// cache key

	needsUpdate( renderObject ) {

		const renderObjectGPU = this.get( renderObject );

		const { object, material } = renderObject;

		const utils = this.utils;

		const sampleCount = utils.getSampleCount( renderObject.context );
		const colorSpace = utils.getCurrentColorSpace( renderObject.context );
		const colorFormat = utils.getCurrentColorFormat( renderObject.context );
		const depthStencilFormat = utils.getCurrentDepthStencilFormat( renderObject.context );
		const primitiveTopology = utils.getPrimitiveTopology( object, material );

		let needsUpdate = false;

		if ( renderObjectGPU.sampleCount !== sampleCount || renderObjectGPU.colorSpace !== colorSpace ||
			renderObjectGPU.colorFormat !== colorFormat || renderObjectGPU.depthStencilFormat !== depthStencilFormat ||
            renderObjectGPU.primitiveTopology !== primitiveTopology ) {

			renderObjectGPU.sampleCount = sampleCount;
			renderObjectGPU.colorSpace = colorSpace;
			renderObjectGPU.colorFormat = colorFormat;
			renderObjectGPU.depthStencilFormat = depthStencilFormat;
			renderObjectGPU.primitiveTopology = primitiveTopology;

			needsUpdate = true;

		}

		return needsUpdate;

	}

	getCacheKey( renderObject ) {

		const { object, material } = renderObject;

		const utils = this.utils;
		const renderContext = renderObject.context;

		return [
			utils.getSampleCount( renderContext ),
			utils.getCurrentColorSpace( renderContext ), utils.getCurrentColorFormat( renderContext ), utils.getCurrentDepthStencilFormat( renderContext ),
			utils.getPrimitiveTopology( object, material )
		].join();

	}

	// textures

	createSampler( texture ) {

		this.textureUtils.createSampler( texture );

	}

	destroySampler( texture ) {

		this.textureUtils.destroySampler( texture );

	}

	createDefaultTexture( texture ) {

		this.textureUtils.createDefaultTexture( texture );

	}

	createTexture( texture ) {

		this.textureUtils.createTexture( texture );

	}

	updateTexture( texture ) {

		this.textureUtils.updateTexture( texture );

	}

	destroyTexture( texture ) {

		this.textureUtils.destroyTexture( texture );

	}

	// node builder

	createNodeBuilder( object, renderer ) {

		return new WebGPUNodeBuilder( object, renderer );

	}

	// program

	createProgram( program ) {

		const programGPU = this.get( program );

		programGPU.module = {
			module: this.device.createShaderModule( { code: program.code, label: program.stage } ),
			entryPoint: 'main'
		};

	}

	destroyProgram( program ) {

		this.delete( program );

	}

	// pipelines

	createRenderPipeline( renderObject ) {

		this.pipelineUtils.createRenderPipeline( renderObject );

	}

	createComputePipeline( computePipeline ) {

		this.pipelineUtils.createComputePipeline( computePipeline );

	}

	// bindings

	createBindings( bindings, pipeline ) {

		this.bindingUtils.createBindings( bindings, pipeline );

	}

	updateBindings( bindings, pipeline ) {

		this.bindingUtils.createBindings( bindings, pipeline );

	}

	updateBinding( binding ) {

		this.bindingUtils.updateBinding( binding );

	}

	// attributes

	createIndexAttribute( attribute ) {

		this.attributeUtils.createAttribute( attribute, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST );

	}

	createAttribute( attribute ) {

		this.attributeUtils.createAttribute( attribute, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST );

	}

	createStorageAttribute( attribute ) {

		this.attributeUtils.createAttribute( attribute, GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST );

	}

	updateAttribute( attribute ) {

		this.attributeUtils.updateAttribute( attribute );

	}

	destroyAttribute( attribute ) {

		this.attributeUtils.destroyAttribute( attribute );

	}

	// canvas

	updateSize() {

		this._configureContext();
		this._setupColorBuffer();
		this._setupDepthBuffer();

	}

	// utils public

	hasFeature( name ) {

		const adapter = this.adapter || _staticAdapter;

		//

		const features = Object.values( GPUFeatureName );

		if ( features.includes( name ) === false ) {

			throw new Error( 'THREE.WebGPURenderer: Unknown WebGPU GPU feature: ' + name );

		}

		//

		return adapter.features.has( name );

	}

	copyFramebufferToTexture( framebufferTexture, renderContext ) {

		const renderContextData = this.get( renderContext );

		const { encoder, descriptor } = renderContextData;

		const sourceGPU = this.context.getCurrentTexture();
		const destinationGPU = this.get( framebufferTexture ).texture;

		renderContextData.currentPass.end();

		encoder.copyTextureToTexture(
			{
			  texture: sourceGPU
			},
			{
			  texture: destinationGPU
			},
			[
				framebufferTexture.image.width,
				framebufferTexture.image.height
			]
		);

		descriptor.colorAttachments[ 0 ].loadOp = GPULoadOp.Load;
		if ( renderContext.depth ) descriptor.depthStencilAttachment.depthLoadOp = GPULoadOp.Load;
		if ( renderContext.stencil ) descriptor.depthStencilAttachment.stencilLoadOp = GPULoadOp.Load;

		renderContextData.currentPass = encoder.beginRenderPass( descriptor );
		renderContextData.currentAttributesSet = {};

	}

	// utils

	_configureContext() {

		this.context.configure( {
			device: this.device,
			format: GPUTextureFormat.BGRA8Unorm,
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
			alphaMode: 'premultiplied'
		} );

	}

	_setupColorBuffer() {

		if ( this.colorBuffer ) this.colorBuffer.destroy();

		const { width, height } = this.getDrawingBufferSize();
		//const format = navigator.gpu.getPreferredCanvasFormat(); // @TODO: Move to WebGPUUtils

		this.colorBuffer = this.device.createTexture( {
			label: 'colorBuffer',
			size: {
				width: width,
				height: height,
				depthOrArrayLayers: 1
			},
			sampleCount: this.parameters.sampleCount,
			format: GPUTextureFormat.BGRA8Unorm,
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
		} );

	}

	_setupDepthBuffer() {

		if ( this.depthBuffer ) this.depthBuffer.destroy();

		const { width, height } = this.getDrawingBufferSize();

		this.depthBuffer = this.device.createTexture( {
			label: 'depthBuffer',
			size: {
				width: width,
				height: height,
				depthOrArrayLayers: 1
			},
			sampleCount: this.parameters.sampleCount,
			format: GPUTextureFormat.Depth24PlusStencil8,
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
		} );

	}

}

export default WebGPUBackend;
