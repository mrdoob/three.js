import Sampler from '../Sampler.js';

class WebGPUNodeSampler extends Sampler {

	constructor( name, textureNode ) {

		super( name, textureNode.value );

		this.textureNode = textureNode;

	}

	getTexture() {

		return this.textureNode.value;

	}

}

export default WebGPUNodeSampler;
