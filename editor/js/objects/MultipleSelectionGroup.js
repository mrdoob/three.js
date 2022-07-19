import { Group } from 'three';

class MultipleSelectionGroup extends Group {

	constructor() {

		super();

		this.type = 'MultipleSelectionGroup';

	}

}

MultipleSelectionGroup.prototype.isGroup = true;

export { MultipleSelectionGroup };
