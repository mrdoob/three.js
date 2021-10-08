import Node from './Node.js';

class TempNode extends Node {

	constructor( type ) {

		super( type );

	}

	build( builder, output ) {

		if ( builder.context.cache !== false ) {

			const type = builder.getVectorType( this.getNodeType( builder ) );

			if ( type !== 'void' ) {

				const nodeData = builder.getDataFromNode( this );

				const nodeVar = builder.getVarFromNode( this, type );
				const propertyName = builder.getPropertyName( nodeVar );

				if ( nodeData.snippet === undefined ) {

					const snippet = super.build( builder, type );

					builder.addFlowCode( `${propertyName} = ${snippet}` );

					nodeData.snippet = snippet;

				}

				return builder.format( propertyName, type, output );

			}

		}

		return super.build( builder, output );

	}

}

export default TempNode;
