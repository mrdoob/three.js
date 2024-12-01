import NodeParser from '../../../nodes/core/NodeParser.js';
import WGSLNodeFunction from './WGSLNodeFunction.js';

/**
 * A WGSL node parser.
 *
 * @augments NodeParser
 */
class WGSLNodeParser extends NodeParser {

	/**
	 * The method parses the given WGSL code an returns a node function.
	 *
	 * @param {String} source - The WGSL code.
	 * @return {WGSLNodeFunction} A node function.
	 */
	parseFunction( source ) {

		return new WGSLNodeFunction( source );

	}

}

export default WGSLNodeParser;
