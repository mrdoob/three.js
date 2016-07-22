import { Object3D } from '../../core/Object3D';

/**
 * @author alteredq / http://alteredqualia.com/
 */

function ImmediateRenderObject ( material ) {
	this.isImmediateRenderObject = this.isObject3D = true;

	Object3D.call( this );

	this.material = material;
	this.render = function ( renderCallback ) {};

};

ImmediateRenderObject.prototype = Object.create( Object3D.prototype );
ImmediateRenderObject.prototype.constructor = ImmediateRenderObject;


export { ImmediateRenderObject };