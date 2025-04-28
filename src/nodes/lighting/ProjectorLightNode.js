import SpotLightNode from './SpotLightNode.js';

import { Fn, vec2 } from '../tsl/TSLCore.js';
import { length, min, max, saturate, acos } from '../math/MathNode.js';
import { div, sub } from '../math/OperatorNode.js';

const sdBox = /*@__PURE__*/ Fn( ( [ p, b ] ) => {

	const d = p.abs().sub( b );

	return length( max( d, 0.0 ) ).add( min( max( d.x, d.y ), 0.0 ) );

} );

/**
 * An implementation of a projector light node.
 *
 * @augments SpotLightNode
 */
class ProjectorLightNode extends SpotLightNode {

	static get type() {

		return 'ProjectorLightNode';

	}

	update( frame ) {

		super.update( frame );

		const light = this.light;

		this.penumbraCosNode.value = Math.min( Math.cos( light.angle * ( 1 - light.penumbra ) ), .99999 );

		if ( light.aspect === null ) {

			let aspect = 1;

			if ( light.map !== null ) {

				aspect = light.map.width / light.map.height;

			}

			light.shadow.aspect = aspect;

		} else {

			light.shadow.aspect = light.aspect;

		}

	}

	/**
	 * Overwrites the default implementation to compute projection attenuation.
	 *
	 * @param {NodeBuilder} builder - The node builder.
	 * @return {Node<float>} The spot attenuation.
	 */
	getSpotAttenuation( builder ) {

		const penumbraCos = this.penumbraCosNode;
		const spotLightCoord = this.getLightCoord( builder );
		const coord = spotLightCoord.xyz.div( spotLightCoord.w );

		const boxDist = sdBox( coord.xy.sub( vec2( 0.5 ) ), vec2( 0.5 ) );
		const angleFactor = div( - 1.0, sub( 1.0, acos( penumbraCos ) ).sub( 1.0 ) );
		const attenuation = saturate( boxDist.mul( - 2.0 ).mul( angleFactor ) );

		return attenuation;

	}

}

export default ProjectorLightNode;
