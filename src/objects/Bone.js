import { Object3D } from '../core/Object3D.js';

class Bone extends Object3D {

	constructor() {

		super();

		this.type = 'Bone';

	}

}

Bone.prototype.isBone = true;

export { Bone };
