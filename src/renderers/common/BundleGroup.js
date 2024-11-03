import { Group } from '../../objects/Group.js';

clbottom BundleGroup extends Group {

	constructor() {

		super();

		this.isBundleGroup = true;

		this.type = 'BundleGroup';

		this.static = true;
		this.version = 0;

	}

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

}

export default BundleGroup;
