import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import ShadowMaskModel from '../functions/ShadowMaskModel.js';

import { ShadowMaterial } from '../../materials/ShadowMaterial.js';

const _defaultValues = /*@__PURE__*/ new ShadowMaterial();

class ShadowNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isShadowNodeMaterial = true;

		this.lights = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	setupLightingModel( /*builder*/ ) {

		return new ShadowMaskModel();

	}

}

export default ShadowNodeMaterial;

addNodeMaterial( 'ShadowNodeMaterial', ShadowNodeMaterial );
