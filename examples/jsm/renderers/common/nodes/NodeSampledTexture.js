import { SampledTexture } from '../SampledTexture.js';

class NodeSampledTexture extends SampledTexture {

	constructor( name, textureNode ) {

		super( name, textureNode ? textureNode.value : null );

		this.textureNode = textureNode;

	}

	get needsBindingsUpdate() {

		return this.textureNode.value !== this.texture || super.needsBindingsUpdate;

	}

	update() {

		const { textureNode } = this;

		if ( this.texture !== textureNode.value ) {

			this.texture = textureNode.value;

			return true;

		}

		return super.update();

	}

}

class NodeSampledCubeTexture extends NodeSampledTexture {

	constructor( name, textureNode ) {

		super( name, textureNode );

		this.isSampledCubeTexture = true;

	}

}

export { NodeSampledTexture, NodeSampledCubeTexture };
