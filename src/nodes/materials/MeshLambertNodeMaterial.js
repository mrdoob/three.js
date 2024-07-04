import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import PhongLightingModel from '../functions/PhongLightingModel.js';

import { MeshLambertMaterial } from '../../materials/MeshLambertMaterial.js';

const defaultValues = new MeshLambertMaterial();

class MeshLambertNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshLambertNodeMaterial = true;

		this.lights = true;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	setupLightingModel() {

		return new PhongLightingModel( false );

	}

}

export default MeshLambertNodeMaterial;

addNodeMaterial( 'MeshLambertNodeMaterial', MeshLambertNodeMaterial );
