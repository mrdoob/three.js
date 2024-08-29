import { registerNode } from '../core/Node.js';
import AnalyticLightNode from './AnalyticLightNode.js';
import { uniform } from '../core/UniformNode.js';
import { mix } from '../math/MathNode.js';
import { normalView } from '../accessors/Normal.js';
import { objectPosition } from '../accessors/Object3DNode.js';

import { Color } from '../../math/Color.js';

class HemisphereLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

		this.lightPositionNode = objectPosition( light );
		this.lightDirectionNode = this.lightPositionNode.normalize();

		this.groundColorNode = uniform( new Color() );

	}

	update( frame ) {

		const { light } = this;

		super.update( frame );

		this.lightPositionNode.object3d = light;

		this.groundColorNode.value.copy( light.groundColor ).multiplyScalar( light.intensity );

	}

	setup( builder ) {

		const { colorNode, groundColorNode, lightDirectionNode } = this;

		const dotNL = normalView.dot( lightDirectionNode );
		const hemiDiffuseWeight = dotNL.mul( 0.5 ).add( 0.5 );

		const irradiance = mix( groundColorNode, colorNode, hemiDiffuseWeight );

		builder.context.irradiance.addAssign( irradiance );

	}

}

export default HemisphereLightNode;

HemisphereLightNode.type = /*@__PURE__*/ registerNode( 'HemisphereLight', HemisphereLightNode );
