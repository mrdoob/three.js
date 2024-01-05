import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { materialOpacity } from '../accessors/MaterialNode.js';
import { transformedNormalView } from '../accessors/NormalNode.js';

import { MeshNormalMaterial } from 'three';

const defaultValues = new MeshNormalMaterial();

class MeshNormalNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshNormalNodeMaterial = true;

		this.colorSpace = false;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	setupDiffuseColor() {

		diffuseColor.rgb = transformedNormalView.directionToColor();
		diffuseColor.a = this.opacityNode || materialOpacity;

	}

}

export default MeshNormalNodeMaterial;

addNodeMaterial( 'MeshNormalNodeMaterial', MeshNormalNodeMaterial );
