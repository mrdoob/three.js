import Node from '../core/Node.js';

class LightingNode extends Node {

	static get type() {

		return 'LightingNode';

	}

	constructor() {

		super( 'vec3' );

		this.isLightingNode = true;

	}

	generate( /*builder*/ ) {

		console.warn( 'Abstract function.' );

	}

}

export default LightingNode;
