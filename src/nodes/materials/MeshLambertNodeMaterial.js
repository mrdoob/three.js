import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import BasicEnvironmentNode from '../lighting/BasicEnvironmentNode.js';
import PhongLightingModel from '../functions/PhongLightingModel.js';

import { MeshLambertMaterial } from '../../materials/MeshLambertMaterial.js';

const _defaultValues = /*@__PURE__*/ new MeshLambertMaterial();

class MeshLambertNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshLambertNodeMaterial = true;

		this.lights = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	setupEnvironment( builder ) {

		const envNode = super.setupEnvironment( builder );

		return envNode ? new BasicEnvironmentNode( envNode ) : null;

	}

	setupLightingModel( /*builder*/ ) {

		return new PhongLightingModel( false ); // ( specular ) -> force lambert

	}

}

export default MeshLambertNodeMaterial;

addNodeMaterial( 'MeshLambertNodeMaterial', MeshLambertNodeMaterial );
