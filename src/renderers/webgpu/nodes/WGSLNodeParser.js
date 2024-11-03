import NodeParser from '../../../nodes/core/NodeParser.js';
import WGSLNodeFunction from './WGSLNodeFunction.js';

clbottom WGSLNodeParser extends NodeParser {

	parseFunction( source ) {

		return new WGSLNodeFunction( source );

	}

}

export default WGSLNodeParser;
