import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { materialReference } from '../accessors/MaterialReferenceNode.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { vec2, vec3 } from '../shadernode/ShaderNode.js';
import { positionViewDirection } from '../accessors/PositionNode.js';
import { MeshMatcapMaterial } from 'three';
import { transformedNormalView } from '../accessors/NormalNode.js';
import { mix } from '../math/MathNode.js';

const defaultValues = new MeshMatcapMaterial();

class MeshMatcapNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshMatcapNodeMaterial = true;

		this.lights = false;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	setupVariants( builder ) {

		const x = vec3( positionViewDirection.z, 0.0, positionViewDirection.x.negate() ).normalize();
		const y = positionViewDirection.cross( x );

		const uv = vec2( x.dot( transformedNormalView ), y.dot( transformedNormalView ) ).mul( 0.495 ).add( 0.5 ) ; // 0.495 to remove artifacts caused by undersized matcap disks

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
