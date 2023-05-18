import Binding from './Binding.js';

class Sampler extends Binding {

	constructor( name, texture ) {

		super( name );

		this.texture = texture;
		this.version = 0;

		this.isSampler = true;

	}

}

export default Sampler;
