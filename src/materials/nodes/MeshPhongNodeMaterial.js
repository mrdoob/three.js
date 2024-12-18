import NodeMaterial from './NodeMaterial.js';
import { shininess, specularColor } from '../../nodes/core/PropertyNode.js';
import { materialShininess, materialSpecular } from '../../nodes/accessors/MaterialNode.js';
import { float } from '../../nodes/tsl/TSLBase.js';
import BasicEnvironmentNode from '../../nodes/lighting/BasicEnvironmentNode.js';
import PhongLightingModel from '../../nodes/functions/PhongLightingModel.js';

import { MeshPhongMaterial } from '../MeshPhongMaterial.js';

const _defaultValues = /*@__PURE__*/ new MeshPhongMaterial();

/**
 * Node material version of `MeshPhongMaterial`.
 *
 * @augments NodeMaterial
 */
class MeshPhongNodeMaterial extends NodeMaterial {

	static get type() {

		return 'MeshPhongNodeMaterial';

	}

	/**
	 * Constructs a new mesh lambert node material.
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
		this.isMeshPhongNodeMaterial = true;

		/**
		 * Set to `true` because phong materials react on lights.
		 *
		 * @type {Boolean}
		 * @default true
		 */
		this.lights = true;

		/**
		 * The shininess of phong materials is by default inferred from the `shininess`
		 * property. This node property allows to overwrite the default
		 * and define the shininess with a node instead.
		 *
		 * If you don't want to overwrite the shininess but modify the existing
		 * value instead, use {@link module:MaterialNode.materialShininess}.
		 *
		 * @type {Node<float>?}
		 * @default null
		 */
		this.shininessNode = null;

		/**
		 * The specular color of phong materials is by default inferred from the
		 * `specular` property. This node property allows to overwrite the default
		 * and define the specular color with a node instead.
		 *
		 * If you don't want to overwrite the specular color but modify the existing
		 * value instead, use {@link module:MaterialNode.materialSpecular}.
		 *
		 * @type {Node<vec3>?}
		 * @default null
		 */
		this.specularNode = null;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

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
	 * Setups the lighting model.
	 *
	 * @return {PhongLightingModel} The lighting model.
	 */
	setupLightingModel( /*builder*/ ) {

		return new PhongLightingModel();

	}

	/**
	 * Setups the phong specific node variables.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setupVariants( /*builder*/ ) {

		// SHININESS

		const shininessNode = ( this.shininessNode ? float( this.shininessNode ) : materialShininess ).max( 1e-4 ); // to prevent pow( 0.0, 0.0 )

		shininess.assign( shininessNode );

		// SPECULAR COLOR

		const specularNode = this.specularNode || materialSpecular;

		specularColor.assign( specularNode );

	}

	copy( source ) {

		this.shininessNode = source.shininessNode;
		this.specularNode = source.specularNode;

		return super.copy( source );

	}

}

export default MeshPhongNodeMaterial;
