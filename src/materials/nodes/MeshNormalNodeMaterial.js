import NodeMaterial from './NodeMaterial.js';
import { diffuseColor } from '../../nodes/core/PropertyNode.js';
import { directionToColor } from '../../nodes/utils/Packing.js';
import { materialOpacity } from '../../nodes/accessors/MaterialNode.js';
import { normalView } from '../../nodes/accessors/Normal.js';
import { colorSpaceToWorking } from '../../nodes/display/ColorSpaceNode.js';
import { float, vec4 } from '../../nodes/tsl/TSLBase.js';
import { SRGBColorSpace } from '../../constants.js';

import { MeshNormalMaterial } from '../MeshNormalMaterial.js';

const _defaultValues = /*@__PURE__*/ new MeshNormalMaterial();

/**
 * Node material version of {@link MeshNormalMaterial}.
 *
 * @augments NodeMaterial
 */
class MeshNormalNodeMaterial extends NodeMaterial {

	static get type() {

		return 'MeshNormalNodeMaterial';

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
		this.isMeshNormalNodeMaterial = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	/**
	 * Overwrites the default implementation by computing the diffuse color
	 * based on the normal data.
	 */
	setupDiffuseColor() {

		const opacityNode = this.opacityNode ? float( this.opacityNode ) : materialOpacity;

		// By convention, a normal packed to RGB is in sRGB color space. Convert it to working color space.

		diffuseColor.assign( colorSpaceToWorking( vec4( directionToColor( normalView ), opacityNode ), SRGBColorSpace ) );

	}

}

export default MeshNormalNodeMaterial;
