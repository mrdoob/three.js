import NodeParser from '../core/NodeParser.js';
import WGSLNodeFunction from './WGSLNodeFunction.js';

class WGSLNodeParser extends NodeParser {

	createNodeFunction( ) {

		return new WGSLNodeFunction( );

	}

}

export default WGSLNodeParser;
