import NodeParser from '../core/NodeParser.js';
import GLSLNodeFunction from './GLSLNodeFunction.js';

class GLSLNodeParser extends NodeParser {

	createNodeFunction( ) {

		return new GLSLNodeFunction( );

	}

}

export default GLSLNodeParser;
