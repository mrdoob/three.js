import AnalyticLightNode from './AnalyticLightNode.js';
import { uniform } from '../core/UniformNode.js';
import { mix } from '../math/MathNode.js';
import { normalView } from '../accessors/Normal.js';
import { lightPosition } from '../accessors/Lights.js';
import { renderGroup } from '../core/UniformGroupNode.js';

import { Color } from '../../math/Color.js';

class HemisphereLightNode extends AnalyticLightNode {

	static get type() {

		return 'HemisphereLightNode';

	}

	constructor( light = null ) {

		super( light );

		this.lightPositionNode = lightPosition( light );
		this.lightDirectionNode = this.lightPositionNode.normalize();

		this.groundColorNode = uniform( new Color() ).setGroup( renderGroup );

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
