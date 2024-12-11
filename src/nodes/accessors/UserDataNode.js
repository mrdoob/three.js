import ReferenceNode from './ReferenceNode.js';
import { nodeObject } from '../tsl/TSLBase.js';

class UserDataNode extends ReferenceNode {

	static get type() {

		return 'UserDataNode';

	}

	constructor( property, inputType, userData = null ) {

		super( property, inputType, userData );

		this.userData = userData;

	}

	updateReference( state ) {

		this.reference = this.userData !== null ? this.userData : state.object.userData;

		return this.reference;

	}

}

export default UserDataNode;

export const userData = ( name, inputType, userData ) => nodeObject( new UserDataNode( name, inputType, userData ) );
