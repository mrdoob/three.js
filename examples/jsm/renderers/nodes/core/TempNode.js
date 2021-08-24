import Node from './Node.js';

class TempNode extends Node {

	constructor( type ) {

		super( type );

	}

	build( builder, output ) {

		const type = builder.getVectorType( this.getType( builder ) );

		if ( type !== 'void' ) {

			const nodeVar = builder.getVarFromNode( this, type );
			const propertyName = builder.getPropertyName( nodeVar );

			const snippet = super.build( builder, type );

			builder.addFlowCode( `${propertyName} = ${snippet}` );

			return builder.format( propertyName, type, output );

		} else {

			return super.build( builder, type );

		}

	}

}

export default TempNode;
