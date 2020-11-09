import { Object3D } from '../core/Object3D.js';

class Group extends Object3D {

	constructor() {

		super();
		Object.defineProperty( this, "isGroup", { value: true } );
		this.type = 'Group';

	}

}


export { Group };
