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
		this.extensions.get( 'WEBGL_clip_cull_distance' );
		this.extensions.get( 'OES_texture_float_linear' );
		this.extensions.get( 'EXT_color_buffer_half_float' );
		this.extensions.get( 'WEBGL_multisampled_render_to_texture' );
		this.extensions.get( 'WEBGL_render_shared_exponent' );
		this.extensions.get( 'WEBGL_multi_draw' );

		this.disjoint = this.extensions.get( 'EXT_disjoint_timer_query_webgl2' );
		this.parallel = this.extensions.get( 'KHR_parallel_shader_compile' );

		this._knownBindings = new WeakSet();

		this._currentContext = null;

	}

	get coordinateSystem() {

		return WebGLCoordinateSystem;

	}

	async getArrayBufferAsync( attribute ) {

		return await this.attributeUtils.getArrayBufferAsync( attribute );

	}

	async waitForGPU() {

		await this.utils._clientWaitAsync();

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

			gl.scissor( x, renderContext.height - height - y, width, height );

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

			if ( samples > 0 ) {

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

				gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );

			}

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

		gl.viewport( x, renderContext.height - height - y, width, height );

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

	beginCompute( computeGroup ) {

		const { state, gl } = this;

		state.bindFramebuffer( gl.FRAMEBUFFER, null );
		this.initTimestampQuery( computeGroup );

	}

	compute( computeGroup, computeNode, bindings, pipeline ) {

		const { state, gl } = this;

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

	finishCompute( computeGroup ) {

		const gl = this.gl;

		this.discard = false;

		gl.disable( gl.RASTERIZER_DISCARD );

		this.prepareTimestampBuffer( computeGroup );

		if ( this._currentContext ) {

			this._setFramebuffer( this._currentContext );

		}

	}

	draw( renderObject/*, info*/ ) {

		const { object, pipeline, material, context } = renderObject;
		const { programGPU } = this.get( pipeline );

		const { gl, state } = this;

		const contextData = this.get( context );

		const drawParams = renderObject.getDrawParameters();

		if ( drawParams === null ) return;

		//

		this._bindUniforms( renderObject.getBindings() );

		const frontFaceCW = ( object.isMesh && object.matrixWorld.determinant() < 0 );

		state.setMaterial( material, frontFaceCW );

		state.useProgram( programGPU );

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
		//

		gl.bindVertexArray( null );

	}

	needsRenderUpdate( /*renderObject*/ ) {

		return false;

	}

	getRenderCacheKey( /*renderObject*/ ) {

		return '';

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

	copyTextureToBuffer( texture, x, y, width, height, faceIndex ) {

		return this.textureUtils.copyTextureToBuffer( texture, x, y, width, height, faceIndex );

	}

	createSampler( /*texture*/ ) {

		//console.warn( 'Abstract class.' );

	}

	destroySampler() {}

	// node builder

	createNodeBuilder( object, renderer ) {

		return new GLSLNodeBuilder( object, renderer );

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

	createBindings( bindGroup, bindings ) {

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

	updateBindings( bindGroup /*, bindings*/ ) {

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

		if ( this.has( attribute ) ) return;

		const gl = this.gl;

		this.attributeUtils.createAttribute( attribute, gl.ARRAY_BUFFER );

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

	copyTextureToTexture( srcTexture, dstTexture, srcRegion, dstPosition, level ) {

		this.textureUtils.copyTextureToTexture( srcTexture, dstTexture, srcRegion, dstPosition, level );

	}

	copyFramebufferToTexture( texture, renderContext, rectangle ) {

		this.textureUtils.copyFramebufferToTexture( texture, renderContext, rectangle );

	}

	_setFramebuffer( descriptor ) {

		const { gl, state } = this;

		let currentFrameBuffer = null;

		if ( descriptor.textures !== null ) {

			const renderTarget = descriptor.renderTarget;
			const renderTargetContextData = this.get( renderTarget );
			const { samples, depthBuffer, stencilBuffer } = renderTarget;

			const isCube = renderTarget.isWebGLCubeRenderTarget === true;

			let msaaFb = renderTargetContextData.msaaFrameBuffer;
			let depthRenderbuffer = renderTargetContextData.depthRenderbuffer;

			const cacheKey = getCacheKey( descriptor );

			let fb;

			if ( isCube ) {

				renderTargetContextData.cubeFramebuffers || ( renderTargetContextData.cubeFramebuffers = {} );

				fb = renderTargetContextData.cubeFramebuffers[ cacheKey ];

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

						gl.framebufferTexture2D( gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, textureData.textureGPU, 0 );

					}

					state.drawBuffers( descriptor, fb );

				}

				if ( descriptor.depthTexture !== null ) {

					const textureData = this.get( descriptor.depthTexture );
					const depthStyle = stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;
					textureData.renderTarget = descriptor.renderTarget;
					textureData.cacheKey = cacheKey; // required for copyTextureToTexture()

					gl.framebufferTexture2D( gl.FRAMEBUFFER, depthStyle, gl.TEXTURE_2D, textureData.textureGPU, 0 );

				}

			}

			if ( samples > 0 ) {

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
						this.textureUtils.setupRenderBufferStorage( depthRenderbuffer, descriptor );

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

}

export default WebGLBackend;
