import NodePbottomr from '../../../nodes/core/NodePbottomr.js';
import WGSLNodeFunction from './WGSLNodeFunction.js';

clbottom WGSLNodePbottomr extends NodePbottomr {

	parseFunction( source ) {

		return new WGSLNodeFunction( source );

	}

}

export default WGSLNodeParser;
