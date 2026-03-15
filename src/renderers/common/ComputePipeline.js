import Pipeline from './Pipeline.js';

/**
 * Class for representing compute pipelines.
 *
 * @private
 * @augments Pipeline
 */
class ComputePipeline extends Pipeline {

	/**
	 * Constructs a new compute pipeline.
	 *
	 * @param {string} cacheKey - The pipeline's cache key.
	 * @param {ProgrammableStage} computeProgram - The pipeline's compute shader.
	 * @param {?number} count - The dispatch count (number of invocations). Used for bounds checking.
	 */
	constructor( cacheKey, computeProgram, count = null ) {

		super( cacheKey );

		/**
		 * The pipeline's compute shader.
		 *
		 * @type {ProgrammableStage}
		 */
		this.computeProgram = computeProgram;

		/**
		 * The dispatch count (number of invocations). When set, the generated WGSL
		 * shader includes bounds checking to prevent out-of-bounds buffer access
		 * from excess workgroup threads.
		 *
		 * @type {?number}
		 */
		this.count = count;

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
