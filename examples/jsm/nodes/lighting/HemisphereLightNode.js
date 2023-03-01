import AnalyticLightNode from './AnalyticLightNode.js';
import { addLightNode } from './LightsNode.js';
import { uniform } from '../core/UniformNode.js';
import { mix } from '../math/MathNode.js';
import { normalView } from '../accessors/NormalNode.js';
import { objectPosition } from '../accessors/Object3DNode.js';
import { addNodeClass } from '../core/Node.js';

import { Color, HemisphereLight } from 'three';

class HemisphereLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

		this.lightPositionNode = objectPosition;
		this.lightDirectionNode = objectPosition.normalize();

		this.groundColorNode = uniform( new Color() );

	}

	update( frame ) {

		const { light } = this;

		super.update( frame );

		this.lightPositionNode.object3d = light;

		this.groundColorNode.value.copy( light.groundColor ).multiplyScalar( light.intensity );

	}

	generate( builder ) {

		const { colorNode, groundColorNode, lightDirectionNode } = this;

		const dotNL = normalView.dot( lightDirectionNode );
		const hemiDiffuseWeight = dotNL.mul( 0.5 ).add( 0.5 );

		const irradiance = mix( groundColorNode, colorNode, hemiDiffuseWeight );

		builder.context.irradiance.addAssign( irradiance );

	}

}

export default HemisphereLightNode;

addLightNode( HemisphereLight, HemisphereLightNode );

addNodeClass( HemisphereLightNode );
