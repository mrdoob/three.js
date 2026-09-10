import LightingNode from './LightingNode.js';
import { cubeMapNode } from '../utils/CubeMapNode.js';
import { materialEnvRotation } from '../accessors/MaterialProperties.js';

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

		const { getUV, forceUVContext } = builder.context;

		// environment property is used in the finish() method of BasicLightingModel

		builder.context.environment = cubeMapNode( this.envNode ).context( {
			getUV: ( node, builder ) => {

				let uvNode = node.uvNode;

				if ( ( uvNode === null || forceUVContext === true ) && getUV ) {

					uvNode = getUV( node, builder );

				}

				return materialEnvRotation.mul( uvNode || node.getDefaultUV() );

			},
			forceUVContext: true
		} );

	}

}

export default BasicEnvironmentNode;
