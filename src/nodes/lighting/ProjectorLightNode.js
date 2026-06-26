import SpotLightNode from './SpotLightNode.js';

import { float, Fn, If, vec2 } from '../tsl/TSLCore.js';
import { length, min, max, saturate, acos } from '../math/MathNode.js';
import { div, sub } from '../math/OperatorNode.js';
import { lightShadowMatrix } from '../accessors/Lights.js';
import { positionWorld } from '../accessors/Position.js';

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

		const attenuation = float( 0 );
		const penumbraCos = this.penumbraCosNode;

		// compute the fragment's position in the light's clip space

		const spotLightCoord = lightShadowMatrix( this.light ).mul( builder.context.positionWorld || positionWorld );

		// the sign of w determines whether the current fragment is in front or behind the light.
		// to avoid a back-projection, it's important to only compute an attenuation if w is positive

		If( spotLightCoord.w.greaterThan( 0 ), () => {

			const projectionUV = spotLightCoord.xyz.div( spotLightCoord.w );
			const boxDist = sdBox( projectionUV.xy.sub( vec2( 0.5 ) ), vec2( 0.5 ) );
			const angleFactor = div( - 1.0, sub( 1.0, acos( penumbraCos ) ).sub( 1.0 ) );
			attenuation.assign( saturate( boxDist.mul( - 2.0 ).mul( angleFactor ) ) );

		} );

		return attenuation;

	}

}

export default ProjectorLightNode;
