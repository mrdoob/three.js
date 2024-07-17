import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import ToonLightingModel from '../functions/ToonLightingModel.js';

import { MeshToonMaterial } from '../../materials/MeshToonMaterial.js';

const _defaultValues = /*@__PURE__*/ new MeshToonMaterial();

class MeshToonNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshToonNodeMaterial = true;

		this.lights = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	setupLightingModel( /*builder*/ ) {

		return new ToonLightingModel();

	}

}

export default MeshToonNodeMaterial;

addNodeMaterial( 'MeshToonNodeMaterial', MeshToonNodeMaterial );
