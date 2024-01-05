import Node, { addNodeClass } from './Node.js';

class TempNode extends Node {

	constructor( type ) {

		super( type );

		this.isTempNode = true;

	}

	hasDependencies( builder ) {

		const { dependenciesCount } = builder.getNodeData( this );

		if ( dependenciesCount === undefined ) console.warn( 'Nodes System: It looks like the following node didn\'t have .analyze() method ran on it, which is a bug:', this );

		return dependenciesCount > 1;

	}

	// @TODO: introduce properties like .allowsAssign=false (true in VarNode, PropertyNode, SplitNode and ArrayElementNode) and .reuseGenerated=true (false in e.g. AssignNode, ExpressionNode, BypassNode, StackNode (because of side effects) and in e.g. UniformNode, ArrayElementNode, SplitNode, MaterialNode (because of not doing any work suggesting reuse)). these properties mend the corresponding clauses of the `output === 'void' || this.hasDependencies( builder )` condition below (`++ nodeData.dependenciesCount === 1` condition in Node.analyze() also should be mended to account for .reuseGenerated = false). this will allow to merge Node and TempNode together
	// @TODO: auto-temp nodes that require usage inside of a uniform control flow if they are placed outside of it (e.g. in CondNode)

	build( builder, output ) {

		const buildStage = builder.getBuildStage();

		if ( buildStage === 'generate' ) {

			const type = builder.getVectorType( this.getNodeType( builder, output ) );
			const nodeData = builder.getNodeData( this );

			if ( nodeData.propertyName !== undefined ) {

				return builder.format( nodeData.propertyName, type, output );

			} else if ( type !== 'void' && ( output === 'void' || this.hasDependencies( builder ) ) ) { // we auto-temp the node if something is assigned to it or it is used multiple times

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
