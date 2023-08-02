import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { attribute } from '../core/AttributeNode.js';
import { varying } from '../core/VaryingNode.js';
import { materialLineDashSize, materialLineGapSize, materialLineScale } from '../accessors/LineMaterialNode.js';

import { LineDashedMaterial } from 'three';

const defaultValues = new LineDashedMaterial();

class LineDashedNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isLineDashedNodeMaterial = true;

		this.lights = false;
		this.normals = false;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	constructVariants( { stack } ) {

		const vLineDistance = varying( attribute( 'lineDistance' ).mul( materialLineScale ) );

		stack.add( vLineDistance.mod( materialLineDashSize.add( materialLineGapSize ) ).greaterThan( materialLineDashSize ).discard() );

	}

}

export default LineDashedNodeMaterial;

addNodeMaterial( LineDashedNodeMaterial );
