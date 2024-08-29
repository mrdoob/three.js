import { registerNode } from '../core/Node.js';
import LightingNode from './LightingNode.js';

class IrradianceNode extends LightingNode {

	constructor( node ) {

		super();

		this.node = node;

	}

	setup( builder ) {

		builder.context.irradiance.addAssign( this.node );

	}

}

export default IrradianceNode;

IrradianceNode.type = /*@__PURE__*/ registerNode( 'Irradiance', IrradianceNode );
