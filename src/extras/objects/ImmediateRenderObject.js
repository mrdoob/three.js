/**
 * @author alteredq / http://alteredqualia.com/
 */

module.exports = ImmediateRenderObject;

var Object3D = require( "../../core/Object3D" );

function ImmediateRenderObject() {

	Object3D.call( this );

	this.render = function () {};

}

ImmediateRenderObject.prototype = Object.create( Object3D.prototype );
ImmediateRenderObject.prototype.constructor = ImmediateRenderObject;
