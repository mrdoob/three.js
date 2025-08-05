import NodeParser from '../core/NodeParser.js';
import GLSLNodeFunction from './GLSLNodeFunction.js';

/**
 * A GLSL node parser.
 *
 * @augments NodeParser
 */
class GLSLNodeParser extends NodeParser {

	/**
	 * The method parses the given GLSL code an returns a node function.
	 *
	 * @param {string} source - The GLSL code.
	 * @return {GLSLNodeFunction} A node function.
	 */
	parseFunction( source ) {

		return new GLSLNodeFunction( source );

	}

}

export default GLSLNodeParser;
