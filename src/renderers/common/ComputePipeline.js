import Pipeline from './Pipeline.js';

/**
 * Class for representing compute pipelines.
 *
 * @private
 * @augments Pipeline
 */
class ComputePipeline extends Pipeline {

	/**
	 * Constructs a new render pipeline.
	 *
	 * @param {string} cacheKey - The pipeline's cache key.
	 * @param {ProgrammableStage} computeProgram - The pipeline's compute shader.
	 */
	constructor( cacheKey, computeProgram ) {

		super( cacheKey );

		/**
		 * The pipeline's compute shader.
		 *
		 * @type {ProgrammableStage}
		 */
		this.computeProgram = computeProgram;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isComputePipeline = true;

	}

}

export default ComputePipeline;
