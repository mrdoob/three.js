import LightingModel from '../core/LightingModel.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { float } from '../shadernode/ShaderNode.js';

class ShadowMaskModel extends LightingModel {

	constructor() {

		super();

		this.shadowNode = float( 1 ).toVar( 'shadowMask' );

	}

	direct( { shadowMask } ) {

		this.shadowNode.mulAssign( shadowMask );

	}

	finish( context ) {

		diffuseColor.a.mulAssign( this.shadowNode.oneMinus() );

		context.outgoingLight.rgb.assign( diffuseColor.rgb ); // TODO: Optimize LightsNode to avoid this assignment

	}

}

export default ShadowMaskModel;
