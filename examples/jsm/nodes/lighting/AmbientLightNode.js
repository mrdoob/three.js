import AnalyticLightNode from './AnalyticLightNode.js';
import LightsNode from './LightsNode.js';

import { AmbientLight } from 'three';

class AmbientLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

	}

	construct( { context } ) {

		context.irradiance.add( this.colorNode );

	}

}

LightsNode.setReference( AmbientLight, AmbientLightNode );

export default AmbientLightNode;
