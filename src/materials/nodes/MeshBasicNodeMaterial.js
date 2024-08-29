import NodeMaterial, { registerNodeMaterial } from './NodeMaterial.js';
import { materialLightMap } from '../../nodes/accessors/MaterialNode.js';
import BasicEnvironmentNode from '../../nodes/lighting/BasicEnvironmentNode.js';
import BasicLightMapNode from '../../nodes/lighting/BasicLightMapNode.js';
import BasicLightingModel from '../../nodes/functions/BasicLightingModel.js';
import { normalView } from '../../nodes/accessors/Normal.js';
import { diffuseColor } from '../../nodes/core/PropertyNode.js';

import { MeshBasicMaterial } from '../MeshBasicMaterial.js';

const _defaultValues = /*@__PURE__*/ new MeshBasicMaterial();

class MeshBasicNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshBasicNodeMaterial = true;

		this.lights = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	setupNormal() {

		return normalView; // see #28839

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

	setupOutgoingLight() {

		return diffuseColor.rgb;

	}

	setupLightingModel() {

		return new BasicLightingModel();

	}

}

export default MeshBasicNodeMaterial;

MeshBasicNodeMaterial.type = /*@__PURE__*/ registerNodeMaterial( 'MeshBasic', MeshBasicNodeMaterial );
