import Node from './Node.js';

class TempNode extends Node {

	constructor( type ) {

		super( type );

	}

	build( builder, output ) {

		const type = builder.getVectorType( this.getNodeType( builder, output ) );
		const nodeData = builder.getDataFromNode( this );

		if ( builder.context.tempRead !== false && nodeData.propertyName !== undefined ) {

			return builder.format( nodeData.propertyName, type, output );

		} else if ( builder.context.tempWrite !== false && type !== 'void ' && output !== 'void' && nodeData.dependenciesCount > 1 ) {

			const snippet = super.build( builder, type );

			const nodeVar = builder.getVarFromNode( this, type );
			const propertyName = builder.getPropertyName( nodeVar );

			builder.addFlowCode( `${propertyName} = ${snippet}` );

			nodeData.snippet = snippet;
			nodeData.propertyName = propertyName;

			return builder.format( nodeData.propertyName, type, output );

		}

		return super.build( builder, output );

	}

}

TempNode.prototype.isTempNode = true;

export default TempNode;
