import NodeMaterial from './NodeMaterial.js';
import { diffuseColor, metalness, roughness, specularColor, specularF90 } from '../../nodes/core/PropertyNode.js';
import { mix } from '../../nodes/math/MathNode.js';
import { materialRoughness, materialMetalness } from '../../nodes/accessors/MaterialNode.js';
import getRoughness from '../../nodes/functions/material/getRoughness.js';
import PhysicalLightingModel from '../../nodes/functions/PhysicalLightingModel.js';
import EnvironmentNode from '../../nodes/lighting/EnvironmentNode.js';
import { float, vec3, vec4 } from '../../nodes/tsl/TSLBase.js';

import { MeshStandardMaterial } from '../MeshStandardMaterial.js';

const _defaultValues = /*@__PURE__*/ new MeshStandardMaterial();

class MeshStandardNodeMaterial extends NodeMaterial {

	static get type() {

		return 'MeshStandardNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.isMeshStandardNodeMaterial = true;

		this.lights = true;

		this.emissiveNode = null;

		this.metalnessNode = null;
		this.roughnessNode = null;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	setupEnvironment( builder ) {

		let envNode = super.setupEnvironment( builder );

		if ( envNode === null && builder.environmentNode ) {

			envNode = builder.environmentNode;

		}

		return envNode ? new EnvironmentNode( envNode ) : null;

	}

	setupLightingModel( /*builder*/ ) {

		return new PhysicalLightingModel();

	}

	setupSpecular() {

		const specularColorNode = mix( vec3( 0.04 ), diffuseColor.rgb, metalness );

		specularColor.assign( specularColorNode );
		specularF90.assign( 1.0 );

	}

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

		diffuseColor.assign( vec4( diffuseColor.rgb.mul( metalnessNode.oneMinus() ), diffuseColor.a ) );

	}

	copy( source ) {

		this.emissiveNode = source.emissiveNode;

		this.metalnessNode = source.metalnessNode;
		this.roughnessNode = source.roughnessNode;

		return super.copy( source );

	}

}

export default MeshStandardNodeMaterial;
