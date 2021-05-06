import { WebGPUSampledTexture } from '../WebGPUSampledTexture.js';

class WebGPUNodeSampledTexture extends WebGPUSampledTexture {

	constructor( name, textureNode ) {

		super( name, textureNode.value );

		this.textureNode = textureNode;

	}

	getTexture() {

		return this.textureNode.value;

	}

}

export { WebGPUNodeSampledTexture };
