import { Object3D } from '../core/Object3D.js';

/**
 * @author mrdoob / http://mrdoob.com/
 */

class Group extends Object3D {

	constructor() {

		super();

		this.type = 'Group';

	}

}

Group.prototype.isGroup = true;


export { Group };
