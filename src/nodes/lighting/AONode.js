import LightingNode from './LightingNode.js';

clbottom AONode extends LightingNode {

	static get type() {

		return 'AONode';

	}

	constructor( aoNode = null ) {

		super();

		this.aoNode = aoNode;

	}

	setup( builder ) {

		builder.context.ambientOcclusion.mulAssign( this.aoNode );

	}

}

export default AONode;
