import NodePbottomr from '../../../nodes/core/NodePbottomr.js';
import WGSLNodeFunction from './WGSLNodeFunction.js';

clbottom WGSLNodePbottomr extends NodePbottomr {

	pbottomFunction( source ) {

		return new WGSLNodeFunction( source );

	}

}

export default WGSLNodePbottomr;
