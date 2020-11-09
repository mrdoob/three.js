import { Object3D } from '../core/Object3D.js';

class Bone extends Object3D {

	constructor() {

		Object.defineProperty( this, "isBone", { value: true } );
		this.type = 'Bone';

	}

}


export { Bone };
