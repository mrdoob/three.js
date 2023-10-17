import { WebGLCoordinateSystem } from 'three';

import GLSLNodeBuilder from './nodes/GLSLNodeBuilder.js';
import Backend from '../common/Backend.js';

import WebGLAttributeUtils from './utils/WebGLAttributeUtils.js';
import WebGLState from './utils/WebGLState.js';
import WebGLUtils from './utils/WebGLUtils.js';
import WebGLTextureUtils from './utils/WebGLTextureUtils.js';
import WebGLExtensions from './utils/WebGLExtensions.js';

//

class WebGLBackend extends Backend {

	constructor( parameters = {} ) {

		super( parameters );

		this.isWebGLBackend = true;

	}

	async init( renderer ) {

		await super.init( renderer );

		//

		const parameters = this.parameters;

		const glContext = ( parameters.context !== undefined ) ? parameters.context : renderer.domElement.getContext( 'webgl2' );

		this.gl = glContext;

		this.extensions = new WebGLExtensions( this );
		this.attributeUtils = new WebGLAttributeUtils( this );
		this.textureUtils = new WebGLTextureUtils( this );
		this.state = new WebGLState( this );
		this.utils = new WebGLUtils( this );
		this.defaultTextures = {};

		this.extensions.get( 'EXT_color_buffer_float' );

	}

	get coordinateSystem() {

		return WebGLCoordinateSystem;

	}

	beginRender( renderContext ) {

		const { gl } = this;

		//

		this._setFramebuffer( renderContext );

		let clear = 0;

		if ( renderContext.clearColor ) clear |= gl.COLOR_BUFFER_BIT;
		if ( renderContext.clearDepth ) clear |= gl.DEPTH_BUFFER_BIT;
		if ( renderContext.clearStencil ) clear |= gl.STENCIL_BUFFER_BIT;

		const clearColor = renderContext.clearColorValue;

		if ( clear !== 0 ) {

			if ( renderContext.textures === null ) {

				gl.clearColor( clearColor.r, clearColor.g, clearColor.b, clearColor.a );
				gl.clear( clear );

			} else {

				for ( let i = 0; i < renderContext.textures.length; i ++ ) {

					gl.clearBufferfv( gl.COLOR, i, [ clearColor.r, clearColor.g, clearColor.b, clearColor.a ] );

				}

				gl.clearBufferfi( gl.DEPTH_STENCIL, 0, 1, 1 );

			}

		}

		//

		if ( renderContext.viewport ) {

			this.updateViewport( renderContext );

		} else {

			gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );

		}

		const occlusionQueryCount = renderContext.occlusionQueryCount;

		if ( occlusionQueryCount > 0 ) {

			const renderContextData = this.get( renderContext );

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

		const occlusionQueryCount = renderContext.occlusionQueryCount;

		if ( occlusionQueryCount > 0 ) {

			const renderContextData = this.get( renderContext );

			if ( occlusionQueryCount > renderContextData.occlusionQueryIndex ) {

				const { gl } = this;

				gl.endQuery( gl.ANY_SAMPLES_PASSED );

			}

			this.resolveOccludedAsync( renderContext );

		}

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

			}

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

	clear( renderContext, color, depth, stencil ) {

		const { gl } = this;

		//

		let clear = 0;

		if ( color ) clear |= gl.COLOR_BUFFER_BIT;
		if ( depth ) clear |= gl.DEPTH_BUFFER_BIT;
		if ( stencil ) clear |= gl.STENCIL_BUFFER_BIT;

		const clearColor = renderContext.clearColorValue;

		if ( clear === 0 ) return;

		gl.clearColor( clearColor.x, clearColor.y, clearColor.z, clearColor.a );
		gl.clear( clear );

	}

	beginCompute( /*computeGroup*/ ) {

		console.warn( 'Abstract class.' );

	}

	compute( /*computeGroup, computeNode, bindings, pipeline*/ ) {

		console.warn( 'Abstract class.' );

	}

	finishCompute( /*computeGroup*/ ) {

		console.warn( 'Abstract class.' );

	}

	draw( renderObject, info ) {

		const { pipeline, material, context } = renderObject;
		const { programGPU, vaoGPU } = this.get( pipeline );

		const { gl, state } = this;

		const contextData = this.get( context );

		//

		const bindings = renderObject.getBindings();

		for ( const binding of bindings ) {

			const bindingData = this.get( binding );
			const index = bindingData.index;

			if ( binding.isUniformsGroup ) {

				gl.bindBufferBase( gl.UNIFORM_BUFFER, index, bindingData.bufferGPU );

			} else if ( binding.isSampledTexture ) {

				gl.activeTexture( gl.TEXTURE0 + index );
				gl.bindTexture( bindingData.glTextureType, bindingData.textureGPU );

			}

		}

		state.setMaterial( material );

		gl.useProgram( programGPU );
		gl.bindVertexArray( vaoGPU );

		//

		const index = renderObject.getIndex();

		const object = renderObject.object;
		const geometry = renderObject.geometry;
		const drawRange = geometry.drawRange;
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

		let mode;
		if ( object.isPoints ) mode = gl.POINTS;
		else if ( object.isLineSegments ) mode = gl.LINES;
		else if ( object.isLine ) mode = gl.LINE_STRIP;
		else if ( object.isLineLoop ) mode = gl.LINE_LOOP;
		else mode = gl.TRIANGLES;

		//

		const instanceCount = this.getInstanceCount( renderObject );

		if ( index !== null ) {

			const indexData = this.get( index );
			const indexCount = ( drawRange.count !== Infinity ) ? drawRange.count : index.count;

			if ( instanceCount > 1 ) {

				gl.drawElementsInstanced( mode, index.count, indexData.type, firstVertex, instanceCount );

			} else {

				gl.drawElements( mode, index.count, indexData.type, firstVertex );

			}


			info.update( object, indexCount, 1 );

		} else {

			const positionAttribute = geometry.attributes.position;
			const vertexCount = ( drawRange.count !== Infinity ) ? drawRange.count : positionAttribute.count;

			if ( instanceCount > 1 ) {

				gl.drawArraysInstanced( mode, 0, vertexCount, instanceCount );

			} else {

				gl.drawArrays( mode, 0, vertexCount );

			}

			//gl.drawArrays( mode, vertexCount, gl.UNSIGNED_SHORT, firstVertex );

			info.update( object, vertexCount, 1 );

		}



		//

		gl.bindVertexArray( null );

	}

	needsUpdate( renderObject ) {

		return false;

	}

	getCacheKey( renderObject ) {

		return renderObject.geometry.id;

	}

	// textures

	createSampler( /*texture*/ ) {

		//console.warn( 'Abstract class.' );

	}

	destroySampler( /*texture*/ ) {

		console.warn( 'Abstract class.' );

	}

	createDefaultTexture( texture ) {

		const { gl, textureUtils, defaultTextures } = this;

		const glTextureType = textureUtils.getGLTextureType( texture );

		let textureGPU = defaultTextures[ glTextureType ];

		if ( textureGPU === undefined ) {

			textureGPU = gl.createTexture();

			gl.bindTexture( glTextureType, textureGPU );
			gl.texParameteri( glTextureType, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
			gl.texParameteri( glTextureType, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

			//gl.texImage2D( target + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data );

			defaultTextures[ glTextureType ] = textureGPU;

		}

		this.set( texture, {
			textureGPU,
			glTextureType,
			isDefault: true
		} );

	}

	createTexture( texture, options ) {

		const { gl, utils, textureUtils } = this;
		const { levels, width, height } = options;

		const glFormat = utils.convert( texture.format, texture.colorSpace );
		const glType = utils.convert( texture.type );
		const glInternalFormat = textureUtils.getInternalFormat( texture.internalFormat, glFormat, glType, texture.colorSpace, texture.isVideoTexture );

		const textureGPU = gl.createTexture();
		const glTextureType = textureUtils.getGLTextureType( texture );

		gl.bindTexture( glTextureType, textureGPU );

		gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, texture.flipY );
		gl.pixelStorei( gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha );
		gl.pixelStorei( gl.UNPACK_ALIGNMENT, texture.unpackAlignment );
		gl.pixelStorei( gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE );

		textureUtils.setTextureParameters( glTextureType, texture );

		gl.bindTexture( glTextureType, textureGPU );

		if ( ! texture.isVideoTexture ) {

			gl.texStorage2D( glTextureType, levels, glInternalFormat, width, height );

		}

		this.set( texture, {
			textureGPU,
			glTextureType,
			glFormat,
			glType,
			glInternalFormat
		} );

	}

	updateTexture( texture, options ) {

		const { gl } = this;
		const { width, height } = options;
		const { textureGPU, glTextureType, glFormat, glType, glInternalFormat } = this.get( texture );

		const getImage = ( source ) => {

			if ( source.isDataTexture ) {

				return source.image.data;

			} else if ( source instanceof ImageBitmap || source instanceof OffscreenCanvas ) {

				return source;

			}

			return source.data;

		};

		gl.bindTexture( glTextureType, textureGPU );

		if ( texture.isCubeTexture ) {

			const images = options.images;

			for ( let i = 0; i < 6; i ++ ) {

				const image = getImage( images[ i ] );

				gl.texSubImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, 0, 0, width, height, glFormat, glType, image );

			}

		} else if ( texture.isVideoTexture ) {

			texture.update();

			gl.texImage2D( glTextureType, 0, glInternalFormat, glFormat, glType, options.image );


		} else {

			const image = getImage( options.image );

			gl.texSubImage2D( glTextureType, 0, 0, 0, width, height, glFormat, glType, image );

		}

	}

	generateMipmaps( texture ) {

		const { gl } = this;
		const { textureGPU, glTextureType } = this.get( texture );

		gl.bindTexture( glTextureType, textureGPU );
		gl.generateMipmap( glTextureType );

	}

	destroyTexture( /*texture*/ ) {

		console.warn( 'Abstract class.' );

	}

	copyTextureToBuffer( /*texture, x, y, width, height*/ ) {

		console.warn( 'Abstract class.' );

	}

	// node builder

	createNodeBuilder( object, renderer, scene = null ) {

		return new GLSLNodeBuilder( object, renderer, scene );

	}

	// program

	createProgram( program ) {

		const gl = this.gl;
		const { stage, code } = program;

		const shader = stage === 'vertex' ? gl.createShader( gl.VERTEX_SHADER ) : gl.createShader( gl.FRAGMENT_SHADER );

		gl.shaderSource( shader, code );
		gl.compileShader( shader );

		if ( gl.getShaderParameter( shader, gl.COMPILE_STATUS ) === false ) {

			console.error( 'THREE.WebGLBackend:', gl.getShaderInfoLog( shader ) );

		}

		this.set( program, {
			shaderGPU: shader
		} );

	}

	destroyProgram( /*program*/ ) {

		console.warn( 'Abstract class.' );

	}

	createRenderPipeline( renderObject ) {

		const gl = this.gl;
		const pipeline = renderObject.pipeline;

		// Program

		const { fragmentProgram, vertexProgram } = pipeline;

		const programGPU = gl.createProgram();
		gl.attachShader( programGPU, this.get( fragmentProgram ).shaderGPU );
		gl.attachShader( programGPU, this.get( vertexProgram ).shaderGPU );
		gl.linkProgram( programGPU );

		if ( gl.getProgramParameter( programGPU, gl.LINK_STATUS ) === false ) {

			console.error( 'THREE.WebGLBackend:', gl.getProgramInfoLog( programGPU ) );

		}

		gl.useProgram( programGPU );

		// Bindings

		const bindings = renderObject.getBindings();

		for ( const binding of bindings ) {

			const bindingData = this.get( binding );
			const index = bindingData.index;

			if ( binding.isUniformsGroup ) {

				const location = gl.getUniformBlockIndex( programGPU, binding.name );
				gl.uniformBlockBinding( programGPU, location, index );

			} else if ( binding.isSampledTexture ) {

				const location = gl.getUniformLocation( programGPU, binding.name );
				gl.uniform1i( location, index );

			}

		}

		// VAO

		const vaoGPU = gl.createVertexArray();

		const index = renderObject.getIndex();
		const attributes = renderObject.getAttributes();

		gl.bindVertexArray( vaoGPU );

		if ( index !== null ) {

			const indexData = this.get( index );

			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexData.bufferGPU );

		}

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

			if ( attributeData.isFloat ) {

				gl.vertexAttribPointer( i, attribute.itemSize, attributeData.type, false, stride, offset );

			} else {

				gl.vertexAttribIPointer( i, attribute.itemSize, attributeData.type, stride, offset );

			}

			if ( attribute.isInstancedBufferAttribute && ! attribute.isInterleavedBufferAttribute ) {

				gl.vertexAttribDivisor( i, attribute.meshPerAttribute );

			} else if ( attribute.isInterleavedBufferAttribute && attribute.data.isInstancedInterleavedBuffer ) {

				gl.vertexAttribDivisor( i, attribute.data.meshPerAttribute );

			}

		}

		gl.bindVertexArray( null );

		//

		this.set( pipeline, {
			programGPU,
			vaoGPU
		} );

	}

	createComputePipeline( /*computePipeline, bindings*/ ) {

		console.warn( 'Abstract class.' );

	}

	createBindings( bindings ) {

		this.updateBindings( bindings );

	}

	updateBindings( bindings ) {

		const { gl } = this;

		let groupIndex = 0;
		let textureIndex = 0;

		for ( const binding of bindings ) {

			if ( binding.isUniformsGroup ) {

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

		if ( binding.isUniformsGroup ) {

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

		const gl = this.gl;

		this.attributeUtils.createAttribute( attribute, gl.ARRAY_BUFFER );

	}

	createStorageAttribute( /*attribute*/ ) {

		console.warn( 'Abstract class.' );

	}

	updateAttribute( attribute ) {

		this.attributeUtils.updateAttribute( attribute );

	}

	destroyAttribute( /*attribute*/ ) {

		console.warn( 'Abstract class.' );

	}

	updateSize() {

		//console.warn( 'Abstract class.' );

	}

	hasFeature( name ) {

		return true;

	}

	copyFramebufferToTexture( /*texture, renderContext*/ ) {

		console.warn( 'Abstract class.' );

	}

	_setFramebuffer( renderContext ) {

		const { gl } = this;

		if ( renderContext.textures !== null ) {

			const renderContextData = this.get( renderContext );

			let fb = renderContextData.framebuffer;

			if ( fb === undefined ) {

				fb = gl.createFramebuffer();

				gl.bindFramebuffer( gl.FRAMEBUFFER, fb );

				const textures = renderContext.textures;

				const drawBuffers = [];

				for ( let i = 0; i < textures.length; i++ ) {

					const texture = textures[ i ];
					const { textureGPU } = this.get( texture );

					const attachment = gl.COLOR_ATTACHMENT0 + i;

					gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, textureGPU, 0 );

					drawBuffers.push( attachment );

				}

				gl.drawBuffers( drawBuffers );

				if ( renderContext.depthTexture !== null ) {

					const { textureGPU } = this.get( renderContext.depthTexture );

					gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, textureGPU, 0 );

				}

				renderContextData.framebuffer = fb;

			} else {

				gl.bindFramebuffer( gl.FRAMEBUFFER, fb );

			}

		} else {

			gl.bindFramebuffer( gl.FRAMEBUFFER, null );

		}

	}

}

export default WebGLBackend;
