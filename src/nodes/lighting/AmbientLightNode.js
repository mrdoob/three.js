import { registerNode } from '../core/Node.js';
import AnalyticLightNode from './AnalyticLightNode.js';

class AmbientLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

	}

	setup( { context } ) {

		context.irradiance.addAssign( this.colorNode );

	}

}

export default AmbientLightNode;

AmbientLightNode.type = /*@__PURE__*/ registerNode( 'AmbientLight', AmbientLightNode );
