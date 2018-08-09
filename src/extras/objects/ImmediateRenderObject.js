import { Object3D } from '../../core/Object3D.js';

/**
 * @author alteredq / http://alteredqualia.com/
 */

class ImmediateRenderObject extends Object3D {

	constructor( material ) {

		super();

		this.material = material;
		this.render = function ( /* renderCallback */ ) {};

	}

}




ImmediateRenderObject.prototype.isImmediateRenderObject = true;


export { ImmediateRenderObject };
