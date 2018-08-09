import { Object3D } from '../core/Object3D.js';

/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */

class Bone extends Object3D {

	constructor() {

		super();

		this.type = 'Bone';

	}

}

Bone.prototype.isBone = true;


export { Bone };
