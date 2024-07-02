import LightingNode from './LightingNode.js';
import { addNodeClass } from '../core/Node.js';

class AONode extends LightingNode {

	constructor( aoNode = null ) {

		super();

		this.aoNode = aoNode;

	}

	setup( builder ) {

		const aoIntensity = 1;
		const aoNode = this.aoNode.x.sub( 1.0 ).mul( aoIntensity ).add( 1.0 );

		builder.context.ambientOcclusion.mulAssign( aoNode );

	}

}

export default AONode;

addNodeClass( 'AONode', AONode );
