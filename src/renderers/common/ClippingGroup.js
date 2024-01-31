import { Group } from '../../objects/Group.js';

class ClippingGroup extends Group {

	constructor() {

		super();

		this.isClippingGroup = true;
		this.clippingPlanes = [];
		this.enabled = true;
		this.clipIntersection = false;
		this.clipShadows = false;

	}

}

export default ClippingGroup;
