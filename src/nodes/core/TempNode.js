import Node from './Node.js';

/**
 * TODO: Explain the purpose of this module. Especially why some nodes are derived
 * from TempNode and not from Node directly.
 *
 * @augments Node
 */
class TempNode extends Node {

	static get type() {

		return 'TempNode';

	}

	/**
	 * Constructs a temp node.
	 *
	 * @param {String} nodeType - The node type.
	 */
	constructor( type ) {

		super( type );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isTempNode = true;

	}

	/**
	 * Whether this node is used more than once in context of other nodes.
	 *
	 * @return {Boolean} A flag that inidiactes if there is more than one dependency to other nodes.
	 */
	hasDependencies( builder ) {

		return builder.getDataFromNode( this ).usageCount > 1;

	}

	build( builder, output ) {

		const buildStage = builder.getBuildStage();

		if ( buildStage === 'generate' ) {

			const type = builder.getVectorType( this.getNodeType( builder, output ) );
			const nodeData = builder.getDataFromNode( this );

			if ( nodeData.propertyName !== undefined ) {

				return builder.format( nodeData.propertyName, type, output );

			} else if ( type !== 'void' && output !== 'void' && this.hasDependencies( builder ) ) {

				const snippet = super.build( builder, type );

				const nodeVar = builder.getVarFromNode( this, null, type );
				const propertyName = builder.getPropertyName( nodeVar );

				builder.addLineFlowCode( `${propertyName} = ${snippet}`, this );

				nodeData.snippet = snippet;
				nodeData.propertyName = propertyName;

				return builder.format( nodeData.propertyName, type, output );

			}

		}

		return super.build( builder, output );

	}

}

export default TempNode;
