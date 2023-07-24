import Sampler from '../Sampler.js';

class NodeSampler extends Sampler {

	constructor( name, textureNode ) {

		super( name, textureNode.value );

		this.textureNode = textureNode;

	}

	getTexture() {

		return this.textureNode.value;

	}

}

export default NodeSampler;
