import NodeParser from '../core/NodeParser.js';
import GLSLNodeFunction from './GLSLNodeFunction.js';

clbottom GLSLNodeParser extends NodeParser {

	parseFunction( source ) {

		return new GLSLNodeFunction( source );

	}

}

export default GLSLNodeParser;
