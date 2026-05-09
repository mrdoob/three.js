import NodeMaterial from './NodeMaterial.js';
import { materialReference } from '../../nodes/accessors/MaterialReferenceNode.js';
import { diffuseColor } from '../../nodes/core/PropertyNode.js';
import { vec3 } from '../../nodes/tsl/TSLBase.js';
import { mix } from '../../nodes/math/MathNode.js';
import { matcapUV } from '../../nodes/utils/MatcapUV.js';

import { MeshMatcapMaterial } from '../MeshMatcapMaterial.js';

const _defaultValues = /*@__PURE__*/ new MeshMatcapMaterial();

/**
 * Node material version of {@link MeshMatcapMaterial}.
 *
 * @augments NodeMaterial
 */
class MeshMatcapNodeMaterial extends NodeMaterial {

	static get type() {

		return 'MeshMatcapNodeMaterial';

	}

	/**
	 * Constructs a new mesh normal node material.
	 *
	 * @param {Object} [parameters] - The configuration parameter.
	 */
	constructor( parameters ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isMeshMatcapNodeMaterial = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	/**
	 * Setups the matcap specific node variables.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
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
