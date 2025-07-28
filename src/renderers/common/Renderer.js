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
import Lighting from './Lighting.js';
import XRManager from './XRManager.js';

import NodeMaterial from '../../materials/nodes/NodeMaterial.js';

import { Scene } from '../../scenes/Scene.js';
import { ColorManagement } from '../../math/ColorManagement.js';
import { Frustum } from '../../math/Frustum.js';
import { FrustumArray } from '../../math/FrustumArray.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { Vector2 } from '../../math/Vector2.js';
import { Vector4 } from '../../math/Vector4.js';
import { RenderTarget } from '../../core/RenderTarget.js';
import { DoubleSide, BackSide, FrontSide, SRGBColorSpace, NoToneMapping, LinearFilter, HalfFloatType, RGBAFormat, PCFShadowMap } from '../../constants.js';

import { highpModelNormalViewMatrix, highpModelViewMatrix } from '../../nodes/accessors/ModelNode.js';

const _scene = /*@__PURE__*/ new Scene();
const _drawingBufferSize = /*@__PURE__*/ new Vector2();
const _screen = /*@__PURE__*/ new Vector4();
const _frustum = /*@__PURE__*/ new Frustum();
const _frustumArray = /*@__PURE__*/ new FrustumArray();

const _projScreenMatrix = /*@__PURE__*/ new Matrix4();
const _vector4 = /*@__PURE__*/ new Vector4();

/**
 * Base class for renderers.
 */
class Renderer {

	/**
	 * Renderer options.
	 *
	 * @typedef {Object} Renderer~Options
	 * @property {boolean} [logarithmicDepthBuffer=false] - Whether logarithmic depth buffer is enabled or not.
	 * @property {boolean} [alpha=true] - Whether the default framebuffer (which represents the final contents of the canvas) should be transparent or opaque.
	 * @property {boolean} [depth=true] - Whether the default framebuffer should have a depth buffer or not.
	 * @property {boolean} [stencil=false] - Whether the default framebuffer should have a stencil buffer or not.
	 * @property {boolean} [antialias=false] - Whether MSAA as the default anti-aliasing should be enabled or not.
	 * @property {number} [samples=0] - When `antialias` is `true`, `4` samples are used by default. This parameter can set to any other integer value than 0
	 * to overwrite the default.
	 * @property {?Function} [getFallback=null] - This callback function can be used to provide a fallback backend, if the primary backend can't be targeted.
	 * @property {number} [colorBufferType=HalfFloatType] - Defines the type of color buffers. The default `HalfFloatType` is recommend for best
	 * quality. To save memory and bandwidth, `UnsignedByteType` might be used. This will reduce rendering quality though.
	 * @property {boolean} [multiview=false] - If set to `true`, the renderer will use multiview during WebXR rendering if supported.
	 */

	/**
	 * Constructs a new renderer.
	 *
	 * @param {Backend} backend - The backend the renderer is targeting (e.g. WebGPU or WebGL 2).
	 * @param {Renderer~Options} [parameters] - The configuration parameter.

	 */
	constructor( backend, parameters = {} ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isRenderer = true;

		//

		const {
			logarithmicDepthBuffer = false,
			alpha = true,
			depth = true,
			stencil = false,
			antialias = false,
			samples = 0,
			getFallback = null,
			colorBufferType = HalfFloatType,
			multiview = false
		} = parameters;

		/**
		 * A reference to the canvas element the renderer is drawing to.
		 * This value of this property will automatically be created by
		 * the renderer.
		 *
		 * @type {HTMLCanvasElement|OffscreenCanvas}
		 */
		this.domElement = backend.getDomElement();

		/**
		 * A reference to the current backend.
		 *
		 * @type {Backend}
		 */
		this.backend = backend;

		/**
		 * The number of MSAA samples.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.samples = samples || ( antialias === true ) ? 4 : 0;

		/**
		 * Whether the renderer should automatically clear the current rendering target
		 * before execute a `render()` call. The target can be the canvas (default framebuffer)
		 * or the current bound render target (custom framebuffer).
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.autoClear = true;

		/**
		 * When `autoClear` is set to `true`, this property defines whether the renderer
		 * should clear the color buffer.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.autoClearColor = true;

		/**
		 * When `autoClear` is set to `true`, this property defines whether the renderer
		 * should clear the depth buffer.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.autoClearDepth = true;

		/**
		 * When `autoClear` is set to `true`, this property defines whether the renderer
		 * should clear the stencil buffer.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.autoClearStencil = true;

		/**
		 * Whether the default framebuffer should be transparent or opaque.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.alpha = alpha;

		/**
		 * Whether logarithmic depth buffer is enabled or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.logarithmicDepthBuffer = logarithmicDepthBuffer;

		/**
		 * Defines the output color space of the renderer.
		 *
		 * @type {string}
		 * @default SRGBColorSpace
		 */
		this.outputColorSpace = SRGBColorSpace;

		/**
		 * Defines the tone mapping of the renderer.
		 *
		 * @type {number}
		 * @default NoToneMapping
		 */
		this.toneMapping = NoToneMapping;

		/**
		 * Defines the tone mapping exposure.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.toneMappingExposure = 1.0;

		/**
		 * Whether the renderer should sort its render lists or not.
		 *
		 * Note: Sorting is used to attempt to properly render objects that have some degree of transparency.
		 * By definition, sorting objects may not work in all cases. Depending on the needs of application,
		 * it may be necessary to turn off sorting and use other methods to deal with transparency rendering
		 * e.g. manually determining each object's rendering order.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.sortObjects = true;

		/**
		 * Whether the default framebuffer should have a depth buffer or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.depth = depth;

		/**
		 * Whether the default framebuffer should have a stencil buffer or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.stencil = stencil;

		/**
		 * Holds a series of statistical information about the GPU memory
		 * and the rendering process. Useful for debugging and monitoring.
		 *
		 * @type {Info}
		 */
		this.info = new Info();

		/**
		 * Stores override nodes for specific transformations or calculations.
		 * These nodes can be used to replace default behavior in the rendering pipeline.
		 *
		 * @type {Object}
		 * @property {?Node} modelViewMatrix - An override node for the model-view matrix.
		 * @property {?Node} modelNormalViewMatrix - An override node for the model normal view matrix.
		 */
		this.overrideNodes = {
			modelViewMatrix: null,
			modelNormalViewMatrix: null
		};

		/**
		 * The node library defines how certain library objects like materials, lights
		 * or tone mapping functions are mapped to node types. This is required since
		 * although instances of classes like `MeshBasicMaterial` or `PointLight` can
		 * be part of the scene graph, they are internally represented as nodes for
		 * further processing.
		 *
		 * @type {NodeLibrary}
		 */
		this.library = new NodeLibrary();

		/**
		 * A map-like data structure for managing lights.
		 *
		 * @type {Lighting}
		 */
		this.lighting = new Lighting();

		// internals

		/**
		 * This callback function can be used to provide a fallback backend, if the primary backend can't be targeted.
		 *
		 * @private
		 * @type {?Function}
		 */
		this._getFallback = getFallback;

		/**
		 * The renderer's pixel ratio.
		 *
		 * @private
		 * @type {number}
		 * @default 1
		 */
		this._pixelRatio = 1;

		/**
		 * The width of the renderer's default framebuffer in logical pixel unit.
		 *
		 * @private
		 * @type {number}
		 */
		this._width = this.domElement.width;

		/**
		 * The height of the renderer's default framebuffer in logical pixel unit.
		 *
		 * @private
		 * @type {number}
		 */
		this._height = this.domElement.height;

		/**
		 * The viewport of the renderer in logical pixel unit.
		 *
		 * @private
		 * @type {Vector4}
		 */
		this._viewport = new Vector4( 0, 0, this._width, this._height );

		/**
		 * The scissor rectangle of the renderer in logical pixel unit.
		 *
		 * @private
		 * @type {Vector4}
		 */
		this._scissor = new Vector4( 0, 0, this._width, this._height );

		/**
		 * Whether the scissor test should be enabled or not.
		 *
		 * @private
		 * @type {boolean}
		 */
		this._scissorTest = false;

		/**
		 * A reference to a renderer module for managing shader attributes.
		 *
		 * @private
		 * @type {?Attributes}
		 * @default null
		 */
		this._attributes = null;

		/**
		 * A reference to a renderer module for managing geometries.
		 *
		 * @private
		 * @type {?Geometries}
		 * @default null
		 */
		this._geometries = null;

		/**
		 * A reference to a renderer module for managing node related logic.
		 *
		 * @private
		 * @type {?Nodes}
		 * @default null
		 */
		this._nodes = null;

		/**
		 * A reference to a renderer module for managing the internal animation loop.
		 *
		 * @private
		 * @type {?Animation}
		 * @default null
		 */
		this._animation = null;

		/**
		 * A reference to a renderer module for managing shader program bindings.
		 *
		 * @private
		 * @type {?Bindings}
		 * @default null
		 */
		this._bindings = null;

		/**
		 * A reference to a renderer module for managing render objects.
		 *
		 * @private
		 * @type {?RenderObjects}
		 * @default null
		 */
		this._objects = null;

		/**
		 * A reference to a renderer module for managing render and compute pipelines.
		 *
		 * @private
		 * @type {?Pipelines}
		 * @default null
		 */
		this._pipelines = null;

		/**
		 * A reference to a renderer module for managing render bundles.
		 *
		 * @private
		 * @type {?RenderBundles}
		 * @default null
		 */
		this._bundles = null;

		/**
		 * A reference to a renderer module for managing render lists.
		 *
		 * @private
		 * @type {?RenderLists}
		 * @default null
		 */
		this._renderLists = null;

		/**
		 * A reference to a renderer module for managing render contexts.
		 *
		 * @private
		 * @type {?RenderContexts}
		 * @default null
		 */
		this._renderContexts = null;

		/**
		 * A reference to a renderer module for managing textures.
		 *
		 * @private
		 * @type {?Textures}
		 * @default null
		 */
		this._textures = null;

		/**
		 * A reference to a renderer module for backgrounds.
		 *
		 * @private
		 * @type {?Background}
		 * @default null
		 */
		this._background = null;

		/**
		 * This fullscreen quad is used for internal render passes
		 * like the tone mapping and color space output pass.
		 *
		 * @private
		 * @type {QuadMesh}
		 */
		this._quad = new QuadMesh( new NodeMaterial() );
		this._quad.material.name = 'Renderer_output';

		/**
		 * A reference to the current render context.
		 *
		 * @private
		 * @type {?RenderContext}
		 * @default null
		 */
		this._currentRenderContext = null;

		/**
		 * A custom sort function for the opaque render list.
		 *
		 * @private
		 * @type {?Function}
		 * @default null
		 */
		this._opaqueSort = null;

		/**
		 * A custom sort function for the transparent render list.
		 *
		 * @private
		 * @type {?Function}
		 * @default null
		 */
		this._transparentSort = null;

		/**
		 * The framebuffer target.
		 *
		 * @private
		 * @type {?RenderTarget}
		 * @default null
		 */
		this._frameBufferTarget = null;

		const alphaClear = this.alpha === true ? 0 : 1;

		/**
		 * The clear color value.
		 *
		 * @private
		 * @type {Color4}
		 */
		this._clearColor = new Color4( 0, 0, 0, alphaClear );

		/**
		 * The clear depth value.
		 *
		 * @private
		 * @type {number}
		 * @default 1
		 */
		this._clearDepth = 1;

		/**
		 * The clear stencil value.
		 *
		 * @private
		 * @type {number}
		 * @default 0
		 */
		this._clearStencil = 0;

		/**
		 * The current render target.
		 *
		 * @private
		 * @type {?RenderTarget}
		 * @default null
		 */
		this._renderTarget = null;

		/**
		 * The active cube face.
		 *
		 * @private
		 * @type {number}
		 * @default 0
		 */
		this._activeCubeFace = 0;

		/**
		 * The active mipmap level.
		 *
		 * @private
		 * @type {number}
		 * @default 0
		 */
		this._activeMipmapLevel = 0;

		/**
		 * The current output render target.
		 *
		 * @private
		 * @type {?RenderTarget}
		 * @default null
		 */
		this._outputRenderTarget = null;

		/**
		 * The MRT setting.
		 *
		 * @private
		 * @type {?MRTNode}
		 * @default null
		 */
		this._mrt = null;

		/**
		 * This function defines how a render object is going
		 * to be rendered.
		 *
		 * @private
		 * @type {?Function}
		 * @default null
		 */
		this._renderObjectFunction = null;

		/**
		 * Used to keep track of the current render object function.
		 *
		 * @private
		 * @type {?Function}
		 * @default null
		 */
		this._currentRenderObjectFunction = null;

		/**
		 * Used to keep track of the current render bundle.
		 *
		 * @private
		 * @type {?RenderBundle}
		 * @default null
		 */
		this._currentRenderBundle = null;

		/**
		 * Next to `_renderObjectFunction()`, this function provides another hook
		 * for influencing the render process of a render object. It is meant for internal
		 * use and only relevant for `compileAsync()` right now. Instead of using
		 * the default logic of `_renderObjectDirect()` which actually draws the render object,
		 * a different function might be used which performs no draw but just the node
		 * and pipeline updates.
		 *
		 * @private
		 * @type {?Function}
		 * @default null
		 */
		this._handleObjectFunction = this._renderObjectDirect;

		/**
		 * Indicates whether the device has been lost or not. In WebGL terms, the device
		 * lost is considered as a context lost. When this is set to `true`, rendering
		 * isn't possible anymore.
		 *
		 * @private
		 * @type {boolean}
		 * @default false
		 */
		this._isDeviceLost = false;

		/**
		 * A callback function that defines what should happen when a device/context lost occurs.
		 *
		 * @type {Function}
		 */
		this.onDeviceLost = this._onDeviceLost;

		/**
		 * Defines the type of color buffers. The default `HalfFloatType` is recommend for
		 * best quality. To save memory and bandwidth, `UnsignedByteType` might be used.
		 * This will reduce rendering quality though.
		 *
		 * @private
		 * @type {number}
		 * @default HalfFloatType
		 */
		this._colorBufferType = colorBufferType;

		/**
		 * Whether the renderer has been initialized or not.
		 *
		 * @private
		 * @type {boolean}
		 * @default false
		 */
		this._initialized = false;

		/**
		 * A reference to the promise which initializes the renderer.
		 *
		 * @private
		 * @type {?Promise<this>}
		 * @default null
		 */
		this._initPromise = null;

		/**
		 * An array of compilation promises which are used in `compileAsync()`.
		 *
		 * @private
		 * @type {?Array<Promise>}
		 * @default null
		 */
		this._compilationPromises = null;

		/**
		 * Whether the renderer should render transparent render objects or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.transparent = true;

		/**
		 * Whether the renderer should render opaque render objects or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.opaque = true;

		/**
		 * Shadow map configuration
		 * @typedef {Object} ShadowMapConfig
		 * @property {boolean} enabled - Whether to globally enable shadows or not.
		 * @property {number} type - The shadow map type.
		 */

		/**
		 * The renderer's shadow configuration.
		 *
		 * @type {ShadowMapConfig}
		 */
		this.shadowMap = {
			enabled: false,
			type: PCFShadowMap
		};

		/**
		 * XR configuration.
		 * @typedef {Object} XRConfig
		 * @property {boolean} enabled - Whether to globally enable XR or not.
		 */

		/**
		 * The renderer's XR manager.
		 *
		 * @type {XRManager}
		 */
		this.xr = new XRManager( this, multiview );

		/**
		 * Debug configuration.
		 * @typedef {Object} DebugConfig
		 * @property {boolean} checkShaderErrors - Whether shader errors should be checked or not.
		 * @property {?Function} onShaderError - A callback function that is executed when a shader error happens. Only supported with WebGL 2 right now.
		 * @property {Function} getShaderAsync - Allows the get the raw shader code for the given scene, camera and 3D object.
		 */

		/**
		 * The renderer's debug configuration.
		 *
		 * @type {DebugConfig}
		 */
		this.debug = {
			checkShaderErrors: true,
			onShaderError: null,
			getShaderAsync: async ( scene, camera, object ) => {

				await this.compileAsync( scene, camera );

				const renderList = this._renderLists.get( scene, camera );
				const renderContext = this._renderContexts.get( scene, camera, this._renderTarget );

				const material = scene.overrideMaterial || object.material;

				const renderObject = this._objects.get( object, material, scene, camera, renderList.lightsNode, renderContext, renderContext.clippingContext );

				const { fragmentShader, vertexShader } = renderObject.getNodeBuilderState();

				return { fragmentShader, vertexShader };

			}
		};

	}

	/**
	 * Initializes the renderer so it is ready for usage.
	 *
	 * @async
	 * @return {Promise<this>} A Promise that resolves when the renderer has been initialized.
	 */
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
			this._renderLists = new RenderLists( this.lighting );
			this._bundles = new RenderBundles();
			this._renderContexts = new RenderContexts();

			//

			this._animation.start();
			this._initialized = true;

			resolve( this );

		} );

		return this._initPromise;

	}

	/**
	 * The coordinate system of the renderer. The value of this property
	 * depends on the selected backend. Either `THREE.WebGLCoordinateSystem` or
	 * `THREE.WebGPUCoordinateSystem`.
	 *
	 * @readonly
	 * @type {number}
	 */
	get coordinateSystem() {

		return this.backend.coordinateSystem;

	}

	/**
	 * Compiles all materials in the given scene. This can be useful to avoid a
	 * phenomenon which is called "shader compilation stutter", which occurs when
	 * rendering an object with a new shader for the first time.
	 *
	 * If you want to add a 3D object to an existing scene, use the third optional
	 * parameter for applying the target scene. Note that the (target) scene's lighting
	 * and environment must be configured before calling this method.
	 *
	 * @async
	 * @param {Object3D} scene - The scene or 3D object to precompile.
	 * @param {Camera} camera - The camera that is used to render the scene.
	 * @param {?Scene} targetScene - If the first argument is a 3D object, this parameter must represent the scene the 3D object is going to be added.
	 * @return {Promise<Array|undefined>} A Promise that resolves when the compile has been finished.
	 */
	async compileAsync( scene, camera, targetScene = null ) {

		if ( this._isDeviceLost === true ) return;

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
		renderContext.clippingContext.updateGlobal( sceneRef, camera );

		//

		sceneRef.onBeforeRender( this, scene, camera, renderTarget );

		//

		const renderList = this._renderLists.get( scene, camera );
		renderList.begin();

		this._projectObject( scene, camera, 0, renderList, renderContext.clippingContext );

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

		this._background.update( sceneRef, renderList, renderContext );

		// process render lists

		const opaqueObjects = renderList.opaque;
		const transparentObjects = renderList.transparent;
		const transparentDoublePassObjects = renderList.transparentDoublePass;
		const lightsNode = renderList.lightsNode;

		if ( this.opaque === true && opaqueObjects.length > 0 ) this._renderObjects( opaqueObjects, camera, sceneRef, lightsNode );
		if ( this.transparent === true && transparentObjects.length > 0 ) this._renderTransparents( transparentObjects, transparentDoublePassObjects, camera, sceneRef, lightsNode );

		// restore render tree

		nodeFrame.renderId = previousRenderId;

		this._currentRenderContext = previousRenderContext;
		this._currentRenderObjectFunction = previousRenderObjectFunction;
		this._compilationPromises = previousCompilationPromises;

		this._handleObjectFunction = this._renderObjectDirect;

		// wait for all promises setup by backends awaiting compilation/linking/pipeline creation to complete

		await Promise.all( compilationPromises );

	}

	/**
	 * Renders the scene in an async fashion.
	 *
	 * @async
	 * @param {Object3D} scene - The scene or 3D object to render.
	 * @param {Camera} camera - The camera.
	 * @return {Promise} A Promise that resolves when the render has been finished.
	 */
	async renderAsync( scene, camera ) {

		if ( this._initialized === false ) await this.init();

		this._renderScene( scene, camera );

	}

	/**
	 * Can be used to synchronize CPU operations with GPU tasks. So when this method is called,
	 * the CPU waits for the GPU to complete its operation (e.g. a compute task).
	 *
	 * @async
	 * @return {Promise} A Promise that resolves when synchronization has been finished.
	 */
	async waitForGPU() {

		await this.backend.waitForGPU();

	}

	/**
	 * Enables or disables high precision for model-view and normal-view matrices.
	 * When enabled, will use CPU 64-bit precision for higher precision instead of GPU 32-bit for higher performance.
	 *
	 * NOTE: 64-bit precision is not compatible with `InstancedMesh` and `SkinnedMesh`.
	 *
	 * @param {boolean} value - Whether to enable or disable high precision.
	 * @type {boolean}
	 */
	set highPrecision( value ) {

		if ( value === true ) {

			this.overrideNodes.modelViewMatrix = highpModelViewMatrix;
			this.overrideNodes.modelNormalViewMatrix = highpModelNormalViewMatrix;

		} else if ( this.highPrecision ) {

			this.overrideNodes.modelViewMatrix = null;
			this.overrideNodes.modelNormalViewMatrix = null;

		}

	}

	/**
	 * Returns whether high precision is enabled or not.
	 *
	 * @return {boolean} Whether high precision is enabled or not.
	 * @type {boolean}
	 */
	get highPrecision() {

		return this.overrideNodes.modelViewMatrix === highpModelViewMatrix && this.overrideNodes.modelNormalViewMatrix === highpModelNormalViewMatrix;

	}

	/**
	 * Sets the given MRT configuration.
	 *
	 * @param {MRTNode} mrt - The MRT node to set.
	 * @return {Renderer} A reference to this renderer.
	 */
	setMRT( mrt ) {

		this._mrt = mrt;

		return this;

	}

	/**
	 * Returns the MRT configuration.
	 *
	 * @return {MRTNode} The MRT configuration.
	 */
	getMRT() {

		return this._mrt;

	}

	/**
	 * Returns the color buffer type.
	 *
	 * @return {number} The color buffer type.
	 */
	getColorBufferType() {

		return this._colorBufferType;

	}

	/**
	 * Default implementation of the device lost callback.
	 *
	 * @private
	 * @param {Object} info - Information about the context lost.
	 */
	_onDeviceLost( info ) {

		let errorMessage = `THREE.WebGPURenderer: ${info.api} Device Lost:\n\nMessage: ${info.message}`;

		if ( info.reason ) {

			errorMessage += `\nReason: ${info.reason}`;

		}

		console.error( errorMessage );

		this._isDeviceLost = true;

	}

	/**
	 * Renders the given render bundle.
	 *
	 * @private
	 * @param {Object} bundle - Render bundle data.
	 * @param {Scene} sceneRef - The scene the render bundle belongs to.
	 * @param {LightsNode} lightsNode - The lights node.
	 */
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

			const {
				transparentDoublePass: transparentDoublePassObjects,
				transparent: transparentObjects,
				opaque: opaqueObjects
			} = renderList;

			if ( this.opaque === true && opaqueObjects.length > 0 ) this._renderObjects( opaqueObjects, camera, sceneRef, lightsNode );
			if ( this.transparent === true && transparentObjects.length > 0 ) this._renderTransparents( transparentObjects, transparentDoublePassObjects, camera, sceneRef, lightsNode );

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

	/**
	 * Renders the scene or 3D object with the given camera. This method can only be called
	 * if the renderer has been initialized.
	 *
	 * The target of the method is the default framebuffer (meaning the canvas)
	 * or alternatively a render target when specified via `setRenderTarget()`.
	 *
	 * @param {Object3D} scene - The scene or 3D object to render.
	 * @param {Camera} camera - The camera to render the scene with.
	 * @return {?Promise} A Promise that resolve when the scene has been rendered.
	 * Only returned when the renderer has not been initialized.
	 */
	render( scene, camera ) {

		if ( this._initialized === false ) {

			console.warn( 'THREE.Renderer: .render() called before the backend is initialized. Try using .renderAsync() instead.' );

			return this.renderAsync( scene, camera );

		}

		this._renderScene( scene, camera );

	}

	/**
	 * Returns an internal render target which is used when computing the output tone mapping
	 * and color space conversion. Unlike in `WebGLRenderer`, this is done in a separate render
	 * pass and not inline to achieve more correct results.
	 *
	 * @private
	 * @return {?RenderTarget} The render target. The method returns `null` if no output conversion should be applied.
	 */
	_getFrameBufferTarget() {

		const { currentToneMapping, currentColorSpace } = this;

		const useToneMapping = currentToneMapping !== NoToneMapping;
		const useColorSpace = currentColorSpace !== ColorManagement.workingColorSpace;

		if ( useToneMapping === false && useColorSpace === false ) return null;

		const { width, height } = this.getDrawingBufferSize( _drawingBufferSize );
		const { depth, stencil } = this;

		let frameBufferTarget = this._frameBufferTarget;

		if ( frameBufferTarget === null ) {

			frameBufferTarget = new RenderTarget( width, height, {
				depthBuffer: depth,
				stencilBuffer: stencil,
				type: this._colorBufferType,
				format: RGBAFormat,
				colorSpace: ColorManagement.workingColorSpace,
				generateMipmaps: false,
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				samples: this.samples
			} );

			frameBufferTarget.isPostProcessingRenderTarget = true;

			this._frameBufferTarget = frameBufferTarget;

		}

		const outputRenderTarget = this.getOutputRenderTarget();

		frameBufferTarget.depthBuffer = depth;
		frameBufferTarget.stencilBuffer = stencil;
		if ( outputRenderTarget !== null ) {

			frameBufferTarget.setSize( outputRenderTarget.width, outputRenderTarget.height, outputRenderTarget.depth );

		} else {

			frameBufferTarget.setSize( width, height, 1 );

		}

		frameBufferTarget.viewport.copy( this._viewport );
		frameBufferTarget.scissor.copy( this._scissor );
		frameBufferTarget.viewport.multiplyScalar( this._pixelRatio );
		frameBufferTarget.scissor.multiplyScalar( this._pixelRatio );
		frameBufferTarget.scissorTest = this._scissorTest;
		frameBufferTarget.multiview = outputRenderTarget !== null ? outputRenderTarget.multiview : false;
		frameBufferTarget.resolveDepthBuffer = outputRenderTarget !== null ? outputRenderTarget.resolveDepthBuffer : true;
		frameBufferTarget._autoAllocateDepthBuffer = outputRenderTarget !== null ? outputRenderTarget._autoAllocateDepthBuffer : false;

		return frameBufferTarget;

	}

	/**
	 * Renders the scene or 3D object with the given camera.
	 *
	 * @private
	 * @param {Object3D} scene - The scene or 3D object to render.
	 * @param {Camera} camera - The camera to render the scene with.
	 * @param {boolean} [useFrameBufferTarget=true] - Whether to use a framebuffer target or not.
	 * @return {RenderContext} The current render context.
	 */
	_renderScene( scene, camera, useFrameBufferTarget = true ) {

		if ( this._isDeviceLost === true ) return;

		const frameBufferTarget = useFrameBufferTarget ? this._getFrameBufferTarget() : null;

		// preserve render tree

		const nodeFrame = this._nodes.nodeFrame;

		const previousRenderId = nodeFrame.renderId;
		const previousRenderContext = this._currentRenderContext;
		const previousRenderObjectFunction = this._currentRenderObjectFunction;

		//

		const sceneRef = ( scene.isScene === true ) ? scene : _scene;

		const outputRenderTarget = this._renderTarget || this._outputRenderTarget;

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
		const xr = this.xr;

		if ( camera.coordinateSystem !== coordinateSystem && xr.isPresenting === false ) {

			camera.coordinateSystem = coordinateSystem;
			camera.updateProjectionMatrix();

			if ( camera.isArrayCamera ) {

				for ( const subCamera of camera.cameras ) {

					subCamera.coordinateSystem = coordinateSystem;
					subCamera.updateProjectionMatrix();

				}

			}

		}

		//

		if ( scene.matrixWorldAutoUpdate === true ) scene.updateMatrixWorld();

		if ( camera.parent === null && camera.matrixWorldAutoUpdate === true ) camera.updateMatrixWorld();

		if ( xr.enabled === true && xr.isPresenting === true ) {

			if ( xr.cameraAutoUpdate === true ) xr.updateCamera( camera );
			camera = xr.getCamera(); // use XR camera for rendering

		}

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
		renderContext.clippingContext.updateGlobal( sceneRef, camera );

		//

		sceneRef.onBeforeRender( this, scene, camera, renderTarget );

		//

		const frustum = camera.isArrayCamera ? _frustumArray : _frustum;

		if ( ! camera.isArrayCamera ) {

			_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
			frustum.setFromProjectionMatrix( _projScreenMatrix, camera.coordinateSystem, camera.reversedDepth );

		}

		const renderList = this._renderLists.get( scene, camera );
		renderList.begin();

		this._projectObject( scene, camera, 0, renderList, renderContext.clippingContext );

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

		this._background.update( sceneRef, renderList, renderContext );

		//

		renderContext.camera = camera;
		this.backend.beginRender( renderContext );

		// process render lists

		const {
			bundles,
			lightsNode,
			transparentDoublePass: transparentDoublePassObjects,
			transparent: transparentObjects,
			opaque: opaqueObjects
		} = renderList;

		if ( bundles.length > 0 ) this._renderBundles( bundles, sceneRef, lightsNode );
		if ( this.opaque === true && opaqueObjects.length > 0 ) this._renderObjects( opaqueObjects, camera, sceneRef, lightsNode );
		if ( this.transparent === true && transparentObjects.length > 0 ) this._renderTransparents( transparentObjects, transparentDoublePassObjects, camera, sceneRef, lightsNode );

		// finish render pass

		this.backend.finishRender( renderContext );

		// restore render tree

		nodeFrame.renderId = previousRenderId;

		this._currentRenderContext = previousRenderContext;
		this._currentRenderObjectFunction = previousRenderObjectFunction;

		//

		if ( frameBufferTarget !== null ) {

			this.setRenderTarget( outputRenderTarget, activeCubeFace, activeMipmapLevel );

			this._renderOutput( renderTarget );

		}

		//

		sceneRef.onAfterRender( this, scene, camera, renderTarget );

		//

		return renderContext;

	}

	_setXRLayerSize( width, height ) {

		this._width = width;
		this._height = height;

		this.setViewport( 0, 0, width, height );

	}

	/**
	 * The output pass performs tone mapping and color space conversion.
	 *
	 * @private
	 * @param {RenderTarget} renderTarget - The current render target.
	 */
	_renderOutput( renderTarget ) {

		const quad = this._quad;

		if ( this._nodes.hasOutputChange( renderTarget.texture ) ) {

			quad.material.fragmentNode = this._nodes.getOutputNode( renderTarget.texture );
			quad.material.needsUpdate = true;

		}

		// a clear operation clears the intermediate renderTarget texture, but should not update the screen canvas.

		const currentAutoClear = this.autoClear;
		const currentXR = this.xr.enabled;

		this.autoClear = false;
		this.xr.enabled = false;

		this._renderScene( quad, quad.camera, false );

		this.autoClear = currentAutoClear;
		this.xr.enabled = currentXR;


	}

	/**
	 * Returns the maximum available anisotropy for texture filtering.
	 *
	 * @return {number} The maximum available anisotropy.
	 */
	getMaxAnisotropy() {

		return this.backend.getMaxAnisotropy();

	}

	/**
	 * Returns the active cube face.
	 *
	 * @return {number} The active cube face.
	 */
	getActiveCubeFace() {

		return this._activeCubeFace;

	}

	/**
	 * Returns the active mipmap level.
	 *
	 * @return {number} The active mipmap level.
	 */
	getActiveMipmapLevel() {

		return this._activeMipmapLevel;

	}

	/**
	 * Applications are advised to always define the animation loop
	 * with this method and not manually with `requestAnimationFrame()`
	 * for best compatibility.
	 *
	 * @async
	 * @param {?Function} callback - The application's animation loop.
	 * @return {Promise} A Promise that resolves when the set has been executed.
	 */
	async setAnimationLoop( callback ) {

		if ( this._initialized === false ) await this.init();

		this._animation.setAnimationLoop( callback );

	}

	/**
	 * Can be used to transfer buffer data from a storage buffer attribute
	 * from the GPU to the CPU in context of compute shaders.
	 *
	 * @async
	 * @param {StorageBufferAttribute} attribute - The storage buffer attribute.
	 * @return {Promise<ArrayBuffer>} A promise that resolves with the buffer data when the data are ready.
	 */
	async getArrayBufferAsync( attribute ) {

		return await this.backend.getArrayBufferAsync( attribute );

	}

	/**
	 * Returns the rendering context.
	 *
	 * @return {GPUCanvasContext|WebGL2RenderingContext} The rendering context.
	 */
	getContext() {

		return this.backend.getContext();

	}

	/**
	 * Returns the pixel ratio.
	 *
	 * @return {number} The pixel ratio.
	 */
	getPixelRatio() {

		return this._pixelRatio;

	}

	/**
	 * Returns the drawing buffer size in physical pixels. This method honors the pixel ratio.
	 *
	 * @param {Vector2} target - The method writes the result in this target object.
	 * @return {Vector2} The drawing buffer size.
	 */
	getDrawingBufferSize( target ) {

		return target.set( this._width * this._pixelRatio, this._height * this._pixelRatio ).floor();

	}

	/**
	 * Returns the renderer's size in logical pixels. This method does not honor the pixel ratio.
	 *
	 * @param {Vector2} target - The method writes the result in this target object.
	 * @return {Vector2} The renderer's size in logical pixels.
	 */
	getSize( target ) {

		return target.set( this._width, this._height );

	}

	/**
	 * Sets the given pixel ratio and resizes the canvas if necessary.
	 *
	 * @param {number} [value=1] - The pixel ratio.
	 */
	setPixelRatio( value = 1 ) {

		if ( this._pixelRatio === value ) return;

		this._pixelRatio = value;

		this.setSize( this._width, this._height, false );

	}

	/**
	 * This method allows to define the drawing buffer size by specifying
	 * width, height and pixel ratio all at once. The size of the drawing
	 * buffer is computed with this formula:
	 * ```js
	 * size.x = width * pixelRatio;
	 * size.y = height * pixelRatio;
	 * ```
	 *
	 * @param {number} width - The width in logical pixels.
	 * @param {number} height - The height in logical pixels.
	 * @param {number} pixelRatio - The pixel ratio.
	 */
	setDrawingBufferSize( width, height, pixelRatio ) {

		// Renderer can't be resized while presenting in XR.
		if ( this.xr && this.xr.isPresenting ) return;

		this._width = width;
		this._height = height;

		this._pixelRatio = pixelRatio;

		this.domElement.width = Math.floor( width * pixelRatio );
		this.domElement.height = Math.floor( height * pixelRatio );

		this.setViewport( 0, 0, width, height );

		if ( this._initialized ) this.backend.updateSize();

	}

	/**
	 * Sets the size of the renderer.
	 *
	 * @param {number} width - The width in logical pixels.
	 * @param {number} height - The height in logical pixels.
	 * @param {boolean} [updateStyle=true] - Whether to update the `style` attribute of the canvas or not.
	 */
	setSize( width, height, updateStyle = true ) {

		// Renderer can't be resized while presenting in XR.
		if ( this.xr && this.xr.isPresenting ) return;

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

	/**
	 * Defines a manual sort function for the opaque render list.
	 * Pass `null` to use the default sort.
	 *
	 * @param {Function} method - The sort function.
	 */
	setOpaqueSort( method ) {

		this._opaqueSort = method;

	}

	/**
	 * Defines a manual sort function for the transparent render list.
	 * Pass `null` to use the default sort.
	 *
	 * @param {Function} method - The sort function.
	 */
	setTransparentSort( method ) {

		this._transparentSort = method;

	}

	/**
	 * Returns the scissor rectangle.
	 *
	 * @param {Vector4} target - The method writes the result in this target object.
	 * @return {Vector4} The scissor rectangle.
	 */
	getScissor( target ) {

		const scissor = this._scissor;

		target.x = scissor.x;
		target.y = scissor.y;
		target.width = scissor.width;
		target.height = scissor.height;

		return target;

	}

	/**
	 * Defines the scissor rectangle.
	 *
	 * @param {number | Vector4} x - The horizontal coordinate for the lower left corner of the box in logical pixel unit.
	 * Instead of passing four arguments, the method also works with a single four-dimensional vector.
	 * @param {number} y - The vertical coordinate for the lower left corner of the box in logical pixel unit.
	 * @param {number} width - The width of the scissor box in logical pixel unit.
	 * @param {number} height - The height of the scissor box in logical pixel unit.
	 */
	setScissor( x, y, width, height ) {

		const scissor = this._scissor;

		if ( x.isVector4 ) {

			scissor.copy( x );

		} else {

			scissor.set( x, y, width, height );

		}

	}

	/**
	 * Returns the scissor test value.
	 *
	 * @return {boolean} Whether the scissor test should be enabled or not.
	 */
	getScissorTest() {

		return this._scissorTest;

	}

	/**
	 * Defines the scissor test.
	 *
	 * @param {boolean} boolean - Whether the scissor test should be enabled or not.
	 */
	setScissorTest( boolean ) {

		this._scissorTest = boolean;

		this.backend.setScissorTest( boolean );

	}

	/**
	 * Returns the viewport definition.
	 *
	 * @param {Vector4} target - The method writes the result in this target object.
	 * @return {Vector4} The viewport definition.
	 */
	getViewport( target ) {

		return target.copy( this._viewport );

	}

	/**
	 * Defines the viewport.
	 *
	 * @param {number | Vector4} x - The horizontal coordinate for the lower left corner of the viewport origin in logical pixel unit.
	 * @param {number} y - The vertical coordinate for the lower left corner of the viewport origin  in logical pixel unit.
	 * @param {number} width - The width of the viewport in logical pixel unit.
	 * @param {number} height - The height of the viewport in logical pixel unit.
	 * @param {number} minDepth - The minimum depth value of the viewport. WebGPU only.
	 * @param {number} maxDepth - The maximum depth value of the viewport. WebGPU only.
	 */
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

	/**
	 * Returns the clear color.
	 *
	 * @param {Color} target - The method writes the result in this target object.
	 * @return {Color} The clear color.
	 */
	getClearColor( target ) {

		return target.copy( this._clearColor );

	}

	/**
	 * Defines the clear color and optionally the clear alpha.
	 *
	 * @param {Color} color - The clear color.
	 * @param {number} [alpha=1] - The clear alpha.
	 */
	setClearColor( color, alpha = 1 ) {

		this._clearColor.set( color );
		this._clearColor.a = alpha;

	}

	/**
	 * Returns the clear alpha.
	 *
	 * @return {number} The clear alpha.
	 */
	getClearAlpha() {

		return this._clearColor.a;

	}

	/**
	 * Defines the clear alpha.
	 *
	 * @param {number} alpha - The clear alpha.
	 */
	setClearAlpha( alpha ) {

		this._clearColor.a = alpha;

	}

	/**
	 * Returns the clear depth.
	 *
	 * @return {number} The clear depth.
	 */
	getClearDepth() {

		return this._clearDepth;

	}

	/**
	 * Defines the clear depth.
	 *
	 * @param {number} depth - The clear depth.
	 */
	setClearDepth( depth ) {

		this._clearDepth = depth;

	}

	/**
	 * Returns the clear stencil.
	 *
	 * @return {number} The clear stencil.
	 */
	getClearStencil() {

		return this._clearStencil;

	}

	/**
	 * Defines the clear stencil.
	 *
	 * @param {number} stencil - The clear stencil.
	 */
	setClearStencil( stencil ) {

		this._clearStencil = stencil;

	}

	/**
	 * This method performs an occlusion query for the given 3D object.
	 * It returns `true` if the given 3D object is fully occluded by other
	 * 3D objects in the scene.
	 *
	 * @param {Object3D} object - The 3D object to test.
	 * @return {boolean} Whether the 3D object is fully occluded or not.
	 */
	isOccluded( object ) {

		const renderContext = this._currentRenderContext;

		return renderContext && this.backend.isOccluded( renderContext, object );

	}

	/**
	 * Performs a manual clear operation. This method ignores `autoClear` properties.
	 *
	 * @param {boolean} [color=true] - Whether the color buffer should be cleared or not.
	 * @param {boolean} [depth=true] - Whether the depth buffer should be cleared or not.
	 * @param {boolean} [stencil=true] - Whether the stencil buffer should be cleared or not.
	 * @return {Promise} A Promise that resolves when the clear operation has been executed.
	 * Only returned when the renderer has not been initialized.
	 */
	clear( color = true, depth = true, stencil = true ) {

		if ( this._initialized === false ) {

			console.warn( 'THREE.Renderer: .clear() called before the backend is initialized. Try using .clearAsync() instead.' );

			return this.clearAsync( color, depth, stencil );

		}

		const renderTarget = this._renderTarget || this._getFrameBufferTarget();

		let renderContext = null;

		if ( renderTarget !== null ) {

			this._textures.updateRenderTarget( renderTarget );

			const renderTargetData = this._textures.get( renderTarget );

			renderContext = this._renderContexts.getForClear( renderTarget );
			renderContext.textures = renderTargetData.textures;
			renderContext.depthTexture = renderTargetData.depthTexture;
			renderContext.width = renderTargetData.width;
			renderContext.height = renderTargetData.height;
			renderContext.renderTarget = renderTarget;
			renderContext.depth = renderTarget.depthBuffer;
			renderContext.stencil = renderTarget.stencilBuffer;
			// #30329
			renderContext.clearColorValue = this.backend.getClearColor();
			renderContext.activeCubeFace = this.getActiveCubeFace();
			renderContext.activeMipmapLevel = this.getActiveMipmapLevel();

		}

		this.backend.clear( color, depth, stencil, renderContext );

		if ( renderTarget !== null && this._renderTarget === null ) {

			this._renderOutput( renderTarget );

		}

	}

	/**
	 * Performs a manual clear operation of the color buffer. This method ignores `autoClear` properties.
	 *
	 * @return {Promise} A Promise that resolves when the clear operation has been executed.
	 * Only returned when the renderer has not been initialized.
	 */
	clearColor() {

		return this.clear( true, false, false );

	}

	/**
	 * Performs a manual clear operation of the depth buffer. This method ignores `autoClear` properties.
	 *
	 * @return {Promise} A Promise that resolves when the clear operation has been executed.
	 * Only returned when the renderer has not been initialized.
	 */
	clearDepth() {

		return this.clear( false, true, false );

	}

	/**
	 * Performs a manual clear operation of the stencil buffer. This method ignores `autoClear` properties.
	 *
	 * @return {Promise} A Promise that resolves when the clear operation has been executed.
	 * Only returned when the renderer has not been initialized.
	 */
	clearStencil() {

		return this.clear( false, false, true );

	}

	/**
	 * Async version of {@link Renderer#clear}.
	 *
	 * @async
	 * @param {boolean} [color=true] - Whether the color buffer should be cleared or not.
	 * @param {boolean} [depth=true] - Whether the depth buffer should be cleared or not.
	 * @param {boolean} [stencil=true] - Whether the stencil buffer should be cleared or not.
	 * @return {Promise} A Promise that resolves when the clear operation has been executed.
	 */
	async clearAsync( color = true, depth = true, stencil = true ) {

		if ( this._initialized === false ) await this.init();

		this.clear( color, depth, stencil );

	}

	/**
	 * Async version of {@link Renderer#clearColor}.
	 *
	 * @async
	 * @return {Promise} A Promise that resolves when the clear operation has been executed.
	 */
	async clearColorAsync() {

		this.clearAsync( true, false, false );

	}

	/**
	 * Async version of {@link Renderer#clearDepth}.
	 *
	 * @async
	 * @return {Promise} A Promise that resolves when the clear operation has been executed.
	 */
	async clearDepthAsync() {

		this.clearAsync( false, true, false );

	}

	/**
	 * Async version of {@link Renderer#clearStencil}.
	 *
	 * @async
	 * @return {Promise} A Promise that resolves when the clear operation has been executed.
	 */
	async clearStencilAsync() {

		this.clearAsync( false, false, true );

	}

	/**
	 * The current tone mapping of the renderer. When not producing screen output,
	 * the tone mapping is always `NoToneMapping`.
	 *
	 * @type {number}
	 */
	get currentToneMapping() {

		return this.isOutputTarget ? this.toneMapping : NoToneMapping;

	}

	/**
	 * The current color space of the renderer. When not producing screen output,
	 * the color space is always the working color space.
	 *
	 * @type {string}
	 */
	get currentColorSpace() {

		return this.isOutputTarget ? this.outputColorSpace : ColorManagement.workingColorSpace;

	}

	/**
	 * Returns `true` if the rendering settings are set to screen output.
	 *
	 * @returns {boolean} True if the current render target is the same of output render target or `null`, otherwise false.
	 */
	get isOutputTarget() {

		return this._renderTarget === this._outputRenderTarget || this._renderTarget === null;

	}

	/**
	 * Frees all internal resources of the renderer. Call this method if the renderer
	 * is no longer in use by your app.
	 */
	dispose() {

		this.info.dispose();
		this.backend.dispose();

		this._animation.dispose();
		this._objects.dispose();
		this._pipelines.dispose();
		this._nodes.dispose();
		this._bindings.dispose();
		this._renderLists.dispose();
		this._renderContexts.dispose();
		this._textures.dispose();

		if ( this._frameBufferTarget !== null ) this._frameBufferTarget.dispose();

		Object.values( this.backend.timestampQueryPool ).forEach( queryPool => {

			if ( queryPool !== null ) queryPool.dispose();

		} );

		this.setRenderTarget( null );
		this.setAnimationLoop( null );

	}

	/**
	 * Sets the given render target. Calling this method means the renderer does not
	 * target the default framebuffer (meaning the canvas) anymore but a custom framebuffer.
	 * Use `null` as the first argument to reset the state.
	 *
	 * @param {?RenderTarget} renderTarget - The render target to set.
	 * @param {number} [activeCubeFace=0] - The active cube face.
	 * @param {number} [activeMipmapLevel=0] - The active mipmap level.
	 */
	setRenderTarget( renderTarget, activeCubeFace = 0, activeMipmapLevel = 0 ) {

		this._renderTarget = renderTarget;
		this._activeCubeFace = activeCubeFace;
		this._activeMipmapLevel = activeMipmapLevel;

	}

	/**
	 * Returns the current render target.
	 *
	 * @return {?RenderTarget} The render target. Returns `null` if no render target is set.
	 */
	getRenderTarget() {

		return this._renderTarget;

	}

	/**
	 * Sets the output render target for the renderer.
	 *
	 * @param {Object} renderTarget - The render target to set as the output target.
	 */
	setOutputRenderTarget( renderTarget ) {

		this._outputRenderTarget = renderTarget;

	}

	/**
	 * Returns the current output target.
	 *
	 * @return {?RenderTarget} The current output render target. Returns `null` if no output target is set.
	 */
	getOutputRenderTarget() {

		return this._outputRenderTarget;

	}

	/**
	 * Resets the renderer to the initial state before WebXR started.
	 *
	 */
	_resetXRState() {

		this.backend.setXRTarget( null );
		this.setOutputRenderTarget( null );
		this.setRenderTarget( null );

		this._frameBufferTarget.dispose();
		this._frameBufferTarget = null;

	}

	/**
	 * Callback for {@link Renderer#setRenderObjectFunction}.
	 *
	 * @callback renderObjectFunction
	 * @param {Object3D} object - The 3D object.
	 * @param {Scene} scene - The scene the 3D object belongs to.
	 * @param {Camera} camera - The camera the object should be rendered with.
	 * @param {BufferGeometry} geometry - The object's geometry.
	 * @param {Material} material - The object's material.
	 * @param {?Object} group - Only relevant for objects using multiple materials. This represents a group entry from the respective `BufferGeometry`.
	 * @param {LightsNode} lightsNode - The current lights node.
	 * @param {ClippingContext} clippingContext - The clipping context.
	 * @param {?string} [passId=null] - An optional ID for identifying the pass.
	 */

	/**
	 * Sets the given render object function. Calling this method overwrites the default implementation
	 * which is {@link Renderer#renderObject}. Defining a custom function can be useful
	 * if you want to modify the way objects are rendered. For example you can define things like "every
	 * object that has material of a certain type should perform a pre-pass with a special overwrite material".
	 * The custom function must always call `renderObject()` in its implementation.
	 *
	 * Use `null` as the first argument to reset the state.
	 *
	 * @param {?renderObjectFunction} renderObjectFunction - The render object function.
	 */
	setRenderObjectFunction( renderObjectFunction ) {

		this._renderObjectFunction = renderObjectFunction;

	}

	/**
	 * Returns the current render object function.
	 *
	 * @return {?Function} The current render object function. Returns `null` if no function is set.
	 */
	getRenderObjectFunction() {

		return this._renderObjectFunction;

	}

	/**
	 * Execute a single or an array of compute nodes. This method can only be called
	 * if the renderer has been initialized.
	 *
	 * @param {Node|Array<Node>} computeNodes - The compute node(s).
	 * @param {Array<number>|number} [dispatchSizeOrCount=null] - Array with [ x, y, z ] values for dispatch or a single number for the count.
	 * @return {Promise|undefined} A Promise that resolve when the compute has finished. Only returned when the renderer has not been initialized.
	 */
	compute( computeNodes, dispatchSizeOrCount = null ) {

		if ( this._isDeviceLost === true ) return;

		if ( this._initialized === false ) {

			console.warn( 'THREE.Renderer: .compute() called before the backend is initialized. Try using .computeAsync() instead.' );

			return this.computeAsync( computeNodes );

		}

		//

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

				const onInitFn = computeNode.onInitFunction;

				if ( onInitFn !== null ) {

					onInitFn.call( computeNode, { renderer: this } );

				}

			}

			nodes.updateForCompute( computeNode );
			bindings.updateForCompute( computeNode );

			const computeBindings = bindings.getForCompute( computeNode );
			const computePipeline = pipelines.getForCompute( computeNode, computeBindings );

			backend.compute( computeNodes, computeNode, computeBindings, computePipeline, dispatchSizeOrCount );

		}

		backend.finishCompute( computeNodes );

		//

		nodeFrame.renderId = previousRenderId;

	}

	/**
	 * Execute a single or an array of compute nodes.
	 *
	 * @async
	 * @param {Node|Array<Node>} computeNodes - The compute node(s).
	 * @param {Array<number>|number} [dispatchSizeOrCount=null] - Array with [ x, y, z ] values for dispatch or a single number for the count.
	 * @return {Promise} A Promise that resolve when the compute has finished.
	 */
	async computeAsync( computeNodes, dispatchSizeOrCount = null ) {

		if ( this._initialized === false ) await this.init();

		this.compute( computeNodes, dispatchSizeOrCount );

	}

	/**
	 * Checks if the given feature is supported by the selected backend.
	 *
	 * @async
	 * @param {string} name - The feature's name.
	 * @return {Promise<boolean>} A Promise that resolves with a bool that indicates whether the feature is supported or not.
	 */
	async hasFeatureAsync( name ) {

		if ( this._initialized === false ) await this.init();

		return this.backend.hasFeature( name );

	}

	async resolveTimestampsAsync( type = 'render' ) {

		if ( this._initialized === false ) await this.init();

		return this.backend.resolveTimestampsAsync( type );

	}

	/**
	 * Checks if the given feature is supported by the selected backend. If the
	 * renderer has not been initialized, this method always returns `false`.
	 *
	 * @param {string} name - The feature's name.
	 * @return {boolean} Whether the feature is supported or not.
	 */
	hasFeature( name ) {

		if ( this._initialized === false ) {

			console.warn( 'THREE.Renderer: .hasFeature() called before the backend is initialized. Try using .hasFeatureAsync() instead.' );

			return false;

		}

		return this.backend.hasFeature( name );

	}

	/**
	 * Returns `true` when the renderer has been initialized.
	 *
	 * @return {boolean} Whether the renderer has been initialized or not.
	 */
	hasInitialized() {

		return this._initialized;

	}

	/**
	 * Initializes the given textures. Useful for preloading a texture rather than waiting until first render
	 * (which can cause noticeable lags due to decode and GPU upload overhead).
	 *
	 * @async
	 * @param {Texture} texture - The texture.
	 * @return {Promise} A Promise that resolves when the texture has been initialized.
	 */
	async initTextureAsync( texture ) {

		if ( this._initialized === false ) await this.init();

		this._textures.updateTexture( texture );

	}

	/**
	 * Initializes the given texture. Useful for preloading a texture rather than waiting until first render
	 * (which can cause noticeable lags due to decode and GPU upload overhead).
	 *
	 * This method can only be used if the renderer has been initialized.
	 *
	 * @param {Texture} texture - The texture.
	 */
	initTexture( texture ) {

		if ( this._initialized === false ) {

			console.warn( 'THREE.Renderer: .initTexture() called before the backend is initialized. Try using .initTextureAsync() instead.' );

		}

		this._textures.updateTexture( texture );

	}

	/**
	 * Copies the current bound framebuffer into the given texture.
	 *
	 * @param {FramebufferTexture} framebufferTexture - The texture.
	 * @param {?Vector2|Vector4} [rectangle=null] - A two or four dimensional vector that defines the rectangular portion of the framebuffer that should be copied.
	 */
	copyFramebufferToTexture( framebufferTexture, rectangle = null ) {

		if ( rectangle !== null ) {

			if ( rectangle.isVector2 ) {

				rectangle = _vector4.set( rectangle.x, rectangle.y, framebufferTexture.image.width, framebufferTexture.image.height ).floor();

			} else if ( rectangle.isVector4 ) {

				rectangle = _vector4.copy( rectangle ).floor();

			} else {

				console.error( 'THREE.Renderer.copyFramebufferToTexture: Invalid rectangle.' );

				return;

			}

		} else {

			rectangle = _vector4.set( 0, 0, framebufferTexture.image.width, framebufferTexture.image.height );

		}

		//

		let renderContext = this._currentRenderContext;
		let renderTarget;

		if ( renderContext !== null ) {

			renderTarget = renderContext.renderTarget;

		} else {

			renderTarget = this._renderTarget || this._getFrameBufferTarget();

			if ( renderTarget !== null ) {

				this._textures.updateRenderTarget( renderTarget );

				renderContext = this._textures.get( renderTarget );

			}

		}

		//

		this._textures.updateTexture( framebufferTexture, { renderTarget } );

		this.backend.copyFramebufferToTexture( framebufferTexture, renderContext, rectangle );

	}

	/**
	 * Copies data of the given source texture into a destination texture.
	 *
	 * @param {Texture} srcTexture - The source texture.
	 * @param {Texture} dstTexture - The destination texture.
	 * @param {Box2|Box3} [srcRegion=null] - A bounding box which describes the source region. Can be two or three-dimensional.
	 * @param {Vector2|Vector3} [dstPosition=null] - A vector that represents the origin of the destination region. Can be two or three-dimensional.
	 * @param {number} [srcLevel=0] - The source mip level to copy from.
	 * @param {number} [dstLevel=0] - The destination mip level to copy to.
	 */
	copyTextureToTexture( srcTexture, dstTexture, srcRegion = null, dstPosition = null, srcLevel = 0, dstLevel = 0 ) {

		this._textures.updateTexture( srcTexture );
		this._textures.updateTexture( dstTexture );

		this.backend.copyTextureToTexture( srcTexture, dstTexture, srcRegion, dstPosition, srcLevel, dstLevel );

	}

	/**
	 * Reads pixel data from the given render target.
	 *
	 * @async
	 * @param {RenderTarget} renderTarget - The render target to read from.
	 * @param {number} x - The `x` coordinate of the copy region's origin.
	 * @param {number} y - The `y` coordinate of the copy region's origin.
	 * @param {number} width - The width of the copy region.
	 * @param {number} height - The height of the copy region.
	 * @param {number} [textureIndex=0] - The texture index of a MRT render target.
	 * @param {number} [faceIndex=0] - The active cube face index.
	 * @return {Promise<TypedArray>} A Promise that resolves when the read has been finished. The resolve provides the read data as a typed array.
	 */
	async readRenderTargetPixelsAsync( renderTarget, x, y, width, height, textureIndex = 0, faceIndex = 0 ) {

		return this.backend.copyTextureToBuffer( renderTarget.textures[ textureIndex ], x, y, width, height, faceIndex );

	}

	/**
	 * Analyzes the given 3D object's hierarchy and builds render lists from the
	 * processed hierarchy.
	 *
	 * @param {Object3D} object - The 3D object to process (usually a scene).
	 * @param {Camera} camera - The camera the object is rendered with.
	 * @param {number} groupOrder - The group order is derived from the `renderOrder` of groups and is used to group 3D objects within groups.
	 * @param {RenderList} renderList - The current render list.
	 * @param {ClippingContext} clippingContext - The current clipping context.
	 */
	_projectObject( object, camera, groupOrder, renderList, clippingContext ) {

		if ( object.visible === false ) return;

		const visible = object.layers.test( camera.layers );

		if ( visible ) {

			if ( object.isGroup ) {

				groupOrder = object.renderOrder;

				if ( object.isClippingGroup && object.enabled ) clippingContext = clippingContext.getGroupContext( object );

			} else if ( object.isLOD ) {

				if ( object.autoUpdate === true ) object.update( camera );

			} else if ( object.isLight ) {

				renderList.pushLight( object );

			} else if ( object.isSprite ) {

				const frustum = camera.isArrayCamera ? _frustumArray : _frustum;

				if ( ! object.frustumCulled || frustum.intersectsSprite( object, camera ) ) {

					if ( this.sortObjects === true ) {

						_vector4.setFromMatrixPosition( object.matrixWorld ).applyMatrix4( _projScreenMatrix );

					}

					const { geometry, material } = object;

					if ( material.visible ) {

						renderList.push( object, geometry, material, groupOrder, _vector4.z, null, clippingContext );

					}

				}

			} else if ( object.isLineLoop ) {

				console.error( 'THREE.Renderer: Objects of type THREE.LineLoop are not supported. Please use THREE.Line or THREE.LineSegments.' );

			} else if ( object.isMesh || object.isLine || object.isPoints ) {

				const frustum = camera.isArrayCamera ? _frustumArray : _frustum;

				if ( ! object.frustumCulled || frustum.intersectsObject( object, camera ) ) {

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

								renderList.push( object, geometry, groupMaterial, groupOrder, _vector4.z, group, clippingContext );

							}

						}

					} else if ( material.visible ) {

						renderList.push( object, geometry, material, groupOrder, _vector4.z, null, clippingContext );

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

			this._projectObject( children[ i ], camera, groupOrder, renderList, clippingContext );

		}

	}

	/**
	 * Renders the given render bundles.
	 *
	 * @private
	 * @param {Array<Object>} bundles - Array with render bundle data.
	 * @param {Scene} sceneRef - The scene the render bundles belong to.
	 * @param {LightsNode} lightsNode - The current lights node.
	 */
	_renderBundles( bundles, sceneRef, lightsNode ) {

		for ( const bundle of bundles ) {

			this._renderBundle( bundle, sceneRef, lightsNode );

		}

	}

	/**
	 * Renders the transparent objects from the given render lists.
	 *
	 * @private
	 * @param {Array<Object>} renderList - The transparent render list.
	 * @param {Array<Object>} doublePassList - The list of transparent objects which require a double pass (e.g. because of transmission).
	 * @param {Camera} camera - The camera the render list should be rendered with.
	 * @param {Scene} scene - The scene the render list belongs to.
	 * @param {LightsNode} lightsNode - The current lights node.
	 */
	_renderTransparents( renderList, doublePassList, camera, scene, lightsNode ) {

		if ( doublePassList.length > 0 ) {

			// render back side

			for ( const { material } of doublePassList ) {

				material.side = BackSide;

			}

			this._renderObjects( doublePassList, camera, scene, lightsNode, 'backSide' );

			// render front side

			for ( const { material } of doublePassList ) {

				material.side = FrontSide;

			}

			this._renderObjects( renderList, camera, scene, lightsNode );

			// restore

			for ( const { material } of doublePassList ) {

				material.side = DoubleSide;

			}

		} else {

			this._renderObjects( renderList, camera, scene, lightsNode );

		}

	}

	/**
	 * Renders the objects from the given render list.
	 *
	 * @private
	 * @param {Array<Object>} renderList - The render list.
	 * @param {Camera} camera - The camera the render list should be rendered with.
	 * @param {Scene} scene - The scene the render list belongs to.
	 * @param {LightsNode} lightsNode - The current lights node.
	 * @param {?string} [passId=null] - An optional ID for identifying the pass.
	 */
	_renderObjects( renderList, camera, scene, lightsNode, passId = null ) {

		for ( let i = 0, il = renderList.length; i < il; i ++ ) {

			const { object, geometry, material, group, clippingContext } = renderList[ i ];

			this._currentRenderObjectFunction( object, scene, camera, geometry, material, group, lightsNode, clippingContext, passId );

		}

	}

	/**
	 * This method represents the default render object function that manages the render lifecycle
	 * of the object.
	 *
	 * @param {Object3D} object - The 3D object.
	 * @param {Scene} scene - The scene the 3D object belongs to.
	 * @param {Camera} camera - The camera the object should be rendered with.
	 * @param {BufferGeometry} geometry - The object's geometry.
	 * @param {Material} material - The object's material.
	 * @param {?Object} group - Only relevant for objects using multiple materials. This represents a group entry from the respective `BufferGeometry`.
	 * @param {LightsNode} lightsNode - The current lights node.
	 * @param {?ClippingContext} clippingContext - The clipping context.
	 * @param {?string} [passId=null] - An optional ID for identifying the pass.
	 */
	renderObject( object, scene, camera, geometry, material, group, lightsNode, clippingContext = null, passId = null ) {

		let overridePositionNode;
		let overrideColorNode;
		let overrideDepthNode;

		//

		object.onBeforeRender( this, scene, camera, geometry, material, group );

		//

		if ( material.allowOverride === true && scene.overrideMaterial !== null ) {

			const overrideMaterial = scene.overrideMaterial;

			if ( material.positionNode && material.positionNode.isNode ) {

				overridePositionNode = overrideMaterial.positionNode;
				overrideMaterial.positionNode = material.positionNode;

			}

			overrideMaterial.alphaTest = material.alphaTest;
			overrideMaterial.alphaMap = material.alphaMap;
			overrideMaterial.transparent = material.transparent || material.transmission > 0;

			if ( overrideMaterial.isShadowPassMaterial ) {

				overrideMaterial.side = material.shadowSide === null ? material.side : material.shadowSide;

				if ( material.depthNode && material.depthNode.isNode ) {

					overrideDepthNode = overrideMaterial.depthNode;
					overrideMaterial.depthNode = material.depthNode;

				}

				if ( material.castShadowNode && material.castShadowNode.isNode ) {

					overrideColorNode = overrideMaterial.colorNode;
					overrideMaterial.colorNode = material.castShadowNode;

				}

				if ( material.castShadowPositionNode && material.castShadowPositionNode.isNode ) {

					overridePositionNode = overrideMaterial.positionNode;
					overrideMaterial.positionNode = material.castShadowPositionNode;

				}

			}

			material = overrideMaterial;

		}

		//

		if ( material.transparent === true && material.side === DoubleSide && material.forceSinglePass === false ) {

			material.side = BackSide;
			this._handleObjectFunction( object, material, scene, camera, lightsNode, group, clippingContext, 'backSide' ); // create backSide pass id

			material.side = FrontSide;
			this._handleObjectFunction( object, material, scene, camera, lightsNode, group, clippingContext, passId ); // use default pass id

			material.side = DoubleSide;

		} else {

			this._handleObjectFunction( object, material, scene, camera, lightsNode, group, clippingContext, passId );

		}

		//

		if ( overridePositionNode !== undefined ) {

			scene.overrideMaterial.positionNode = overridePositionNode;

		}

		if ( overrideDepthNode !== undefined ) {

			scene.overrideMaterial.depthNode = overrideDepthNode;

		}

		if ( overrideColorNode !== undefined ) {

			scene.overrideMaterial.colorNode = overrideColorNode;

		}

		//

		object.onAfterRender( this, scene, camera, geometry, material, group );

	}

	/**
	 * This method represents the default `_handleObjectFunction` implementation which creates
	 * a render object from the given data and performs the draw command with the selected backend.
	 *
	 * @private
	 * @param {Object3D} object - The 3D object.
	 * @param {Material} material - The object's material.
	 * @param {Scene} scene - The scene the 3D object belongs to.
	 * @param {Camera} camera - The camera the object should be rendered with.
	 * @param {LightsNode} lightsNode - The current lights node.
	 * @param {?{start: number, count: number}} group - Only relevant for objects using multiple materials. This represents a group entry from the respective `BufferGeometry`.
	 * @param {ClippingContext} clippingContext - The clipping context.
	 * @param {string} [passId] - An optional ID for identifying the pass.
	 */
	_renderObjectDirect( object, material, scene, camera, lightsNode, group, clippingContext, passId ) {

		const renderObject = this._objects.get( object, material, scene, camera, lightsNode, this._currentRenderContext, clippingContext, passId );
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

			renderObject.bundle = this._currentRenderBundle.bundleGroup;

		}

		this.backend.draw( renderObject, this.info );

		if ( needsRefresh ) this._nodes.updateAfter( renderObject );

	}

	/**
	 * A different implementation for `_handleObjectFunction` which only makes sure the object is ready for rendering.
	 * Used in `compileAsync()`.
	 *
	 * @private
	 * @param {Object3D} object - The 3D object.
	 * @param {Material} material - The object's material.
	 * @param {Scene} scene - The scene the 3D object belongs to.
	 * @param {Camera} camera - The camera the object should be rendered with.
	 * @param {LightsNode} lightsNode - The current lights node.
	 * @param {?{start: number, count: number}} group - Only relevant for objects using multiple materials. This represents a group entry from the respective `BufferGeometry`.
	 * @param {ClippingContext} clippingContext - The clipping context.
	 * @param {string} [passId] - An optional ID for identifying the pass.
	 */
	_createObjectPipeline( object, material, scene, camera, lightsNode, group, clippingContext, passId ) {

		const renderObject = this._objects.get( object, material, scene, camera, lightsNode, this._currentRenderContext, clippingContext, passId );
		renderObject.drawRange = object.geometry.drawRange;
		renderObject.group = group;

		//

		this._nodes.updateBefore( renderObject );

		this._geometries.updateForRender( renderObject );

		this._nodes.updateForRender( renderObject );
		this._bindings.updateForRender( renderObject );

		this._pipelines.getForRender( renderObject, this._compilationPromises );

		this._nodes.updateAfter( renderObject );

	}

	/**
	 * Alias for `compileAsync()`.
	 *
	 * @method
	 * @param {Object3D} scene - The scene or 3D object to precompile.
	 * @param {Camera} camera - The camera that is used to render the scene.
	 * @param {Scene} targetScene - If the first argument is a 3D object, this parameter must represent the scene the 3D object is going to be added.
	 * @return {function(Object3D, Camera, ?Scene): Promise|undefined} A Promise that resolves when the compile has been finished.
	 */
	get compile() {

		return this.compileAsync;

	}

}

export default Renderer;
