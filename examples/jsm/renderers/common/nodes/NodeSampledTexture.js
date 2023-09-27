import { SampledTexture, SampledCubeTexture } from '../SampledTexture.js';

class NodeSampledTexture extends SampledTexture {

	constructor( name, textureNode ) {

		super( name, textureNode ? textureNode.value : null );

		this.textureNode = textureNode;

	}

	getTexture() {

		return this.textureNode.value;

	}

}

class NodeSampledCubeTexture extends SampledCubeTexture {

	constructor( name, textureNode ) {

		super( name, textureNode ? textureNode.value : null );

		this.textureNode = textureNode;

	}

	getTexture() {

		return this.textureNode.value;

	}

}

export { NodeSampledTexture, NodeSampledCubeTexture };
