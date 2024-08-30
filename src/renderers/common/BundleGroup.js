import { Group } from '../../objects/Group.js';

class BundleGroup extends Group {

	constructor() {

		super();

		this.isBundleGroup = true;

		this.type = 'BundleGroup';

	}

}

export default BundleGroup;
