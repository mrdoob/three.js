import { addNodeClass } from './Node.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import PropertyNode from './PropertyNode.js';

class ParameterNode extends PropertyNode {

	constructor( nodeType, name = null ) {

		super( nodeType, name );

		this.isParameterNode = true;

	}

	getHash() {

		return this.uuid;

	}

	generate() {

		return this.name;

	}

}

export default ParameterNode;

export const parameter = ( type, name ) => nodeObject( new ParameterNode( type, name ) );

addNodeClass( 'ParameterNode', ParameterNode );
