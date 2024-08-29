import NodeMaterial, { registerNodeMaterial } from './NodeMaterial.js';
import ToonLightingModel from '../../nodes/functions/ToonLightingModel.js';

import { MeshToonMaterial } from '../MeshToonMaterial.js';

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

MeshToonNodeMaterial.type = /*@__PURE__*/ registerNodeMaterial( 'MeshToon', MeshToonNodeMaterial );
