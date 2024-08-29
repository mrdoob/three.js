import { registerNode } from '../core/Node.js';
import AnalyticLightNode from './AnalyticLightNode.js';
import { normalWorld } from '../accessors/Normal.js';
import { uniformArray } from '../accessors/UniformArrayNode.js';
import { Fn } from '../tsl/TSLBase.js';
import { mul } from '../math/OperatorNode.js';
import { Vector3 } from '../../math/Vector3.js';

class LightProbeNode extends AnalyticLightNode {

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

		const irradiance = shGetIrradianceAt( normalWorld, this.lightProbe );

		builder.context.irradiance.addAssign( irradiance );

	}

}

export default LightProbeNode;

LightProbeNode.type = /*@__PURE__*/ registerNode( 'LightProbe', LightProbeNode );

const shGetIrradianceAt = /*@__PURE__*/ Fn( ( [ normal, shCoefficients ] ) => {

	// normal is assumed to have unit length

	const x = normal.x, y = normal.y, z = normal.z;

	// band 0
	const result = shCoefficients.element( 0 ).mul( 0.886227 );

	// band 1
	result.addAssign( shCoefficients.element( 1 ).mul( 2.0 * 0.511664 ).mul( y ) );
	result.addAssign( shCoefficients.element( 2 ).mul( 2.0 * 0.511664 ).mul( z ) );
	result.addAssign( shCoefficients.element( 3 ).mul( 2.0 * 0.511664 ).mul( x ) );

	// band 2
	result.addAssign( shCoefficients.element( 4 ).mul( 2.0 * 0.429043 ).mul( x ).mul( y ) );
	result.addAssign( shCoefficients.element( 5 ).mul( 2.0 * 0.429043 ).mul( y ).mul( z ) );
	result.addAssign( shCoefficients.element( 6 ).mul( z.mul( z ).mul( 0.743125 ).sub( 0.247708 ) ) );
	result.addAssign( shCoefficients.element( 7 ).mul( 2.0 * 0.429043 ).mul( x ).mul( z ) );
	result.addAssign( shCoefficients.element( 8 ).mul( 0.429043 ).mul( mul( x, x ).sub( mul( y, y ) ) ) );

	return result;

} );
