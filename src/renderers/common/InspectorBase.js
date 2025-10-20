/**
 * InspectorBase is the base class for all inspectors.
 *
 * @class InspectorBase
 */
class InspectorBase {

	/**
	 * Creates a new InspectorBase.
	 */
	constructor() {

		/**
		 * The renderer associated with this inspector.
		 *
		 * @type {WebGLRenderer}
		 * @private
		 */
		this._renderer = null;

		/**
		 * The current frame being processed.
		 *
		 * @type {Object}
		 */
		this.currentFrame = null;

	}

	/**
	 * Returns the node frame for the current renderer.
	 *
	 * @return {Object} The node frame.
	 */
	get nodeFrame() {

		return this._renderer._nodes.nodeFrame;

	}

	/**
	 * Sets the renderer for this inspector.
	 *
	 * @param {WebGLRenderer} renderer - The renderer to associate with this inspector.
	 * @return {InspectorBase} This inspector instance.
	 */
	setRenderer( renderer ) {

		this._renderer = renderer;

		return this;

	}

	/**
	 * Returns the renderer associated with this inspector.
	 *
	 * @return {WebGLRenderer} The associated renderer.
	 */
	getRenderer() {

		return this._renderer;

	}

	/**
	 * Initializes the inspector.
	 */
	init() { }

	/**
	 * Called when a frame begins.
	 */
	begin() { }

	/**
	 * Called when a frame ends.
	 */
	finish() { }

	/**
	 * Inspects a node.
	 *
	 * @param {Node} node - The node to inspect.
	 */
	inspect( /*node*/ ) { }

	/**
	 * When a compute operation is performed.
	 *
	 * @param {ComputeNode} computeNode - The compute node being executed.
	 * @param {number|Array<number>} dispatchSizeOrCount - The dispatch size or count.
	 */
	computeAsync( /*computeNode, dispatchSizeOrCount*/ ) { }

	/**
	 * Called when a compute operation begins.
	 *
	 * @param {string} uid - A unique identifier for the render context.
	 * @param {ComputeNode} computeNode - The compute node being executed.
	 */
	beginCompute( /*uid, computeNode*/ ) { }

	/**
	 * Called when a compute operation ends.
	 *
	 * @param {string} uid - A unique identifier for the render context.
	 * @param {ComputeNode} computeNode - The compute node being executed.
	 */
	finishCompute( /*uid*/ ) { }

	/**
	 * Called when a render operation begins.
	 *
	 * @param {string} uid - A unique identifier for the render context.
	 * @param {Scene} scene - The scene being rendered.
	 * @param {Camera} camera - The camera being used for rendering.
	 * @param {?WebGLRenderTarget} renderTarget - The render target, if any.
	 */
	beginRender( /*uid, scene, camera, renderTarget*/ ) { }

	/**
	 * Called when an animation loop ends.
	 *
	 * @param {string} uid - A unique identifier for the render context.
	 */
	finishRender( /*uid*/ ) { }

	/**
	 * Called when a texture copy operation is performed.
	 *
	 * @param {Texture} srcTexture - The source texture.
	 * @param {Texture} dstTexture - The destination texture.
	 */
	copyTextureToTexture( /*srcTexture, dstTexture*/ ) { }

	/**
	 * Called when a framebuffer copy operation is performed.
	 *
	 * @param {Texture} framebufferTexture - The texture associated with the framebuffer.
	 */
	copyFramebufferToTexture( /*framebufferTexture*/ ) { }

}

export default InspectorBase;
