import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import ToonLightingModel from '../functions/ToonLightingModel.js';

import { MeshToonMaterial } from 'three';

const defaultValues = new MeshToonMaterial();

class MeshToonNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshToonNodeMaterial = true;

		this.lights = true;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	setupLightingModel( /*builder*/ ) {

		return new ToonLightingModel();

	}

}

export default MeshToonNodeMaterial;

addNodeMaterial( 'MeshToonNodeMaterial', MeshToonNodeMaterial );
