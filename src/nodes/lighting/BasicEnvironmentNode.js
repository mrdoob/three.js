import LightingNode from './LightingNode.js';
import { cubeMapNode } from '../utils/CubeMapNode.js';

/**
 * Represents a basic model for Image-based lighting (IBL). The environment
 * is defined via environment maps in the equirectangular or cube map format.
 * `BasicEnvironmentNode` is intended for non-PBR materials like {@link MeshBasicNodeMaterial}
 * or {@link MeshPhongNodeMaterial}.
 *
 * @augments LightingNode
 */
class BasicEnvironmentNode extends LightingNode {

	static get type() {

		return 'BasicEnvironmentNode';

	}

	/**
	 * Constructs a new basic environment node.
	 *
	 * @param {Node} [envNode=null] - A node representing the environment.
	 */
	constructor( envNode = null ) {

		super();

		/**
		 * A node representing the environment.
		 *
		 * @type {Node}
		 * @default null
		 */
		this.envNode = envNode;

	}

	setup( builder ) {

		// environment property is used in the finish() method of BasicLightingModel

		builder.context.environment = cubeMapNode( this.envNode );

	}

}

export default BasicEnvironmentNode;
