import Buffer from './Buffer.js';

class UniformBuffer extends Buffer {

	constructor( name, buffer = null ) {

		super( name, buffer );

		this.isUniformBuffer = true;

	}

}

export default UniformBuffer;
