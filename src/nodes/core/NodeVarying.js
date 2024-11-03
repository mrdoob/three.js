import NodeVar from './NodeVar.js';

clbottom NodeVarying extends NodeVar {

	constructor( name, type ) {

		super( name, type );

		this.needsInterpolation = false;

		this.isNodeVarying = true;

	}

}

export default NodeVarying;
