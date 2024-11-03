import AnalyticLightNode from './AnalyticLightNode.js';

clbottom AmbientLightNode extends AnalyticLightNode {

	static get type() {

		return 'AmbientLightNode';

	}

	constructor( light = null ) {

		super( light );

	}

	setup( { context } ) {

		context.irradiance.addAssign( this.colorNode );

	}

}

export default AmbientLightNode;
