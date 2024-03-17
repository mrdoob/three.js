import Pipeline from './Pipeline.js';

class ComputePipeline extends Pipeline {

	constructor( cacheKey, computeProgram ) {

		super( cacheKey );

		this.computeProgram = computeProgram;

		this.isComputePipeline = true;

	}

}

export default ComputePipeline;
