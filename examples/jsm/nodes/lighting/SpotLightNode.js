import PointLightNode from './PointLightNode.js';
import { addLightNode } from './LightsNode.js';
import { uniform } from '../core/UniformNode.js';
import { addNodeClass } from '../core/Node.js';

import { SpotLight } from 'three';

class SpotLightNode extends PointLightNode {

	constructor( light = null ) {

		super( light );

		this.coneCosNode = uniform( 0 );
		this.penumbraCosNode = uniform( 0 );

	}

	update( frame ) {

		super.update( frame );

		const { light } = this;

		this.coneCosNode.value = Math.cos( light.angle );
		this.penumbraCosNode.value = Math.cos( light.angle * ( 1 - light.penumbra ) );

	}

	getSpotAttenuation( angleCosine ) {

		return angleCosine.smoothstep( this.coneCosNode, this.penumbraCosNode );

	}

}

export default SpotLightNode;

addNodeClass( 'SpotLightNode', SpotLightNode );

addLightNode( SpotLight, SpotLightNode );
