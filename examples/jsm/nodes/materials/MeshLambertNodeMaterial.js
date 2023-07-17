import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import lambertLightingModel from '../functions/LambertLightingModel.js';

import { MeshLambertMaterial } from 'three';

const defaultValues = new MeshLambertMaterial();

class MeshLambertNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshLambertNodeMaterial = true;

		this.lights = true;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	constructLightingModel( /*builder*/ ) {

		return lambertLightingModel;

	}

}

export default MeshLambertNodeMaterial;

addNodeMaterial( MeshLambertNodeMaterial );
