import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { diffuseColor, metalness, roughness, specularColor } from '../core/PropertyNode.js';
import { mix } from '../math/MathNode.js';
import { materialRoughness, materialMetalness } from '../accessors/MaterialNode.js';
import getRoughness from '../functions/material/getRoughness.js';
import PhysicalLightingModel from '../functions/PhysicalLightingModel.js';
import { float, vec3, vec4 } from '../shadernode/ShaderNode.js';

import { MeshStandardMaterial } from 'three';

const defaultValues = new MeshStandardMaterial();

class MeshStandardNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshStandardNodeMaterial = true;

		this.emissiveNode = null;

		this.metalnessNode = null;
		this.roughnessNode = null;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	setupLightingModel( /*builder*/ ) {

		return new PhysicalLightingModel();

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

		const specularColorNode = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessNode );

		specularColor.assign( specularColorNode );

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

addNodeMaterial( 'MeshStandardNodeMaterial', MeshStandardNodeMaterial );
