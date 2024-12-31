let _vector2 = null;
let _color4 = null;

import Color4 from './Color4.js';
import { Vector2 } from '../../math/Vector2.js';
import { createCanvasElement } from '../../utils.js';
import { REVISION } from '../../constants.js';

/**
 * Most of the rendering related logic is implemented in the
 * {@link module:Renderer} module and related management components.
 * Sometimes it is required though to execute commands which are
 * specific to the current 3D backend (which is WebGPU or WebGL 2).
 * This abstract base class defines an interface that encapsulates
 * all backend-related logic. Derived classes for each backend must
 * implement the interface.
 *
 * @abstract
 * @private
 */
class Backend {

	/**
	 * Constructs a new backend.
	 *
	 * @param {Object} parameters - An object holding parameters for the backend.
	 */
	constructor( parameters = {} ) {

		/**
		 * The parameters of the backend.
		 *
		 * @type {Object}
		 */
		this.parameters = Object.assign( {}, parameters );

		/**
		 * This weak map holds backend-specific data of objects
		 * like textures, attributes or render targets.
		 *
		 * @type {WeakMap}
		 */
		this.data = new WeakMap();

		/**
		 * A reference to the renderer.
		 *
		 * @type {Renderer?}
		 * @default null
		 */
		this.renderer = null;

		/**
		 * A reference to the canvas element the renderer is drawing to.
		 *
		 * @type {(HTMLCanvasElement|OffscreenCanvas)?}
		 * @default null
		 */
		this.domElement = null;

	}

	/**
	 * Initializes the backend so it is ready for usage. Concrete backends
	 * are supposed to implement their rendering context creation and related
	 * operations in this method.
	 *
	 * @async
	 * @param {Renderer} renderer - The renderer.
	 * @return {Promise} A Promise that resolves when the backend has been initialized.
	 */
	async init( renderer ) {

		this.renderer = renderer;

	}

	/**
	 * The coordinate system of the backend.
	 *
	 * @abstract
	 * @type {Number}
	 * @readonly
	 */
	get coordinateSystem() {}

	// render context

	/**
	 * This method is executed at the beginning of a render call and
	 * can be used by the backend to prepare the state for upcoming
	 * draw calls.
	 *
	 * @abstract
	 * @param {RenderContext} renderContext - The render context.
	 */
	beginRender( /*renderContext*/ ) {}

	/**
	 * This method is executed at the end of a render call and
	 * can be used by the backend to finalize work after draw
	 * calls.
	 *
	 * @abstract
	 * @param {RenderContext} renderContext - The render context.
	 */
	finishRender( /*renderContext*/ ) {}

	/**
	 * This method is executed at the beginning of a compute call and
	 * can be used by the backend to prepare the state for upcoming
	 * compute tasks.
	 *
	 * @abstract
	 * @param {Node|Array<Node>} computeGroup - The compute node(s).
	 */
	beginCompute( /*computeGroup*/ ) {}

	/**
	 * This method is executed at the end of a compute call and
	 * can be used by the backend to finalize work after compute
	 * tasks.
	 *
	 * @abstract
	 * @param {Node|Array<Node>} computeGroup - The compute node(s).
	 */
	finishCompute( /*computeGroup*/ ) {}

	// render object

	/**
	 * Executes a draw command for the given render object.
	 *
	 * @abstract
	 * @param {RenderObject} renderObject - The render object to draw.
	 * @param {Info} info - Holds a series of statistical information about the GPU memory and the rendering process.
	 */
	draw( /*renderObject, info*/ ) { }

	// compute node

	/**
	 * Executes a compute command for the given compute node.
	 *
	 * @abstract
	 * @param {Node|Array<Node>} computeGroup - The group of compute nodes of a compute call. Can be a single compute node.
	 * @param {Node} computeNode - The compute node.
	 * @param {Array<BindGroup>} bindings - The bindings.
	 * @param {ComputePipeline} computePipeline - The compute pipeline.
	 */
	compute( /*computeGroup, computeNode, computeBindings, computePipeline*/ ) { }

	// program

	/**
	 * Creates a shader program from the given programmable stage.
	 *
	 * @abstract
	 * @param {ProgrammableStage} program - The programmable stage.
	 */
	createProgram( /*program*/ ) { }

	/**
	 * Destroys the shader program of the given programmable stage.
	 *
	 * @abstract
	 * @param {ProgrammableStage} program - The programmable stage.
	 */
	destroyProgram( /*program*/ ) { }

	// bindings

	/**
	 * Creates bindings from the given bind group definition.
	 *
	 * @abstract
	 * @param {BindGroup} bindGroup - The bind group.
	 * @param {Array<BindGroup>} bindings - Array of bind groups.
	 * @param {Number} cacheIndex - The cache index.
	 * @param {Number} version - The version.
	 */
	createBindings( /*bindGroup, bindings, cacheIndex, version*/ ) { }

	/**
	 * Updates the given bind group definition.
	 *
	 * @abstract
	 * @param {BindGroup} bindGroup - The bind group.
	 * @param {Array<BindGroup>} bindings - Array of bind groups.
	 * @param {Number} cacheIndex - The cache index.
	 * @param {Number} version - The version.
	 */
	updateBindings( /*bindGroup, bindings, cacheIndex, version*/ ) { }

	/**
	 * Updates a buffer binding.
	 *
	 * @abstract
	 * @param {Buffer} binding - The buffer binding to update.
	 */
	updateBinding( /*binding*/ ) { }

	// pipeline

	/**
	 * Creates a render pipeline for the given render object.
	 *
	 * @abstract
	 * @param {RenderObject} renderObject - The render object.
	 * @param {Array<Promise>} promises - An array of compilation promises which are used in `compileAsync()`.
	 */
	createRenderPipeline( /*renderObject, promises*/ ) { }

	/**
	 * Creates a compute pipeline for the given compute node.
	 *
	 * @abstract
	 * @param {ComputePipeline} computePipeline - The compute pipeline.
	 * @param {Array<BindGroup>} bindings - The bindings.
	 */
	createComputePipeline( /*computePipeline, bindings*/ ) { }

	// cache key

	/**
	 * Returns `true` if the render pipeline requires an update.
	 *
	 * @abstract
	 * @param {RenderObject} renderObject - The render object.
	 * @return {Boolean} Whether the render pipeline requires an update or not.
	 */
	needsRenderUpdate( /*renderObject*/ ) { }

	/**
	 * Returns a cache key that is used to identify render pipelines.
	 *
	 * @abstract
	 * @param {RenderObject} renderObject - The render object.
	 * @return {String} The cache key.
	 */
	getRenderCacheKey( /*renderObject*/ ) { }

	// node builder

	/**
	 * Returns a node builder for the given render object.
	 *
	 * @abstract
	 * @param {RenderObject} renderObject - The render object.
	 * @param {Renderer} renderer - The renderer.
	 * @return {NodeBuilder} The node builder.
	 */
	createNodeBuilder( /*renderObject, renderer*/ ) { }

	// textures

	/**
	 * Creates a GPU sampler for the given texture.
	 *
	 * @abstract
	 * @param {Texture} texture - The texture to create the sampler for.
	 */
	createSampler( /*texture*/ ) { }

	/**
	 * Destroys the GPU sampler for the given texture.
	 *
	 * @abstract
	 * @param {Texture} texture - The texture to destroy the sampler for.
	 */
	destroySampler( /*texture*/ ) {}

	/**
	 * Creates a default texture for the given texture that can be used
	 * as a placeholder until the actual texture is ready for usage.
	 *
	 * @abstract
	 * @param {Texture} texture - The texture to create a default texture for.
	 */
	createDefaultTexture( /*texture*/ ) { }

	/**
	 * Defines a texture on the GPU for the given texture object.
	 *
	 * @abstract
	 * @param {Texture} texture - The texture.
	 * @param {Object} [options={}] - Optional configuration parameter.
	 */
	createTexture( /*texture, options={}*/ ) { }

	/**
	 * Uploads the updated texture data to the GPU.
	 *
	 * @abstract
	 * @param {Texture} texture - The texture.
	 * @param {Object} [options={}] - Optional configuration parameter.
	 */
	updateTexture( /*texture, options = {}*/ ) { }

	/**
	 * Generates mipmaps for the given texture.
	 *
	 * @abstract
	 * @param {Texture} texture - The texture.
	 */
	generateMipmaps( /*texture*/ ) { }

	/**
	 * Destroys the GPU data for the given texture object.
	 *
	 * @abstract
	 * @param {Texture} texture - The texture.
	 */
	destroyTexture( /*texture*/ ) { }

	/**
	 * Returns texture data as a typed array.
	 *
	 * @abstract
	 * @param {Texture} texture - The texture to copy.
	 * @param {Number} x - The x coordinate of the copy origin.
	 * @param {Number} y - The y coordinate of the copy origin.
	 * @param {Number} width - The width of the copy.
	 * @param {Number} height - The height of the copy.
	 * @param {Number} faceIndex - The face index.
	 * @return {TypedArray} The texture data as a typed array.
	 */
	copyTextureToBuffer( /*texture, x, y, width, height, faceIndex*/ ) {}

	/**
	 * Copies data of the given source texture to the given destination texture.
	 *
	 * @abstract
	 * @param {Texture} srcTexture - The source texture.
	 * @param {Texture} dstTexture - The destination texture.
	 * @param {Vector4?} [srcRegion=null] - The region of the source texture to copy.
	 * @param {(Vector2|Vector3)?} [dstPosition=null] - The destination position of the copy.
	 * @param {Number} [level=0] - The mip level to copy.
	 */
	copyTextureToTexture( /*srcTexture, dstTexture, srcRegion = null, dstPosition = null, level = 0*/ ) {}

	/**
	* Copies the current bound framebuffer to the given texture.
	*
	* @abstract
	* @param {Texture} texture - The destination texture.
	* @param {RenderContext} renderContext - The render context.
	* @param {Vector4} rectangle - A four dimensional vector defining the origin and dimension of the copy.
	*/
	copyFramebufferToTexture( /*texture, renderContext, rectangle*/ ) {}

	// attributes

	/**
	 * Creates the GPU buffer of a shader attribute.
	 *
	 * @abstract
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 */
	createAttribute( /*attribute*/ ) { }

	/**
	 * Creates the GPU buffer of an indexed shader attribute.
	 *
	 * @abstract
	 * @param {BufferAttribute} attribute - The indexed buffer attribute.
	 */
	createIndexAttribute( /*attribute*/ ) { }

	/**
	 * Creates the GPU buffer of a storage attribute.
	 *
	 * @abstract
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 */
	createStorageAttribute( /*attribute*/ ) { }

	/**
	 * Updates the GPU buffer of a shader attribute.
	 *
	 * @abstract
	 * @param {BufferAttribute} attribute - The buffer attribute to update.
	 */
	updateAttribute( /*attribute*/ ) { }

	/**
	 * Destroys the GPU buffer of a shader attribute.
	 *
	 * @abstract
	 * @param {BufferAttribute} attribute - The buffer attribute to destroy.
	 */
	destroyAttribute( /*attribute*/ ) { }

	// canvas

	/**
	 * Returns the backend's rendering context.
	 *
	 * @abstract
	 * @return {Object} The rendering context.
	 */
	getContext() { }

	/**
	 * Backends can use this method if they have to run
	 * logic when the renderer gets resized.
	 *
	 * @abstract
	 */
	updateSize() { }

	/**
	 * Updates the viewport with the values from the given render context.
	 *
	 * @abstract
	 * @param {RenderContext} renderContext - The render context.
	 */
	updateViewport( /*renderContext*/ ) {}

	// utils

	/**
	 * Returns `true` if the given 3D object is fully occluded by other
	 * 3D objects in the scene. Backends must implement this method by using
	 * a Occlusion Query API.
	 *
	 * @abstract
	 * @param {RenderContext} renderContext - The render context.
	 * @param {Object3D} object - The 3D object to test.
	 * @return {Boolean} Whether the 3D object is fully occluded or not.
	 */
	isOccluded( /*renderContext, object*/ ) {}

	/**
	 * Resolves the time stamp for the given render context and type.
	 *
	 * @async
	 * @abstract
	 * @param {RenderContext} renderContext - The render context.
	 * @param {String} type - The render context.
	 * @return {Promise} A Promise that resolves when the time stamp has been computed.
	 */
	async resolveTimestampAsync( /*renderContext, type*/ ) { }

	/**
	 * Can be used to synchronize CPU operations with GPU tasks. So when this method is called,
	 * the CPU waits for the GPU to complete its operation (e.g. a compute task).
	 *
	 * @async
	 * @abstract
	 * @return {Promise} A Promise that resolves when synchronization has been finished.
	 */
	async waitForGPU() {}

	/**
	 * Checks if the given feature is supported by the backend.
	 *
	 * @async
	 * @abstract
	 * @param {String} name - The feature's name.
	 * @return {Promise<Boolean>} A Promise that resolves with a bool that indicates whether the feature is supported or not.
	 */
	async hasFeatureAsync( /*name*/ ) { }

	/**
	 * Checks if the given feature is supported  by the backend.
	 *
	 * @abstract
	 * @param {String} name - The feature's name.
	 * @return {Boolean} Whether the feature is supported or not.
	 */
	hasFeature( /*name*/ ) {}

	/**
	 * Returns the maximum anisotropy texture filtering value.
	 *
	 * @abstract
	 * @return {Number} The maximum anisotropy texture filtering value.
	 */
	getMaxAnisotropy() {}

	/**
	 * Returns the drawing buffer size.
	 *
	 * @return {Vector2} The drawing buffer size.
	 */
	getDrawingBufferSize() {

		_vector2 = _vector2 || new Vector2();

		return this.renderer.getDrawingBufferSize( _vector2 );

	}

	/**
	 * Defines the scissor test.
	 *
	 * @abstract
	 * @param {Boolean} boolean - Whether the scissor test should be enabled or not.
	 */
	setScissorTest( /*boolean*/ ) { }

	/**
	 * Returns the clear color and alpha into a single
	 * color object.
	 *
	 * @return {Color4} The clear color.
	 */
	getClearColor() {

		const renderer = this.renderer;

		_color4 = _color4 || new Color4();

		renderer.getClearColor( _color4 );

		_color4.getRGB( _color4, this.renderer.currentColorSpace );

		return _color4;

	}

	/**
	 * Returns the DOM element. If no DOM element exists, the backend
	 * creates a new one.
	 *
	 * @return {HTMLCanvasElement} The DOM element.
	 */
	getDomElement() {

		let domElement = this.domElement;

		if ( domElement === null ) {

			domElement = ( this.parameters.canvas !== undefined ) ? this.parameters.canvas : createCanvasElement();

			// OffscreenCanvas does not have setAttribute, see #22811
			if ( 'setAttribute' in domElement ) domElement.setAttribute( 'data-engine', `three.js r${REVISION} webgpu` );

			this.domElement = domElement;

		}

		return domElement;

	}

	/**
	 * Sets a dictionary for the given object into the
	 * internal data structure.
	 *
	 * @param {Object} object - The object.
	 * @param {Object} value - The dictionary to set.
	 */
	set( object, value ) {

		this.data.set( object, value );

	}

	/**
	 * Returns the dictionary for the given object.
	 *
	 * @param {Object} object - The object.
	 * @return {Object} The object's dictionary.
	 */
	get( object ) {

		let map = this.data.get( object );

		if ( map === undefined ) {

			map = {};
			this.data.set( object, map );

		}

		return map;

	}

	/**
	 * Checks if the given object has a dictionary
	 * with data defined.
	 *
	 * @param {Object} object - The object.
	 * @return {Boolean} Whether a dictionary for the given object as been defined or not.
	 */
	has( object ) {

		return this.data.has( object );

	}

	/**
	 * Deletes an object from the internal data structure.
	 *
	 * @param {Object} object - The object to delete.
	 */
	delete( object ) {

		this.data.delete( object );

	}

	/**
	 * Frees internal resources.
	 *
	 * @abstract
	 */
	dispose() { }

}

export default Backend;
