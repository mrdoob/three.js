import { SampledTexture } from '../SampledTexture.js';

class NodeSampledTexture extends SampledTexture {

	constructor( name, textureNode, access = null ) {

		super( name, textureNode ? textureNode.value : null );

		this.textureNode = textureNode;

		this.access = access;

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

	constructor( name, textureNode, access ) {

		super( name, textureNode, access );

		this.isSampledCubeTexture = true;

	}

}

class NodeSampledTexture3D extends NodeSampledTexture {

	constructor( name, textureNode, access ) {

		super( name, textureNode, access );

		this.isSampledTexture3D = true;

	}

}

export { NodeSampledTexture, NodeSampledCubeTexture, NodeSampledTexture3D };
