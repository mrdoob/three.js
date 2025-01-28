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

import { warnOnce } from '../../utils.js';
import { WebGLCoordinateSystem } from '../../constants.js';
import WebGLTimestampQueryPool from './utils/WebGLTimestampQueryPool.js';

/**
 * A backend implementation targeting WebGL 2.
 *
 * @private
 * @augments Backend
 */
class WebGLBackend extends Backend {

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
	 * @param {WebGL2RenderingContext} [parameters.context=undefined] - A WebGL 2 rendering context.
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
		this.isWebGLBackend = true;

		/**
		 * A reference to a backend module holding shader attribute-related
		 * utility functions.
		 *
		 * @type {WebGLAttributeUtils?}
		 * @default null
		 */
		this.attributeUtils = null;

		/**
		 * A reference to a backend module holding extension-related
		 * utility functions.
		 *
		 * @type {WebGLExtensions?}
		 * @default null
		 */
		this.extensions = null;

		/**
		 * A reference to a backend module holding capability-related
		 * utility functions.
		 *
		 * @type {WebGLCapabilities?}
		 * @default null
		 */
		this.capabilities = null;

		/**
		 * A reference to a backend module holding texture-related
		 * utility functions.
		 *
		 * @type {WebGLTextureUtils?}
		 * @default null
		 */
		this.textureUtils = null;

		/**
		 * A reference to a backend module holding renderer-related
		 * utility functions.
		 *
		 * @type {WebGLBufferRenderer?}
		 * @default null
		 */
		this.bufferRenderer = null;

		/**
		 * A reference to the rendering context.
		 *
		 * @type {WebGL2RenderingContext?}
		 * @default null
		 */
		this.gl = null;

		/**
		 * A reference to a backend module holding state-related
		 * utility functions.
		 *
		 * @type {WebGLState?}
		 * @default null
		 */
		this.state = null;

		/**
		 * A reference to a backend module holding common
		 * utility functions.
		 *
		 * @type {WebGLUtils?}
		 * @default null
		 */
		this.utils = null;

		/**
		 * Dictionary for caching VAOs.
		 *
		 * @type {Object<String,WebGLVertexArrayObject>}
		 */
		this.vaoCache = {};

		/**
		 * Dictionary for caching transform feedback objects.
		 *
		 * @type {Object<String,WebGLTransformFeedback>}
		 */
		this.transformFeedbackCache = {};

		/**
		 * Controls if `gl.RASTERIZER_DISCARD` should be enabled or not.
		 * Only relevant when using compute shaders.
		 *
		 * @type {Boolean}
		 * @default false
		 */
		this.discard = false;

		/**
		 * A reference to the `EXT_disjoint_timer_query_webgl2` extension. `null` if the
		 * device does not support the extension.
		 *
		 * @type {EXTDisjointTimerQueryWebGL2?}
		 * @default null
		 */
		this.disjoint = null;

		/**
		* A reference to the `KHR_parallel_shader_compile` extension. `null` if the
		* device does not support the extension.
		*
		* @type {KHRParallelShaderCompile?}
		* @default null
		*/
		this.parallel = null;

		/**
		 * Whether to track timestamps with a Timestamp Query API or not.
		 *
		 * @type {Boolean}
		 * @default false
		 */
		this.trackTimestamp = ( parameters.trackTimestamp === true );

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
		 * @type {WeakSet}
		 */
		this._knownBindings = new WeakSet();

		/**
		 * The target framebuffer when rendering with
		 * the WebXR device API.
		 *
		 * @private
		 * @type {WebGLFramebuffer}
		 * @default null
		 */
		this._xrFamebuffer = null;

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
			antialias: false, // MSAA is applied via a custom renderbuffer
			alpha: true, // always true for performance reasons
			depth: false, // depth and stencil are set to false since the engine always renders into a framebuffer target first
			stencil: false
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

		this.disjoint = this.extensions.get( 'EXT_disjoint_timer_query_webgl2' );
		this.parallel = this.extensions.get( 'KHR_parallel_shader_compile' );

	}

	/**
	 * The coordinate system of the backend.
	 *
	 * @type {Number}
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
	 * Can be used to synchronize CPU operations with GPU tasks. So when this method is called,
	 * the CPU waits for the GPU to complete its operation (e.g. a compute task).
	 *
	 * @async
	 * @return {Promise} A Promise that resolves when synchronization has been finished.
	 */
	async waitForGPU() {

		await this.utils._clientWaitAsync();

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
	 * @param {WebGLFramebuffer} xrFamebuffer - The XR framebuffer.
	 */
	setXRTarget( xrFamebuffer ) {

		this._xrFamebuffer = xrFamebuffer;

	}

	/**
	 * Configures the given XR render target with external textures.
	 *
	 * This method is only relevant when using the WebXR Layers API.
	 *
	 * @param {XRRenderTarget} renderTarget - The XR render target.
	 * @param {WebGLTexture} colorTexture - A native color texture.
	 * @param {WebGLTexture?} [depthTexture=null] - A native depth texture.
	 */
	setXRRenderTargetTextures( renderTarget, colorTexture, depthTexture = null ) {

		const gl = this.gl;

		this.set( renderTarget.texture, { textureGPU: colorTexture, glInternalFormat: gl.RGBA8 } ); // see #24698 why RGBA8 and not SRGB8_ALPHA8 is used

		if ( depthTexture !== null ) {

			const glInternalFormat = renderTarget.stencilBuffer ? gl.DEPTH24_STENCIL8 : gl.DEPTH_COMPONENT24;

			this.set( renderTarget.depthTexture, { textureGPU: depthTexture, glInternalFormat: glInternalFormat } );

			renderTarget.autoAllocateDepthBuffer = false;

			// The multisample_render_to_texture extension doesn't work properly if there
			// are midframe flushes and an external depth texture.
			if ( this.extensions.has( 'WEBGL_multisampled_render_to_texture' ) === true ) {

				console.warn( 'THREE.WebGLBackend: Render-to-texture extension was disabled because an external texture was provided' );

			}

		}

	}

	/**
	 * Inits a time stamp query for the given render context.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 */
	initTimestampQuery( renderContext ) {

		if ( ! this.disjoint || ! this.trackTimestamp ) return;

		const type = renderContext.isComputeNode ? 'compute' : 'render';

		if ( ! this.timestampQueryPool[ type ] ) {

			// TODO: Variable maxQueries?
			this.timestampQueryPool[ type ] = new WebGLTimestampQueryPool( this.gl, type, 2048 );

		}

		const timestampQueryPool = this.timestampQueryPool[ type ];

		const baseOffset = timestampQueryPool.allocateQueriesForContext( renderContext );

		if ( baseOffset !== null ) {

			timestampQueryPool.beginQuery( renderContext );

		}

	}

	// timestamp utils

	/**
	 * Prepares the timestamp buffer.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 */
	prepareTimestampBuffer( renderContext ) {

		if ( ! this.disjoint || ! this.trackTimestamp ) return;

		const type = renderContext.isComputeNode ? 'compute' : 'render';
		const timestampQueryPool = this.timestampQueryPool[ type ];

		timestampQueryPool.endQuery( renderContext );

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

		const { state, gl } = this;
		const renderContextData = this.get( renderContext );

		//

		//

		this.initTimestampQuery( renderContext );

		renderContextData.previousContext = this._currentContext;
		this._currentContext = renderContext;

		this._setFramebuffer( renderContext );

		this.clear( renderContext.clearColor, renderContext.clearDepth, renderContext.clearStencil, renderContext, false );

		//
		if ( renderContext.viewport ) {

			this.updateViewport( renderContext );

		} else {

			state.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );

		}

		if ( renderContext.scissor ) {

			const { x, y, width, height } = renderContext.scissorValue;

			state.scissor( x, renderContext.height - height - y, width, height );

		}

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

		if ( renderContext.textures !== null && renderContext.renderTarget ) {

			const renderTargetContextData = this.get( renderContext.renderTarget );

			const { samples } = renderContext.renderTarget;

			if ( samples > 0 && this._useMultisampledRTT( renderContext.renderTarget ) === false ) {

				const fb = renderTargetContextData.framebuffers[ renderContext.getCacheKey() ];

				const mask = gl.COLOR_BUFFER_BIT;

				const msaaFrameBuffer = renderTargetContextData.msaaFrameBuffer;

				const textures = renderContext.textures;

				state.bindFramebuffer( gl.READ_FRAMEBUFFER, msaaFrameBuffer );
				state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, fb );

				for ( let i = 0; i < textures.length; i ++ ) {

					// TODO Add support for MRT

					if ( renderContext.scissor ) {

						const { x, y, width, height } = renderContext.scissorValue;

						const viewY = renderContext.height - height - y;

						gl.blitFramebuffer( x, viewY, x + width, viewY + height, x, viewY, x + width, viewY + height, mask, gl.NEAREST );
						gl.invalidateSubFramebuffer( gl.READ_FRAMEBUFFER, renderTargetContextData.invalidationArray, x, viewY, width, height );

					} else {

						gl.blitFramebuffer( 0, 0, renderContext.width, renderContext.height, 0, 0, renderContext.width, renderContext.height, mask, gl.NEAREST );
						gl.invalidateFramebuffer( gl.READ_FRAMEBUFFER, renderTargetContextData.invalidationArray );

					}

				}

			}


		}

		if ( previousContext !== null ) {

			this._setFramebuffer( previousContext );

			if ( previousContext.viewport ) {

				this.updateViewport( previousContext );

			} else {

				state.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );

			}

		}

		this.prepareTimestampBuffer( renderContext );

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
	 * @return {Boolean} Whether the 3D object is fully occluded or not.
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
	 * @param {Boolean} boolean - Whether the scissor test should be enabled or not.
	 */
	setScissorTest( boolean ) {

		const state = this.state;

		state.setScissorTest( boolean );

	}

	/**
	 * Performs a clear operation.
	 *
	 * @param {Boolean} color - Whether the color buffer should be cleared or not.
	 * @param {Boolean} depth - Whether the depth buffer should be cleared or not.
	 * @param {Boolean} stencil - Whether the stencil buffer should be cleared or not.
	 * @param {Object?} [descriptor=null] - The render context of the current set render target.
	 * @param {Boolean} [setFrameBuffer=true] - TODO.
	 */
	clear( color, depth, stencil, descriptor = null, setFrameBuffer = true ) {

		const { gl } = this;

		if ( descriptor === null ) {

			const clearColor = this.getClearColor();

			// premultiply alpha

			clearColor.r *= clearColor.a;
			clearColor.g *= clearColor.a;
			clearColor.b *= clearColor.a;

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

				// premultiply alpha

				clearColor.r *= clearColor.a;
				clearColor.g *= clearColor.a;
				clearColor.b *= clearColor.a;

			}

			if ( depth ) this.state.setDepthMask( true );

			if ( descriptor.textures === null ) {

				gl.clearColor( clearColor.r, clearColor.g, clearColor.b, clearColor.a );
				gl.clear( clear );

			} else {

				if ( setFrameBuffer ) this._setFramebuffer( descriptor );

				if ( color ) {

					for ( let i = 0; i < descriptor.textures.length; i ++ ) {

						gl.clearBufferfv( gl.COLOR, i, [ clearColor.r, clearColor.g, clearColor.b, clearColor.a ] );

					}

				}

				if ( depth && stencil ) {

					gl.clearBufferfi( gl.DEPTH_STENCIL, 0, 1, 0 );

				} else if ( depth ) {

					gl.clearBufferfv( gl.DEPTH, 0, [ 1.0 ] );

				} else if ( stencil ) {

					gl.clearBufferiv( gl.STENCIL, 0, [ 0 ] );

				}

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

		state.bindFramebuffer( gl.FRAMEBUFFER, null );
		this.initTimestampQuery( computeGroup );

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

		const { state, gl } = this;

		if ( this.discard === false ) {

			// required here to handle async behaviour of render.compute()
			gl.enable( gl.RASTERIZER_DISCARD );
			this.discard = true;

		}

		const { programGPU, transformBuffers, attributes } = this.get( pipeline );

		const vaoKey = this._getVaoKey( null, attributes );

		const vaoGPU = this.vaoCache[ vaoKey ];

		if ( vaoGPU === undefined ) {

			this._createVao( null, attributes );

		} else {

			gl.bindVertexArray( vaoGPU );

		}

		state.useProgram( programGPU );

		this._bindUniforms( bindings );

		const transformFeedbackGPU = this._getTransformFeedback( transformBuffers );

		gl.bindTransformFeedback( gl.TRANSFORM_FEEDBACK, transformFeedbackGPU );
		gl.beginTransformFeedback( gl.POINTS );

		if ( attributes[ 0 ].isStorageInstancedBufferAttribute ) {

			gl.drawArraysInstanced( gl.POINTS, 0, 1, computeNode.count );

		} else {

			gl.drawArrays( gl.POINTS, 0, computeNode.count );

		}

		gl.endTransformFeedback();
		gl.bindTransformFeedback( gl.TRANSFORM_FEEDBACK, null );

		// switch active buffers

		for ( let i = 0; i < transformBuffers.length; i ++ ) {

			const dualAttributeData = transformBuffers[ i ];

			if ( dualAttributeData.pbo ) {

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

		const gl = this.gl;

		this.discard = false;

		gl.disable( gl.RASTERIZER_DISCARD );

		this.prepareTimestampBuffer( computeGroup );

		if ( this._currentContext ) {

			this._setFramebuffer( this._currentContext );

		}

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

		state.useProgram( programGPU );

		//

		const renderObjectData = this.get( renderObject );

		let vaoGPU = renderObjectData.staticVao;

		if ( vaoGPU === undefined || renderObjectData.geometryId !== renderObject.geometry.id ) {

			const vaoKey = this._getVaoKey( renderObject.getIndex(), renderObject.getAttributes() );

			vaoGPU = this.vaoCache[ vaoKey ];

			if ( vaoGPU === undefined ) {

				let staticVao;

				( { vaoGPU, staticVao } = this._createVao( renderObject.getIndex(), renderObject.getAttributes() ) );

				if ( staticVao ) {

					renderObjectData.staticVao = vaoGPU;
					renderObjectData.geometryId = renderObject.geometry.id;

				}

			}

		}

		gl.bindVertexArray( vaoGPU );

		//

		const index = renderObject.getIndex();

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

					renderer.renderMultiDrawInstances( object._multiDrawStarts, object._multiDrawCounts, object._multiDrawCount, object._multiDrawInstances );

				} else if ( ! this.hasFeature( 'WEBGL_multi_draw' ) ) {

					warnOnce( 'THREE.WebGLRenderer: WEBGL_multi_draw not supported.' );

				} else {

					renderer.renderMultiDraw( object._multiDrawStarts, object._multiDrawCounts, object._multiDrawCount );

				}

			} else if ( instanceCount > 1 ) {

				renderer.renderInstances( firstVertex, vertexCount, instanceCount );

			} else {

				renderer.render( firstVertex, vertexCount );

			}

		};

		if ( renderObject.camera.isArrayCamera && renderObject.camera.cameras.length > 0 ) {

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

			for ( let i = 0, len = cameras.length; i < len; i ++ ) {

				const subCamera = cameras[ i ];

				if ( object.layers.test( subCamera.layers ) ) {

					const vp = subCamera.viewport;

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

					state.bindBufferBase( gl.UNIFORM_BUFFER, cameraIndexData.index, cameraData.indexesGPU[ i ] );

					draw();

				}

			}

		} else {

			draw();

		}

		//

		gl.bindVertexArray( null );

	}

	/**
	 * Explain why always null is returned.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @return {Boolean} Whether the render pipeline requires an update or not.
	 */
	needsRenderUpdate( /*renderObject*/ ) {

		return false;

	}

	/**
	 * Explain why no cache key is computed.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @return {String} The cache key.
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
	 * This method does nothing since WebGL 2 has no concept of samplers.
	 *
	 * @param {Texture} texture - The texture to create the sampler for.
	 */
	createSampler( /*texture*/ ) {

		//console.warn( 'Abstract class.' );

	}

	/**
	 * This method does nothing since WebGL 2 has no concept of samplers.
	 *
	 * @param {Texture} texture - The texture to destroy the sampler for.
	 */
	destroySampler( /*texture*/ ) {}

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
	 * @param {String} string - The code.
	 * @param {Number} errorLine - The error line.
	 * @return {String} The formatted code.
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
	 * @param {String} type - The shader type.
	 * @return {String} The shader errors.
	 */
	_getShaderErrors( gl, shader, type ) {

		const status = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
		const errors = gl.getShaderInfoLog( shader ).trim();

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

			const programLog = gl.getProgramInfoLog( programGPU ).trim();

			if ( gl.getProgramParameter( programGPU, gl.LINK_STATUS ) === false ) {


				if ( typeof this.renderer.debug.onShaderError === 'function' ) {

					this.renderer.debug.onShaderError( gl, programGPU, glVertexShader, glFragmentShader );

				} else {

					// default error reporting

					const vertexErrors = this._getShaderErrors( gl, glVertexShader, 'vertex' );
					const fragmentErrors = this._getShaderErrors( gl, glFragmentShader, 'fragment' );

					console.error(
						'THREE.WebGLProgram: Shader Error ' + gl.getError() + ' - ' +
						'VALIDATE_STATUS ' + gl.getProgramParameter( programGPU, gl.VALIDATE_STATUS ) + '\n\n' +
						'Program Info Log: ' + programLog + '\n' +
						vertexErrors + '\n' +
						fragmentErrors
					);

				}

			} else if ( programLog !== '' ) {

				console.warn( 'THREE.WebGLProgram: Program Info Log:', programLog );

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
	 * @param {Number} cacheIndex - The cache index.
	 * @param {Number} version - The version.
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
	 * @param {Number} cacheIndex - The cache index.
	 * @param {Number} version - The version.
	 */
	updateBindings( bindGroup /*, bindings, cacheIndex, version*/ ) {

		const { gl } = this;

		const bindGroupData = this.get( bindGroup );

		let i = bindGroupData.uniformBuffers;
		let t = bindGroupData.textures;

		for ( const binding of bindGroup.bindings ) {

			if ( binding.isUniformsGroup || binding.isUniformBuffer ) {

				const data = binding.buffer;
				const bufferGPU = gl.createBuffer();

				gl.bindBuffer( gl.UNIFORM_BUFFER, bufferGPU );
				gl.bufferData( gl.UNIFORM_BUFFER, data, gl.DYNAMIC_DRAW );

				this.set( binding, {
					index: i ++,
					bufferGPU
				} );

			} else if ( binding.isSampledTexture ) {

				const { textureGPU, glTextureType } = this.get( binding.texture );

				this.set( binding, {
					index: t ++,
					textureGPU,
					glTextureType
				} );

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
			const data = binding.buffer;

			gl.bindBuffer( gl.UNIFORM_BUFFER, bufferGPU );
			gl.bufferData( gl.UNIFORM_BUFFER, data, gl.DYNAMIC_DRAW );

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
	 * @param {String} name - The feature's name.
	 * @return {Boolean} Whether the feature is supported or not.
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
	 * @return {Number} The maximum anisotropy texture filtering value.
	 */
	getMaxAnisotropy() {

		return this.capabilities.getMaxAnisotropy();

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

		this.textureUtils.copyTextureToTexture( srcTexture, dstTexture, srcRegion, dstPosition, level );

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
			const isRenderTargetArray = renderTarget.isRenderTargetArray === true;
			const isXRRenderTarget = renderTarget.isXRRenderTarget === true;
			const hasExternalTextures = ( isXRRenderTarget === true && renderTarget.hasExternalTextures === true );

			let msaaFb = renderTargetContextData.msaaFrameBuffer;
			let depthRenderbuffer = renderTargetContextData.depthRenderbuffer;
			const multisampledRTTExt = this.extensions.get( 'WEBGL_multisampled_render_to_texture' );
			const useMultisampledRTT = this._useMultisampledRTT( renderTarget );

			const cacheKey = getCacheKey( descriptor );

			let fb;

			if ( isCube ) {

				renderTargetContextData.cubeFramebuffers || ( renderTargetContextData.cubeFramebuffers = {} );

				fb = renderTargetContextData.cubeFramebuffers[ cacheKey ];

			} else if ( isXRRenderTarget && hasExternalTextures === false ) {

				fb = this._xrFamebuffer;

			} else {

				renderTargetContextData.framebuffers || ( renderTargetContextData.framebuffers = {} );

				fb = renderTargetContextData.framebuffers[ cacheKey ];

			}

			if ( fb === undefined ) {

				fb = gl.createFramebuffer();

				state.bindFramebuffer( gl.FRAMEBUFFER, fb );

				const textures = descriptor.textures;

				if ( isCube ) {

					renderTargetContextData.cubeFramebuffers[ cacheKey ] = fb;

					const { textureGPU } = this.get( textures[ 0 ] );

					const cubeFace = this.renderer._activeCubeFace;

					gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + cubeFace, textureGPU, 0 );

				} else {

					renderTargetContextData.framebuffers[ cacheKey ] = fb;

					for ( let i = 0; i < textures.length; i ++ ) {

						const texture = textures[ i ];
						const textureData = this.get( texture );
						textureData.renderTarget = descriptor.renderTarget;
						textureData.cacheKey = cacheKey; // required for copyTextureToTexture()

						const attachment = gl.COLOR_ATTACHMENT0 + i;

						if ( isRenderTarget3D || isRenderTargetArray ) {

							const layer = this.renderer._activeCubeFace;

							gl.framebufferTextureLayer( gl.FRAMEBUFFER, attachment, textureData.textureGPU, 0, layer );

						} else {

							if ( useMultisampledRTT ) {

								multisampledRTTExt.framebufferTexture2DMultisampleEXT( gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, textureData.textureGPU, 0, samples );

							} else {

								gl.framebufferTexture2D( gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, textureData.textureGPU, 0 );

							}

						}

					}

					state.drawBuffers( descriptor, fb );

				}

				if ( renderTarget.isXRRenderTarget && renderTarget.autoAllocateDepthBuffer === true ) {

					const renderbuffer = gl.createRenderbuffer();
					this.textureUtils.setupRenderBufferStorage( renderbuffer, descriptor, 0, useMultisampledRTT );
					renderTargetContextData.xrDepthRenderbuffer = renderbuffer;

				} else {

					if ( descriptor.depthTexture !== null ) {

						const textureData = this.get( descriptor.depthTexture );
						const depthStyle = stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;
						textureData.renderTarget = descriptor.renderTarget;
						textureData.cacheKey = cacheKey; // required for copyTextureToTexture()

						if ( useMultisampledRTT ) {

							multisampledRTTExt.framebufferTexture2DMultisampleEXT( gl.FRAMEBUFFER, depthStyle, gl.TEXTURE_2D, textureData.textureGPU, 0, samples );

						} else {

							gl.framebufferTexture2D( gl.FRAMEBUFFER, depthStyle, gl.TEXTURE_2D, textureData.textureGPU, 0 );

						}

					}

				}

			} else {

				// rebind external XR textures

				if ( isXRRenderTarget && hasExternalTextures ) {

					state.bindFramebuffer( gl.FRAMEBUFFER, fb );

					// rebind color

					const textureData = this.get( descriptor.textures[ 0 ] );

					if ( useMultisampledRTT ) {

						multisampledRTTExt.framebufferTexture2DMultisampleEXT( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureData.textureGPU, 0, samples );

					} else {

						gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureData.textureGPU, 0 );

					}

					// rebind depth

					const depthStyle = stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;

					if ( renderTarget.autoAllocateDepthBuffer === true ) {

						const renderbuffer = renderTargetContextData.xrDepthRenderbuffer;
						gl.bindRenderbuffer( gl.RENDERBUFFER, renderbuffer );
						gl.framebufferRenderbuffer( gl.FRAMEBUFFER, depthStyle, gl.RENDERBUFFER, renderbuffer );

					} else {

						const textureData = this.get( descriptor.depthTexture );

						if ( useMultisampledRTT ) {

							multisampledRTTExt.framebufferTexture2DMultisampleEXT( gl.FRAMEBUFFER, depthStyle, gl.TEXTURE_2D, textureData.textureGPU, 0, samples );

						} else {

							gl.framebufferTexture2D( gl.FRAMEBUFFER, depthStyle, gl.TEXTURE_2D, textureData.textureGPU, 0 );

						}

					}

				}

			}

			if ( samples > 0 && useMultisampledRTT === false ) {

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

						if ( depthBuffer ) {

							const depthStyle = stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;
							invalidationArray.push( depthStyle );

						}

						const texture = descriptor.textures[ i ];
						const textureData = this.get( texture );

						gl.renderbufferStorageMultisample( gl.RENDERBUFFER, samples, textureData.glInternalFormat, descriptor.width, descriptor.height );
						gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.RENDERBUFFER, msaaRenderbuffers[ i ] );


					}

					renderTargetContextData.msaaFrameBuffer = msaaFb;
					renderTargetContextData.msaaRenderbuffers = msaaRenderbuffers;

					if ( depthRenderbuffer === undefined ) {

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

		}

		state.bindFramebuffer( gl.FRAMEBUFFER, currentFrameBuffer );

	}

	/**
	 * Computes the VAO key for the given index and attributes.
	 *
	 * @private
	 * @param {BufferAttribute?} index - The index. `null` for non-indexed geometries.
	 * @param {Array<BufferAttribute>} attributes - An array of buffer attributes.
	 * @return {String} The VAO key.
	 */
	_getVaoKey( index, attributes ) {

		let key = '';

		if ( index !== null ) {

			const indexData = this.get( index );

			key += ':' + indexData.id;

		}

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
	 * @param {BufferAttribute?} index - The index. `null` for non-indexed geometries.
	 * @param {Array<BufferAttribute>} attributes - An array of buffer attributes.
	 * @return {Object} The VAO data.
	 */
	_createVao( index, attributes ) {

		const { gl } = this;

		const vaoGPU = gl.createVertexArray();
		let key = '';

		let staticVao = true;

		gl.bindVertexArray( vaoGPU );

		if ( index !== null ) {

			const indexData = this.get( index );

			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexData.bufferGPU );

			key += ':' + indexData.id;

		}

		for ( let i = 0; i < attributes.length; i ++ ) {

			const attribute = attributes[ i ];
			const attributeData = this.get( attribute );

			key += ':' + attributeData.id;

			gl.bindBuffer( gl.ARRAY_BUFFER, attributeData.bufferGPU );
			gl.enableVertexAttribArray( i );

			if ( attribute.isStorageBufferAttribute || attribute.isStorageInstancedBufferAttribute ) staticVao = false;

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

		this.vaoCache[ key ] = vaoGPU;

		return { vaoGPU, staticVao };

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
	 * Returns `true` if the `WEBGL_multisampled_render_to_texture` extension
	 * should be used when MSAA is enabled.
	 *
	 * @private
	 * @param {RenderTarget} renderTarget - The render target that should be multisampled.
	 * @return {Boolean} Whether to use the `WEBGL_multisampled_render_to_texture` extension for MSAA or not.
	 */
	_useMultisampledRTT( renderTarget ) {

		return renderTarget.samples > 0 && this.extensions.has( 'WEBGL_multisampled_render_to_texture' ) === true && renderTarget.autoAllocateDepthBuffer !== false;

	}

	/**
	 * Frees internal resources.
	 */
	dispose() {

		const extension = this.extensions.get( 'WEBGL_lose_context' );
		if ( extension ) extension.loseContext();

		this.renderer.domElement.removeEventListener( 'webglcontextlost', this._onContextLost );

	}

}

export default WebGLBackend;
