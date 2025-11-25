import NodeMaterial from './NodeMaterial.js';
import { attribute } from '../../nodes/core/AttributeNode.js';
import { materialLineDashOffset, materialLineDashSize, materialLineGapSize, materialLineScale } from '../../nodes/accessors/MaterialNode.js';
import { dashSize, gapSize } from '../../nodes/core/PropertyNode.js';
import { varying, float } from '../../nodes/tsl/TSLBase.js';
import { screenDPR, viewport } from '../../nodes/display/ScreenNode.js';

import { LineDashedMaterial } from '../LineDashedMaterial.js';

const _defaultValues = /*@__PURE__*/ new LineDashedMaterial();

/**
 * Node material version of  {@link LineDashedMaterial}.
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
		this.isLineDashedNodeMaterial = true;

		this.setDefaultValues( _defaultValues );

		/**
		 * The dash offset.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.dashOffset = 0;

		/**
		 * The offset of dash materials is by default inferred from the `dashOffset`
		 * property. This node property allows to overwrite the default
		 * and define the offset with a node instead.
		 *
		 * If you don't want to overwrite the offset but modify the existing
		 * value instead, use {@link materialLineDashOffset}.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.offsetNode = null;

		/**
		 * The scale of dash materials is by default inferred from the `scale`
		 * property. This node property allows to overwrite the default
		 * and define the scale with a node instead.
		 *
		 * If you don't want to overwrite the scale but modify the existing
		 * value instead, use {@link materialLineScale}.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.dashScaleNode = null;

		/**
		 * The dash size of dash materials is by default inferred from the `dashSize`
		 * property. This node property allows to overwrite the default
		 * and define the dash size with a node instead.
		 *
		 * If you don't want to overwrite the dash size but modify the existing
		 * value instead, use {@link materialLineDashSize}.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.dashSizeNode = null;

		/**
		 * The gap size of dash materials is by default inferred from the `gapSize`
		 * property. This node property allows to overwrite the default
		 * and define the gap size with a node instead.
		 *
		 * If you don't want to overwrite the gap size but modify the existing
		 * value instead, use {@link materialLineGapSize}.
		 *
		 * @type {?Node<float>}
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
		let dashSizeNode = this.dashSizeNode ? float( this.dashSizeNode ) : materialLineDashSize;
		let gapSizeNode = this.gapSizeNode ? float( this.gapSizeNode ) : materialLineGapSize;

		// Screen-space conversion: scale dash/gap sizes by viewport height
		if ( this.screenSpace ) {

			const screenSpaceScale = viewport.w.div( screenDPR );
			dashSizeNode = dashSizeNode.div( screenSpaceScale );
			gapSizeNode = gapSizeNode.div( screenSpaceScale );

		}

		dashSize.assign( dashSizeNode );
		gapSize.assign( gapSizeNode );

		const vLineDistance = varying( attribute( 'lineDistance' ).mul( dashScaleNode ) );
		const vLineDistanceOffset = offsetNode ? vLineDistance.add( offsetNode ) : vLineDistance;

		vLineDistanceOffset.mod( dashSize.add( gapSize ) ).greaterThan( dashSize ).discard();

	}

	/**
	 * Copies the properties of the given node material to this instance.
	 *
	 * @param {LineDashedNodeMaterial} source - The material to copy.
	 * @return {LineDashedNodeMaterial} A reference to this node material.
	 */
	copy( source ) {

		// Properties from LineDashedMaterial (inherited via setDefaultValues)
		this.scale = source.scale;
		this.dashSize = source.dashSize;
		this.gapSize = source.gapSize;
		this.screenSpace = source.screenSpace;

		// LineDashedNodeMaterial-specific properties
		this.dashOffset = source.dashOffset;
		this.offsetNode = source.offsetNode;
		this.dashScaleNode = source.dashScaleNode;
		this.dashSizeNode = source.dashSizeNode;
		this.gapSizeNode = source.gapSizeNode;

		return super.copy( source );

	}

}

export default LineDashedNodeMaterial;
