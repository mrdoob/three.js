import NodeMaterial, { registerNodeMaterial } from './NodeMaterial.js';
import { materialReference } from '../../nodes/accessors/MaterialReferenceNode.js';
import { diffuseColor } from '../../nodes/core/PropertyNode.js';
import { vec3 } from '../../nodes/tsl/TSLBase.js';
import { mix } from '../../nodes/math/MathNode.js';
import { matcapUV } from '../../nodes/utils/MatcapUVNode.js';

import { MeshMatcapMaterial } from '../MeshMatcapMaterial.js';

const _defaultValues = /*@__PURE__*/ new MeshMatcapMaterial();

class MeshMatcapNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.lights = false;

		this.isMeshMatcapNodeMaterial = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	setupVariants( builder ) {

		const uv = matcapUV;

		let matcapColor;

		if ( builder.material.matcap ) {

			matcapColor = materialReference( 'matcap', 'texture' ).context( { getUV: () => uv } );

		} else {

			matcapColor = vec3( mix( 0.2, 0.8, uv.y ) ); // default if matcap is missing

		}

		diffuseColor.rgb.mulAssign( matcapColor.rgb );

	}

}


export default MeshMatcapNodeMaterial;

MeshMatcapNodeMaterial.type = /*@__PURE__*/ registerNodeMaterial( 'MeshMatcap', MeshMatcapNodeMaterial );
