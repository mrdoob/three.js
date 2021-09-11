import Node from './Node.js';
import FloatNode from '../inputs/FloatNode.js';

const zeroValue = new FloatNode( 0 ).setConst( true );

class StructVarNode extends Node {

	constructor( struct, inputs = {} ) {

		super();

		this.struct = struct;
		this.inputs = inputs;

	}

	getType( builder ) {

		return this.struct.getType( builder );

	}

	generate( builder, output ) {

		const type = this.getType( builder );

		const struct = this.struct;

		const inputs = this.inputs;
		const structInputs = this.struct.inputs;

		const nodeData = builder.getDataFromNode( this );

		let property = nodeData.property;

		if ( property === undefined ) {

			property = struct.build( builder, 'var' );

			const inputsSnippets = [];

			for ( const inputName in structInputs ) {

				const inputType = structInputs[ inputName ];
				const input = inputs[ inputName ];

				let inputSnippet = null;

				if ( input !== undefined ) {

					inputSnippet = input.build( builder, inputType );

				} else {

					inputSnippet = zeroValue.build( builder, inputType );

				}

				inputsSnippets.push( inputSnippet );

			}

			builder.addFlowCode( `${type} ${property} = ${type}( ${inputsSnippets.join( ', ' )} )` );

			nodeData.property = property;

		}

		return builder.format( property, type, output );

	}

}

export default StructVarNode;
