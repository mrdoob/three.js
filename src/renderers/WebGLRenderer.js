/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 * @author tschw
 */

import {
	RGBAFormat,
	HalfFloatType,
	FloatType,
	UnsignedByteType,
	LinearEncoding,
	LinearToneMapping,
	BackSide
} from '../constants.js';
import { MathUtils } from '../math/MathUtils.js';
import { DataTexture } from '../textures/DataTexture.js';
import { Frustum } from '../math/Frustum.js';
import { Matrix4 } from '../math/Matrix4.js';
import { UniformsLib } from './shaders/UniformsLib.js';
import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';
import { Vector4 } from '../math/Vector4.js';
import { Scene } from '../scenes/Scene.js';
import { WebGLAnimation } from './webgl/WebGLAnimation.js';
import { WebGLAttributes } from './webgl/WebGLAttributes.js';
import { WebGLBackground } from './webgl/WebGLBackground.js';
import { WebGLBufferRenderer } from './webgl/WebGLBufferRenderer.js';
import { WebGLCapabilities } from './webgl/WebGLCapabilities.js';
import { WebGLClipping } from './webgl/WebGLClipping.js';
import { WebGLExtensions } from './webgl/WebGLExtensions.js';
import { WebGLGeometries } from './webgl/WebGLGeometries.js';
import { WebGLIndexedBufferRenderer } from './webgl/WebGLIndexedBufferRenderer.js';
import { WebGLInfo } from './webgl/WebGLInfo.js';
import { WebGLMorphtargets } from './webgl/WebGLMorphtargets.js';
import { WebGLObjects } from './webgl/WebGLObjects.js';
import { WebGLPrograms } from './webgl/WebGLPrograms.js';
import { WebGLProperties } from './webgl/WebGLProperties.js';
import { WebGLRenderLists } from './webgl/WebGLRenderLists.js';
import { WebGLRenderStates } from './webgl/WebGLRenderStates.js';
import { WebGLShadowMap } from './webgl/WebGLShadowMap.js';
import { WebGLState } from './webgl/WebGLState.js';
import { WebGLTextures } from './webgl/WebGLTextures.js';
import { WebGLUniforms } from './webgl/WebGLUniforms.js';
import { WebGLUtils } from './webgl/WebGLUtils.js';
import { WebXRManager } from './webxr/WebXRManager.js';

class WebGLRenderer {

	constructor( parameters ) {

		parameters = parameters || {};

		this._canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' ),
		this._context = parameters.context !== undefined ? parameters.context : null,
		this._alpha = parameters.alpha !== undefined ? parameters.alpha : false,
		this._depth = parameters.depth !== undefined ? parameters.depth : true,
		this._stencil = parameters.stencil !== undefined ? parameters.stencil : true,
		this._antialias = parameters.antialias !== undefined ? parameters.antialias : false,
		this._premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true,
		this._preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false,
		this._powerPreference = parameters.powerPreference !== undefined ? parameters.powerPreference : 'default';
		this._failIfMajorPerformanceCaveat = parameters.failIfMajorPerformanceCaveat !== undefined ? parameters.failIfMajorPerformanceCaveat : false;

		this.currentRenderList = null;
		this.currentRenderState = null;

		// public properties
		this.domElement = this._canvas;

		// Debug configuration container
		this.debug = {
			/**
			 * Enables error checking and reporting when shader programs are being compiled
			 * @type {boolean}
			 */
			checkShaderErrors: true
		};

		// clearing
		this.autoClear = true;
		this.autoClearColor = true;
		this.autoClearDepth = true;
		this.autoClearStencil = true;

		// scene graph
		this.sortObjects = true;

		// user-defined clipping
		this.clippingPlanes = [];
		this.localClippingEnabled = false;

		// physically based shading
		this.gammaFactor = 2.0; // for backwards compatibility
		this.outputEncoding = LinearEncoding;

		// physical lights
		this.physicallyCorrectLights = false;

		// tone mapping
		this.toneMapping = LinearToneMapping;
		this.toneMappingExposure = 1.0;
		this.toneMappingWhitePoint = 1.0;

		// morphs
		this.maxMorphTargets = 8;
		this.maxMorphNormals = 4;

		// internal properties
		this._isContextLost = false;

		// internal this.state cache
		this._framebuffer = null;
		this._currentActiveCubeFace = 0;
		this._currentActiveMipmapLevel = 0;
		this._currentRenderTarget = null;
		this._currentFramebuffer = null;
		this._currentMaterialId = - 1,

		// geometry and program caching
		this._currentGeometryProgram = {
			geometry: null,
			program: null,
			wireframe: false
		};
		this._currentCamera = null;
		this._currentArrayCamera = null;
		this._currentViewport = new Vector4();
		this._currentScissor = new Vector4();
		this._currentScissorTest = null,

		this._width = this._canvas.width;
		this._height = this._canvas.height;
		this._pixelRatio = 1;
		this._opaqueSort = null;
		this._transparentSort = null;
		this._viewport = new Vector4( 0, 0, this._width, this._height );
		this._scissor = new Vector4( 0, 0, this._width, this._height );
		this._scissorTest = false;

		// frustum
		this._frustum = new Frustum(),

		// clipping
		this._clipping = new WebGLClipping();
		this._clippingEnabled = false;
		this._localClippingEnabled = false;

		// camera matrices cache
		this._projScreenMatrix = new Matrix4();
		this._vector3 = new Vector3();

		// initialize
		this._gl;
		try {

			var contextAttributes = {
				alpha: this._alpha,
				depth: this._depth,
				stencil: this._stencil,
				antialias: this._antialias,
				premultipliedAlpha: this._premultipliedAlpha,
				preserveDrawingBuffer: this._preserveDrawingBuffer,
				powerPreference: this._powerPreference,
				failIfMajorPerformanceCaveat: this._failIfMajorPerformanceCaveat,
				xrCompatible: true
			};

			// event listeners must be registered before WebGL context is created, see #12753
			this._canvas.addEventListener( 'webglcontextlost', this.onContextLost, false );
			this._canvas.addEventListener( 'webglcontextrestored', this.onContextRestore, false );
			this._gl = this._context || this._canvas.getContext( 'webgl', contextAttributes ) || this._canvas.getContext( 'experimental-webgl', contextAttributes );
			if ( this._gl === null ) {

				if ( this._canvas.getContext( 'webgl' ) !== null ) {

					throw new Error( 'Error creating WebGL context with your selected this.attributes.' );

				} else {

					throw new Error( 'Error creating WebGL context.' );

				}

			}
			// Some experimental-webgl implementations do not have getShaderPrecisionFormat
			if ( this._gl.getShaderPrecisionFormat === undefined ) {

				this._gl.getShaderPrecisionFormat = function () {

					return { 'rangeMin': 1, 'rangeMax': 1, 'precision': 1 };

				};

			}

		} catch ( error ) {

			console.error( 'THREE.WebGLRenderer: ' + error.message );
			throw error;

		}

		this.extensions = new WebGLExtensions( this._gl );
		this.capabilities = new WebGLCapabilities( this._gl, this.extensions, parameters );
		if ( this.capabilities.isWebGL2 === false ) {

			this.extensions.get( 'WEBGL_depth_texture' );
			this.extensions.get( 'OES_texture_float' );
			this.extensions.get( 'OES_texture_half_float' );
			this.extensions.get( 'OES_texture_half_float_linear' );
			this.extensions.get( 'OES_standard_derivatives' );
			this.extensions.get( 'OES_element_index_uint' );
			this.extensions.get( 'ANGLE_instanced_arrays' );

		}
		this.extensions.get( 'OES_texture_float_linear' );
		this.utils = new WebGLUtils( this._gl, this.extensions, this.capabilities );
		this.state = new WebGLState( this._gl, this.extensions, this.capabilities );
		this.state.scissor( this._currentScissor.copy( this._scissor ).multiplyScalar( this._pixelRatio ).floor() );
		this.state.viewport( this._currentViewport.copy( this._viewport ).multiplyScalar( this._pixelRatio ).floor() );
		this.info = new WebGLInfo( this._gl );
		this.properties = new WebGLProperties();
		this.textures = new WebGLTextures( this._gl, this.extensions, this.state, this.properties, this.capabilities, this.utils, this.info );
		this.attributes = new WebGLAttributes( this._gl, this.capabilities );
		this.geometries = new WebGLGeometries( this._gl, this.attributes, this.info );
		this.objects = new WebGLObjects( this._gl, this.geometries, this.attributes, this.info );
		this.morphtargets = new WebGLMorphtargets( this._gl );
		this.programCache = new WebGLPrograms( this, this.extensions, this.capabilities );
		this.renderLists = new WebGLRenderLists();
		this.renderStates = new WebGLRenderStates();
		this.background = new WebGLBackground( this, this.state, this.objects, this._premultipliedAlpha );
		this.bufferRenderer = new WebGLBufferRenderer( this._gl, this.extensions, this.info, this.capabilities );
		this.indexedBufferRenderer = new WebGLIndexedBufferRenderer( this._gl, this.extensions, this.info, this.capabilities );
		this.info.programs = this.programCache.programs;

		// TODO: DefinitelyMaybe: Write WebXRManager in a class
		// xr
		this.xr = new WebXRManager( this, this._gl );

		// shadow map
		this.shadowMap = new WebGLShadowMap( this, this.objects, this.capabilities.maxTextureSize );

		// Animation Loop
		this.onAnimationFrameCallback = null;
		this.animation = new WebGLAnimation();
		this.animation.setAnimationLoop( this.onAnimationFrame );
		if ( typeof window !== 'undefined' )
			this.animation.setContext( window );

		this.tempScene = new Scene();

		if ( typeof __THREE_DEVTOOLS__ !== 'undefined' ) {

			__THREE_DEVTOOLS__.dispatchEvent( new CustomEvent( 'observe', { detail: this } ) ); // eslint-disable-line no-undef

		}

	}

	getTargetPixelRatio() {

		return this._currentRenderTarget === null ? this._pixelRatio : 1;

	}

	// API
	getContext() {

		return this._gl;

	}

	getContextAttributes() {

		return this._gl.getContextAttributes();

	}

	forceContextLoss() {

		var extension = this.extensions.get( 'WEBGL_lose_context' );
		if ( extension )
			extension.loseContext();

	}

	forceContextRestore() {

		var extension = this.extensions.get( 'WEBGL_lose_context' );
		if ( extension )
			extension.restoreContext();

	}

	getPixelRatio() {

		return this._pixelRatio;

	}

	setPixelRatio( value ) {

		if ( value === undefined )
			return;
		this._pixelRatio = value;
		this.setSize( this._width, this._height, false );

	}

	getSize( target ) {

		if ( target === undefined ) {

			console.warn( 'WebGLRenderer: .getsize() now requires a Vector2 as an argument' );
			target = new Vector2();

		}
		return target.set( this._width, this._height );

	}

	setSize( width, height, updateStyle ) {

		if ( this.xr.isPresenting ) {

			console.warn( 'THREE.WebGLRenderer: Can\'t change size while VR device is presenting.' );
			return;

		}
		this._width = width;
		this._height = height;
		this._canvas.width = Math.floor( width * this._pixelRatio );
		this._canvas.height = Math.floor( height * this._pixelRatio );
		if ( updateStyle !== false ) {

			this._canvas.style.width = width + 'px';
			this._canvas.style.height = height + 'px';

		}
		this.setViewport( 0, 0, width, height );

	}

	getDrawingBufferSize( target ) {

		if ( target === undefined ) {

			console.warn( 'WebGLRenderer: .getdrawingBufferSize() now requires a Vector2 as an argument' );
			target = new Vector2();

		}
		return target.set( this._width * this._pixelRatio, this._height * this._pixelRatio ).floor();

	}

	setDrawingBufferSize( width, height, pixelRatio ) {

		this._width = width;
		this._height = height;
		this._pixelRatio = pixelRatio;
		this._canvas.width = Math.floor( width * pixelRatio );
		this._canvas.height = Math.floor( height * pixelRatio );
		this.setViewport( 0, 0, width, height );

	}

	getCurrentViewport( target ) {

		if ( target === undefined ) {

			console.warn( 'WebGLRenderer: .getCurrentViewport() now requires a Vector4 as an argument' );
			target = new Vector4();

		}
		return target.copy( this._currentViewport );

	}

	getViewport( target ) {

		return target.copy( this._viewport );

	}

	setViewport( x, y, width, height ) {

		if ( x.isVector4 ) {

			this._viewport.set( x.x, x.y, x.z, x.w );

		} else {

			this._viewport.set( x, y, width, height );

		}
		this.state.viewport( this._currentViewport.copy( this._viewport ).multiplyScalar( this._pixelRatio ).floor() );

	}

	getScissor( target ) {

		return target.copy( this._scissor );

	}

	setScissor( x, y, width, height ) {

		if ( x.isVector4 ) {

			this._scissor.set( x.x, x.y, x.z, x.w );

		} else {

			this._scissor.set( x, y, width, height );

		}
		this.state.scissor( this._currentScissor.copy( this._scissor ).multiplyScalar( this._pixelRatio ).floor() );

	}

	getScissorTest() {

		return this._scissorTest;

	}

	setScissorTest( boolean ) {

		this.state.setScissorTest( this._scissorTest = boolean );

	}

	setOpaqueSort( method ) {

		this._opaqueSort = method;

	}

	setTransparentSort( method ) {

		this._transparentSort = method;

	}

	// Clearing
	getClearColor() {

		return this.background.getClearColor();

	}

	setClearColor() {

		this.background.setClearColor.apply( this.background, arguments );

	}

	getClearAlpha() {

		return this.background.getClearAlpha();

	}

	setClearAlpha() {

		this.background.setClearAlpha.apply( this.background, arguments );

	}

	clear( color, depth, stencil ) {

		var bits = 0;
		if ( color === undefined || color )
			bits |= _gl.COLOR_BUFFER_BIT;
		if ( depth === undefined || depth )
			bits |= _gl.DEPTH_BUFFER_BIT;
		if ( stencil === undefined || stencil )
			bits |= _gl.STENCIL_BUFFER_BIT;
		this._gl.clear( bits );

	}

	clearColor() {

		this.clear( true, false, false );

	}

	clearDepth() {

		this.clear( false, true, false );

	}

	clearStencil() {

		this.clear( false, false, true );

	}

	//
	dispose() {

		this._canvas.removeEventListener( 'webglcontextlost', this.onContextLost, false );
		this._canvas.removeEventListener( 'webglcontextrestored', this.onContextRestore, false );
		this.renderLists.dispose();
		this.renderStates.dispose();
		this.properties.dispose();
		this.objects.dispose();
		this.xr.dispose();
		this.animation.stop();
		this.forceContextLoss();

	}

	// Events
	onContextLost( event ) {

		event.preventDefault();
		console.log( 'THREE.WebGLRenderer: Context Lost.' );
		this._isContextLost = true;

	}

	onContextRestore( /* event */ ) {

		console.log( 'THREE.WebGLRenderer: Context Restored.' );
		this._isContextLost = false;
		// TODO (DefinitelyMaybe): This function doesn't seem to exist. Was picked up by the linter.
		initGLContext();

	}

	onMaterialDispose( event ) {

		var material = event.target;
		material.removeEventListener( 'dispose', this.onMaterialDispose );
		this.deallocateMaterial( material );

	}

	// Buffer deallocation
	deallocateMaterial( material ) {

		this.releaseMaterialProgramReference( material );
		this.properties.remove( material );

	}

	releaseMaterialProgramReference( material ) {

		var programInfo = this.properties.get( material ).program;
		material.program = undefined;
		if ( programInfo !== undefined ) {

			this.programCache.releaseProgram( programInfo );

		}

	}

	// Buffer rendering
	renderObjectImmediate( object, program ) {

		object.render( function ( object ) {

			this.renderBufferImmediate( object, program );

		} );

	}

	renderBufferImmediate( object, program ) {

		this.state.initAttributes();
		var buffers = this.properties.get( object );
		if ( object.hasPositions && ! buffers.position )
			buffers.position = this._gl.createBuffer();
		if ( object.hasNormals && ! buffers.normal )
			buffers.normal = this._gl.createBuffer();
		if ( object.hasUvs && ! buffers.uv )
			buffers.uv = this._gl.createBuffer();
		if ( object.hasColors && ! buffers.color )
			buffers.color = this._gl.createBuffer();
		var programAttributes = program.getAttributes();
		if ( object.hasPositions ) {

			this._gl.bindBuffer( _gl.ARRAY_BUFFER, buffers.position );
			this._gl.bufferData( _gl.ARRAY_BUFFER, object.positionArray, _gl.DYNAMIC_DRAW );
			this.state.enableAttribute( programAttributes.position );
			this._gl.vertexAttribPointer( programAttributes.position, 3, _gl.FLOAT, false, 0, 0 );

		}
		if ( object.hasNormals ) {

			this._gl.bindBuffer( _gl.ARRAY_BUFFER, buffers.normal );
			this._gl.bufferData( _gl.ARRAY_BUFFER, object.normalArray, _gl.DYNAMIC_DRAW );
			this.state.enableAttribute( programAttributes.normal );
			this._gl.vertexAttribPointer( programAttributes.normal, 3, _gl.FLOAT, false, 0, 0 );

		}
		if ( object.hasUvs ) {

			this._gl.bindBuffer( _gl.ARRAY_BUFFER, buffers.uv );
			this._gl.bufferData( _gl.ARRAY_BUFFER, object.uvArray, _gl.DYNAMIC_DRAW );
			this.state.enableAttribute( programAttributes.uv );
			this._gl.vertexAttribPointer( programAttributes.uv, 2, _gl.FLOAT, false, 0, 0 );

		}
		if ( object.hasColors ) {

			this._gl.bindBuffer( _gl.ARRAY_BUFFER, buffers.color );
			this._gl.bufferData( _gl.ARRAY_BUFFER, object.colorArray, _gl.DYNAMIC_DRAW );
			this.state.enableAttribute( programAttributes.color );
			this._gl.vertexAttribPointer( programAttributes.color, 3, _gl.FLOAT, false, 0, 0 );

		}
		this.state.disableUnusedAttributes();
		this._gl.drawArrays( _gl.TRIANGLES, 0, object.count );
		object.count = 0;

	}

	renderBufferDirect( camera, scene, geometry, material, object, group ) {

		if ( scene === null )
			scene = this.tempScene; // renderBufferDirect second parameter used to be fog (could be null)
		var frontFaceCW = ( object.isMesh && object.matrixWorld.determinant() < 0 );
		var program = this.setProgram( camera, scene, material, object );
		this.state.setMaterial( material, frontFaceCW );
		var updateBuffers = false;
		if ( this._currentGeometryProgram.geometry !== geometry.id ||
			this._currentGeometryProgram.program !== program.id ||
			this._currentGeometryProgram.wireframe !== ( material.wireframe === true ) ) {

			this._currentGeometryProgram.geometry = geometry.id;
			this._currentGeometryProgram.program = program.id;
			this._currentGeometryProgram.wireframe = material.wireframe === true;
			updateBuffers = true;

		}
		if ( material.morphTargets || material.morphNormals ) {

			this.morphtargets.update( object, geometry, material, program );
			updateBuffers = true;

		}
		//
		var index = geometry.index;
		var position = geometry.attributes.position;
		//
		if ( index === null ) {

			if ( position === undefined || position.count === 0 )
				return;

		} else if ( index.count === 0 ) {

			return;

		}
		//
		var rangeFactor = 1;
		if ( material.wireframe === true ) {

			index = this.geometries.getWireframeAttribute( geometry );
			rangeFactor = 2;

		}
		var attribute;
		var renderer = this.bufferRenderer;
		if ( index !== null ) {

			attribute = this.attributes.get( index );
			renderer = this.indexedBufferRenderer;
			renderer.setIndex( attribute );

		}
		if ( updateBuffers ) {

			this.setupVertexAttributes( object, geometry, material, program );
			if ( index !== null ) {

				this._gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, attribute.buffer );

			}

		}
		//
		var dataCount = ( index !== null ) ? index.count : position.count;
		var rangeStart = geometry.drawRange.start * rangeFactor;
		var rangeCount = geometry.drawRange.count * rangeFactor;
		var groupStart = group !== null ? group.start * rangeFactor : 0;
		var groupCount = group !== null ? group.count * rangeFactor : Infinity;
		var drawStart = Math.max( rangeStart, groupStart );
		var drawEnd = Math.min( dataCount, rangeStart + rangeCount, groupStart + groupCount ) - 1;
		var drawCount = Math.max( 0, drawEnd - drawStart + 1 );
		if ( drawCount === 0 )
			return;
		//
		if ( object.isMesh ) {

			if ( material.wireframe === true ) {

				this.state.setLineWidth( material.wireframeLinewidth * this.getTargetPixelRatio() );
				renderer.setMode( _gl.LINES );

			} else {

				renderer.setMode( _gl.TRIANGLES );

			}

		} else if ( object.isLine ) {

			var lineWidth = material.linewidth;
			if ( lineWidth === undefined )
				lineWidth = 1; // Not using Line*Material
			this.state.setLineWidth( lineWidth * this.getTargetPixelRatio() );
			if ( object.isLineSegments ) {

				renderer.setMode( _gl.LINES );

			} else if ( object.isLineLoop ) {

				renderer.setMode( _gl.LINE_LOOP );

			} else {

				renderer.setMode( _gl.LINE_STRIP );

			}

		} else if ( object.isPoints ) {

			renderer.setMode( _gl.POINTS );

		} else if ( object.isSprite ) {

			renderer.setMode( _gl.TRIANGLES );

		}
		if ( object.isInstancedMesh ) {

			renderer.renderInstances( geometry, drawStart, drawCount, object.count );

		} else if ( geometry.isInstancedBufferGeometry ) {

			renderer.renderInstances( geometry, drawStart, drawCount, geometry.maxInstancedCount );

		} else {

			renderer.render( drawStart, drawCount );

		}

	}

	setupVertexAttributes( object, geometry, material, program ) {

		if ( this.capabilities.isWebGL2 === false && ( object.isInstancedMesh || geometry.isInstancedBufferGeometry ) ) {

			if ( this.extensions.get( 'ANGLE_instanced_arrays' ) === null )
				return;

		}
		this.state.initAttributes();
		var geometryAttributes = geometry.attributes;
		var programAttributes = program.getAttributes();
		var materialDefaultAttributeValues = material.defaultAttributeValues;
		for ( var name in programAttributes ) {

			var programAttribute = programAttributes[ name ];
			if ( programAttribute >= 0 ) {

				var geometryAttribute = geometryAttributes[ name ];
				if ( geometryAttribute !== undefined ) {

					var normalized = geometryAttribute.normalized;
					var size = geometryAttribute.itemSize;
					var attribute = this.attributes.get( geometryAttribute );
					// TODO Attribute may not be available on context restore
					if ( attribute === undefined )
						continue;
					var buffer = attribute.buffer;
					var type = attribute.type;
					var bytesPerElement = attribute.bytesPerElement;
					if ( geometryAttribute.isInterleavedBufferAttribute ) {

						var data = geometryAttribute.data;
						var stride = data.stride;
						var offset = geometryAttribute.offset;
						if ( data && data.isInstancedInterleavedBuffer ) {

							this.state.enableAttributeAndDivisor( programAttribute, data.meshPerAttribute );
							if ( geometry.maxInstancedCount === undefined ) {

								geometry.maxInstancedCount = data.meshPerAttribute * data.count;

							}

						} else {

							this.state.enableAttribute( programAttribute );

						}
						this._gl.bindBuffer( _gl.ARRAY_BUFFER, buffer );
						this._gl.vertexAttribPointer( programAttribute, size, type, normalized, stride * bytesPerElement, offset * bytesPerElement );

					} else {

						if ( geometryAttribute.isInstancedBufferAttribute ) {

							this.state.enableAttributeAndDivisor( programAttribute, geometryAttribute.meshPerAttribute );
							if ( geometry.maxInstancedCount === undefined ) {

								geometry.maxInstancedCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;

							}

						} else {

							this.state.enableAttribute( programAttribute );

						}
						this._gl.bindBuffer( _gl.ARRAY_BUFFER, buffer );
						this._gl.vertexAttribPointer( programAttribute, size, type, normalized, 0, 0 );

					}

				} else if ( name === 'instanceMatrix' ) {

					var attribute = this.attributes.get( object.instanceMatrix );
					// TODO Attribute may not be available on context restore
					if ( attribute === undefined )
						continue;
					var buffer = attribute.buffer;
					var type = attribute.type;
					this.state.enableAttributeAndDivisor( programAttribute + 0, 1 );
					this.state.enableAttributeAndDivisor( programAttribute + 1, 1 );
					this.state.enableAttributeAndDivisor( programAttribute + 2, 1 );
					this.state.enableAttributeAndDivisor( programAttribute + 3, 1 );
					this._gl.bindBuffer( _gl.ARRAY_BUFFER, buffer );
					this._gl.vertexAttribPointer( programAttribute + 0, 4, type, false, 64, 0 );
					this._gl.vertexAttribPointer( programAttribute + 1, 4, type, false, 64, 16 );
					this._gl.vertexAttribPointer( programAttribute + 2, 4, type, false, 64, 32 );
					this._gl.vertexAttribPointer( programAttribute + 3, 4, type, false, 64, 48 );

				} else if ( materialDefaultAttributeValues !== undefined ) {

					var value = materialDefaultAttributeValues[ name ];
					if ( value !== undefined ) {

						switch ( value.length ) {

							case 2:
								this._gl.vertexAttrib2fv( programAttribute, value );
								break;
							case 3:
								this._gl.vertexAttrib3fv( programAttribute, value );
								break;
							case 4:
								this._gl.vertexAttrib4fv( programAttribute, value );
								break;
							default:
								this._gl.vertexAttrib1fv( programAttribute, value );

						}

					}

				}

			}

		}
		this.state.disableUnusedAttributes();

	}

	// Compile
	compile( scene, camera ) {

		this.currentRenderState = this.renderStates.get( scene, camera );
		this.currentRenderState.init();
		scene.traverse( function ( object ) {

			if ( object.isLight ) {

				this.currentRenderState.pushLight( object );
				if ( object.castShadow ) {

					this.currentRenderState.pushShadow( object );

				}

			}

		} );
		this.currentRenderState.setupLights( camera );
		var compiled = {};
		scene.traverse( function ( object ) {

			if ( object.material ) {

				if ( Array.isArray( object.material ) ) {

					for ( var i = 0; i < object.material.length; i ++ ) {

						if ( object.material[ i ].uuid in compiled === false ) {

							WebGLRenderer.initMaterial( object.material[ i ], scene, object, this );
							compiled[ object.material[ i ].uuid ] = true;

						}

					}

				} else if ( object.material.uuid in compiled === false ) {

					WebGLRenderer.initMaterial( object.material, scene, object, this );
					compiled[ object.material.uuid ] = true;

				}

			}

		} );

	}

	// Animation
	onAnimationFrame( time ) {

		if ( this.xr.isPresenting )
			return;
		if ( this.onAnimationFrameCallback )
			this.onAnimationFrameCallback( time );

	}

	setAnimationLoop( callback ) {

		this.onAnimationFrameCallback = callback;
		this.xr.setAnimationLoop( callback );
		this.animation.start();

	}

	// Rendering
	render( scene, camera ) {

		var renderTarget, forceClear;
		if ( arguments[ 2 ] !== undefined ) {

			console.warn( 'THREE.WebGLRenderer.render(): the renderTarget argument has been removed. Use .setRenderTarget() instead.' );
			renderTarget = arguments[ 2 ];

		}
		if ( arguments[ 3 ] !== undefined ) {

			console.warn( 'THREE.WebGLRenderer.render(): the forceClear argument has been removed. Use .clear() instead.' );
			forceClear = arguments[ 3 ];

		}
		if ( ! ( camera && camera.isCamera ) ) {

			console.error( 'THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.' );
			return;

		}
		if ( this._isContextLost )
			return;
		// reset caching for this frame
		this._currentGeometryProgram.geometry = null;
		this._currentGeometryProgram.program = null;
		this._currentGeometryProgram.wireframe = false;
		this._currentMaterialId = - 1;
		this._currentCamera = null;
		// update scene graph
		if ( scene.autoUpdate === true )
			scene.updateMatrixWorld();
		// update camera matrices and frustum
		if ( camera.parent === null )
			camera.updateMatrixWorld();
		if ( this.xr.enabled && this.xr.isPresenting ) {

			camera = this.xr.getCamera( camera );

		}
		//
		this.currentRenderState = this.renderStates.get( scene, camera );
		this.currentRenderState.init();

		scene.onBeforeRender( this, scene, camera, renderTarget || this._currentRenderTarget );

		this._projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );

		this._frustum.setFromProjectionMatrix( this._projScreenMatrix );

		this._localClippingEnabled = this.localClippingEnabled;
		this._clippingEnabled = this._clipping.init( this.clippingPlanes, this._localClippingEnabled, camera );

		this.currentRenderList = this.renderLists.get( scene, camera );
		this.currentRenderList.init();

		this.projectObject( scene, camera, 0, this.sortObjects );

		this.currentRenderList.finish();
		if ( this.sortObjects === true ) {

			this.currentRenderList.sort( this._opaqueSort, this._transparentSort );

		}
		//
		if ( this._clippingEnabled )
			this._clipping.beginShadows();
		var shadowsArray = this.currentRenderState.state.shadowsArray;
		this.shadowMap.render( shadowsArray, scene, camera );
		this.currentRenderState.setupLights( camera );
		if ( this._clippingEnabled )
			this._clipping.endShadows();
		//
		if ( this.info.autoReset )
			this.info.reset();
		if ( renderTarget !== undefined ) {

			this.setRenderTarget( renderTarget );

		}

		//
		this.background.render( this.currentRenderList, scene, camera, forceClear );

		// render scene
		var opaqueObjects = this.currentRenderList.opaque;
		var transparentObjects = this.currentRenderList.transparent;
		if ( scene.overrideMaterial ) {

			var overrideMaterial = scene.overrideMaterial;
			if ( opaqueObjects.length )
				this.renderObjects( opaqueObjects, scene, camera, overrideMaterial );
			if ( transparentObjects.length )
				this.renderObjects( transparentObjects, scene, camera, overrideMaterial );

		} else {

			// opaque pass (front-to-back order)
			if ( opaqueObjects.length )
				this.renderObjects( opaqueObjects, scene, camera );
			// transparent pass (back-to-front order)
			if ( transparentObjects.length )
				this.renderObjects( transparentObjects, scene, camera );

		}
		//
		scene.onAfterRender( this, scene, camera );
		//
		if ( this._currentRenderTarget !== null ) {

			// Generate mipmap if we're using any kind of mipmap filtering
			this.textures.updateRenderTargetMipmap( this._currentRenderTarget );
			// resolve multisample renderbuffers to a single-sample texture if necessary
			this.textures.updateMultisampleRenderTarget( this._currentRenderTarget );

		}
		// Ensure depth buffer writing is enabled so it can be cleared on next render
		this.state.buffers.depth.setTest( true );
		this.state.buffers.depth.setMask( true );
		this.state.buffers.color.setMask( true );
		this.state.setPolygonOffset( false );
		// this._gl.finish();
		this.currentRenderList = null;
		this.currentRenderState = null;

	}

	projectObject( object, camera, groupOrder, sortObjects ) {

		if ( object.visible === false )
			return;
		var visible = object.layers.test( camera.layers );
		if ( visible ) {

			if ( object.isGroup ) {

				groupOrder = object.renderOrder;

			} else if ( object.isLOD ) {

				if ( object.autoUpdate === true )
					object.update( camera );

			} else if ( object.isLight ) {

				this.currentRenderState.pushLight( object );
				if ( object.castShadow ) {

					this.currentRenderState.pushShadow( object );

				}

			} else if ( object.isSprite ) {

				if ( ! object.frustumCulled || this._frustum.intersectsSprite( object ) ) {

					if ( sortObjects ) {

						this._vector3.setFromMatrixPosition( object.matrixWorld )
							.applyMatrix4( this._projScreenMatrix );

					}
					var geometry = this.objects.update( object );
					var material = object.material;
					if ( material.visible ) {

						this.currentRenderList.push( object, geometry, material, groupOrder, this._vector3.z, null );

					}

				}

			} else if ( object.isImmediateRenderObject ) {

				if ( sortObjects ) {

					this._vector3.setFromMatrixPosition( object.matrixWorld )
						.applyMatrix4( this._projScreenMatrix );

				}
				this.currentRenderList.push( object, null, object.material, groupOrder, this._vector3.z, null );

			} else if ( object.isMesh || object.isLine || object.isPoints ) {

				if ( object.isSkinnedMesh ) {

					// update skeleton only once in a frame
					if ( object.skeleton.frame !== this.info.render.frame ) {

						object.skeleton.update();
						object.skeleton.frame = this.info.render.frame;

					}

				}
				if ( ! object.frustumCulled || this._frustum.intersectsObject( object ) ) {

					if ( sortObjects ) {

						this._vector3.setFromMatrixPosition( object.matrixWorld )
							.applyMatrix4( this._projScreenMatrix );

					}
					var geometry = this.objects.update( object );
					var material = object.material;
					if ( Array.isArray( material ) ) {

						var groups = geometry.groups;
						for ( var i = 0, l = groups.length; i < l; i ++ ) {

							var group = groups[ i ];
							var groupMaterial = material[ group.materialIndex ];
							if ( groupMaterial && groupMaterial.visible ) {

								this.currentRenderList.push( object, geometry, groupMaterial, groupOrder, this._vector3.z, group );

							}

						}

					} else if ( material.visible ) {

						this.currentRenderList.push( object, geometry, material, groupOrder, this._vector3.z, null );

					}

				}

			}

		}
		var children = object.children;
		for ( var i = 0, l = children.length; i < l; i ++ ) {

			this.projectObject( children[ i ], camera, groupOrder, sortObjects );

		}

	}

	renderObjects( renderList, scene, camera, overrideMaterial ) {

		for ( var i = 0, l = renderList.length; i < l; i ++ ) {

			var renderItem = renderList[ i ];
			var object = renderItem.object;
			var geometry = renderItem.geometry;
			var material = overrideMaterial === undefined ? renderItem.material : overrideMaterial;
			var group = renderItem.group;
			if ( camera.isArrayCamera ) {

				this._currentArrayCamera = camera;
				var cameras = camera.cameras;
				for ( var j = 0, jl = cameras.length; j < jl; j ++ ) {

					var camera2 = cameras[ j ];
					if ( object.layers.test( camera2.layers ) ) {

						this.state.viewport( this._currentViewport.copy( camera2.viewport ) );
						this.currentRenderState.setupLights( camera2 );
						this.renderObject( object, scene, camera2, geometry, material, group );

					}

				}

			} else {

				this._currentArrayCamera = null;
				this.renderObject( object, scene, camera, geometry, material, group );

			}

		}

	}

	renderObject( object, scene, camera, geometry, material, group ) {

		object.onBeforeRender( this, scene, camera, geometry, material, group );
		this.currentRenderState = this.renderStates.get( scene, this._currentArrayCamera || camera );
		object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
		object.normalMatrix.getNormalMatrix( object.modelViewMatrix );
		if ( object.isImmediateRenderObject ) {

			var program = this.setProgram( camera, scene, material, object );
			this.state.setMaterial( material );
			this._currentGeometryProgram.geometry = null;
			this._currentGeometryProgram.program = null;
			this._currentGeometryProgram.wireframe = false;
			this.renderObjectImmediate( object, program );

		} else {

			this.renderBufferDirect( camera, scene, geometry, material, object, group );

		}
		object.onAfterRender( this, scene, camera, geometry, material, group );
		this.currentRenderState = this.renderStates.get( scene, this._currentArrayCamera || camera );

	}

	static initMaterial( material, scene, object, instance ) {

		var materialProperties = instance.properties.get( material );
		var lights = instance.currentRenderState.state.lights;
		var shadowsArray = instance.currentRenderState.state.shadowsArray;
		var lightsStateVersion = lights.state.version;
		var parameters = instance.programCache.getParameters( material, lights.state, shadowsArray, scene, instance._clipping.numPlanes, instance._clipping.numIntersection, object );
		var programCacheKey = instance.programCache.getProgramCacheKey( parameters );
		var program = materialProperties.program;
		var programChange = true;
		if ( program === undefined ) {

			// new material
			material.addEventListener( 'dispose', instance.onMaterialDispose );

		} else if ( program.cacheKey !== programCacheKey ) {

			// changed glsl or parameters
			instance.releaseMaterialProgramReference( material );

		} else if ( materialProperties.lightsStateVersion !== lightsStateVersion ) {

			materialProperties.lightsStateVersion = lightsStateVersion;
			programChange = false;

		} else if ( parameters.shaderID !== undefined ) {

			// same glsl and uniform list
			return;

		} else {

			// only rebuild uniform list
			programChange = false;

		}
		if ( programChange ) {

			program = instance.programCache.acquireProgram( parameters, programCacheKey );
			materialProperties.program = program;
			materialProperties.uniforms = parameters.uniforms;
			materialProperties.environment = material.isMeshStandardMaterial ? scene.environment : null;
			materialProperties.outputEncoding = instance.outputEncoding;
			material.program = program;

		}
		var programAttributes = program.getAttributes();
		if ( material.morphTargets ) {

			material.numSupportedMorphTargets = 0;
			for ( var i = 0; i < instance.maxMorphTargets; i ++ ) {

				if ( programAttributes[ 'morphTarget' + i ] >= 0 ) {

					material.numSupportedMorphTargets ++;

				}

			}

		}
		if ( material.morphNormals ) {

			material.numSupportedMorphNormals = 0;
			for ( var i = 0; i < instance.maxMorphNormals; i ++ ) {

				if ( programAttributes[ 'morphNormal' + i ] >= 0 ) {

					material.numSupportedMorphNormals ++;

				}

			}

		}
		var uniforms = materialProperties.uniforms;
		if ( ! material.isShaderMaterial &&
			! material.isRawShaderMaterial ||
			material.clipping === true ) {

			materialProperties.numClippingPlanes = instance._clipping.numPlanes;
			materialProperties.numIntersection = instance._clipping.numIntersection;
			uniforms.clippingPlanes = instance._clipping.uniform;

		}
		materialProperties.fog = scene.fog;
		// store the light setup it was created for
		materialProperties.needsLights = instance.materialNeedsLights( material );
		materialProperties.lightsStateVersion = lightsStateVersion;
		if ( materialProperties.needsLights ) {

			// wire up the material to this renderer's lighting state
			uniforms.ambientLightColor.value = lights.state.ambient;
			uniforms.lightProbe.value = lights.state.probe;
			uniforms.directionalLights.value = lights.state.directional;
			uniforms.directionalLightShadows.value = lights.state.directionalShadow;
			uniforms.spotLights.value = lights.state.spot;
			uniforms.spotLightShadows.value = lights.state.spotShadow;
			uniforms.rectAreaLights.value = lights.state.rectArea;
			uniforms.pointLights.value = lights.state.point;
			uniforms.pointLightShadows.value = lights.state.pointShadow;
			uniforms.hemisphereLights.value = lights.state.hemi;
			uniforms.directionalShadowMap.value = lights.state.directionalShadowMap;
			uniforms.directionalShadowMatrix.value = lights.state.directionalShadowMatrix;
			uniforms.spotShadowMap.value = lights.state.spotShadowMap;
			uniforms.spotShadowMatrix.value = lights.state.spotShadowMatrix;
			uniforms.pointShadowMap.value = lights.state.pointShadowMap;
			uniforms.pointShadowMatrix.value = lights.state.pointShadowMatrix;
			// TODO (abelnation): add area lights shadow info to uniforms

		}
		var progUniforms = materialProperties.program.getUniforms(),
		 uniformsList = WebGLUniforms.seqWithValue( progUniforms.seq, uniforms );
		materialProperties.uniformsList = uniformsList;

	}

	setProgram( camera, scene, material, object ) {

		this.textures.resetTextureUnits();
		var fog = scene.fog;
		var environment = material.isMeshStandardMaterial ? scene.environment : null;

		var materialProperties = this.properties.get( material );

		var lights = this.currentRenderState.state.lights;
		if ( this._clippingEnabled ) {

			if ( this._localClippingEnabled || camera !== this._currentCamera ) {

				var useCache = camera === this._currentCamera &&
					material.id === this._currentMaterialId;
				// we might want to call this function with some ClippingGroup
				// object instead of the material, once it becomes feasible
				// (#8465, #8379)
				this._clipping.setState( material.clippingPlanes, material.clipIntersection, material.clipShadows, camera, materialProperties, useCache );

			}

		}
		if ( material.version === materialProperties.__version ) {

			if ( materialProperties.program === undefined ) {

				WebGLRenderer.initMaterial( material, scene, object, this );

			} else if ( material.fog && materialProperties.fog !== fog ) {

				WebGLRenderer.initMaterial( material, scene, object, this );

			} else if ( materialProperties.environment !== environment ) {

				WebGLRenderer.initMaterial( material, scene, object, this );

			} else if ( materialProperties.needsLights && ( materialProperties.lightsStateVersion !== lights.state.version ) ) {

				WebGLRenderer.initMaterial( material, scene, object, this );

			} else if ( materialProperties.numClippingPlanes !== undefined &&
				( materialProperties.numClippingPlanes !== this._clipping.numPlanes ||
					materialProperties.numIntersection !== this._clipping.numIntersection ) ) {

				WebGLRenderer.initMaterial( material, scene, object, this );

			} else if ( materialProperties.outputEncoding !== this.outputEncoding ) {

				WebGLRenderer.initMaterial( material, scene, object, this );

			}

		} else {

			WebGLRenderer.initMaterial( material, scene, object, this );
			materialProperties.__version = material.version;

		}
		var refreshProgram = false;
		var refreshMaterial = false;
		var refreshLights = false;

		var program = materialProperties.program;

		var p_uniforms = program.getUniforms();
		var m_uniforms = materialProperties.uniforms;
		if ( this.state.useProgram( program.program ) ) {

			refreshProgram = true;
			refreshMaterial = true;
			refreshLights = true;

		}
		if ( material.id !== this._currentMaterialId ) {

			this._currentMaterialId = material.id;
			refreshMaterial = true;

		}
		if ( refreshProgram || this._currentCamera !== camera ) {

			p_uniforms.setValue( this._gl, 'projectionMatrix', camera.projectionMatrix );
			if ( this.capabilities.logarithmicDepthBuffer ) {

				p_uniforms.setValue( this._gl, 'logDepthBufFC', 2.0 / ( Math.log( camera.far + 1.0 ) / Math.LN2 ) );

			}
			if ( this._currentCamera !== camera ) {

				this._currentCamera = camera;
				// lighting uniforms depend on the camera so enforce an update
				// now, in case this material supports lights - or later, when
				// the next material that does gets activated:
				refreshMaterial = true; // set to true on material change
				refreshLights = true; // remains set until update done

			}
			// load material specific uniforms
			// (shader material also gets them for the sake of genericity)
			if ( material.isShaderMaterial ||
				material.isMeshPhongMaterial ||
				material.isMeshToonMaterial ||
				material.isMeshStandardMaterial ||
				material.envMap ) {

				var uCamPos = p_uniforms.map.cameraPosition;
				if ( uCamPos !== undefined ) {

					uCamPos.setValue( this._gl, this._vector3.setFromMatrixPosition( camera.matrixWorld ) );

				}

			}
			if ( material.isMeshPhongMaterial ||
				material.isMeshToonMaterial ||
				material.isMeshLambertMaterial ||
				material.isMeshBasicMaterial ||
				material.isMeshStandardMaterial ||
				material.isShaderMaterial ) {

				p_uniforms.setValue( this._gl, 'isOrthographic', camera.isOrthographicCamera === true );

			}
			if ( material.isMeshPhongMaterial ||
				material.isMeshToonMaterial ||
				material.isMeshLambertMaterial ||
				material.isMeshBasicMaterial ||
				material.isMeshStandardMaterial ||
				material.isShaderMaterial ||
				material.skinning ) {

				p_uniforms.setValue( this._gl, 'viewMatrix', camera.matrixWorldInverse );

			}

		}
		// skinning uniforms must be set even if material didn't change
		// auto-setting of texture unit for bone texture must go before other textures
		// otherwise textures used for skinning can take over texture units reserved for other material textures
		if ( material.skinning ) {

			p_uniforms.setOptional( this._gl, object, 'bindMatrix' );
			p_uniforms.setOptional( this._gl, object, 'bindMatrixInverse' );
			var skeleton = object.skeleton;
			if ( skeleton ) {

				var bones = skeleton.bones;
				if ( this.capabilities.floatVertexTextures ) {

					if ( skeleton.boneTexture === undefined ) {

						// layout (1 matrix = 4 pixels)
						//      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
						//  with  8x8  pixel texture max   16 bones * 4 pixels =  (8 * 8)
						//       16x16 pixel texture max   64 bones * 4 pixels = (16 * 16)
						//       32x32 pixel texture max  256 bones * 4 pixels = (32 * 32)
						//       64x64 pixel texture max 1024 bones * 4 pixels = (64 * 64)
						var size = Math.sqrt( bones.length * 4 ); // 4 pixels needed for 1 matrix
						size = MathUtils.ceilPowerOfTwo( size );
						size = Math.max( size, 4 );
						var boneMatrices = new Float32Array( size * size * 4 ); // 4 floats per RGBA pixel
						boneMatrices.set( skeleton.boneMatrices ); // copy current values
						var boneTexture = new DataTexture( boneMatrices, size, size, RGBAFormat, FloatType );
						skeleton.boneMatrices = boneMatrices;
						skeleton.boneTexture = boneTexture;
						skeleton.boneTextureSize = size;

					}
					p_uniforms.setValue( this._gl, 'boneTexture', skeleton.boneTexture, this.textures );
					p_uniforms.setValue( this._gl, 'boneTextureSize', skeleton.boneTextureSize );

				} else {

					p_uniforms.setOptional( this._gl, skeleton, 'boneMatrices' );

				}

			}

		}
		if ( refreshMaterial || materialProperties.receiveShadow !== object.receiveShadow ) {

			materialProperties.receiveShadow = object.receiveShadow;
			p_uniforms.setValue( this._gl, 'receiveShadow', object.receiveShadow );

		}
		if ( refreshMaterial ) {

			p_uniforms.setValue( this._gl, 'toneMappingExposure', this.toneMappingExposure );
			p_uniforms.setValue( this._gl, 'toneMappingWhitePoint', this.toneMappingWhitePoint );
			if ( materialProperties.needsLights ) {

				// the current material requires lighting this.info
				// note: all lighting uniforms are always set correctly
				// they simply reference the renderer's this.state for their
				// values
				//
				// use the current material's .needsUpdate flags to set
				// the GL this.state when required
				this.markUniformsLightsNeedsUpdate( m_uniforms, refreshLights );

			}
			// refresh uniforms common to several materials
			if ( fog && material.fog ) {

				this.refreshUniformsFog( m_uniforms, fog );

			}
			if ( material.isMeshBasicMaterial ) {

				this.refreshUniformsCommon( m_uniforms, material );

			} else if ( material.isMeshLambertMaterial ) {

				this.refreshUniformsCommon( m_uniforms, material );
				this.refreshUniformsLambert( m_uniforms, material );

			} else if ( material.isMeshToonMaterial ) {

				this.refreshUniformsCommon( m_uniforms, material );
				this.refreshUniformsToon( m_uniforms, material );

			} else if ( material.isMeshPhongMaterial ) {

				this.refreshUniformsCommon( m_uniforms, material );
				this.refreshUniformsPhong( m_uniforms, material );

			} else if ( material.isMeshStandardMaterial ) {

				this.refreshUniformsCommon( m_uniforms, material, environment );
				if ( material.isMeshPhysicalMaterial ) {

					this.refreshUniformsPhysical( m_uniforms, material, environment );

				} else {

					this.refreshUniformsStandard( m_uniforms, material, environment );

				}

			} else if ( material.isMeshMatcapMaterial ) {

				this.refreshUniformsCommon( m_uniforms, material );
				this.refreshUniformsMatcap( m_uniforms, material );

			} else if ( material.isMeshDepthMaterial ) {

				this.refreshUniformsCommon( m_uniforms, material );
				this.refreshUniformsDepth( m_uniforms, material );

			} else if ( material.isMeshDistanceMaterial ) {

				this.refreshUniformsCommon( m_uniforms, material );
				this.refreshUniformsDistance( m_uniforms, material );

			} else if ( material.isMeshNormalMaterial ) {

				this.refreshUniformsCommon( m_uniforms, material );
				this.refreshUniformsNormal( m_uniforms, material );

			} else if ( material.isLineBasicMaterial ) {

				this.refreshUniformsLine( m_uniforms, material );
				if ( material.isLineDashedMaterial ) {

					this.refreshUniformsDash( m_uniforms, material );

				}

			} else if ( material.isPointsMaterial ) {

				this.refreshUniformsPoints( m_uniforms, material );

			} else if ( material.isSpriteMaterial ) {

				this.refreshUniformsSprites( m_uniforms, material );

			} else if ( material.isShadowMaterial ) {

				m_uniforms.color.value.copy( material.color );
				m_uniforms.opacity.value = material.opacity;

			}
			// RectAreaLight Texture
			// TODO (mrdoob): Find a nicer implementation
			if ( m_uniforms.ltc_1 !== undefined )
				m_uniforms.ltc_1.value = UniformsLib.LTC_1;
			if ( m_uniforms.ltc_2 !== undefined )
				m_uniforms.ltc_2.value = UniformsLib.LTC_2;
			WebGLUniforms.upload( this._gl, materialProperties.uniformsList, m_uniforms, this.textures );
			if ( material.isShaderMaterial ) {

				material.uniformsNeedUpdate = false; // #15581

			}

		}
		if ( material.isShaderMaterial && material.uniformsNeedUpdate === true ) {

			WebGLUniforms.upload( this._gl, materialProperties.uniformsList, m_uniforms, this.textures );
			material.uniformsNeedUpdate = false;

		}
		if ( material.isSpriteMaterial ) {

			p_uniforms.setValue( this._gl, 'center', object.center );

		}
		// common matrices
		p_uniforms.setValue( this._gl, 'modelViewMatrix', object.modelViewMatrix );
		p_uniforms.setValue( this._gl, 'normalMatrix', object.normalMatrix );
		p_uniforms.setValue( this._gl, 'modelMatrix', object.matrixWorld );
		return program;

	}

	// Uniforms (refresh uniforms objects)
	refreshUniformsCommon( uniforms, material, environment ) {

		uniforms.opacity.value = material.opacity;
		if ( material.color ) {

			uniforms.diffuse.value.copy( material.color );

		}
		if ( material.emissive ) {

			uniforms.emissive.value.copy( material.emissive ).multiplyScalar( material.emissiveIntensity );

		}
		if ( material.map ) {

			uniforms.map.value = material.map;

		}
		if ( material.alphaMap ) {

			uniforms.alphaMap.value = material.alphaMap;

		}
		if ( material.specularMap ) {

			uniforms.specularMap.value = material.specularMap;

		}
		var envMap = material.envMap || environment;
		if ( envMap ) {

			uniforms.envMap.value = envMap;
			uniforms.flipEnvMap.value = envMap.isCubeTexture ? - 1 : 1;
			uniforms.reflectivity.value = material.reflectivity;
			uniforms.refractionRatio.value = material.refractionRatio;
			uniforms.maxMipLevel.value = this.properties.get( envMap ).__maxMipLevel;

		}
		if ( material.lightMap ) {

			uniforms.lightMap.value = material.lightMap;
			uniforms.lightMapIntensity.value = material.lightMapIntensity;

		}
		if ( material.aoMap ) {

			uniforms.aoMap.value = material.aoMap;
			uniforms.aoMapIntensity.value = material.aoMapIntensity;

		}
		// uv repeat and offset setting priorities
		// 1. color map
		// 2. specular map
		// 3. normal map
		// 4. bump map
		// 5. alpha map
		// 6. emissive map
		var uvScaleMap;
		if ( material.map ) {

			uvScaleMap = material.map;

		} else if ( material.specularMap ) {

			uvScaleMap = material.specularMap;

		} else if ( material.displacementMap ) {

			uvScaleMap = material.displacementMap;

		} else if ( material.normalMap ) {

			uvScaleMap = material.normalMap;

		} else if ( material.bumpMap ) {

			uvScaleMap = material.bumpMap;

		} else if ( material.roughnessMap ) {

			uvScaleMap = material.roughnessMap;

		} else if ( material.metalnessMap ) {

			uvScaleMap = material.metalnessMap;

		} else if ( material.alphaMap ) {

			uvScaleMap = material.alphaMap;

		} else if ( material.emissiveMap ) {

			uvScaleMap = material.emissiveMap;

		}
		if ( uvScaleMap !== undefined ) {

			// backwards compatibility
			if ( uvScaleMap.isWebGLRenderTarget ) {

				uvScaleMap = uvScaleMap.texture;

			}
			if ( uvScaleMap.matrixAutoUpdate === true ) {

				uvScaleMap.updateMatrix();

			}
			uniforms.uvTransform.value.copy( uvScaleMap.matrix );

		}
		// uv repeat and offset setting priorities for uv2
		// 1. ao map
		// 2. light map
		var uv2ScaleMap;
		if ( material.aoMap ) {

			uv2ScaleMap = material.aoMap;

		} else if ( material.lightMap ) {

			uv2ScaleMap = material.lightMap;

		}
		if ( uv2ScaleMap !== undefined ) {

			// backwards compatibility
			if ( uv2ScaleMap.isWebGLRenderTarget ) {

				uv2ScaleMap = uv2ScaleMap.texture;

			}
			if ( uv2ScaleMap.matrixAutoUpdate === true ) {

				uv2ScaleMap.updateMatrix();

			}
			uniforms.uv2Transform.value.copy( uv2ScaleMap.matrix );

		}

	}

	refreshUniformsLine( uniforms, material ) {

		uniforms.diffuse.value.copy( material.color );
		uniforms.opacity.value = material.opacity;

	}

	refreshUniformsDash( uniforms, material ) {

		uniforms.dashSize.value = material.dashSize;
		uniforms.totalSize.value = material.dashSize + material.gapSize;
		uniforms.scale.value = material.scale;

	}

	refreshUniformsPoints( uniforms, material ) {

		uniforms.diffuse.value.copy( material.color );
		uniforms.opacity.value = material.opacity;
		uniforms.size.value = material.size * this._pixelRatio;
		uniforms.scale.value = this._height * 0.5;
		if ( material.map ) {

			uniforms.map.value = material.map;

		}
		if ( material.alphaMap ) {

			uniforms.alphaMap.value = material.alphaMap;

		}
		// uv repeat and offset setting priorities
		// 1. color map
		// 2. alpha map
		var uvScaleMap;
		if ( material.map ) {

			uvScaleMap = material.map;

		} else if ( material.alphaMap ) {

			uvScaleMap = material.alphaMap;

		}
		if ( uvScaleMap !== undefined ) {

			if ( uvScaleMap.matrixAutoUpdate === true ) {

				uvScaleMap.updateMatrix();

			}
			uniforms.uvTransform.value.copy( uvScaleMap.matrix );

		}

	}

	refreshUniformsSprites( uniforms, material ) {

		uniforms.diffuse.value.copy( material.color );
		uniforms.opacity.value = material.opacity;
		uniforms.rotation.value = material.rotation;
		if ( material.map ) {

			uniforms.map.value = material.map;

		}
		if ( material.alphaMap ) {

			uniforms.alphaMap.value = material.alphaMap;

		}
		// uv repeat and offset setting priorities
		// 1. color map
		// 2. alpha map
		var uvScaleMap;
		if ( material.map ) {

			uvScaleMap = material.map;

		} else if ( material.alphaMap ) {

			uvScaleMap = material.alphaMap;

		}
		if ( uvScaleMap !== undefined ) {

			if ( uvScaleMap.matrixAutoUpdate === true ) {

				uvScaleMap.updateMatrix();

			}
			uniforms.uvTransform.value.copy( uvScaleMap.matrix );

		}

	}

	refreshUniformsFog( uniforms, fog ) {

		uniforms.fogColor.value.copy( fog.color );
		if ( fog.isFog ) {

			uniforms.fogNear.value = fog.near;
			uniforms.fogFar.value = fog.far;

		} else if ( fog.isFogExp2 ) {

			uniforms.fogDensity.value = fog.density;

		}

	}

	refreshUniformsLambert( uniforms, material ) {

		if ( material.emissiveMap ) {

			uniforms.emissiveMap.value = material.emissiveMap;

		}

	}

	refreshUniformsPhong( uniforms, material ) {

		uniforms.specular.value.copy( material.specular );
		uniforms.shininess.value = Math.max( material.shininess, 1e-4 ); // to prevent pow( 0.0, 0.0 )
		if ( material.emissiveMap ) {

			uniforms.emissiveMap.value = material.emissiveMap;

		}
		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;
			if ( material.side === BackSide )
				uniforms.bumpScale.value *= - 1;

		}
		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );
			if ( material.side === BackSide )
				uniforms.normalScale.value.negate();

		}
		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

	refreshUniformsToon( uniforms, material ) {

		uniforms.specular.value.copy( material.specular );
		uniforms.shininess.value = Math.max( material.shininess, 1e-4 ); // to prevent pow( 0.0, 0.0 )
		if ( material.gradientMap ) {

			uniforms.gradientMap.value = material.gradientMap;

		}
		if ( material.emissiveMap ) {

			uniforms.emissiveMap.value = material.emissiveMap;

		}
		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;
			if ( material.side === BackSide )
				uniforms.bumpScale.value *= - 1;

		}
		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );
			if ( material.side === BackSide )
				uniforms.normalScale.value.negate();

		}
		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

	refreshUniformsStandard( uniforms, material, environment ) {

		uniforms.roughness.value = material.roughness;
		uniforms.metalness.value = material.metalness;
		if ( material.roughnessMap ) {

			uniforms.roughnessMap.value = material.roughnessMap;

		}
		if ( material.metalnessMap ) {

			uniforms.metalnessMap.value = material.metalnessMap;

		}
		if ( material.emissiveMap ) {

			uniforms.emissiveMap.value = material.emissiveMap;

		}
		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;
			if ( material.side === BackSide )
				uniforms.bumpScale.value *= - 1;

		}
		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );
			if ( material.side === BackSide )
				uniforms.normalScale.value.negate();

		}
		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}
		if ( material.envMap || environment ) {

			//uniforms.envMap.value = material.envMap; // part of uniforms common
			uniforms.envMapIntensity.value = material.envMapIntensity;

		}

	}

	refreshUniformsPhysical( uniforms, material, environment ) {

		this.refreshUniformsStandard( uniforms, material, environment );
		uniforms.reflectivity.value = material.reflectivity; // also part of uniforms common
		uniforms.clearcoat.value = material.clearcoat;
		uniforms.clearcoatRoughness.value = material.clearcoatRoughness;
		if ( material.sheen )
			uniforms.sheen.value.copy( material.sheen );
		if ( material.clearcoatMap ) {

			uniforms.clearcoatMap.value = material.clearcoatMap;

		}
		if ( material.clearcoatRoughnessMap ) {

			uniforms.clearcoatRoughnessMap.value = material.clearcoatRoughnessMap;

		}
		if ( material.clearcoatNormalMap ) {

			uniforms.clearcoatNormalScale.value.copy( material.clearcoatNormalScale );
			uniforms.clearcoatNormalMap.value = material.clearcoatNormalMap;
			if ( material.side === BackSide ) {

				uniforms.clearcoatNormalScale.value.negate();

			}

		}
		uniforms.transparency.value = material.transparency;

	}

	refreshUniformsMatcap( uniforms, material ) {

		if ( material.matcap ) {

			uniforms.matcap.value = material.matcap;

		}
		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;
			if ( material.side === BackSide )
				uniforms.bumpScale.value *= - 1;

		}
		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );
			if ( material.side === BackSide )
				uniforms.normalScale.value.negate();

		}
		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

	refreshUniformsDepth( uniforms, material ) {

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

	refreshUniformsDistance( uniforms, material ) {

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}
		uniforms.referencePosition.value.copy( material.referencePosition );
		uniforms.nearDistance.value = material.nearDistance;
		uniforms.farDistance.value = material.farDistance;

	}

	refreshUniformsNormal( uniforms, material ) {

		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;
			if ( material.side === BackSide )
				uniforms.bumpScale.value *= - 1;

		}
		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );
			if ( material.side === BackSide )
				uniforms.normalScale.value.negate();

		}
		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

	// If uniforms are marked as clean, they don't need to be loaded to the GPU.
	markUniformsLightsNeedsUpdate( uniforms, value ) {

		uniforms.ambientLightColor.needsUpdate = value;
		uniforms.lightProbe.needsUpdate = value;
		uniforms.directionalLights.needsUpdate = value;
		uniforms.directionalLightShadows.needsUpdate = value;
		uniforms.pointLights.needsUpdate = value;
		uniforms.pointLightShadows.needsUpdate = value;
		uniforms.spotLights.needsUpdate = value;
		uniforms.spotLightShadows.needsUpdate = value;
		uniforms.rectAreaLights.needsUpdate = value;
		uniforms.hemisphereLights.needsUpdate = value;

	}

	materialNeedsLights( material ) {

		return material.isMeshLambertMaterial || material.isMeshToonMaterial || material.isMeshPhongMaterial ||
			material.isMeshStandardMaterial || material.isShadowMaterial ||
			( material.isShaderMaterial && material.lights === true );

	}

	//
	setFramebuffer( value ) {

		if ( this._framebuffer !== value && this._currentRenderTarget === null )
			this._gl.bindFramebuffer( _gl.FRAMEBUFFER, value );
		this._framebuffer = value;

	}

	getActiveCubeFace() {

		return this._currentActiveCubeFace;

	}

	getActiveMipmapLevel() {

		return this._currentActiveMipmapLevel;

	}

	getRenderTarget() {

		return this._currentRenderTarget;

	}

	setRenderTarget( renderTarget, activeCubeFace, activeMipmapLevel ) {

		this._currentRenderTarget = renderTarget;
		this._currentActiveCubeFace = activeCubeFace;
		this._currentActiveMipmapLevel = activeMipmapLevel;
		if ( renderTarget && this.properties.get( renderTarget ).__webglFramebuffer === undefined ) {

			this.textures.setupRenderTarget( renderTarget );

		}
		var framebuffer = this._framebuffer;
		var isCube = false;
		if ( renderTarget ) {

			var __webglFramebuffer = this.properties.get( renderTarget ).__webglFramebuffer;
			if ( renderTarget.isWebGLCubeRenderTarget ) {

				framebuffer = __webglFramebuffer[ activeCubeFace || 0 ];
				isCube = true;

			} else if ( renderTarget.isWebGLMultisampleRenderTarget ) {

				framebuffer = this.properties.get( renderTarget ).__webglMultisampledFramebuffer;

			} else {

				framebuffer = __webglFramebuffer;

			}
			this._currentViewport.copy( renderTarget.viewport );
			this._currentScissor.copy( renderTarget.scissor );
			this._currentScissorTest = renderTarget.scissorTest;

		} else {

			this._currentViewport.copy( this._viewport ).multiplyScalar( this._pixelRatio ).floor();
			this._currentScissor.copy( this._scissor ).multiplyScalar( this._pixelRatio ).floor();
			this._currentScissorTest = this._scissorTest;

		}
		if ( this._currentFramebuffer !== framebuffer ) {

			this._gl.bindFramebuffer( _gl.FRAMEBUFFER, framebuffer );
			this._currentFramebuffer = framebuffer;

		}
		this.state.viewport( this._currentViewport );
		this.state.scissor( this._currentScissor );
		this.state.setScissorTest( this._currentScissorTest );
		if ( isCube ) {

			var textureProperties = this.properties.get( renderTarget.texture );
			this._gl.framebufferTexture2D( _gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_CUBE_MAP_POSITIVE_X + ( activeCubeFace || 0 ), textureProperties.__webglTexture, activeMipmapLevel || 0 );

		}

	}

	readRenderTargetPixels( renderTarget, x, y, width, height, buffer, activeCubeFaceIndex ) {

		if ( ! ( renderTarget && renderTarget.isWebGLRenderTarget ) ) {

			console.error( 'THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.' );
			return;

		}
		var framebuffer = this.properties.get( renderTarget ).__webglFramebuffer;
		if ( renderTarget.isWebGLCubeRenderTarget && activeCubeFaceIndex !== undefined ) {

			framebuffer = framebuffer[ activeCubeFaceIndex ];

		}
		if ( framebuffer ) {

			var restore = false;
			if ( framebuffer !== this._currentFramebuffer ) {

				this._gl.bindFramebuffer( _gl.FRAMEBUFFER, framebuffer );
				restore = true;

			}
			try {

				var texture = renderTarget.texture;
				var textureFormat = texture.format;
				var textureType = texture.type;
				if ( textureFormat !== RGBAFormat && this.utils.convert( textureFormat ) !== this._gl.getParameter( _gl.IMPLEMENTATION_COLOR_READ_FORMAT ) ) {

					console.error( 'THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.' );
					return;

				}
				if ( textureType !== UnsignedByteType && this.utils.convert( textureType ) !== this._gl.getParameter( _gl.IMPLEMENTATION_COLOR_READ_TYPE ) && // IE11, Edge and Chrome Mac < 52 (#9513)
					! ( textureType === FloatType && ( this.capabilities.isWebGL2 || this.extensions.get( 'OES_texture_float' ) || this.extensions.get( 'WEBGL_color_buffer_float' ) ) ) && // Chrome Mac >= 52 and Firefox
					! ( textureType === HalfFloatType && ( this.capabilities.isWebGL2 ? this.extensions.get( 'EXT_color_buffer_float' ) : this.extensions.get( 'EXT_color_buffer_half_float' ) ) ) ) {

					console.error( 'THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.' );
					return;

				}
				if ( this._gl.checkFramebufferStatus( _gl.FRAMEBUFFER ) === _gl.FRAMEBUFFER_COMPLETE ) {

					// the following if statement ensures valid read requests (no out-of-bounds pixels, see #8604)
					if ( ( x >= 0 && x <= ( renderTarget.width - width ) ) && ( y >= 0 && y <= ( renderTarget.height - height ) ) ) {

						this._gl.readPixels( x, y, width, height, this.utils.convert( textureFormat ), this.utils.convert( textureType ), buffer );

					}

				} else {

					console.error( 'THREE.WebGLRenderer.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not complete.' );

				}

			} finally {

				if ( restore ) {

					this._gl.bindFramebuffer( _gl.FRAMEBUFFER, this._currentFramebuffer );

				}

			}

		}

	}

	copyFramebufferToTexture( position, texture, level ) {

		if ( level === undefined )
			level = 0;
		var levelScale = Math.pow( 2, - level );
		var width = Math.floor( texture.image.width * levelScale );
		var height = Math.floor( texture.image.height * levelScale );
		var glFormat = this.utils.convert( texture.format );
		this.textures.setTexture2D( texture, 0 );
		this._gl.copyTexImage2D( _gl.TEXTURE_2D, level, glFormat, position.x, position.y, width, height, 0 );
		this.state.unbindTexture();

	}

	copyTextureToTexture( position, srcTexture, dstTexture, level ) {

		var width = srcTexture.image.width;
		var height = srcTexture.image.height;
		var glFormat = this.utils.convert( dstTexture.format );
		var glType = this.utils.convert( dstTexture.type );
		this.textures.setTexture2D( dstTexture, 0 );
		if ( srcTexture.isDataTexture ) {

			this._gl.texSubImage2D( _gl.TEXTURE_2D, level || 0, position.x, position.y, width, height, glFormat, glType, srcTexture.image.data );

		} else {

			this._gl.texSubImage2D( _gl.TEXTURE_2D, level || 0, position.x, position.y, glFormat, glType, srcTexture.image );

		}
		this.state.unbindTexture();

	}

	initTexture( texture ) {

		this.textures.setTexture2D( texture, 0 );
		this.state.unbindTexture();

	}

}

export { WebGLRenderer };
