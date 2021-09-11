import TempNode from './TempNode.js';

class FunctionCallNode extends TempNode {

	constructor( functionNode = null, parameters = {} ) {

		super();

		this.functionNode = functionNode;
		this.parameters = parameters;

	}

	setParameters( parameters ) {

		this.parameters = parameters;

		return this;

	}

	getParameters() {

		return this.parameters;

	}

	getType( builder ) {

		return this.functionNode.getType( builder );

	}

	generate( builder, output ) {

		const params = [];

		const functionNode = this.functionNode;

		const inputs = functionNode.getInputs( builder );
		const parameters = this.parameters;

		for ( const inputNode of inputs ) {

			const node = parameters[ inputNode.name ];

			if ( node !== undefined ) {

				params.push( node.build( builder, inputNode.type ) );

			} else {

				throw new Error( `FunctionCallNode: Input '${inputNode.name}' not found in FunctionNode.` );

			}

		}

		const type = this.getType( builder );
		const functionName = functionNode.build( builder, 'property' );

		const callSnippet = `${functionName}( ${params.join( ', ' )} )`;

		return builder.format( callSnippet, type, output );

	}

}

export default FunctionCallNode;
