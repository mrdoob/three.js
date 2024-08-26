import Node, { registerNodeClass } from '../core/Node.js';

class LightingNode extends Node {

	constructor() {

		super( 'vec3' );

		this.isLightingNode = true;

	}

	generate( /*builder*/ ) {

		console.warn( 'Abstract function.' );

	}

}

export default LightingNode;

registerNodeClass( 'Lighting', LightingNode );
