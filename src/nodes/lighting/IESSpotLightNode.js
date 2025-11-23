import SpotLightNode from './SpotLightNode.js';
import { texture } from '../accessors/TextureNode.js';
import { vec2 } from '../tsl/TSLBase.js';

/**
 * An IES version of the default spot light node.
 *
 * @augments SpotLightNode
 */
class IESSpotLightNode extends SpotLightNode {

	static get type() {

		return 'IESSpotLightNode';

	}

	/**
	 * Overwrites the default implementation to compute an IES conform spot attenuation.
	 *
	 * @param {NodeBuilder} builder - The node builder.
	 * @param {Node<float>} angleCosine - The angle to compute the spot attenuation for.
	 * @param {Node<float>} azimuthAngle - The azimuthal angle
	 * @return {Node<float>} The spot attenuation.
	 */
	getSpotAttenuation( builder, angleCosine, azimuthAngle ) {

		const iesMap = this.light.iesMap;

		let spotAttenuation = null;

		if ( iesMap && iesMap.isTexture === true ) {

			const inclinationNormalized = angleCosine.acos().mul( 1.0 / Math.PI );
			const azimuthNormalized = azimuthAngle.mul( 1.0 / ( 2 * Math.PI ) );

			spotAttenuation = texture( iesMap, vec2( azimuthNormalized, inclinationNormalized ), 0 ).r;

		} else {

			spotAttenuation = super.getSpotAttenuation( angleCosine, azimuthAngle );

		}

		return spotAttenuation;

	}

}

export default IESSpotLightNode;
