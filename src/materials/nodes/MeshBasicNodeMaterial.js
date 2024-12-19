import NodeMaterial from './NodeMaterial.js';
import { materialLightMap } from '../../nodes/accessors/MaterialNode.js';
import BasicEnvironmentNode from '../../nodes/lighting/BasicEnvironmentNode.js';
import BasicLightMapNode from '../../nodes/lighting/BasicLightMapNode.js';
import BasicLightingModel from '../../nodes/functions/BasicLightingModel.js';
import { normalView } from '../../nodes/accessors/Normal.js';
import { diffuseColor } from '../../nodes/core/PropertyNode.js';

import { MeshBasicMaterial } from '../MeshBasicMaterial.js';

const _defaultValues = /*@__PURE__*/ new MeshBasicMaterial();

/**
 * Node material version of `MeshBasicMaterial`.
 *
 * @augments NodeMaterial
 */
class MeshBasicNodeMaterial extends NodeMaterial {

	static get type() {

		return 'MeshBasicNodeMaterial';

	}

	/**
	 * Constructs a new mesh basic node material.
	 *
	 * @param {Object?} parameters - The configuration parameter.
	 */
	constructor( parameters ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isMeshBasicNodeMaterial = true;

		/**
		 * Although the basic material is by definition unlit, we set
		 * this property to `true` since we use a lighting model to compute
		 * the outgoing light of the fragment shader.
		 *
		 * @type {Boolean}
		 * @default true
		 */
		this.lights = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	/**
	 * Basic materials are not affected by normal and bump maps so we
	 * return by default {@link module:Normal.normalView}.
	 *
	 * @return {Node<vec3>} The normal node.
	 */
	setupNormal() {

		return normalView; // see #28839

	}

	/**
	 * Overwritten since this type of material uses {@link BasicEnvironmentNode}
	 * to implement the default environment mapping.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {BasicEnvironmentNode<vec3>?} The environment node.
	 */
	setupEnvironment( builder ) {

		const envNode = super.setupEnvironment( builder );

		return envNode ? new BasicEnvironmentNode( envNode ) : null;

	}

	/**
	 * This method must be overwriten since light maps are evaluated
	 * with a special scaling factor for basic materials.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {BasicLightMapNode<vec3>?} The light map node.
	 */
	setupLightMap( builder ) {

		let node = null;

		if ( builder.material.lightMap ) {

			node = new BasicLightMapNode( materialLightMap );

		}

		return node;

	}

	/**
	 * The material overwrites this method because `lights` is set to `true` but
	 * we still want to return the diffuse color as the outgoing light.
	 *
	 * @return {Node<vec3>} The outgoing light node.
	 */
	setupOutgoingLight() {

		return diffuseColor.rgb;

	}

	/**
	 * Setups the lighting model.
	 *
	 * @return {BasicLightingModel} The lighting model.
	 */
	setupLightingModel() {

		return new BasicLightingModel();

	}

}

export default MeshBasicNodeMaterial;
