import { REVISION, RGBAFormat, HalfFloatType, FloatType, ByteType, UnsignedByteType, FrontFaceDirectionCW, TriangleFanDrawMode, TriangleStripDrawMode, TrianglesDrawMode, NoColors, LinearToneMapping } from '../constants';
import { _Math } from '../math/Math';
import { Matrix4 } from '../math/Matrix4';
import { Plane } from '../math/Plane';
import { DataTexture } from '../textures/DataTexture';
import { WebGLUniforms } from './webgl/WebGLUniforms';
import { UniformsLib } from './shaders/UniformsLib';
import { UniformsUtils } from './shaders/UniformsUtils';
import { ShaderLib } from './shaders/ShaderLib';
import { MeshBasicMaterial } from '../materials/MeshBasicMaterial';
import { WebGLFlareRenderer } from './webgl/WebGLFlareRenderer';
import { WebGLSpriteRenderer } from './webgl/WebGLSpriteRenderer';
import { WebGLShadowMap } from './webgl/WebGLShadowMap';
import { WebGLAttributes } from './webgl/WebGLAttributes';
import { WebGLBackground } from './webgl/WebGLBackground';
import { WebGLRenderLists } from './webgl/WebGLRenderLists';
import { WebGLMorphtargets } from './webgl/WebGLMorphtargets';
import { WebGLIndexedBufferRenderer } from './webgl/WebGLIndexedBufferRenderer';
import { WebGLBufferRenderer } from './webgl/WebGLBufferRenderer';
import { WebGLGeometries } from './webgl/WebGLGeometries';
import { WebGLLights } from './webgl/WebGLLights';
import { WebGLObjects } from './webgl/WebGLObjects';
import { WebGLPrograms } from './webgl/WebGLPrograms';
import { WebGLTextures } from './webgl/WebGLTextures';
import { WebGLProperties } from './webgl/WebGLProperties';
import { WebGLState } from './webgl/WebGLState';
import { WebGLCapabilities } from './webgl/WebGLCapabilities';
import { WebVRManager } from './webvr/WebVRManager';
import { BufferGeometry } from '../core/BufferGeometry';
import { WebGLExtensions } from './webgl/WebGLExtensions';
import { Vector3 } from '../math/Vector3';
// import { Sphere } from '../math/Sphere';
import { WebGLClipping } from './webgl/WebGLClipping';
import { Frustum } from '../math/Frustum';
import { Vector4 } from '../math/Vector4';
import { WebGLUtils } from './webgl/WebGLUtils';

/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 * @author tschw
 */

function WebGLRenderer( parameters ) {

	console.log( 'THREE.WebGLRenderer', REVISION );

	parameters = parameters || {};

	var _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' ),
		_context = parameters.context !== undefined ? parameters.context : null,

		_alpha = parameters.alpha !== undefined ? parameters.alpha : false,
		_depth = parameters.depth !== undefined ? parameters.depth : true,
		_stencil = parameters.stencil !== undefined ? parameters.stencil : true,
		_antialias = parameters.antialias !== undefined ? parameters.antialias : false,
		_premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true,
		_preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false;

	var currentRenderList = null;

	// public properties

	this.domElement = _canvas;
	this.context = null;

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

	this.gammaFactor = 2.0;	// for backwards compatibility
	this.gammaInput = false;
	this.gammaOutput = false;

	// physical lights

	this.physicallyCorrectLights = false;

	// tone mapping

	this.toneMapping = LinearToneMapping;
	this.toneMappingExposure = 1.0;
	this.toneMappingWhitePoint = 1.0;

	// morphs

	this.maxMorphTargets = 8;
	this.maxMorphNormals = 4;

	// portals

	this.currentPortalDepth = 0;
	this.currentPortalStencil = 0;
	this.currentlyMirrored = false;
	this.maxPortalCount = 15;
	this.maxPortalDepth = 2;
	this.maxPortalTotal = 15 + 15 * 15;

	//

	this.frameId = 0;

	// internal properties

	var _this = this,

		_isContextLost = false,

		// internal state cache

		_currentRenderTarget = null,
		_currentFramebuffer = null,
		_currentMaterialId = - 1,
		_currentGeometryProgram = '',

		_currentCamera = null,
		_currentArrayCamera = null,

		_currentViewport = new Vector4(),
		_currentScissor = new Vector4(),
		_currentScissorTest = null,

		//

		_usedTextureUnits = 0,

		//

		_width = _canvas.width,
		_height = _canvas.height,

		_pixelRatio = 1,

		_viewport = new Vector4( 0, 0, _width, _height ),
		_scissor = new Vector4( 0, 0, _width, _height ),
		_scissorTest = false,

		_vector3 = new Vector3(),

		// info

		_infoMemory = {
			geometries: 0,
			textures: 0
		},

		_infoRender = {

			frame: 0,
			calls: 0,
			vertices: 0,
			faces: 0,
			points: 0,
			portals: 0

		};

	this.info = {

		render: _infoRender,
		memory: _infoMemory,
		programs: null

	};

	function getTargetPixelRatio() {

		return _currentRenderTarget === null ? _pixelRatio : 1;

	}

	// initialize

	var _gl;

	try {

		var contextAttributes = {
			alpha: _alpha,
			depth: _depth,
			stencil: _stencil,
			antialias: _antialias,
			premultipliedAlpha: _premultipliedAlpha,
			preserveDrawingBuffer: _preserveDrawingBuffer
		};

		_gl = _context || _canvas.getContext( 'webgl', contextAttributes ) || _canvas.getContext( 'experimental-webgl', contextAttributes );

		if ( _gl === null ) {

			if ( _canvas.getContext( 'webgl' ) !== null ) {

				throw 'Error creating WebGL context with your selected attributes.';

			} else {

				throw 'Error creating WebGL context.';

			}

		}

		// Some experimental-webgl implementations do not have getShaderPrecisionFormat

		if ( _gl.getShaderPrecisionFormat === undefined ) {

			_gl.getShaderPrecisionFormat = function () {

				return { 'rangeMin': 1, 'rangeMax': 1, 'precision': 1 };

			};

		}

		_canvas.addEventListener( 'webglcontextlost', onContextLost, false );
		_canvas.addEventListener( 'webglcontextrestored', onContextRestore, false );

	} catch ( error ) {

		console.error( 'THREE.WebGLRenderer: ' + error );

	}

	var extensions, capabilities, state;
	var properties, textures, attributes, geometries, objects;
	var programCache, renderLists;

	var background, morphtargets, bufferRenderer, indexedBufferRenderer;
	var flareRenderer, spriteRenderer;

	var utils;

	function initGLContext() {

		extensions = new WebGLExtensions( _gl );
		extensions.get( 'WEBGL_depth_texture' );
		extensions.get( 'OES_texture_float' );
		extensions.get( 'OES_texture_float_linear' );
		extensions.get( 'OES_texture_half_float' );
		extensions.get( 'OES_texture_half_float_linear' );
		extensions.get( 'OES_standard_derivatives' );
		extensions.get( 'ANGLE_instanced_arrays' );

		if ( extensions.get( 'OES_element_index_uint' ) ) {

			BufferGeometry.MaxIndex = 4294967296;

		}

		utils = new WebGLUtils( _gl, extensions );

		capabilities = new WebGLCapabilities( _gl, extensions, parameters );

		state = new WebGLState( _gl, extensions, utils );
		state.scissor( _currentScissor.copy( _scissor ).multiplyScalar( _pixelRatio ) );
		state.viewport( _currentViewport.copy( _viewport ).multiplyScalar( _pixelRatio ) );

		properties = new WebGLProperties();
		textures = new WebGLTextures( _gl, extensions, state, properties, capabilities, utils, _infoMemory );
		attributes = new WebGLAttributes( _gl );
		geometries = new WebGLGeometries( _gl, attributes, _infoMemory );
		objects = new WebGLObjects( geometries, _infoRender );
		morphtargets = new WebGLMorphtargets( _gl );
		programCache = new WebGLPrograms( _this, extensions, capabilities );
		renderLists = new WebGLRenderLists();

		background = new WebGLBackground( _this, state, geometries, _premultipliedAlpha );

		bufferRenderer = new WebGLBufferRenderer( _gl, extensions, _infoRender );
		indexedBufferRenderer = new WebGLIndexedBufferRenderer( _gl, extensions, _infoRender );

		flareRenderer = new WebGLFlareRenderer( _this, _gl, state, textures, capabilities );
		spriteRenderer = new WebGLSpriteRenderer( _this, _gl, state, textures, capabilities );

		_this.info.programs = programCache.programs;

		_this.context = _gl;
		_this.capabilities = capabilities;
		_this.extensions = extensions;
		_this.properties = properties;
		_this.renderLists = renderLists;
		_this.state = state;

	}

	initGLContext();

	// vr

	var vr = new WebVRManager( _this );

	this.vr = vr;

	// shadow map

	this.shadowMap = new WebGLShadowMap( _this, objects, capabilities.maxTextureSize );

	// API

	this.getContext = function () {

		return _gl;

	};

	this.getContextAttributes = function () {

		return _gl.getContextAttributes();

	};

	this.forceContextLoss = function () {

		var extension = extensions.get( 'WEBGL_lose_context' );
		if ( extension ) extension.loseContext();

	};

	this.forceContextRestore = function () {

		var extension = extensions.get( 'WEBGL_lose_context' );
		if ( extension ) extension.restoreContext();

	};

	this.getPixelRatio = function () {

		return _pixelRatio;

	};

	this.setPixelRatio = function ( value ) {

		if ( value === undefined ) return;

		_pixelRatio = value;

		this.setSize( _width, _height, false );

	};

	this.getSize = function () {

		return {
			width: _width,
			height: _height
		};

	};

	this.setSize = function ( width, height, updateStyle ) {

		var device = vr.getDevice();

		if ( device && device.isPresenting ) {

			console.warn( 'THREE.WebGLRenderer: Can\'t change size while VR device is presenting.' );
			return;

		}

		_width = width;
		_height = height;

		_canvas.width = width * _pixelRatio;
		_canvas.height = height * _pixelRatio;

		if ( updateStyle !== false ) {

			_canvas.style.width = width + 'px';
			_canvas.style.height = height + 'px';

		}

		this.setViewport( 0, 0, width, height );

	};

	this.getDrawingBufferSize = function () {

		return {
			width: _width * _pixelRatio,
			height: _height * _pixelRatio
		};

	};

	this.setDrawingBufferSize = function ( width, height, pixelRatio ) {

		_width = width;
		_height = height;

		_pixelRatio = pixelRatio;

		_canvas.width = width * pixelRatio;
		_canvas.height = height * pixelRatio;

		this.setViewport( 0, 0, width, height );

	};

	this.setViewport = function ( x, y, width, height ) {

		_viewport.set( x, _height - y - height, width, height );
		state.viewport( _currentViewport.copy( _viewport ).multiplyScalar( _pixelRatio ) );

	};

	this.setScissor = function ( x, y, width, height ) {

		_scissor.set( x, _height - y - height, width, height );
		state.scissor( _currentScissor.copy( _scissor ).multiplyScalar( _pixelRatio ) );

	};

	this.setScissorTest = function ( boolean ) {

		state.setScissorTest( _scissorTest = boolean );

	};

	// Clearing

	this.getClearColor = background.getClearColor;
	this.setClearColor = background.setClearColor;
	this.getClearAlpha = background.getClearAlpha;
	this.setClearAlpha = background.setClearAlpha;

	this.clear = function ( color, depth, stencil ) {

		var bits = 0;

		if ( color === undefined || color ) bits |= _gl.COLOR_BUFFER_BIT;
		if ( depth === undefined || depth ) bits |= _gl.DEPTH_BUFFER_BIT;
		if ( stencil === undefined || stencil ) bits |= _gl.STENCIL_BUFFER_BIT;

		_gl.clear( bits );

	};

	this.clearColor = function () {

		this.clear( true, false, false );

	};

	this.clearDepth = function () {

		this.clear( false, true, false );

	};

	this.clearStencil = function () {

		this.clear( false, false, true );

	};

	this.clearTarget = function ( renderTarget, color, depth, stencil ) {

		this.setRenderTarget( renderTarget );
		this.clear( color, depth, stencil );

	};

	//

	this.dispose = function () {

		_canvas.removeEventListener( 'webglcontextlost', onContextLost, false );
		_canvas.removeEventListener( 'webglcontextrestored', onContextRestore, false );

		renderLists.dispose();

		vr.dispose();

	};

	// Events

	function onContextLost( event ) {

		event.preventDefault();

		console.log( 'THREE.WebGLRenderer: Context Lost.' );

		_isContextLost = true;

	}

	function onContextRestore( event ) {

		console.log( 'THREE.WebGLRenderer: Context Restored.' );

		_isContextLost = false;

		initGLContext();

	}

	function onMaterialDispose( event ) {

		var material = event.target;

		material.removeEventListener( 'dispose', onMaterialDispose );

		deallocateMaterial( material );

	}

	// Buffer deallocation

	function deallocateMaterial( material ) {

		releaseMaterialProgramReference( material );

		properties.remove( material );

	}


	function releaseMaterialProgramReference( material ) {

		var programInfo = properties.get( material ).program;

		material.program = undefined;

		if ( programInfo !== undefined ) {

			programCache.releaseProgram( programInfo );

		}

	}

	// Buffer rendering

	function renderObjectImmediate( object, program, material ) {

		object.render( function ( object ) {

			_this.renderBufferImmediate( object, program, material );

		} );

	}

	this.renderBufferImmediate = function ( object, program, material ) {

		state.initAttributes();

		var buffers = properties.get( object );

		if ( object.hasPositions && ! buffers.position ) buffers.position = _gl.createBuffer();
		if ( object.hasNormals && ! buffers.normal ) buffers.normal = _gl.createBuffer();
		if ( object.hasUvs && ! buffers.uv ) buffers.uv = _gl.createBuffer();
		if ( object.hasColors && ! buffers.color ) buffers.color = _gl.createBuffer();

		var programAttributes = program.getAttributes();

		if ( object.hasPositions ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, buffers.position );
			_gl.bufferData( _gl.ARRAY_BUFFER, object.positionArray, _gl.DYNAMIC_DRAW );

			state.enableAttribute( programAttributes.position );
			_gl.vertexAttribPointer( programAttributes.position, 3, _gl.FLOAT, false, 0, 0 );

		}

		if ( object.hasNormals ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, buffers.normal );

			if ( ! material.isMeshPhongMaterial &&
				! material.isMeshStandardMaterial &&
				! material.isMeshNormalMaterial &&
				material.flatShading === true ) {

				for ( var i = 0, l = object.count * 3; i < l; i += 9 ) {

					var array = object.normalArray;

					var nx = ( array[ i + 0 ] + array[ i + 3 ] + array[ i + 6 ] ) / 3;
					var ny = ( array[ i + 1 ] + array[ i + 4 ] + array[ i + 7 ] ) / 3;
					var nz = ( array[ i + 2 ] + array[ i + 5 ] + array[ i + 8 ] ) / 3;

					array[ i + 0 ] = nx;
					array[ i + 1 ] = ny;
					array[ i + 2 ] = nz;

					array[ i + 3 ] = nx;
					array[ i + 4 ] = ny;
					array[ i + 5 ] = nz;

					array[ i + 6 ] = nx;
					array[ i + 7 ] = ny;
					array[ i + 8 ] = nz;

				}

			}

			_gl.bufferData( _gl.ARRAY_BUFFER, object.normalArray, _gl.DYNAMIC_DRAW );

			state.enableAttribute( programAttributes.normal );

			_gl.vertexAttribPointer( programAttributes.normal, 3, _gl.FLOAT, false, 0, 0 );

		}

		if ( object.hasUvs && material.map ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, buffers.uv );
			_gl.bufferData( _gl.ARRAY_BUFFER, object.uvArray, _gl.DYNAMIC_DRAW );

			state.enableAttribute( programAttributes.uv );

			_gl.vertexAttribPointer( programAttributes.uv, 2, _gl.FLOAT, false, 0, 0 );

		}

		if ( object.hasColors && material.vertexColors !== NoColors ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, buffers.color );
			_gl.bufferData( _gl.ARRAY_BUFFER, object.colorArray, _gl.DYNAMIC_DRAW );

			state.enableAttribute( programAttributes.color );

			_gl.vertexAttribPointer( programAttributes.color, 3, _gl.FLOAT, false, 0, 0 );

		}

		state.disableUnusedAttributes();

		_gl.drawArrays( _gl.TRIANGLES, 0, object.count );

		object.count = 0;

	};

	this.renderBufferDirect = function ( renderData, camera, fog, geometry, material, object, group ) {

		if ( camera !== _currentCamera ) {

			this.currentlyMirrored = camera.scale.x<0 !== camera.scale.y<0;

		}

		state.setMaterial( material );

		var program = setProgram( renderData, camera, fog, material, object );
		var geometryProgram = geometry.id + '_' + program.id + '_' + ( material.wireframe === true );

		var updateBuffers = false;

		if ( geometryProgram !== _currentGeometryProgram ) {

			_currentGeometryProgram = geometryProgram;
			updateBuffers = true;

		}

		if ( object.morphTargetInfluences ) {

			morphtargets.update( object, geometry, material, program );

			updateBuffers = true;

		}

		//

		var index = geometry.index;
		var position = geometry.attributes.position;
		var rangeFactor = 1;

		if ( material.wireframe === true ) {

			index = geometries.getWireframeAttribute( geometry );
			rangeFactor = 2;

		}

		var attribute;
		var renderer = bufferRenderer;

		if ( index !== null ) {

			attribute = attributes.get( index );

			renderer = indexedBufferRenderer;
			renderer.setIndex( attribute );

		}

		if ( updateBuffers ) {

			setupVertexAttributes( material, program, geometry );

			if ( index !== null ) {

				_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, attribute.buffer );

			}

		}

		//

		var dataCount = 0;

		if ( index !== null ) {

			dataCount = index.count;

		} else if ( position !== undefined ) {

			dataCount = position.count;

		}

		var rangeStart = geometry.drawRange.start * rangeFactor;
		var rangeCount = geometry.drawRange.count * rangeFactor;

		var groupStart = group !== null ? group.start * rangeFactor : 0;
		var groupCount = group !== null ? group.count * rangeFactor : Infinity;

		var drawStart = Math.max( rangeStart, groupStart );
		var drawEnd = Math.min( dataCount, rangeStart + rangeCount, groupStart + groupCount ) - 1;

		var drawCount = Math.max( 0, drawEnd - drawStart + 1 );

		if ( drawCount === 0 ) return;

		//

		if ( object.isMesh ) {

			if ( material.wireframe === true ) {

				state.setLineWidth( material.wireframeLinewidth * getTargetPixelRatio() );
				renderer.setMode( _gl.LINES );

			} else {

				switch ( object.drawMode ) {

					case TrianglesDrawMode:
						renderer.setMode( _gl.TRIANGLES );
						break;

					case TriangleStripDrawMode:
						renderer.setMode( _gl.TRIANGLE_STRIP );
						break;

					case TriangleFanDrawMode:
						renderer.setMode( _gl.TRIANGLE_FAN );
						break;

				}

			}


		} else if ( object.isLine ) {

			var lineWidth = material.linewidth;

			if ( lineWidth === undefined ) lineWidth = 1; // Not using Line*Material

			state.setLineWidth( lineWidth * getTargetPixelRatio() );

			if ( object.isLineSegments ) {

				renderer.setMode( _gl.LINES );

			} else if ( object.isLineLoop ) {

				renderer.setMode( _gl.LINE_LOOP );

			} else {

				renderer.setMode( _gl.LINE_STRIP );

			}

		} else if ( object.isPoints ) {

			renderer.setMode( _gl.POINTS );

		}

		if ( geometry && geometry.isInstancedBufferGeometry ) {

			if ( geometry.maxInstancedCount > 0 ) {

				renderer.renderInstances( geometry, drawStart, drawCount );

			}

		} else {

			renderer.render( drawStart, drawCount );

		}

	};

	function setupVertexAttributes( material, program, geometry, startIndex ) {

		if ( geometry && geometry.isInstancedBufferGeometry ) {

			if ( extensions.get( 'ANGLE_instanced_arrays' ) === null ) {

				console.error( 'THREE.WebGLRenderer.setupVertexAttributes: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
				return;

			}

		}

		if ( startIndex === undefined ) startIndex = 0;

		state.initAttributes();

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

					var attribute = attributes.get( geometryAttribute );

					// TODO Attribute may not be available on context restore

					if ( attribute === undefined ) continue;

					var buffer = attribute.buffer;
					var type = attribute.type;
					var bytesPerElement = attribute.bytesPerElement;

					if ( geometryAttribute.isInterleavedBufferAttribute ) {

						var data = geometryAttribute.data;
						var stride = data.stride;
						var offset = geometryAttribute.offset;

						if ( data && data.isInstancedInterleavedBuffer ) {

							state.enableAttributeAndDivisor( programAttribute, data.meshPerAttribute );

							if ( geometry.maxInstancedCount === undefined ) {

								geometry.maxInstancedCount = data.meshPerAttribute * data.count;

							}

						} else {

							state.enableAttribute( programAttribute );

						}

						_gl.bindBuffer( _gl.ARRAY_BUFFER, buffer );
						_gl.vertexAttribPointer( programAttribute, size, type, normalized, stride * bytesPerElement, ( startIndex * stride + offset ) * bytesPerElement );

					} else {

						if ( geometryAttribute.isInstancedBufferAttribute ) {

							state.enableAttributeAndDivisor( programAttribute, geometryAttribute.meshPerAttribute );

							if ( geometry.maxInstancedCount === undefined ) {

								geometry.maxInstancedCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;

							}

						} else {

							state.enableAttribute( programAttribute );

						}

						_gl.bindBuffer( _gl.ARRAY_BUFFER, buffer );
						_gl.vertexAttribPointer( programAttribute, size, type, normalized, 0, startIndex * size * bytesPerElement );

					}

				} else if ( materialDefaultAttributeValues !== undefined ) {

					var value = materialDefaultAttributeValues[ name ];

					if ( value !== undefined ) {

						switch ( value.length ) {

							case 2:
								_gl.vertexAttrib2fv( programAttribute, value );
								break;

							case 3:
								_gl.vertexAttrib3fv( programAttribute, value );
								break;

							case 4:
								_gl.vertexAttrib4fv( programAttribute, value );
								break;

							default:
								_gl.vertexAttrib1fv( programAttribute, value );

						}

					}

				}

			}

		}

		state.disableUnusedAttributes();

	}

	// Compile

	this.compile = function ( scene, camera ) {

		var renderData = {
			lightsArray: [],
			shadowsArray: [],
			spritesArray: [],
			flaresArray: [],
			lights: new WebGLLights(),
			clipping: new WebGLClipping(),
			clippingEnabled: false,
			localClippingEnabled: this.localClippingEnabled
		};

		scene.traverse( function ( object ) {

			if ( object.isLight ) {

				renderData.lightsArray.push( object );

				if ( object.castShadow ) {

					renderData.shadowsArray.push( object );

				}

			}

		} );

		renderData.lights.setup( renderData, camera );

		scene.traverse( function ( object ) {

			if ( object.material ) {

				if ( Array.isArray( object.material ) ) {

					for ( var i = 0; i < object.material.length; i ++ ) {

						initMaterial( renderData, object.material[ i ], scene.fog, object );

					}

				} else {

					initMaterial( renderData, object.material, scene.fog, object );

				}

			}

		} );

	};

	// Rendering

	this.animate = function ( callback ) {

		function onFrame() {

			callback();

			( vr.getDevice() || window ).requestAnimationFrame( onFrame );

		}

		( vr.getDevice() || window ).requestAnimationFrame( onFrame );

	};

	this.render = function ( scene, camera, renderTarget, forceClear ) {

		if ( ! ( camera && camera.isCamera ) ) {

			console.error( 'THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.' );
			return;

		}

		if ( _isContextLost ) return;

		// reset caching for this frame

		_currentGeometryProgram = '';
		_currentMaterialId = - 1;
		_currentCamera = null;
		this.currentPortalDepth = 0;
		this.currentPortalStencil = 0;
		this.frameId = ( this.frameId + 1 ) % 9007199254740991;

		// update scene graph

		if ( scene.autoUpdate === true ) scene.updateMatrixWorld();

		if ( vr.enabled ) {

			camera = vr.getCamera( camera );

		}

		//

		_infoRender.frame ++;
		_infoRender.calls = 0;
		_infoRender.vertices = 0;
		_infoRender.faces = 0;
		_infoRender.points = 0;
		_infoRender.portals = 0;

		var clear = renderer.autoClear || forceClear;

		this.renderCamera( scene, camera, renderTarget, clear );

		// Generate mipmap if we're using any kind of mipmap filtering

		if ( renderTarget ) {

			textures.updateRenderTargetMipmap( renderTarget );

		}

		// Ensure depth buffer writing is enabled so it can be cleared on next render

		state.buffers.depth.setTest( true );
		state.buffers.depth.setMask( true );
		state.buffers.color.setMask( true );

		state.setPolygonOffset( false );

		if ( vr.enabled ) {

			vr.submitFrame();

		}

		// _gl.finish();

	}

	this.renderCamera = function ( scene, camera, renderTarget, clear ) {

		// update camera matrices and frustum

		if ( camera.parent === null ) camera.updateMatrixWorld();

		var renderData = {
			projScreenMatrix: new Matrix4(),
			frustum: new Frustum(),
			lightsArray: [],
			shadowsArray: [],
			spritesArray: [],
			flaresArray: [],
			lights: new WebGLLights(),
			clipping: new WebGLClipping(),
			clippingEnabled: false,
			localClippingEnabled: this.localClippingEnabled
		};

		renderData.projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		renderData.frustum.setFromMatrix( renderData.projScreenMatrix );

		renderData.clippingEnabled = renderData.clipping.init( this.clippingPlanes, renderData.localClippingEnabled, camera );

		currentRenderList = renderLists.get( scene, camera );
		currentRenderList.init();

		projectObject( renderData, scene, camera, _this.sortObjects );

		if ( _this.sortObjects === true ) {

			currentRenderList.sort();

		}

		//

		if ( renderData.clippingEnabled ) renderData.clipping.beginShadows();

		_this.shadowMap.render( renderData, scene, camera );

		renderData.lights.setup( renderData, camera );

		if ( renderData.clippingEnabled ) renderData.clipping.endShadows();

		if ( renderTarget === undefined ) {

			renderTarget = null;

		}

		this.setRenderTarget( renderTarget );

		if ( _this.currentPortalDepth > 0 ) this.state.buffers.stencil.setTest(true);

		//

		background.render( renderData, currentRenderList, scene, camera, clear, this.currentPortalDepth > 0 );

		// render scene

		var opaqueObjects = currentRenderList.opaque;
		var portalObjects = currentRenderList.portal;
		var transparentObjects = currentRenderList.transparent;

		var overrideMaterial = scene.overrideMaterial ? scene.overrideMaterial : undefined;

		// opaque pass (front-to-back order)

		if ( opaqueObjects.length ) renderObjects( renderData, opaqueObjects, scene, camera, overrideMaterial );

		// portal pass (front-to-back order)

		if ( portalObjects.length > 0 && this.currentPortalDepth < this.maxPortalDepth) {

			renderPortalObjects( renderData, portalObjects, scene, camera, overrideMaterial, renderTarget );

		}

		// transparent pass (back-to-front order)

		if ( transparentObjects.length ) renderObjects( renderData, transparentObjects, scene, camera, overrideMaterial );

		// custom renderers

		spriteRenderer.render( renderData.spritesArray, scene, camera );
		flareRenderer.render( renderData.flaresArray, scene, camera, _currentViewport );

	};

	/*
	// TODO Duplicated code (Frustum)

	var _sphere = new Sphere();

	function isObjectViewable( renderData, object ) {

		var geometry = object.geometry;

		if ( geometry.boundingSphere === null )
			geometry.computeBoundingSphere();

		_sphere.copy( geometry.boundingSphere ).
		applyMatrix4( object.matrixWorld );

		return isSphereViewable( renderData, _sphere );

	}

	function isSpriteViewable( renderData, sprite ) {

		_sphere.center.set( 0, 0, 0 );
		_sphere.radius = 0.7071067811865476;
		_sphere.applyMatrix4( sprite.matrixWorld );

		return isSphereViewable( renderData, _sphere );

	}

	function isSphereViewable( renderData, sphere ) {

		if ( ! renderData.frustum.intersectsSphere( sphere ) ) return false;

		var numPlanes = renderData.clipping.numPlanes;

		if ( numPlanes === 0 ) return true;

		var planes = _this.clippingPlanes,

			center = sphere.center,
			negRad = - sphere.radius,
			i = 0;

		do {

			// out when deeper than radius in the negative halfspace
			if ( planes[ i ].distanceToPoint( center ) < negRad ) return false;

		} while ( ++ i !== numPlanes );

		return true;

	}
	*/

	function projectObject( renderData, object, camera, sortObjects ) {

		if ( ! object.visible ) return;

		var visible = object.layers.test( camera.layers );

		if ( visible ) {

			if ( object.isLight ) {

				renderData.lightsArray.push( object );

				if ( object.castShadow ) {

					renderData.shadowsArray.push( object );

				}

			} else if ( object.isSprite ) {

				if ( ! object.frustumCulled || renderData.frustum.intersectsSprite( object ) ) {

					renderData.spritesArray.push( object );

				}

			} else if ( object.isLensFlare ) {

				renderData.flaresArray.push( object );

			} else if ( object.isImmediateRenderObject ) {

				if ( sortObjects ) {

					_vector3.setFromMatrixPosition( object.matrixWorld )
						.applyMatrix4( renderData.projScreenMatrix );

				}

				currentRenderList.push( camera, object, null, object.material, _vector3.z, null );

			} else if ( object.isMesh || object.isLine || object.isPoints ) {

				if ( object.isSkinnedMesh ) {

					object.skeleton.update();

				}

				if ( ! object.frustumCulled || renderData.frustum.intersectsObject( object ) ) {

					if ( sortObjects ) {

						_vector3.setFromMatrixPosition( object.matrixWorld )
							.applyMatrix4( renderData.projScreenMatrix );

					}

					var geometry = objects.update( object );
					var material = object.material;

					if ( Array.isArray( material ) ) {

						var groups = geometry.groups;

						for ( var i = 0, l = groups.length; i < l; i ++ ) {

							var group = groups[ i ];
							var groupMaterial = material[ group.materialIndex ];

							if ( groupMaterial && groupMaterial.visible ) {

								currentRenderList.push( object, geometry, groupMaterial, _vector3.z, group, camera );

							}

						}

					} else if ( material.visible ) {

						currentRenderList.push( object, geometry, material, _vector3.z, null, camera );

					}

				}

			}

		}

		var children = object.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			projectObject( renderData,children[ i ], camera, sortObjects );

		}

	}

	var portalSealMaterial = new MeshBasicMaterial( { depthTest: true, depthFunc: THREE.AlwaysDepth, depthWrite: true, colorWrite: false } );

	function renderPortalObjects( renderData, renderList, scene, camera, overrideMaterial, renderTarget ) {

		var count = Math.min(renderList.length, Math.min( _this.maxPortalCount, _this.maxPortalTotal - _infoRender.portals ) );

		var state = _this.state;
		var context = _this.context;

		var rotateY = new Matrix4();
		rotateY.makeRotationY( Math.PI );

		var mirrorZ = new Matrix4();
		mirrorZ.elements[10] = -1;

		state.buffers.color.setMask( false );
		state.buffers.color.setLocked( true );
		if ( _this.currentPortalDepth < 1 ) {
			state.buffers.stencil.setTest( true );
		}
		state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.REPLACE );
		state.buffers.stencil.setMask( 0x0f << (_this.currentPortalDepth * 4) );

		for ( var i = 0; i < count; i ++ ) {

			var renderItem = renderList[ i ];

			var object = renderItem.object;
			var portal = object.portal;
			var geometry = renderItem.geometry;
			var material = overrideMaterial === undefined ? renderItem.material : overrideMaterial;
			var group = renderItem.group;

			state.buffers.stencil.setFunc( context.EQUAL, _this.currentPortalStencil | ( ( ( i + 1 ) & 0x0f ) << (_this.currentPortalDepth*4) ), _this.currentPortalDepth > 0 ? 0x0f << ((_this.currentPortalDepth-1) * 4) : 0 );

			renderObject( renderData, object, scene, camera, geometry, material, group );

		}

		state.buffers.color.setLocked( false );
		state.buffers.color.setMask( true );

		var cameraToPortal = new Matrix4();
		var portalToCamera = new Matrix4();

		for ( var i = 0; i < count; i ++ ) {

			var renderItem = renderList[ i ];

			var object = renderItem.object;
			var portal = object.portal;
			var target = portal.target || object;
			var geometry = renderItem.geometry;
			var material = overrideMaterial === undefined ? renderItem.material : overrideMaterial;
			var group = renderItem.group;

			var stencilValue = ( ( i + 1 ) & 0x0f) << (_this.currentPortalDepth*4);

			var oldPortalStencil = _this.currentPortalStencil;
			_this.currentPortalStencil |= stencilValue;

			state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.KEEP );
			state.buffers.stencil.setFunc( context.EQUAL, _this.currentPortalStencil, 0x0f << (_this.currentPortalDepth * 4) );

			// calculate the transform from the camera to the portal..
			portalToCamera.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
			cameraToPortal.getInverse( portalToCamera );

			var targetMatrix = target.matrixWorld.clone();
			if ( portal.mirror ) {

				var _x = targetMatrix.elements[12];
				var _y = targetMatrix.elements[13];
				var _z = targetMatrix.elements[14];
				targetMatrix.multiply( mirrorZ );
				targetMatrix.elements[12] = _x;
				targetMatrix.elements[13] = _y;
				targetMatrix.elements[14] = _z;

			} else {

				targetMatrix.multiply( rotateY );

			}

			var portalCamera = camera.clone(); //needs to be a separate instance for each iteration (due to deferred rendering/object instance caching?)

			// ..then place the portal camera over the target and reverse it by this transform..
			portalCamera.matrix.multiplyMatrices( targetMatrix, cameraToPortal );
			portalCamera.matrix.decompose( portalCamera.position, portalCamera.quaternion, portalCamera.scale );
			portalCamera.updateMatrixWorld();


			// ..then transform the near clipping plane to the destination surface
			var nearPlane = new Plane();
			nearPlane.setFromNormalAndCoplanarPoint(
				new Vector3(-portalToCamera.elements[8], -portalToCamera.elements[9], -portalToCamera.elements[10]),
				new Vector3(portalToCamera.elements[12], portalToCamera.elements[13], portalToCamera.elements[14])
			);
			nearPlane.constant -= 0.01;
			setProjectionNearPlane( portalCamera.projectionMatrix, nearPlane );

			_infoRender.portals ++;

			// render its contents

			++_this.currentPortalDepth;

			_this.renderCamera( portal.scene||scene, portalCamera, renderTarget, true );

			--_this.currentPortalDepth;

			// finally, seal off the portal (by writing depth and clearing the stencil of this portal) - for the transparent pass doesn't draw within the portal and so identical cousin portals with the same id don't interfer with this one

			state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.ZERO );
			state.buffers.stencil.setFunc( context.EQUAL, _this.currentPortalStencil, 0x0f << (_this.currentPortalDepth * 4) );
			state.buffers.stencil.setMask( 0x0f << (_this.currentPortalDepth * 4) );

			renderObject( renderData, object, scene, camera, geometry, portalSealMaterial, group );

			_this.currentPortalStencil = oldPortalStencil;
		}

		if ( _this.currentPortalDepth > 0 ) {

			//restore previous test from depth above

			state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.KEEP );
			state.buffers.stencil.setFunc( context.EQUAL, _this.currentPortalStencil, 0x0f << ( ( _this.currentPortalDepth - 1 ) * 4) );

		} else {

			state.buffers.stencil.setTest( false );
			state.reset();

		}

	}

	function renderObjects( renderData, renderList, scene, camera, overrideMaterial ) {

		for ( var i = 0, l = renderList.length; i < l; i ++ ) {

			var renderItem = renderList[ i ];

			var object = renderItem.object;
			var geometry = renderItem.geometry;
			var material = overrideMaterial === undefined ? renderItem.material : overrideMaterial;
			var group = renderItem.group;

			renderObject( renderData, object, scene, camera, geometry, material, group );

		}

	}

	function renderObject( renderData, object, scene, camera, geometry, material, group ) {

		if ( camera.isArrayCamera ) {

			_currentArrayCamera = camera;

			var cameras = camera.cameras;

			for ( var j = 0, jl = cameras.length; j < jl; j ++ ) {

				var camera2 = cameras[ j ];

				if ( object.layers.test( camera2.layers ) ) {

					var bounds = camera2.bounds;

					var x = bounds.x * _width;
					var y = bounds.y * _height;
					var width = bounds.z * _width;
					var height = bounds.w * _height;

					state.viewport( _currentViewport.set( x, y, width, height ).multiplyScalar( _pixelRatio ) );
					state.scissor( _currentScissor.set( x, y, width, height ).multiplyScalar( _pixelRatio ) );
					state.setScissorTest( true );

					renderObjectInternal( renderData, object, scene, camera2, geometry, material, group );

				}

			}

		} else {

			_currentArrayCamera = null;

			renderObjectInternal( renderData, object, scene, camera, geometry, material, group );

		}

	}

	function renderObjectInternal( renderData, object, scene, camera, geometry, material, group ) {

		object.onBeforeRender( _this, scene, camera, geometry, material, group );

		object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
		object.normalMatrix.getNormalMatrix( object.modelViewMatrix );

		if ( object.isImmediateRenderObject ) {

			if ( camera !== _currentCamera ) {

				_this.currentlyMirrored = camera.scale.x<0 !== camera.scale.y<0;
				
			}

			state.setMaterial( material );

			var program = setProgram( renderData, camera, scene.fog, material, object );

			_currentGeometryProgram = '';

			renderObjectImmediate( object, program, material );

		} else {

			_this.renderBufferDirect( renderData, camera, scene.fog, geometry, material, object, group );

		}

		object.onAfterRender( _this, scene, camera, geometry, material, group );

	}

	// https://web.archive.org/web/20160318114033/http://www.terathon.com/code/oblique.html

	var setProjectionNearPlane = (function() {

		function sign( x ) { return x>0?1:x<1?-1:0; }

		return function( matrix, nearPlane ) {

			// Calculate the clip-space corner point opposite the clipping plane
			// as (sign(nearPlane.x), sign(nearPlane.y), 1, 1) and
			// transform it into camera space by multiplying it
			// by the inverse of the projection matrix

			var q = new Vector4(
				(sign(nearPlane.normal.x) + matrix.elements[8]) / matrix.elements[0],
				(sign(nearPlane.normal.y) + matrix.elements[9]) / matrix.elements[5],
				-1.0,
				(1.0 + matrix.elements[10]) / matrix.elements[14]
			);

			// Calculate the scaled plane vector
			var c = new Vector4( nearPlane.normal.x, nearPlane.normal.y, nearPlane.normal.z, nearPlane.constant );
			c.multiplyScalar( 2.0 / c.dot( q ) );

	 		// Replace the third row of the projection matrix
			matrix.elements[2] = c.x;
			matrix.elements[6] = c.y;
			matrix.elements[10] = c.z + 1.0;
			matrix.elements[14] = c.w;
		}

	})();

	function initMaterial( renderData, material, fog, object ) {

		var materialProperties = properties.get( material );

		var lights = renderData.lights;

		var parameters = programCache.getParameters(
			material, lights.state, renderData.shadowsArray, fog, renderData.clipping.numPlanes, renderData.clipping.numIntersection, object );

		var code = programCache.getProgramCode( material, parameters );

		var program = materialProperties.program;
		var programChange = true;

		if ( program === undefined ) {

			// new material
			material.addEventListener( 'dispose', onMaterialDispose );

		} else if ( program.code !== code ) {

			// changed glsl or parameters
			releaseMaterialProgramReference( material );

		} else if ( parameters.shaderID !== undefined ) {

			// same glsl and uniform list
			return;

		} else {

			// only rebuild uniform list
			programChange = false;

		}

		if ( programChange ) {

			if ( parameters.shaderID ) {

				var shader = ShaderLib[ parameters.shaderID ];

				materialProperties.shader = {
					name: material.type,
					uniforms: UniformsUtils.clone( shader.uniforms ),
					vertexShader: shader.vertexShader,
					fragmentShader: shader.fragmentShader
				};

			} else {

				materialProperties.shader = {
					name: material.type,
					uniforms: material.uniforms,
					vertexShader: material.vertexShader,
					fragmentShader: material.fragmentShader
				};

			}

			material.onBeforeCompile( materialProperties.shader );

			program = programCache.acquireProgram( material, materialProperties.shader, parameters, code );

			materialProperties.program = program;
			material.program = program;

		}

		var programAttributes = program.getAttributes();

		if ( material.morphTargets ) {

			material.numSupportedMorphTargets = 0;

			for ( var i = 0; i < _this.maxMorphTargets; i ++ ) {

				if ( programAttributes[ 'morphTarget' + i ] >= 0 ) {

					material.numSupportedMorphTargets ++;

				}

			}

		}

		if ( material.morphNormals ) {

			material.numSupportedMorphNormals = 0;

			for ( var i = 0; i < _this.maxMorphNormals; i ++ ) {

				if ( programAttributes[ 'morphNormal' + i ] >= 0 ) {

					material.numSupportedMorphNormals ++;

				}

			}

		}

		var uniforms = materialProperties.shader.uniforms;

		if ( ! material.isShaderMaterial &&
			! material.isRawShaderMaterial ||
			material.clipping === true ) {

			materialProperties.numClippingPlanes = renderData.clipping.numPlanes;
			materialProperties.numIntersection = renderData.clipping.numIntersection;
			uniforms.clippingPlanes = renderData.clipping.uniform;

		}

		materialProperties.fog = fog;

		// store the light setup it was created for

		materialProperties.lightsHash = lights.state.hash;

		var progUniforms = materialProperties.program.getUniforms(),
			uniformsList =
				WebGLUniforms.seqWithValue( progUniforms.seq, uniforms );

		materialProperties.uniformsList = uniformsList;

	}

	function setProgram( renderData, camera, fog, material, object ) {

		_usedTextureUnits = 0;

		var materialProperties = properties.get( material );

		if ( renderData.clippingEnabled ) {

			if ( renderData.localClippingEnabled || camera !== _currentCamera ) {

				var useCache =
					camera === _currentCamera &&
					material.id === _currentMaterialId;

				// we might want to call this function with some ClippingGroup
				// object instead of the material, once it becomes feasible
				// (#8465, #8379)
				renderData.clipping.setState(
					material.clippingPlanes, material.clipIntersection, material.clipShadows,
					camera, materialProperties, useCache );

			}

		}

		if ( material.needsUpdate === false ) {

			if ( materialProperties.program === undefined ) {

				material.needsUpdate = true;

			} else if ( material.fog && materialProperties.fog !== fog ) {

				material.needsUpdate = true;

			} else if ( material.lights && materialProperties.lightsHash !== renderData.lights.state.hash ) {

				material.needsUpdate = true;

			} else if ( materialProperties.numClippingPlanes !== undefined &&
				( materialProperties.numClippingPlanes !== renderData.clipping.numPlanes ||
				materialProperties.numIntersection !== renderData.clipping.numIntersection ) ) {

				material.needsUpdate = true;

			}

		}

		if ( material.needsUpdate ) {

			initMaterial( renderData, material, fog, object );
			material.needsUpdate = false;

		}

		var refreshProgram = false;
		var refreshMaterial = false;
		var refreshLights = false;

		var program = materialProperties.program,
			p_uniforms = program.getUniforms(),
			m_uniforms = materialProperties.shader.uniforms;

		if ( state.useProgram( program.program ) ) {

			refreshProgram = true;
			refreshMaterial = true;
			refreshLights = true;

		}

		if ( material.id !== _currentMaterialId ) {

			_currentMaterialId = material.id;

			refreshMaterial = true;

		}

		if ( refreshProgram || camera !== _currentCamera ) {

			p_uniforms.setValue( _gl, 'projectionMatrix', camera.projectionMatrix );

			if ( capabilities.logarithmicDepthBuffer ) {

				p_uniforms.setValue( _gl, 'logDepthBufFC',
					2.0 / ( Math.log( camera.far + 1.0 ) / Math.LN2 ) );

			}

			// Avoid unneeded uniform updates per ArrayCamera's sub-camera

			if ( _currentCamera !== ( _currentArrayCamera || camera ) ) {

				_currentCamera = ( _currentArrayCamera || camera );

				// lighting uniforms depend on the camera so enforce an update
				// now, in case this material supports lights - or later, when
				// the next material that does gets activated:

				refreshMaterial = true;		// set to true on material change
				refreshLights = true;		// remains set until update done

			}

			// load material specific uniforms
			// (shader material also gets them for the sake of genericity)

			if ( material.isShaderMaterial ||
				material.isMeshPhongMaterial ||
				material.isMeshStandardMaterial ||
				material.envMap ) {

				var uCamPos = p_uniforms.map.cameraPosition;

				if ( uCamPos !== undefined ) {

					uCamPos.setValue( _gl,
						_vector3.setFromMatrixPosition( camera.matrixWorld ) );

				}

			}

			if ( material.isMeshPhongMaterial ||
				material.isMeshLambertMaterial ||
				material.isMeshBasicMaterial ||
				material.isMeshStandardMaterial ||
				material.isShaderMaterial ||
				material.skinning ) {

				p_uniforms.setValue( _gl, 'viewMatrix', camera.matrixWorldInverse );

			}

		}

		// skinning uniforms must be set even if material didn't change
		// auto-setting of texture unit for bone texture must go before other textures
		// not sure why, but otherwise weird things happen

		if ( material.skinning ) {

			p_uniforms.setOptional( _gl, object, 'bindMatrix' );
			p_uniforms.setOptional( _gl, object, 'bindMatrixInverse' );

			var skeleton = object.skeleton;

			if ( skeleton ) {

				var bones = skeleton.bones;

				if ( capabilities.floatVertexTextures ) {

					if ( skeleton.boneTexture === undefined ) {

						// layout (1 matrix = 4 pixels)
						//      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
						//  with  8x8  pixel texture max   16 bones * 4 pixels =  (8 * 8)
						//       16x16 pixel texture max   64 bones * 4 pixels = (16 * 16)
						//       32x32 pixel texture max  256 bones * 4 pixels = (32 * 32)
						//       64x64 pixel texture max 1024 bones * 4 pixels = (64 * 64)


						var size = Math.sqrt( bones.length * 4 ); // 4 pixels needed for 1 matrix
						size = _Math.nextPowerOfTwo( Math.ceil( size ) );
						size = Math.max( size, 4 );

						var boneMatrices = new Float32Array( size * size * 4 ); // 4 floats per RGBA pixel
						boneMatrices.set( skeleton.boneMatrices ); // copy current values

						var boneTexture = new DataTexture( boneMatrices, size, size, RGBAFormat, FloatType );

						skeleton.boneMatrices = boneMatrices;
						skeleton.boneTexture = boneTexture;
						skeleton.boneTextureSize = size;

					}

					p_uniforms.setValue( _gl, 'boneTexture', skeleton.boneTexture );
					p_uniforms.setValue( _gl, 'boneTextureSize', skeleton.boneTextureSize );

				} else {

					p_uniforms.setOptional( _gl, skeleton, 'boneMatrices' );

				}

			}

		}

		if ( refreshMaterial ) {

			p_uniforms.setValue( _gl, 'toneMappingExposure', _this.toneMappingExposure );
			p_uniforms.setValue( _gl, 'toneMappingWhitePoint', _this.toneMappingWhitePoint );

			// refresh uniforms common to several materials

			if ( fog && material.fog ) {

				refreshUniformsFog( m_uniforms, fog );

			}

			if ( material.isMeshBasicMaterial ) {

				refreshUniformsCommon( m_uniforms, material );

			} else if ( material.isMeshLambertMaterial ) {

				refreshUniformsCommon( m_uniforms, material );
				refreshUniformsLambert( m_uniforms, material );

			} else if ( material.isMeshPhongMaterial ) {

				refreshUniformsCommon( m_uniforms, material );

				if ( material.isMeshToonMaterial ) {

					refreshUniformsToon( m_uniforms, material );

				} else {

					refreshUniformsPhong( m_uniforms, material );

				}

			} else if ( material.isMeshStandardMaterial ) {

				refreshUniformsCommon( m_uniforms, material );

				if ( material.isMeshPhysicalMaterial ) {

					refreshUniformsPhysical( m_uniforms, material );

				} else {

					refreshUniformsStandard( m_uniforms, material );

				}

			} else if ( material.isMeshNormalMaterial ) {

				refreshUniformsCommon( m_uniforms, material );

			} else if ( material.isMeshDepthMaterial ) {

				refreshUniformsCommon( m_uniforms, material );
				refreshUniformsDepth( m_uniforms, material );

			} else if ( material.isMeshDistanceMaterial ) {

				refreshUniformsCommon( m_uniforms, material );
				refreshUniformsDistance( m_uniforms, material );

			} else if ( material.isMeshNormalMaterial ) {

				refreshUniformsNormal( m_uniforms, material );

			} else if ( material.isLineBasicMaterial ) {

				refreshUniformsLine( m_uniforms, material );

				if ( material.isLineDashedMaterial ) {

					refreshUniformsDash( m_uniforms, material );

				}

			} else if ( material.isPointsMaterial ) {

				refreshUniformsPoints( m_uniforms, material );

			} else if ( material.isShadowMaterial ) {

				m_uniforms.color.value = material.color;
				m_uniforms.opacity.value = material.opacity;

			}

			// RectAreaLight Texture
			// TODO (mrdoob): Find a nicer implementation

			if ( m_uniforms.ltcMat !== undefined ) m_uniforms.ltcMat.value = UniformsLib.LTC_MAT_TEXTURE;
			if ( m_uniforms.ltcMag !== undefined ) m_uniforms.ltcMag.value = UniformsLib.LTC_MAG_TEXTURE;

			WebGLUniforms.upload(_gl, materialProperties.uniformsList, m_uniforms, _this );

		}


		// common matrices

		p_uniforms.setValue( _gl, 'modelViewMatrix', object.modelViewMatrix );
		p_uniforms.setValue( _gl, 'normalMatrix', object.normalMatrix );
		p_uniforms.setValue( _gl, 'modelMatrix', object.matrixWorld );

		if ( refreshMaterial && refreshLights && material.lights ) {
			var lightState = renderData.lights.state;
			p_uniforms.setValue( _gl, 'ambientLightColor', lightState.ambient);
			p_uniforms.setValue( _gl, 'directionalLights', lightState.directional);
			p_uniforms.setValue( _gl, 'spotLights', lightState.spot);
			p_uniforms.setValue( _gl, 'rectAreaLights', lightState.rectArea);
			p_uniforms.setValue( _gl, 'pointLights', lightState.point);
			p_uniforms.setValue( _gl, 'hemisphereLights', lightState.hemi);

			p_uniforms.setValue( _gl, 'directionalShadowMap', lightState.directionalShadowMap);
			p_uniforms.setValue( _gl, 'directionalShadowMatrix', lightState.directionalShadowMatrix);
			p_uniforms.setValue( _gl, 'spotShadowMap', lightState.spotShadowMap);
			p_uniforms.setValue( _gl, 'spotShadowMatrix', lightState.spotShadowMatrix);
			p_uniforms.setValue( _gl, 'pointShadowMap', lightState.pointShadowMap);
			p_uniforms.setValue( _gl, 'pointShadowMatrix', lightState.pointShadowMatrix);
			// TODO (abelnation): add area lights shadow info to uniforms
		}

		return program;

	}

	// Uniforms (refresh uniforms objects)

	function refreshUniformsCommon( uniforms, material ) {

		uniforms.opacity.value = material.opacity;

		if ( material.color ) {

			uniforms.diffuse.value = material.color;

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

		if ( material.envMap ) {

			uniforms.envMap.value = material.envMap;

			// don't flip CubeTexture envMaps, flip everything else:
			//  WebGLRenderTargetCube will be flipped for backwards compatibility
			//  WebGLRenderTargetCube.texture will be flipped because it's a Texture and NOT a CubeTexture
			// this check must be handled differently, or removed entirely, if WebGLRenderTargetCube uses a CubeTexture in the future
			uniforms.flipEnvMap.value = ( ! ( material.envMap && material.envMap.isCubeTexture ) ) ? 1 : - 1;

			uniforms.reflectivity.value = material.reflectivity;
			uniforms.refractionRatio.value = material.refractionRatio;

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

			var offset = uvScaleMap.offset;
			var repeat = uvScaleMap.repeat;

			uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

		}

	}

	function refreshUniformsLine( uniforms, material ) {

		uniforms.diffuse.value = material.color;
		uniforms.opacity.value = material.opacity;

	}

	function refreshUniformsDash( uniforms, material ) {

		uniforms.dashSize.value = material.dashSize;
		uniforms.totalSize.value = material.dashSize + material.gapSize;
		uniforms.scale.value = material.scale;

	}

	function refreshUniformsPoints( uniforms, material ) {

		uniforms.diffuse.value = material.color;
		uniforms.opacity.value = material.opacity;
		uniforms.size.value = material.size * _pixelRatio;
		uniforms.scale.value = _height * 0.5;

		uniforms.map.value = material.map;

		if ( material.map !== null ) {

			var offset = material.map.offset;
			var repeat = material.map.repeat;

			uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

		}

	}

	function refreshUniformsFog( uniforms, fog ) {

		uniforms.fogColor.value = fog.color;

		if ( fog.isFog ) {

			uniforms.fogNear.value = fog.near;
			uniforms.fogFar.value = fog.far;

		} else if ( fog.isFogExp2 ) {

			uniforms.fogDensity.value = fog.density;

		}

	}

	function refreshUniformsLambert( uniforms, material ) {

		if ( material.emissiveMap ) {

			uniforms.emissiveMap.value = material.emissiveMap;

		}

	}

	function refreshUniformsPhong( uniforms, material ) {

		uniforms.specular.value = material.specular;
		uniforms.shininess.value = Math.max( material.shininess, 1e-4 ); // to prevent pow( 0.0, 0.0 )

		if ( material.emissiveMap ) {

			uniforms.emissiveMap.value = material.emissiveMap;

		}

		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;

		}

		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );

		}

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

	function refreshUniformsToon( uniforms, material ) {

		refreshUniformsPhong( uniforms, material );

		if ( material.gradientMap ) {

			uniforms.gradientMap.value = material.gradientMap;

		}

	}

	function refreshUniformsStandard( uniforms, material ) {

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

		}

		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );

		}

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

		if ( material.envMap ) {

			//uniforms.envMap.value = material.envMap; // part of uniforms common
			uniforms.envMapIntensity.value = material.envMapIntensity;

		}

	}

	function refreshUniformsPhysical( uniforms, material ) {

		uniforms.clearCoat.value = material.clearCoat;
		uniforms.clearCoatRoughness.value = material.clearCoatRoughness;

		refreshUniformsStandard( uniforms, material );

	}

	function refreshUniformsDepth( uniforms, material ) {

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

	function refreshUniformsDistance( uniforms, material ) {

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

		uniforms.referencePosition.value.copy( material.referencePosition );
		uniforms.nearDistance.value = material.nearDistance;
		uniforms.farDistance.value = material.farDistance;

	}

	function refreshUniformsNormal( uniforms, material ) {

		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;

		}

		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );

		}

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

	// GL state setting

	this.setFaceCulling = function ( cullFace, frontFaceDirection ) {

		state.setCullFace( cullFace );
		state.setFlipSided( frontFaceDirection === FrontFaceDirectionCW );

	};

	// Textures

	function allocTextureUnit() {

		var textureUnit = _usedTextureUnits;

		if ( textureUnit >= capabilities.maxTextures ) {

			console.warn( 'THREE.WebGLRenderer: Trying to use ' + textureUnit + ' texture units while this GPU supports only ' + capabilities.maxTextures );

		}

		_usedTextureUnits += 1;

		return textureUnit;

	}

	this.allocTextureUnit = allocTextureUnit;

	// this.setTexture2D = setTexture2D;
	this.setTexture2D = ( function () {

		var warned = false;

		// backwards compatibility: peel texture.texture
		return function setTexture2D( texture, slot ) {

			if ( texture && texture.isWebGLRenderTarget ) {

				if ( ! warned ) {

					console.warn( "THREE.WebGLRenderer.setTexture2D: don't use render targets as textures. Use their .texture property instead." );
					warned = true;

				}

				texture = texture.texture;

			}

			textures.setTexture2D( texture, slot );

		};

	}() );

	this.setTexture = ( function () {

		var warned = false;

		return function setTexture( texture, slot ) {

			if ( ! warned ) {

				console.warn( "THREE.WebGLRenderer: .setTexture is deprecated, use setTexture2D instead." );
				warned = true;

			}

			textures.setTexture2D( texture, slot );

		};

	}() );

	this.setTextureCube = ( function () {

		var warned = false;

		return function setTextureCube( texture, slot ) {

			// backwards compatibility: peel texture.texture
			if ( texture && texture.isWebGLRenderTargetCube ) {

				if ( ! warned ) {

					console.warn( "THREE.WebGLRenderer.setTextureCube: don't use cube render targets as textures. Use their .texture property instead." );
					warned = true;

				}

				texture = texture.texture;

			}

			// currently relying on the fact that WebGLRenderTargetCube.texture is a Texture and NOT a CubeTexture
			// TODO: unify these code paths
			if ( ( texture && texture.isCubeTexture ) ||
				( Array.isArray( texture.image ) && texture.image.length === 6 ) ) {

				// CompressedTexture can have Array in image :/

				// this function alone should take care of cube textures
				textures.setTextureCube( texture, slot );

			} else {

				// assumed: texture property of THREE.WebGLRenderTargetCube

				textures.setTextureCubeDynamic( texture, slot );

			}

		};

	}() );

	this.getRenderTarget = function () {

		return _currentRenderTarget;

	};

	this.setRenderTarget = function ( renderTarget ) {

		_currentRenderTarget = renderTarget;

		if ( renderTarget && properties.get( renderTarget ).__webglFramebuffer === undefined ) {

			textures.setupRenderTarget( renderTarget );

		}

		var framebuffer = null;
		var isCube = false;

		if ( renderTarget ) {

			var __webglFramebuffer = properties.get( renderTarget ).__webglFramebuffer;

			if ( renderTarget.isWebGLRenderTargetCube ) {

				framebuffer = __webglFramebuffer[ renderTarget.activeCubeFace ];
				isCube = true;

			} else {

				framebuffer = __webglFramebuffer;

			}

			_currentViewport.copy( renderTarget.viewport );
			_currentScissor.copy( renderTarget.scissor );
			_currentScissorTest = renderTarget.scissorTest;

		} else {

			_currentViewport.copy( _viewport ).multiplyScalar( _pixelRatio );
			_currentScissor.copy( _scissor ).multiplyScalar( _pixelRatio );
			_currentScissorTest = _scissorTest;

		}

		if ( _currentFramebuffer !== framebuffer ) {

			_gl.bindFramebuffer( _gl.FRAMEBUFFER, framebuffer );
			_currentFramebuffer = framebuffer;

		}

		state.viewport( _currentViewport );
		state.scissor( _currentScissor );
		state.setScissorTest( _currentScissorTest );

		if ( isCube ) {

			var textureProperties = properties.get( renderTarget.texture );
			_gl.framebufferTexture2D( _gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_CUBE_MAP_POSITIVE_X + renderTarget.activeCubeFace, textureProperties.__webglTexture, renderTarget.activeMipMapLevel );

		}

	};

	this.readRenderTargetPixels = function ( renderTarget, x, y, width, height, buffer ) {

		if ( ! ( renderTarget && renderTarget.isWebGLRenderTarget ) ) {

			console.error( 'THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.' );
			return;

		}

		var framebuffer = properties.get( renderTarget ).__webglFramebuffer;

		if ( framebuffer ) {

			var restore = false;

			if ( framebuffer !== _currentFramebuffer ) {

				_gl.bindFramebuffer( _gl.FRAMEBUFFER, framebuffer );

				restore = true;

			}

			try {

				var texture = renderTarget.texture;
				var textureFormat = texture.format;
				var textureType = texture.type;

				if ( textureFormat !== RGBAFormat && utils.convert( textureFormat ) !== _gl.getParameter( _gl.IMPLEMENTATION_COLOR_READ_FORMAT ) ) {

					console.error( 'THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.' );
					return;

				}

				if ( textureType !== UnsignedByteType && utils.convert( textureType ) !== _gl.getParameter( _gl.IMPLEMENTATION_COLOR_READ_TYPE ) && // IE11, Edge and Chrome Mac < 52 (#9513)
					! ( textureType === FloatType && ( extensions.get( 'OES_texture_float' ) || extensions.get( 'WEBGL_color_buffer_float' ) ) ) && // Chrome Mac >= 52 and Firefox
					! ( textureType === HalfFloatType && extensions.get( 'EXT_color_buffer_half_float' ) ) ) {

					console.error( 'THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.' );
					return;

				}

				if ( _gl.checkFramebufferStatus( _gl.FRAMEBUFFER ) === _gl.FRAMEBUFFER_COMPLETE ) {

					// the following if statement ensures valid read requests (no out-of-bounds pixels, see #8604)

					if ( ( x >= 0 && x <= ( renderTarget.width - width ) ) && ( y >= 0 && y <= ( renderTarget.height - height ) ) ) {

						_gl.readPixels( x, y, width, height, utils.convert( textureFormat ), utils.convert( textureType ), buffer );

					}

				} else {

					console.error( 'THREE.WebGLRenderer.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not complete.' );

				}

			} finally {

				if ( restore ) {

					_gl.bindFramebuffer( _gl.FRAMEBUFFER, _currentFramebuffer );

				}

			}

		}

	};

}


export { WebGLRenderer };
