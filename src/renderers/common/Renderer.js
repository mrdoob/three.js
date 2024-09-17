import Animation from './Animation.js';
import RenderObjects from './RenderObjects.js';
import Attributes from './Attributes.js';
import Geometries from './Geometries.js';
import Info from './Info.js';
import Pipelines from './Pipelines.js';
import Bindings from './Bindings.js';
import RenderLists from './RenderLists.js';
import RenderContexts from './RenderContexts.js';
import Textures from './Textures.js';
import Background from './Background.js';
import Nodes from './nodes/Nodes.js';
import Color4 from './Color4.js';
import ClippingContext from './ClippingContext.js';
import QuadMesh from './QuadMesh.js';
import RenderBundles from './RenderBundles.js';
import NodeLibrary from './nodes/NodeLibrary.js';

import NodeMaterial from '../../materials/nodes/NodeMaterial.js';

import { Scene } from '../../scenes/Scene.js';
import { Frustum } from '../../math/Frustum.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { Vector2 } from '../../math/Vector2.js';
import { Vector4 } from '../../math/Vector4.js';
import { RenderTarget } from '../../core/RenderTarget.js';
import { DoubleSide, BackSide, FrontSide, SRGBColorSpace, NoToneMapping, LinearFilter, LinearSRGBColorSpace, HalfFloatType, RGBAFormat, PCFShadowMap } from '../../constants.js';

const _scene = /*@__PURE__*/ new Scene();
const _drawingBufferSize = /*@__PURE__*/ new Vector2();
const _screen = /*@__PURE__*/ new Vector4();
const _frustum = /*@__PURE__*/ new Frustum();
const _projScreenMatrix = /*@__PURE__*/ new Matrix4();
const _vector4 = /*@__PURE__*/ new Vector4();

class Renderer {

	constructor( backend, parameters = {} ) {

		this.isRenderer = true;

		//

		const {
			logarithmicDepthBuffer = false,
			alpha = true,
			depth = true,
			stencil = false,
			antialias = false,
			samples = 0,
			getFallback = null
		} = parameters;

		// public
		this.domElement = backend.getDomElement();

		this.backend = backend;

		this.samples = samples || ( antialias === true ) ? 4 : 0;

		this.autoClear = true;
		this.autoClearColor = true;
		this.autoClearDepth = true;
		this.autoClearStencil = true;

		this.alpha = alpha;

		this.logarithmicDepthBuffer = logarithmicDepthBuffer;

		this.outputColorSpace = SRGBColorSpace;

		this.toneMapping = NoToneMapping;
		this.toneMappingExposure = 1.0;

		this.sortObjects = true;

		this.depth = depth;
		this.stencil = stencil;

		this.clippingPlanes = [];

		this.info = new Info();

		this.nodes = {
			library: new NodeLibrary(),
			modelViewMatrix: null,
			modelNormalViewMatrix: null
		};

		// internals

		this._getFallback = getFallback;

		this._pixelRatio = 1;
		this._width = this.domElement.width;
		this._height = this.domElement.height;

		this._viewport = new Vector4( 0, 0, this._width, this._height );
		this._scissor = new Vector4( 0, 0, this._width, this._height );
		this._scissorTest = false;

		this._attributes = null;
		this._geometries = null;
		this._nodes = null;
		this._animation = null;
		this._bindings = null;
		this._objects = null;
		this._pipelines = null;
		this._bundles = null;
		this._renderLists = null;
		this._renderContexts = null;
		this._textures = null;
		this._background = null;

		this._quad = new QuadMesh( new NodeMaterial() );
		this._quad.material.type = 'Renderer_output';

		this._currentRenderContext = null;

		this._opaqueSort = null;
		this._transparentSort = null;

		this._frameBufferTarget = null;

		const alphaClear = this.alpha === true ? 0 : 1;

		this._clearColor = new Color4( 0, 0, 0, alphaClear );
		this._clearDepth = 1;
		this._clearStencil = 0;

		this._renderTarget = null;
		this._activeCubeFace = 0;
		this._activeMipmapLevel = 0;

		this._mrt = null;

		this._renderObjectFunction = null;
		this._currentRenderObjectFunction = null;
		this._currentRenderBundle = null;

		this._handleObjectFunction = this._renderObjectDirect;

		this._initialized = false;
		this._initPromise = null;

		this._compilationPromises = null;

		this.transparent = true;
		this.opaque = true;

		this.shadowMap = {
			enabled: false,
			type: PCFShadowMap
		};

		this.xr = {
			enabled: false
		};

		this.debug = {
			checkShaderErrors: true,
			onShaderError: null,
			getShaderAsync: async ( scene, camera, object ) => {

				await this.compileAsync( scene, camera );

				const renderList = this._renderLists.get( scene, camera );
				const renderContext = this._renderContexts.get( scene, camera, this._renderTarget );

				const material = scene.overrideMaterial || object.material;

				const renderObject = this._objects.get( object, material, scene, camera, renderList.lightsNode, renderContext );

				const { fragmentShader, vertexShader } = renderObject.getNodeBuilderState();

				return { fragmentShader, vertexShader };

			}
		};

	}

	async init() {

		if ( this._initialized ) {

			throw new Error( 'Renderer: Backend has already been initialized.' );

		}

		if ( this._initPromise !== null ) {

			return this._initPromise;

		}

		this._initPromise = new Promise( async ( resolve, reject ) => {

			let backend = this.backend;

			try {

				await backend.init( this );

			} catch ( error ) {

				if ( this._getFallback !== null ) {

					// try the fallback

					try {

						this.backend = backend = this._getFallback( error );
						await backend.init( this );

					} catch ( error ) {

						reject( error );
						return;

					}

				} else {

					reject( error );
					return;

				}

			}

			this._nodes = new Nodes( this, backend );
			this._animation = new Animation( this._nodes, this.info );
			this._attributes = new Attributes( backend );
			this._background = new Background( this, this._nodes );
			this._geometries = new Geometries( this._attributes, this.info );
			this._textures = new Textures( this, backend, this.info );
			this._pipelines = new Pipelines( backend, this._nodes );
			this._bindings = new Bindings( backend, this._nodes, this._textures, this._attributes, this._pipelines, this.info );
			this._objects = new RenderObjects( this, this._nodes, this._geometries, this._pipelines, this._bindings, this.info );
			this._renderLists = new RenderLists();
			this._bundles = new RenderBundles();
			this._renderContexts = new RenderContexts();

			//

			this._initialized = true;

			resolve();

		} );

		return this._initPromise;

	}

	get coordinateSystem() {

		return this.backend.coordinateSystem;

	}

	async compileAsync( scene, camera, targetScene = null ) {

		if ( this._initialized === false ) await this.init();

		// preserve render tree

		const nodeFrame = this._nodes.nodeFrame;

		const previousRenderId = nodeFrame.renderId;
		const previousRenderContext = this._currentRenderContext;
		const previousRenderObjectFunction = this._currentRenderObjectFunction;
		const previousCompilationPromises = this._compilationPromises;

		//

		const sceneRef = ( scene.isScene === true ) ? scene : _scene;

		if ( targetScene === null ) targetScene = scene;

		const renderTarget = this._renderTarget;
		const renderContext = this._renderContexts.get( targetScene, camera, renderTarget );
		const activeMipmapLevel = this._activeMipmapLevel;

		const compilationPromises = [];

		this._currentRenderContext = renderContext;
		this._currentRenderObjectFunction = this.renderObject;

		this._handleObjectFunction = this._createObjectPipeline;

		this._compilationPromises = compilationPromises;

		nodeFrame.renderId ++;

		//

		nodeFrame.update();

		//

		renderContext.depth = this.depth;
		renderContext.stencil = this.stencil;

		if ( ! renderContext.clippingContext ) renderContext.clippingContext = new ClippingContext();
		renderContext.clippingContext.updateGlobal( this, camera );

		//

		sceneRef.onBeforeRender( this, scene, camera, renderTarget );

		//

		const renderList = this._renderLists.get( scene, camera );
		renderList.begin();

		this._projectObject( scene, camera, 0, renderList );

		// include lights from target scene
		if ( targetScene !== scene ) {

			targetScene.traverseVisible( function ( object ) {

				if ( object.isLight && object.layers.test( camera.layers ) ) {

					renderList.pushLight( object );

				}

			} );

		}

		renderList.finish();

		//

		if ( renderTarget !== null ) {

			this._textures.updateRenderTarget( renderTarget, activeMipmapLevel );

			const renderTargetData = this._textures.get( renderTarget );

			renderContext.textures = renderTargetData.textures;
			renderContext.depthTexture = renderTargetData.depthTexture;

		} else {

			renderContext.textures = null;
			renderContext.depthTexture = null;

		}

		//

		this._nodes.updateScene( sceneRef );

		//

		this._background.update( sceneRef, renderList, renderContext );

		// process render lists

		const opaqueObjects = renderList.opaque;
		const transparentObjects = renderList.transparent;
		const lightsNode = renderList.lightsNode;

		if ( this.opaque === true && opaqueObjects.length > 0 ) this._renderObjects( opaqueObjects, camera, sceneRef, lightsNode );
		if ( this.transparent === true && transparentObjects.length > 0 ) this._renderObjects( transparentObjects, camera, sceneRef, lightsNode );

		// restore render tree

		nodeFrame.renderId = previousRenderId;

		this._currentRenderContext = previousRenderContext;
		this._currentRenderObjectFunction = previousRenderObjectFunction;
		this._compilationPromises = previousCompilationPromises;

		this._handleObjectFunction = this._renderObjectDirect;

		// wait for all promises setup by backends awaiting compilation/linking/pipeline creation to complete

		await Promise.all( compilationPromises );

	}

	async renderAsync( scene, camera ) {

		if ( this._initialized === false ) await this.init();

		const renderContext = this._renderScene( scene, camera );

		await this.backend.resolveTimestampAsync( renderContext, 'render' );

	}

	setMRT( mrt ) {

		this._mrt = mrt;

		return this;

	}

	getMRT() {

		return this._mrt;

	}

	_renderBundle( bundle, sceneRef, lightsNode ) {

		const { bundleGroup, camera, renderList } = bundle;

		const renderContext = this._currentRenderContext;

		//

		const renderBundle = this._bundles.get( bundleGroup, camera );
		const renderBundleData = this.backend.get( renderBundle );

		if ( renderBundleData.renderContexts === undefined ) renderBundleData.renderContexts = new Set();

		//

		const needsUpdate = bundleGroup.version !== renderBundleData.version;
		const renderBundleNeedsUpdate = renderBundleData.renderContexts.has( renderContext ) === false || needsUpdate;

		renderBundleData.renderContexts.add( renderContext );

		if ( renderBundleNeedsUpdate ) {

			this.backend.beginBundle( renderContext );

			if ( renderBundleData.renderObjects === undefined || needsUpdate ) {

				renderBundleData.renderObjects = [];

			}

			this._currentRenderBundle = renderBundle;

			const opaqueObjects = renderList.opaque;

			if ( opaqueObjects.length > 0 ) this._renderObjects( opaqueObjects, camera, sceneRef, lightsNode );

			this._currentRenderBundle = null;

			//

			this.backend.finishBundle( renderContext, renderBundle );

			renderBundleData.version = bundleGroup.version;

		} else {

			const { renderObjects } = renderBundleData;

			for ( let i = 0, l = renderObjects.length; i < l; i ++ ) {

				const renderObject = renderObjects[ i ];

				if ( this._nodes.needsRefresh( renderObject ) ) {

					this._nodes.updateBefore( renderObject );

					this._nodes.updateForRender( renderObject );
					this._bindings.updateForRender( renderObject );

					this._nodes.updateAfter( renderObject );

				}

			}

		}

		this.backend.addBundle( renderContext, renderBundle );

	}

	render( scene, camera ) {

		if ( this._initialized === false ) {

			console.warn( 'THREE.Renderer: .render() called before the backend is initialized. Try using .renderAsync() instead.' );

			return this.renderAsync( scene, camera );

		}

		this._renderScene( scene, camera );

	}

	_getFrameBufferTarget() {

		const { currentToneMapping, currentColorSpace } = this;

		const useToneMapping = currentToneMapping !== NoToneMapping;
		const useColorSpace = currentColorSpace !== LinearSRGBColorSpace;

		if ( useToneMapping === false && useColorSpace === false ) return null;

		const { width, height } = this.getDrawingBufferSize( _drawingBufferSize );
		const { depth, stencil } = this;

		let frameBufferTarget = this._frameBufferTarget;

		if ( frameBufferTarget === null ) {

			frameBufferTarget = new RenderTarget( width, height, {
				depthBuffer: depth,
				stencilBuffer: stencil,
				type: HalfFloatType, // FloatType
				format: RGBAFormat,
				colorSpace: LinearSRGBColorSpace,
				generateMipmaps: false,
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				samples: this.samples
			} );

			frameBufferTarget.isPostProcessingRenderTarget = true;

			this._frameBufferTarget = frameBufferTarget;

		}

		frameBufferTarget.depthBuffer = depth;
		frameBufferTarget.stencilBuffer = stencil;
		frameBufferTarget.setSize( width, height );
		frameBufferTarget.viewport.copy( this._viewport );
		frameBufferTarget.scissor.copy( this._scissor );
		frameBufferTarget.viewport.multiplyScalar( this._pixelRatio );
		frameBufferTarget.scissor.multiplyScalar( this._pixelRatio );
		frameBufferTarget.scissorTest = this._scissorTest;

		return frameBufferTarget;

	}

	_renderScene( scene, camera, useFrameBufferTarget = true ) {

		const frameBufferTarget = useFrameBufferTarget ? this._getFrameBufferTarget() : null;

		// preserve render tree

		const nodeFrame = this._nodes.nodeFrame;

		const previousRenderId = nodeFrame.renderId;
		const previousRenderContext = this._currentRenderContext;
		const previousRenderObjectFunction = this._currentRenderObjectFunction;

		//

		const sceneRef = ( scene.isScene === true ) ? scene : _scene;

		const outputRenderTarget = this._renderTarget;

		const activeCubeFace = this._activeCubeFace;
		const activeMipmapLevel = this._activeMipmapLevel;

		//

		let renderTarget;

		if ( frameBufferTarget !== null ) {

			renderTarget = frameBufferTarget;

			this.setRenderTarget( renderTarget );

		} else {

			renderTarget = outputRenderTarget;

		}

		//

		const renderContext = this._renderContexts.get( scene, camera, renderTarget );

		this._currentRenderContext = renderContext;
		this._currentRenderObjectFunction = this._renderObjectFunction || this.renderObject;

		//

		this.info.calls ++;
		this.info.render.calls ++;
		this.info.render.frameCalls ++;

		nodeFrame.renderId = this.info.calls;

		//

		const coordinateSystem = this.coordinateSystem;

		if ( camera.coordinateSystem !== coordinateSystem ) {

			camera.coordinateSystem = coordinateSystem;

			camera.updateProjectionMatrix();

		}

		//

		if ( scene.matrixWorldAutoUpdate === true ) scene.updateMatrixWorld();

		if ( camera.parent === null && camera.matrixWorldAutoUpdate === true ) camera.updateMatrixWorld();

		//

		let viewport = this._viewport;
		let scissor = this._scissor;
		let pixelRatio = this._pixelRatio;

		if ( renderTarget !== null ) {

			viewport = renderTarget.viewport;
			scissor = renderTarget.scissor;
			pixelRatio = 1;

		}

		this.getDrawingBufferSize( _drawingBufferSize );

		_screen.set( 0, 0, _drawingBufferSize.width, _drawingBufferSize.height );

		const minDepth = ( viewport.minDepth === undefined ) ? 0 : viewport.minDepth;
		const maxDepth = ( viewport.maxDepth === undefined ) ? 1 : viewport.maxDepth;

		renderContext.viewportValue.copy( viewport ).multiplyScalar( pixelRatio ).floor();
		renderContext.viewportValue.width >>= activeMipmapLevel;
		renderContext.viewportValue.height >>= activeMipmapLevel;
		renderContext.viewportValue.minDepth = minDepth;
		renderContext.viewportValue.maxDepth = maxDepth;
		renderContext.viewport = renderContext.viewportValue.equals( _screen ) === false;

		renderContext.scissorValue.copy( scissor ).multiplyScalar( pixelRatio ).floor();
		renderContext.scissor = this._scissorTest && renderContext.scissorValue.equals( _screen ) === false;
		renderContext.scissorValue.width >>= activeMipmapLevel;
		renderContext.scissorValue.height >>= activeMipmapLevel;

		if ( ! renderContext.clippingContext ) renderContext.clippingContext = new ClippingContext();
		renderContext.clippingContext.updateGlobal( this, camera );

		//

		sceneRef.onBeforeRender( this, scene, camera, renderTarget );

		//

		_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		_frustum.setFromProjectionMatrix( _projScreenMatrix, coordinateSystem );

		const renderList = this._renderLists.get( scene, camera );
		renderList.begin();

		this._projectObject( scene, camera, 0, renderList );

		renderList.finish();

		if ( this.sortObjects === true ) {

			renderList.sort( this._opaqueSort, this._transparentSort );

		}

		//

		if ( renderTarget !== null ) {

			this._textures.updateRenderTarget( renderTarget, activeMipmapLevel );

			const renderTargetData = this._textures.get( renderTarget );

			renderContext.textures = renderTargetData.textures;
			renderContext.depthTexture = renderTargetData.depthTexture;
			renderContext.width = renderTargetData.width;
			renderContext.height = renderTargetData.height;
			renderContext.renderTarget = renderTarget;
			renderContext.depth = renderTarget.depthBuffer;
			renderContext.stencil = renderTarget.stencilBuffer;

		} else {

			renderContext.textures = null;
			renderContext.depthTexture = null;
			renderContext.width = this.domElement.width;
			renderContext.height = this.domElement.height;
			renderContext.depth = this.depth;
			renderContext.stencil = this.stencil;

		}

		renderContext.width >>= activeMipmapLevel;
		renderContext.height >>= activeMipmapLevel;
		renderContext.activeCubeFace = activeCubeFace;
		renderContext.activeMipmapLevel = activeMipmapLevel;
		renderContext.occlusionQueryCount = renderList.occlusionQueryCount;

		//

		this._nodes.updateScene( sceneRef );

		//

		this._background.update( sceneRef, renderList, renderContext );

		//

		this.backend.beginRender( renderContext );

		// process render lists

		const {
			bundles,
			lightsNode,
			transparent: transparentObjects,
			opaque: opaqueObjects
		} = renderList;

		if ( bundles.length > 0 ) this._renderBundles( bundles, sceneRef, lightsNode );
		if ( this.opaque === true && opaqueObjects.length > 0 ) this._renderObjects( opaqueObjects, camera, sceneRef, lightsNode );
		if ( this.transparent === true && transparentObjects.length > 0 ) this._renderObjects( transparentObjects, camera, sceneRef, lightsNode );

		// finish render pass

		this.backend.finishRender( renderContext );

		// restore render tree

		nodeFrame.renderId = previousRenderId;

		this._currentRenderContext = previousRenderContext;
		this._currentRenderObjectFunction = previousRenderObjectFunction;

		//

		if ( frameBufferTarget !== null ) {

			this.setRenderTarget( outputRenderTarget, activeCubeFace, activeMipmapLevel );

			const quad = this._quad;

			if ( this._nodes.hasOutputChange( renderTarget.texture ) ) {

				quad.material.fragmentNode = this._nodes.getOutputNode( renderTarget.texture );
				quad.material.needsUpdate = true;

			}

			this._renderScene( quad, quad.camera, false );

		}

		//

		sceneRef.onAfterRender( this, scene, camera, renderTarget );

		//

		return renderContext;

	}

	getMaxAnisotropy() {

		return this.backend.getMaxAnisotropy();

	}

	getActiveCubeFace() {

		return this._activeCubeFace;

	}

	getActiveMipmapLevel() {

		return this._activeMipmapLevel;

	}

	async setAnimationLoop( callback ) {

		if ( this._initialized === false ) await this.init();

		this._animation.setAnimationLoop( callback );

	}

	async getArrayBufferAsync( attribute ) {

		return await this.backend.getArrayBufferAsync( attribute );

	}

	getContext() {

		return this.backend.getContext();

	}

	getPixelRatio() {

		return this._pixelRatio;

	}

	getDrawingBufferSize( target ) {

		return target.set( this._width * this._pixelRatio, this._height * this._pixelRatio ).floor();

	}

	getSize( target ) {

		return target.set( this._width, this._height );

	}

	setPixelRatio( value = 1 ) {

		this._pixelRatio = value;

		this.setSize( this._width, this._height, false );

	}

	setDrawingBufferSize( width, height, pixelRatio ) {

		this._width = width;
		this._height = height;

		this._pixelRatio = pixelRatio;

		this.domElement.width = Math.floor( width * pixelRatio );
		this.domElement.height = Math.floor( height * pixelRatio );

		this.setViewport( 0, 0, width, height );

		if ( this._initialized ) this.backend.updateSize();

	}

	setSize( width, height, updateStyle = true ) {

		this._width = width;
		this._height = height;

		this.domElement.width = Math.floor( width * this._pixelRatio );
		this.domElement.height = Math.floor( height * this._pixelRatio );

		if ( updateStyle === true ) {

			this.domElement.style.width = width + 'px';
			this.domElement.style.height = height + 'px';

		}

		this.setViewport( 0, 0, width, height );

		if ( this._initialized ) this.backend.updateSize();

	}

	setOpaqueSort( method ) {

		this._opaqueSort = method;

	}

	setTransparentSort( method ) {

		this._transparentSort = method;

	}

	getScissor( target ) {

		const scissor = this._scissor;

		target.x = scissor.x;
		target.y = scissor.y;
		target.width = scissor.width;
		target.height = scissor.height;

		return target;

	}

	setScissor( x, y, width, height ) {

		const scissor = this._scissor;

		if ( x.isVector4 ) {

			scissor.copy( x );

		} else {

			scissor.set( x, y, width, height );

		}

	}

	getScissorTest() {

		return this._scissorTest;

	}

	setScissorTest( boolean ) {

		this._scissorTest = boolean;

		this.backend.setScissorTest( boolean );

	}

	getViewport( target ) {

		return target.copy( this._viewport );

	}

	setViewport( x, y, width, height, minDepth = 0, maxDepth = 1 ) {

		const viewport = this._viewport;

		if ( x.isVector4 ) {

			viewport.copy( x );

		} else {

			viewport.set( x, y, width, height );

		}

		viewport.minDepth = minDepth;
		viewport.maxDepth = maxDepth;

	}

	getClearColor( target ) {

		return target.copy( this._clearColor );

	}

	setClearColor( color, alpha = 1 ) {

		this._clearColor.set( color );
		this._clearColor.a = alpha;

	}

	getClearAlpha() {

		return this._clearColor.a;

	}

	setClearAlpha( alpha ) {

		this._clearColor.a = alpha;

	}

	getClearDepth() {

		return this._clearDepth;

	}

	setClearDepth( depth ) {

		this._clearDepth = depth;

	}

	getClearStencil() {

		return this._clearStencil;

	}

	setClearStencil( stencil ) {

		this._clearStencil = stencil;

	}

	isOccluded( object ) {

		const renderContext = this._currentRenderContext;

		return renderContext && this.backend.isOccluded( renderContext, object );

	}

	clear( color = true, depth = true, stencil = true ) {

		if ( this._initialized === false ) {

			console.warn( 'THREE.Renderer: .clear() called before the backend is initialized. Try using .clearAsync() instead.' );

			return this.clearAsync( color, depth, stencil );

		}

		const renderTarget = this._renderTarget || this._getFrameBufferTarget();

		let renderTargetData = null;

		if ( renderTarget !== null ) {

			this._textures.updateRenderTarget( renderTarget );

			renderTargetData = this._textures.get( renderTarget );

		}

		this.backend.clear( color, depth, stencil, renderTargetData );

		if ( renderTarget !== null && this._renderTarget === null ) {

			// If a color space transform or tone mapping is required,
			// the clear operation clears the intermediate renderTarget texture, but does not update the screen canvas.

			const quad = this._quad;

			if ( this._nodes.hasOutputChange( renderTarget.texture ) ) {

				quad.material.fragmentNode = this._nodes.getOutputNode( renderTarget.texture );
				quad.material.needsUpdate = true;

			}

			this._renderScene( quad, quad.camera, false );

		}

	}

	clearColor() {

		return this.clear( true, false, false );

	}

	clearDepth() {

		return this.clear( false, true, false );

	}

	clearStencil() {

		return this.clear( false, false, true );

	}

	async clearAsync( color = true, depth = true, stencil = true ) {

		if ( this._initialized === false ) await this.init();

		this.clear( color, depth, stencil );

	}

	clearColorAsync() {

		return this.clearAsync( true, false, false );

	}

	clearDepthAsync() {

		return this.clearAsync( false, true, false );

	}

	clearStencilAsync() {

		return this.clearAsync( false, false, true );

	}

	get currentToneMapping() {

		return this._renderTarget !== null ? NoToneMapping : this.toneMapping;

	}

	get currentColorSpace() {

		return this._renderTarget !== null ? LinearSRGBColorSpace : this.outputColorSpace;

	}

	dispose() {

		this.info.dispose();

		this._animation.dispose();
		this._objects.dispose();
		this._pipelines.dispose();
		this._nodes.dispose();
		this._bindings.dispose();
		this._renderLists.dispose();
		this._renderContexts.dispose();
		this._textures.dispose();

		this.setRenderTarget( null );
		this.setAnimationLoop( null );

	}

	setRenderTarget( renderTarget, activeCubeFace = 0, activeMipmapLevel = 0 ) {

		this._renderTarget = renderTarget;
		this._activeCubeFace = activeCubeFace;
		this._activeMipmapLevel = activeMipmapLevel;

	}

	getRenderTarget() {

		return this._renderTarget;

	}

	setRenderObjectFunction( renderObjectFunction ) {

		this._renderObjectFunction = renderObjectFunction;

	}

	getRenderObjectFunction() {

		return this._renderObjectFunction;

	}

	async computeAsync( computeNodes ) {

		if ( this._initialized === false ) await this.init();

		const nodeFrame = this._nodes.nodeFrame;

		const previousRenderId = nodeFrame.renderId;

		//

		this.info.calls ++;
		this.info.compute.calls ++;
		this.info.compute.frameCalls ++;

		nodeFrame.renderId = this.info.calls;

		//

		const backend = this.backend;
		const pipelines = this._pipelines;
		const bindings = this._bindings;
		const nodes = this._nodes;

		const computeList = Array.isArray( computeNodes ) ? computeNodes : [ computeNodes ];

		if ( computeList[ 0 ] === undefined || computeList[ 0 ].isComputeNode !== true ) {

			throw new Error( 'THREE.Renderer: .compute() expects a ComputeNode.' );

		}

		backend.beginCompute( computeNodes );

		for ( const computeNode of computeList ) {

			// onInit

			if ( pipelines.has( computeNode ) === false ) {

				const dispose = () => {

					computeNode.removeEventListener( 'dispose', dispose );

					pipelines.delete( computeNode );
					bindings.delete( computeNode );
					nodes.delete( computeNode );

				};

				computeNode.addEventListener( 'dispose', dispose );

				//

				computeNode.onInit( { renderer: this } );

			}

			nodes.updateForCompute( computeNode );
			bindings.updateForCompute( computeNode );

			const computeBindings = bindings.getForCompute( computeNode );
			const computePipeline = pipelines.getForCompute( computeNode, computeBindings );

			backend.compute( computeNodes, computeNode, computeBindings, computePipeline );

		}

		backend.finishCompute( computeNodes );

		await this.backend.resolveTimestampAsync( computeNodes, 'compute' );

		//

		nodeFrame.renderId = previousRenderId;

	}

	async hasFeatureAsync( name ) {

		if ( this._initialized === false ) await this.init();

		return this.backend.hasFeature( name );

	}

	hasFeature( name ) {

		if ( this._initialized === false ) {

			console.warn( 'THREE.Renderer: .hasFeature() called before the backend is initialized. Try using .hasFeatureAsync() instead.' );

			return false;

		}

		return this.backend.hasFeature( name );

	}

	copyFramebufferToTexture( framebufferTexture, rectangle = null ) {

		const renderContext = this._currentRenderContext;

		this._textures.updateTexture( framebufferTexture );

		rectangle = rectangle === null ? _vector4.set( 0, 0, framebufferTexture.image.width, framebufferTexture.image.height ) : rectangle;

		this.backend.copyFramebufferToTexture( framebufferTexture, renderContext, rectangle );

	}

	copyTextureToTexture( srcTexture, dstTexture, srcRegion = null, dstPosition = null, level = 0 ) {

		this._textures.updateTexture( srcTexture );
		this._textures.updateTexture( dstTexture );

		this.backend.copyTextureToTexture( srcTexture, dstTexture, srcRegion, dstPosition, level );

	}


	readRenderTargetPixelsAsync( renderTarget, x, y, width, height, index = 0, faceIndex = 0 ) {

		return this.backend.copyTextureToBuffer( renderTarget.textures[ index ], x, y, width, height, faceIndex );

	}

	_projectObject( object, camera, groupOrder, renderList ) {

		if ( object.visible === false ) return;

		const visible = object.layers.test( camera.layers );

		if ( visible ) {

			if ( object.isGroup ) {

				groupOrder = object.renderOrder;

			} else if ( object.isLOD ) {

				if ( object.autoUpdate === true ) object.update( camera );

			} else if ( object.isLight ) {

				renderList.pushLight( object );

			} else if ( object.isSprite ) {

				if ( ! object.frustumCulled || _frustum.intersectsSprite( object ) ) {

					if ( this.sortObjects === true ) {

						_vector4.setFromMatrixPosition( object.matrixWorld ).applyMatrix4( _projScreenMatrix );

					}

					const { geometry, material } = object;

					if ( material.visible ) {

						renderList.push( object, geometry, material, groupOrder, _vector4.z, null );

					}

				}

			} else if ( object.isLineLoop ) {

				console.error( 'THREE.Renderer: Objects of type THREE.LineLoop are not supported. Please use THREE.Line or THREE.LineSegments.' );

			} else if ( object.isMesh || object.isLine || object.isPoints ) {

				if ( ! object.frustumCulled || _frustum.intersectsObject( object ) ) {

					const { geometry, material } = object;

					if ( this.sortObjects === true ) {

						if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

						_vector4
							.copy( geometry.boundingSphere.center )
							.applyMatrix4( object.matrixWorld )
							.applyMatrix4( _projScreenMatrix );

					}

					if ( Array.isArray( material ) ) {

						const groups = geometry.groups;

						for ( let i = 0, l = groups.length; i < l; i ++ ) {

							const group = groups[ i ];
							const groupMaterial = material[ group.materialIndex ];

							if ( groupMaterial && groupMaterial.visible ) {

								renderList.push( object, geometry, groupMaterial, groupOrder, _vector4.z, group );

							}

						}

					} else if ( material.visible ) {

						renderList.push( object, geometry, material, groupOrder, _vector4.z, null );

					}

				}

			}

		}

		if ( object.isBundleGroup === true && this.backend.beginBundle !== undefined ) {

			const baseRenderList = renderList;

			// replace render list
			renderList = this._renderLists.get( object, camera );

			renderList.begin();

			baseRenderList.pushBundle( {
				bundleGroup: object,
				camera,
				renderList,
			} );

			renderList.finish();

		}

		const children = object.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			this._projectObject( children[ i ], camera, groupOrder, renderList );

		}

	}

	_renderBundles( bundles, sceneRef, lightsNode ) {

		for ( const bundle of bundles ) {

			this._renderBundle( bundle, sceneRef, lightsNode );

		}

	}

	_renderObjects( renderList, camera, scene, lightsNode ) {

		// process renderable objects

		for ( let i = 0, il = renderList.length; i < il; i ++ ) {

			const renderItem = renderList[ i ];

			// @TODO: Add support for multiple materials per object. This will require to extract
			// the material from the renderItem object and pass it with its group data to renderObject().

			const { object, geometry, material, group } = renderItem;

			if ( camera.isArrayCamera ) {

				const cameras = camera.cameras;

				for ( let j = 0, jl = cameras.length; j < jl; j ++ ) {

					const camera2 = cameras[ j ];

					if ( object.layers.test( camera2.layers ) ) {

						const vp = camera2.viewport;
						const minDepth = ( vp.minDepth === undefined ) ? 0 : vp.minDepth;
						const maxDepth = ( vp.maxDepth === undefined ) ? 1 : vp.maxDepth;

						const viewportValue = this._currentRenderContext.viewportValue;
						viewportValue.copy( vp ).multiplyScalar( this._pixelRatio ).floor();
						viewportValue.minDepth = minDepth;
						viewportValue.maxDepth = maxDepth;

						this.backend.updateViewport( this._currentRenderContext );

						this._currentRenderObjectFunction( object, scene, camera2, geometry, material, group, lightsNode );

					}

				}

			} else {

				this._currentRenderObjectFunction( object, scene, camera, geometry, material, group, lightsNode );

			}

		}

	}

	renderObject( object, scene, camera, geometry, material, group, lightsNode ) {

		let overridePositionNode;
		let overrideFragmentNode;
		let overrideDepthNode;

		//

		object.onBeforeRender( this, scene, camera, geometry, material, group );

		//

		if ( scene.overrideMaterial !== null ) {

			const overrideMaterial = scene.overrideMaterial;

			if ( material.positionNode && material.positionNode.isNode ) {

				overridePositionNode = overrideMaterial.positionNode;
				overrideMaterial.positionNode = material.positionNode;

			}

			if ( overrideMaterial.isShadowNodeMaterial ) {

				overrideMaterial.side = material.shadowSide === null ? material.side : material.shadowSide;

				if ( material.depthNode && material.depthNode.isNode ) {

					overrideDepthNode = overrideMaterial.depthNode;
					overrideMaterial.depthNode = material.depthNode;

				}


				if ( material.shadowNode && material.shadowNode.isNode ) {

					overrideFragmentNode = overrideMaterial.fragmentNode;
					overrideMaterial.fragmentNode = material.shadowNode;

				}

				if ( this.localClippingEnabled ) {

					if ( material.clipShadows ) {

						if ( overrideMaterial.clippingPlanes !== material.clippingPlanes ) {

							overrideMaterial.clippingPlanes = material.clippingPlanes;
							overrideMaterial.needsUpdate = true;

						}

						if ( overrideMaterial.clipIntersection !== material.clipIntersection ) {

							overrideMaterial.clipIntersection = material.clipIntersection;

						}

					} else if ( Array.isArray( overrideMaterial.clippingPlanes ) ) {

						overrideMaterial.clippingPlanes = null;
						overrideMaterial.needsUpdate = true;

					}

				}

			}

			material = overrideMaterial;

		}

		//

		if ( material.transparent === true && material.side === DoubleSide && material.forceSinglePass === false ) {

			material.side = BackSide;
			this._handleObjectFunction( object, material, scene, camera, lightsNode, group, 'backSide' ); // create backSide pass id

			material.side = FrontSide;
			this._handleObjectFunction( object, material, scene, camera, lightsNode, group ); // use default pass id

			material.side = DoubleSide;

		} else {

			this._handleObjectFunction( object, material, scene, camera, lightsNode, group );

		}

		//

		if ( overridePositionNode !== undefined ) {

			scene.overrideMaterial.positionNode = overridePositionNode;

		}

		if ( overrideDepthNode !== undefined ) {

			scene.overrideMaterial.depthNode = overrideDepthNode;

		}

		if ( overrideFragmentNode !== undefined ) {

			scene.overrideMaterial.fragmentNode = overrideFragmentNode;

		}

		//

		object.onAfterRender( this, scene, camera, geometry, material, group );

	}

	_renderObjectDirect( object, material, scene, camera, lightsNode, group, passId ) {

		const renderObject = this._objects.get( object, material, scene, camera, lightsNode, this._currentRenderContext, passId );
		renderObject.drawRange = object.geometry.drawRange;
		renderObject.group = group;

		//

		const needsRefresh = this._nodes.needsRefresh( renderObject );

		if ( needsRefresh ) {

			this._nodes.updateBefore( renderObject );

			this._geometries.updateForRender( renderObject );

			this._nodes.updateForRender( renderObject );
			this._bindings.updateForRender( renderObject );

		}

		this._pipelines.updateForRender( renderObject );

		//

		if ( this._currentRenderBundle !== null ) {

			const renderBundleData = this.backend.get( this._currentRenderBundle );

			renderBundleData.renderObjects.push( renderObject );

			renderObject.bundle = this._currentRenderBundle.scene;

		}

		this.backend.draw( renderObject, this.info );

		if ( needsRefresh ) this._nodes.updateAfter( renderObject );

	}

	_createObjectPipeline( object, material, scene, camera, lightsNode, passId ) {

		const renderObject = this._objects.get( object, material, scene, camera, lightsNode, this._currentRenderContext, passId );

		//

		this._nodes.updateBefore( renderObject );

		this._geometries.updateForRender( renderObject );

		this._nodes.updateForRender( renderObject );
		this._bindings.updateForRender( renderObject );

		this._pipelines.getForRender( renderObject, this._compilationPromises );

		this._nodes.updateAfter( renderObject );

	}

	get compute() {

		return this.computeAsync;

	}

	get compile() {

		return this.compileAsync;

	}

}

export default Renderer;
