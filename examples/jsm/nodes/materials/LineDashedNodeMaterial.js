import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { attribute } from '../core/AttributeNode.js';
import { varying } from '../core/VaryingNode.js';
import { materialLineDashSize, materialLineGapSize, materialLineScale } from '../accessors/LineMaterialNode.js';
import { dashScale, dashSize, gapSize } from '../core/PropertyNode.js';
import { LineDashedMaterial } from 'three';

const defaultValues = new LineDashedMaterial();

class LineDashedNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isLineDashedNodeMaterial = true;

		this.lights = false;
		this.normals = false;

		this.setDefaultValues( defaultValues );

		this.dashScaleNode = null;
		this.dashSizeNode = null;
		this.gapSizeNode = null;

		this.setValues( parameters );

	}

	constructVariants( { stack } ) {

		const dashScaleNode = this.dashScaleNode ? float( this.dashScaleNode ) : materialLineScale;
		const dashSizeNode = this.dashSizeNode ? float( this.dashSizeNode ) : materialLineDashSize;
		const gapSizeNode = this.dashSizeNode ? float( this.dashGapNode ) : materialLineGapSize;

		stack.assign( dashScale, dashScaleNode );
		stack.assign( dashSize, dashSizeNode );
		stack.assign( gapSize, gapSizeNode );

		const vLineDistance = varying( attribute( 'lineDistance' ).mul( dashScale ) );

		stack.add( vLineDistance.mod( dashSize.add( gapSize ) ).greaterThan( dashSize ).discard() );

	}

}

export default LineDashedNodeMaterial;

addNodeMaterial( LineDashedNodeMaterial );
