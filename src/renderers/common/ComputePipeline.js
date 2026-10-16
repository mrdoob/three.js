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
	 * @param {?Array<Object>} [transforms=null] - The transforms (only relevant for WebGL 2 which uses Transform Feedback).
	 * @param {?Array<Object>} [attributes=null] - The attributes (only relevant for WebGL 2 which uses Transform Feedback).
	 */
	constructor( cacheKey, computeProgram, transforms = null, attributes = null ) {

		super( cacheKey );

		/**
		 * The pipeline's compute shader.
		 *
		 * @type {ProgrammableStage}
		 */
		this.computeProgram = computeProgram;

		/**
		 * The transforms (only relevant for WebGL 2 which uses Transform Feedback).
		 *
		 * @type {?Array<Object>}
		 */
		this.transforms = transforms;

		/**
		 * The attributes (only relevant for WebGL 2 which uses Transform Feedback).
		 *
		 * @type {?Array<Object>}
		 */
		this.attributes = attributes;

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
