import Node from './Node.js';

class TempNode extends Node {

	constructor( type ) {

		super( type );

	}

	build( builder, output ) {

		const type = builder.getVectorType( this.getNodeType( builder ) );

		if ( type !== 'void' ) {

			const nodeVar = builder.getVarFromNode( this, type );
			const propertyName = builder.getPropertyName( nodeVar );

			const nodeData = builder.getDataFromNode( this );

			let snippet = nodeData.snippet;

			if ( snippet === undefined ) {

				snippet = super.build( builder, type );

				builder.addFlowCode( `${propertyName} = ${snippet}` );

				nodeData.snippet = snippet;

			}

			return builder.format( propertyName, type, output );

		} else {

			return super.build( builder, output );

		}

	}

}

export default TempNode;
