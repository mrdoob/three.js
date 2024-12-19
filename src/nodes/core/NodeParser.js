/**
 * Base class for node parsers. A derived parser must be implemented
 * for each supported native shader language.
 */
class NodeParser {

	/**
	 * The method parses the given native code an returns a node function.
	 *
	 * @abstract
	 * @param {String} source - The native shader code.
	 * @return {NodeFunction} A node function.
	 */
	parseFunction( /*source*/ ) {

		console.warn( 'Abstract function.' );

	}

}

export default NodeParser;
