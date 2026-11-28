/**
 * Abstract class for representing pipelines.
 *
 * @private
 * @abstract
 */
class Pipeline {

	/**
	 * Constructs a new pipeline.
	 *
	 * @param {string} cacheKey - The pipeline's cache key.
	 */
	constructor( cacheKey ) {

		/**
		 * The pipeline's cache key.
		 *
		 * @type {string}
		 */
		this.cacheKey = cacheKey;

		/**
		 * How often the pipeline is currently in use.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.usedTimes = 0;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isPipeline = true;

	}

}

export default Pipeline;
