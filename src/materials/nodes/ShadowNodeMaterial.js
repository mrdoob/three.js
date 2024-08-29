import NodeMaterial, { registerNodeMaterial } from './NodeMaterial.js';
import ShadowMaskModel from '../../nodes/functions/ShadowMaskModel.js';

import { ShadowMaterial } from '../ShadowMaterial.js';

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

ShadowNodeMaterial.type = /*@__PURE__*/ registerNodeMaterial( 'Shadow', ShadowNodeMaterial );
