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

	getNodeType( builder ) {

		return this.functionNode.getNodeType( builder );

	}

	generate( builder ) {

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

		const functionName = functionNode.build( builder, 'property' );

		return `${functionName}( ${params.join( ', ' )} )`;

	}

}

export default FunctionCallNode;
