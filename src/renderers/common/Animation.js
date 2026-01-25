
/**
 * This module manages the internal animation loop of the renderer.
 *
 * @private
 */
class Animation {

	/**
	 * Constructs a new animation loop management component.
	 *
	 * @param {Renderer} renderer - A reference to the main renderer.
	 * @param {Nodes} nodes - Renderer component for managing nodes related logic.
	 * @param {Info} info - Renderer component for managing metrics and monitoring data.
	 */
	constructor( renderer, nodes, info ) {

		/**
		 * A reference to the main renderer.
		 *
		 * @type {Renderer}
		 */
		this.renderer = renderer;

		/**
		 * Renderer component for managing nodes related logic.
		 *
		 * @type {Nodes}
		 */
		this.nodes = nodes;

		/**
		 * Renderer component for managing metrics and monitoring data.
		 *
		 * @type {Info}
		 */
		this.info = info;

		/**
		 * A reference to the context from `requestAnimationFrame()` can
		 * be called (usually `window`).
		 *
		 * @type {?(Window|XRSession)}
		 */
		this._context = typeof self !== 'undefined' ? self : null;

		/**
		 * The user-defined animation loop.
		 *
		 * @type {?Function}
		 * @default null
		 */
		this._animationLoop = null;

		/**
		 * The requestId which is returned from the `requestAnimationFrame()` call.
		 * Can be used to cancel the stop the animation loop.
		 *
		 * @type {?number}
		 * @default null
		 */
		this._requestId = null;

		/**
		 * The timestamp of the previous frame, used to calculate deltaTime.
		 *
		 * @type {?number}
		 * @default null
		 */
		this._previousTime = null;

	}

	/**
	 * Starts the internal animation loop.
	 */
	start() {

		const update = ( time, xrFrame ) => {

			this._requestId = this._context.requestAnimationFrame( update );

			if ( this.info.autoReset === true ) this.info.reset();

			this.nodes.nodeFrame.update();

			this.info.frame = this.nodes.nodeFrame.frameId;

			this.renderer._inspector.begin();

			// Calculate deltaTime (time since last frame)
			const deltaTime = this._previousTime !== null ? time - this._previousTime : 0;
			this._previousTime = time;

			if ( this._animationLoop !== null ) this._animationLoop( time, xrFrame, deltaTime );

			this.renderer._inspector.finish();

		};

		update();

	}

	/**
	 * Stops the internal animation loop.
	 */
	stop() {

		this._context.cancelAnimationFrame( this._requestId );

		this._requestId = null;
		this._previousTime = null;

	}

	/**
	 * Returns the user-level animation loop.
	 *
	 * @return {?Function} The animation loop.
	 */
	getAnimationLoop() {

		return this._animationLoop;

	}

	/**
	 * Defines the user-level animation loop.
	 *
	 * @param {?Function} callback - The animation loop.
	 */
	setAnimationLoop( callback ) {

		this._animationLoop = callback;

	}

	/**
	 * Returns the animation context.
	 *
	 * @return {Window|XRSession} The animation context.
	 */
	getContext() {

		return this._context;

	}

	/**
	 * Defines the context in which `requestAnimationFrame()` is executed.
	 *
	 * @param {Window|XRSession} context - The context to set.
	 */
	setContext( context ) {

		this._context = context;

	}

	/**
	 * Frees all internal resources and stops the animation loop.
	 */
	dispose() {

		this.stop();

	}

}

export default Animation;
