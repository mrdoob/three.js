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
import { Frustum, Matrix4, Vector3, Vector4, Color, SRGBColorSpace, NoToneMapping, DepthFormat } from 'three';

const _drawingBufferSize = new Vector4();
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

		this._initialized = false;
		this._initPromise = null;

		// backwards compatibility

		this.shadow = {
			shadowMap: {}
		};

	}

	async init() {

		if ( this._initialized ) {

			throw new Error( 'WebGPURenderer: Device has already been initialized.' );

		}

		if ( this._initPromise !== null ) {

			return this._initPromise;

		}

		this._initPromise = new Promise( async ( resolve, reject ) => {

			const backend = this.backend;

			try {

				await backend.init( this );

			} catch( error ) {

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
			this._objects = new RenderObjects( this, this._nodes, this._geometries, this._pipelines, this._info );
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

	async render( scene, camera ) {

		if ( this._initialized === false ) await this.init();

		// preserve render tree

		const nodeFrame = this._nodes.nodeFrame;

		const previousRenderId = nodeFrame.renderId;
		const previousRenderState = this._currentRenderContext;

		//

		const renderContext = this._renderContexts.get( scene, camera );
		const renderTarget = this._renderTarget;

		this._currentRenderContext = renderContext;

		nodeFrame.renderId ++;

		//

		if ( this._animation.isAnimating === false ) nodeFrame.update();

		if ( scene.matrixWorldAutoUpdate === true ) scene.updateMatrixWorld();

		if ( camera.parent === null && camera.matrixWorldAutoUpdate === true ) camera.updateMatrixWorld();

		if ( this._info.autoReset === true ) this._info.reset();

		this._info.render.frame ++;

		//

		this.getDrawingBufferSize( _drawingBufferSize );

		renderContext.viewportValue.copy( this._viewport ).multiplyScalar( this._pixelRatio ).floor();
		renderContext.viewport = renderContext.viewportValue.equals( _drawingBufferSize ) === false;

		renderContext.scissorValue.copy( this._scissor ).multiplyScalar( this._pixelRatio ).floor();
		renderContext.scissor = renderContext.scissorValue.equals( _drawingBufferSize ) === false;

		//

		_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		_frustum.setFromProjectionMatrix( _projScreenMatrix );

		const renderList = this._renderLists.get( scene, camera );
		renderList.init();

		this._projectObject( scene, camera, 0, renderList );

		renderList.finish();

		if ( this.sortObjects === true ) {

			renderList.sort( this._opaqueSort, this._transparentSort );

		}

		//

		renderContext.renderTarget = renderTarget;

		//

		this._nodes.updateScene( scene );		

		//

		this._background.update( scene, renderList, renderContext );

		//

		this.backend.beginRender( renderContext );

		// process render lists

		const opaqueObjects = renderList.opaque;
		const transparentObjects = renderList.transparent;
		const lightsNode = renderList.lightsNode;

		if ( opaqueObjects.length > 0 ) this._renderObjects( opaqueObjects, camera, scene, lightsNode );
		if ( transparentObjects.length > 0 ) this._renderObjects( transparentObjects, camera, scene, lightsNode );

		// finish render pass

		this.backend.finishRender( renderContext );

		// restore render tree

		nodeFrame.renderId = previousRenderId;
		this._currentRenderContext = previousRenderState;

		this._lastRenderContext = renderContext;

	}

	setAnimationLoop( callback ) {

		if ( this._initialized === false ) this.init();

		const animation = this._animation;

		animation.setAnimationLoop( callback );

		( callback === null ) ? animation.stop() : animation.start();

	}

	async getArrayBuffer( attribute ) {

		return await this._attributes.getArrayBuffer( attribute );

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

			scissor.set( x.x, x.y, x.z, x.w );

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

	copyFramebufferToRenderTarget( renderTarget ) {

		this.backend.copyFramebufferToRenderTarget( renderTarget );

	}

	getViewport( target ) {

		return target.copy( this._viewport );

	}

	setViewport( x, y, width, height /*minDepth = 0, maxDepth = 1*/ ) {

		const viewport = this._viewport;

		if ( x.isVector4 ) {

			viewport.copy( x );

		} else {

			viewport.set( x, y, width, height );

		}

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

	clear( color = true, depth = true, stencil = true ) {

		this.backend.clear( color, depth, stencil );

	}

	clearColor() {

		this.backend.clear( true, false, false );

	}

	clearDepth() {

		this.backend.clear( false, true, false );

	}

	clearStencil() {

		this.backend.clear( false, false, true );

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

	setRenderTarget( renderTarget ) {

		this._renderTarget = renderTarget;

	}

	async compute( computeNodes ) {

		if ( this._initialized === false ) await this.init();

		const backend = this.backend;
		const piplines = this._pipelines;
		const computeGroup = Array.isArray( computeNodes ) ? computeNodes : [ computeNodes ];

		backend.beginCompute( computeGroup );

		for ( const computeNode of computeGroup ) {

			// onInit

			if ( piplines.has( computeNode ) === false ) {

				computeNode.onInit( { renderer: this } );

			}

			this._nodes.updateForCompute( computeNode );
			this._bindings.updateForCompute( computeNode );

			const computePipeline = piplines.getForCompute( computeNode );
			const computeBindings = this._bindings.getForCompute( computeNode );

			backend.compute( computeGroup, computeNode, computeBindings, computePipeline );

		}

		backend.finishCompute( computeGroup );

	}

	getRenderTarget() {

		return this._renderTarget;

	}

	hasFeature( name ) {

		return this.backend.hasFeature( name );

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

				console.error( 'THREE.WebGPURenderer: Objects of type THREE.LineLoop are not supported. Please use THREE.Line or THREE.LineSegments.' );

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

						this._currentRenderContext.currentPassGPU.setViewport( vp.x, vp.y, vp.width, vp.height, minDepth, maxDepth );

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

		//

		const renderObject = this._objects.get( object, material, scene, camera, lightsNode );
		renderObject.context = this._currentRenderContext;

		//

		this._nodes.updateBefore( renderObject );

		//

		object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
		object.normalMatrix.getNormalMatrix( object.modelViewMatrix );

		//

		this._nodes.updateForRender( renderObject );
		this._geometries.update( renderObject );
		this._bindings.updateForRender( renderObject );

		//
		
		this.backend.draw( renderObject, this._info );

	}

}

export default Renderer;
