import NodeMaterial from './NodeMaterial.js';
import { attribute } from '../../nodes/core/AttributeNode.js';
import { materialLineDashOffset, materialLineDashSize, materialLineGapSize, materialLineScale } from '../../nodes/accessors/MaterialNode.js';
import { dashSize, gapSize } from '../../nodes/core/PropertyNode.js';
import { varying, float } from '../../nodes/tsl/TSLBase.js';

import { LineDashedMaterial } from '../LineDashedMaterial.js';

const _defaultValues = /*@__PURE__*/ new LineDashedMaterial();

/**
 * Node material version of `LineDashedMaterial`.
 *
 * @augments NodeMaterial
 */
class LineDashedNodeMaterial extends NodeMaterial {

	static get type() {

		return 'LineDashedNodeMaterial';

	}

	/**
	 * Constructs a new line dashed node material.
	 *
	 * @param {Object?} parameters - The configuration parameter.
	 */
	constructor( parameters ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isLineDashedNodeMaterial = true;

		this.setDefaultValues( _defaultValues );

		/**
		 * The dash offset.
		 *
		 * @type {Number}
		 * @default 0
		 */
		this.dashOffset = 0;

		/**
		 * The offset of dash materials is by default inferred from the `dashOffset`
		 * property. This node property allows to overwrite the default
		 * and define the offset with a node instead.
		 *
		 * If you don't want to overwrite the offset but modify the existing
		 * value instead, use {@link module:MaterialNode.materialLineDashOffset}.
		 *
		 * @type {Node<float>?}
		 * @default null
		 */
		this.offsetNode = null;

		/**
		 * The scale of dash materials is by default inferred from the `scale`
		 * property. This node property allows to overwrite the default
		 * and define the scale with a node instead.
		 *
		 * If you don't want to overwrite the scale but modify the existing
		 * value instead, use {@link module:MaterialNode.materialLineScale}.
		 *
		 * @type {Node<float>?}
		 * @default null
		 */
		this.dashScaleNode = null;

		/**
		 * The dash size of dash materials is by default inferred from the `dashSize`
		 * property. This node property allows to overwrite the default
		 * and define the dash size with a node instead.
		 *
		 * If you don't want to overwrite the dash size but modify the existing
		 * value instead, use {@link module:MaterialNode.materialLineDashSize}.
		 *
		 * @type {Node<float>?}
		 * @default null
		 */
		this.dashSizeNode = null;

		/**
		 * The gap size of dash materials is by default inferred from the `gapSize`
		 * property. This node property allows to overwrite the default
		 * and define the gap size with a node instead.
		 *
		 * If you don't want to overwrite the gap size but modify the existing
		 * value instead, use {@link module:MaterialNode.materialLineGapSize}.
		 *
		 * @type {Node<float>?}
		 * @default null
		 */
		this.gapSizeNode = null;

		this.setValues( parameters );

	}

	/**
	 * Setups the dash specific node variables.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setupVariants( /* builder */ ) {

		const offsetNode = this.offsetNode ? float( this.offsetNode ) : materialLineDashOffset;
		const dashScaleNode = this.dashScaleNode ? float( this.dashScaleNode ) : materialLineScale;
		const dashSizeNode = this.dashSizeNode ? float( this.dashSizeNode ) : materialLineDashSize;
		const gapSizeNode = this.gapSizeNode ? float( this.gapSizeNode ) : materialLineGapSize;

		dashSize.assign( dashSizeNode );
		gapSize.assign( gapSizeNode );

		const vLineDistance = varying( attribute( 'lineDistance' ).mul( dashScaleNode ) );
		const vLineDistanceOffset = offsetNode ? vLineDistance.add( offsetNode ) : vLineDistance;

		vLineDistanceOffset.mod( dashSize.add( gapSize ) ).greaterThan( dashSize ).discard();

	}

}

export default LineDashedNodeMaterial;
