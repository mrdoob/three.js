import Node from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { vec3 } from '../tsl/TSLBase.js';
import { positionWorld } from '../accessors/Position.js';

class ShadowBaseNode extends Node {

	static get type() {

		return 'ShadowBaseNode';

	}

	constructor( light ) {

		super();

		this.light = light;
		this.updateBeforeType = NodeUpdateType.RENDER;

		this.isShadowBaseNode = true;

	}

	setupShadowPosition( { material } ) {

		// Use assign inside an Fn()

		shadowWorldPosition.assign( material.shadowPositionNode || positionWorld );

	}

	dispose() {

		this.updateBeforeType = NodeUpdateType.NONE;

	}

}

export const shadowWorldPosition = /*@__PURE__*/ vec3().toVar( 'shadowWorldPosition' );

export default ShadowBaseNode;
