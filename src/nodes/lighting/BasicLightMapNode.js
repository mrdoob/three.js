import LightingNode from './LightingNode.js';
import { float } from '../tsl/TSLBase.js';

/**
 * A specific version of {@link IrradianceNode} that is only relevant
 * for {@link MeshBasicNodeMaterial}. Since the material is unlit, it
 * requires a special scaling factor for the light map.
 *
 * @augments LightingNode
 */
class BasicLightMapNode extends LightingNode {

	static get type() {

		return 'BasicLightMapNode';

	}

	/**
	 * Constructs a new basic light map node.
	 *
	 * @param {?Node<vec3>} [lightMapNode=null] - The light map node.
	 */
	constructor( lightMapNode = null ) {

		super();

		/**
		 * The light map node.
		 *
		 * @type {?Node<vec3>}
		 */
		this.lightMapNode = lightMapNode;

	}

	setup( builder ) {

		// irradianceLightMap property is used in the indirectDiffuse() method of BasicLightingModel

		const RECIPROCAL_PI = float( 1 / Math.PI );

		builder.context.irradianceLightMap = this.lightMapNode.mul( RECIPROCAL_PI );

	}

}

export default BasicLightMapNode;
