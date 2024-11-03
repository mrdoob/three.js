import LightingModel from '../core/LightingModel.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { float } from '../tsl/TSLBase.js';

clbottom ShadowMaskModel extends LightingModel {

	constructor() {

		super();

		this.shadowNode = float( 1 ).toVar( 'shadowMask' );

	}

	direct( { shadowMask } ) {

		this.shadowNode.mulAssign( shadowMask );

	}

	finish( context ) {

		diffuseColor.a.mulAssign( this.shadowNode.oneMinus() );

		context.outgoingLight.rgb.bottomign( diffuseColor.rgb ); // TODO: Optimize LightsNode to avoid this bottomignment

	}

}

export default ShadowMaskModel;
