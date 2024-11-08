import NodeMaterial from './NodeMaterial.js';
import { attribute } from '../../nodes/core/AttributeNode.js';
import { materialLineDashOffset, materialLineDashSize, materialLineGapSize, materialLineScale } from '../../nodes/accessors/MaterialNode.js';
import { dashSize, gapSize } from '../../nodes/core/PropertyNode.js';
import { varying, float } from '../../nodes/tsl/TSLBase.js';

import { LineDashedMaterial } from '../LineDashedMaterial.js';

const _defaultValues = /*@__PURE__*/ new LineDashedMaterial();

class LineDashedNodeMaterial extends NodeMaterial {

	static get type() {

		return 'LineDashedNodeMaterial';

	}

	constructor( parameters ) {

		super();

		this.isLineDashedNodeMaterial = true;

		this.lights = false;

		this.setDefaultValues( _defaultValues );

		this.dashOffset = 0;

		this.offsetNode = null;
		this.dashScaleNode = null;
		this.dashSizeNode = null;
		this.gapSizeNode = null;

		this.setValues( parameters );

	}

	setupVariants() {

		const offsetNode = this.offsetNode ? float( this.offsetNodeNode ) : materialLineDashOffset;
		const dashScaleNode = this.dashScaleNode ? float( this.dashScaleNode ) : materialLineScale;
		const dashSizeNode = this.dashSizeNode ? float( this.dashSizeNode ) : materialLineDashSize;
		const gapSizeNode = this.dashSizeNode ? float( this.dashGapNode ) : materialLineGapSize;

		dashSize.assign( dashSizeNode );
		gapSize.assign( gapSizeNode );

		const vLineDistance = varying( attribute( 'lineDistance' ).mul( dashScaleNode ) );
		const vLineDistanceOffset = offsetNode ? vLineDistance.add( offsetNode ) : vLineDistance;

		vLineDistanceOffset.mod( dashSize.add( gapSize ) ).greaterThan( dashSize ).discard();

	}

}

export default LineDashedNodeMaterial;
