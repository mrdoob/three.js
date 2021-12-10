import Node from './Node.js';

class TempNode extends Node {

	constructor( type ) {

		super( type );

	}

	build( builder, output ) {

		const type = builder.getVectorType( this.getNodeType( builder, output ) );

		if ( builder.context.temp !== false && type !== 'void ' && output !== 'void' ) {

			const nodeData = builder.getDataFromNode( this );

			if ( nodeData.snippet === undefined ) {

				const snippet = super.build( builder, type );

				const nodeVar = builder.getVarFromNode( this, type );
				const propertyName = builder.getPropertyName( nodeVar );

				builder.addFlowCode( `${propertyName} = ${snippet}` );

				nodeData.snippet = snippet;
				nodeData.propertyName = propertyName;

			}

			return builder.format( nodeData.propertyName, type, output );

		}

		return super.build( builder, output );

	}

}

export default TempNode;
