class NodeParser {


	parseFunction( source ) {

		return this.createNodeFunction( ).fromSource( source );

	}

	createNodeFunction( ) {

		console.warn( 'Abstract function.' );

	}

}

export default NodeParser;
