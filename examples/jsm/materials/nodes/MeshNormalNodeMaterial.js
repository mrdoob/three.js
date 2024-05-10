import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import {
	diffuseColor,
	directionToColor,
	materialOpacity,
	transformedNormalView,
	float, vec4
} from '../nodes/Nodes.js';

import { MeshNormalMaterial } from 'three';

const defaultValues = new MeshNormalMaterial();

class MeshNormalNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshNormalNodeMaterial = true;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	setupDiffuseColor() {

		const opacityNode = this.opacityNode ? float( this.opacityNode ) : materialOpacity;

		diffuseColor.assign( vec4( directionToColor( transformedNormalView ), opacityNode ) );

	}

}

export default MeshNormalNodeMaterial;

addNodeMaterial( 'MeshNormalNodeMaterial', MeshNormalNodeMaterial );
