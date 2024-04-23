import { WebGLCoordinateSystem } from 'three';

import GLSLNodeBuilder from './nodes/GLSLNodeBuilder.js';
import Backend from '../common/Backend.js';

import WebGLAttributeUtils from './utils/WebGLAttributeUtils.js';
import WebGLState from './utils/WebGLState.js';
import WebGLUtils from './utils/WebGLUtils.js';
import WebGLTextureUtils from './utils/WebGLTextureUtils.js';
import WebGLExtensions from './utils/WebGLExtensions.js';
import WebGLCapabilities from './utils/WebGLCapabilities.js';
import { GLFeatureName } from './utils/WebGLConstants.js';
import { WebGLBufferRenderer } from './WebGLBufferRenderer.js';

//

class WebGLBackend extends Backend {

	constructor( parameters = {} ) {

		super( parameters );

		this.isWebGLBackend = true;

	}

	init( renderer ) {

		super.init( renderer );

		//

		const parameters = this.parameters;

		const glContext = ( parameters.context !== undefined ) ? parameters.context : renderer.domElement.getContext( 'webgl2' );

		this.gl = glContext;

		this.extensions = new WebGLExtensions( this );
		this.capabilities = new WebGLCapabilities( this );
		this.attributeUtils = new WebGLAttributeUtils( this );
		this.textureUtils = new WebGLTextureUtils( this );
		this.bufferRenderer = new WebGLBufferRenderer( this );

		this.state = new WebGLState( this );
		this.utils = new WebGLUtils( this );

		this.vaoCache = {};
		this.transformFeedbackCache = {};
		this.discard = false;
		this.trackTimestamp = ( parameters.trackTimestamp === true );

		this.extensions.get( 'EXT_color_buffer_float' );
		this.disjoint = this.extensions.get( 'EXT_disjoint_timer_query_webgl2' );
		this.parallel = this.extensions.get( 'KHR_parallel_shader_compile' );
		this._currentContext = null;

	}

	get coordinateSystem() {

		return WebGLCoordinateSystem;

	}

	async getArrayBufferAsync( attribute ) {

		return await this.attributeUtils.getArrayBufferAsync( attribute );

	}


	initTimestampQuery( renderContext ) {

		if ( ! this.disjoint || ! this.trackTimestamp ) return;

		const renderContextData = this.get( renderContext );

		if ( this.queryRunning ) {

		  if ( ! renderContextData.queryQueue ) renderContextData.queryQueue = [];
		  renderContextData.queryQueue.push( renderContext );
		  return;

		}

		if ( renderContextData.activeQuery ) {

		  this.gl.endQuery( this.disjoint.TIME_ELAPSED_EXT );
		  renderContextData.activeQuery = null;

		}

		renderContextData.activeQuery = this.gl.createQuery();

		if ( renderContextData.activeQuery !== null ) {

		  this.gl.beginQuery( this.disjoint.TIME_ELAPSED_EXT, renderContextData.activeQuery );
		  this.queryRunning = true;

		}

	}

	// timestamp utils

	  prepareTimestampBuffer( renderContext ) {

		if ( ! this.disjoint || ! this.trackTimestamp ) return;

		const renderContextData = this.get( renderContext );

		if ( renderContextData.activeQuery ) {

		  this.gl.endQuery( this.disjoint.TIME_ELAPSED_EXT );

		  if ( ! renderContextData.gpuQueries ) renderContextData.gpuQueries = [];
		  renderContextData.gpuQueries.push( { query: renderContextData.activeQuery } );
		  renderContextData.activeQuery = null;
		  this.queryRunning = false;

		  if ( renderContextData.queryQueue && renderContextData.queryQueue.length > 0 ) {

				const nextRenderContext = renderContextData.queryQueue.shift();
				this.initTimestampQuery( nextRenderContext );

			}

		}

	}

	  async resolveTimestampAsync( renderContext, type = 'render' ) {

		if ( ! this.disjoint || ! this.trackTimestamp ) return;

		const renderContextData = this.get( renderContext );

		if ( ! renderContextData.gpuQueries ) renderContextData.gpuQueries = [];

		for ( let i = 0; i < renderContextData.gpuQueries.length; i ++ ) {

		  const queryInfo = renderContextData.gpuQueries[ i ];
		  const available = this.gl.getQueryParameter( queryInfo.query, this.gl.QUERY_RESULT_AVAILABLE );
		  const disjoint = this.gl.getParameter( this.disjoint.GPU_DISJOINT_EXT );

		  if ( available && ! disjoint ) {

				const elapsed = this.gl.getQueryParameter( queryInfo.query, this.gl.QUERY_RESULT );
				const duration = Number( elapsed ) / 1000000; // Convert nanoseconds to milliseconds
				this.gl.deleteQuery( queryInfo.query );
				renderContextData.gpuQueries.splice( i, 1 ); // Remove the processed query
				i --;
				this.renderer.info.updateTimestamp( type, duration );

			}

		}

	}

	getContext() {

		return this.gl;

	}

	beginRender( renderContext ) {

		const { gl } = this;
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

			gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );

		}

		if ( renderContext.scissor ) {

			const { x, y, width, height } = renderContext.scissorValue;

			gl.scissor( x, y, width, height );

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

	finishRender( renderContext ) {

		const { gl, state } = this;
		const renderContextData = this.get( renderContext );
		const previousContext = renderContextData.previousContext;

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
			const fb = renderTargetContextData.framebuffer;

			const mask = gl.COLOR_BUFFER_BIT;

			if ( samples > 0 ) {

				const msaaFrameBuffer = renderTargetContextData.msaaFrameBuffer;

				const textures = renderContext.textures;

				state.bindFramebuffer( gl.READ_FRAMEBUFFER, msaaFrameBuffer );
				state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, fb );

				for ( let i = 0; i < textures.length; i ++ ) {

					// TODO Add support for MRT

					gl.blitFramebuffer( 0, 0, renderContext.width, renderContext.height, 0, 0, renderContext.width, renderContext.height, mask, gl.NEAREST );

					gl.invalidateFramebuffer( gl.READ_FRAMEBUFFER, renderTargetContextData.invalidationArray );

				}

			}


		}

		if ( previousContext !== null ) {

			this._setFramebuffer( previousContext );

			if ( previousContext.viewport ) {

				this.updateViewport( previousContext );

			} else {

				const gl = this.gl;

				gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );

			}

		}

		const occlusionQueryCount = renderContext.occlusionQueryCount;

		if ( occlusionQueryCount > 0 ) {

			const renderContextData = this.get( renderContext );

			if ( occlusionQueryCount > renderContextData.occlusionQueryIndex ) {

				const { gl } = this;

				gl.endQuery( gl.ANY_SAMPLES_PASSED );

			}

			this.resolveOccludedAsync( renderContext );

		}

		this.prepareTimestampBuffer( renderContext );

	}

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

						if ( gl.getQueryParameter( query, gl.QUERY_RESULT ) > 0 ) occluded.add( currentOcclusionQueryObjects[ i ] );

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

	isOccluded( renderContext, object ) {

		const renderContextData = this.get( renderContext );

		return renderContextData.occluded && renderContextData.occluded.has( object );

	}

	updateViewport( renderContext ) {

		const gl = this.gl;
		const { x, y, width, height } = renderContext.viewportValue;

		gl.viewport( x, y, width, height );

	}

	setScissorTest( boolean ) {

		const gl = this.gl;

		if ( boolean ) {

			gl.enable( gl.SCISSOR_TEST );

		} else {

			gl.disable( gl.SCISSOR_TEST );

		}

	}

	clear( color, depth, stencil, descriptor = null, setFrameBuffer = true ) {

		const { gl } = this;

		if ( descriptor === null ) {

			descriptor = {
				textures: null,
				clearColorValue: this.getClearColor()
			};

		}

		//

		let clear = 0;

		if ( color ) clear |= gl.COLOR_BUFFER_BIT;
		if ( depth ) clear |= gl.DEPTH_BUFFER_BIT;
		if ( stencil ) clear |= gl.STENCIL_BUFFER_BIT;

		if ( clear !== 0 ) {

			const clearColor = descriptor.clearColorValue || this.getClearColor();

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

	beginCompute( computeGroup ) {

		const gl = this.gl;

		gl.bindFramebuffer( gl.FRAMEBUFFER, null );
		this.initTimestampQuery( computeGroup );

	}

	compute( computeGroup, computeNode, bindings, pipeline ) {

		const gl = this.gl;

		if ( ! this.discard ) {

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

		gl.useProgram( programGPU );

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

	finishCompute( computeGroup ) {

		const gl = this.gl;

		this.discard = false;

		gl.disable( gl.RASTERIZER_DISCARD );

		this.prepareTimestampBuffer( computeGroup );

	}

	draw( renderObject, info ) {

		const { object, pipeline, material, context } = renderObject;
		const { programGPU } = this.get( pipeline );

		const { gl, state } = this;

		const contextData = this.get( context );

		//

		this._bindUniforms( renderObject.getBindings() );

		const frontFaceCW = ( object.isMesh && object.matrixWorld.determinant() < 0 );

		state.setMaterial( material, frontFaceCW );

		gl.useProgram( programGPU );

		//

		let vaoGPU = renderObject.staticVao;

		if ( vaoGPU === undefined ) {

			const vaoKey = this._getVaoKey( renderObject.getIndex(), renderObject.getAttributes() );

			vaoGPU = this.vaoCache[ vaoKey ];

			if ( vaoGPU === undefined ) {

				let staticVao;

				( { vaoGPU, staticVao } = this._createVao( renderObject.getIndex(), renderObject.getAttributes() ) );

				if ( staticVao ) renderObject.staticVao = vaoGPU;

			}

		}

		gl.bindVertexArray( vaoGPU );

		//

		const index = renderObject.getIndex();

		const geometry = renderObject.geometry;
		const drawRange = renderObject.drawRange;
		const firstVertex = drawRange.start;

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


		let count;

		renderer.object = object;

		if ( index !== null ) {

			const indexData = this.get( index );
			const indexCount = ( drawRange.count !== Infinity ) ? drawRange.count : index.count;

			renderer.index = index.count;
			renderer.type = indexData.type;

			count = indexCount;

		} else {

			renderer.index = 0;

			const vertexCount = ( drawRange.count !== Infinity ) ? drawRange.count : geometry.attributes.position.count;

			count = vertexCount;

		}

		const instanceCount = this.getInstanceCount( renderObject );

		if ( object.isBatchedMesh ) {

			if ( object._multiDrawInstances !== null ) {

				renderer.renderMultiDrawInstances( object._multiDrawStarts, object._multiDrawCounts, object._multiDrawCount, object._multiDrawInstances );

			} else {

				renderer.renderMultiDraw( object._multiDrawStarts, object._multiDrawCounts, object._multiDrawCount );

			}

		} else if ( instanceCount > 1 ) {

			renderer.renderInstances( firstVertex, count, instanceCount );

		} else {

			renderer.render( firstVertex, count );

		}
		//

		gl.bindVertexArray( null );

	}

	needsRenderUpdate( /*renderObject*/ ) {

		return false;

	}

	getRenderCacheKey( renderObject ) {

		return renderObject.id;

	}

	// textures

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

	createSampler( /*texture*/ ) {

		//console.warn( 'Abstract class.' );

	}

	destroySampler() {}

	// node builder

	createNodeBuilder( object, renderer, scene = null ) {

		return new GLSLNodeBuilder( object, renderer, scene );

	}

	// program

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

	destroyProgram( /*program*/ ) {

		console.warn( 'Abstract class.' );

	}

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

	_completeCompile( renderObject, pipeline ) {

		const gl = this.gl;
		const pipelineData = this.get( pipeline );
		const { programGPU, fragmentShader, vertexShader } = pipelineData;

		if ( gl.getProgramParameter( programGPU, gl.LINK_STATUS ) === false ) {

			console.error( 'THREE.WebGLBackend:', gl.getProgramInfoLog( programGPU ) );

			console.error( 'THREE.WebGLBackend:', gl.getShaderInfoLog( fragmentShader ) );
			console.error( 'THREE.WebGLBackend:', gl.getShaderInfoLog( vertexShader ) );

		}

		gl.useProgram( programGPU );

		// Bindings

		this._setupBindings( renderObject.getBindings(), programGPU );

		//

		this.set( pipeline, {
			programGPU
		} );

	}

	createComputePipeline( computePipeline, bindings ) {

		const gl = this.gl;

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
			gl.SEPARATE_ATTRIBS,
		);

		gl.linkProgram( programGPU );

		if ( gl.getProgramParameter( programGPU, gl.LINK_STATUS ) === false ) {

			console.error( 'THREE.WebGLBackend:', gl.getProgramInfoLog( programGPU ) );

			console.error( 'THREE.WebGLBackend:', gl.getShaderInfoLog( fragmentShader ) );
			console.error( 'THREE.WebGLBackend:', gl.getShaderInfoLog( vertexShader ) );

		}

		gl.useProgram( programGPU );

		// Bindings

		this.createBindings( bindings );

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

	createBindings( bindings ) {

		this.updateBindings( bindings );

	}

	updateBindings( bindings ) {

		const { gl } = this;

		let groupIndex = 0;
		let textureIndex = 0;

		for ( const binding of bindings ) {

			if ( binding.isUniformsGroup || binding.isUniformBuffer ) {

				const bufferGPU = gl.createBuffer();
				const data = binding.buffer;

				gl.bindBuffer( gl.UNIFORM_BUFFER, bufferGPU );
				gl.bufferData( gl.UNIFORM_BUFFER, data, gl.DYNAMIC_DRAW );
				gl.bindBufferBase( gl.UNIFORM_BUFFER, groupIndex, bufferGPU );

				this.set( binding, {
					index: groupIndex ++,
					bufferGPU
				} );

			} else if ( binding.isSampledTexture ) {

				const { textureGPU, glTextureType } = this.get( binding.texture );

				this.set( binding, {
					index: textureIndex ++,
					textureGPU,
					glTextureType
				} );

			}

		}

	}

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

	createIndexAttribute( attribute ) {

		const gl = this.gl;

		this.attributeUtils.createAttribute( attribute, gl.ELEMENT_ARRAY_BUFFER );

	}

	createAttribute( attribute ) {

		if ( this.has( attribute ) ) return;

		const gl = this.gl;

		this.attributeUtils.createAttribute( attribute, gl.ARRAY_BUFFER );

	}

	createStorageAttribute( attribute ) {

		//console.warn( 'Abstract class.' );

	}

	updateAttribute( attribute ) {

		this.attributeUtils.updateAttribute( attribute );

	}

	destroyAttribute( attribute ) {

		this.attributeUtils.destroyAttribute( attribute );

	}

	updateSize() {

		//console.warn( 'Abstract class.' );

	}

	async hasFeatureAsync( name ) {

		return this.hasFeature( name );

	}

	hasFeature( name ) {

		const keysMatching = Object.keys( GLFeatureName ).filter( key => GLFeatureName[ key ] === name );

		const extensions = this.extensions;

		for ( let i = 0; i < keysMatching.length; i ++ ) {


			if ( extensions.has( keysMatching[ i ] ) ) return true;

		}

		return false;

	}


	getMaxAnisotropy() {

		return this.capabilities.getMaxAnisotropy();

	}

	copyTextureToTexture( position, srcTexture, dstTexture, level ) {

		this.textureUtils.copyTextureToTexture( position, srcTexture, dstTexture, level );

	}

	copyFramebufferToTexture( texture, renderContext ) {

		this.textureUtils.copyFramebufferToTexture( texture, renderContext );

	}

	_setFramebuffer( renderContext ) {

		const { gl, state } = this;

		let currentFrameBuffer = null;

		if ( renderContext.textures !== null ) {

			const renderTarget = renderContext.renderTarget;
			const renderTargetContextData = this.get( renderTarget );
			const { samples, depthBuffer, stencilBuffer } = renderTarget;
			const cubeFace = this.renderer._activeCubeFace;
			const isCube = renderTarget.isWebGLCubeRenderTarget === true;

			let msaaFb = renderTargetContextData.msaaFrameBuffer;
			let depthRenderbuffer = renderTargetContextData.depthRenderbuffer;

			let fb;

			if ( isCube ) {

				if ( renderTargetContextData.cubeFramebuffers === undefined ) {

					renderTargetContextData.cubeFramebuffers = [];

				}

				fb = renderTargetContextData.cubeFramebuffers[ cubeFace ];

			} else {

				fb = renderTargetContextData.framebuffer;

			}

			if ( fb === undefined ) {

				fb = gl.createFramebuffer();

				state.bindFramebuffer( gl.FRAMEBUFFER, fb );

				const textures = renderContext.textures;

				if ( isCube ) {

					renderTargetContextData.cubeFramebuffers[ cubeFace ] = fb;
					const { textureGPU } = this.get( textures[ 0 ] );

					gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + cubeFace, textureGPU, 0 );

				} else {

					for ( let i = 0; i < textures.length; i ++ ) {

						const texture = textures[ i ];
						const textureData = this.get( texture );
						textureData.renderTarget = renderContext.renderTarget;

						const attachment = gl.COLOR_ATTACHMENT0 + i;

						gl.framebufferTexture2D( gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, textureData.textureGPU, 0 );

					}

					renderTargetContextData.framebuffer = fb;

					state.drawBuffers( renderContext, fb );

				}

				if ( renderContext.depthTexture !== null ) {

					const textureData = this.get( renderContext.depthTexture );
					const depthStyle = stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;

					gl.framebufferTexture2D( gl.FRAMEBUFFER, depthStyle, gl.TEXTURE_2D, textureData.textureGPU, 0 );

				}

			}

			if ( samples > 0 ) {

				if ( msaaFb === undefined ) {

					const invalidationArray = [];

					msaaFb = gl.createFramebuffer();

					state.bindFramebuffer( gl.FRAMEBUFFER, msaaFb );

					const msaaRenderbuffers = [];

					const textures = renderContext.textures;

					for ( let i = 0; i < textures.length; i ++ ) {


						msaaRenderbuffers[ i ] = gl.createRenderbuffer();

						gl.bindRenderbuffer( gl.RENDERBUFFER, msaaRenderbuffers[ i ] );

						invalidationArray.push( gl.COLOR_ATTACHMENT0 + i );

						if ( depthBuffer ) {

							const depthStyle = stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;
							invalidationArray.push( depthStyle );

						}

						const texture = renderContext.textures[ i ];
						const textureData = this.get( texture );

						gl.renderbufferStorageMultisample( gl.RENDERBUFFER, samples, textureData.glInternalFormat, renderContext.width, renderContext.height );
						gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.RENDERBUFFER, msaaRenderbuffers[ i ] );


					}

					renderTargetContextData.msaaFrameBuffer = msaaFb;
					renderTargetContextData.msaaRenderbuffers = msaaRenderbuffers;

					if ( depthRenderbuffer === undefined ) {

						depthRenderbuffer = gl.createRenderbuffer();
						this.textureUtils.setupRenderBufferStorage( depthRenderbuffer, renderContext );

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


	_getVaoKey( index, attributes ) {

		let key = [];

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

	_getTransformFeedback( transformBuffers ) {

		let key = '';

		for ( let i = 0; i < transformBuffers.length; i ++ ) {

			key += ':' + transformBuffers[ i ].id;

		}

		let transformFeedbackGPU = this.transformFeedbackCache[ key ];

		if ( transformFeedbackGPU !== undefined ) {

			return transformFeedbackGPU;

		}

		const gl = this.gl;

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


	_setupBindings( bindings, programGPU ) {

		const gl = this.gl;

		for ( const binding of bindings ) {

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

	_bindUniforms( bindings ) {

		const { gl, state } = this;

		for ( const binding of bindings ) {

			const bindingData = this.get( binding );
			const index = bindingData.index;

			if ( binding.isUniformsGroup || binding.isUniformBuffer ) {

				gl.bindBufferBase( gl.UNIFORM_BUFFER, index, bindingData.bufferGPU );

			} else if ( binding.isSampledTexture ) {

				state.bindTexture( bindingData.glTextureType, bindingData.textureGPU, gl.TEXTURE0 + index );

			}

		}

	}

}

export default WebGLBackend;
