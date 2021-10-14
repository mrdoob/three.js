import {
	BackSide,
	DoubleSide,
	FrontSide,
	RGBAFormat,
	HalfFloatType,
	FloatType,
	UnsignedByteType,
	LinearEncoding,
	NoToneMapping,
	LinearMipmapLinearFilter,
	NearestFilter,
	ClampToEdgeWrapping
} from '../constants.js';
import { Frustum } from '../math/Frustum.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Vector3 } from '../math/Vector3.js';
import { Vector4 } from '../math/Vector4.js';
import { WebGLAnimation } from './webgl/WebGLAnimation.js';
import { WebGLAttributes } from './webgl/WebGLAttributes.js';
import { WebGLBackground } from './webgl/WebGLBackground.js';
import { WebGLBindingStates } from './webgl/WebGLBindingStates.js';
import { WebGLBufferRenderer } from './webgl/WebGLBufferRenderer.js';
import { WebGLCapabilities } from './webgl/WebGLCapabilities.js';
import { WebGLClipping } from './webgl/WebGLClipping.js';
import { WebGLCubeMaps } from './webgl/WebGLCubeMaps.js';
import { WebGLCubeUVMaps } from './webgl/WebGLCubeUVMaps.js';
import { WebGLExtensions } from './webgl/WebGLExtensions.js';
import { WebGLGeometries } from './webgl/WebGLGeometries.js';
import { WebGLIndexedBufferRenderer } from './webgl/WebGLIndexedBufferRenderer.js';
import { WebGLInfo } from './webgl/WebGLInfo.js';
import { WebGLMorphtargets } from './webgl/WebGLMorphtargets.js';
import { WebGLMultisampleRenderTarget } from './WebGLMultisampleRenderTarget.js';
import { WebGLObjects } from './webgl/WebGLObjects.js';
import { WebGLPrograms } from './webgl/WebGLPrograms.js';
import { WebGLProperties } from './webgl/WebGLProperties.js';
import { WebGLRenderLists } from './webgl/WebGLRenderLists.js';
import { WebGLRenderStates } from './webgl/WebGLRenderStates.js';
import { WebGLRenderTarget } from './WebGLRenderTarget.js';
import { WebGLShadowMap } from './webgl/WebGLShadowMap.js';
import { WebGLState } from './webgl/WebGLState.js';
import { WebGLTextures } from './webgl/WebGLTextures.js';
import { WebGLUniforms } from './webgl/WebGLUniforms.js';
import { WebGLUtils } from './webgl/WebGLUtils.js';
import { WebXRManager } from './webxr/WebXRManager.js';
import { WebGLMaterials } from './webgl/WebGLMaterials.js';
import { createElementNS } from '../utils.js';

function createCanvasElement() {

	const canvas = createElementNS( 'canvas' );
	canvas.style.display = 'block';
	return canvas;

}

function WebGLRenderer( parameters = {} ) {

	const _canvas = parameters.canvas !== undefined ? parameters.canvas : createCanvasElement(),
		_context = parameters.context !== undefined ? parameters.context : null,

		_alpha = parameters.alpha !== undefined ? parameters.alpha : false,
		_depth = parameters.depth !== undefined ? parameters.depth : true,
		_stencil = parameters.stencil !== undefined ? parameters.stencil : true,
		_antialias = parameters.antialias !== undefined ? parameters.antialias : false,
		_premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true,
		_preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false,
		_powerPreference = parameters.powerPreference !== undefined ? parameters.powerPreference : 'default',
		_failIfMajorPerformanceCaveat = parameters.failIfMajorPerformanceCaveat !== undefined ? parameters.failIfMajorPerformanceCaveat : false;

	let currentRenderList = null;
	let currentRenderState = null;

	// render() can be called from within a callback triggered by another render.
	// We track this so that the nested render call gets its list and state isolated from the parent render call.

	const renderListStack = [];
	const renderStateStack = [];

	// public properties

	this.domElement = _canvas;

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

	this.gammaFactor = 2.0;	// for backwards compatibility
	this.outputEncoding = LinearEncoding;

	// physical lights

	this.physicallyCorrectLights = false;

	// tone mapping

	this.toneMapping = NoToneMapping;
	this.toneMappingExposure = 1.0;

	// internal properties

	const _this = this;

	let _isContextLost = false;

	// internal state cache

	let _currentActiveCubeFace = 0;
	let _currentActiveMipmapLevel = 0;
	let _currentRenderTarget = null;
	let _currentMaterialId = - 1;

	let _currentCamera = null;

	const _currentViewport = new Vector4();
	const _currentScissor = new Vector4();
	let _currentScissorTest = null;

	//

	let _width = _canvas.width;
	let _height = _canvas.height;

	let _pixelRatio = 1;
	let _opaqueSort = null;
	let _transparentSort = null;

	const _viewport = new Vector4( 0, 0, _width, _height );
	const _scissor = new Vector4( 0, 0, _width, _height );
	let _scissorTest = false;

	//

	const _currentDrawBuffers = [];

	// frustum

	const _frustum = new Frustum();

	// clipping

	let _clippingEnabled = false;
	let _localClippingEnabled = false;

	// transmission

	let _transmissionRenderTarget = null;

	// camera matrices cache

	const _projScreenMatrix = new Matrix4();

	const _vector3 = new Vector3();

	const _emptyScene = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: true };

	function getTargetPixelRatio() {

		return _currentRenderTarget === null ? _pixelRatio : 1;

	}

	// initialize

	let _gl = _context;

	function getContext( contextNames, contextAttributes ) {

		for ( let i = 0; i < contextNames.length; i ++ ) {

			const contextName = contextNames[ i ];
			const context = _canvas.getContext( contextName, contextAttributes );
			if ( context !== null ) return context;

		}

		return null;

	}

	try {

		const contextAttributes = {
			alpha: _alpha,
			depth: _depth,
			stencil: _stencil,
			antialias: _antialias,
			premultipliedAlpha: _premultipliedAlpha,
			preserveDrawingBuffer: _preserveDrawingBuffer,
			powerPreference: _powerPreference,
			failIfMajorPerformanceCaveat: _failIfMajorPerformanceCaveat
		};

		// event listeners must be registered before WebGL context is created, see #12753

		_canvas.addEventListener( 'webglcontextlost', onContextLost, false );
		_canvas.addEventListener( 'webglcontextrestored', onContextRestore, false );

		if ( _gl === null ) {

			const contextNames = [ 'webgl2', 'webgl', 'experimental-webgl' ];

			if ( _this.isWebGL1Renderer === true ) {

				contextNames.shift();

			}

			_gl = getContext( contextNames, contextAttributes );

			if ( _gl === null ) {

				if ( getContext( contextNames ) ) {

					throw new Error( 'Error creating WebGL context with your selected attributes.' );

				} else {

					throw new Error( 'Error creating WebGL context.' );

				}

			}

		}

		// Some experimental-webgl implementations do not have getShaderPrecisionFormat

		if ( _gl.getShaderPrecisionFormat === undefined ) {

			_gl.getShaderPrecisionFormat = function () {

				return { 'rangeMin': 1, 'rangeMax': 1, 'precision': 1 };

			};

		}

	} catch ( error ) {

		console.error( 'THREE.WebGLRenderer: ' + error.message );
		throw error;

	}

	let extensions, capabilities, state, info;
	let properties, textures, cubemaps, cubeuvmaps, attributes, geometries, objects;
	let programCache, materials, renderLists, renderStates, clipping, shadowMap;

	let background, morphtargets, bufferRenderer, indexedBufferRenderer;

	let utils, bindingStates;

	function initGLContext() {

		extensions = new WebGLExtensions( _gl );

		capabilities = new WebGLCapabilities( _gl, extensions, parameters );

		extensions.init( capabilities );

		utils = new WebGLUtils( _gl, extensions, capabilities );

		state = new WebGLState( _gl, extensions, capabilities );

		_currentDrawBuffers[ 0 ] = _gl.BACK;

		info = new WebGLInfo( _gl );
		properties = new WebGLProperties();
		textures = new WebGLTextures( _gl, extensions, state, properties, capabilities, utils, info );
		cubemaps = new WebGLCubeMaps( _this );
		cubeuvmaps = new WebGLCubeUVMaps( _this );
		attributes = new WebGLAttributes( _gl, capabilities );
		bindingStates = new WebGLBindingStates( _gl, extensions, attributes, capabilities );
		geometries = new WebGLGeometries( _gl, attributes, info, bindingStates );
		objects = new WebGLObjects( _gl, geometries, attributes, info );
		morphtargets = new WebGLMorphtargets( _gl, capabilities, textures );
		clipping = new WebGLClipping( properties );
		programCache = new WebGLPrograms( _this, cubemaps, cubeuvmaps, extensions, capabilities, bindingStates, clipping );
		materials = new WebGLMaterials( properties );
		renderLists = new WebGLRenderLists( properties );
		renderStates = new WebGLRenderStates( extensions, capabilities );
		background = new WebGLBackground( _this, cubemaps, state, objects, _premultipliedAlpha );
		shadowMap = new WebGLShadowMap( _this, objects, capabilities );

		bufferRenderer = new WebGLBufferRenderer( _gl, extensions, info, capabilities );
		indexedBufferRenderer = new WebGLIndexedBufferRenderer( _gl, extensions, info, capabilities );

		info.programs = programCache.programs;

		_this.capabilities = capabilities;
		_this.extensions = extensions;
		_this.properties = properties;
		_this.renderLists = renderLists;
		_this.shadowMap = shadowMap;
		_this.state = state;
		_this.info = info;

	}

	initGLContext();

	// xr

	const xr = new WebXRManager( _this, _gl );

	this.xr = xr;

	// API

	this.getContext = function () {

		return _gl;

	};

	this.getContextAttributes = function () {

		return _gl.getContextAttributes();

	};

	this.forceContextLoss = function () {

		const extension = extensions.get( 'WEBGL_lose_context' );
		if ( extension ) extension.loseContext();

	};

	this.forceContextRestore = function () {

		const extension = extensions.get( 'WEBGL_lose_context' );
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

	this.getSize = function ( target ) {

		return target.set( _width, _height );

	};

	this.setSize = function ( width, height, updateStyle ) {

		if ( xr.isPresenting ) {

			console.warn( 'THREE.WebGLRenderer: Can\'t change size while VR device is presenting.' );
			return;

		}

		_width = width;
		_height = height;

		_canvas.width = Math.floor( width * _pixelRatio );
		_canvas.height = Math.floor( height * _pixelRatio );

		if ( updateStyle !== false ) {

			_canvas.style.width = width + 'px';
			_canvas.style.height = height + 'px';

		}

		this.setViewport( 0, 0, width, height );

	};

	this.getDrawingBufferSize = function ( target ) {

		return target.set( _width * _pixelRatio, _height * _pixelRatio ).floor();

	};

	this.setDrawingBufferSize = function ( width, height, pixelRatio ) {

		_width = width;
		_height = height;

		_pixelRatio = pixelRatio;

		_canvas.width = Math.floor( width * pixelRatio );
		_canvas.height = Math.floor( height * pixelRatio );

		this.setViewport( 0, 0, width, height );

	};

	this.getCurrentViewport = function ( target ) {

		return target.copy( _currentViewport );

	};

	this.getViewport = function ( target ) {

		return target.copy( _viewport );

	};

	this.setViewport = function ( x, y, width, height ) {

		if ( x.isVector4 ) {

			_viewport.set( x.x, x.y, x.z, x.w );

		} else {

			_viewport.set( x, y, width, height );

		}

		state.viewport( _currentViewport.copy( _viewport ).multiplyScalar( _pixelRatio ).floor() );

	};

	this.getScissor = function ( target ) {

		return target.copy( _scissor );

	};

	this.setScissor = function ( x, y, width, height ) {

		if ( x.isVector4 ) {

			_scissor.set( x.x, x.y, x.z, x.w );

		} else {

			_scissor.set( x, y, width, height );

		}

		state.scissor( _currentScissor.copy( _scissor ).multiplyScalar( _pixelRatio ).floor() );

	};

	this.getScissorTest = function () {

		return _scissorTest;

	};

	this.setScissorTest = function ( boolean ) {

		state.setScissorTest( _scissorTest = boolean );

	};

	this.setOpaqueSort = function ( method ) {

		_opaqueSort = method;

	};

	this.setTransparentSort = function ( method ) {

		_transparentSort = method;

	};

	// Clearing

	this.getClearColor = function ( target ) {

		return target.copy( background.getClearColor() );

	};

	this.setClearColor = function () {

		background.setClearColor.apply( background, arguments );

	};

	this.getClearAlpha = function () {

		return background.getClearAlpha();

	};

	this.setClearAlpha = function () {

		background.setClearAlpha.apply( background, arguments );

	};

	this.clear = function ( color, depth, stencil ) {

		let bits = 0;

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

	//

	this.dispose = function () {

		_canvas.removeEventListener( 'webglcontextlost', onContextLost, false );
		_canvas.removeEventListener( 'webglcontextrestored', onContextRestore, false );

		renderLists.dispose();
		renderStates.dispose();
		properties.dispose();
		cubemaps.dispose();
		cubeuvmaps.dispose();
		objects.dispose();
		bindingStates.dispose();

		xr.dispose();

		xr.removeEventListener( 'sessionstart', onXRSessionStart );
		xr.removeEventListener( 'sessionend', onXRSessionEnd );

		if ( _transmissionRenderTarget ) {

			_transmissionRenderTarget.dispose();
			_transmissionRenderTarget = null;

		}

		animation.stop();

	};

	// Events

	function onContextLost( event ) {

		event.preventDefault();

		console.log( 'THREE.WebGLRenderer: Context Lost.' );

		_isContextLost = true;

	}

	function onContextRestore( /* event */ ) {

		console.log( 'THREE.WebGLRenderer: Context Restored.' );

		_isContextLost = false;

		const infoAutoReset = info.autoReset;
		const shadowMapEnabled = shadowMap.enabled;
		const shadowMapAutoUpdate = shadowMap.autoUpdate;
		const shadowMapNeedsUpdate = shadowMap.needsUpdate;
		const shadowMapType = shadowMap.type;

		initGLContext();

		info.autoReset = infoAutoReset;
		shadowMap.enabled = shadowMapEnabled;
		shadowMap.autoUpdate = shadowMapAutoUpdate;
		shadowMap.needsUpdate = shadowMapNeedsUpdate;
		shadowMap.type = shadowMapType;

	}

	function onMaterialDispose( event ) {

		const material = event.target;

		material.removeEventListener( 'dispose', onMaterialDispose );

		deallocateMaterial( material );

	}

	// Buffer deallocation

	function deallocateMaterial( material ) {

		releaseMaterialProgramReferences( material );

		properties.remove( material );

	}


	function releaseMaterialProgramReferences( material ) {

		const programs = properties.get( material ).programs;

		if ( programs !== undefined ) {

			programs.forEach( function ( program ) {

				programCache.releaseProgram( program );

			} );

		}

	}

	// Buffer rendering

	this.renderBufferDirect = function ( camera, scene, geometry, material, object, group ) {

		if ( scene === null ) scene = _emptyScene; // renderBufferDirect second parameter used to be fog (could be null)

		const frontFaceCW = ( object.isMesh && object.matrixWorld.determinant() < 0 );

		const program = setProgram( camera, scene, geometry, material, object );

		state.setMaterial( material, frontFaceCW );

		//

		let index = geometry.index;
		const position = geometry.attributes.position;

		//

		if ( index === null ) {

			if ( position === undefined || position.count === 0 ) return;

		} else if ( index.count === 0 ) {

			return;

		}

		//

		let rangeFactor = 1;

		if ( material.wireframe === true ) {

			index = geometries.getWireframeAttribute( geometry );
			rangeFactor = 2;

		}

		bindingStates.setup( object, material, program, geometry, index );

		let attribute;
		let renderer = bufferRenderer;

		if ( index !== null ) {

			attribute = attributes.get( index );

			renderer = indexedBufferRenderer;
			renderer.setIndex( attribute );

		}

		//

		const dataCount = ( index !== null ) ? index.count : position.count;

		const rangeStart = geometry.drawRange.start * rangeFactor;
		const rangeCount = geometry.drawRange.count * rangeFactor;

		const groupStart = group !== null ? group.start * rangeFactor : 0;
		const groupCount = group !== null ? group.count * rangeFactor : Infinity;

		const drawStart = Math.max( rangeStart, groupStart );
		const drawEnd = Math.min( dataCount, rangeStart + rangeCount, groupStart + groupCount ) - 1;

		const drawCount = Math.max( 0, drawEnd - drawStart + 1 );

		if ( drawCount === 0 ) return;

		//

		if ( object.isMesh ) {

			if ( material.wireframe === true ) {

				state.setLineWidth( material.wireframeLinewidth * getTargetPixelRatio() );
				renderer.setMode( _gl.LINES );

			} else {

				renderer.setMode( _gl.TRIANGLES );

			}

		} else if ( object.isLine ) {

			let lineWidth = material.linewidth;

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

		} else if ( object.isSprite ) {

			renderer.setMode( _gl.TRIANGLES );

		}

		if ( object.isInstancedMesh ) {

			renderer.renderInstances( drawStart, drawCount, object.count );

		} else if ( geometry.isInstancedBufferGeometry ) {

			const instanceCount = Math.min( geometry.instanceCount, geometry._maxInstanceCount );

			renderer.renderInstances( drawStart, drawCount, instanceCount );

		} else {

			renderer.render( drawStart, drawCount );

		}

	};

	// Compile

	this.compile = function ( scene, camera ) {

		currentRenderState = renderStates.get( scene );
		currentRenderState.init();

		renderStateStack.push( currentRenderState );

		scene.traverseVisible( function ( object ) {

			if ( object.isLight && object.layers.test( camera.layers ) ) {

				currentRenderState.pushLight( object );

				if ( object.castShadow ) {

					currentRenderState.pushShadow( object );

				}

			}

		} );

		currentRenderState.setupLights( _this.physicallyCorrectLights );

		scene.traverse( function ( object ) {

			const material = object.material;

			if ( material ) {

				if ( Array.isArray( material ) ) {

					for ( let i = 0; i < material.length; i ++ ) {

						const material2 = material[ i ];

						getProgram( material2, scene, object );

					}

				} else {

					getProgram( material, scene, object );

				}

			}

		} );

		renderStateStack.pop();
		currentRenderState = null;

	};

	// Animation Loop

	let onAnimationFrameCallback = null;

	function onAnimationFrame( time ) {

		if ( onAnimationFrameCallback ) onAnimationFrameCallback( time );

	}

	function onXRSessionStart() {

		animation.stop();

	}

	function onXRSessionEnd() {

		animation.start();

	}

	const animation = new WebGLAnimation();
	animation.setAnimationLoop( onAnimationFrame );

	if ( typeof window !== 'undefined' ) animation.setContext( window );

	this.setAnimationLoop = function ( callback ) {

		onAnimationFrameCallback = callback;
		xr.setAnimationLoop( callback );

		( callback === null ) ? animation.stop() : animation.start();

	};

	xr.addEventListener( 'sessionstart', onXRSessionStart );
	xr.addEventListener( 'sessionend', onXRSessionEnd );

	// Rendering

	this.render = function ( scene, camera ) {

		if ( camera !== undefined && camera.isCamera !== true ) {

			console.error( 'THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.' );
			return;

		}

		if ( _isContextLost === true ) return;

		// update scene graph

		if ( scene.autoUpdate === true ) scene.updateMatrixWorld();

		// update camera matrices and frustum

		if ( camera.parent === null ) camera.updateMatrixWorld();

		if ( xr.enabled === true && xr.isPresenting === true ) {

			if ( xr.cameraAutoUpdate === true ) xr.updateCamera( camera );

			camera = xr.getCamera(); // use XR camera for rendering

		}

		//
		if ( scene.isScene === true ) scene.onBeforeRender( _this, scene, camera, _currentRenderTarget );

		currentRenderState = renderStates.get( scene, renderStateStack.length );
		currentRenderState.init();

		renderStateStack.push( currentRenderState );

		_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		_frustum.setFromProjectionMatrix( _projScreenMatrix );

		_localClippingEnabled = this.localClippingEnabled;
		_clippingEnabled = clipping.init( this.clippingPlanes, _localClippingEnabled, camera );

		currentRenderList = renderLists.get( scene, renderListStack.length );
		currentRenderList.init();

		renderListStack.push( currentRenderList );

		projectObject( scene, camera, 0, _this.sortObjects );

		currentRenderList.finish();

		if ( _this.sortObjects === true ) {

			currentRenderList.sort( _opaqueSort, _transparentSort );

		}

		//

		if ( _clippingEnabled === true ) clipping.beginShadows();

		const shadowsArray = currentRenderState.state.shadowsArray;

		shadowMap.render( shadowsArray, scene, camera );

		if ( _clippingEnabled === true ) clipping.endShadows();

		//

		if ( this.info.autoReset === true ) this.info.reset();

		//

		background.render( currentRenderList, scene );

		// render scene

		currentRenderState.setupLights( _this.physicallyCorrectLights );

		if ( camera.isArrayCamera ) {

			const cameras = camera.cameras;

			for ( let i = 0, l = cameras.length; i < l; i ++ ) {

				const camera2 = cameras[ i ];

				renderScene( currentRenderList, scene, camera2, camera2.viewport );

			}

		} else {

			renderScene( currentRenderList, scene, camera );

		}

		//

		if ( _currentRenderTarget !== null ) {

			// resolve multisample renderbuffers to a single-sample texture if necessary

			textures.updateMultisampleRenderTarget( _currentRenderTarget );

			// Generate mipmap if we're using any kind of mipmap filtering

			textures.updateRenderTargetMipmap( _currentRenderTarget );

		}

		//

		if ( scene.isScene === true ) scene.onAfterRender( _this, scene, camera );

		// Ensure depth buffer writing is enabled so it can be cleared on next render

		state.buffers.depth.setTest( true );
		state.buffers.depth.setMask( true );
		state.buffers.color.setMask( true );

		state.setPolygonOffset( false );

		// _gl.finish();

		bindingStates.resetDefaultState();
		_currentMaterialId = - 1;
		_currentCamera = null;

		renderStateStack.pop();

		if ( renderStateStack.length > 0 ) {

			currentRenderState = renderStateStack[ renderStateStack.length - 1 ];

		} else {

			currentRenderState = null;

		}

		renderListStack.pop();

		if ( renderListStack.length > 0 ) {

			currentRenderList = renderListStack[ renderListStack.length - 1 ];

		} else {

			currentRenderList = null;

		}

	};

	function projectObject( object, camera, groupOrder, sortObjects ) {

		if ( object.visible === false ) return;

		const visible = object.layers.test( camera.layers );

		if ( visible ) {

			if ( object.isGroup ) {

				groupOrder = object.renderOrder;

			} else if ( object.isLOD ) {

				if ( object.autoUpdate === true ) object.update( camera );

			} else if ( object.isLight ) {

				currentRenderState.pushLight( object );

				if ( object.castShadow ) {

					currentRenderState.pushShadow( object );

				}

			} else if ( object.isSprite ) {

				if ( ! object.frustumCulled || _frustum.intersectsSprite( object ) ) {

					if ( sortObjects ) {

						_vector3.setFromMatrixPosition( object.matrixWorld )
							.applyMatrix4( _projScreenMatrix );

					}

					const geometry = objects.update( object );
					const material = object.material;

					if ( material.visible ) {

						currentRenderList.push( object, geometry, material, groupOrder, _vector3.z, null );

					}

				}

			} else if ( object.isMesh || object.isLine || object.isPoints ) {

				if ( object.isSkinnedMesh ) {

					// update skeleton only once in a frame

					if ( object.skeleton.frame !== info.render.frame ) {

						object.skeleton.update();
						object.skeleton.frame = info.render.frame;

					}

				}

				if ( ! object.frustumCulled || _frustum.intersectsObject( object ) ) {

					if ( sortObjects ) {

						_vector3.setFromMatrixPosition( object.matrixWorld )
							.applyMatrix4( _projScreenMatrix );

					}

					const geometry = objects.update( object );
					const material = object.material;

					if ( Array.isArray( material ) ) {

						const groups = geometry.groups;

						for ( let i = 0, l = groups.length; i < l; i ++ ) {

							const group = groups[ i ];
							const groupMaterial = material[ group.materialIndex ];

							if ( groupMaterial && groupMaterial.visible ) {

								currentRenderList.push( object, geometry, groupMaterial, groupOrder, _vector3.z, group );

							}

						}

					} else if ( material.visible ) {

						currentRenderList.push( object, geometry, material, groupOrder, _vector3.z, null );

					}

				}

			}

		}

		const children = object.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			projectObject( children[ i ], camera, groupOrder, sortObjects );

		}

	}

	function renderScene( currentRenderList, scene, camera, viewport ) {

		const opaqueObjects = currentRenderList.opaque;
		const transmissiveObjects = currentRenderList.transmissive;
		const transparentObjects = currentRenderList.transparent;

		currentRenderState.setupLightsView( camera );

		if ( transmissiveObjects.length > 0 ) renderTransmissionPass( opaqueObjects, scene, camera );

		if ( viewport ) state.viewport( _currentViewport.copy( viewport ) );

		if ( opaqueObjects.length > 0 ) renderObjects( opaqueObjects, scene, camera );
		if ( transmissiveObjects.length > 0 ) renderObjects( transmissiveObjects, scene, camera );
		if ( transparentObjects.length > 0 ) renderObjects( transparentObjects, scene, camera );

	}

	function renderTransmissionPass( opaqueObjects, scene, camera ) {

		if ( _transmissionRenderTarget === null ) {

			const needsAntialias = _antialias === true && capabilities.isWebGL2 === true;
			const renderTargetType = needsAntialias ? WebGLMultisampleRenderTarget : WebGLRenderTarget;

			_transmissionRenderTarget = new renderTargetType( 1024, 1024, {
				generateMipmaps: true,
				type: utils.convert( HalfFloatType ) !== null ? HalfFloatType : UnsignedByteType,
				minFilter: LinearMipmapLinearFilter,
				magFilter: NearestFilter,
				wrapS: ClampToEdgeWrapping,
				wrapT: ClampToEdgeWrapping
			} );

		}

		const currentRenderTarget = _this.getRenderTarget();
		_this.setRenderTarget( _transmissionRenderTarget );
		_this.clear();

		// Turn off the features which can affect the frag color for opaque objects pass.
		// Otherwise they are applied twice in opaque objects pass and transmission objects pass.
		const currentToneMapping = _this.toneMapping;
		_this.toneMapping = NoToneMapping;

		renderObjects( opaqueObjects, scene, camera );

		_this.toneMapping = currentToneMapping;

		textures.updateMultisampleRenderTarget( _transmissionRenderTarget );
		textures.updateRenderTargetMipmap( _transmissionRenderTarget );

		_this.setRenderTarget( currentRenderTarget );

	}

	function renderObjects( renderList, scene, camera ) {

		const overrideMaterial = scene.isScene === true ? scene.overrideMaterial : null;

		for ( let i = 0, l = renderList.length; i < l; i ++ ) {

			const renderItem = renderList[ i ];

			const object = renderItem.object;
			const geometry = renderItem.geometry;
			const material = overrideMaterial === null ? renderItem.material : overrideMaterial;
			const group = renderItem.group;

			if ( object.layers.test( camera.layers ) ) {

				renderObject( object, scene, camera, geometry, material, group );

			}

		}

	}

	function renderObject( object, scene, camera, geometry, material, group ) {

		object.onBeforeRender( _this, scene, camera, geometry, material, group );

		object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
		object.normalMatrix.getNormalMatrix( object.modelViewMatrix );

		material.onBeforeRender( _this, scene, camera, geometry, object, group );

		if ( material.transparent === true && material.side === DoubleSide ) {

			material.side = BackSide;
			material.needsUpdate = true;
			_this.renderBufferDirect( camera, scene, geometry, material, object, group );

			material.side = FrontSide;
			material.needsUpdate = true;
			_this.renderBufferDirect( camera, scene, geometry, material, object, group );

			material.side = DoubleSide;

		} else {

			_this.renderBufferDirect( camera, scene, geometry, material, object, group );

		}

		object.onAfterRender( _this, scene, camera, geometry, material, group );

	}

	function getProgram( material, scene, object ) {

		if ( scene.isScene !== true ) scene = _emptyScene; // scene could be a Mesh, Line, Points, ...

		const materialProperties = properties.get( material );

		const lights = currentRenderState.state.lights;
		const shadowsArray = currentRenderState.state.shadowsArray;

		const lightsStateVersion = lights.state.version;

		const parameters = programCache.getParameters( material, lights.state, shadowsArray, scene, object );
		const programCacheKey = programCache.getProgramCacheKey( parameters );

		let programs = materialProperties.programs;

		// always update environment and fog - changing these trigger an getProgram call, but it's possible that the program doesn't change

		materialProperties.environment = material.isMeshStandardMaterial ? scene.environment : null;
		materialProperties.fog = scene.fog;
		materialProperties.envMap = ( material.isMeshStandardMaterial ? cubeuvmaps : cubemaps ).get( material.envMap || materialProperties.environment );

		if ( programs === undefined ) {

			// new material

			material.addEventListener( 'dispose', onMaterialDispose );

			programs = new Map();
			materialProperties.programs = programs;

		}

		let program = programs.get( programCacheKey );

		if ( program !== undefined ) {

			// early out if program and light state is identical

			if ( materialProperties.currentProgram === program && materialProperties.lightsStateVersion === lightsStateVersion ) {

				updateCommonMaterialProperties( material, parameters );

				return program;

			}

		} else {

			parameters.uniforms = programCache.getUniforms( material );

			material.onBuild( object, parameters, _this );

			material.onBeforeCompile( parameters, _this );

			program = programCache.acquireProgram( parameters, programCacheKey );
			programs.set( programCacheKey, program );

			materialProperties.uniforms = parameters.uniforms;

		}

		const uniforms = materialProperties.uniforms;

		if ( ( ! material.isShaderMaterial && ! material.isRawShaderMaterial ) || material.clipping === true ) {

			uniforms.clippingPlanes = clipping.uniform;

		}

		updateCommonMaterialProperties( material, parameters );

		// store the light setup it was created for

		materialProperties.needsLights = materialNeedsLights( material );
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
			uniforms.ltc_1.value = lights.state.rectAreaLTC1;
			uniforms.ltc_2.value = lights.state.rectAreaLTC2;
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

		const progUniforms = program.getUniforms();
		const uniformsList = WebGLUniforms.seqWithValue( progUniforms.seq, uniforms );

		materialProperties.currentProgram = program;
		materialProperties.uniformsList = uniformsList;

		return program;

	}

	function updateCommonMaterialProperties( material, parameters ) {

		const materialProperties = properties.get( material );

		materialProperties.outputEncoding = parameters.outputEncoding;
		materialProperties.instancing = parameters.instancing;
		materialProperties.skinning = parameters.skinning;
		materialProperties.morphTargets = parameters.morphTargets;
		materialProperties.morphNormals = parameters.morphNormals;
		materialProperties.morphTargetsCount = parameters.morphTargetsCount;
		materialProperties.numClippingPlanes = parameters.numClippingPlanes;
		materialProperties.numIntersection = parameters.numClipIntersection;
		materialProperties.vertexAlphas = parameters.vertexAlphas;
		materialProperties.vertexTangents = parameters.vertexTangents;

	}

	function setProgram( camera, scene, geometry, material, object ) {

		if ( scene.isScene !== true ) scene = _emptyScene; // scene could be a Mesh, Line, Points, ...

		textures.resetTextureUnits();

		const fog = scene.fog;
		const environment = material.isMeshStandardMaterial ? scene.environment : null;
		const encoding = ( _currentRenderTarget === null ) ? _this.outputEncoding : _currentRenderTarget.texture.encoding;
		const envMap = ( material.isMeshStandardMaterial ? cubeuvmaps : cubemaps ).get( material.envMap || environment );
		const vertexAlphas = material.vertexColors === true && !! geometry.attributes.color && geometry.attributes.color.itemSize === 4;
		const vertexTangents = !! material.normalMap && !! geometry.attributes.tangent;
		const morphTargets = !! geometry.morphAttributes.position;
		const morphNormals = !! geometry.morphAttributes.normal;
		const morphTargetsCount = !! geometry.morphAttributes.position ? geometry.morphAttributes.position.length : 0;

		const materialProperties = properties.get( material );
		const lights = currentRenderState.state.lights;

		if ( _clippingEnabled === true ) {

			if ( _localClippingEnabled === true || camera !== _currentCamera ) {

				const useCache =
					camera === _currentCamera &&
					material.id === _currentMaterialId;

				// we might want to call this function with some ClippingGroup
				// object instead of the material, once it becomes feasible
				// (#8465, #8379)
				clipping.setState( material, camera, useCache );

			}

		}

		//

		let needsProgramChange = false;

		if ( material.version === materialProperties.__version ) {

			if ( materialProperties.needsLights && ( materialProperties.lightsStateVersion !== lights.state.version ) ) {

				needsProgramChange = true;

			} else if ( materialProperties.outputEncoding !== encoding ) {

				needsProgramChange = true;

			} else if ( object.isInstancedMesh && materialProperties.instancing === false ) {

				needsProgramChange = true;

			} else if ( ! object.isInstancedMesh && materialProperties.instancing === true ) {

				needsProgramChange = true;

			} else if ( object.isSkinnedMesh && materialProperties.skinning === false ) {

				needsProgramChange = true;

			} else if ( ! object.isSkinnedMesh && materialProperties.skinning === true ) {

				needsProgramChange = true;

			} else if ( materialProperties.envMap !== envMap ) {

				needsProgramChange = true;

			} else if ( material.fog && materialProperties.fog !== fog ) {

				needsProgramChange = true;

			} else if ( materialProperties.numClippingPlanes !== undefined &&
				( materialProperties.numClippingPlanes !== clipping.numPlanes ||
				materialProperties.numIntersection !== clipping.numIntersection ) ) {

				needsProgramChange = true;

			} else if ( materialProperties.vertexAlphas !== vertexAlphas ) {

				needsProgramChange = true;

			} else if ( materialProperties.vertexTangents !== vertexTangents ) {

				needsProgramChange = true;

			} else if ( materialProperties.morphTargets !== morphTargets ) {

				needsProgramChange = true;

			} else if ( materialProperties.morphNormals !== morphNormals ) {

				needsProgramChange = true;

			} else if ( capabilities.isWebGL2 === true && materialProperties.morphTargetsCount !== morphTargetsCount ) {

				needsProgramChange = true;

			}

		} else {

			needsProgramChange = true;
			materialProperties.__version = material.version;

		}

		//

		let program = materialProperties.currentProgram;

		if ( needsProgramChange === true ) {

			program = getProgram( material, scene, object );

		}

		let refreshProgram = false;
		let refreshMaterial = false;
		let refreshLights = false;

		const p_uniforms = program.getUniforms(),
			m_uniforms = materialProperties.uniforms;

		if ( state.useProgram( program.program ) ) {

			refreshProgram = true;
			refreshMaterial = true;
			refreshLights = true;

		}

		if ( material.id !== _currentMaterialId ) {

			_currentMaterialId = material.id;

			refreshMaterial = true;

		}

		if ( refreshProgram || _currentCamera !== camera ) {

			p_uniforms.setValue( _gl, 'projectionMatrix', camera.projectionMatrix );

			if ( capabilities.logarithmicDepthBuffer ) {

				p_uniforms.setValue( _gl, 'logDepthBufFC',
					2.0 / ( Math.log( camera.far + 1.0 ) / Math.LN2 ) );

			}

			if ( _currentCamera !== camera ) {

				_currentCamera = camera;

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
				material.isMeshToonMaterial ||
				material.isMeshStandardMaterial ||
				material.envMap ) {

				const uCamPos = p_uniforms.map.cameraPosition;

				if ( uCamPos !== undefined ) {

					uCamPos.setValue( _gl,
						_vector3.setFromMatrixPosition( camera.matrixWorld ) );

				}

			}

			if ( material.isMeshPhongMaterial ||
				material.isMeshToonMaterial ||
				material.isMeshLambertMaterial ||
				material.isMeshBasicMaterial ||
				material.isMeshStandardMaterial ||
				material.isShaderMaterial ) {

				p_uniforms.setValue( _gl, 'isOrthographic', camera.isOrthographicCamera === true );

			}

			if ( material.isMeshPhongMaterial ||
				material.isMeshToonMaterial ||
				material.isMeshLambertMaterial ||
				material.isMeshBasicMaterial ||
				material.isMeshStandardMaterial ||
				material.isShaderMaterial ||
				material.isShadowMaterial ||
				object.isSkinnedMesh ) {

				p_uniforms.setValue( _gl, 'viewMatrix', camera.matrixWorldInverse );

			}

		}

		// skinning and morph target uniforms must be set even if material didn't change
		// auto-setting of texture unit for bone and morph texture must go before other textures
		// otherwise textures used for skinning and morphing can take over texture units reserved for other material textures

		if ( object.isSkinnedMesh ) {

			p_uniforms.setOptional( _gl, object, 'bindMatrix' );
			p_uniforms.setOptional( _gl, object, 'bindMatrixInverse' );

			const skeleton = object.skeleton;

			if ( skeleton ) {

				if ( capabilities.floatVertexTextures ) {

					if ( skeleton.boneTexture === null ) skeleton.computeBoneTexture();

					p_uniforms.setValue( _gl, 'boneTexture', skeleton.boneTexture, textures );
					p_uniforms.setValue( _gl, 'boneTextureSize', skeleton.boneTextureSize );

				} else {

					p_uniforms.setOptional( _gl, skeleton, 'boneMatrices' );

				}

			}

		}

		if ( !! geometry && ( geometry.morphAttributes.position !== undefined || geometry.morphAttributes.normal !== undefined ) ) {

			morphtargets.update( object, geometry, material, program );

		}


		if ( refreshMaterial || materialProperties.receiveShadow !== object.receiveShadow ) {

			materialProperties.receiveShadow = object.receiveShadow;
			p_uniforms.setValue( _gl, 'receiveShadow', object.receiveShadow );

		}

		if ( refreshMaterial ) {

			p_uniforms.setValue( _gl, 'toneMappingExposure', _this.toneMappingExposure );

			if ( materialProperties.needsLights ) {

				// the current material requires lighting info

				// note: all lighting uniforms are always set correctly
				// they simply reference the renderer's state for their
				// values
				//
				// use the current material's .needsUpdate flags to set
				// the GL state when required

				markUniformsLightsNeedsUpdate( m_uniforms, refreshLights );

			}

			// refresh uniforms common to several materials

			if ( fog && material.fog ) {

				materials.refreshFogUniforms( m_uniforms, fog );

			}

			materials.refreshMaterialUniforms( m_uniforms, material, _pixelRatio, _height, _transmissionRenderTarget );

			WebGLUniforms.upload( _gl, materialProperties.uniformsList, m_uniforms, textures );

		}

		if ( material.isShaderMaterial && material.uniformsNeedUpdate === true ) {

			WebGLUniforms.upload( _gl, materialProperties.uniformsList, m_uniforms, textures );
			material.uniformsNeedUpdate = false;

		}

		if ( material.isSpriteMaterial ) {

			p_uniforms.setValue( _gl, 'center', object.center );

		}

		// common matrices

		p_uniforms.setValue( _gl, 'modelViewMatrix', object.modelViewMatrix );
		p_uniforms.setValue( _gl, 'normalMatrix', object.normalMatrix );
		p_uniforms.setValue( _gl, 'modelMatrix', object.matrixWorld );

		return program;

	}

	// If uniforms are marked as clean, they don't need to be loaded to the GPU.

	function markUniformsLightsNeedsUpdate( uniforms, value ) {

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

	function materialNeedsLights( material ) {

		return material.isMeshLambertMaterial || material.isMeshToonMaterial || material.isMeshPhongMaterial ||
			material.isMeshStandardMaterial || material.isShadowMaterial ||
			( material.isShaderMaterial && material.lights === true );

	}

	this.getActiveCubeFace = function () {

		return _currentActiveCubeFace;

	};

	this.getActiveMipmapLevel = function () {

		return _currentActiveMipmapLevel;

	};

	this.getRenderTarget = function () {

		return _currentRenderTarget;

	};

	this.setRenderTarget = function ( renderTarget, activeCubeFace = 0, activeMipmapLevel = 0 ) {

		_currentRenderTarget = renderTarget;
		_currentActiveCubeFace = activeCubeFace;
		_currentActiveMipmapLevel = activeMipmapLevel;

		if ( renderTarget && properties.get( renderTarget ).__webglFramebuffer === undefined ) {

			textures.setupRenderTarget( renderTarget );

		}

		let framebuffer = null;
		let isCube = false;
		let isRenderTarget3D = false;

		if ( renderTarget ) {

			const texture = renderTarget.texture;

			if ( texture.isDataTexture3D || texture.isDataTexture2DArray ) {

				isRenderTarget3D = true;

			}

			const __webglFramebuffer = properties.get( renderTarget ).__webglFramebuffer;

			if ( renderTarget.isWebGLCubeRenderTarget ) {

				framebuffer = __webglFramebuffer[ activeCubeFace ];
				isCube = true;

			} else if ( renderTarget.isWebGLMultisampleRenderTarget ) {

				framebuffer = properties.get( renderTarget ).__webglMultisampledFramebuffer;

			} else {

				framebuffer = __webglFramebuffer;

			}

			_currentViewport.copy( renderTarget.viewport );
			_currentScissor.copy( renderTarget.scissor );
			_currentScissorTest = renderTarget.scissorTest;

		} else {

			_currentViewport.copy( _viewport ).multiplyScalar( _pixelRatio ).floor();
			_currentScissor.copy( _scissor ).multiplyScalar( _pixelRatio ).floor();
			_currentScissorTest = _scissorTest;

		}

		const framebufferBound = state.bindFramebuffer( _gl.FRAMEBUFFER, framebuffer );

		if ( framebufferBound && capabilities.drawBuffers ) {

			let needsUpdate = false;

			if ( renderTarget ) {

				if ( renderTarget.isWebGLMultipleRenderTargets ) {

					const textures = renderTarget.texture;

					if ( _currentDrawBuffers.length !== textures.length || _currentDrawBuffers[ 0 ] !== _gl.COLOR_ATTACHMENT0 ) {

						for ( let i = 0, il = textures.length; i < il; i ++ ) {

							_currentDrawBuffers[ i ] = _gl.COLOR_ATTACHMENT0 + i;

						}

						_currentDrawBuffers.length = textures.length;

						needsUpdate = true;

					}

				} else {

					if ( _currentDrawBuffers.length !== 1 || _currentDrawBuffers[ 0 ] !== _gl.COLOR_ATTACHMENT0 ) {

						_currentDrawBuffers[ 0 ] = _gl.COLOR_ATTACHMENT0;
						_currentDrawBuffers.length = 1;

						needsUpdate = true;

					}

				}

			} else {

				if ( _currentDrawBuffers.length !== 1 || _currentDrawBuffers[ 0 ] !== _gl.BACK ) {

					_currentDrawBuffers[ 0 ] = _gl.BACK;
					_currentDrawBuffers.length = 1;

					needsUpdate = true;

				}

			}

			if ( needsUpdate ) {

				if ( capabilities.isWebGL2 ) {

					_gl.drawBuffers( _currentDrawBuffers );

				} else {

					extensions.get( 'WEBGL_draw_buffers' ).drawBuffersWEBGL( _currentDrawBuffers );

				}

			}

		}

		state.viewport( _currentViewport );
		state.scissor( _currentScissor );
		state.setScissorTest( _currentScissorTest );

		if ( isCube ) {

			const textureProperties = properties.get( renderTarget.texture );
			_gl.framebufferTexture2D( _gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_CUBE_MAP_POSITIVE_X + activeCubeFace, textureProperties.__webglTexture, activeMipmapLevel );

		} else if ( isRenderTarget3D ) {

			const textureProperties = properties.get( renderTarget.texture );
			const layer = activeCubeFace || 0;
			_gl.framebufferTextureLayer( _gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, textureProperties.__webglTexture, activeMipmapLevel || 0, layer );

		}

		_currentMaterialId = - 1; // reset current material to ensure correct uniform bindings

	};

	this.readRenderTargetPixels = function ( renderTarget, x, y, width, height, buffer, activeCubeFaceIndex ) {

		if ( ! ( renderTarget && renderTarget.isWebGLRenderTarget ) ) {

			console.error( 'THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.' );
			return;

		}

		let framebuffer = properties.get( renderTarget ).__webglFramebuffer;

		if ( renderTarget.isWebGLCubeRenderTarget && activeCubeFaceIndex !== undefined ) {

			framebuffer = framebuffer[ activeCubeFaceIndex ];

		}

		if ( framebuffer ) {

			state.bindFramebuffer( _gl.FRAMEBUFFER, framebuffer );

			try {

				const texture = renderTarget.texture;
				const textureFormat = texture.format;
				const textureType = texture.type;

				if ( textureFormat !== RGBAFormat && utils.convert( textureFormat ) !== _gl.getParameter( _gl.IMPLEMENTATION_COLOR_READ_FORMAT ) ) {

					console.error( 'THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.' );
					return;

				}

				const halfFloatSupportedByExt = ( textureType === HalfFloatType ) && ( extensions.has( 'EXT_color_buffer_half_float' ) || ( capabilities.isWebGL2 && extensions.has( 'EXT_color_buffer_float' ) ) );

				if ( textureType !== UnsignedByteType && utils.convert( textureType ) !== _gl.getParameter( _gl.IMPLEMENTATION_COLOR_READ_TYPE ) && // Edge and Chrome Mac < 52 (#9513)
					! ( textureType === FloatType && ( capabilities.isWebGL2 || extensions.has( 'OES_texture_float' ) || extensions.has( 'WEBGL_color_buffer_float' ) ) ) && // Chrome Mac >= 52 and Firefox
					! halfFloatSupportedByExt ) {

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

				// restore framebuffer of current render target if necessary

				const framebuffer = ( _currentRenderTarget !== null ) ? properties.get( _currentRenderTarget ).__webglFramebuffer : null;
				state.bindFramebuffer( _gl.FRAMEBUFFER, framebuffer );

			}

		}

	};

	this.copyFramebufferToTexture = function ( position, texture, level = 0 ) {

		const levelScale = Math.pow( 2, - level );
		const width = Math.floor( texture.image.width * levelScale );
		const height = Math.floor( texture.image.height * levelScale );

		let glFormat = utils.convert( texture.format );

		if ( capabilities.isWebGL2 ) {

			// Workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=1120100
			// Not needed in Chrome 93+

			if ( glFormat === _gl.RGB ) glFormat = _gl.RGB8;
			if ( glFormat === _gl.RGBA ) glFormat = _gl.RGBA8;

		}

		textures.setTexture2D( texture, 0 );

		_gl.copyTexImage2D( _gl.TEXTURE_2D, level, glFormat, position.x, position.y, width, height, 0 );

		state.unbindTexture();

	};

	this.copyTextureToTexture = function ( position, srcTexture, dstTexture, level = 0 ) {

		const width = srcTexture.image.width;
		const height = srcTexture.image.height;
		const glFormat = utils.convert( dstTexture.format );
		const glType = utils.convert( dstTexture.type );

		textures.setTexture2D( dstTexture, 0 );

		// As another texture upload may have changed pixelStorei
		// parameters, make sure they are correct for the dstTexture
		_gl.pixelStorei( _gl.UNPACK_FLIP_Y_WEBGL, dstTexture.flipY );
		_gl.pixelStorei( _gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, dstTexture.premultiplyAlpha );
		_gl.pixelStorei( _gl.UNPACK_ALIGNMENT, dstTexture.unpackAlignment );

		if ( srcTexture.isDataTexture ) {

			_gl.texSubImage2D( _gl.TEXTURE_2D, level, position.x, position.y, width, height, glFormat, glType, srcTexture.image.data );

		} else {

			if ( srcTexture.isCompressedTexture ) {

				_gl.compressedTexSubImage2D( _gl.TEXTURE_2D, level, position.x, position.y, srcTexture.mipmaps[ 0 ].width, srcTexture.mipmaps[ 0 ].height, glFormat, srcTexture.mipmaps[ 0 ].data );

			} else {

				_gl.texSubImage2D( _gl.TEXTURE_2D, level, position.x, position.y, glFormat, glType, srcTexture.image );

			}

		}

		// Generate mipmaps only when copying level 0
		if ( level === 0 && dstTexture.generateMipmaps ) _gl.generateMipmap( _gl.TEXTURE_2D );

		state.unbindTexture();

	};

	this.copyTextureToTexture3D = function ( sourceBox, position, srcTexture, dstTexture, level = 0 ) {

		if ( _this.isWebGL1Renderer ) {

			console.warn( 'THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.' );
			return;

		}

		const width = sourceBox.max.x - sourceBox.min.x + 1;
		const height = sourceBox.max.y - sourceBox.min.y + 1;
		const depth = sourceBox.max.z - sourceBox.min.z + 1;
		const glFormat = utils.convert( dstTexture.format );
		const glType = utils.convert( dstTexture.type );
		let glTarget;

		if ( dstTexture.isDataTexture3D ) {

			textures.setTexture3D( dstTexture, 0 );
			glTarget = _gl.TEXTURE_3D;

		} else if ( dstTexture.isDataTexture2DArray ) {

			textures.setTexture2DArray( dstTexture, 0 );
			glTarget = _gl.TEXTURE_2D_ARRAY;

		} else {

			console.warn( 'THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.' );
			return;

		}

		_gl.pixelStorei( _gl.UNPACK_FLIP_Y_WEBGL, dstTexture.flipY );
		_gl.pixelStorei( _gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, dstTexture.premultiplyAlpha );
		_gl.pixelStorei( _gl.UNPACK_ALIGNMENT, dstTexture.unpackAlignment );

		const unpackRowLen = _gl.getParameter( _gl.UNPACK_ROW_LENGTH );
		const unpackImageHeight = _gl.getParameter( _gl.UNPACK_IMAGE_HEIGHT );
		const unpackSkipPixels = _gl.getParameter( _gl.UNPACK_SKIP_PIXELS );
		const unpackSkipRows = _gl.getParameter( _gl.UNPACK_SKIP_ROWS );
		const unpackSkipImages = _gl.getParameter( _gl.UNPACK_SKIP_IMAGES );

		const image = srcTexture.isCompressedTexture ? srcTexture.mipmaps[ 0 ] : srcTexture.image;

		_gl.pixelStorei( _gl.UNPACK_ROW_LENGTH, image.width );
		_gl.pixelStorei( _gl.UNPACK_IMAGE_HEIGHT, image.height );
		_gl.pixelStorei( _gl.UNPACK_SKIP_PIXELS, sourceBox.min.x );
		_gl.pixelStorei( _gl.UNPACK_SKIP_ROWS, sourceBox.min.y );
		_gl.pixelStorei( _gl.UNPACK_SKIP_IMAGES, sourceBox.min.z );

		if ( srcTexture.isDataTexture || srcTexture.isDataTexture3D ) {

			_gl.texSubImage3D( glTarget, level, position.x, position.y, position.z, width, height, depth, glFormat, glType, image.data );

		} else {

			if ( srcTexture.isCompressedTexture ) {

				console.warn( 'THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture.' );
				_gl.compressedTexSubImage3D( glTarget, level, position.x, position.y, position.z, width, height, depth, glFormat, image.data );

			} else {

				_gl.texSubImage3D( glTarget, level, position.x, position.y, position.z, width, height, depth, glFormat, glType, image );

			}

		}

		_gl.pixelStorei( _gl.UNPACK_ROW_LENGTH, unpackRowLen );
		_gl.pixelStorei( _gl.UNPACK_IMAGE_HEIGHT, unpackImageHeight );
		_gl.pixelStorei( _gl.UNPACK_SKIP_PIXELS, unpackSkipPixels );
		_gl.pixelStorei( _gl.UNPACK_SKIP_ROWS, unpackSkipRows );
		_gl.pixelStorei( _gl.UNPACK_SKIP_IMAGES, unpackSkipImages );

		// Generate mipmaps only when copying level 0
		if ( level === 0 && dstTexture.generateMipmaps ) _gl.generateMipmap( glTarget );

		state.unbindTexture();

	};

	this.initTexture = function ( texture ) {

		textures.setTexture2D( texture, 0 );

		state.unbindTexture();

	};

	this.resetState = function () {

		_currentActiveCubeFace = 0;
		_currentActiveMipmapLevel = 0;
		_currentRenderTarget = null;

		state.reset();
		bindingStates.reset();

	};

	if ( typeof __THREE_DEVTOOLS__ !== 'undefined' ) {

		__THREE_DEVTOOLS__.dispatchEvent( new CustomEvent( 'observe', { detail: this } ) ); // eslint-disable-line no-undef

	}

}

WebGLRenderer.prototype.isWebGLRenderer = true;

export { WebGLRenderer };
