import AnalyticLightNode from './AnalyticLightNode.js';
import { lightPosition } from '../accessors/Lights.js';
import { cameraViewMatrix } from '../accessors/Camera.js';
import { sunShadow } from './SunShadowNode.js';

/**
 * Module for representing sun lights as nodes.
 *
 * @augments AnalyticLightNode
 */
class SunLightNode extends AnalyticLightNode {

	static get type() {

		return 'SunLightNode';

	}

	/**
	 * Constructs a new sun light node.
	 *
	 * @param {?SunLight} [light=null] - The sun light source.
	 */
	constructor( light = null ) {

		super( light );

	}

	/**
	 * Overwritten to setup the cascaded shadows of sun lights.
	 *
	 * @return {SunShadowNode} The created shadow node.
	 */
	setupShadowNode() {

		return sunShadow( this.light );

	}

	setupDirect() {

		const lightColor = this.colorNode;
		const lightDirection = cameraViewMatrix.transformDirection( lightPosition( this.light ) );

		return { lightDirection, lightColor };

	}

}

export default SunLightNode;
