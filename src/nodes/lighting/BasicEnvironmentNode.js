import { registerNode } from '../core/Node.js';
import LightingNode from './LightingNode.js';
import { cubeMapNode } from '../utils/CubeMapNode.js';

class BasicEnvironmentNode extends LightingNode {

	constructor( envNode = null ) {

		super();

		this.envNode = envNode;

	}

	setup( builder ) {

		// environment property is used in the finish() method of BasicLightingModel

		builder.context.environment = cubeMapNode( this.envNode );

	}

}

export default BasicEnvironmentNode;

BasicEnvironmentNode.type = /*@__PURE__*/ registerNode( 'BasicEnvironment', BasicEnvironmentNode );
