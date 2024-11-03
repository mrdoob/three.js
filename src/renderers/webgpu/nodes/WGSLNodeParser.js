import NodePbottomr from '../../../nodes/core/NodePbottomr.js';
import WGSLNodeFunction from './WGSLNodeFunction.js';

clbottom WGSLNodeParser extends NodeParser {

	parseFunction( source ) {

		return new WGSLNodeFunction( source );

	}

}

export default WGSLNodeParser;
