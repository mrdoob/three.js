import { Object3D } from '../../core/Object3D.js';

/**
 * @author alteredq / http://alteredqualia.com/
 */

function ImmediateRenderObject( material ) {

	Object3D.call( this );

	this.material = material;
	this.render = function ( /* renderCallback */ ) {};

}

ImmediateRenderObject.prototype = Object.create( Object3D.prototype );
ImmediateRenderObject.prototype.constructor = ImmediateRenderObject;

ImmediateRenderObject.prototype.isImmediateRenderObject = true;


export { ImmediateRenderObject };
