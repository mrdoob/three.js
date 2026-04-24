import Sampler from '../Sampler.js';

/**
 * A special form of sampler binding type.
 * It's texture value is managed by a node object.
 *
 * @private
 * @augments Sampler
 */
class NodeSampler extends Sampler {

	/**
	 * Constructs a new node-based sampler.
	 *
	 * @param {string} name - The samplers's name.
	 * @param {TextureNode} textureNode - The texture node.
	 * @param {UniformGroupNode} groupNode - The uniform group node.
	 */
	constructor( name, textureNode, groupNode ) {

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

	}

	/**
	 * Updates the texture value of this sampler.
	 *
	 * @return {boolean} Whether the sampler needs an update or not.
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

export default NodeSampler;
