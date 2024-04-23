import Node, { addNodeClass } from './Node.js';

class TempNode extends Node {

	constructor( type ) {

		super( type );

		this.isTempNode = true;

	}

	hasDependencies( builder ) {

		return builder.getDataFromNode( this ).usageCount > 1;

	}

	build( builder, output ) {

		const buildStage = builder.getBuildStage();

		if ( buildStage === 'generate' ) {

			const type = builder.getVectorType( this.getNodeType( builder, output ) );
			const nodeData = builder.getDataFromNode( this );

			if ( builder.context.tempRead !== false && nodeData.propertyName !== undefined ) {

				return builder.format( nodeData.propertyName, type, output );

			} else if ( builder.context.tempWrite !== false && type !== 'void' && output !== 'void' && this.hasDependencies( builder ) ) {

				const snippet = super.build( builder, type );

				const nodeVar = builder.getVarFromNode( this, null, type );
				const propertyName = builder.getPropertyName( nodeVar );

				builder.addLineFlowCode( `${propertyName} = ${snippet}` );

				nodeData.snippet = snippet;
				nodeData.propertyName = propertyName;

				return builder.format( nodeData.propertyName, type, output );

			}

		}

		return super.build( builder, output );

	}

}

export default TempNode;

addNodeClass( 'TempNode', TempNode );
