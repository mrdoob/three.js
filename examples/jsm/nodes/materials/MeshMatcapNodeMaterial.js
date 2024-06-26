import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { materialReference } from '../accessors/MaterialReferenceNode.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { vec3 } from '../shadernode/ShaderNode.js';
import { MeshMatcapMaterial } from 'three';
import { mix } from '../math/MathNode.js';
import { matcapUV } from '../utils/MatcapUVNode.js';

const defaultValues = new MeshMatcapMaterial();

class MeshMatcapNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.lights = false;

		this.isMeshMatcapNodeMaterial = true;

		this.setDefaultValues( defaultValues );

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

addNodeMaterial( 'MeshMatcapNodeMaterial', MeshMatcapNodeMaterial );
