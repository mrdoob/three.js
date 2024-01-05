import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { diffuseColor, metalness, roughness, specularColor } from '../core/PropertyNode.js';
import { mix } from '../math/MathNode.js';
import { materialRoughness, materialMetalness } from '../accessors/MaterialNode.js';
import getRoughness from '../functions/material/getRoughness.js';
import PhysicalLightingModel from '../functions/PhysicalLightingModel.js';

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

		const metalnessNode = this.metalnessNode || materialMetalness;
		metalness.assign( metalnessNode );

		// ROUGHNESS

		roughness.assign( getRoughness( { roughness: this.roughnessNode || materialRoughness } ) );

		// SPECULAR COLOR

		specularColor.assign( metalnessNode.mix( 0.04, diffuseColor.rgb ) );

		// DIFFUSE COLOR

		diffuseColor.rgb.mulAssign( metalnessNode.oneMinus() );

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
