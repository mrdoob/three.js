import Sampler from '../Sampler.js';

class NodeSampler extends Sampler {

	constructor( name, textureNode ) {

		super( name, textureNode ? textureNode.value : null );

		this.textureNode = textureNode;

	}

}

export default NodeSampler;
