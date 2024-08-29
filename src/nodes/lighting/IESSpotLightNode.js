import { registerNode } from '../core/Node.js';
import SpotLightNode from './SpotLightNode.js';
import { texture } from '../accessors/TextureNode.js';
import { vec2 } from '../tsl/TSLBase.js';

class IESSpotLightNode extends SpotLightNode {

	getSpotAttenuation( angleCosine ) {

		const iesMap = this.light.iesMap;

		let spotAttenuation = null;

		if ( iesMap && iesMap.isTexture === true ) {

			const angle = angleCosine.acos().mul( 1.0 / Math.PI );

			spotAttenuation = texture( iesMap, vec2( angle, 0 ), 0 ).r;

		} else {

			spotAttenuation = super.getSpotAttenuation( angleCosine );

		}

		return spotAttenuation;

	}

}

export default IESSpotLightNode;

IESSpotLightNode.type = /*@__PURE__*/ registerNode( 'IESSpotLight', IESSpotLightNode );
