/**
 * This renderer module provides a series of statistical information
 * about the GPU memory and the rendering process. Useful for debugging
 * and monitoring.
 */
class Info {

	/**
	 * Constructs a new info component.
	 */
	constructor() {

		/**
		 * Whether frame related metrics should automatically
		 * be resetted or not. This property should be set to `false`
		 * by apps which manage their own animation loop. They must
		 * then call `renderer.info.reset()` once per frame manually.
		 *
		 * @type {Boolean}
		 * @default true
		 */
		this.autoReset = true;

		/**
		 * The current frame ID. This ID is managed
		 * by `NodeFrame`.
		 *
		 * @type {Number}
		 * @readonly
		 * @default 0
		 */
		this.frame = 0;

		/**
		 * The number of render calls since the
		 * app has been started.
		 *
		 * @type {Number}
		 * @readonly
		 * @default 0
		 */
		this.calls = 0;

		/**
		 * Render related metrics.
		 *
		 * @type {Object}
		 * @readonly
		 * @property {Number} calls - The number of render calls since the app has been started.
		 * @property {Number} frameCalls - The number of render calls of the current frame.
		 * @property {Number} drawCalls - The number of draw calls of the current frame.
		 * @property {Number} triangles - The number of rendered triangle primitives of the current frame.
		 * @property {Number} points - The number of rendered point primitives of the current frame.
		 * @property {Number} lines - The number of rendered line primitives of the current frame.
		 * @property {Number} previousFrameCalls - The number of render calls of the previous frame.
		 * @property {Number} timestamp - The timestamp of the frame when using `renderer.renderAsync()`.
		 * @property {Number} timestampCalls - The number of render calls using `renderer.renderAsync()`.
		 */
		this.render = {
			calls: 0,
			frameCalls: 0,
			drawCalls: 0,
			triangles: 0,
			points: 0,
			lines: 0,
			timestamp: 0,
			previousFrameCalls: 0,
			timestampCalls: 0
		};

		/**
		 * Compute related metrics.
		 *
		 * @type {Object}
		 * @readonly
		 * @property {Number} calls - The number of compute calls since the app has been started.
		 * @property {Number} frameCalls - The number of compute calls of the current frame.
		 * @property {Number} previousFrameCalls - The number of compute calls of the previous frame.
		 * @property {Number} timestamp - The timestamp of the frame when using `renderer.computeAsync()`.
		 * @property {Number} timestampCalls - The number of render calls using `renderer.computeAsync()`.
		 */
		this.compute = {
			calls: 0,
			frameCalls: 0,
			timestamp: 0,
			previousFrameCalls: 0,
			timestampCalls: 0
		};

		/**
		 * Memory related metrics.
		 *
		 * @type {Object}
		 * @readonly
		 * @property {Number} geometries - The number of active geometries.
		 * @property {Number} frameCalls - The number of active textures.
		 */
		this.memory = {
			geometries: 0,
			textures: 0
		};

	}

	/**
	 * This method should be executed per draw call and updates the corresponding metrics.
	 *
	 * @param {Object3D} object - The 3D object that is going to be rendered.
	 * @param {Number} count - The vertex or index count.
	 * @param {Number} instanceCount - The instance count.
	 */
	update( object, count, instanceCount ) {

		this.render.drawCalls ++;

		if ( object.isMesh || object.isSprite ) {

			this.render.triangles += instanceCount * ( count / 3 );

		} else if ( object.isPoints ) {

			this.render.points += instanceCount * count;

		} else if ( object.isLineSegments ) {

			this.render.lines += instanceCount * ( count / 2 );

		} else if ( object.isLine ) {

			this.render.lines += instanceCount * ( count - 1 );

		} else {

			console.error( 'THREE.WebGPUInfo: Unknown object type.' );

		}

	}

	/**
	 * Used by async render methods to updated timestamp metrics.
	 *
	 * @param {('render'|'compute')} type - The type of render call.
	 * @param {Number} time - The duration of the compute/render call in milliseconds.
	 */
	updateTimestamp( type, time ) {

		if ( this[ type ].timestampCalls === 0 ) {

			this[ type ].timestamp = 0;

		}


		this[ type ].timestamp += time;

		this[ type ].timestampCalls ++;


		if ( this[ type ].timestampCalls >= this[ type ].previousFrameCalls ) {

			this[ type ].timestampCalls = 0;

		}


	}

	/**
	 * Resets frame related metrics.
	 */
	reset() {

		const previousRenderFrameCalls = this.render.frameCalls;
		this.render.previousFrameCalls = previousRenderFrameCalls;

		const previousComputeFrameCalls = this.compute.frameCalls;
		this.compute.previousFrameCalls = previousComputeFrameCalls;


		this.render.drawCalls = 0;
		this.render.frameCalls = 0;
		this.compute.frameCalls = 0;

		this.render.triangles = 0;
		this.render.points = 0;
		this.render.lines = 0;


	}

	/**
	 * Performs a complete reset of the object.
	 */
	dispose() {

		this.reset();

		this.calls = 0;

		this.render.calls = 0;
		this.compute.calls = 0;

		this.render.timestamp = 0;
		this.compute.timestamp = 0;
		this.memory.geometries = 0;
		this.memory.textures = 0;

	}

}


export default Info;
