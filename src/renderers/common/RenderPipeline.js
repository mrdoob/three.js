import Pipeline from './Pipeline.js';

/**
 * Class for representing render pipelines.
 *
 * @private
 * @augments Pipeline
 */
class RenderPipeline extends Pipeline {

	/**
	 * Constructs a new render pipeline.
	 *
	 * @param {String} cacheKey - The pipeline's cache key.
	 * @param {ProgrammableStage} vertexProgram - The pipeline's vertex shader.
	 * @param {ProgrammableStage} fragmentProgram - The pipeline's fragment shader.
	 */
	constructor( cacheKey, vertexProgram, fragmentProgram ) {

		super( cacheKey );

		/**
		 * The pipeline's vertex shader.
		 *
		 * @type {ProgrammableStage}
		 */
		this.vertexProgram = vertexProgram;

		/**
		 * The pipeline's fragment shader.
		 *
		 * @type {ProgrammableStage}
		 */
		this.fragmentProgram = fragmentProgram;

	}

}

export default RenderPipeline;
