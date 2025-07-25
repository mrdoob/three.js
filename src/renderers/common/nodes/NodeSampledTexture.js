import { SampledTexture } from '../SampledTexture.js';

/**
 * A special form of sampled texture binding type.
 * It's texture value is managed by a node object.
 *
 * @private
 * @augments SampledTexture
 */
class NodeSampledTexture extends SampledTexture {

	/**
	 * Constructs a new node-based sampled texture.
	 *
	 * @param {string} name - The textures's name.
	 * @param {TextureNode} textureNode - The texture node.
	 * @param {UniformGroupNode} groupNode - The uniform group node.
	 * @param {?string} [access=null] - The access type.
	 */
	constructor( name, textureNode, groupNode, access = null ) {

		super( name, textureNode ? textureNode.value : null );

		/**
		 * The texture node.
		 *
		 * @type {TextureNode}
		 */
		this.textureNode = textureNode;

		/**
		 * The uniform group node.
		 *
		 * @type {UniformGroupNode}
		 */
		this.groupNode = groupNode;

		/**
		 * The access type.
		 *
		 * @type {?string}
		 * @default null
		 */
		this.access = access;

	}

	/**
	 * Updates the binding.
	 *
	 * @return {boolean} Whether the texture has been updated and must be
	 * uploaded to the GPU.
	 */
	update() {

		const { textureNode } = this;

		if ( this.texture !== textureNode.value ) {

			this.texture = textureNode.value;

			return true;

		}

		return super.update();

	}

}

/**
 * A special form of sampled cube texture binding type.
 * It's texture value is managed by a node object.
 *
 * @private
 * @augments NodeSampledTexture
 */
class NodeSampledCubeTexture extends NodeSampledTexture {

	/**
	 * Constructs a new node-based sampled cube texture.
	 *
	 * @param {string} name - The textures's name.
	 * @param {TextureNode} textureNode - The texture node.
	 * @param {UniformGroupNode} groupNode - The uniform group node.
	 * @param {?string} [access=null] - The access type.
	 */
	constructor( name, textureNode, groupNode, access = null ) {

		super( name, textureNode, groupNode, access );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSampledCubeTexture = true;

	}

}

/**
 * A special form of sampled 3D texture binding type.
 * It's texture value is managed by a node object.
 *
 * @private
 * @augments NodeSampledTexture
 */
class NodeSampledTexture3D extends NodeSampledTexture {

	/**
	 * Constructs a new node-based sampled 3D texture.
	 *
	 * @param {string} name - The textures's name.
	 * @param {TextureNode} textureNode - The texture node.
	 * @param {UniformGroupNode} groupNode - The uniform group node.
	 * @param {?string} [access=null] - The access type.
	 */
	constructor( name, textureNode, groupNode, access = null ) {

		super( name, textureNode, groupNode, access );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSampledTexture3D = true;

	}

}

export { NodeSampledTexture, NodeSampledCubeTexture, NodeSampledTexture3D };
