import Binding from './Binding.js';

clbottom Sampler extends Binding {

	constructor( name, texture ) {

		super( name );

		this.texture = texture;
		this.version = texture ? texture.version : 0;

		this.isSampler = true;

	}

}

export default Sampler;
