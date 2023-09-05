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
import { Scene, Frustum, Matrix4, Vector2, Vector3, Vector4, Color, DoubleSide, BackSide, FrontSide, SRGBColorSpace, NoToneMapping } from 'three';

const _scene = new Scene();
const _drawingBufferSize = new Vector2();
const _screen = new Vector4();
const _frustum = new Frustum();
const _projScreenMatrix = new Matrix4();
const _vector3 = new Vector3();

class Renderer {

	constructor( backend ) {

		this.isRenderer = true;

		// public

		this.domElement = backend.getDomElement();

		this.backend = backend;

		this.autoClear = true;
		this.autoClearColor = true;
		this.autoClearDepth = true;
		this.autoClearStencil = true;

		this.outputColorSpace = SRGBColorSpace;

		this.toneMapping = NoToneMapping;
		this.toneMappingExposure = 1.0;

		this.sortObjects = true;

		this.depth = true;
		this.stencil = true;

		// internals

		this._pixelRatio = 1;
		this._width = this.domElement.width;
		this._height = this.domElement.height;

		this._viewport = new Vector4( 0, 0, this._width, this._height );
		this._scissor = new Vector4( 0, 0, this._width, this._height );
		this._scissorTest = false;

		this._info = null;
		this._properties = null;
		this._attributes = null;
		this._geometries = null;
		this._nodes = null;
		this._bindings = null;
		this._objects = null;
		this._pipelines = null;
		this._renderLists = null;
		this._renderContexts = null;
		this._textures = null;
		this._background = null;

		this._animation = new Animation();

		this._currentRenderContext = null;
		this._lastRenderContext = null;

		this._opaqueSort = null;
		this._transparentSort = null;

		this._clearAlpha = 1;
		this._clearColor = new Color( 0x000000 );
		this._clearDepth = 1;
		this._clearStencil = 0;

		this._renderTarget = null;
		this._currentActiveCubeFace = 0;

		this._initialized = false;
		this._initPromise = null;

		// backwards compatibility

		this.shadowMap = {
			enabled: false,
			type: null
		};

		this.xr = {
			enabled: false
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

			const backend = this.backend;

			try {

				await backend.init( this );

			} catch ( error ) {

				reject( error );
				return;

			}

			this._info = new Info();
			this._nodes = new Nodes( this, backend );
			this._attributes = new Attributes( backend );
			this._background = new Background( this, this._nodes );
			this._geometries = new Geometries( this._attributes, this._info );
			this._textures = new Textures( backend, this._info );
			this._pipelines = new Pipelines( backend, this._nodes );
			this._bindings = new Bindings( backend, this._nodes, this._textures, this._attributes, this._pipelines, this._info );
			this._objects = new RenderObjects( this, this._nodes, this._geometries, this._pipelines, this._bindings, this._info );
			this._renderLists = new RenderLists();
			this._renderContexts = new RenderContexts();

			//

			this._animation.setNodes( this._nodes );
			this._animation.start();

			this._initialized = true;

			resolve();

		} );

		return this._initPromise;

	}

	get coordinateSystem() {

		return this.backend.coordinateSystem;

	}

	async compile( /*scene, camera*/ ) {

		console.warn( 'THREE.Renderer: .compile() is not implemented yet.' );

	}

	async render( scene, camera ) {

		if ( this._initialized === false ) await this.init();

		// preserve render tree

		const nodeFrame = this._nodes.nodeFrame;

		const previousRenderId = nodeFrame.renderId;
		const previousRenderState = this._currentRenderContext;

		//

		const sceneRef = ( scene.isScene === true ) ? scene : _scene;

		const renderTarget = this._renderTarget;
		const renderContext = this._renderContexts.get( scene, camera, renderTarget );
		const activeCubeFace = this._activeCubeFace;

		this._currentRenderContext = renderContext;

		nodeFrame.renderId ++;

		//

		const coordinateSystem = this.coordinateSystem;

		if ( camera.coordinateSystem !== coordinateSystem ) {

			camera.coordinateSystem = coordinateSystem;

			camera.updateProjectionMatrix();

		}

		//

		if ( this._animation.isAnimating === false ) nodeFrame.update();

		if ( scene.matrixWorldAutoUpdate === true ) scene.updateMatrixWorld();

		if ( camera.parent === null && camera.matrixWorldAutoUpdate === true ) camera.updateMatrixWorld();

		if ( this._info.autoReset === true ) this._info.reset();

		this._info.render.frame ++;

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
		renderContext.viewportValue.minDepth = minDepth;
		renderContext.viewportValue.maxDepth = maxDepth;
		renderContext.viewport = renderContext.viewportValue.equals( _screen ) === false;

		renderContext.scissorValue.copy( scissor ).multiplyScalar( pixelRatio ).floor();
		renderContext.scissor = this._scissorTest && renderContext.scissorValue.equals( _screen ) === false;

		renderContext.depth = this.depth;
		renderContext.stencil = this.stencil;

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

			this._textures.updateRenderTarget( renderTarget );

			const renderTargetData = this._textures.get( renderTarget );

			renderContext.textures = renderTargetData.textures;
			renderContext.depthTexture = renderTargetData.depthTexture;

		} else {

			renderContext.textures = null;
			renderContext.depthTexture = null;

		}

		renderContext.activeCubeFace = activeCubeFace;
		renderContext.occlusionQueryCount = renderList.occlusionQueryCount;

		//

		this._nodes.updateScene( sceneRef );

		//

		this._background.update( sceneRef, renderList, renderContext );

		//

		this.backend.beginRender( renderContext );

		// process render lists

		const opaqueObjects = renderList.opaque;
		const transparentObjects = renderList.transparent;
		const lightsNode = renderList.lightsNode;

		if ( opaqueObjects.length > 0 ) this._renderObjects( opaqueObjects, camera, sceneRef, lightsNode );
		if ( transparentObjects.length > 0 ) this._renderObjects( transparentObjects, camera, sceneRef, lightsNode );

		// finish render pass

		this.backend.finishRender( renderContext );

		// restore render tree

		nodeFrame.renderId = previousRenderId;
		this._currentRenderContext = previousRenderState;

		this._lastRenderContext = renderContext;

		//

		sceneRef.onAfterRender( this, scene, camera, renderTarget );

	}

	setAnimationLoop( callback ) {

		if ( this._initialized === false ) this.init();

		const animation = this._animation;

		animation.setAnimationLoop( callback );

		( callback === null ) ? animation.stop() : animation.start();

	}

	getArrayBuffer( attribute ) { // @deprecated, r155

		console.warn( 'THREE.Renderer: getArrayBuffer() is deprecated. Use getArrayBufferAsync() instead.' );

		return this.getArrayBufferAsync( attribute );

	}

	async getArrayBufferAsync( attribute ) {

		return await this.backend.getArrayBufferAsync( attribute );

	}

	getContext() {

		return this._context;

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
		this._clearAlpha = alpha;

	}

	getClearAlpha() {

		return this._clearAlpha;

	}

	setClearAlpha( alpha ) {

		this._clearAlpha = alpha;

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

		const renderContext = this._currentRenderContext || this._lastRenderContext;

		return renderContext && this.backend.isOccluded( renderContext, object );

	}

	clear( color = true, depth = true, stencil = true ) {

		const renderContext = this._currentRenderContext || this._lastRenderContext;

		if ( renderContext ) this.backend.clear( renderContext, color, depth, stencil );

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

	dispose() {

		this._objects.dispose();
		this._properties.dispose();
		this._pipelines.dispose();
		this._nodes.dispose();
		this._bindings.dispose();
		this._info.dispose();
		this._renderLists.dispose();
		this._renderContexts.dispose();
		this._textures.dispose();

		this.setRenderTarget( null );
		this.setAnimationLoop( null );

	}

	setRenderTarget( renderTarget, activeCubeFace = 0 ) {

		this._renderTarget = renderTarget;
		this._activeCubeFace = activeCubeFace;

	}

	getRenderTarget() {

		return this._renderTarget;

	}

	async compute( computeNodes ) {

		if ( this._initialized === false ) await this.init();

		const backend = this.backend;
		const pipelines = this._pipelines;
		const bindings = this._bindings;
		const nodes = this._nodes;
		const computeList = Array.isArray( computeNodes ) ? computeNodes : [ computeNodes ];

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

	}

	hasFeature( name ) {

		return this.backend.hasFeature( name );

	}

	copyFramebufferToTexture( framebufferTexture ) {

		const renderContext = this._currentRenderContext || this._lastRenderContext;

		this._textures.updateTexture( framebufferTexture );

		this.backend.copyFramebufferToTexture( framebufferTexture, renderContext );

	}

	readRenderTargetPixelsAsync( renderTarget, x, y, width, height ) {

		return this.backend.copyTextureToBuffer( renderTarget.texture, x, y, width, height );

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

						_vector3.setFromMatrixPosition( object.matrixWorld ).applyMatrix4( _projScreenMatrix );

					}

					const geometry = object.geometry;
					const material = object.material;

					if ( material.visible ) {

						renderList.push( object, geometry, material, groupOrder, _vector3.z, null );

					}

				}

			} else if ( object.isLineLoop ) {

				console.error( 'THREE.Renderer: Objects of type THREE.LineLoop are not supported. Please use THREE.Line or THREE.LineSegments.' );

			} else if ( object.isMesh || object.isLine || object.isPoints ) {

				if ( ! object.frustumCulled || _frustum.intersectsObject( object ) ) {

					const geometry = object.geometry;
					const material = object.material;

					if ( this.sortObjects === true ) {

						if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

						_vector3
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

								renderList.push( object, geometry, groupMaterial, groupOrder, _vector3.z, group );

							}

						}

					} else if ( material.visible ) {

						renderList.push( object, geometry, material, groupOrder, _vector3.z, null );

					}

				}

			}

		}

		const children = object.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			this._projectObject( children[ i ], camera, groupOrder, renderList );

		}

	}

	_renderObjects( renderList, camera, scene, lightsNode ) {

		// process renderable objects

		for ( let i = 0, il = renderList.length; i < il; i ++ ) {

			const renderItem = renderList[ i ];

			// @TODO: Add support for multiple materials per object. This will require to extract
			// the material from the renderItem object and pass it with its group data to _renderObject().

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

						this._renderObject( object, scene, camera2, geometry, material, group, lightsNode );

					}

				}

			} else {

				this._renderObject( object, scene, camera, geometry, material, group, lightsNode );

			}

		}

	}

	_renderObject( object, scene, camera, geometry, material, group, lightsNode ) {

		material = scene.overrideMaterial !== null ? scene.overrideMaterial : material;

		//

		object.onBeforeRender( this, scene, camera, geometry, material, group );

		material.onBeforeRender( this, scene, camera, geometry, material, group );

		//

		if ( material.transparent === true && material.side === DoubleSide && material.forceSinglePass === false ) {

			material.side = BackSide;
			this._renderObjectDirect( object, material, scene, camera, lightsNode, 'backSide' ); // create backSide pass id

			material.side = FrontSide;
			this._renderObjectDirect( object, material, scene, camera, lightsNode ); // use default pass id

			material.side = DoubleSide;

		} else {

			this._renderObjectDirect( object, material, scene, camera, lightsNode );

		}

		//

		object.onAfterRender( this, scene, camera, geometry, material, group );

	}

	_renderObjectDirect( object, material, scene, camera, lightsNode, passId ) {

		const renderObject = this._objects.get( object, material, scene, camera, lightsNode, this._currentRenderContext, passId );

		//

		this._nodes.updateBefore( renderObject );

		//

		object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
		object.normalMatrix.getNormalMatrix( object.modelViewMatrix );

		//

		this._nodes.updateForRender( renderObject );
		this._geometries.updateForRender( renderObject );
		this._bindings.updateForRender( renderObject );
		this._pipelines.updateForRender( renderObject );

		//

		this.backend.draw( renderObject, this._info );

	}

}

export default Renderer;
