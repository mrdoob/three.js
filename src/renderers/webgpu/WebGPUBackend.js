/*// debugger tools
import 'https://greggman.github.io/webgpu-avoid-redundant-state-setting/webgpu-check-redundant-state-setting.js';
//*/

import { GPUFeatureName, GPULoadOp, GPUStoreOp, GPUIndexFormat, GPUTextureViewDimension } from './utils/WebGPUConstants.js';

import WGSLNodeBuilder from './nodes/WGSLNodeBuilder.js';
import Backend from '../common/Backend.js';

import WebGPUUtils from './utils/WebGPUUtils.js';
import WebGPUAttributeUtils from './utils/WebGPUAttributeUtils.js';
import WebGPUBindingUtils from './utils/WebGPUBindingUtils.js';
import WebGPUPipelineUtils from './utils/WebGPUPipelineUtils.js';
import WebGPUTextureUtils from './utils/WebGPUTextureUtils.js';

import { WebGPUCoordinateSystem } from '../../constants.js';

/**
 * A backend implementation targeting WebGPU.
 *
 * @private
 * @augments Backend
 */
class WebGPUBackend extends Backend {

	/**
	 * Constructs a new WebGPU backend.
	 *
	 * @param {Object} parameters - The configuration parameter.
	 * @param {Boolean} [parameters.logarithmicDepthBuffer=false] - Whether logarithmic depth buffer is enabled or not.
	 * @param {Boolean} [parameters.alpha=true] - Whether the default framebuffer (which represents the final contents of the canvas) should be transparent or opaque.
	 * @param {Boolean} [parameters.depth=true] - Whether the default framebuffer should have a depth buffer or not.
	 * @param {Boolean} [parameters.stencil=false] - Whether the default framebuffer should have a stencil buffer or not.
	 * @param {Boolean} [parameters.antialias=false] - Whether MSAA as the default anti-aliasing should be enabled or not.
	 * @param {Number} [parameters.samples=0] - When `antialias` is `true`, `4` samples are used by default. Set this parameter to any other integer value than 0 to overwrite the default.
	 * @param {Boolean} [parameters.forceWebGL=false] - If set to `true`, the renderer uses a WebGL 2 backend no matter if WebGPU is supported or not.
	 * @param {Boolean} [parameters.trackTimestamp=false] - Whether to track timestamps with a Timestamp Query API or not.
	 * @param {String} [parameters.powerPreference=undefined] - The power preference.
	 * @param {Object} [parameters.requiredLimits=undefined] - Specifies the limits that are required by the device request. The request will fail if the adapter cannot provide these limits.
	 * @param {GPUDevice} [parameters.device=undefined] - If there is an existing GPU device on app level, it can be passed to the renderer as a parameter.
	 */
	constructor( parameters = {} ) {

		super( parameters );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isWebGPUBackend = true;

		// some parameters require default values other than "undefined"
		this.parameters.alpha = ( parameters.alpha === undefined ) ? true : parameters.alpha;

		this.parameters.requiredLimits = ( parameters.requiredLimits === undefined ) ? {} : parameters.requiredLimits;

		/**
		 * Whether to track timestamps with a Timestamp Query API or not.
		 *
		 * @type {Boolean}
		 * @default false
		 */
		this.trackTimestamp = ( parameters.trackTimestamp === true );

		/**
		 * A reference to the device.
		 *
		 * @type {GPUDevice?}
		 * @default null
		 */
		this.device = null;

		/**
		 * A reference to the context.
		 *
		 * @type {GPUCanvasContext?}
		 * @default null
		 */
		this.context = null;

		/**
		 * A reference to the color attachment of the default framebuffer.
		 *
		 * @type {GPUTexture?}
		 * @default null
		 */
		this.colorBuffer = null;

		/**
		 * A reference to the default render pass descriptor.
		 *
		 * @type {Object?}
		 * @default null
		 */
		this.defaultRenderPassdescriptor = null;

		/**
		 * A reference to a backend module holding common utility functions.
		 *
		 * @type {WebGPUUtils}
		 */
		this.utils = new WebGPUUtils( this );

		/**
		 * A reference to a backend module holding shader attribute-related
		 * utility functions.
		 *
		 * @type {WebGPUAttributeUtils}
		 */
		this.attributeUtils = new WebGPUAttributeUtils( this );

		/**
		 * A reference to a backend module holding shader binding-related
		 * utility functions.
		 *
		 * @type {WebGPUBindingUtils}
		 */
		this.bindingUtils = new WebGPUBindingUtils( this );

		/**
		 * A reference to a backend module holding shader pipeline-related
		 * utility functions.
		 *
		 * @type {WebGPUPipelineUtils}
		 */
		this.pipelineUtils = new WebGPUPipelineUtils( this );

		/**
		 * A reference to a backend module holding shader texture-related
		 * utility functions.
		 *
		 * @type {WebGPUTextureUtils}
		 */
		this.textureUtils = new WebGPUTextureUtils( this );

		/**
		 * A map that manages the resolve buffers for occlusion queries.
		 *
		 * @type {Map<Number,GPUBuffer>}
		 */
		this.occludedResolveCache = new Map();

	}

	/**
	 * Initializes the backend so it is ready for usage.
	 *
	 * @async
	 * @param {Renderer} renderer - The renderer.
	 * @return {Promise} A Promise that resolves when the backend has been initialized.
	 */
	async init( renderer ) {

		await super.init( renderer );

		//

		const parameters = this.parameters;

		// create the device if it is not passed with parameters

		let device;

		if ( parameters.device === undefined ) {

			const adapterOptions = {
				powerPreference: parameters.powerPreference
			};

			const adapter = ( typeof navigator !== 'undefined' ) ? await navigator.gpu.requestAdapter( adapterOptions ) : null;

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

			device = await adapter.requestDevice( deviceDescriptor );

		} else {

			device = parameters.device;

		}

		device.lost.then( ( info ) => {

			const deviceLossInfo = {
				api: 'WebGPU',
				message: info.message || 'Unknown reason',
				reason: info.reason || null,
				originalEvent: info
			};

			renderer.onDeviceLost( deviceLossInfo );

		} );

		const context = ( parameters.context !== undefined ) ? parameters.context : renderer.domElement.getContext( 'webgpu' );

		this.device = device;
		this.context = context;

		const alphaMode = parameters.alpha ? 'premultiplied' : 'opaque';

		this.trackTimestamp = this.trackTimestamp && this.hasFeature( GPUFeatureName.TimestampQuery );

		this.context.configure( {
			device: this.device,
			format: this.utils.getPreferredCanvasFormat(),
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
			alphaMode: alphaMode
		} );

		this.updateSize();

	}

	/**
	 * The coordinate system of the backend.
	 *
	 * @type {Number}
	 * @readonly
	 */
	get coordinateSystem() {

		return WebGPUCoordinateSystem;

	}

	/**
	 * This method performs a readback operation by moving buffer data from
	 * a storage buffer attribute from the GPU to the CPU.
	 *
	 * @async
	 * @param {StorageBufferAttribute} attribute - The storage buffer attribute.
	 * @return {Promise<ArrayBuffer>} A promise that resolves with the buffer data when the data are ready.
	 */
	async getArrayBufferAsync( attribute ) {

		return await this.attributeUtils.getArrayBufferAsync( attribute );

	}

	/**
	 * Returns the backend's rendering context.
	 *
	 * @return {GPUCanvasContext} The rendering context.
	 */
	getContext() {

		return this.context;

	}

	/**
	 * Returns the default render pass descriptor.
	 *
	 * In WebGPU, the default framebuffer must be configured
	 * like custom framebuffers so the backend needs a render
	 * pass descriptor even when rendering directly to screen.
	 *
	 * @private
	 * @return {Object} The render pass descriptor.
	 */
	_getDefaultRenderPassDescriptor() {

		let descriptor = this.defaultRenderPassdescriptor;

		if ( descriptor === null ) {

			const renderer = this.renderer;

			descriptor = {
				colorAttachments: [ {
					view: null
				} ],
			};

			if ( this.renderer.depth === true || this.renderer.stencil === true ) {

				descriptor.depthStencilAttachment = {
					view: this.textureUtils.getDepthBuffer( renderer.depth, renderer.stencil ).createView()
				};

			}

			const colorAttachment = descriptor.colorAttachments[ 0 ];

			if ( this.renderer.samples > 0 ) {

				colorAttachment.view = this.colorBuffer.createView();

			} else {

				colorAttachment.resolveTarget = undefined;

			}

			this.defaultRenderPassdescriptor = descriptor;

		}

		const colorAttachment = descriptor.colorAttachments[ 0 ];

		if ( this.renderer.samples > 0 ) {

			colorAttachment.resolveTarget = this.context.getCurrentTexture().createView();

		} else {

			colorAttachment.view = this.context.getCurrentTexture().createView();

		}

		return descriptor;

	}

	/**
	 * Returns the render pass descriptor for the given render context.
	 *
	 * @private
	 * @param {RenderContext} renderContext - The render context.
	 * @param {Object} colorAttachmentsConfig - Configuration object for the color attachments.
	 * @return {Object} The render pass descriptor.
	 */
	_getRenderPassDescriptor( renderContext, colorAttachmentsConfig = {} ) {

		const renderTarget = renderContext.renderTarget;
		const renderTargetData = this.get( renderTarget );

		let descriptors = renderTargetData.descriptors;

		if ( descriptors === undefined ||
			renderTargetData.width !== renderTarget.width ||
			renderTargetData.height !== renderTarget.height ||
			renderTargetData.dimensions !== renderTarget.dimensions ||
			renderTargetData.activeMipmapLevel !== renderTarget.activeMipmapLevel ||
			renderTargetData.activeCubeFace !== renderContext.activeCubeFace ||
			renderTargetData.samples !== renderTarget.samples ||
			renderTargetData.loadOp !== colorAttachmentsConfig.loadOp
		) {

			descriptors = {};

			renderTargetData.descriptors = descriptors;

			// dispose

			const onDispose = () => {

				renderTarget.removeEventListener( 'dispose', onDispose );

				this.delete( renderTarget );

			};

			renderTarget.addEventListener( 'dispose', onDispose );

		}

		const cacheKey = renderContext.getCacheKey();

		let descriptor = descriptors[ cacheKey ];

		if ( descriptor === undefined ) {

			const textures = renderContext.textures;
			const colorAttachments = [];

			let sliceIndex;

			for ( let i = 0; i < textures.length; i ++ ) {

				const textureData = this.get( textures[ i ] );

				const viewDescriptor = {
					label: `colorAttachment_${ i }`,
					baseMipLevel: renderContext.activeMipmapLevel,
					mipLevelCount: 1,
					baseArrayLayer: renderContext.activeCubeFace,
					arrayLayerCount: 1,
					dimension: GPUTextureViewDimension.TwoD
				};

				if ( renderTarget.isRenderTarget3D ) {

					sliceIndex = renderContext.activeCubeFace;

					viewDescriptor.baseArrayLayer = 0;
					viewDescriptor.dimension = GPUTextureViewDimension.ThreeD;
					viewDescriptor.depthOrArrayLayers = textures[ i ].image.depth;

				} else if ( renderTarget.isRenderTargetArray ) {

					viewDescriptor.dimension = GPUTextureViewDimension.TwoDArray;
					viewDescriptor.depthOrArrayLayers = textures[ i ].image.depth;

				}

				const textureView = textureData.texture.createView( viewDescriptor );

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
					depthSlice: sliceIndex,
					resolveTarget,
					loadOp: GPULoadOp.Load,
					storeOp: GPUStoreOp.Store,
					...colorAttachmentsConfig
				} );

			}


			descriptor = {
				colorAttachments,
			};

			if ( renderContext.depth ) {

				const depthTextureData = this.get( renderContext.depthTexture );

				const depthStencilAttachment = {
					view: depthTextureData.texture.createView()
				};
				descriptor.depthStencilAttachment = depthStencilAttachment;

			}

			descriptors[ cacheKey ] = descriptor;

			renderTargetData.width = renderTarget.width;
			renderTargetData.height = renderTarget.height;
			renderTargetData.samples = renderTarget.samples;
			renderTargetData.activeMipmapLevel = renderContext.activeMipmapLevel;
			renderTargetData.activeCubeFace = renderContext.activeCubeFace;
			renderTargetData.dimensions = renderTarget.dimensions;
			renderTargetData.depthSlice = sliceIndex;
			renderTargetData.loadOp = colorAttachments[ 0 ].loadOp;

		}

		return descriptor;

	}

	/**
	 * This method is executed at the beginning of a render call and prepares
	 * the WebGPU state for upcoming render calls
	 *
	 * @param {RenderContext} renderContext - The render context.
	 */
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

			occlusionQuerySet = device.createQuerySet( { type: 'occlusion', count: occlusionQueryCount, label: `occlusionQuerySet_${ renderContext.id }` } );

			renderContextData.occlusionQuerySet = occlusionQuerySet;
			renderContextData.occlusionQueryIndex = 0;
			renderContextData.occlusionQueryObjects = new Array( occlusionQueryCount );

			renderContextData.lastOcclusionObject = null;

		}

		let descriptor;

		if ( renderContext.textures === null ) {

			descriptor = this._getDefaultRenderPassDescriptor();

		} else {

			descriptor = this._getRenderPassDescriptor( renderContext, { loadOp: GPULoadOp.Load } );

		}

		this.initTimestampQuery( renderContext, descriptor );

		descriptor.occlusionQuerySet = occlusionQuerySet;

		const depthStencilAttachment = descriptor.depthStencilAttachment;

		if ( renderContext.textures !== null ) {

			const colorAttachments = descriptor.colorAttachments;

			for ( let i = 0; i < colorAttachments.length; i ++ ) {

				const colorAttachment = colorAttachments[ i ];

				if ( renderContext.clearColor ) {

					colorAttachment.clearValue = i === 0 ? renderContext.clearColorValue : { r: 0, g: 0, b: 0, a: 1 };
					colorAttachment.loadOp = GPULoadOp.Clear;
					colorAttachment.storeOp = GPUStoreOp.Store;

				} else {

					colorAttachment.loadOp = GPULoadOp.Load;
					colorAttachment.storeOp = GPUStoreOp.Store;

				}

			}

		} else {

			const colorAttachment = descriptor.colorAttachments[ 0 ];

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
		renderContextData.currentSets = { attributes: {}, bindingGroups: [], pipeline: null, index: null };
		renderContextData.renderBundles = [];

		//

		if ( renderContext.viewport ) {

			this.updateViewport( renderContext );

		}

		if ( renderContext.scissor ) {

			const { x, y, width, height } = renderContext.scissorValue;

			currentPass.setScissorRect( x, y, width, height );

		}

	}

	/**
	 * This method is executed at the end of a render call and finalizes work
	 * after draw calls.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 */
	finishRender( renderContext ) {

		const renderContextData = this.get( renderContext );
		const occlusionQueryCount = renderContext.occlusionQueryCount;

		if ( renderContextData.renderBundles.length > 0 ) {

			renderContextData.currentPass.executeBundles( renderContextData.renderBundles );

		}

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

		this.prepareTimestampBuffer( renderContext, renderContextData.encoder );

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

	/**
	 * Returns `true` if the given 3D object is fully occluded by other
	 * 3D objects in the scene.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @param {Object3D} object - The 3D object to test.
	 * @return {Boolean} Whether the 3D object is fully occluded or not.
	 */
	isOccluded( renderContext, object ) {

		const renderContextData = this.get( renderContext );

		return renderContextData.occluded && renderContextData.occluded.has( object );

	}

	/**
	 * This method processes the result of occlusion queries and writes it
	 * into render context data.
	 *
	 * @async
	 * @param {RenderContext} renderContext - The render context.
	 */
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

			for ( let i = 0; i < currentOcclusionQueryObjects.length; i ++ ) {

				if ( results[ i ] === BigInt( 0 ) ) {

					occluded.add( currentOcclusionQueryObjects[ i ] );

				}

			}

			currentOcclusionQueryBuffer.destroy();

			renderContextData.occluded = occluded;

		}

	}

	/**
	 * Updates the viewport with the values from the given render context.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 */
	updateViewport( renderContext ) {

		const { currentPass } = this.get( renderContext );
		const { x, y, width, height, minDepth, maxDepth } = renderContext.viewportValue;

		currentPass.setViewport( x, y, width, height, minDepth, maxDepth );

	}

	/**
	 * Performs a clear operation.
	 *
	 * @param {Boolean} color - Whether the color buffer should be cleared or not.
	 * @param {Boolean} depth - Whether the depth buffer should be cleared or not.
	 * @param {Boolean} stencil - Whether the stencil buffer should be cleared or not.
	 * @param {RenderContext?} [renderTargetContext=null] - The render context of the current set render target.
	 */
	clear( color, depth, stencil, renderTargetContext = null ) {

		const device = this.device;
		const renderer = this.renderer;

		let colorAttachments = [];

		let depthStencilAttachment;
		let clearValue;

		let supportsDepth;
		let supportsStencil;

		if ( color ) {

			const clearColor = this.getClearColor();

			if ( this.renderer.alpha === true ) {

				// premultiply alpha

				const a = clearColor.a;

				clearValue = { r: clearColor.r * a, g: clearColor.g * a, b: clearColor.b * a, a: a };

			} else {

				clearValue = { r: clearColor.r, g: clearColor.g, b: clearColor.b, a: clearColor.a };

			}

		}

		if ( renderTargetContext === null ) {

			supportsDepth = renderer.depth;
			supportsStencil = renderer.stencil;

			const descriptor = this._getDefaultRenderPassDescriptor();

			if ( color ) {

				colorAttachments = descriptor.colorAttachments;

				const colorAttachment = colorAttachments[ 0 ];

				colorAttachment.clearValue = clearValue;
				colorAttachment.loadOp = GPULoadOp.Clear;
				colorAttachment.storeOp = GPUStoreOp.Store;

			}

			if ( supportsDepth || supportsStencil ) {

				depthStencilAttachment = descriptor.depthStencilAttachment;

			}

		} else {

			supportsDepth = renderTargetContext.depth;
			supportsStencil = renderTargetContext.stencil;

			if ( color ) {

				const descriptor = this._getRenderPassDescriptor( renderTargetContext, { loadOp: GPULoadOp.Clear } );

				colorAttachments = descriptor.colorAttachments;

			}

			if ( supportsDepth || supportsStencil ) {

				const depthTextureData = this.get( renderTargetContext.depthTexture );

				depthStencilAttachment = {
					view: depthTextureData.texture.createView()
				};

			}

		}

		//

		if ( supportsDepth ) {

			if ( depth ) {

				depthStencilAttachment.depthLoadOp = GPULoadOp.Clear;
				depthStencilAttachment.depthClearValue = renderer.getClearDepth();
				depthStencilAttachment.depthStoreOp = GPUStoreOp.Store;

			} else {

				depthStencilAttachment.depthLoadOp = GPULoadOp.Load;
				depthStencilAttachment.depthStoreOp = GPUStoreOp.Store;

			}

		}

		//

		if ( supportsStencil ) {

			if ( stencil ) {

				depthStencilAttachment.stencilLoadOp = GPULoadOp.Clear;
				depthStencilAttachment.stencilClearValue = renderer.getClearStencil();
				depthStencilAttachment.stencilStoreOp = GPUStoreOp.Store;

			} else {

				depthStencilAttachment.stencilLoadOp = GPULoadOp.Load;
				depthStencilAttachment.stencilStoreOp = GPUStoreOp.Store;

			}

		}

		//

		const encoder = device.createCommandEncoder( { label: 'clear' } );
		const currentPass = encoder.beginRenderPass( {
			colorAttachments,
			depthStencilAttachment
		} );

		currentPass.end();

		device.queue.submit( [ encoder.finish() ] );

	}

	// compute

	/**
	 * This method is executed at the beginning of a compute call and
	 * prepares the state for upcoming compute tasks.
	 *
	 * @param {Node|Array<Node>} computeGroup - The compute node(s).
	 */
	beginCompute( computeGroup ) {

		const groupGPU = this.get( computeGroup );


		const descriptor = {
			label: 'computeGroup_' + computeGroup.id
		};

		this.initTimestampQuery( computeGroup, descriptor );

		groupGPU.cmdEncoderGPU = this.device.createCommandEncoder( { label: 'computeGroup_' + computeGroup.id } );

		groupGPU.passEncoderGPU = groupGPU.cmdEncoderGPU.beginComputePass( descriptor );

	}

	/**
	 * Executes a compute command for the given compute node.
	 *
	 * @param {Node|Array<Node>} computeGroup - The group of compute nodes of a compute call. Can be a single compute node.
	 * @param {Node} computeNode - The compute node.
	 * @param {Array<BindGroup>} bindings - The bindings.
	 * @param {ComputePipeline} pipeline - The compute pipeline.
	 */
	compute( computeGroup, computeNode, bindings, pipeline ) {

		const { passEncoderGPU } = this.get( computeGroup );

		// pipeline

		const pipelineGPU = this.get( pipeline ).pipeline;
		passEncoderGPU.setPipeline( pipelineGPU );

		// bind groups

		for ( let i = 0, l = bindings.length; i < l; i ++ ) {

			const bindGroup = bindings[ i ];
			const bindingsData = this.get( bindGroup );

			passEncoderGPU.setBindGroup( i, bindingsData.group );

		}

		const maxComputeWorkgroupsPerDimension = this.device.limits.maxComputeWorkgroupsPerDimension;

		const computeNodeData = this.get( computeNode );

		if ( computeNodeData.dispatchSize === undefined ) computeNodeData.dispatchSize = { x: 0, y: 1, z: 1 };

		const { dispatchSize } = computeNodeData;

		if ( computeNode.dispatchCount > maxComputeWorkgroupsPerDimension ) {

			dispatchSize.x = Math.min( computeNode.dispatchCount, maxComputeWorkgroupsPerDimension );
			dispatchSize.y = Math.ceil( computeNode.dispatchCount / maxComputeWorkgroupsPerDimension );

		} else {

			dispatchSize.x = computeNode.dispatchCount;

		}

		passEncoderGPU.dispatchWorkgroups(
			dispatchSize.x,
			dispatchSize.y,
			dispatchSize.z
		);

	}

	/**
	 * This method is executed at the end of a compute call and
	 * finalizes work after compute tasks.
	 *
	 * @param {Node|Array<Node>} computeGroup - The compute node(s).
	 */
	finishCompute( computeGroup ) {

		const groupData = this.get( computeGroup );

		groupData.passEncoderGPU.end();

		this.prepareTimestampBuffer( computeGroup, groupData.cmdEncoderGPU );

		this.device.queue.submit( [ groupData.cmdEncoderGPU.finish() ] );

	}

	/**
	 * Can be used to synchronize CPU operations with GPU tasks. So when this method is called,
	 * the CPU waits for the GPU to complete its operation (e.g. a compute task).
	 *
	 * @async
	 * @return {Promise} A Promise that resolves when synchronization has been finished.
	 */
	async waitForGPU() {

		await this.device.queue.onSubmittedWorkDone();

	}

	// render object

	/**
	 * Executes a draw command for the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object to draw.
	 * @param {Info} info - Holds a series of statistical information about the GPU memory and the rendering process.
	 */
	draw( renderObject, info ) {

		const { object, context, pipeline } = renderObject;
		const bindings = renderObject.getBindings();
		const renderContextData = this.get( context );
		const pipelineGPU = this.get( pipeline ).pipeline;
		const currentSets = renderContextData.currentSets;
		const passEncoderGPU = renderContextData.currentPass;

		const drawParams = renderObject.getDrawParameters();

		if ( drawParams === null ) return;

		// pipeline

		if ( currentSets.pipeline !== pipelineGPU ) {

			passEncoderGPU.setPipeline( pipelineGPU );

			currentSets.pipeline = pipelineGPU;

		}

		// bind groups

		const currentBindingGroups = currentSets.bindingGroups;

		for ( let i = 0, l = bindings.length; i < l; i ++ ) {

			const bindGroup = bindings[ i ];
			const bindingsData = this.get( bindGroup );

			if ( currentBindingGroups[ bindGroup.index ] !== bindGroup.id ) {

				passEncoderGPU.setBindGroup( bindGroup.index, bindingsData.group );
				currentBindingGroups[ bindGroup.index ] = bindGroup.id;

			}

		}

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

		if ( renderContextData.occlusionQuerySet !== undefined ) {

			const lastObject = renderContextData.lastOcclusionObject;

			if ( lastObject !== object ) {

				if ( lastObject !== null && lastObject.occlusionTest === true ) {

					passEncoderGPU.endOcclusionQuery();
					renderContextData.occlusionQueryIndex ++;

				}

				if ( object.occlusionTest === true ) {

					passEncoderGPU.beginOcclusionQuery( renderContextData.occlusionQueryIndex );
					renderContextData.occlusionQueryObjects[ renderContextData.occlusionQueryIndex ] = object;

				}

				renderContextData.lastOcclusionObject = object;

			}

		}

		// draw

		if ( object.isBatchedMesh === true ) {

			const starts = object._multiDrawStarts;
			const counts = object._multiDrawCounts;
			const drawCount = object._multiDrawCount;
			const drawInstances = object._multiDrawInstances;

			for ( let i = 0; i < drawCount; i ++ ) {

				const count = drawInstances ? drawInstances[ i ] : 1;
				const firstInstance = count > 1 ? 0 : i;

				if ( hasIndex === true ) {

					passEncoderGPU.drawIndexed( counts[ i ], count, starts[ i ] / index.array.BYTES_PER_ELEMENT, 0, firstInstance );

				} else {

					passEncoderGPU.draw( counts[ i ], count, starts[ i ], firstInstance );

				}

			}

		} else if ( hasIndex === true ) {

			const { vertexCount: indexCount, instanceCount, firstVertex: firstIndex } = drawParams;

			const indirect = renderObject.getIndirect();

			if ( indirect !== null ) {

				const buffer = this.get( indirect ).buffer;

				passEncoderGPU.drawIndexedIndirect( buffer, 0 );

			} else {

				passEncoderGPU.drawIndexed( indexCount, instanceCount, firstIndex, 0, 0 );

			}

			info.update( object, indexCount, instanceCount );

		} else {

			const { vertexCount, instanceCount, firstVertex } = drawParams;

			const indirect = renderObject.getIndirect();

			if ( indirect !== null ) {

				const buffer = this.get( indirect ).buffer;

				passEncoderGPU.drawIndirect( buffer, 0 );

			} else {

				passEncoderGPU.draw( vertexCount, instanceCount, firstVertex, 0 );

			}

			info.update( object, vertexCount, instanceCount );

		}

	}

	// cache key

	/**
	 * Returns `true` if the render pipeline requires an update.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @return {Boolean} Whether the render pipeline requires an update or not.
	 */
	needsRenderUpdate( renderObject ) {

		const data = this.get( renderObject );

		const { object, material } = renderObject;

		const utils = this.utils;

		const sampleCount = utils.getSampleCountRenderContext( renderObject.context );
		const colorSpace = utils.getCurrentColorSpace( renderObject.context );
		const colorFormat = utils.getCurrentColorFormat( renderObject.context );
		const depthStencilFormat = utils.getCurrentDepthStencilFormat( renderObject.context );
		const primitiveTopology = utils.getPrimitiveTopology( object, material );

		let needsUpdate = false;

		if ( data.material !== material || data.materialVersion !== material.version ||
			data.transparent !== material.transparent || data.blending !== material.blending || data.premultipliedAlpha !== material.premultipliedAlpha ||
			data.blendSrc !== material.blendSrc || data.blendDst !== material.blendDst || data.blendEquation !== material.blendEquation ||
			data.blendSrcAlpha !== material.blendSrcAlpha || data.blendDstAlpha !== material.blendDstAlpha || data.blendEquationAlpha !== material.blendEquationAlpha ||
			data.colorWrite !== material.colorWrite || data.depthWrite !== material.depthWrite || data.depthTest !== material.depthTest || data.depthFunc !== material.depthFunc ||
			data.stencilWrite !== material.stencilWrite || data.stencilFunc !== material.stencilFunc ||
			data.stencilFail !== material.stencilFail || data.stencilZFail !== material.stencilZFail || data.stencilZPass !== material.stencilZPass ||
			data.stencilFuncMask !== material.stencilFuncMask || data.stencilWriteMask !== material.stencilWriteMask ||
			data.side !== material.side || data.alphaToCoverage !== material.alphaToCoverage ||
			data.sampleCount !== sampleCount || data.colorSpace !== colorSpace ||
			data.colorFormat !== colorFormat || data.depthStencilFormat !== depthStencilFormat ||
			data.primitiveTopology !== primitiveTopology ||
			data.clippingContextCacheKey !== renderObject.clippingContextCacheKey
		) {

			data.material = material; data.materialVersion = material.version;
			data.transparent = material.transparent; data.blending = material.blending; data.premultipliedAlpha = material.premultipliedAlpha;
			data.blendSrc = material.blendSrc; data.blendDst = material.blendDst; data.blendEquation = material.blendEquation;
			data.blendSrcAlpha = material.blendSrcAlpha; data.blendDstAlpha = material.blendDstAlpha; data.blendEquationAlpha = material.blendEquationAlpha;
			data.colorWrite = material.colorWrite;
			data.depthWrite = material.depthWrite; data.depthTest = material.depthTest; data.depthFunc = material.depthFunc;
			data.stencilWrite = material.stencilWrite; data.stencilFunc = material.stencilFunc;
			data.stencilFail = material.stencilFail; data.stencilZFail = material.stencilZFail; data.stencilZPass = material.stencilZPass;
			data.stencilFuncMask = material.stencilFuncMask; data.stencilWriteMask = material.stencilWriteMask;
			data.side = material.side; data.alphaToCoverage = material.alphaToCoverage;
			data.sampleCount = sampleCount;
			data.colorSpace = colorSpace;
			data.colorFormat = colorFormat;
			data.depthStencilFormat = depthStencilFormat;
			data.primitiveTopology = primitiveTopology;
			data.clippingContextCacheKey = renderObject.clippingContextCacheKey;

			needsUpdate = true;

		}

		return needsUpdate;

	}

	/**
	 * Returns a cache key that is used to identify render pipelines.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @return {String} The cache key.
	 */
	getRenderCacheKey( renderObject ) {

		const { object, material } = renderObject;

		const utils = this.utils;
		const renderContext = renderObject.context;

		return [
			material.transparent, material.blending, material.premultipliedAlpha,
			material.blendSrc, material.blendDst, material.blendEquation,
			material.blendSrcAlpha, material.blendDstAlpha, material.blendEquationAlpha,
			material.colorWrite,
			material.depthWrite, material.depthTest, material.depthFunc,
			material.stencilWrite, material.stencilFunc,
			material.stencilFail, material.stencilZFail, material.stencilZPass,
			material.stencilFuncMask, material.stencilWriteMask,
			material.side,
			utils.getSampleCountRenderContext( renderContext ),
			utils.getCurrentColorSpace( renderContext ), utils.getCurrentColorFormat( renderContext ), utils.getCurrentDepthStencilFormat( renderContext ),
			utils.getPrimitiveTopology( object, material ),
			renderObject.getGeometryCacheKey(),
			renderObject.clippingContextCacheKey
		].join();

	}

	// textures

	/**
	 * Creates a GPU sampler for the given texture.
	 *
	 * @param {Texture} texture - The texture to create the sampler for.
	 */
	createSampler( texture ) {

		this.textureUtils.createSampler( texture );

	}

	/**
	 * Destroys the GPU sampler for the given texture.
	 *
	 * @param {Texture} texture - The texture to destroy the sampler for.
	 */
	destroySampler( texture ) {

		this.textureUtils.destroySampler( texture );

	}

	/**
	 * Creates a default texture for the given texture that can be used
	 * as a placeholder until the actual texture is ready for usage.
	 *
	 * @param {Texture} texture - The texture to create a default texture for.
	 */
	createDefaultTexture( texture ) {

		this.textureUtils.createDefaultTexture( texture );

	}

	/**
	 * Defines a texture on the GPU for the given texture object.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {Object} [options={}] - Optional configuration parameter.
	 */
	createTexture( texture, options ) {

		this.textureUtils.createTexture( texture, options );

	}

	/**
	 * Uploads the updated texture data to the GPU.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {Object} [options={}] - Optional configuration parameter.
	 */
	updateTexture( texture, options ) {

		this.textureUtils.updateTexture( texture, options );

	}

	/**
	 * Generates mipmaps for the given texture.
	 *
	 * @param {Texture} texture - The texture.
	 */
	generateMipmaps( texture ) {

		this.textureUtils.generateMipmaps( texture );

	}

	/**
	 * Destroys the GPU data for the given texture object.
	 *
	 * @param {Texture} texture - The texture.
	 */
	destroyTexture( texture ) {

		this.textureUtils.destroyTexture( texture );

	}

	/**
	 * Returns texture data as a typed array.
	 *
	 * @async
	 * @param {Texture} texture - The texture to copy.
	 * @param {Number} x - The x coordinate of the copy origin.
	 * @param {Number} y - The y coordinate of the copy origin.
	 * @param {Number} width - The width of the copy.
	 * @param {Number} height - The height of the copy.
	 * @param {Number} faceIndex - The face index.
	 * @return {Promise<TypedArray>} A Promise that resolves with a typed array when the copy operation has finished.
	 */
	async copyTextureToBuffer( texture, x, y, width, height, faceIndex ) {

		return this.textureUtils.copyTextureToBuffer( texture, x, y, width, height, faceIndex );

	}

	/**
	 * Inits a time stamp query for the given render context.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @param {Object} descriptor - The query descriptor.
	 */
	initTimestampQuery( renderContext, descriptor ) {

		if ( ! this.trackTimestamp ) return;

		const renderContextData = this.get( renderContext );

		// init query set if not exists

		if ( ! renderContextData.timestampQuerySet ) {

			const type = renderContext.isComputeNode ? 'compute' : 'render';

			renderContextData.timestampQuerySet = this.device.createQuerySet( { type: 'timestamp', count: 2, label: `timestamp_${type}_${renderContext.id}` } );

		}

		// augment descriptor

		descriptor.timestampWrites = {
			querySet: renderContextData.timestampQuerySet,
			beginningOfPassWriteIndex: 0, // Write timestamp in index 0 when pass begins.
			endOfPassWriteIndex: 1, // Write timestamp in index 1 when pass ends.
		};

	}

	/**
	 * Prepares the timestamp buffer.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @param {GPUCommandEncoder} encoder - The command encoder.
	 */
	prepareTimestampBuffer( renderContext, encoder ) {

		if ( ! this.trackTimestamp ) return;

		const renderContextData = this.get( renderContext );


		const size = 2 * BigUint64Array.BYTES_PER_ELEMENT;

		if ( renderContextData.currentTimestampQueryBuffers === undefined ) {

			renderContextData.currentTimestampQueryBuffers = {
				resolveBuffer: this.device.createBuffer( {
					label: 'timestamp resolve buffer',
					size: size,
					usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
				} ),
				resultBuffer: this.device.createBuffer( {
					label: 'timestamp result buffer',
					size: size,
					usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
				} )
			};

		}

		const { resolveBuffer, resultBuffer } = renderContextData.currentTimestampQueryBuffers;


		encoder.resolveQuerySet( renderContextData.timestampQuerySet, 0, 2, resolveBuffer, 0 );

		if ( resultBuffer.mapState === 'unmapped' ) {

			encoder.copyBufferToBuffer( resolveBuffer, 0, resultBuffer, 0, size );

		}

	}

	/**
	 * Resolves the time stamp for the given render context and type.
	 *
	 * @async
	 * @param {RenderContext} renderContext - The render context.
	 * @param {String} type - The render context.
	 * @return {Promise} A Promise that resolves when the time stamp has been computed.
	 */
	async resolveTimestampAsync( renderContext, type = 'render' ) {

		if ( ! this.trackTimestamp ) return;

		const renderContextData = this.get( renderContext );

		if ( renderContextData.currentTimestampQueryBuffers === undefined ) return;

		const { resultBuffer } = renderContextData.currentTimestampQueryBuffers;

		if ( resultBuffer.mapState === 'unmapped' ) {

			await resultBuffer.mapAsync( GPUMapMode.READ );

			const times = new BigUint64Array( resultBuffer.getMappedRange() );
			const duration = Number( times[ 1 ] - times[ 0 ] ) / 1000000;


			this.renderer.info.updateTimestamp( type, duration );

			resultBuffer.unmap();

		}

	}

	// node builder

	/**
	 * Returns a node builder for the given render object.
	 *
	 * @param {RenderObject} object - The render object.
	 * @param {Renderer} renderer - The renderer.
	 * @return {WGSLNodeBuilder} The node builder.
	 */
	createNodeBuilder( object, renderer ) {

		return new WGSLNodeBuilder( object, renderer );

	}

	// program

	/**
	 * Creates a shader program from the given programmable stage.
	 *
	 * @param {ProgrammableStage} program - The programmable stage.
	 */
	createProgram( program ) {

		const programGPU = this.get( program );

		programGPU.module = {
			module: this.device.createShaderModule( { code: program.code, label: program.stage + ( program.name !== '' ? `_${ program.name }` : '' ) } ),
			entryPoint: 'main'
		};

	}

	/**
	 * Destroys the shader program of the given programmable stage.
	 *
	 * @param {ProgrammableStage} program - The programmable stage.
	 */
	destroyProgram( program ) {

		this.delete( program );

	}

	// pipelines

	/**
	 * Creates a render pipeline for the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @param {Array<Promise>} promises - An array of compilation promises which are used in `compileAsync()`.
	 */
	createRenderPipeline( renderObject, promises ) {

		this.pipelineUtils.createRenderPipeline( renderObject, promises );

	}

	/**
	 * Creates a compute pipeline for the given compute node.
	 *
	 * @param {ComputePipeline} computePipeline - The compute pipeline.
	 * @param {Array<BindGroup>} bindings - The bindings.
	 */
	createComputePipeline( computePipeline, bindings ) {

		this.pipelineUtils.createComputePipeline( computePipeline, bindings );

	}

	/**
	 * Prepares the state for encoding render bundles.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 */
	beginBundle( renderContext ) {

		const renderContextData = this.get( renderContext );

		renderContextData._currentPass = renderContextData.currentPass;
		renderContextData._currentSets = renderContextData.currentSets;

		renderContextData.currentSets = { attributes: {}, bindingGroups: [], pipeline: null, index: null };
		renderContextData.currentPass = this.pipelineUtils.createBundleEncoder( renderContext );

	}

	/**
	 * After processing render bundles this method finalizes related work.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @param {RenderBundle} bundle - The render bundle.
	 */
	finishBundle( renderContext, bundle ) {

		const renderContextData = this.get( renderContext );

		const bundleEncoder = renderContextData.currentPass;
		const bundleGPU = bundleEncoder.finish();

		this.get( bundle ).bundleGPU = bundleGPU;

		// restore render pass state

		renderContextData.currentSets = renderContextData._currentSets;
		renderContextData.currentPass = renderContextData._currentPass;

	}

	/**
	 * Adds a render bundle to the render context data.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @param {RenderBundle} bundle - The render bundle to add.
	 */
	addBundle( renderContext, bundle ) {

		const renderContextData = this.get( renderContext );

		renderContextData.renderBundles.push( this.get( bundle ).bundleGPU );

	}

	// bindings

	/**
	 * Creates bindings from the given bind group definition.
	 *
	 * @param {BindGroup} bindGroup - The bind group.
	 * @param {Array<BindGroup>} bindings - Array of bind groups.
	 * @param {Number} cacheIndex - The cache index.
	 * @param {Number} version - The version.
	 */
	createBindings( bindGroup, bindings, cacheIndex, version ) {

		this.bindingUtils.createBindings( bindGroup, bindings, cacheIndex, version );

	}

	/**
	 * Updates the given bind group definition.
	 *
	 * @param {BindGroup} bindGroup - The bind group.
	 * @param {Array<BindGroup>} bindings - Array of bind groups.
	 * @param {Number} cacheIndex - The cache index.
	 * @param {Number} version - The version.
	 */
	updateBindings( bindGroup, bindings, cacheIndex, version ) {

		this.bindingUtils.createBindings( bindGroup, bindings, cacheIndex, version );

	}

	/**
	 * Updates a buffer binding.
	 *
	 *  @param {Buffer} binding - The buffer binding to update.
	 */
	updateBinding( binding ) {

		this.bindingUtils.updateBinding( binding );

	}

	// attributes

	/**
	 * Creates the buffer of an indexed shader attribute.
	 *
	 * @param {BufferAttribute} attribute - The indexed buffer attribute.
	 */
	createIndexAttribute( attribute ) {

		this.attributeUtils.createAttribute( attribute, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST );

	}

	/**
	 * Creates the GPU buffer of a shader attribute.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 */
	createAttribute( attribute ) {

		this.attributeUtils.createAttribute( attribute, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST );

	}

	/**
	 * Creates the GPU buffer of a storage attribute.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 */
	createStorageAttribute( attribute ) {

		this.attributeUtils.createAttribute( attribute, GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST );

	}

	/**
	 * Creates the GPU buffer of an indirect storage attribute.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 */
	createIndirectStorageAttribute( attribute ) {

		this.attributeUtils.createAttribute( attribute, GPUBufferUsage.STORAGE | GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST );

	}

	/**
	 * Updates the GPU buffer of a shader attribute.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute to update.
	 */
	updateAttribute( attribute ) {

		this.attributeUtils.updateAttribute( attribute );

	}

	/**
	 * Destroys the GPU buffer of a shader attribute.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute to destroy.
	 */
	destroyAttribute( attribute ) {

		this.attributeUtils.destroyAttribute( attribute );

	}

	// canvas

	/**
	 * Triggers an update of the default render pass descriptor.
	 */
	updateSize() {

		this.colorBuffer = this.textureUtils.getColorBuffer();
		this.defaultRenderPassdescriptor = null;

	}

	// utils public

	/**
	 * Returns the maximum anisotropy texture filtering value.
	 *
	 * @return {Number} The maximum anisotropy texture filtering value.
	 */
	getMaxAnisotropy() {

		return 16;

	}

	/**
	 * Checks if the given feature is supported  by the backend.
	 *
	 * @param {String} name - The feature's name.
	 * @return {Boolean} Whether the feature is supported or not.
	 */
	hasFeature( name ) {

		return this.device.features.has( name );

	}

	/**
	 * Copies data of the given source texture to the given destination texture.
	 *
	 * @param {Texture} srcTexture - The source texture.
	 * @param {Texture} dstTexture - The destination texture.
	 * @param {Vector4?} [srcRegion=null] - The region of the source texture to copy.
	 * @param {(Vector2|Vector3)?} [dstPosition=null] - The destination position of the copy.
	 * @param {Number} [level=0] - The mip level to copy.
	 */
	copyTextureToTexture( srcTexture, dstTexture, srcRegion = null, dstPosition = null, level = 0 ) {

		let dstX = 0;
		let dstY = 0;
		let dstLayer = 0;

		let srcX = 0;
		let srcY = 0;
		let srcLayer = 0;

		let srcWidth = srcTexture.image.width;
		let srcHeight = srcTexture.image.height;

		if ( srcRegion !== null ) {

			srcX = srcRegion.x;
			srcY = srcRegion.y;
			srcLayer = srcRegion.z || 0;
			srcWidth = srcRegion.width;
			srcHeight = srcRegion.height;

		}

		if ( dstPosition !== null ) {

			dstX = dstPosition.x;
			dstY = dstPosition.y;
			dstLayer = dstPosition.z || 0;

		}

		const encoder = this.device.createCommandEncoder( { label: 'copyTextureToTexture_' + srcTexture.id + '_' + dstTexture.id } );

		const sourceGPU = this.get( srcTexture ).texture;
		const destinationGPU = this.get( dstTexture ).texture;

		encoder.copyTextureToTexture(
			{
				texture: sourceGPU,
				mipLevel: level,
				origin: { x: srcX, y: srcY, z: srcLayer }
			},
			{
				texture: destinationGPU,
				mipLevel: level,
				origin: { x: dstX, y: dstY, z: dstLayer }
			},
			[
				srcWidth,
				srcHeight,
				1
			]
		);

		this.device.queue.submit( [ encoder.finish() ] );

	}

	/**
	 * Copies the current bound framebuffer to the given texture.
	 *
	 * @param {Texture} texture - The destination texture.
	 * @param {RenderContext} renderContext - The render context.
	 * @param {Vector4} rectangle - A four dimensional vector defining the origin and dimension of the copy.
	 */
	copyFramebufferToTexture( texture, renderContext, rectangle ) {

		const renderContextData = this.get( renderContext );

		let sourceGPU = null;

		if ( renderContext.renderTarget ) {

			if ( texture.isDepthTexture ) {

				sourceGPU = this.get( renderContext.depthTexture ).texture;

			} else {

				sourceGPU = this.get( renderContext.textures[ 0 ] ).texture;

			}

		} else {

			if ( texture.isDepthTexture ) {

				sourceGPU = this.textureUtils.getDepthBuffer( renderContext.depth, renderContext.stencil );

			} else {

				sourceGPU = this.context.getCurrentTexture();

			}

		}

		const destinationGPU = this.get( texture ).texture;

		if ( sourceGPU.format !== destinationGPU.format ) {

			console.error( 'WebGPUBackend: copyFramebufferToTexture: Source and destination formats do not match.', sourceGPU.format, destinationGPU.format );

			return;

		}

		let encoder;

		if ( renderContextData.currentPass ) {

			renderContextData.currentPass.end();

			encoder = renderContextData.encoder;

		} else {

			encoder = this.device.createCommandEncoder( { label: 'copyFramebufferToTexture_' + texture.id } );

		}

		encoder.copyTextureToTexture(
			{
				texture: sourceGPU,
				origin: [ rectangle.x, rectangle.y, 0 ],
			},
			{
				texture: destinationGPU
			},
			[
				rectangle.z,
				rectangle.w
			]
		);

		if ( texture.generateMipmaps ) this.textureUtils.generateMipmaps( texture );

		if ( renderContextData.currentPass ) {

			const { descriptor } = renderContextData;

			for ( let i = 0; i < descriptor.colorAttachments.length; i ++ ) {

				descriptor.colorAttachments[ i ].loadOp = GPULoadOp.Load;

			}

			if ( renderContext.depth ) descriptor.depthStencilAttachment.depthLoadOp = GPULoadOp.Load;
			if ( renderContext.stencil ) descriptor.depthStencilAttachment.stencilLoadOp = GPULoadOp.Load;

			renderContextData.currentPass = encoder.beginRenderPass( descriptor );
			renderContextData.currentSets = { attributes: {}, bindingGroups: [], pipeline: null, index: null };

			if ( renderContext.viewport ) {

				this.updateViewport( renderContext );

			}

			if ( renderContext.scissor ) {

				const { x, y, width, height } = renderContext.scissorValue;

				renderContextData.currentPass.setScissorRect( x, y, width, height );

			}

		} else {

			this.device.queue.submit( [ encoder.finish() ] );

		}

	}

}

export default WebGPUBackend;
