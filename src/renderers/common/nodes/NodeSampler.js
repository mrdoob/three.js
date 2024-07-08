import Sampler from '../Sampler.js';

class NodeSampler extends Sampler {

	constructor( name, textureNode, groupNode ) {

		super( name, textureNode ? textureNode.value : null );

		this.textureNode = textureNode;
		this.groupNode = groupNode;

	}

	update() {

		this.texture = this.textureNode.value;

	}

}

export default NodeSampler;
