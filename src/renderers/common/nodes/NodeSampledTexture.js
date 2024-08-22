import { SampledTexture } from '../SampledTexture.js';

class NodeSampledTexture extends SampledTexture {

	constructor( name, textureNode, groupNode, access = null ) {

		super( name, textureNode ? textureNode.value : null );

		this.textureNode = textureNode;
		this.groupNode = groupNode;

		this.access = access;

	}

	needsBindingsUpdate( generation ) {

		return this.textureNode.value !== this.texture || super.needsBindingsUpdate( generation );

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

	constructor( name, textureNode, groupNode, access ) {

		super( name, textureNode, groupNode, access );

		this.isSampledCubeTexture = true;

	}

}

class NodeSampledTexture3D extends NodeSampledTexture {

	constructor( name, textureNode, groupNode, access ) {

		super( name, textureNode, groupNode, access );

		this.isSampledTexture3D = true;

	}

}

export { NodeSampledTexture, NodeSampledCubeTexture, NodeSampledTexture3D };
