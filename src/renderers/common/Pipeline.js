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
	 * @param {String} cacheKey - The pipeline's cache key.
	 */
	constructor( cacheKey ) {

		/**
		 * The pipeline's cache key.
		 *
		 * @type {String}
		 */
		this.cacheKey = cacheKey;

		/**
		 * How often the pipeline is currently in use.
		 *
		 * @type {Number}
		 * @default 0
		 */
		this.usedTimes = 0;

	}

}

export default Pipeline;
