import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import PhongLightingModel from '../functions/PhongLightingModel.js';

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

		return new PhongLightingModel( false ); // ( specular ) -> force lambert

	}

}

export default MeshLambertNodeMaterial;

addNodeMaterial( MeshLambertNodeMaterial );
