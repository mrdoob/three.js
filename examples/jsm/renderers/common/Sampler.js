import Binding from './Binding.js';

class Sampler extends Binding {

	constructor( name, texture ) {

		super( name );

		this.texture = texture;
		this.version = texture.version;

		this.isSampler = true;

	}

}

export default Sampler;
