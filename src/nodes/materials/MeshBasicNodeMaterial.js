import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { MeshBasicMaterial } from '../../materials/MeshBasicMaterial.js';
import BasicLightingModel from '../functions/BasicLightingModel.js';

const defaultValues = new MeshBasicMaterial();

class MeshBasicNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshBasicNodeMaterial = true;

		this.lights = true;
		//this.normals = false; @TODO: normals usage by context

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	setupLightingModel( builder ) {

		const envNode = this.getEnvNode( builder );

		return new BasicLightingModel( envNode, this.combine );

	}

}

export default MeshBasicNodeMaterial;

addNodeMaterial( 'MeshBasicNodeMaterial', MeshBasicNodeMaterial );
