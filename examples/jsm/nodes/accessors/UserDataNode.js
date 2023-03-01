import ReferenceNode from './ReferenceNode.js';

class UserDataNode extends ReferenceNode {

	constructor( property, inputType, userData = null ) {

		super( property, inputType, userData );

		this.userData = userData;

	}

	update( frame ) {

		this.object = this.userData !== null ? this.userData : frame.object.userData;

		super.update( frame );

	}

}

export default UserDataNode;
