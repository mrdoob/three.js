import AnalyticLightNode from './AnalyticLightNode.js';
import { addLightNode } from './LightsNode.js';
import { addNodeClass } from '../core/Node.js';

import { AmbientLight } from 'three';

class AmbientLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

	}

	construct( { context } ) {

		builder.stack.addAssign( context.irradiance, this.colorNode );

	}

}

export default AmbientLightNode;

addLightNode( AmbientLight, AmbientLightNode );

addNodeClass( AmbientLightNode );
