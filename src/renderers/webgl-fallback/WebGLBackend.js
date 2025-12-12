import GLSLNodeBuilder from './nodes/GLSLNodeBuilder.js';
import Backend from '../common/Backend.js';
import { getCacheKey } from '../common/RenderContext.js';

import WebGLAttributeUtils from './utils/WebGLAttributeUtils.js';
import WebGLState from './utils/WebGLState.js';
import WebGLUtils from './utils/WebGLUtils.js';
import WebGLTextureUtils from './utils/WebGLTextureUtils.js';
import WebGLExtensions from './utils/WebGLExtensions.js';
import WebGLCapabilities from './utils/WebGLCapabilities.js';
import { GLFeatureName } from './utils/WebGLConstants.js';
import { WebGLBufferRenderer } from './WebGLBufferRenderer.js';

import { isTypedArray, warnOnce, warn, error } from '../../utils.js';
import { WebGLCoordinateSystem, TimestampQuery } from '../../constants.js';
import WebGLTimestampQueryPool from './utils/WebGLTimestampQueryPool.js';

/**
 * A backend implementation targeting WebGL 2.
 *
 * @private
 * @augments Backend
 */
class WebGLBackend extends Backend {

	/**
	 * WebGLBackend options.
	 *
	 * @typedef {Object} WebGLBackend~Options
	 * @property {boolean} [logarithmicDepthBuffer=false] - Whether logarithmic depth buffer is enabled or not.
	 * @property {boolean} [alpha=true] - Whether the default framebuffer (which represents the final contents of the canvas) should be transparent or opaque.
	 * @property {boolean} [depth=true] - Whether the default framebuffer should have a depth buffer or not.
	 * @property {boolean} [stencil=false] - Whether the default framebuffer should have a stencil buffer or not.
	 * @property {boolean} [antialias=false] - Whether MSAA as the default anti-aliasing should be enabled or not.
	 * @property {number} [samples=0] - When `antialias` is `true`, `4` samples are used by default. Set this parameter to any other integer value than 0 to overwrite the default.
	 * @property {boolean} [forceWebGL=false] - If set to `true`, the renderer uses a WebGL 2 backend no matter if WebGPU is supported or not.
	 * @property {WebGL2RenderingContext} [context=undefined] - A WebGL 2 rendering context.
	 */

	/**
	 * Constructs a new WebGPU backend.
	 *
	 * @param {WebGLBackend~Options} [parameters] - The configuration parameter.
	 */
	constructor( parameters = {} ) {

		super( parameters );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isWebGLBackend = true;

		/**
		 * A reference to a backend module holding shader attribute-related
		 * utility functions.
		 *
		 * @type {?WebGLAttributeUtils}
		 * @default null
		 */
		this.attributeUtils = null;

		/**
		 * A reference to a backend module holding extension-related
		 * utility functions.
		 *
		 * @type {?WebGLExtensions}
		 * @default null
		 */
		this.extensions = null;

		/**
		 * A reference to a backend module holding capability-related
		 * utility functions.
		 *
		 * @type {?WebGLCapabilities}
		 * @default null
		 */
		this.capabilities = null;

		/**
		 * A reference to a backend module holding texture-related
		 * utility functions.
		 *
		 * @type {?WebGLTextureUtils}
		 * @default null
		 */
		this.textureUtils = null;

		/**
		 * A reference to a backend module holding renderer-related
		 * utility functions.
		 *
		 * @type {?WebGLBufferRenderer}
		 * @default null
		 */
		this.bufferRenderer = null;

		/**
		 * A reference to the rendering context.
		 *
		 * @type {?WebGL2RenderingContext}
		 * @default null
		 */
		this.gl = null;

		/**
		 * A reference to a backend module holding state-related
		 * utility functions.
		 *
		 * @type {?WebGLState}
		 * @default null
		 */
		this.state = null;

		/**
		 * A reference to a backend module holding common
		 * utility functions.
		 *
		 * @type {?WebGLUtils}
		 * @default null
		 */
		this.utils = null;

		/**
		 * Dictionary for caching VAOs.
		 *
		 * @type {Object<string,WebGLVertexArrayObject>}
		 */
		this.vaoCache = {};

		/**
		 * Dictionary for caching transform feedback objects.
		 *
		 * @type {Object<string,WebGLTransformFeedback>}
		 */
		this.transformFeedbackCache = {};

		/**
		 * Controls if `gl.RASTERIZER_DISCARD` should be enabled or not.
		 * Only relevant when using compute shaders.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.discard = false;

		/**
		 * A reference to the `EXT_disjoint_timer_query_webgl2` extension. `null` if the
		 * device does not support the extension.
		 *
		 * @type {?EXTDisjointTimerQueryWebGL2}
		 * @default null
		 */
		this.disjoint = null;

		/**
		* A reference to the `KHR_parallel_shader_compile` extension. `null` if the
		* device does not support the extension.
		*
		* @type {?KHRParallelShaderCompile}
		* @default null
		*/
		this.parallel = null;

		/**
		 * A reference to the current render context.
		 *
		 * @private
		 * @type {RenderContext}
		 * @default null
		 */
		this._currentContext = null;

		/**
		 * A unique collection of bindings.
		 *
		 * @private
		 * @type {WeakSet<Array<BindGroup>>}
		 */
		this._knownBindings = new WeakSet();


		/**
		 * Whether the device supports framebuffers invalidation or not.
		 *
		 * @private
		 * @type {boolean}
		 */
		this._supportsInvalidateFramebuffer = typeof navigator === 'undefined' ? false : /OculusBrowser/g.test( navigator.userAgent );

		/**
		 * The target framebuffer when rendering with
		 * the WebXR device API.
		 *
		 * @private
		 * @type {?WebGLFramebuffer}
		 * @default null
		 */
		this._xrFramebuffer = null;

	}

	/**
	 * Initializes the backend so it is ready for usage.
	 *
	 * @param {Renderer} renderer - The renderer.
	 */
	init( renderer ) {

		super.init( renderer );

		//

		const parameters = this.parameters;

		const contextAttributes = {
			antialias: renderer.currentSamples > 0,
			alpha: true, // always true for performance reasons
			depth: renderer.depth,
			stencil: renderer.stencil
		};

		const glContext = ( parameters.context !== undefined ) ? parameters.context : renderer.domElement.getContext( 'webgl2', contextAttributes );

	 	function onContextLost( event ) {

			event.preventDefault();

			const contextLossInfo = {
				api: 'WebGL',
				message: event.statusMessage || 'Unknown reason',
				reason: null,
				originalEvent: event
			};

			renderer.onDeviceLost( contextLossInfo );

		}

		this._onContextLost = onContextLost;

		renderer.domElement.addEventListener( 'webglcontextlost', onContextLost, false );

		this.gl = glContext;

		this.extensions = new WebGLExtensions( this );
		this.capabilities = new WebGLCapabilities( this );
		this.attributeUtils = new WebGLAttributeUtils( this );
		this.textureUtils = new WebGLTextureUtils( this );
		this.bufferRenderer = new WebGLBufferRenderer( this );

		this.state = new WebGLState( this );
		this.utils = new WebGLUtils( this );

		this.extensions.get( 'EXT_color_buffer_float' );
		this.extensions.get( 'WEBGL_clip_cull_distance' );
		this.extensions.get( 'OES_texture_float_linear' );
		this.extensions.get( 'EXT_color_buffer_half_float' );
		this.extensions.get( 'WEBGL_multisampled_render_to_texture' );
		this.extensions.get( 'WEBGL_render_shared_exponent' );
		this.extensions.get( 'WEBGL_multi_draw' );
		this.extensions.get( 'OVR_multiview2' );

		this.disjoint = this.extensions.get( 'EXT_disjoint_timer_query_webgl2' );
		this.parallel = this.extensions.get( 'KHR_parallel_shader_compile' );
		this.drawBuffersIndexedExt = this.extensions.get( 'OES_draw_buffers_indexed' );

	}

	/**
	 * The coordinate system of the backend.
	 *
	 * @type {number}
	 * @readonly
	 */
	get coordinateSystem() {

		return WebGLCoordinateSystem;

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
	 * Ensures the backend is XR compatible.
	 *
	 * @async
	 * @return {Promise} A Promise that resolve when the renderer is XR compatible.
	 */
	async makeXRCompatible() {

		const attributes = this.gl.getContextAttributes();

		if ( attributes.xrCompatible !== true ) {

			await this.gl.makeXRCompatible();

		}

	}
	/**
	 * Sets the XR rendering destination.
	 *
	 * @param {WebGLFramebuffer} xrFramebuffer - The XR framebuffer.
	 */
	setXRTarget( xrFramebuffer ) {

		this._xrFramebuffer = xrFramebuffer;

	}

	/**
	 * Configures the given XR render target with external textures.
	 *
	 * This method is only relevant when using the WebXR Layers API.
	 *
	 * @param {XRRenderTarget} renderTarget - The XR render target.
	 * @param {WebGLTexture} colorTexture - A native color texture.
	 * @param {?WebGLTexture} [depthTexture=null] - A native depth texture.
	 */
	setXRRenderTargetTextures( renderTarget, colorTexture, depthTexture = null ) {

		const gl = this.gl;

		this.set( renderTarget.texture, { textureGPU: colorTexture, glInternalFormat: gl.RGBA8 } ); // see #24698 why RGBA8 and not SRGB8_ALPHA8 is used

		if ( depthTexture !== null ) {

			const glInternalFormat = renderTarget.stencilBuffer ? gl.DEPTH24_STENCIL8 : gl.DEPTH_COMPONENT24;

			this.set( renderTarget.depthTexture, { textureGPU: depthTexture, glInternalFormat: glInternalFormat } );

			// The multisample_render_to_texture extension doesn't work properly if there
			// are midframe flushes and an external depth texture.
			if ( ( this.extensions.has( 'WEBGL_multisampled_render_to_texture' ) === true ) && renderTarget._autoAllocateDepthBuffer === true && renderTarget.multiview === false ) {

				warn( 'WebGLBackend: Render-to-texture extension was disabled because an external texture was provided' );

			}

			renderTarget._autoAllocateDepthBuffer = false;

		}

	}

	/**
	 * Inits a time stamp query for the given render context.
	 *
	 * @param {string} type - The type of the timestamp query.
	 * @param {string} uid - A unique identifier for the timestamp query.
	 */
	initTimestampQuery( type, uid ) {

		if ( ! this.disjoint || ! this.trackTimestamp ) return;

		if ( ! this.timestampQueryPool[ type ] ) {

			// TODO: Variable maxQueries?
			this.timestampQueryPool[ type ] = new WebGLTimestampQueryPool( this.gl, type, 2048 );

		}

		const timestampQueryPool = this.timestampQueryPool[ type ];

		const baseOffset = timestampQueryPool.allocateQueriesForContext( uid );

		if ( baseOffset !== null ) {

			timestampQueryPool.beginQuery( uid );

		}

	}

	// timestamp utils

	/**
	 * Prepares the timestamp buffer.
	 *
	 * @param {string} type - The type of the timestamp query.
	 * @param {string} uid - A unique identifier for the timestamp query.
	 */
	prepareTimestampBuffer( type, uid ) {

		if ( ! this.disjoint || ! this.trackTimestamp ) return;

		const timestampQueryPool = this.timestampQueryPool[ type ];

		timestampQueryPool.endQuery( uid );

	}


	/**
	 * Returns the backend's rendering context.
	 *
	 * @return {WebGL2RenderingContext} The rendering context.
	 */
	getContext() {

		return this.gl;

	}

	/**
	 * This method is executed at the beginning of a render call and prepares
	 * the WebGL state for upcoming render calls
	 *
	 * @param {RenderContext} renderContext - The render context.
	 */
	beginRender( renderContext ) {

		const { state } = this;
		const renderContextData = this.get( renderContext );

		//

		if ( renderContext.viewport ) {

			this.updateViewport( renderContext );

		} else {

			const { width, height } = this.getDrawingBufferSize();
			state.viewport( 0, 0, width, height );

		}

		if ( renderContext.scissor ) {

			const { x, y, width, height } = renderContext.scissorValue;

			state.scissor( x, renderContext.height - height - y, width, height );

		}

		//

		this.initTimestampQuery( TimestampQuery.RENDER, this.getTimestampUID( renderContext ) );

		renderContextData.previousContext = this._currentContext;
		this._currentContext = renderContext;

		this._setFramebuffer( renderContext );
		this.clear( renderContext.clearColor, renderContext.clearDepth, renderContext.clearStencil, renderContext, false );

		const occlusionQueryCount = renderContext.occlusionQueryCount;

		if ( occlusionQueryCount > 0 ) {

			// Get a reference to the array of objects with queries. The renderContextData property
			// can be changed by another render pass before the async reading of all previous queries complete
			renderContextData.currentOcclusionQueries = renderContextData.occlusionQueries;
			renderContextData.currentOcclusionQueryObjects = renderContextData.occlusionQueryObjects;

			renderContextData.lastOcclusionObject = null;
			renderContextData.occlusionQueries = new Array( occlusionQueryCount );
			renderContextData.occlusionQueryObjects = new Array( occlusionQueryCount );
			renderContextData.occlusionQueryIndex = 0;

		}

	}

	/**
	 * This method is executed at the end of a render call and finalizes work
	 * after draw calls.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 */
	finishRender( renderContext ) {

		const { gl, state } = this;
		const renderContextData = this.get( renderContext );
		const previousContext = renderContextData.previousContext;

		state.resetVertexState();

		const occlusionQueryCount = renderContext.occlusionQueryCount;

		if ( occlusionQueryCount > 0 ) {

			if ( occlusionQueryCount > renderContextData.occlusionQueryIndex ) {

				gl.endQuery( gl.ANY_SAMPLES_PASSED );

			}

			this.resolveOccludedAsync( renderContext );

		}

		const textures = renderContext.textures;

		if ( textures !== null ) {

			for ( let i = 0; i < textures.length; i ++ ) {

				const texture = textures[ i ];

				if ( texture.generateMipmaps ) {

					this.generateMipmaps( texture );

				}

			}

		}

		this._currentContext = previousContext;

		this._resolveRenderTarget( renderContext );

		if ( previousContext !== null ) {

			this._setFramebuffer( previousContext );

			if ( previousContext.viewport ) {

				this.updateViewport( previousContext );

			} else {

				const { width, height } = this.getDrawingBufferSize();
				state.viewport( 0, 0, width, height );

			}

		}

		this.prepareTimestampBuffer( TimestampQuery.RENDER, this.getTimestampUID( renderContext ) );

	}

	/**
	 * This method processes the result of occlusion queries and writes it
	 * into render context data.
	 *
	 * @async
	 * @param {RenderContext} renderContext - The render context.
	 */
	resolveOccludedAsync( renderContext ) {

		const renderContextData = this.get( renderContext );

		// handle occlusion query results

		const { currentOcclusionQueries, currentOcclusionQueryObjects } = renderContextData;

		if ( currentOcclusionQueries && currentOcclusionQueryObjects ) {

			const occluded = new WeakSet();
			const { gl } = this;

			renderContextData.currentOcclusionQueryObjects = null;
			renderContextData.currentOcclusionQueries = null;

			const check = () => {

				let completed = 0;

				// check all queries and requeue as appropriate
				for ( let i = 0; i < currentOcclusionQueries.length; i ++ ) {

					const query = currentOcclusionQueries[ i ];

					if ( query === null ) continue;

					if ( gl.getQueryParameter( query, gl.QUERY_RESULT_AVAILABLE ) ) {

						if ( gl.getQueryParameter( query, gl.QUERY_RESULT ) === 0 ) occluded.add( currentOcclusionQueryObjects[ i ] );

						currentOcclusionQueries[ i ] = null;
						gl.deleteQuery( query );

						completed ++;

					}

				}

				if ( completed < currentOcclusionQueries.length ) {

					requestAnimationFrame( check );

				} else {

					renderContextData.occluded = occluded;

				}

			};

			check();

		}

	}

	/**
	 * Returns `true` if the given 3D object is fully occluded by other
	 * 3D objects in the scene.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @param {Object3D} object - The 3D object to test.
	 * @return {boolean} Whether the 3D object is fully occluded or not.
	 */
	isOccluded( renderContext, object ) {

		const renderContextData = this.get( renderContext );

		return renderContextData.occluded && renderContextData.occluded.has( object );

	}

	/**
	 * Updates the viewport with the values from the given render context.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 */
	updateViewport( renderContext ) {

		const { state } = this;
		const { x, y, width, height } = renderContext.viewportValue;

		state.viewport( x, renderContext.height - height - y, width, height );

	}

	/**
	 * Defines the scissor test.
	 *
	 * @param {boolean} boolean - Whether the scissor test should be enabled or not.
	 */
	setScissorTest( boolean ) {

		const state = this.state;

		state.setScissorTest( boolean );

	}

	/**
	 * Returns the clear color and alpha into a single
	 * color object.
	 *
	 * @return {Color4} The clear color.
	 */
	getClearColor() {

		const clearColor = super.getClearColor();

		// Since the canvas is always created with alpha: true,
		// WebGL must always premultiply the clear color.

		clearColor.r *= clearColor.a;
		clearColor.g *= clearColor.a;
		clearColor.b *= clearColor.a;

		return clearColor;

	}

	/**
	 * Performs a clear operation.
	 *
	 * @param {boolean} color - Whether the color buffer should be cleared or not.
	 * @param {boolean} depth - Whether the depth buffer should be cleared or not.
	 * @param {boolean} stencil - Whether the stencil buffer should be cleared or not.
	 * @param {?Object} [descriptor=null] - The render context of the current set render target.
	 * @param {boolean} [setFrameBuffer=true] - Controls whether the intermediate framebuffer should be set or not.
	 * @param {boolean} [resolveRenderTarget=true] - Controls whether an active render target should be resolved
	 * or not. Only relevant for explicit clears.
	 */
	clear( color, depth, stencil, descriptor = null, setFrameBuffer = true, resolveRenderTarget = true ) {

		const { gl, renderer } = this;

		if ( descriptor === null ) {

			const clearColor = this.getClearColor();

			descriptor = {
				textures: null,
				clearColorValue: clearColor
			};

		}

		//

		let clear = 0;

		if ( color ) clear |= gl.COLOR_BUFFER_BIT;
		if ( depth ) clear |= gl.DEPTH_BUFFER_BIT;
		if ( stencil ) clear |= gl.STENCIL_BUFFER_BIT;

		if ( clear !== 0 ) {

			let clearColor;

			if ( descriptor.clearColorValue ) {

				clearColor = descriptor.clearColorValue;

			} else {

				clearColor = this.getClearColor();

			}

			const clearDepth = renderer.getClearDepth();
			const clearStencil = renderer.getClearStencil();

			if ( depth ) this.state.setDepthMask( true );

			if ( descriptor.textures === null ) {

				gl.clearColor( clearColor.r, clearColor.g, clearColor.b, clearColor.a );
				gl.clear( clear );

			} else {

				if ( setFrameBuffer ) this._setFramebuffer( descriptor );

				if ( color ) {

					for ( let i = 0; i < descriptor.textures.length; i ++ ) {

						if ( i === 0 ) {

							gl.clearBufferfv( gl.COLOR, i, [ clearColor.r, clearColor.g, clearColor.b, clearColor.a ] );

						} else {

							gl.clearBufferfv( gl.COLOR, i, [ 0, 0, 0, 1 ] );

						}

					}

				}

				if ( depth && stencil ) {

					gl.clearBufferfi( gl.DEPTH_STENCIL, 0, clearDepth, clearStencil );

				} else if ( depth ) {

					gl.clearBufferfv( gl.DEPTH, 0, [ clearDepth ] );

				} else if ( stencil ) {

					gl.clearBufferiv( gl.STENCIL, 0, [ clearStencil ] );

				}

				if ( setFrameBuffer && resolveRenderTarget ) this._resolveRenderTarget( descriptor );

			}

		}

	}

	/**
	 * This method is executed at the beginning of a compute call and
	 * prepares the state for upcoming compute tasks.
	 *
	 * @param {Node|Array<Node>} computeGroup - The compute node(s).
	 */
	beginCompute( computeGroup ) {

		const { state, gl } = this;

		//

		state.bindFramebuffer( gl.FRAMEBUFFER, null );
		this.initTimestampQuery( TimestampQuery.COMPUTE, this.getTimestampUID( computeGroup ) );

	}

	/**
	 * Executes a compute command for the given compute node.
	 *
	 * @param {Node|Array<Node>} computeGroup - The group of compute nodes of a compute call. Can be a single compute node.
	 * @param {Node} computeNode - The compute node.
	 * @param {Array<BindGroup>} bindings - The bindings.
	 * @param {ComputePipeline} pipeline - The compute pipeline.
	 * @param {?number} [count=null] - The count of compute invocations. If `null`, the count is determined by the compute node.
	 */
	compute( computeGroup, computeNode, bindings, pipeline, count = null ) {

		const { state, gl } = this;

		if ( this.discard === false ) {

			// required here to handle async behaviour of render.compute()
			state.enable( gl.RASTERIZER_DISCARD );
			this.discard = true;

		}

		const { programGPU, transformBuffers, attributes } = this.get( pipeline );

		const vaoKey = this._getVaoKey( attributes );

		const vaoGPU = this.vaoCache[ vaoKey ];

		if ( vaoGPU === undefined ) {

			this.vaoCache[ vaoKey ] = this._createVao( attributes );

		} else {

			state.setVertexState( vaoGPU );

		}

		state.useProgram( programGPU );

		this._bindUniforms( bindings );

		const transformFeedbackGPU = this._getTransformFeedback( transformBuffers );

		gl.bindTransformFeedback( gl.TRANSFORM_FEEDBACK, transformFeedbackGPU );
		gl.beginTransformFeedback( gl.POINTS );

		count = ( count !== null ) ? count : computeNode.count;

		if ( Array.isArray( count ) ) {

			warnOnce( 'WebGLBackend.compute(): The count parameter must be a single number, not an array.' );

			count = count[ 0 ];

		} else if ( count && typeof count === 'object' && count.isIndirectStorageBufferAttribute ) {

			warnOnce( 'WebGLBackend.compute(): The count parameter must be a single number, not IndirectStorageBufferAttribute' );

			count = computeNode.count;

		}

		if ( attributes[ 0 ].isStorageInstancedBufferAttribute ) {

			gl.drawArraysInstanced( gl.POINTS, 0, 1, count );

		} else {

			gl.drawArrays( gl.POINTS, 0, count );

		}

		gl.endTransformFeedback();
		gl.bindTransformFeedback( gl.TRANSFORM_FEEDBACK, null );

		// switch active buffers

		for ( let i = 0; i < transformBuffers.length; i ++ ) {

			const dualAttributeData = transformBuffers[ i ];

			if ( dualAttributeData.pbo && this.has( dualAttributeData.pbo ) ) {

				this.textureUtils.copyBufferToTexture( dualAttributeData.transformBuffer, dualAttributeData.pbo );

			}

			dualAttributeData.switchBuffers();


		}

	}

	/**
	 * This method is executed at the end of a compute call and
	 * finalizes work after compute tasks.
	 *
	 * @param {Node|Array<Node>} computeGroup - The compute node(s).
	 */
	finishCompute( computeGroup ) {

		const { state, gl } = this;

		this.discard = false;

		state.disable( gl.RASTERIZER_DISCARD );

		this.prepareTimestampBuffer( TimestampQuery.COMPUTE, this.getTimestampUID( computeGroup ) );

		if ( this._currentContext ) {

			this._setFramebuffer( this._currentContext );

		}

	}

	/**
	 * Internal to determine if the current render target is a render target array with depth 2D array texture.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @return {boolean} Whether the render target is a render target array with depth 2D array texture.
	 *
	 * @private
	 */
	_isRenderCameraDepthArray( renderContext ) {

		return renderContext.depthTexture && renderContext.depthTexture.isArrayTexture && renderContext.camera.isArrayCamera;

	}

	/**
	 * Executes a draw command for the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object to draw.
	 * @param {Info} info - Holds a series of statistical information about the GPU memory and the rendering process.
	 */
	draw( renderObject/*, info*/ ) {

		const { object, pipeline, material, context, hardwareClippingPlanes } = renderObject;
		const { programGPU } = this.get( pipeline );

		const { gl, state } = this;

		const contextData = this.get( context );

		const drawParams = renderObject.getDrawParameters();

		if ( drawParams === null ) return;

		//

		this._bindUniforms( renderObject.getBindings() );

		const frontFaceCW = ( object.isMesh && object.matrixWorld.determinant() < 0 );

		state.setMaterial( material, frontFaceCW, hardwareClippingPlanes );

		if ( context.textures !== null && context.textures.length > 1 ) {

			state.setMRTBlending( context.textures );

		}

		state.useProgram( programGPU );

		// vertex state

		const attributes = renderObject.getAttributes();
		const attributesData = this.get( attributes );

		let vaoGPU = attributesData.vaoGPU;

		if ( vaoGPU === undefined ) {

			const vaoKey = this._getVaoKey( attributes );

			vaoGPU = this.vaoCache[ vaoKey ];

			if ( vaoGPU === undefined ) {

				vaoGPU = this._createVao( attributes );

				this.vaoCache[ vaoKey ] = vaoGPU;
				attributesData.vaoGPU = vaoGPU;

			}

		}

		const index = renderObject.getIndex();
		const indexGPU = ( index !== null ) ? this.get( index ).bufferGPU : null;

		state.setVertexState( vaoGPU, indexGPU );

		//

		const lastObject = contextData.lastOcclusionObject;

		if ( lastObject !== object && lastObject !== undefined ) {

			if ( lastObject !== null && lastObject.occlusionTest === true ) {

				gl.endQuery( gl.ANY_SAMPLES_PASSED );

				contextData.occlusionQueryIndex ++;

			}

			if ( object.occlusionTest === true ) {

				const query = gl.createQuery();

				gl.beginQuery( gl.ANY_SAMPLES_PASSED, query );

				contextData.occlusionQueries[ contextData.occlusionQueryIndex ] = query;
				contextData.occlusionQueryObjects[ contextData.occlusionQueryIndex ] = object;

			}

			contextData.lastOcclusionObject = object;

		}

		//
		const renderer = this.bufferRenderer;

		if ( object.isPoints ) renderer.mode = gl.POINTS;
		else if ( object.isLineSegments ) renderer.mode = gl.LINES;
		else if ( object.isLine ) renderer.mode = gl.LINE_STRIP;
		else if ( object.isLineLoop ) renderer.mode = gl.LINE_LOOP;
		else {

			if ( material.wireframe === true ) {

				state.setLineWidth( material.wireframeLinewidth * this.renderer.getPixelRatio() );
				renderer.mode = gl.LINES;

			} else {

				renderer.mode = gl.TRIANGLES;

			}

		}

		//

		const { vertexCount, instanceCount } = drawParams;
		let { firstVertex } = drawParams;

		renderer.object = object;

		if ( index !== null ) {

			firstVertex *= index.array.BYTES_PER_ELEMENT;

			const indexData = this.get( index );

			renderer.index = index.count;
			renderer.type = indexData.type;

		} else {

			renderer.index = 0;

		}

		const draw = () => {

			if ( object.isBatchedMesh ) {

				if ( object._multiDrawInstances !== null ) {

					// @deprecated, r174
					warnOnce( 'WebGLBackend: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.' );
					renderer.renderMultiDrawInstances( object._multiDrawStarts, object._multiDrawCounts, object._multiDrawCount, object._multiDrawInstances );

				} else if ( ! this.hasFeature( 'WEBGL_multi_draw' ) ) {

					warnOnce( 'WebGLBackend: WEBGL_multi_draw not supported.' );

				} else {

					renderer.renderMultiDraw( object._multiDrawStarts, object._multiDrawCounts, object._multiDrawCount );

				}

			} else if ( instanceCount > 1 ) {

				renderer.renderInstances( firstVertex, vertexCount, instanceCount );

			} else {

				renderer.render( firstVertex, vertexCount );

			}

		};

		if ( renderObject.camera.isArrayCamera === true && renderObject.camera.cameras.length > 0 && renderObject.camera.isMultiViewCamera === false ) {

			const cameraData = this.get( renderObject.camera );
			const cameras = renderObject.camera.cameras;
			const cameraIndex = renderObject.getBindingGroup( 'cameraIndex' ).bindings[ 0 ];

			if ( cameraData.indexesGPU === undefined || cameraData.indexesGPU.length !== cameras.length ) {

				const data = new Uint32Array( [ 0, 0, 0, 0 ] );
				const indexesGPU = [];

				for ( let i = 0, len = cameras.length; i < len; i ++ ) {

					const bufferGPU = gl.createBuffer();

					data[ 0 ] = i;

					gl.bindBuffer( gl.UNIFORM_BUFFER, bufferGPU );
					gl.bufferData( gl.UNIFORM_BUFFER, data, gl.STATIC_DRAW );

					indexesGPU.push( bufferGPU );

				}

				cameraData.indexesGPU = indexesGPU; // TODO: Create a global library for this

			}

			const cameraIndexData = this.get( cameraIndex );
			const pixelRatio = this.renderer.getPixelRatio();

			const renderTarget = this._currentContext.renderTarget;
			const isRenderCameraDepthArray = this._isRenderCameraDepthArray( this._currentContext );
			const prevActiveCubeFace = this._currentContext.activeCubeFace;

			if ( isRenderCameraDepthArray ) {

				// Clear the depth texture
				const textureData = this.get( renderTarget.depthTexture );

				if ( textureData.clearedRenderId !== this.renderer._nodes.nodeFrame.renderId ) {

					textureData.clearedRenderId = this.renderer._nodes.nodeFrame.renderId;

					const { stencilBuffer } = renderTarget;

					for ( let i = 0, len = cameras.length; i < len; i ++ ) {

						this.renderer._activeCubeFace = i;
						this._currentContext.activeCubeFace = i;

						this._setFramebuffer( this._currentContext );
						this.clear( false, true, stencilBuffer, this._currentContext, false, false );

					}

					this.renderer._activeCubeFace = prevActiveCubeFace;
					this._currentContext.activeCubeFace = prevActiveCubeFace;

				}

			}

			for ( let i = 0, len = cameras.length; i < len; i ++ ) {

				const subCamera = cameras[ i ];

				if ( object.layers.test( subCamera.layers ) ) {

					if ( isRenderCameraDepthArray ) {

						// Update the active layer
						this.renderer._activeCubeFace = i;
						this._currentContext.activeCubeFace = i;

						this._setFramebuffer( this._currentContext );

					}

					const vp = subCamera.viewport;

					if ( vp !== undefined ) {

						const x = vp.x * pixelRatio;
						const y = vp.y * pixelRatio;
						const width = vp.width * pixelRatio;
						const height = vp.height * pixelRatio;

						state.viewport(
							Math.floor( x ),
							Math.floor( renderObject.context.height - height - y ),
							Math.floor( width ),
							Math.floor( height )
						);

					}

					state.bindBufferBase( gl.UNIFORM_BUFFER, cameraIndexData.index, cameraData.indexesGPU[ i ] );

					draw();

				}

				this._currentContext.activeCubeFace = prevActiveCubeFace;
				this.renderer._activeCubeFace = prevActiveCubeFace;

			}

		} else {

			draw();

		}

	}

	/**
	 * Explain why always null is returned.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @return {boolean} Whether the render pipeline requires an update or not.
	 */
	needsRenderUpdate( /*renderObject*/ ) {

		return false;

	}

	/**
	 * Explain why no cache key is computed.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @return {string} The cache key.
	 */
	getRenderCacheKey( /*renderObject*/ ) {

		return '';

	}

	// textures

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
	 * @param {boolean} [isDefaultTexture=false] - Whether the texture uses a default GPU texture or not.
	 */
	destroyTexture( texture, isDefaultTexture = false ) {

		this.textureUtils.destroyTexture( texture, isDefaultTexture );

	}

	/**
	 * Returns texture data as a typed array.
	 *
	 * @async
	 * @param {Texture} texture - The texture to copy.
	 * @param {number} x - The x coordinate of the copy origin.
	 * @param {number} y - The y coordinate of the copy origin.
	 * @param {number} width - The width of the copy.
	 * @param {number} height - The height of the copy.
	 * @param {number} faceIndex - The face index.
	 * @return {Promise<TypedArray>} A Promise that resolves with a typed array when the copy operation has finished.
	 */
	async copyTextureToBuffer( texture, x, y, width, height, faceIndex ) {

		return this.textureUtils.copyTextureToBuffer( texture, x, y, width, height, faceIndex );

	}

	/**
	 * This method does nothing since WebGL 2 has no concept of samplers.
	 *
	 * @param {Texture} texture - The texture to update the sampler for.
	 * @return {string} The current sampler key.
	 */
	updateSampler( /*texture*/ ) {

		return '';

	}

	// node builder

	/**
	 * Returns a node builder for the given render object.
	 *
	 * @param {RenderObject} object - The render object.
	 * @param {Renderer} renderer - The renderer.
	 * @return {GLSLNodeBuilder} The node builder.
	 */
	createNodeBuilder( object, renderer ) {

		return new GLSLNodeBuilder( object, renderer );

	}

	// program

	/**
	 * Creates a shader program from the given programmable stage.
	 *
	 * @param {ProgrammableStage} program - The programmable stage.
	 */
	createProgram( program ) {

		const gl = this.gl;
		const { stage, code } = program;

		const shader = stage === 'fragment' ? gl.createShader( gl.FRAGMENT_SHADER ) : gl.createShader( gl.VERTEX_SHADER );

		gl.shaderSource( shader, code );
		gl.compileShader( shader );

		this.set( program, {
			shaderGPU: shader
		} );

	}

	/**
	 * Destroys the shader program of the given programmable stage.
	 *
	 * @param {ProgrammableStage} program - The programmable stage.
	 */
	destroyProgram( program ) {

		this.delete( program );

	}

	/**
	 * Creates a render pipeline for the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @param {Array<Promise>} promises - An array of compilation promises which are used in `compileAsync()`.
	 */
	createRenderPipeline( renderObject, promises ) {

		const gl = this.gl;
		const pipeline = renderObject.pipeline;

		// Program

		const { fragmentProgram, vertexProgram } = pipeline;

		const programGPU = gl.createProgram();

		const fragmentShader = this.get( fragmentProgram ).shaderGPU;
		const vertexShader = this.get( vertexProgram ).shaderGPU;

		gl.attachShader( programGPU, fragmentShader );
		gl.attachShader( programGPU, vertexShader );
		gl.linkProgram( programGPU );

		this.set( pipeline, {
			programGPU,
			fragmentShader,
			vertexShader
		} );

		if ( promises !== null && this.parallel ) {

			const p = new Promise( ( resolve /*, reject*/ ) => {

				const parallel = this.parallel;
				const checkStatus = () => {

					if ( gl.getProgramParameter( programGPU, parallel.COMPLETION_STATUS_KHR ) ) {

						this._completeCompile( renderObject, pipeline );
						resolve();

					} else {

						requestAnimationFrame( checkStatus );

					}

				};

				checkStatus();

			} );

			promises.push( p );

			return;

		}

		this._completeCompile( renderObject, pipeline );

	}

	/**
	 * Formats the source code of error messages.
	 *
	 * @private
	 * @param {string} string - The code.
	 * @param {number} errorLine - The error line.
	 * @return {string} The formatted code.
	 */
	_handleSource( string, errorLine ) {

		const lines = string.split( '\n' );
		const lines2 = [];

		const from = Math.max( errorLine - 6, 0 );
		const to = Math.min( errorLine + 6, lines.length );

		for ( let i = from; i < to; i ++ ) {

			const line = i + 1;
			lines2.push( `${line === errorLine ? '>' : ' '} ${line}: ${lines[ i ]}` );

		}

		return lines2.join( '\n' );

	}

	/**
	 * Gets the shader compilation errors from the info log.
	 *
	 * @private
	 * @param {WebGL2RenderingContext} gl - The rendering context.
	 * @param {WebGLShader} shader - The WebGL shader object.
	 * @param {string} type - The shader type.
	 * @return {string} The shader errors.
	 */
	_getShaderErrors( gl, shader, type ) {

		const status = gl.getShaderParameter( shader, gl.COMPILE_STATUS );

		const shaderInfoLog = gl.getShaderInfoLog( shader ) || '';
		const errors = shaderInfoLog.trim();

		if ( status && errors === '' ) return '';

		const errorMatches = /ERROR: 0:(\d+)/.exec( errors );
		if ( errorMatches ) {

			const errorLine = parseInt( errorMatches[ 1 ] );
			return type.toUpperCase() + '\n\n' + errors + '\n\n' + this._handleSource( gl.getShaderSource( shader ), errorLine );

		} else {

			return errors;

		}

	}

	/**
	 * Logs shader compilation errors.
	 *
	 * @private
	 * @param {WebGLProgram} programGPU - The WebGL program.
	 * @param {WebGLShader} glFragmentShader - The fragment shader as a native WebGL shader object.
	 * @param {WebGLShader} glVertexShader - The vertex shader as a native WebGL shader object.
	 */
	_logProgramError( programGPU, glFragmentShader, glVertexShader ) {

		if ( this.renderer.debug.checkShaderErrors ) {

			const gl = this.gl;

			const programInfoLog = gl.getProgramInfoLog( programGPU ) || '';
			const programLog = programInfoLog.trim();

			if ( gl.getProgramParameter( programGPU, gl.LINK_STATUS ) === false ) {

				if ( typeof this.renderer.debug.onShaderError === 'function' ) {

					this.renderer.debug.onShaderError( gl, programGPU, glVertexShader, glFragmentShader );

				} else {

					// default error reporting

					const vertexErrors = this._getShaderErrors( gl, glVertexShader, 'vertex' );
					const fragmentErrors = this._getShaderErrors( gl, glFragmentShader, 'fragment' );

					error(
						'THREE.WebGLProgram: Shader Error ' + gl.getError() + ' - ' +
						'VALIDATE_STATUS ' + gl.getProgramParameter( programGPU, gl.VALIDATE_STATUS ) + '\n\n' +
						'Program Info Log: ' + programLog + '\n' +
						vertexErrors + '\n' +
						fragmentErrors
					);

				}

			} else if ( programLog !== '' ) {

				warn( 'WebGLProgram: Program Info Log:', programLog );

			}

		}

	}

	/**
	 * Completes the shader program setup for the given render object.
	 *
	 * @private
	 * @param {RenderObject} renderObject - The render object.
	 * @param {RenderPipeline} pipeline - The render pipeline.
	 */
	_completeCompile( renderObject, pipeline ) {

		const { state, gl } = this;
		const pipelineData = this.get( pipeline );
		const { programGPU, fragmentShader, vertexShader } = pipelineData;

		if ( gl.getProgramParameter( programGPU, gl.LINK_STATUS ) === false ) {

			this._logProgramError( programGPU, fragmentShader, vertexShader );

		}

		state.useProgram( programGPU );

		// Bindings

		const bindings = renderObject.getBindings();

		this._setupBindings( bindings, programGPU );

		//

		this.set( pipeline, {
			programGPU
		} );

	}

	/**
	 * Creates a compute pipeline for the given compute node.
	 *
	 * @param {ComputePipeline} computePipeline - The compute pipeline.
	 * @param {Array<BindGroup>} bindings - The bindings.
	 */
	createComputePipeline( computePipeline, bindings ) {

		const { state, gl } = this;

		// Program

		const fragmentProgram = {
			stage: 'fragment',
			code: '#version 300 es\nprecision highp float;\nvoid main() {}'
		};

		this.createProgram( fragmentProgram );

		const { computeProgram } = computePipeline;

		const programGPU = gl.createProgram();

		const fragmentShader = this.get( fragmentProgram ).shaderGPU;
		const vertexShader = this.get( computeProgram ).shaderGPU;

		const transforms = computeProgram.transforms;

		const transformVaryingNames = [];
		const transformAttributeNodes = [];

		for ( let i = 0; i < transforms.length; i ++ ) {

			const transform = transforms[ i ];

			transformVaryingNames.push( transform.varyingName );
			transformAttributeNodes.push( transform.attributeNode );

		}

		gl.attachShader( programGPU, fragmentShader );
		gl.attachShader( programGPU, vertexShader );

		gl.transformFeedbackVaryings(
			programGPU,
			transformVaryingNames,
			gl.SEPARATE_ATTRIBS
		);

		gl.linkProgram( programGPU );

		if ( gl.getProgramParameter( programGPU, gl.LINK_STATUS ) === false ) {

			this._logProgramError( programGPU, fragmentShader, vertexShader );


		}

		state.useProgram( programGPU );

		// Bindings

		this._setupBindings( bindings, programGPU );

		const attributeNodes = computeProgram.attributes;
		const attributes = [];
		const transformBuffers = [];

		for ( let i = 0; i < attributeNodes.length; i ++ ) {

			const attribute = attributeNodes[ i ].node.attribute;

			attributes.push( attribute );

			if ( ! this.has( attribute ) ) this.attributeUtils.createAttribute( attribute, gl.ARRAY_BUFFER );

		}

		for ( let i = 0; i < transformAttributeNodes.length; i ++ ) {

			const attribute = transformAttributeNodes[ i ].attribute;

			if ( ! this.has( attribute ) ) this.attributeUtils.createAttribute( attribute, gl.ARRAY_BUFFER );

			const attributeData = this.get( attribute );

			transformBuffers.push( attributeData );

		}

		//

		this.set( computePipeline, {
			programGPU,
			transformBuffers,
			attributes
		} );

	}

	/**
	 * Creates bindings from the given bind group definition.
	 *
	 * @param {BindGroup} bindGroup - The bind group.
	 * @param {Array<BindGroup>} bindings - Array of bind groups.
	 * @param {number} cacheIndex - The cache index.
	 * @param {number} version - The version.
	 */
	createBindings( bindGroup, bindings /*, cacheIndex, version*/ ) {

		if ( this._knownBindings.has( bindings ) === false ) {

			this._knownBindings.add( bindings );

			let uniformBuffers = 0;
			let textures = 0;

			for ( const bindGroup of bindings ) {

				this.set( bindGroup, {
					textures: textures,
					uniformBuffers: uniformBuffers
				} );

				for ( const binding of bindGroup.bindings ) {

					if ( binding.isUniformBuffer ) uniformBuffers ++;
					if ( binding.isSampledTexture ) textures ++;

				}

			}

		}

		this.updateBindings( bindGroup, bindings );

	}

	/**
	 * Updates the given bind group definition.
	 *
	 * @param {BindGroup} bindGroup - The bind group.
	 * @param {Array<BindGroup>} bindings - Array of bind groups.
	 * @param {number} cacheIndex - The cache index.
	 * @param {number} version - The version.
	 */
	updateBindings( bindGroup /*, bindings, cacheIndex, version*/ ) {

		const { gl } = this;

		const bindGroupData = this.get( bindGroup );

		let i = bindGroupData.uniformBuffers;
		let t = bindGroupData.textures;

		for ( const binding of bindGroup.bindings ) {

			const map = this.get( binding );

			if ( binding.isUniformsGroup || binding.isUniformBuffer ) {

				const array = binding.buffer;
				let { bufferGPU } = this.get( array );

				if ( bufferGPU === undefined ) {

					// create

					bufferGPU = gl.createBuffer();

					gl.bindBuffer( gl.UNIFORM_BUFFER, bufferGPU );
					gl.bufferData( gl.UNIFORM_BUFFER, array.byteLength, gl.DYNAMIC_DRAW );

					this.set( array, { bufferGPU } );

				} else {

					gl.bindBuffer( gl.UNIFORM_BUFFER, bufferGPU );

				}

				// update

				const updateRanges = binding.updateRanges;

				gl.bindBuffer( gl.UNIFORM_BUFFER, bufferGPU );

				if ( updateRanges.length === 0 ) {

					gl.bufferData( gl.UNIFORM_BUFFER, array, gl.DYNAMIC_DRAW );

				} else {

					const isTyped = isTypedArray( array );
					const byteOffsetFactor = isTyped ? 1 : array.BYTES_PER_ELEMENT;

					for ( let i = 0, l = updateRanges.length; i < l; i ++ ) {

						const range = updateRanges[ i ];

						const dataOffset = range.start * byteOffsetFactor;
						const size = range.count * byteOffsetFactor;

						const bufferOffset = dataOffset * ( isTyped ? array.BYTES_PER_ELEMENT : 1 ); // bufferOffset is always in bytes

						gl.bufferSubData( gl.UNIFORM_BUFFER, bufferOffset, array, dataOffset, size );

					}

				}

				map.index = i ++;
				map.bufferGPU = bufferGPU;

				this.set( binding, map );

			} else if ( binding.isSampledTexture ) {

				const { textureGPU, glTextureType } = this.get( binding.texture );

				map.index = t ++;
				map.textureGPU = textureGPU;
				map.glTextureType = glTextureType;

				this.set( binding, map );

			}

		}

	}

	/**
	 * Updates a buffer binding.
	 *
	 *  @param {Buffer} binding - The buffer binding to update.
	 */
	updateBinding( binding ) {

		const gl = this.gl;

		if ( binding.isUniformsGroup || binding.isUniformBuffer ) {

			const bindingData = this.get( binding );
			const bufferGPU = bindingData.bufferGPU;
			const array = binding.buffer;

			const updateRanges = binding.updateRanges;

			gl.bindBuffer( gl.UNIFORM_BUFFER, bufferGPU );

			if ( updateRanges.length === 0 ) {

				gl.bufferData( gl.UNIFORM_BUFFER, array, gl.DYNAMIC_DRAW );

			} else {

				const isTyped = isTypedArray( array );
				const byteOffsetFactor = isTyped ? 1 : array.BYTES_PER_ELEMENT;

				for ( let i = 0, l = updateRanges.length; i < l; i ++ ) {

					const range = updateRanges[ i ];

					const dataOffset = range.start * byteOffsetFactor;
					const size = range.count * byteOffsetFactor;

					const bufferOffset = dataOffset * ( isTyped ? array.BYTES_PER_ELEMENT : 1 ); // bufferOffset is always in bytes

					gl.bufferSubData( gl.UNIFORM_BUFFER, bufferOffset, array, dataOffset, size );

				}

			}

		}

	}

	// attributes

	/**
	 * Creates the GPU buffer of an indexed shader attribute.
	 *
	 * @param {BufferAttribute} attribute - The indexed buffer attribute.
	 */
	createIndexAttribute( attribute ) {

		const gl = this.gl;

		this.attributeUtils.createAttribute( attribute, gl.ELEMENT_ARRAY_BUFFER );

	}

	/**
	 * Creates the GPU buffer of a shader attribute.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 */
	createAttribute( attribute ) {

		if ( this.has( attribute ) ) return;

		const gl = this.gl;

		this.attributeUtils.createAttribute( attribute, gl.ARRAY_BUFFER );

	}

	/**
	 * Creates the GPU buffer of a storage attribute.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 */
	createStorageAttribute( attribute ) {

		if ( this.has( attribute ) ) return;

		const gl = this.gl;

		this.attributeUtils.createAttribute( attribute, gl.ARRAY_BUFFER );

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

	/**
	 * Checks if the given feature is supported  by the backend.
	 *
	 * @param {string} name - The feature's name.
	 * @return {boolean} Whether the feature is supported or not.
	 */
	hasFeature( name ) {

		const keysMatching = Object.keys( GLFeatureName ).filter( key => GLFeatureName[ key ] === name );

		const extensions = this.extensions;

		for ( let i = 0; i < keysMatching.length; i ++ ) {

			if ( extensions.has( keysMatching[ i ] ) ) return true;

		}

		return false;

	}

	/**
	 * Returns the maximum anisotropy texture filtering value.
	 *
	 * @return {number} The maximum anisotropy texture filtering value.
	 */
	getMaxAnisotropy() {

		return this.capabilities.getMaxAnisotropy();

	}

	/**
	 * Copies data of the given source texture to the given destination texture.
	 *
	 * @param {Texture} srcTexture - The source texture.
	 * @param {Texture} dstTexture - The destination texture.
	 * @param {?(Box3|Box2)} [srcRegion=null] - The region of the source texture to copy.
	 * @param {?(Vector2|Vector3)} [dstPosition=null] - The destination position of the copy.
	 * @param {number} [srcLevel=0] - The source mip level to copy from.
	 * @param {number} [dstLevel=0] - The destination mip level to copy to.
	 */
	copyTextureToTexture( srcTexture, dstTexture, srcRegion = null, dstPosition = null, srcLevel = 0, dstLevel = 0 ) {

		this.textureUtils.copyTextureToTexture( srcTexture, dstTexture, srcRegion, dstPosition, srcLevel, dstLevel );

	}

	/**
	 * Copies the current bound framebuffer to the given texture.
	 *
	 * @param {Texture} texture - The destination texture.
	 * @param {RenderContext} renderContext - The render context.
	 * @param {Vector4} rectangle - A four dimensional vector defining the origin and dimension of the copy.
	 */
	copyFramebufferToTexture( texture, renderContext, rectangle ) {

		this.textureUtils.copyFramebufferToTexture( texture, renderContext, rectangle );

	}

	/**
	 * Configures the active framebuffer from the given render context.
	 *
	 * @private
	 * @param {RenderContext} descriptor - The render context.
	 */
	_setFramebuffer( descriptor ) {

		const { gl, state } = this;

		let currentFrameBuffer = null;

		if ( descriptor.textures !== null ) {

			const renderTarget = descriptor.renderTarget;
			const renderTargetContextData = this.get( renderTarget );
			const { samples, depthBuffer, stencilBuffer } = renderTarget;

			const isCube = renderTarget.isWebGLCubeRenderTarget === true;
			const isRenderTarget3D = renderTarget.isRenderTarget3D === true;
			const isRenderTargetArray = renderTarget.depth > 1;
			const isXRRenderTarget = renderTarget.isXRRenderTarget === true;
			const _hasExternalTextures = ( isXRRenderTarget === true && renderTarget._hasExternalTextures === true );

			let msaaFb = renderTargetContextData.msaaFrameBuffer;
			let depthRenderbuffer = renderTargetContextData.depthRenderbuffer;
			const multisampledRTTExt = this.extensions.get( 'WEBGL_multisampled_render_to_texture' );
			const multiviewExt = this.extensions.get( 'OVR_multiview2' );
			const useMultisampledRTT = this._useMultisampledExtension( renderTarget );
			const cacheKey = getCacheKey( descriptor );

			let fb;

			if ( isCube ) {

				renderTargetContextData.cubeFramebuffers || ( renderTargetContextData.cubeFramebuffers = {} );

				fb = renderTargetContextData.cubeFramebuffers[ cacheKey ];

			} else if ( isXRRenderTarget && _hasExternalTextures === false ) {

				fb = this._xrFramebuffer;

			} else {

				renderTargetContextData.framebuffers || ( renderTargetContextData.framebuffers = {} );

				fb = renderTargetContextData.framebuffers[ cacheKey ];

			}

			if ( fb === undefined ) {

				fb = gl.createFramebuffer();

				state.bindFramebuffer( gl.FRAMEBUFFER, fb );

				const textures = descriptor.textures;
				const depthInvalidationArray = [];

				if ( isCube ) {

					renderTargetContextData.cubeFramebuffers[ cacheKey ] = fb;

					const { textureGPU } = this.get( textures[ 0 ] );

					const cubeFace = this.renderer._activeCubeFace;
					const mipLevel = this.renderer._activeMipmapLevel;

					gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + cubeFace, textureGPU, mipLevel );

				} else {

					renderTargetContextData.framebuffers[ cacheKey ] = fb;

					for ( let i = 0; i < textures.length; i ++ ) {

						const texture = textures[ i ];
						const textureData = this.get( texture );
						textureData.renderTarget = descriptor.renderTarget;
						textureData.cacheKey = cacheKey; // required for copyTextureToTexture()

						const attachment = gl.COLOR_ATTACHMENT0 + i;

						if ( renderTarget.multiview ) {

							multiviewExt.framebufferTextureMultisampleMultiviewOVR( gl.FRAMEBUFFER, attachment, textureData.textureGPU, 0, samples, 0, 2 );

						} else if ( isRenderTarget3D || isRenderTargetArray ) {

							const layer = this.renderer._activeCubeFace;
							const mipLevel = this.renderer._activeMipmapLevel;

							gl.framebufferTextureLayer( gl.FRAMEBUFFER, attachment, textureData.textureGPU, mipLevel, layer );

						} else {

							if ( useMultisampledRTT ) {

								multisampledRTTExt.framebufferTexture2DMultisampleEXT( gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, textureData.textureGPU, 0, samples );

							} else {

								const mipLevel = this.renderer._activeMipmapLevel;

								gl.framebufferTexture2D( gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, textureData.textureGPU, mipLevel );

							}

						}

					}

				}

				const depthStyle = stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;

				if ( renderTarget._autoAllocateDepthBuffer === true ) {

					const renderbuffer = gl.createRenderbuffer();
					this.textureUtils.setupRenderBufferStorage( renderbuffer, descriptor, 0, useMultisampledRTT );
					renderTargetContextData.xrDepthRenderbuffer = renderbuffer;
					depthInvalidationArray.push( stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT );

					gl.bindRenderbuffer( gl.RENDERBUFFER, renderbuffer );
					gl.framebufferRenderbuffer( gl.FRAMEBUFFER, depthStyle, gl.RENDERBUFFER, renderbuffer );


				} else {

					if ( descriptor.depthTexture !== null ) {

						depthInvalidationArray.push( stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT );

						const textureData = this.get( descriptor.depthTexture );
						textureData.renderTarget = descriptor.renderTarget;
						textureData.cacheKey = cacheKey; // required for copyTextureToTexture()

						if ( renderTarget.multiview ) {

							multiviewExt.framebufferTextureMultisampleMultiviewOVR( gl.FRAMEBUFFER, depthStyle, textureData.textureGPU, 0, samples, 0, 2 );

						} else if ( _hasExternalTextures && useMultisampledRTT ) {

							multisampledRTTExt.framebufferTexture2DMultisampleEXT( gl.FRAMEBUFFER, depthStyle, gl.TEXTURE_2D, textureData.textureGPU, 0, samples );

						} else {

							if ( descriptor.depthTexture.isArrayTexture ) {

								const layer = this.renderer._activeCubeFace;

								gl.framebufferTextureLayer( gl.FRAMEBUFFER, depthStyle, textureData.textureGPU, 0, layer );

							} else if ( descriptor.depthTexture.isCubeTexture ) {

								const cubeFace = this.renderer._activeCubeFace;

								gl.framebufferTexture2D( gl.FRAMEBUFFER, depthStyle, gl.TEXTURE_CUBE_MAP_POSITIVE_X + cubeFace, textureData.textureGPU, 0 );

							} else {

								gl.framebufferTexture2D( gl.FRAMEBUFFER, depthStyle, gl.TEXTURE_2D, textureData.textureGPU, 0 );

							}

						}

					}

				}

				renderTargetContextData.depthInvalidationArray = depthInvalidationArray;


			} else {

				const isRenderCameraDepthArray = this._isRenderCameraDepthArray( descriptor );

				if ( isRenderCameraDepthArray ) {

					state.bindFramebuffer( gl.FRAMEBUFFER, fb );

					const layer = this.renderer._activeCubeFace;

					const depthData = this.get( descriptor.depthTexture );
					const depthStyle = stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;
					gl.framebufferTextureLayer(
						gl.FRAMEBUFFER,
						depthStyle,
						depthData.textureGPU,
						0,
						layer
					);

				}

				// rebind external XR textures

				if ( ( isXRRenderTarget || useMultisampledRTT || renderTarget.multiview ) && ( renderTarget._isOpaqueFramebuffer !== true ) ) {

					state.bindFramebuffer( gl.FRAMEBUFFER, fb );

					// rebind color

					const textureData = this.get( descriptor.textures[ 0 ] );

					if ( renderTarget.multiview ) {

						multiviewExt.framebufferTextureMultisampleMultiviewOVR( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, textureData.textureGPU, 0, samples, 0, 2 );

					} else if ( useMultisampledRTT ) {

						multisampledRTTExt.framebufferTexture2DMultisampleEXT( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureData.textureGPU, 0, samples );

					} else {

						gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureData.textureGPU, 0 );

					}

					// rebind depth

					const depthStyle = stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;

					if ( renderTarget._autoAllocateDepthBuffer === true ) {

						const renderbuffer = renderTargetContextData.xrDepthRenderbuffer;
						gl.bindRenderbuffer( gl.RENDERBUFFER, renderbuffer );
						gl.framebufferRenderbuffer( gl.FRAMEBUFFER, depthStyle, gl.RENDERBUFFER, renderbuffer );

					} else {

						const textureData = this.get( descriptor.depthTexture );

						if ( renderTarget.multiview ) {

							multiviewExt.framebufferTextureMultisampleMultiviewOVR( gl.FRAMEBUFFER, depthStyle, textureData.textureGPU, 0, samples, 0, 2 );

						} else if ( useMultisampledRTT ) {

							multisampledRTTExt.framebufferTexture2DMultisampleEXT( gl.FRAMEBUFFER, depthStyle, gl.TEXTURE_2D, textureData.textureGPU, 0, samples );

						} else {

							gl.framebufferTexture2D( gl.FRAMEBUFFER, depthStyle, gl.TEXTURE_2D, textureData.textureGPU, 0 );

						}

					}

				}

			}

			if ( samples > 0 && useMultisampledRTT === false && ! renderTarget.multiview ) {

				if ( msaaFb === undefined ) {

					const invalidationArray = [];

					msaaFb = gl.createFramebuffer();

					state.bindFramebuffer( gl.FRAMEBUFFER, msaaFb );

					const msaaRenderbuffers = [];

					const textures = descriptor.textures;

					for ( let i = 0; i < textures.length; i ++ ) {

						msaaRenderbuffers[ i ] = gl.createRenderbuffer();

						gl.bindRenderbuffer( gl.RENDERBUFFER, msaaRenderbuffers[ i ] );

						invalidationArray.push( gl.COLOR_ATTACHMENT0 + i );

						const texture = descriptor.textures[ i ];
						const textureData = this.get( texture );

						gl.renderbufferStorageMultisample( gl.RENDERBUFFER, samples, textureData.glInternalFormat, descriptor.width, descriptor.height );
						gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.RENDERBUFFER, msaaRenderbuffers[ i ] );


					}

					gl.bindRenderbuffer( gl.RENDERBUFFER, null );

					renderTargetContextData.msaaFrameBuffer = msaaFb;
					renderTargetContextData.msaaRenderbuffers = msaaRenderbuffers;

					if ( depthBuffer && depthRenderbuffer === undefined ) {

						depthRenderbuffer = gl.createRenderbuffer();
						this.textureUtils.setupRenderBufferStorage( depthRenderbuffer, descriptor, samples );

						renderTargetContextData.depthRenderbuffer = depthRenderbuffer;

						const depthStyle = stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;
						invalidationArray.push( depthStyle );

					}

					renderTargetContextData.invalidationArray = invalidationArray;

				}

				currentFrameBuffer = renderTargetContextData.msaaFrameBuffer;

			} else {

				currentFrameBuffer = fb;

			}

			state.drawBuffers( descriptor, fb );

		}

		state.bindFramebuffer( gl.FRAMEBUFFER, currentFrameBuffer );

	}

	/**
	 * Computes the VAO key for the given index and attributes.
	 *
	 * @private
	 * @param {Array<BufferAttribute>} attributes - An array of buffer attributes.
	 * @return {string} The VAO key.
	 */
	_getVaoKey( attributes ) {

		let key = '';

		for ( let i = 0; i < attributes.length; i ++ ) {

			const attributeData = this.get( attributes[ i ] );

			key += ':' + attributeData.id;

		}

		return key;

	}

	/**
	 * Creates a VAO from the index and attributes.
	 *
	 * @private
	 * @param {Array<BufferAttribute>} attributes - An array of buffer attributes.
	 * @return {Object} The VAO data.
	 */
	_createVao( attributes ) {

		const { gl } = this;

		const vaoGPU = gl.createVertexArray();

		gl.bindVertexArray( vaoGPU );

		for ( let i = 0; i < attributes.length; i ++ ) {

			const attribute = attributes[ i ];
			const attributeData = this.get( attribute );

			gl.bindBuffer( gl.ARRAY_BUFFER, attributeData.bufferGPU );
			gl.enableVertexAttribArray( i );

			let stride, offset;

			if ( attribute.isInterleavedBufferAttribute === true ) {

				stride = attribute.data.stride * attributeData.bytesPerElement;
				offset = attribute.offset * attributeData.bytesPerElement;

			} else {

				stride = 0;
				offset = 0;

			}

			if ( attributeData.isInteger ) {

				gl.vertexAttribIPointer( i, attribute.itemSize, attributeData.type, stride, offset );

			} else {

				gl.vertexAttribPointer( i, attribute.itemSize, attributeData.type, attribute.normalized, stride, offset );

			}

			if ( attribute.isInstancedBufferAttribute && ! attribute.isInterleavedBufferAttribute ) {

				gl.vertexAttribDivisor( i, attribute.meshPerAttribute );

			} else if ( attribute.isInterleavedBufferAttribute && attribute.data.isInstancedInterleavedBuffer ) {

				gl.vertexAttribDivisor( i, attribute.data.meshPerAttribute );

			}

		}

		gl.bindBuffer( gl.ARRAY_BUFFER, null );

		return vaoGPU;

	}

	/**
	 * Creates a transform feedback from the given transform buffers.
	 *
	 * @private
	 * @param {Array<DualAttributeData>} transformBuffers - The transform buffers.
	 * @return {WebGLTransformFeedback} The transform feedback.
	 */
	_getTransformFeedback( transformBuffers ) {

		let key = '';

		for ( let i = 0; i < transformBuffers.length; i ++ ) {

			key += ':' + transformBuffers[ i ].id;

		}

		let transformFeedbackGPU = this.transformFeedbackCache[ key ];

		if ( transformFeedbackGPU !== undefined ) {

			return transformFeedbackGPU;

		}

		const { gl } = this;

		transformFeedbackGPU = gl.createTransformFeedback();

		gl.bindTransformFeedback( gl.TRANSFORM_FEEDBACK, transformFeedbackGPU );

		for ( let i = 0; i < transformBuffers.length; i ++ ) {

			const attributeData = transformBuffers[ i ];

			gl.bindBufferBase( gl.TRANSFORM_FEEDBACK_BUFFER, i, attributeData.transformBuffer );

		}

		gl.bindTransformFeedback( gl.TRANSFORM_FEEDBACK, null );

		this.transformFeedbackCache[ key ] = transformFeedbackGPU;

		return transformFeedbackGPU;

	}

	/**
	 * Setups the given bindings.
	 *
	 * @private
	 * @param {Array<BindGroup>} bindings - The bindings.
	 * @param {WebGLProgram} programGPU - The WebGL program.
	 */
	_setupBindings( bindings, programGPU ) {

		const gl = this.gl;

		for ( const bindGroup of bindings ) {

			for ( const binding of bindGroup.bindings ) {

				const bindingData = this.get( binding );
				const index = bindingData.index;

				if ( binding.isUniformsGroup || binding.isUniformBuffer ) {

					const location = gl.getUniformBlockIndex( programGPU, binding.name );
					gl.uniformBlockBinding( programGPU, location, index );

				} else if ( binding.isSampledTexture ) {

					const location = gl.getUniformLocation( programGPU, binding.name );
					gl.uniform1i( location, index );

				}

			}

		}

	}

	/**
	 * Binds the given uniforms.
	 *
	 * @private
	 * @param {Array<BindGroup>} bindings - The bindings.
	 */
	_bindUniforms( bindings ) {

		const { gl, state } = this;

		for ( const bindGroup of bindings ) {

			for ( const binding of bindGroup.bindings ) {

				const bindingData = this.get( binding );
				const index = bindingData.index;

				if ( binding.isUniformsGroup || binding.isUniformBuffer ) {

					// TODO USE bindBufferRange to group multiple uniform buffers
					state.bindBufferBase( gl.UNIFORM_BUFFER, index, bindingData.bufferGPU );

				} else if ( binding.isSampledTexture ) {

					state.bindTexture( bindingData.glTextureType, bindingData.textureGPU, gl.TEXTURE0 + index );

				}

			}

		}

	}

	/**
	 * The method ensures multisampled render targets are resolved.
	 *
	 * @private
	 * @param {RenderContext} renderContext - The render context.
	 */
	_resolveRenderTarget( renderContext ) {

		const { gl, state } = this;

		const renderTarget = renderContext.renderTarget;

		if ( renderContext.textures !== null && renderTarget ) {

			const renderTargetContextData = this.get( renderTarget );

			if ( renderTarget.samples > 0 && this._useMultisampledExtension( renderTarget ) === false ) {

				const fb = renderTargetContextData.framebuffers[ renderContext.getCacheKey() ];

				let mask = gl.COLOR_BUFFER_BIT;

				if ( renderTarget.resolveDepthBuffer ) {

					if ( renderTarget.depthBuffer ) mask |= gl.DEPTH_BUFFER_BIT;
					if ( renderTarget.stencilBuffer && renderTarget.resolveStencilBuffer ) mask |= gl.STENCIL_BUFFER_BIT;

				}

				const msaaFrameBuffer = renderTargetContextData.msaaFrameBuffer;
				const msaaRenderbuffers = renderTargetContextData.msaaRenderbuffers;

				const textures = renderContext.textures;
				const isMRT = textures.length > 1;

				state.bindFramebuffer( gl.READ_FRAMEBUFFER, msaaFrameBuffer );
				state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, fb );

				if ( isMRT ) {

					// blitFramebuffer() can only copy/resolve the first color attachment of a framebuffer. When using MRT,
					// the engine temporarily removes all attachments and then configures each attachment for the resolve.

					for ( let i = 0; i < textures.length; i ++ ) {

						gl.framebufferRenderbuffer( gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.RENDERBUFFER, null );
						gl.framebufferTexture2D( gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, null, 0 );

					}

				}

				for ( let i = 0; i < textures.length; i ++ ) {

					if ( isMRT ) {

						// configure attachment for resolve

						const { textureGPU } = this.get( textures[ i ] );

						gl.framebufferRenderbuffer( gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, msaaRenderbuffers[ i ] );
						gl.framebufferTexture2D( gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureGPU, 0 );

					}

					if ( renderContext.scissor ) {

						const { x, y, width, height } = renderContext.scissorValue;

						const viewY = renderContext.height - height - y;

						gl.blitFramebuffer( x, viewY, x + width, viewY + height, x, viewY, x + width, viewY + height, mask, gl.NEAREST );

					} else {

						gl.blitFramebuffer( 0, 0, renderContext.width, renderContext.height, 0, 0, renderContext.width, renderContext.height, mask, gl.NEAREST );

					}

				}

				if ( isMRT ) {

					// restore attachments

					for ( let i = 0; i < textures.length; i ++ ) {

						const { textureGPU } = this.get( textures[ i ] );

						gl.framebufferRenderbuffer( gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.RENDERBUFFER, msaaRenderbuffers[ i ] );
						gl.framebufferTexture2D( gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, textureGPU, 0 );

					}

				}

				if ( this._supportsInvalidateFramebuffer === true ) {

					gl.invalidateFramebuffer( gl.READ_FRAMEBUFFER, renderTargetContextData.invalidationArray );

				}

			} else if ( renderTarget.resolveDepthBuffer === false && renderTargetContextData.framebuffers ) {

				const fb = renderTargetContextData.framebuffers[ renderContext.getCacheKey() ];
				state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, fb );
				gl.invalidateFramebuffer( gl.DRAW_FRAMEBUFFER, renderTargetContextData.depthInvalidationArray );

			}

		}

	}

	/**
	 * Returns `true` if the `WEBGL_multisampled_render_to_texture` extension
	 * should be used when MSAA is enabled.
	 *
	 * @private
	 * @param {RenderTarget} renderTarget - The render target that should be multisampled.
	 * @return {boolean} Whether to use the `WEBGL_multisampled_render_to_texture` extension for MSAA or not.
	 */
	_useMultisampledExtension( renderTarget ) {

		if ( renderTarget.multiview === true ) {

			return true;

		}

		return renderTarget.samples > 0 && this.extensions.has( 'WEBGL_multisampled_render_to_texture' ) === true && renderTarget._autoAllocateDepthBuffer !== false;

	}

	/**
	 * Frees internal resources.
	 */
	dispose() {

		if ( this.textureUtils !== null ) this.textureUtils.dispose();

		const extension = this.extensions.get( 'WEBGL_lose_context' );
		if ( extension ) extension.loseContext();

		this.renderer.domElement.removeEventListener( 'webglcontextlost', this._onContextLost );

	}

}

export default WebGLBackend;
