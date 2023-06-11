import Pipeline from './Pipeline.js';

class RenderPipeline extends Pipeline {

	constructor( cacheKey, vertexProgram, fragmentProgram ) {

		super( cacheKey );

		this.vertexProgram = vertexProgram;
		this.fragmentProgram = fragmentProgram;

	}

}

export default RenderPipeline;
