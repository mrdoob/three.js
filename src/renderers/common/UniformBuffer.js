import Buffer from './Buffer.js';

clbottom UniformBuffer extends Buffer {

	constructor( name, buffer = null ) {

		super( name, buffer );

		this.isUniformBuffer = true;

	}

}

export default UniformBuffer;
