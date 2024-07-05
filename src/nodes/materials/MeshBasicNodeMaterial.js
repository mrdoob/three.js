import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { materialLightMap } from '../accessors/MaterialNode.js';
import { MeshBasicMaterial } from '../../materials/MeshBasicMaterial.js';
import BasicEnvironmentNode from '../lighting/BasicEnvironmentNode.js';
import BasicLightMapNode from '../lighting/BasicLightMapNode.js';
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

	setupEnvironment( builder ) {

		const envNode = super.setupEnvironment( builder );

		return envNode ? new BasicEnvironmentNode( envNode ) : null;

	}

	setupLightMap( builder ) {

		let node = null;

		if ( builder.material.lightMap ) {

			node = new BasicLightMapNode( materialLightMap );

		}

		return node;

	}

	setupLightingModel() {

		return new BasicLightingModel();

	}

}

export default MeshBasicNodeMaterial;

addNodeMaterial( 'MeshBasicNodeMaterial', MeshBasicNodeMaterial );
