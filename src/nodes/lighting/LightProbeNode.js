import AnalyticLightNode from './AnalyticLightNode.js';
import { normalWorld } from '../accessors/Normal.js';
import { uniformArray } from '../accessors/UniformArrayNode.js';
import { Vector3 } from '../../math/Vector3.js';
import getShIrradianceAt from '../functions/material/getShIrradianceAt.js';

class LightProbeNode extends AnalyticLightNode {

	static get type() {

		return 'LightProbeNode';

	}

	constructor( light = null ) {

		super( light );

		const array = [];

		for ( let i = 0; i < 9; i ++ ) array.push( new Vector3() );

		this.lightProbe = uniformArray( array );

	}

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
