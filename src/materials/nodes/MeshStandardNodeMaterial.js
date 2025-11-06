import NodeMaterial from './NodeMaterial.js';
import { diffuseColor, diffuseContribution, metalness, roughness, specularColor, specularColorBlended, specularF90 } from '../../nodes/core/PropertyNode.js';
import { mix } from '../../nodes/math/MathNode.js';
import { materialRoughness, materialMetalness } from '../../nodes/accessors/MaterialNode.js';
import getRoughness from '../../nodes/functions/material/getRoughness.js';
import PhysicalLightingModel from '../../nodes/functions/PhysicalLightingModel.js';
import EnvironmentNode from '../../nodes/lighting/EnvironmentNode.js';
import { float, vec3 } from '../../nodes/tsl/TSLBase.js';

import { MeshStandardMaterial } from '../MeshStandardMaterial.js';

const _defaultValues = /*@__PURE__*/ new MeshStandardMaterial();

/**
 * Node material version of {@link MeshStandardMaterial}.
 *
 * @augments NodeMaterial
 */
class MeshStandardNodeMaterial extends NodeMaterial {

	static get type() {

		return 'MeshStandardNodeMaterial';

	}

	/**
	 * Constructs a new mesh standard node material.
	 *
	 * @param {Object} [parameters] - The configuration parameter.
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
		this.isMeshStandardNodeMaterial = true;

		/**
		 * Set to `true` because standard materials react on lights.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.lights = true;

		/**
		 * The emissive color of standard materials is by default inferred from the `emissive`,
		 * `emissiveIntensity` and `emissiveMap` properties. This node property allows to
		 * overwrite the default and define the emissive color with a node instead.
		 *
		 * If you don't want to overwrite the emissive color but modify the existing
		 * value instead, use {@link materialEmissive}.
		 *
		 * @type {?Node<vec3>}
		 * @default null
		 */
		this.emissiveNode = null;

		/**
		 * The metalness of standard materials is by default inferred from the `metalness`,
		 * and `metalnessMap` properties. This node property allows to
		 * overwrite the default and define the metalness with a node instead.
		 *
		 * If you don't want to overwrite the metalness but modify the existing
		 * value instead, use {@link materialMetalness}.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.metalnessNode = null;

		/**
		 * The roughness of standard materials is by default inferred from the `roughness`,
		 * and `roughnessMap` properties. This node property allows to
		 * overwrite the default and define the roughness with a node instead.
		 *
		 * If you don't want to overwrite the roughness but modify the existing
		 * value instead, use {@link materialRoughness}.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.roughnessNode = null;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	/**
	 * Overwritten since this type of material uses {@link EnvironmentNode}
	 * to implement the PBR (PMREM based) environment mapping. Besides, the
	 * method honors `Scene.environment`.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {?EnvironmentNode<vec3>} The environment node.
	 */
	setupEnvironment( builder ) {

		let envNode = super.setupEnvironment( builder );

		if ( envNode === null && builder.environmentNode ) {

			envNode = builder.environmentNode;

		}

		return envNode ? new EnvironmentNode( envNode ) : null;

	}

	/**
	 * Setups the lighting model.
	 *
	 * @return {PhysicalLightingModel} The lighting model.
	 */
	setupLightingModel( /*builder*/ ) {

		return new PhysicalLightingModel();

	}

	/**
	 * Setups the specular related node variables.
	 */
	setupSpecular() {

		const specularColorNode = mix( vec3( 0.04 ), diffuseColor.rgb, metalness );

		specularColor.assign( vec3( 0.04 ) );
		specularColorBlended.assign( specularColorNode );
		specularF90.assign( 1.0 );

	}

	/**
	 * Setups the standard specific node variables.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setupVariants() {

		// METALNESS

		const metalnessNode = this.metalnessNode ? float( this.metalnessNode ) : materialMetalness;

		metalness.assign( metalnessNode );

		// ROUGHNESS

		let roughnessNode = this.roughnessNode ? float( this.roughnessNode ) : materialRoughness;
		roughnessNode = getRoughness( { roughness: roughnessNode } );

		roughness.assign( roughnessNode );

		// SPECULAR COLOR

		this.setupSpecular();

		// DIFFUSE COLOR

		diffuseContribution.assign( diffuseColor.rgb.mul( metalnessNode.oneMinus() ) );

	}

	copy( source ) {

		this.emissiveNode = source.emissiveNode;

		this.metalnessNode = source.metalnessNode;
		this.roughnessNode = source.roughnessNode;

		return super.copy( source );

	}

}

export default MeshStandardNodeMaterial;
