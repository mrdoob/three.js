import LightingNode from './LightingNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { addNodeClass } from '../core/Node.js';

import { Color } from 'three';

class AnalyticLightNode extends LightingNode {

	constructor( light = null ) {

		super();

		this.updateType = NodeUpdateType.OBJECT;

		this.light = light;

		this.colorNode = uniform( new Color() );

	}

	getHash( /*builder*/ ) {

		return this.light.uuid;

	}

	update( /*frame*/ ) {

		const { light } = this;

		this.colorNode.value.copy( light.color ).multiplyScalar( light.intensity );

	}

}

export default AnalyticLightNode;

addNodeClass( AnalyticLightNode );
