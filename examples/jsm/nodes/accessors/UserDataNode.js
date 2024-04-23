import ReferenceNode from './ReferenceNode.js';
import { addNodeClass } from '../core/Node.js';
import { nodeObject } from '../shadernode/ShaderNode.js';

class UserDataNode extends ReferenceNode {

	constructor( property, inputType, userData = null ) {

		super( property, inputType, userData );

		this.userData = userData;

	}

	update( frame ) {

		this.reference = this.userData !== null ? this.userData : frame.object.userData;

		super.update( frame );

	}

}

export default UserDataNode;

export const userData = ( name, inputType, userData ) => nodeObject( new UserDataNode( name, inputType, userData ) );

addNodeClass( 'UserDataNode', UserDataNode );
