/*// debugger tools
import 'https://greggman.github.io/webgpu-avoid-redundant-state-setting/webgpu-check-redundant-state-setting.js';
//*/

import { GPUFeatureName, GPUTextureFormat, GPULoadOp, GPUStoreOp, GPUIndexFormat, GPUTextureViewDimension } from './utils/WebGPUConstants.js';

import WGSLNodeBuilder from './nodes/WGSLNodeBuilder.js';
import Backend from '../common/Backend.js';

import { DepthTexture, DepthFormat, DepthStencilFormat, UnsignedInt248Type, UnsignedIntType, WebGPUCoordinateSystem } from 'three';

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

		this.defaultDepthTexture = new DepthTexture();
		this.defaultDepthTexture.name = 'depthBuffer';

		this.utils = new WebGPUUtils( this );
		this.attributeUtils = new WebGPUAttributeUtils( this );
		this.bindingUtils = new WebGPUBindingUtils( this );
		this.pipelineUtils = new WebGPUPipelineUtils( this );
		this.textureUtils = new WebGPUTextureUtils( this );
		this.occludedResolveCache = new Map();

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

	async getArrayBufferAsync( attribute ) {

		return await this.attributeUtils.getArrayBufferAsync( attribute );

	}

	beginRender( renderContext ) {

		const renderContextData = this.get( renderContext );

		const device = this.device;
		const occlusionQueryCount = renderContext.occlusionQueryCount;

		let occlusionQuerySet;

		if ( occlusionQueryCount > 0 ) {

			if ( renderContextData.currentOcclusionQuerySet ) renderContextData.currentOcclusionQuerySet.destroy();
			if ( renderContextData.currentOcclusionQueryBuffer ) renderContextData.currentOcclusionQueryBuffer.destroy();

			// Get a reference to the array of objects with queries. The renderContextData property
			// can be changed by another render pass before the buffer.mapAsyc() completes.
			renderContextData.currentOcclusionQuerySet = renderContextData.occlusionQuerySet;
			renderContextData.currentOcclusionQueryBuffer = renderContextData.occlusionQueryBuffer;
			renderContextData.currentOcclusionQueryObjects = renderContextData.occlusionQueryObjects;

			//

			occlusionQuerySet = device.createQuerySet( { type: 'occlusion', count: occlusionQueryCount } );

			renderContextData.occlusionQuerySet = occlusionQuerySet;
			renderContextData.occlusionQueryIndex = 0;
			renderContextData.occlusionQueryObjects = new Array( occlusionQueryCount );

			renderContextData.lastOcclusionObject = null;

		}

		const descriptor = {
			colorAttachments: [ {
				view: null
			} ],
			depthStencilAttachment: {
				view: null
			},
			occlusionQuerySet
		};

		const colorAttachment = descriptor.colorAttachments[ 0 ];
		const depthStencilAttachment = descriptor.depthStencilAttachment;

		const antialias = this.parameters.antialias;

		if ( renderContext.textures !== null ) {

			const textures = renderContext.textures;

			descriptor.colorAttachments = [];

			const colorAttachments = descriptor.colorAttachments;

			for ( let i = 0; i < textures.length; i ++ ) {

				const textureData = this.get( textures[ i ] );

				const textureView = textureData.texture.createView( {
					baseMipLevel: 0,
					mipLevelCount: 1,
					baseArrayLayer: renderContext.activeCubeFace,
					dimension: GPUTextureViewDimension.TwoD
				} );

				let view, resolveTarget;

				if ( textureData.msaaTexture !== undefined ) {

					view = textureData.msaaTexture.createView();
					resolveTarget = textureView;

				} else {

					view = textureView;
					resolveTarget = undefined;

				}

				colorAttachments.push( {
					view,
					resolveTarget,
					loadOp: GPULoadOp.Load,
					storeOp: GPUStoreOp.Store

				} );

			}

			const depthTextureData = this.get( renderContext.depthTexture );

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

			depthStencilAttachment.view = this._getDepthBufferGPU( renderContext ).createView();

		}

		if ( renderContext.textures !== null ) {

			const colorAttachments = descriptor.colorAttachments;

			for ( let i = 0; i < colorAttachments.length; i ++ ) {

				const colorAttachment = colorAttachments[ i ];

				if ( renderContext.clearColor ) {

					colorAttachment.clearValue = renderContext.clearColorValue;
					colorAttachment.loadOp = GPULoadOp.Clear;
					colorAttachment.storeOp = GPUStoreOp.Store;

				} else {

					colorAttachment.loadOp = GPULoadOp.Load;
					colorAttachment.storeOp = GPUStoreOp.Store;

				}

			}


		} else {

			if ( renderContext.clearColor ) {

				colorAttachment.clearValue = renderContext.clearColorValue;
				colorAttachment.loadOp = GPULoadOp.Clear;
				colorAttachment.storeOp = GPUStoreOp.Store;

			} else {

				colorAttachment.loadOp = GPULoadOp.Load;
				colorAttachment.storeOp = GPUStoreOp.Store;

			}

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
		renderContextData.currentSets = { attributes: {} };

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
		const occlusionQueryCount = renderContext.occlusionQueryCount;

		if ( occlusionQueryCount > renderContextData.occlusionQueryIndex ) {

			renderContextData.currentPass.endOcclusionQuery();

		}

		renderContextData.currentPass.end();

		if ( occlusionQueryCount > 0 ) {

			const bufferSize = occlusionQueryCount * 8; // 8 byte entries for query results

			//

			let queryResolveBuffer = this.occludedResolveCache.get( bufferSize );

			if ( queryResolveBuffer === undefined ) {

				queryResolveBuffer = this.device.createBuffer(
					{
						size: bufferSize,
						usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC
					}
				);

				this.occludedResolveCache.set( bufferSize, queryResolveBuffer );

			}

			//

			const readBuffer = this.device.createBuffer(
				{
					size: bufferSize,
					usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
				}
			);

			// two buffers required here - WebGPU doesn't allow usage of QUERY_RESOLVE & MAP_READ to be combined
			renderContextData.encoder.resolveQuerySet( renderContextData.occlusionQuerySet, 0, occlusionQueryCount, queryResolveBuffer, 0 );
			renderContextData.encoder.copyBufferToBuffer( queryResolveBuffer, 0, readBuffer, 0, bufferSize );

			renderContextData.occlusionQueryBuffer = readBuffer;

			//

			this.resolveOccludedAsync( renderContext );

		}

		this.device.queue.submit( [ renderContextData.encoder.finish() ] );

		//

		if ( renderContext.textures !== null ) {

			const textures = renderContext.textures;

			for ( let i = 0; i < textures.length; i ++ ) {

				const texture = textures[ i ];

				if ( texture.generateMipmaps === true ) {

					this.textureUtils.generateMipmaps( texture );

				}

			}

		}

	}

	isOccluded( renderContext, object ) {

		const renderContextData = this.get( renderContext );

		return renderContextData.occluded && renderContextData.occluded.has( object );

	}

	async resolveOccludedAsync( renderContext ) {

		const renderContextData = this.get( renderContext );

		// handle occlusion query results

		const { currentOcclusionQueryBuffer, currentOcclusionQueryObjects } = renderContextData;

		if ( currentOcclusionQueryBuffer && currentOcclusionQueryObjects ) {

			const occluded = new WeakSet();

			renderContextData.currentOcclusionQueryObjects = null;
			renderContextData.currentOcclusionQueryBuffer = null;

			await currentOcclusionQueryBuffer.mapAsync( GPUMapMode.READ );

			const buffer = currentOcclusionQueryBuffer.getMappedRange();
			const results = new BigUint64Array( buffer );

			for ( let i = 0; i < currentOcclusionQueryObjects.length; i++ ) {

				if ( results[ i ] !== 0n ) {

					occluded.add( currentOcclusionQueryObjects[ i ], true );

				}

			}

			currentOcclusionQueryBuffer.destroy();

			renderContextData.occluded = occluded;

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
		const depthStencilAttachment = descriptor.depthStencilAttachment;

		const antialias = this.parameters.antialias;

		// @TODO: Include render target in clear operation.
		if ( antialias === true ) {

			colorAttachment.view = this.colorBuffer.createView();
			colorAttachment.resolveTarget = this.context.getCurrentTexture().createView();

		} else {

			colorAttachment.view = this.context.getCurrentTexture().createView();
			colorAttachment.resolveTarget = undefined;

		}

		descriptor.depthStencilAttachment.view = this._getDepthBufferGPU( renderContext ).createView();

		if ( color ) {

			colorAttachment.loadOp = GPULoadOp.Clear;
			colorAttachment.clearValue = renderContext.clearColorValue;

		} else {

			colorAttachment.loadOp = GPULoadOp.Load;

		}

		if ( depth ) {

			depthStencilAttachment.depthLoadOp = GPULoadOp.Clear;
			depthStencilAttachment.depthClearValue = renderContext.clearDepthValue;

		} else {

			depthStencilAttachment.depthLoadOp = GPULoadOp.Load;

		}

		if ( stencil ) {

			depthStencilAttachment.stencilLoadOp = GPULoadOp.Clear;
			depthStencilAttachment.stencilClearValue = renderContext.clearStencilValue;

		} else {

			depthStencilAttachment.stencilLoadOp = GPULoadOp.Load;

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
		const currentSets = contextData.currentSets;

		// pipeline

		const passEncoderGPU = contextData.currentPass;

		if ( currentSets.pipeline !== pipelineGPU ) {

			passEncoderGPU.setPipeline( pipelineGPU );

			currentSets.pipeline = pipelineGPU;

		}

		// bind group

		const bindGroupGPU = bindingsData.group;
		passEncoderGPU.setBindGroup( 0, bindGroupGPU );

		// attributes

		const index = renderObject.getIndex();

		const hasIndex = ( index !== null );

		// index

		if ( hasIndex === true ) {

			if ( currentSets.index !== index ) {

				const buffer = this.get( index ).buffer;
				const indexFormat = ( index.array instanceof Uint16Array ) ? GPUIndexFormat.Uint16 : GPUIndexFormat.Uint32;

				passEncoderGPU.setIndexBuffer( buffer, indexFormat );

				currentSets.index = index;

			}

		}

		// vertex buffers

		const vertexBuffers = renderObject.getVertexBuffers();

		for ( let i = 0, l = vertexBuffers.length; i < l; i ++ ) {

			const vertexBuffer = vertexBuffers[ i ];

			if ( currentSets.attributes[ i ] !== vertexBuffer ) {

				const buffer = this.get( vertexBuffer ).buffer;
				passEncoderGPU.setVertexBuffer( i, buffer );

				currentSets.attributes[ i ] = vertexBuffer;

			}

		}

		// occlusion queries - handle multiple consecutive draw calls for an object

		if ( contextData.occlusionQuerySet !== undefined  ) {

			const lastObject = contextData.lastOcclusionObject;

			if ( lastObject !== object ) {

				if ( lastObject !== null && lastObject.occlusionTest === true ) {

					passEncoderGPU.endOcclusionQuery();
					contextData.occlusionQueryIndex ++;

				}

				if ( object.occlusionTest === true ) {

					passEncoderGPU.beginOcclusionQuery( contextData.occlusionQueryIndex );
					contextData.occlusionQueryObjects[ contextData.occlusionQueryIndex ] = object;

				}

				contextData.lastOcclusionObject = object;

			}

		}

		// draw

		const drawRange = geometry.drawRange;
		const firstVertex = drawRange.start;

		const instanceCount = this.getInstanceCount( renderObject );
		if ( instanceCount === 0 ) return;

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

	createTexture( texture, options ) {

		this.textureUtils.createTexture( texture, options );

	}

	updateTexture( texture, options ) {

		this.textureUtils.updateTexture( texture, options );

	}

	generateMipmaps( texture ) {

		this.textureUtils.generateMipmaps( texture );

	}

	destroyTexture( texture ) {

		this.textureUtils.destroyTexture( texture );

	}

	copyTextureToBuffer( texture, x, y, width, height ) {

		return this.textureUtils.copyTextureToBuffer( texture, x, y, width, height );

	}

	// node builder

	createNodeBuilder( object, renderer, scene = null ) {

		return new WGSLNodeBuilder( object, renderer, scene );

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

	createComputePipeline( computePipeline, bindings ) {

		this.pipelineUtils.createComputePipeline( computePipeline, bindings );

	}

	// bindings

	createBindings( bindings ) {

		this.bindingUtils.createBindings( bindings );

	}

	updateBindings( bindings ) {

		this.bindingUtils.createBindings( bindings );

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

	copyFramebufferToTexture( texture, renderContext ) {

		const renderContextData = this.get( renderContext );

		const { encoder, descriptor } = renderContextData;

		let sourceGPU = null;

		if ( texture.isFramebufferTexture ) {

			sourceGPU = this.context.getCurrentTexture();

		} else if ( texture.isDepthTexture ) {

			sourceGPU = this._getDepthBufferGPU( renderContext );

		}

		const destinationGPU = this.get( texture ).texture;

		renderContextData.currentPass.end();

		encoder.copyTextureToTexture(
			{
				texture: sourceGPU,
				origin: { x: 0, y: 0, z: 0 }
			},
			{
				texture: destinationGPU
			},
			[
				texture.image.width,
				texture.image.height
			]
		);

		if ( texture.generateMipmaps ) this.textureUtils.generateMipmaps( texture );

		descriptor.colorAttachments[ 0 ].loadOp = GPULoadOp.Load;
		if ( renderContext.depth ) descriptor.depthStencilAttachment.depthLoadOp = GPULoadOp.Load;
		if ( renderContext.stencil ) descriptor.depthStencilAttachment.stencilLoadOp = GPULoadOp.Load;

		renderContextData.currentPass = encoder.beginRenderPass( descriptor );
		renderContextData.currentSets = { attributes: {} };

	}

	// utils

	_getDepthBufferGPU( renderContext ) {

		const { width, height } = this.getDrawingBufferSize();

		const depthTexture = this.defaultDepthTexture;
		const depthTextureGPU = this.get( depthTexture ).texture;

		let format, type;

		if ( renderContext.stencil ) {

			format = DepthStencilFormat;
			type = UnsignedInt248Type;

		} else if ( renderContext.depth ) {

			format = DepthFormat;
			type = UnsignedIntType;

		}

		if ( depthTextureGPU !== undefined ) {

			if ( depthTexture.image.width === width && depthTexture.image.height === height && depthTexture.format === format && depthTexture.type === type ) {

				return depthTextureGPU;

			}

			this.textureUtils.destroyTexture( depthTexture );

		}

		depthTexture.name = 'depthBuffer';
		depthTexture.format = format;
		depthTexture.type = type;
		depthTexture.image.width = width;
		depthTexture.image.height = height;

		this.textureUtils.createTexture( depthTexture, { sampleCount: this.parameters.sampleCount, width, height } );

		return this.get( depthTexture ).texture;

	}

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

}

export default WebGPUBackend;
