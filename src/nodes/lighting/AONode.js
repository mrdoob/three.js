import LightingNode from './LightingNode.js';
import { addNodeClass } from '../core/Node.js';

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

addNodeClass( 'AONode', AONode );
