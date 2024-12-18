import LightingModel from '../core/LightingModel.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { float } from '../tsl/TSLBase.js';

/**
 * Represents lighting model for a shadow material. Used in {@link ShadowNodeMaterial}.
 *
 * @augments LightingModel
 */
class ShadowMaskModel extends LightingModel {

	/**
	 * Constructs a new shadow mask model.
	 */
	constructor() {

		super();

		/**
		 * The shadow mask node.
		 *
		 * @type {Node}
		 */
		this.shadowNode = float( 1 ).toVar( 'shadowMask' );

	}

	/**
	 * Only used to save the shadow mask.
	 *
	 * @param {Object} input - The input data.
	 */
	direct( { shadowMask } ) {

		this.shadowNode.mulAssign( shadowMask );

	}

	/**
	 * Uses the shadow mask to produce the final color.
	 *
	 * @param {ContextNode} context - The current node context.
	 */
	finish( context ) {

		diffuseColor.a.mulAssign( this.shadowNode.oneMinus() );

		context.outgoingLight.rgb.assign( diffuseColor.rgb ); // TODO: Optimize LightsNode to avoid this assignment

	}

}

export default ShadowMaskModel;
