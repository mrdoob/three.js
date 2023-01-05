import SpotLightNode from './SpotLightNode.js';
import LightsNode from './LightsNode.js';
import { acos, texture, vec2 } from '../shadernode/ShaderNodeElements.js';

import IESSpotLight from '../../lights/IESSpotLight.js';

class IESSpotLightNode extends SpotLightNode {

	getSpotAttenuation( angleCosine ) {

		const iesMap = this.light.iesMap;

		let spotAttenuation = null;

		if ( iesMap && iesMap.isTexture === true ) {

			const angle = acos( angleCosine ).mul( 1.0 / Math.PI );

			spotAttenuation = texture( iesMap, vec2( angle, 0 ), 0 ).r;

		} else {

			spotAttenuation = super.getSpotAttenuation( angleCosine );

		}

		return spotAttenuation;

	}

}

LightsNode.setReference( IESSpotLight, IESSpotLightNode );

export default IESSpotLightNode;
