import AnalyticLightNode from './AnalyticLightNode.js';
import { normalWorld } from '../accessors/Normal.js';
import { uniformArray } from '../accessors/UniformArrayNode.js';
import { Vector3 } from '../../math/Vector3.js';
import getShIrradianceAt from '../functions/material/getShIrradianceAt.js';

/**
 * Module for representing light probes as nodes.
 *
 * @augments AnalyticLightNode
 */
class LightProbeNode extends AnalyticLightNode {

	static get type() {

		return 'LightProbeNode';

	}

	/**
	 * Constructs a new light probe node.
	 *
	 * @param {LightProbe?} [light=null] - The light probe.
	 */
	constructor( light = null ) {

		super( light );

		const array = [];

		for ( let i = 0; i < 9; i ++ ) array.push( new Vector3() );

		/**
		 * Light probe represented as a uniform of spherical harmonics.
		 *
		 * @type {UniformArrayNode}
		 */
		this.lightProbe = uniformArray( array );

	}

	/**
	 * Overwritten to updated light probe specific uniforms.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	update( frame ) {

		const { light } = this;

		super.update( frame );

		//

		for ( let i = 0; i < 9; i ++ ) {

			this.lightProbe.array[ i ].copy( light.sh.coefficients[ i ] ).multiplyScalar( light.intensity );

		}

	}

	setup( builder ) {

		const irradiance = getShIrradianceAt( normalWorld, this.lightProbe );

		builder.context.irradiance.addAssign( irradiance );

	}

}

export default LightProbeNode;
