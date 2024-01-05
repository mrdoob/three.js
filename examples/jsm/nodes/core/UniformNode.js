import InputNode from './InputNode.js';
//import TempNode from './TempNode.js';
import { addNodeClass } from './Node.js';
import { nodeObject, getConstNodeType } from '../shadernode/ShaderNode.js';

class UniformNode extends InputNode {

	constructor( value, nodeType = null ) {

		super( value, nodeType );

		this.isUniformNode = true;
		//this.isTempNode = true;

	}

	isGlobal() {

		return true;

	}

	/*hasDependencies( builder ) {

		return TempNode.prototype.hasDependencies.call( this, builder );

	}*/

	generate( builder ) {

		const sharedNode = this.getShared( builder );

		const nodeUniform = builder.getUniformFromNode( sharedNode, builder.context.label, sharedNode.getInputType( builder ) );
		const propertyName = builder.getPropertyName( nodeUniform );

		if ( builder.context.label !== undefined ) delete builder.context.label;

		return propertyName;

	}

	/*build( builder, output ) {

		return TempNode.prototype.build.call( this, builder, output );

	}*/

}

export default UniformNode;

export const uniform = ( arg1, arg2 ) => {

	const nodeType = getConstNodeType( arg2 || arg1 );

	// @TODO: get ConstNode from .traverse() in the future
	const value = ( arg1 && arg1.isNode === true ) ? ( arg1.node && arg1.node.value ) || arg1.value : arg1;

	return nodeObject( new UniformNode( value, nodeType ) );

};

addNodeClass( 'UniformNode', UniformNode );
