import Sampler from '../Sampler.js';

class NodeSampler extends Sampler {

	constructor( name, textureNode ) {

		super( name, textureNode ? textureNode.value : null );

		this.textureNode = textureNode;

	}

	update() {

		if ( this.texture !== this.textureNode.value ) {

			this.texture = this.textureNode.value;

		}

	}

}

export default NodeSampler;
