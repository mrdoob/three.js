import { registerNode } from '../core/Node.js';
import LightingNode from './LightingNode.js';

class AONode extends LightingNode {

	constructor( aoNode = null ) {

		super();

		this.aoNode = aoNode;

	}

	setup( builder ) {

		builder.context.ambientOcclusion.mulAssign( this.aoNode );

	}

}

export default AONode;

AONode.type = /*@__PURE__*/ registerNode( 'AO', AONode );
