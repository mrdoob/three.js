import { WebGLCoordinateSystem } from 'three';

import GLSLNodeBuilder from './nodes/GLSLNodeBuilder.js';
import Backend from '../common/Backend.js';

import WebGLAttributeUtils from './utils/WebGLAttributeUtils.js';

//

class WebGLBackend extends Backend {

	constructor( parameters = {} ) {

		super( parameters );

	}

	async init( renderer ) {

		await super.init( renderer );

		//

		const parameters = this.parameters;

		const context = ( parameters.context !== undefined ) ? parameters.context : renderer.domElement.getContext( 'webgl2' );

		this.context = context;

		this.attributeUtils = new WebGLAttributeUtils( this );

	}

	get coordinateSystem() {

		return WebGLCoordinateSystem;

	}

	beginRender( renderContext ) {

		const gl = this.context;

		//

		let clear = 0;

		if ( renderContext.clearColor ) clear |= gl.COLOR_BUFFER_BIT;
		if ( renderContext.clearDepth ) clear |= gl.DEPTH_BUFFER_BIT;
		if ( renderContext.clearStencil ) clear |= gl.STENCIL_BUFFER_BIT;

		const clearColor = renderContext.clearColorValue;

		gl.clearColor( clearColor.x, clearColor.y, clearColor.z, clearColor.a );
		gl.clear( clear );

		//

		if ( renderContext.viewport ) {

			this.updateViewport( renderContext );

		} else {

			gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );

		}

	}

	finishRender( /*renderContext*/ ) {

		//console.warn( 'Abstract class.' );

	}

	updateViewport( renderContext ) {

		const gl = this.context;
		const { x, y, width, height } = renderContext.viewportValue;

		gl.viewport( x, y, width, height );

	}

	clear( /*renderContext, color, depth, stencil*/ ) {

		console.warn( 'Abstract class.' );

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

		const { pipeline } = renderObject;
		const { programGPU, vaoGPU } = this.get( pipeline );

		const gl = this.context;

		//

		const bindings = renderObject.getBindings();

		for ( const binding of bindings ) {

			const bindingData = this.get( binding );
			const index = bindingData.index;

			if ( binding.isUniformsGroup ) {

				gl.bindBufferBase( gl.UNIFORM_BUFFER, index, bindingData.bufferGPU );

			} else if ( binding.isSampledTexture ) {

				gl.activeTexture( gl.TEXTURE0 + index );
				gl.bindTexture( gl.TEXTURE_2D, bindingData.textureGPU );

			}

		}

		// temp
		gl.frontFace( gl.CCW );
		gl.cullFace( gl.FRONT );
		gl.enable( gl.DEPTH_TEST );
		// --

		gl.useProgram( programGPU );
		gl.bindVertexArray( vaoGPU );

		//

		const index = renderObject.getIndex();

		const object = renderObject.object;
		const geometry = renderObject.geometry;
		const drawRange = geometry.drawRange;
		const firstVertex = drawRange.start;

		if ( index !== null ) {

			const indexData = this.get( index );

			const indexCount = ( drawRange.count !== Infinity ) ? drawRange.count : index.count;

			gl.drawElements( gl.TRIANGLES, index.count, indexData.type, firstVertex );

			info.update( object, indexCount, 1 );

		} else {

			const positionAttribute = geometry.attributes.position;
			const vertexCount = ( drawRange.count !== Infinity ) ? drawRange.count : positionAttribute.count;

			gl.drawArrays( gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, firstVertex );

			info.update( object, vertexCount, 1 );

		}



		//

		gl.bindVertexArray( null );

	}

	needsUpdate( renderObject ) {

		return false;

	}

	getCacheKey( renderObject ) {

		return '';

	}

	// textures

	createSampler( /*texture*/ ) {

		//console.warn( 'Abstract class.' );

	}

	destroySampler( /*texture*/ ) {

		console.warn( 'Abstract class.' );

	}

	createDefaultTexture( texture ) {

		const gl = this.context;

		const textureGPU = gl.createTexture();

		gl.bindTexture( gl.TEXTURE_2D, textureGPU );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

		this.set( texture, {
			textureGPU: textureGPU
		} );

	}

	createTexture( texture/*, options*/ ) {

		const gl = this.context;
		const image = texture.image;
		const levels = Math.log2( Math.max( image.width, image.height ) ) + 1;

		const textureGPU = gl.createTexture();

		gl.bindTexture( gl.TEXTURE_2D, textureGPU );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );

		gl.texStorage2D( gl.TEXTURE_2D, levels, gl.RGBA8, image.width, image.height );
		gl.texSubImage2D( gl.TEXTURE_2D, 0, 0, 0, image.width, image.height, gl.RGBA, gl.UNSIGNED_BYTE, image );
		gl.generateMipmap( gl.TEXTURE_2D );

		this.set( texture, {
			textureGPU: textureGPU
		} );

	}

	updateTexture( /*texture*/ ) {

		console.warn( 'Abstract class.' );

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

		const gl = this.context;
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

		const gl = this.context;
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
				gl.useProgram( programGPU );
				gl.uniform1i( location, index );

			}

		}

		// VAO

		const vaoGPU = gl.createVertexArray();

		const index = renderObject.getIndex();
		const vertexBuffers = renderObject.getVertexBuffers();

		gl.bindVertexArray( vaoGPU );

		if ( index !== null ) {

			const indexData = this.get( index );

			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexData.bufferGPU );

		}

		for ( let i = 0; i < vertexBuffers.length; i ++ ) {

			const attribute = vertexBuffers[ i ];
			const attributeData = this.get( attribute );

			gl.bindBuffer( gl.ARRAY_BUFFER, attributeData.bufferGPU );
			gl.enableVertexAttribArray( i );
			gl.vertexAttribPointer( i, attribute.itemSize, attributeData.type, false, 0, 0 );

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

		const gl = this.context;

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

				const textureGPU = this.get( binding.texture ).textureGPU;

				this.set( binding, {
					index: textureIndex ++,
					textureGPU: textureGPU
				} );

			}

		}

	}

	updateBindings( bindings ) {

		//console.log( 'updateBindings:', bindings );

	}

	updateBinding( binding ) {

		const gl = this.context;

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

		const gl = this.context;

		this.attributeUtils.createAttribute( attribute, gl.ELEMENT_ARRAY_BUFFER );

	}

	createAttribute( attribute ) {

		const gl = this.context;

		this.attributeUtils.createAttribute( attribute, gl.ARRAY_BUFFER );

	}

	createStorageAttribute( /*attribute*/ ) {

		console.warn( 'Abstract class.' );

	}

	updateAttribute( /*attribute*/ ) {

		console.warn( 'Abstract class.' );

	}

	destroyAttribute( /*attribute*/ ) {

		console.warn( 'Abstract class.' );

	}

	updateSize() {

		console.warn( 'Abstract class.' );

	}

	hasFeature( name ) {

		return true;

	}

	copyFramebufferToTexture( /*texture, renderContext*/ ) {

		console.warn( 'Abstract class.' );

	}

}

export default WebGLBackend;
