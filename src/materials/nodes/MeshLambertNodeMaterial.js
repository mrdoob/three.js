import NodeMaterial from './NodeMaterial.js';
import BasicEnvironmentNode from '../../nodes/lighting/BasicEnvironmentNode.js';
import PhongLightingModel from '../../nodes/functions/PhongLightingModel.js';

import { MeshLambertMaterial } from '../MeshLambertMaterial.js';

const _defaultValues = /*@__PURE__*/ new MeshLambertMaterial();

/**
 * Node material version of `MeshLambertMaterial`.
 *
 * @augments NodeMaterial
 */
class MeshLambertNodeMaterial extends NodeMaterial {

	static get type() {

		return 'MeshLambertNodeMaterial';

	}

	/**
	 * Constructs a new mesh lambert node material.
	 *
	 * @param {?Object} parameters - The configuration parameter.
	 */
	constructor( parameters ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isMeshLambertNodeMaterial = true;

		/**
		 * Set to `true` because lambert materials react on lights.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.lights = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	/**
	 * Overwritten since this type of material uses {@link BasicEnvironmentNode}
	 * to implement the default environment mapping.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {?BasicEnvironmentNode<vec3>} The environment node.
	 */
	setupEnvironment( builder ) {

		const envNode = super.setupEnvironment( builder );

		return envNode ? new BasicEnvironmentNode( envNode ) : null;

	}

	/**
	 * Setups the lighting model.
	 *
	 * @return {PhongLightingModel} The lighting model.
	 */
	setupLightingModel( /*builder*/ ) {

		return new PhongLightingModel( false ); // ( specular ) -> force lambert

	}

}

export default MeshLambertNodeMaterial;
