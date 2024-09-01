import NodeMaterial from './NodeMaterial.js';
import { diffuseColor } from '../../nodes/core/PropertyNode.js';
import { directionToColor } from '../../nodes/utils/Packing.js';
import { materialOpacity } from '../../nodes/accessors/MaterialNode.js';
import { transformedNormalView } from '../../nodes/accessors/Normal.js';
import { float, vec4 } from '../../nodes/tsl/TSLBase.js';

import { MeshNormalMaterial } from '../MeshNormalMaterial.js';

const _defaultValues = /*@__PURE__*/ new MeshNormalMaterial();

class MeshNormalNodeMaterial extends NodeMaterial {

	static get type() {

		return 'MeshNormalNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.lights = false;

		this.isMeshNormalNodeMaterial = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	setupDiffuseColor() {

		const opacityNode = this.opacityNode ? float( this.opacityNode ) : materialOpacity;

		diffuseColor.assign( vec4( directionToColor( transformedNormalView ), opacityNode ) );

	}

}

export default MeshNormalNodeMaterial;
